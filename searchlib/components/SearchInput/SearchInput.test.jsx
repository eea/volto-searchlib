import { render, screen, act } from '@testing-library/react';
import SearchInput from './SearchInput';
import {
  AI_SUMMARY_STORAGE_KEY,
  AI_SUMMARY_TOGGLE_EVENT,
} from '../../lib/aiSummaryToggle';
import '@testing-library/jest-dom';

// Mock @eeacms/search/lib/hocs
const mockUseAppConfig = jest.fn();
const mockUseSearchContext = jest.fn();

jest.mock(
  '@eeacms/search/lib/hocs',
  () => ({
    useAppConfig: () => mockUseAppConfig(),
    useSearchContext: () => mockUseSearchContext(),
  }),
  { virtual: true },
);

// Mock semantic-ui-react
jest.mock('semantic-ui-react', () => ({
  Icon: jest.fn(({ name }) => <i data-testid="sui-icon" data-name={name} />),
  Image: jest.fn(({ src }) => <img data-testid="sui-image" src={src} alt="" />),
}));

// Mock the SVG assets so the icon source is deterministic
jest.mock('./icons/ai-search.svg', () => 'ai-search.svg');
jest.mock('./icons/search.svg', () => 'search.svg');

const getInputProps = () => ({
  value: '',
  placeholder: 'Search with a question or keyword...',
  onChange: jest.fn(),
  onKeyDown: jest.fn(),
});

const renderInput = () =>
  render(
    <SearchInput
      getAutocomplete={() => null}
      getButtonProps={() => ({})}
      getInputProps={getInputProps}
      onChange={jest.fn()}
      onSubmit={jest.fn()}
      mode="view"
    />,
  );

describe('SearchInput AI summary icon state', () => {
  beforeEach(() => {
    window.localStorage.clear();
    mockUseSearchContext.mockReturnValue({
      setSearchTerm: jest.fn(),
      setSort: jest.fn(),
    });
    mockUseAppConfig.mockReturnValue({
      appConfig: {
        sortOptions: [],
        enableChatbotAnswer: true,
      },
    });
  });

  it('renders the AI sparkle icon when AI summaries are enabled', () => {
    renderInput();
    expect(screen.getByTestId('sui-image').src).toBe(
      `${window.location.origin}/ai-search.svg`,
    );
  });

  it('renders the plain search icon when AI summaries are turned off', () => {
    window.localStorage.setItem(AI_SUMMARY_STORAGE_KEY, '0');
    renderInput();
    expect(screen.getByTestId('sui-image').src).toBe(
      `${window.location.origin}/search.svg`,
    );
  });

  it('renders the plain search icon when chatbot answers are disabled', () => {
    mockUseAppConfig.mockReturnValue({
      appConfig: {
        sortOptions: [],
        enableChatbotAnswer: false,
      },
    });
    renderInput();
    expect(screen.getByTestId('sui-image').src).toBe(
      `${window.location.origin}/search.svg`,
    );
  });

  it('switches the icon live when the AI summary preference changes', () => {
    renderInput();
    expect(screen.getByTestId('sui-image').src).toBe(
      `${window.location.origin}/ai-search.svg`,
    );

    act(() => {
      window.dispatchEvent(
        new CustomEvent(AI_SUMMARY_TOGGLE_EVENT, { detail: false }),
      );
    });
    expect(screen.getByTestId('sui-image').src).toBe(
      `${window.location.origin}/search.svg`,
    );

    act(() => {
      window.dispatchEvent(
        new CustomEvent(AI_SUMMARY_TOGGLE_EVENT, { detail: true }),
      );
    });
    expect(screen.getByTestId('sui-image').src).toBe(
      `${window.location.origin}/ai-search.svg`,
    );
  });
});
