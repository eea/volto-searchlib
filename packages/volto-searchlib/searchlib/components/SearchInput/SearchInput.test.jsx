import { render, screen, act } from '@testing-library/react';
import { vi } from 'vitest';
import SearchInput from './SearchInput';
import {
  AI_SUMMARY_STORAGE_KEY,
  AI_SUMMARY_TOGGLE_EVENT,
} from '../../lib/aiSummaryToggle';
import '@testing-library/jest-dom';

// Mock @eeacms/search/lib/hocs
const { mockUseAppConfig, mockUseSearchContext } = vi.hoisted(() => ({
  mockUseAppConfig: vi.fn(),
  mockUseSearchContext: vi.fn(),
}));

vi.mock('@eeacms/search/lib/hocs', () => ({
  useAppConfig: () => mockUseAppConfig(),
  useSearchContext: () => mockUseSearchContext(),
}));

// Mock semantic-ui-react
vi.mock('semantic-ui-react', () => ({
  Icon: ({ name }) => <i data-testid="sui-icon" data-name={name} />,
  Image: ({ src }) => <img data-testid="sui-image" src={src} alt="" />,
}));

// Volto's Image is redux-connected; the icon assertion only needs the src it
// receives, so render it directly instead of pulling in the store.
vi.mock('@plone/volto/components/theme/Image/Image', () => ({
  __esModule: true,
  default: ({ src }) => <img data-testid="sui-image" src={src} alt="" />,
}));

// Mock the SVG assets so the icon source is deterministic
vi.mock('./icons/ai-search.svg', () => ({ default: 'ai-search.svg' }));
vi.mock('./icons/search.svg', () => ({ default: 'search.svg' }));

const getInputProps = () => ({
  value: '',
  placeholder: 'Search with a question or keyword...',
  onChange: vi.fn(),
  onKeyDown: vi.fn(),
});

const renderInput = () =>
  render(
    <SearchInput
      getAutocomplete={() => null}
      getButtonProps={() => ({})}
      getInputProps={getInputProps}
      onChange={vi.fn()}
      onSubmit={vi.fn()}
      mode="view"
    />,
  );

describe('SearchInput AI summary icon state', () => {
  beforeEach(() => {
    window.localStorage.clear();
    mockUseSearchContext.mockReturnValue({
      setSearchTerm: vi.fn(),
      setSort: vi.fn(),
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
