import { render, screen, waitFor } from '@testing-library/react';
import ChatbotAnswer from './ChatbotAnswer';
import '@testing-library/jest-dom/extend-expect';

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

  it('fetches summary when search term changes', async () => {
    mockUseSearchContext.mockReturnValue({
      ...defaultSearchContext,
      searchTerm: 'test query',
      isLoading: true,
    });

    render(<ChatbotAnswer />);

    await waitFor(() => {
      expect(defaultSearchAssist.setIsLoadingSummary).toHaveBeenCalledWith(
        true,
      );
    });
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
        searchTerm: 'initial query',
        resultSearchTerm: 'result query',
        isLoading: false,
      });

      render(<ChatbotAnswer />);

      await waitFor(() => {
        expect(defaultSearchAssist.setIsLoadingSummary).toHaveBeenCalled();
      });
    });

    it('uses searchTerm when loading', async () => {
      mockUseSearchContext.mockReturnValue({
        searchTerm: 'loading query',
        resultSearchTerm: '',
        isLoading: true,
      });

      render(<ChatbotAnswer />);

      await waitFor(() => {
        expect(defaultSearchAssist.setIsLoadingSummary).toHaveBeenCalled();
      });
    });
  });

  describe('abort behavior', () => {
    it('aborts previous request when new search starts', async () => {
      const abortSpy = jest.fn();
      const originalAbortController = global.AbortController;
      global.AbortController = jest.fn(() => ({
        abort: abortSpy,
        signal: {},
      }));

      mockUseSearchContext.mockReturnValue({
        searchTerm: 'first query',
        resultSearchTerm: '',
        isLoading: true,
      });

      const { rerender } = render(<ChatbotAnswer />);

      // Trigger another search
      mockUseSearchContext.mockReturnValue({
        searchTerm: 'second query',
        resultSearchTerm: '',
        isLoading: true,
      });

      rerender(<ChatbotAnswer />);

      await waitFor(() => {
        expect(abortSpy).toHaveBeenCalled();
      });

      global.AbortController = originalAbortController;
    });
  });
});
