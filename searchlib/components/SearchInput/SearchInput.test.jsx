import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SearchInput from './SearchInput';

let mockEnableChatbotAnswer = true;

jest.mock(
  '@eeacms/search/lib/hocs',
  () => ({
    useSearchContext: () => ({
      setSearchTerm: jest.fn(),
      setSort: jest.fn(),
    }),
    useAppConfig: () => ({
      appConfig: {
        sortOptions: [],
        enableChatbotAnswer: mockEnableChatbotAnswer,
      },
    }),
  }),
  { virtual: true },
);

const renderSearchInput = (props = {}) =>
  render(
    <SearchInput
      getAutocomplete={() => null}
      getButtonProps={() => ({})}
      getInputProps={() => ({
        value: '',
        placeholder: 'Search',
        onChange: jest.fn(),
        onKeyDown: jest.fn(),
      })}
      onChange={jest.fn()}
      onSubmit={jest.fn()}
      mode="view"
      {...props}
    />,
  );

describe('SearchInput AI Summary toggle', () => {
  beforeEach(() => {
    mockEnableChatbotAnswer = true;
    window.localStorage.clear();
  });

  it('renders the switch, on by default, when enableChatbotAnswer is true', () => {
    const { getByRole } = renderSearchInput();

    const toggle = getByRole('switch');
    expect(toggle).toHaveAttribute('aria-checked', 'true');
    expect(toggle).toHaveTextContent('AI Summary');
  });

  it('does not render the switch when enableChatbotAnswer is false', () => {
    mockEnableChatbotAnswer = false;

    const { queryByRole } = renderSearchInput();

    expect(queryByRole('switch')).not.toBeInTheDocument();
  });

  it('persists the flipped state and dispatches the sync event', () => {
    const listener = jest.fn();
    window.addEventListener('eea:ai-summary-toggle', listener);

    try {
      const { getByRole } = renderSearchInput();
      fireEvent.click(getByRole('switch'));

      expect(window.localStorage.getItem('eea-ai-summary-enabled')).toBe('0');
      expect(getByRole('switch')).toHaveAttribute('aria-checked', 'false');
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({ detail: false }),
      );
    } finally {
      window.removeEventListener('eea:ai-summary-toggle', listener);
    }
  });

  it('starts off when disabled in a previous session', () => {
    window.localStorage.setItem('eea-ai-summary-enabled', '0');

    const { getByRole } = renderSearchInput();

    expect(getByRole('switch')).toHaveAttribute('aria-checked', 'false');
  });
});
