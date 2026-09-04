import {
  render,
  screen,
  waitFor,
  act,
  fireEvent,
} from '@testing-library/react';
import ChatbotAnswer from './ChatbotAnswer';
import {
  AI_SUMMARY_STORAGE_KEY,
  AI_SUMMARY_TOGGLE_EVENT,
} from '../../lib/aiSummaryToggle';
import '@testing-library/jest-dom';

// Mock @eeacms/search/lib/hocs
const mockUseAppConfig = jest.fn();
const mockUseSearchContext = jest.fn();
const mockUseSearchAssist = jest.fn();

jest.mock(
  '@eeacms/search/lib/hocs',
  () => ({
    useAppConfig: () => mockUseAppConfig(),
    useSearchContext: () => mockUseSearchContext(),
    useSearchAssist: () => mockUseSearchAssist(),
  }),
  { virtual: true },
);

// Mock @eeacms/volto-eea-chatbot
const mockCreateChatSession = jest.fn();
const mockSendMessage = jest.fn();

jest.mock(
  '@eeacms/volto-eea-chatbot',
  () => ({
    createChatSession: (...args) => mockCreateChatSession(...args),
    sendMessage: (...args) => mockSendMessage(...args),
    MessageProcessor: jest.fn().mockImplementation(() => ({
      addPackets: jest.fn(),
      getMessage: jest.fn(() => ({
        messageId: 'test-message-id',
        message: 'Test response',
        groupedPackets: [],
        displayPackets: [],
        isComplete: false,
        isFinalMessageComing: false,
      })),
      isComplete: false,
    })),
    RendererComponent: jest.fn(({ children }) =>
      children({ content: <span>Rendered content</span> }),
    ),
    UserActionsToolbar: jest.fn(() => (
      <div data-testid="user-actions-toolbar">UserActionsToolbar</div>
    )),
  }),
  { virtual: true },
);

// Mock @plone/volto/components
jest.mock(
  '@plone/volto/components',
  () => ({
    Icon: jest.fn(({ name, size }) => (
      <span data-testid="volto-icon" data-name={name} data-size={size}>
        Icon
      </span>
    )),
  }),
  { virtual: true },
);

// Mock @plone/volto/helpers/Loadable
jest.mock(
  '@plone/volto/helpers/Loadable',
  () => ({
    injectLazyLibs: () => (Component) => (props) => (
      <Component
        {...props}
        rehypePrism={{ default: jest.fn() }}
        remarkGfm={{ default: jest.fn() }}
      />
    ),
  }),
  { virtual: true },
);

// Mock semantic-ui-react
jest.mock('semantic-ui-react', () => ({
  Message: jest.fn(({ children, icon, warning, size }) => (
    <div data-testid="sui-message" data-warning={warning} data-size={size}>
      {children}
    </div>
  )),
  Icon: jest.fn(({ name }) => <i data-testid="sui-icon" data-name={name} />),
  Modal: jest.fn(({ children, open, trigger, onOpen }) => (
    <div data-testid="sui-modal" data-open={open}>
      <button onClick={onOpen}>{trigger}</button>
      {open && children}
    </div>
  )),
  ModalHeader: jest.fn(({ children }) => (
    <div data-testid="sui-modal-header">{children}</div>
  )),
  ModalContent: jest.fn(({ children }) => (
    <div data-testid="sui-modal-content">{children}</div>
  )),
}));

// Mock SVG imports
jest.mock('@plone/volto/icons/info.svg', () => 'info-svg', { virtual: true });
jest.mock('@plone/volto/icons/clear.svg', () => 'clear-svg', { virtual: true });
jest.mock(
  '@eeacms/search/components/SearchInput/icons/search-assist.svg',
  () => 'search-assist-svg',
  { virtual: true },
);

// Mock classnames
jest.mock('classnames', () => {
  return (...args) => {
    return args
      .flatMap((arg) => {
        if (typeof arg === 'string') return arg;
        if (typeof arg === 'object' && arg !== null) {
          return Object.entries(arg)
            .filter(([, value]) => value)
            .map(([key]) => key);
        }
        return [];
      })
      .filter(Boolean)
      .join(' ');
  };
});

describe('ChatbotAnswer', () => {
  const defaultAppConfig = {
    appConfig: {
      chatbotAnswer: {
        personaId: 'test-persona-id',
        summaryPrompt: 'Summary prompt',
        enableFeedback: true,
        feedbackReasons: ['reason1', 'reason2'],
      },
      enableMatomoTracking: false,
    },
  };

  const defaultSearchContext = {
    searchTerm: '',
    resultSearchTerm: '',
    isLoading: false,
  };

  const defaultSearchAssist = {
    isQuestion: false,
    isLoadingSummary: false,
    setIsQuestion: jest.fn(),
    setIsLoadingSummary: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.clear();
    mockUseAppConfig.mockReturnValue(defaultAppConfig);
    mockUseSearchContext.mockReturnValue(defaultSearchContext);
    mockUseSearchAssist.mockReturnValue(defaultSearchAssist);
    mockCreateChatSession.mockResolvedValue('test-session-id');
    mockSendMessage.mockImplementation(async function* () {
      yield [];
    });
  });

  it('renders the chatbot answer wrapper', () => {
    const { container } = render(<ChatbotAnswer />);
    expect(
      container.querySelector('.chatbot-answer-wrapper'),
    ).toBeInTheDocument();
  });

  it('renders the header with label', () => {
    render(<ChatbotAnswer />);
    expect(screen.getByText('AI Summary')).toBeInTheDocument();
  });

  it('renders the UserActionsToolbar', () => {
    render(<ChatbotAnswer />);
    expect(screen.getByTestId('user-actions-toolbar')).toBeInTheDocument();
  });

  it('renders the disclaimer modal trigger', () => {
    const { container } = render(<ChatbotAnswer />);
    expect(container.querySelector('.icon-btn.outline')).toBeInTheDocument();
  });

  it('applies loading class when isLoadingSummary is true', () => {
    mockUseSearchAssist.mockReturnValue({
      ...defaultSearchAssist,
      isLoadingSummary: true,
    });

    const { container } = render(<ChatbotAnswer />);
    expect(
      container.querySelector('.chatbot-answer.loading'),
    ).toBeInTheDocument();
  });

  it('expands the wrapper while the summary is loading', () => {
    mockUseSearchAssist.mockReturnValue({
      ...defaultSearchAssist,
      isLoadingSummary: true,
    });

    const { container } = render(<ChatbotAnswer />);
    expect(
      container.querySelector('.chatbot-answer-wrapper.expanded'),
    ).toBeInTheDocument();
  });

  it('shows a loading placeholder inside the box while generating', () => {
    mockUseSearchAssist.mockReturnValue({
      ...defaultSearchAssist,
      isLoadingSummary: true,
    });

    const { container } = render(<ChatbotAnswer />);
    expect(
      container.querySelector('.chatbot-summary-loading'),
    ).toBeInTheDocument();
  });

  it('does not show a loading placeholder when idle', () => {
    const { container } = render(<ChatbotAnswer />);
    expect(
      container.querySelector('.chatbot-summary-loading'),
    ).not.toBeInTheDocument();
  });

  it('keeps the box expanded while the summary text streams in', async () => {
    const { MessageProcessor } = require('@eeacms/volto-eea-chatbot');
    const defaultImplementation = MessageProcessor.getMockImplementation();

    let releaseStream;
    const streamGate = new Promise((resolve) => {
      releaseStream = resolve;
    });

    MessageProcessor.mockImplementation(() => {
      let stages = 0;
      return {
        addPackets: () => {
          stages += 1;
        },
        getMessage: () => ({
          messageId: 'stream-message-id',
          message: 'Streaming summary text',
          groupedPackets: [],
          displayPackets: [],
          isComplete: stages >= 2,
          isFinalMessageComing: true,
        }),
        get isComplete() {
          return stages >= 2;
        },
      };
    });

    mockSendMessage.mockImplementation(async function* () {
      yield [];
      await streamGate;
      yield [];
    });

    mockUseSearchContext.mockReturnValue({
      ...defaultSearchContext,
      searchTerm: 'How does test query work?',
      resultSearchTerm: 'How does test query work?',
      isLoading: false,
      totalResults: 5,
    });

    try {
      const { container } = render(<ChatbotAnswer />);

      // Mid-stream: the final message is arriving (the component has
      // already dropped the loading flag when the final message
      // started). The box that showed the skeletons must stay expanded
      // so the summary fills it in place.
      await waitFor(() => {
        expect(container.querySelector('.chatbot-summary')).toBeInTheDocument();
      });

      expect(
        container.querySelector('.chatbot-summary-loading'),
      ).not.toBeInTheDocument();
      expect(
        container.querySelector('.chatbot-answer-wrapper.expanded'),
      ).toBeInTheDocument();

      // After the stream completes, the box must remain expanded.
      releaseStream();
      await waitFor(() => {
        expect(defaultSearchAssist.setIsQuestion).toHaveBeenCalled();
      });
      expect(
        container.querySelector('.chatbot-answer-wrapper.expanded'),
      ).toBeInTheDocument();
    } finally {
      MessageProcessor.mockImplementation(defaultImplementation);
    }
  });

  it('applies expanded class when isQuestion is true and summary exists', async () => {
    mockUseSearchAssist.mockReturnValue({
      ...defaultSearchAssist,
      isQuestion: true,
    });

    const { container } = render(<ChatbotAnswer />);

    // Initially not expanded (no summary)
    expect(
      container.querySelector('.chatbot-answer-wrapper.expanded'),
    ).not.toBeInTheDocument();
  });

  it('does not fetch summary when personaId is not configured', () => {
    mockUseAppConfig.mockReturnValue({
      appConfig: {
        chatbotAnswer: {},
        enableMatomoTracking: false,
      },
    });

    mockUseSearchContext.mockReturnValue({
      ...defaultSearchContext,
      searchTerm: 'test query',
      isLoading: true,
    });

    render(<ChatbotAnswer />);
    expect(mockCreateChatSession).not.toHaveBeenCalled();
  });

  it('fetches summary when search term changes to a question', async () => {
    mockUseSearchContext.mockReturnValue({
      ...defaultSearchContext,
      searchTerm: 'How does test query work?',
      resultSearchTerm: 'How does test query work?',
      isLoading: false,
      totalResults: 5,
    });

    render(<ChatbotAnswer />);

    await waitFor(() => {
      expect(defaultSearchAssist.setIsLoadingSummary).toHaveBeenCalledWith(
        true,
      );
    });
  });

  it.each(['SOER', 'air quality report 2025', 'circular economy'])(
    'does not fetch summary for non-AI query: %s',
    (query) => {
      mockUseSearchContext.mockReturnValue({
        ...defaultSearchContext,
        searchTerm: query,
        isLoading: true,
      });

      render(<ChatbotAnswer />);

      expect(mockCreateChatSession).not.toHaveBeenCalled();
      expect(defaultSearchAssist.setIsLoadingSummary).not.toHaveBeenCalled();
    },
  );

  it('does not fetch summary when the AI summary toggle is off', () => {
    window.localStorage.setItem(AI_SUMMARY_STORAGE_KEY, '0');
    mockUseSearchContext.mockReturnValue({
      ...defaultSearchContext,
      searchTerm: 'How does test query work?',
      isLoading: true,
    });

    render(<ChatbotAnswer />);

    expect(mockCreateChatSession).not.toHaveBeenCalled();
    expect(defaultSearchAssist.setIsLoadingSummary).not.toHaveBeenCalled();
  });

  it('aborts and hides the summary when the toggle is turned off mid-session', async () => {
    const { MessageProcessor } = require('@eeacms/volto-eea-chatbot');
    const defaultImplementation = MessageProcessor.getMockImplementation();

    let releaseStream;
    const streamGate = new Promise((resolve) => {
      releaseStream = resolve;
    });

    MessageProcessor.mockImplementation(() => {
      let stages = 0;
      return {
        addPackets: () => {
          stages += 1;
        },
        getMessage: () => ({
          messageId: 'stream-message-id',
          message: 'Streaming summary text',
          groupedPackets: [],
          displayPackets: [],
          isComplete: stages >= 2,
          isFinalMessageComing: true,
        }),
        get isComplete() {
          return stages >= 2;
        },
      };
    });

    mockSendMessage.mockImplementation(async function* () {
      yield [];
      await streamGate;
      yield [];
    });

    mockUseSearchContext.mockReturnValue({
      ...defaultSearchContext,
      searchTerm: 'How does test query work?',
      resultSearchTerm: 'How does test query work?',
      isLoading: false,
      totalResults: 5,
    });

    try {
      const { container } = render(<ChatbotAnswer />);

      await waitFor(() => {
        expect(
          container.querySelector('.chatbot-answer-wrapper.expanded'),
        ).toBeInTheDocument();
      });

      releaseStream();
      await waitFor(() => {
        expect(defaultSearchAssist.setIsQuestion).toHaveBeenCalled();
      });
      expect(container.querySelector('.chatbot-summary')).toBeInTheDocument();

      // User turns the AI summary off via the in-box opt-out button.
      act(() => {
        window.dispatchEvent(
          new CustomEvent(AI_SUMMARY_TOGGLE_EVENT, { detail: false }),
        );
      });

      await waitFor(() => {
        expect(
          container.querySelector('.chatbot-summary'),
        ).not.toBeInTheDocument();
      });

      // The question is intent-eligible, so the box stays visible in
      // its disabled state with the opt-in button.
      expect(
        container.querySelector('.chatbot-answer-wrapper.expanded'),
      ).toBeInTheDocument();
      expect(
        screen.getByText('AI summaries are turned off.'),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Enable AI summary' }),
      ).toBeInTheDocument();
    } finally {
      MessageProcessor.mockImplementation(defaultImplementation);
    }
  });

  it('renders without crashing when chatbotAnswer config is empty', () => {
    mockUseAppConfig.mockReturnValue({
      appConfig: {},
    });

    const { container } = render(<ChatbotAnswer />);
    expect(
      container.querySelector('.chatbot-answer-wrapper'),
    ).toBeInTheDocument();
  });

  it('does not show summary error message initially', () => {
    render(<ChatbotAnswer />);
    expect(
      screen.queryByText('Unable to analyze query. Please try again later.'),
    ).not.toBeInTheDocument();
  });

  it('renders disclaimer modal content', () => {
    render(<ChatbotAnswer />);
    expect(screen.getByTestId('sui-modal')).toBeInTheDocument();
  });

  describe('when search results load', () => {
    it('uses resultSearchTerm when not loading', async () => {
      mockUseSearchContext.mockReturnValue({
        searchTerm: 'What is result query?',
        resultSearchTerm: 'What is result query?',
        isLoading: false,
        totalResults: 5,
      });

      render(<ChatbotAnswer />);

      await waitFor(() => {
        expect(defaultSearchAssist.setIsLoadingSummary).toHaveBeenCalled();
      });
    });

    it('waits for the search results before fetching the summary', async () => {
      // While the Elasticsearch search is running, no summary may start:
      // results render first, the summary is a progressive enhancement.
      mockUseSearchContext.mockReturnValue({
        searchTerm: 'How does loading work?',
        resultSearchTerm: '',
        isLoading: true,
      });

      const { rerender } = render(<ChatbotAnswer />);

      await Promise.resolve();
      expect(defaultSearchAssist.setIsLoadingSummary).not.toHaveBeenCalled();

      // Once the search completes with results, the summary may start.
      mockUseSearchContext.mockReturnValue({
        searchTerm: 'How does loading work?',
        resultSearchTerm: 'How does loading work?',
        isLoading: false,
        totalResults: 3,
      });
      rerender(<ChatbotAnswer />);

      await waitFor(() => {
        expect(defaultSearchAssist.setIsLoadingSummary).toHaveBeenCalledWith(
          true,
        );
      });
    });

    it('does not fetch summary when the search completes with zero results', () => {
      mockUseSearchContext.mockReturnValue({
        searchTerm: 'How does climate adaptation work?',
        resultSearchTerm: 'How does climate adaptation work?',
        isLoading: false,
        totalResults: 0,
      });

      render(<ChatbotAnswer />);

      expect(mockCreateChatSession).not.toHaveBeenCalled();
      expect(defaultSearchAssist.setIsLoadingSummary).not.toHaveBeenCalled();
    });

    it('does not fetch summary when the result count is below the configured minimum', () => {
      mockUseAppConfig.mockReturnValue({
        appConfig: {
          chatbotAnswer: {
            personaId: 'test-persona-id',
            minResults: 10,
          },
          enableMatomoTracking: false,
        },
      });
      mockUseSearchContext.mockReturnValue({
        searchTerm: 'How does climate adaptation work?',
        resultSearchTerm: 'How does climate adaptation work?',
        isLoading: false,
        totalResults: 5,
      });

      render(<ChatbotAnswer />);

      expect(mockCreateChatSession).not.toHaveBeenCalled();
      expect(defaultSearchAssist.setIsLoadingSummary).not.toHaveBeenCalled();
    });
  });

  describe('abort behavior', () => {
    it('aborts the in-flight summary when a new search completes', async () => {
      const abortSpy = jest.fn();
      const originalAbortController = global.AbortController;
      global.AbortController = jest.fn(() => ({
        abort: abortSpy,
        signal: {},
      }));

      mockUseSearchContext.mockReturnValue({
        searchTerm: 'How does first work?',
        resultSearchTerm: 'How does first work?',
        isLoading: false,
        totalResults: 5,
      });

      const { rerender } = render(<ChatbotAnswer />);

      await waitFor(() => {
        expect(mockCreateChatSession).toHaveBeenCalled();
      });

      // A new search completes with a different question.
      mockUseSearchContext.mockReturnValue({
        searchTerm: 'How does second work?',
        resultSearchTerm: 'How does second work?',
        isLoading: false,
        totalResults: 5,
      });
      rerender(<ChatbotAnswer />);

      await waitFor(() => {
        expect(abortSpy).toHaveBeenCalled();
      });

      global.AbortController = originalAbortController;
    });
  });

  describe('sources disclosure', () => {
    const citedDocuments = [
      {
        document_id: 'doc-1',
        semantic_identifier: 'Which pollutants cause air pollution?',
        link: 'https://www.eea.europa.eu/en/topics/air-pollution',
        source_type: 'web',
      },
      {
        document_id: 'doc-2',
        semantic_identifier: 'Air quality in Europe',
        link: 'https://www.eea.europa.eu/en/analysis/air-quality',
        source_type: 'web',
      },
      {
        document_id: 'doc-3',
        semantic_identifier: 'Retrieved but never cited',
        link: 'https://www.eea.europa.eu/en/uncited',
        source_type: 'web',
      },
    ];
    const citedCitations = { 1: 'doc-1', 2: 'doc-2', 3: 'doc-2' };

    // Streams a completed summary whose message carries citations and
    // documents, and lets the mocked RendererComponent report that the
    // summary display finished (so the bottom action row is revealed).
    const setupSummaryStream = ({
      citations = citedCitations,
      documents = citedDocuments,
      appConfig = defaultAppConfig,
    } = {}) => {
      const {
        MessageProcessor,
        RendererComponent,
      } = require('@eeacms/volto-eea-chatbot');
      const defaultProcessorImpl = MessageProcessor.getMockImplementation();
      const defaultRendererImpl = RendererComponent.getMockImplementation();

      let releaseStream;
      const streamGate = new Promise((resolve) => {
        releaseStream = resolve;
      });

      MessageProcessor.mockImplementation(() => {
        let stages = 0;
        return {
          addPackets: () => {
            stages += 1;
          },
          getMessage: () => ({
            messageId: 'stream-message-id',
            message: 'Streaming summary text',
            groupedPackets: [{ ind: 0, packets: [] }],
            displayPackets: [0],
            citations,
            documents,
            isComplete: stages >= 2,
            isFinalMessageComing: true,
          }),
          get isComplete() {
            return stages >= 2;
          },
        };
      });

      RendererComponent.mockImplementation(({ children, onComplete }) => {
        const rendered = children({ content: <span>Rendered content</span> });
        Promise.resolve().then(() => onComplete?.());
        return rendered;
      });

      mockSendMessage.mockImplementation(async function* () {
        yield [];
        await streamGate;
        yield [];
      });

      mockUseAppConfig.mockReturnValue(appConfig);
      mockUseSearchContext.mockReturnValue({
        ...defaultSearchContext,
        searchTerm: 'What are the main causes of air pollution?',
        resultSearchTerm: 'What are the main causes of air pollution?',
        isLoading: false,
        totalResults: 5,
      });

      return {
        releaseStream,
        restore: () => {
          MessageProcessor.mockImplementation(defaultProcessorImpl);
          RendererComponent.mockImplementation(defaultRendererImpl);
        },
      };
    };

    it('shows the cited sources count once the summary is displayed', async () => {
      const { releaseStream, restore } = setupSummaryStream();

      try {
        const { container } = render(<ChatbotAnswer />);

        await act(async () => {
          releaseStream();
        });
        await waitFor(() => {
          expect(
            screen.getByText('Generated from 2 EEA documents'),
          ).toBeInTheDocument();
        });
        expect(
          container.querySelector('.chatbot-sources-toggle'),
        ).toHaveAttribute('aria-expanded', 'false');
      } finally {
        restore();
      }
    });

    it('lists only the cited documents with their links when expanded', async () => {
      const { releaseStream, restore } = setupSummaryStream();

      try {
        render(<ChatbotAnswer />);

        await act(async () => {
          releaseStream();
        });
        const sourcesToggle = await screen.findByRole('button', {
          name: 'Generated from 2 EEA documents',
        });
        fireEvent.click(sourcesToggle);

        await waitFor(() => {
          expect(sourcesToggle).toHaveAttribute('aria-expanded', 'true');
        });
        expect(
          screen.getByText('Which pollutants cause air pollution?'),
        ).toHaveAttribute(
          'href',
          'https://www.eea.europa.eu/en/topics/air-pollution',
        );
        expect(screen.getByText('Air quality in Europe')).toHaveAttribute(
          'href',
          'https://www.eea.europa.eu/en/analysis/air-quality',
        );
        // Retrieved but never cited: must not appear in the list.
        expect(
          screen.queryByText('Retrieved but never cited'),
        ).not.toBeInTheDocument();
      } finally {
        restore();
      }
    });

    it('collapses the sources list again', async () => {
      const { releaseStream, restore } = setupSummaryStream();

      try {
        render(<ChatbotAnswer />);

        await act(async () => {
          releaseStream();
        });
        const sourcesToggle = await screen.findByRole('button', {
          name: 'Generated from 2 EEA documents',
        });
        fireEvent.click(sourcesToggle);
        await waitFor(() => {
          expect(sourcesToggle).toHaveAttribute('aria-expanded', 'true');
        });

        fireEvent.click(sourcesToggle);
        await waitFor(() => {
          expect(sourcesToggle).toHaveAttribute('aria-expanded', 'false');
        });
        expect(
          screen.queryByText('Air quality in Europe'),
        ).not.toBeInTheDocument();
      } finally {
        restore();
      }
    });

    it('does not show the sources row when the summary cites no documents', async () => {
      const { releaseStream, restore } = setupSummaryStream({
        citations: {},
        appConfig: {
          appConfig: {
            chatbotAnswer: {
              personaId: 'test-persona-id',
              continueConversationUrl: '/en/ask-ai',
            },
            enableMatomoTracking: false,
          },
        },
      });

      try {
        const { container } = render(<ChatbotAnswer />);

        await act(async () => {
          releaseStream();
        });
        // The continue conversation row proves the summary display
        // has finished.
        await screen.findByText('Continue conversation');
        expect(
          container.querySelector('.chatbot-sources-toggle'),
        ).not.toBeInTheDocument();
      } finally {
        restore();
      }
    });

    it('uses the singular form for a single cited document', async () => {
      const { releaseStream, restore } = setupSummaryStream({
        citations: { 1: 'doc-1' },
        documents: [citedDocuments[0]],
      });

      try {
        render(<ChatbotAnswer />);

        await act(async () => {
          releaseStream();
        });
        await waitFor(() => {
          expect(
            screen.getByText('Generated from 1 EEA document'),
          ).toBeInTheDocument();
        });
      } finally {
        restore();
      }
    });
  });

  describe('in-box AI summary preference', () => {
    it('shows the disabled box with an opt-in button for eligible questions when AI summaries are off', () => {
      window.localStorage.setItem(AI_SUMMARY_STORAGE_KEY, '0');
      mockUseSearchContext.mockReturnValue({
        ...defaultSearchContext,
        searchTerm: 'How does test query work?',
        resultSearchTerm: 'How does test query work?',
        isLoading: false,
        totalResults: 5,
      });

      const { container } = render(<ChatbotAnswer />);

      expect(
        container.querySelector('.chatbot-answer-wrapper.expanded'),
      ).toBeInTheDocument();
      expect(
        screen.getByText('AI summaries are turned off.'),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Enable AI summary' }),
      ).toBeInTheDocument();
      // No LLM call for the disabled state.
      expect(mockCreateChatSession).not.toHaveBeenCalled();
      expect(defaultSearchAssist.setIsLoadingSummary).not.toHaveBeenCalled();
    });

    it('does not show the disabled box for non-AI queries when AI summaries are off', () => {
      window.localStorage.setItem(AI_SUMMARY_STORAGE_KEY, '0');
      mockUseSearchContext.mockReturnValue({
        ...defaultSearchContext,
        searchTerm: 'SOER',
        resultSearchTerm: 'SOER',
        isLoading: false,
        totalResults: 5,
      });

      const { container } = render(<ChatbotAnswer />);

      expect(
        container.querySelector('.chatbot-answer-wrapper.expanded'),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'Enable AI summary' }),
      ).not.toBeInTheDocument();
    });

    it('does not show the disabled box when the search completes with zero results', () => {
      window.localStorage.setItem(AI_SUMMARY_STORAGE_KEY, '0');
      mockUseSearchContext.mockReturnValue({
        ...defaultSearchContext,
        searchTerm: 'How does test query work?',
        resultSearchTerm: 'How does test query work?',
        isLoading: false,
        totalResults: 0,
      });

      const { container } = render(<ChatbotAnswer />);

      expect(
        container.querySelector('.chatbot-answer-wrapper.expanded'),
      ).not.toBeInTheDocument();
    });

    it('shows the disable button in the box header and switches to the disabled state on click', async () => {
      mockUseSearchContext.mockReturnValue({
        ...defaultSearchContext,
        searchTerm: 'How does test query work?',
        resultSearchTerm: 'How does test query work?',
        isLoading: false,
        totalResults: 5,
      });

      const { container } = render(<ChatbotAnswer />);

      // The summary fetch has started (the opt-out is available in the
      // box header as soon as the box renders).
      await waitFor(() => {
        expect(mockCreateChatSession).toHaveBeenCalled();
      });
      const disableButton = screen.getByRole('button', {
        name: 'Disable AI summary',
      });

      fireEvent.click(disableButton);

      expect(window.localStorage.getItem(AI_SUMMARY_STORAGE_KEY)).toBe('0');
      expect(
        container.querySelector('.chatbot-answer-wrapper.expanded'),
      ).toBeInTheDocument();
      expect(
        screen.getByText('AI summaries are turned off.'),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Enable AI summary' }),
      ).toBeInTheDocument();
    });

    it('enables AI summaries again from the disabled box opt-in button', () => {
      window.localStorage.setItem(AI_SUMMARY_STORAGE_KEY, '0');
      mockUseSearchContext.mockReturnValue({
        ...defaultSearchContext,
        searchTerm: 'How does test query work?',
        resultSearchTerm: 'How does test query work?',
        isLoading: false,
        totalResults: 5,
      });

      render(<ChatbotAnswer />);

      fireEvent.click(
        screen.getByRole('button', { name: 'Enable AI summary' }),
      );

      expect(window.localStorage.getItem(AI_SUMMARY_STORAGE_KEY)).toBe('1');
    });

    it('generates the summary for the current question when re-enabled', async () => {
      mockUseSearchContext.mockReturnValue({
        ...defaultSearchContext,
        searchTerm: 'How does test query work?',
        resultSearchTerm: 'How does test query work?',
        isLoading: false,
        totalResults: 5,
      });

      render(<ChatbotAnswer />);

      // The initial (enabled) state fetches the summary once.
      await waitFor(() => {
        expect(mockCreateChatSession).toHaveBeenCalledTimes(1);
      });

      // Disable, then re-enable from the box: the current question must
      // be re-evaluated and a new summary generated.
      act(() => {
        window.dispatchEvent(
          new CustomEvent(AI_SUMMARY_TOGGLE_EVENT, { detail: false }),
        );
      });
      act(() => {
        window.dispatchEvent(
          new CustomEvent(AI_SUMMARY_TOGGLE_EVENT, { detail: true }),
        );
      });

      await waitFor(() => {
        expect(mockCreateChatSession).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('continue conversation', () => {
    const question = 'What are the main causes of air pollution?';

    const streamedQuestionContext = {
      ...defaultSearchContext,
      searchTerm: question,
      resultSearchTerm: question,
      isLoading: false,
      totalResults: 5,
    };

    const setupDisplayedSummary = (continueConversationUrl) => {
      const {
        MessageProcessor,
        RendererComponent,
      } = require('@eeacms/volto-eea-chatbot');
      const defaultProcessorImpl = MessageProcessor.getMockImplementation();
      const defaultRendererImpl = RendererComponent.getMockImplementation();

      let stages = 0;
      MessageProcessor.mockImplementation(() => ({
        addPackets: () => {
          stages += 1;
        },
        getMessage: () => ({
          messageId: 'stream-message-id',
          message: 'Streaming summary text',
          groupedPackets: [{ ind: 0, packets: [] }],
          displayPackets: [0],
          isComplete: stages >= 1,
          isFinalMessageComing: true,
        }),
        get isComplete() {
          return stages >= 1;
        },
      }));
      RendererComponent.mockImplementation(({ children, onComplete }) => {
        const rendered = children({ content: <span>Rendered content</span> });
        Promise.resolve().then(() => onComplete?.());
        return rendered;
      });
      mockSendMessage.mockImplementation(async function* () {
        yield [];
        yield [];
      });
      mockUseAppConfig.mockReturnValue({
        appConfig: {
          chatbotAnswer: {
            personaId: 'test-persona-id',
            continueConversationUrl,
          },
          enableMatomoTracking: false,
        },
      });
      mockUseSearchContext.mockReturnValue(streamedQuestionContext);

      return () => {
        MessageProcessor.mockImplementation(defaultProcessorImpl);
        RendererComponent.mockImplementation(defaultRendererImpl);
      };
    };

    it('links to the configured chatbot page seeded with the question', async () => {
      const restore = setupDisplayedSummary('/en/ask-ai');

      try {
        render(<ChatbotAnswer />);

        const link = await screen.findByRole('link', {
          name: /Continue conversation/,
        });
        expect(link).toHaveAttribute(
          'href',
          `/en/ask-ai?query=${encodeURIComponent(question)}`,
        );
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noreferrer');
      } finally {
        restore();
      }
    });

    it('appends to an existing query string in the configured URL', async () => {
      const restore = setupDisplayedSummary('/en/ask-ai?lang=en');

      try {
        render(<ChatbotAnswer />);

        const link = await screen.findByRole('link', {
          name: /Continue conversation/,
        });
        expect(link).toHaveAttribute(
          'href',
          `/en/ask-ai?lang=en&query=${encodeURIComponent(question)}`,
        );
      } finally {
        restore();
      }
    });

    it('is hidden when no chatbot page is configured', async () => {
      const restore = setupDisplayedSummary(undefined);

      try {
        const { container } = render(<ChatbotAnswer />);

        // Let the summary fully stream and display.
        await waitFor(() => {
          expect(
            container.querySelector('.chatbot-answer-wrapper.expanded'),
          ).toBeInTheDocument();
        });
        expect(
          screen.queryByRole('link', { name: /Continue conversation/ }),
        ).not.toBeInTheDocument();
      } finally {
        restore();
      }
    });
  });
});
