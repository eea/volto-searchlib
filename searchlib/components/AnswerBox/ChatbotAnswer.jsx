import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import cx from 'classnames';
import {
  Message,
  Icon,
  Modal,
  ModalHeader,
  ModalContent,
} from 'semantic-ui-react';
import VIcon from '@plone/volto/components/theme/Icon/Icon';
import { injectLazyLibs } from '@plone/volto/helpers/Loadable';
import {
  createChatSession,
  sendMessage,
  MessageProcessor,
  RendererComponent,
  UserActionsToolbar,
} from '@eeacms/volto-eea-chatbot';
import {
  useAppConfig,
  useSearchContext,
  useSearchAssist,
} from '@eeacms/search/lib/hocs';
import {
  useAISummaryToggle,
  writeAISummaryEnabled,
} from '../../lib/aiSummaryToggle';
import { classifyQuery } from '../../lib/queryIntent';
import { getSummarySources } from './summarySources';
import infoSVG from '@plone/volto/icons/info.svg';
import closeSVG from '@plone/volto/icons/clear.svg';
import searchAssistSVG from '@eeacms/search/components/SearchInput/icons/search-assist.svg';

function isEqual(a, b) {
  if (!a && !b) return false;
  return a === b;
}

const Answer = injectLazyLibs(['rehypePrism', 'remarkGfm'])(({
  message,
  animate,
  onComplete,
  rehypePrism,
  remarkGfm,
}) => {
  const {
    groupedPackets = [],
    displayPackets = [],
    isComplete = false,
  } = message || {};

  const libs = useMemo(
    () => ({ rehypePrism, remarkGfm }),
    [rehypePrism, remarkGfm],
  );

  const displayGroups = useMemo(() => {
    return groupedPackets.filter((group) => displayPackets.includes(group.ind));
  }, [groupedPackets, displayPackets]);

  return displayGroups.map((group) => (
    <div key={group.ind} className="message-display-group">
      <RendererComponent
        packets={group.packets}
        onComplete={() => onComplete?.()}
        animate={animate}
        stopPacketSeen={isComplete}
        message={message}
        libs={libs}
      >
        {({ content }) => <div className="message-text-wrapper">{content}</div>}
      </RendererComponent>
    </div>
  ));
});

const ChatbotAnswer = () => {
  const { appConfig } = useAppConfig();
  const { resultSearchTerm, isLoading, totalResults } = useSearchContext();
  const { isQuestion, isLoadingSummary, setIsQuestion, setIsLoadingSummary } =
    useSearchAssist();

  const [aiSummaryEnabled] = useAISummaryToggle();

  // Internal states
  const [summary, setSummary] = useState(null);
  const [summaryError, setSummaryError] = useState(null);
  const [disclaimerOpen, setDisclaimerOpen] = useState(false);
  const [sourcesOpen, setSourcesOpen] = useState(false);

  // Track displayed message IDs to determine if animation has completed
  const [displayedSummaryId, setDisplayedSummaryId] = useState(null);

  const abort = useRef(null);
  const lastQuery = useRef('');
  // In-flight query-intent classification request: aborting it (and
  // bumping the sequence) invalidates any stale response.
  const intentAbort = useRef(null);
  const intentSeq = useRef(0);

  const { chatbotAnswer = {}, enableMatomoTracking } = appConfig;
  const {
    personaId,
    systemPrompt,
    summaryPrompt,
    enableFeedback,
    useSummarySearchTool,
    usePredefinedSystemPrompt,
    onyxVersion = '2',
    minResults = 1,
    continueConversationUrl,
  } = chatbotAnswer;

  const summaryMessageId = useRef(null);

  // Derive displayed state from message ID comparison
  const isSummaryDisplayed = isEqual(
    displayedSummaryId,
    summaryMessageId.current,
  );

  const isRendering = summary?.isFinalMessageComing && !isSummaryDisplayed;

  // Disabled state: when AI summaries are turned off, nothing
  // AI-related is shown or requested for the search (no classification
  // call, no LLM call); the user re-enables via the header search icon.
  const term = resultSearchTerm || '';

  // "Continue conversation" target: the configured chatbot page seeded
  // with the question the summary was generated from, opened in a new tab.
  const continueConversationHref = useMemo(() => {
    if (!continueConversationUrl || !term) return null;
    const separator = continueConversationUrl.includes('?') ? '&' : '?';
    return `${continueConversationUrl}${separator}query=${encodeURIComponent(
      term,
    )}`;
  }, [continueConversationUrl, term]);

  const persona = useMemo(
    () => ({ id: personaId, name: 'Search Assist' }),
    [personaId],
  );

  // Documents the summary actually cites, for the sources disclosure.
  const summarySources = useMemo(() => getSummarySources(summary), [summary]);

  // Reset all AI answer states
  const resetState = useCallback(() => {
    if (abort.current) {
      abort.current.abort();
    }
    lastQuery.current = '';
    // Invalidate any in-flight intent classification so its (stale)
    // response can never start a summary for a superseded search.
    intentSeq.current += 1;
    intentAbort.current?.abort();
    setSummary(null);
    setSummaryError(null);
    setSourcesOpen(false);
    setIsQuestion(false);
    setDisplayedSummaryId(null);
    summaryMessageId.current = null;
  }, [setIsQuestion]);

  // Fetch AI answer helper
  const danswer = useCallback(
    async ({
      query,
      sessionDescription,
      messageId,
      parentSessionId,
      parentMessageId,
      onLoad,
      onProgress,
      onComplete,
      onError,
      onFinality,
      ...params
    }) => {
      let sessionId = parentSessionId;
      if (!query || !personaId) return;

      if (abort.current) {
        abort.current.abort();
      }
      abort.current = new AbortController();

      onLoad?.();

      try {
        if (!sessionId) {
          sessionId = await createChatSession(personaId, sessionDescription);
        }

        const processor = new MessageProcessor(1, null);

        for await (const packets of sendMessage({
          ...params,
          message: query,
          chatSessionId: sessionId,
          parentMessageId: parentMessageId || null,
          signal: abort.current.signal,
          onyxVersion,
        })) {
          processor.addPackets(packets);
          const message = processor.getMessage();
          if (messageId?.current !== message.messageId) {
            messageId.current = message.messageId;
          }
          if (processor.isComplete) {
            onComplete?.(processor);
            break;
          }
          onProgress?.(processor);
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          onError?.(err);
        }
      } finally {
        onFinality?.(sessionId);
      }
    },
    [personaId, onyxVersion],
  );

  // Fetch summary
  const fetchSummary = useCallback(
    async (query) => {
      if (!query || !personaId) return;
      let finalMessageProcessed = false;

      await danswer({
        query,
        sessionDescription: 'Summary answer',
        messageId: summaryMessageId,
        onLoad: () => {
          setIsLoadingSummary(true);
        },
        onProgress: (processor) => {
          const message = processor.getMessage();
          setSummary(message);
          if (message.isFinalMessageComing && !finalMessageProcessed) {
            finalMessageProcessed = true;
            setIsLoadingSummary(false);
          }
        },
        onComplete: (processor) => {
          const message = processor.getMessage();
          const messageText = message.message || '';

          if (messageText?.toLowerCase().includes('not_a_question')) {
            setIsQuestion(false);
            setSummary(null);
            setSummaryError(null);
            return;
          }
          setIsQuestion(true);
          setSummary(message);
          setSummaryError(null);
        },
        onError: (err) => {
          setIsQuestion(false);
          setSummary(null);
          setSummaryError(err.message || 'Failed to analyze query');
        },
        onFinality: () => {
          setIsLoadingSummary(false);
        },
        systemPromptOverride: usePredefinedSystemPrompt ? systemPrompt : null,
        taskPromptOverride: `${summaryPrompt}${
          useSummarySearchTool
            ? '\n\nIMPORTANT: use the internal search tool to find relevant documents.'
            : '\n\nIMPORTANT: do not use the internal search tool, only use your knowledge.'
        }`,
        regenerate: false,
        useAgentSearch: false,
        retrieval_options: {
          run_search: useSummarySearchTool ? 'always' : 'never',
          real_time: true,
        },
      });
    },
    [
      personaId,
      systemPrompt,
      summaryPrompt,
      setIsLoadingSummary,
      setIsQuestion,
      useSummarySearchTool,
      usePredefinedSystemPrompt,
      danswer,
    ],
  );

  // Ask the query-intent service whether this search term warrants an
  // AI summary, and start generating one if it does. The service is the
  // pre-LLM intent gate: keywords, document retrieval and short phrases
  // must not trigger any chatbot call. Any classification failure
  // (timeout, service error, abstention) fails closed: the summary is
  // skipped and the search results are unaffected.
  const classifyAndFetch = useCallback(
    async (term) => {
      intentSeq.current += 1;
      const seq = intentSeq.current;
      intentAbort.current?.abort();
      const controller = new AbortController();
      intentAbort.current = controller;

      try {
        const { eligible } = await classifyQuery(term, {
          signal: controller.signal,
        });
        // Stale response: a newer search (or a reset) superseded this
        // classification while it was in flight.
        if (seq !== intentSeq.current) return;
        if (eligible) {
          fetchSummary(term);
        }
      } catch (err) {
        // classifyQuery never throws (it fails closed); keep the
        // boundary honest just in case.
        // eslint-disable-next-line no-console
        console.error('query intent classification failed', err);
      }
    },
    [fetchSummary],
  );

  // When the AI summary is turned off (via the in-box opt-out), stop
  // any in-flight generation and clear the summary so no LLM request
  // is in flight or displayed. When it is turned back on, re-evaluate
  // the current search term so the summary is generated for the active
  // question. Declared before the results-first trigger so the
  // re-enable reset wins the render.
  useEffect(() => {
    if (!aiSummaryEnabled) {
      resetState();
    } else {
      lastQuery.current = '';
    }
  }, [aiSummaryEnabled, resetState]);

  // Results-first trigger: the summary only starts after the
  // Elasticsearch search has finished, so results render immediately
  // and the summary stays a purely progressive enhancement. A search
  // that returned too few results (default: zero) must not spend an
  // LLM call, and no intent-classification request is made while AI
  // summaries are turned off.
  useEffect(() => {
    if (isLoading) return;
    const term = resultSearchTerm;
    if (term && term !== lastQuery.current) {
      // A new search supersedes any previous summary: abort the
      // in-flight stream (if any) and clear the box.
      resetState();
      lastQuery.current = term;
      if (aiSummaryEnabled && (totalResults ?? 0) >= minResults) {
        classifyAndFetch(term);
      }
    } else if (!term && lastQuery.current) {
      // Search completed with empty query (clear button pressed)
      resetState();
    }
  }, [
    resultSearchTerm,
    isLoading,
    totalResults,
    minResults,
    classifyAndFetch,
    fetchSummary,
    resetState,
    aiSummaryEnabled,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => abort.current?.abort();
  }, []);

  return (
    <div
      className={cx('chatbot-answer-wrapper', {
        // Keep the box open from skeleton generation through streaming
        // to the final rendered summary: the summary must fill the box
        // where the loading skeletons were, without a collapse/re-expand.
        expanded:
          isLoadingSummary ||
          summary?.isFinalMessageComing ||
          (isQuestion && !!summary),
      })}
    >
      <div className="chatbot-answer-collapse">
        <div
          className={cx('chatbot-answer', {
            loading: isLoadingSummary || isRendering,
          })}
        >
          <div className="chatbot-header">
            <div className="chatbot-header-left">
              <VIcon name={searchAssistSVG} size="18px" />
              <span className="label">AI Summary</span>
            </div>
            <div className="chatbot-header-right">
              {aiSummaryEnabled && (
                <button
                  type="button"
                  className="ai-summary-disable-btn"
                  onClick={() => writeAISummaryEnabled(false)}
                >
                  Disable AI summary
                </button>
              )}
              {aiSummaryEnabled && (
                <UserActionsToolbar
                  className={cx({
                    disabled: isLoadingSummary || isRendering,
                  })}
                  message={{
                    message: summary?.message,
                    messageId: summary?.messageId,
                  }}
                  enableFeedback={enableFeedback}
                  feedbackReasons={chatbotAnswer.feedbackReasons || []}
                  enableMatomoTracking={enableMatomoTracking}
                  persona={persona}
                />
              )}
              {aiSummaryEnabled && (
                <Modal
                  className="chatbot-disclaimer-modal"
                  open={disclaimerOpen}
                  onOpen={() => setDisclaimerOpen(true)}
                  onClose={() => setDisclaimerOpen(false)}
                  trigger={
                    <button className="icon-btn outline">
                      <VIcon name={infoSVG} size="22px" />
                    </button>
                  }
                >
                  <ModalHeader>
                    <span>Disclaimer</span>
                    <button
                      className="icon-btn close"
                      onClick={() => setDisclaimerOpen(false)}
                    >
                      <VIcon name={closeSVG} size="22px" />
                    </button>
                  </ModalHeader>
                  <ModalContent>
                    <p>
                      This response was generated by artificial intelligence
                      based on EEA's authoritative data and sources, but may not
                      be exhaustive. We encourage users to double-check facts
                      and consult additional sources for critical decisions or
                      detailed research.
                    </p>
                  </ModalContent>
                </Modal>
              )}
            </div>
          </div>

          {isLoadingSummary && !summary?.isFinalMessageComing && (
            <div
              className="chatbot-summary-loading"
              role="status"
              aria-label="Generating AI summary"
            >
              <div className="skeleton-line" />
              <div className="skeleton-line" />
              <div className="skeleton-line short" />
            </div>
          )}

          {summaryError && (
            <Message icon warning size="small">
              <Icon name="exclamation circle" />
              <Message.Content>
                Unable to analyze query. Please try again later.
              </Message.Content>
            </Message>
          )}

          {!summaryError && summary?.isFinalMessageComing && (
            <div className="chatbot-summary">
              <div className="chatbot-summary-content">
                <Answer
                  message={summary}
                  animate={!isSummaryDisplayed}
                  onComplete={() => setDisplayedSummaryId(summary.messageId)}
                />
              </div>
              {isSummaryDisplayed && summarySources.length > 0 && (
                <div className={cx('chatbot-sources', { open: sourcesOpen })}>
                  <button
                    type="button"
                    className="chatbot-sources-toggle"
                    aria-expanded={sourcesOpen}
                    aria-controls="chatbot-sources-list"
                    onClick={() => setSourcesOpen((open) => !open)}
                  >
                    <span>
                      Generated from {summarySources.length} EEA{' '}
                      {summarySources.length === 1 ? 'document' : 'documents'}
                    </span>
                    <Icon name="chevron down" size="small" />
                  </button>
                  {sourcesOpen && (
                    <ul className="sources-list" id="chatbot-sources-list">
                      {summarySources.map((source) => (
                        <li key={source.document_id}>
                          <span className="source-index" aria-hidden="true">
                            {source.index}
                          </span>
                          {source.link ? (
                            <a
                              className="source-link"
                              href={source.link}
                              target="_blank"
                              rel="noreferrer"
                              title={source.semantic_identifier}
                            >
                              {source.semantic_identifier}
                            </a>
                          ) : (
                            <span className="source-title">
                              {source.semantic_identifier}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
              {isSummaryDisplayed && continueConversationHref && (
                <div className="chatbot-delimiter">
                  <a
                    className="continue-conversation-btn"
                    href={continueConversationHref}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span>Continue conversation</span>{' '}
                    <Icon name="arrow right" />
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatbotAnswer;
