import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import cx from 'classnames';
import {
  Message,
  Icon,
  Modal,
  ModalHeader,
  ModalContent,
} from 'semantic-ui-react';
import { Icon as VIcon } from '@plone/volto/components';
import { injectLazyLibs } from '@plone/volto/helpers/Loadable';
import {
  createChatSession,
  sendMessage,
  MessageProcessor,
  RendererComponent,
  UserActionsToolbar,
} from '@eeacms/volto-chatbot';
import {
  useAppConfig,
  useSearchContext,
  useSearchAssist,
} from '@eeacms/search/lib/hocs';
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
  const { searchTerm, resultSearchTerm, isLoading } = useSearchContext();
  const {
    isQuestion,
    isLoadingSummary,
    isLoadingAnswer,
    setIsQuestion,
    setIsLoadingSummary,
    setIsLoadingAnswer,
  } = useSearchAssist();

  // Internal states
  const [summary, setSummary] = useState(null);
  const [summaryError, setSummaryError] = useState(null);
  const [answer, setAnswer] = useState(null);
  const [answerError, setAnswerError] = useState(null);
  const [disclaimerOpen, setDisclaimerOpen] = useState(false);

  // Track displayed message IDs to determine if animation has completed
  const [displayedSummaryId, setDisplayedSummaryId] = useState(null);
  const [displayedAnswerId, setDisplayedAnswerId] = useState(null);

  const abort = useRef(null);
  const lastQuery = useRef('');

  const { chatbotAnswer = {}, enableMatomoTracking } = appConfig;
  const {
    personaId,
    systemPrompt,
    summaryPrompt,
    prompt,
    enableFeedback,
    useSummarySearchTool,
    usePredefinedSystemPrompt,
  } = chatbotAnswer;

  const summarySessionId = useRef(null);
  const summaryMessageId = useRef(null);
  const answerMessageId = useRef(null);

  // Derive displayed state from message ID comparison
  const isSummaryDisplayed = isEqual(
    displayedSummaryId,
    summaryMessageId.current,
  );
  const isAnswerDisplayed = isEqual(displayedAnswerId, answerMessageId.current);

  const isRendering =
    (summary?.isFinalMessageComing && !isSummaryDisplayed) ||
    (answer?.isFinalMessageComing && !isAnswerDisplayed);

  const currentMessage = isAnswerDisplayed ? answer : summary;

  const persona = useMemo(
    () => ({ id: personaId, name: 'Search Assist' }),
    [personaId],
  );

  // Reset all AI answer states
  const resetState = useCallback(() => {
    if (abort.current) {
      abort.current.abort();
    }
    lastQuery.current = '';
    setSummary(null);
    setSummaryError(null);
    setAnswer(null);
    setAnswerError(null);
    setIsQuestion(false);
    setDisplayedSummaryId(null);
    setDisplayedAnswerId(null);
    summarySessionId.current = null;
    summaryMessageId.current = null;
    answerMessageId.current = null;
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
    [personaId],
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
            setAnswer(null);
            setAnswerError(null);
            answerMessageId.current = null;
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
        onFinality: (sessionId) => {
          setIsLoadingSummary(false);
          summarySessionId.current = sessionId;
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

  // Fetch detailed answer
  const fetchAnswer = useCallback(
    async (query) => {
      if (!query || !personaId) return;

      await danswer({
        query,
        sessionDescription: 'Full answer',
        messageId: answerMessageId,
        parentSessionId: summarySessionId.current,
        parentMessageId: summaryMessageId.current,
        onLoad: () => {
          setIsLoadingAnswer(true);
          setAnswerError(null);
        },
        onProgress: (processor) => {
          const message = processor.getMessage();
          setAnswer(message);
        },
        onComplete: (processor) => {
          const message = processor.getMessage();
          if (message.error) throw new Error(message.error);
          setAnswer(message);
        },
        onError: (err) => {
          setAnswer(null);
          setAnswerError(err.message || 'Failed to generate detailed answer');
        },
        onFinality: () => {
          setIsLoadingAnswer(false);
        },
        systemPromptOverride: usePredefinedSystemPrompt ? systemPrompt : null,
        taskPromptOverride: prompt,
        regenerate: false,
        useAgentSearch: false,
        retrieval_options: { run_search: 'always', real_time: true },
      });
    },
    [
      personaId,
      systemPrompt,
      prompt,
      setIsLoadingAnswer,
      usePredefinedSystemPrompt,
      danswer,
    ],
  );

  // Trigger summary fetch when ES search starts, or clear when search is cleared
  useEffect(() => {
    const term = isLoading ? searchTerm : resultSearchTerm;
    if (term && term !== lastQuery.current) {
      lastQuery.current = term;
      fetchSummary(term);
    } else if (!resultSearchTerm && lastQuery.current && !isLoading) {
      // Search completed with empty query (clear button pressed)
      resetState();
    }
  }, [searchTerm, resultSearchTerm, isLoading, fetchSummary, resetState]);

  // Cleanup on unmount
  useEffect(() => {
    return () => abort.current?.abort();
  }, []);

  return (
    <div
      className={cx('chatbot-answer-wrapper', {
        expanded: isQuestion && !isLoadingSummary && !!summary,
      })}
    >
      <div className="chatbot-answer-collapse">
        <div
          className={cx('chatbot-answer', {
            loading: isLoadingSummary || isLoadingAnswer || isRendering,
          })}
        >
          <div className="chatbot-header">
            <div className="chatbot-header-left">
              <VIcon name={searchAssistSVG} size="18px" />
              <span className="label">AI Summary</span>
            </div>
            <div className="chatbot-header-right">
              <UserActionsToolbar
                className={cx({
                  disabled: isLoadingSummary || isLoadingAnswer || isRendering,
                })}
                message={{
                  message: currentMessage?.message,
                  messageId: currentMessage?.messageId,
                }}
                enableFeedback={enableFeedback}
                feedbackReasons={chatbotAnswer.feedbackReasons || []}
                enableMatomoTracking={enableMatomoTracking}
                persona={persona}
              />
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
                    This response was generated by artificial intelligence based
                    on EEA's authoritative data and sources, but may not be
                    exhaustive. We encourage users to double-check facts and
                    consult additional sources for critical decisions or
                    detailed research.
                  </p>
                </ModalContent>
              </Modal>
            </div>
          </div>

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
              {isSummaryDisplayed && (
                <div className="chatbot-delimiter">
                  {!isLoadingAnswer && !answer && (
                    <button
                      className="get-answer-btn"
                      aria-label="Get detailed answer"
                      onClick={() => fetchAnswer(lastQuery.current)}
                    >
                      Read more <Icon name="chevron down" />
                    </button>
                  )}
                  {isLoadingAnswer && !answer?.isFinalMessageComing && (
                    <button
                      className="get-answer-btn loading"
                      aria-label="Thinking..."
                    >
                      Thinking...
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="chatbot-detailed">
            {answerError && (
              <Message icon warning size="small">
                <Icon name="exclamation circle" />
                <Message.Content>
                  Unable to generate detailed answer. Please try again later.
                </Message.Content>
              </Message>
            )}
            {!answerError && answer?.isFinalMessageComing && (
              <div className="chatbot-detailed-content">
                <Answer
                  message={answer}
                  animate={!isAnswerDisplayed}
                  onComplete={() => setDisplayedAnswerId(answer.messageId)}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatbotAnswer;
