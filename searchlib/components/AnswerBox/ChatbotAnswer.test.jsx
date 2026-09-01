import { render, screen, waitFor, act } from '@testing-library/react';
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
        prompt: 'Full prompt',
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
    isLoadingAnswer: false,
    setIsQuestion: jest.fn(),
    setIsLoadingSummary: jest.fn(),
    setIsLoadingAnswer: jest.fn(),
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

  it('applies loading class when isLoadingAnswer is true', () => {
    mockUseSearchAssist.mockReturnValue({
      ...defaultSearchAssist,
      isLoadingAnswer: true,
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

      // User turns the AI summary off from the header search toggle.
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

  it('does not show answer error message initially', () => {
    render(<ChatbotAnswer />);
    expect(
      screen.queryByText(
        'Unable to generate detailed answer. Please try again later.',
      ),
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
});
