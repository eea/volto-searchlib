import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import SearchInputView from './SearchInputView';
import '@testing-library/jest-dom/extend-expect';

const mockPush = jest.fn();

jest.mock('react-router-dom', () => ({
  useHistory: () => ({
    push: mockPush,
  }),
}));

jest.mock('@plone/volto/helpers', () => ({
  flattenToAppURL: (url) => url || '',
}));

jest.mock('@eeacms/search', () => ({
  SearchInputApp: ({ onSubmitSearch, children }) => (
    <div data-testid="search-input-app">
      <button
        data-testid="submit-search"
        onClick={() => onSubmitSearch && onSubmitSearch('test query')}
      >
        Search
      </button>
      {children}
    </div>
  ),
}));

describe('SearchInputView', () => {
  const defaultProps = {
    appName: 'testApp',
    registry: {
      searchui: {
        testApp: {
          url: '/search',
        },
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    delete window.searchContext;
  });

  it('should render without crashing', () => {
    const { getByTestId } = render(<SearchInputView {...defaultProps} />);
    expect(getByTestId('search-input-app')).toBeInTheDocument();
  });

  it('should navigate to search URL with query when url is configured', () => {
    const { getByTestId } = render(<SearchInputView {...defaultProps} />);

    fireEvent.click(getByTestId('submit-search'));

    expect(mockPush).toHaveBeenCalledWith('/search?q=test query');
  });

  it('should use window.searchContext when url is not configured and context exists', () => {
    const mockResetSearch = jest.fn();
    window.searchContext = {
      resetSearch: mockResetSearch,
    };

    const propsWithoutUrl = {
      appName: 'testApp',
      registry: {
        searchui: {
          testApp: {},
        },
      },
    };

    const { getByTestId } = render(<SearchInputView {...propsWithoutUrl} />);

    fireEvent.click(getByTestId('submit-search'));

    expect(mockResetSearch).toHaveBeenCalledWith({ searchTerm: 'test query' });
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('should navigate with empty url when no url and no searchContext', () => {
    const propsWithoutUrl = {
      appName: 'testApp',
      registry: {
        searchui: {
          testApp: {},
        },
      },
    };

    const { getByTestId } = render(<SearchInputView {...propsWithoutUrl} />);

    fireEvent.click(getByTestId('submit-search'));

    expect(mockPush).toHaveBeenCalledWith('?q=test query');
  });

  it('should render children', () => {
    const { getAllByText } = render(
      <SearchInputView {...defaultProps}>
        <div>Child content</div>
      </SearchInputView>,
    );

    expect(getAllByText('Child content').length).toBeGreaterThan(0);
  });

  describe('schemaEnhancer', () => {
    it('should add url field to schema', () => {
      const mockSchema = {
        fieldsets: [{ fields: [] }],
        properties: {},
      };

      const result = SearchInputView.schemaEnhancer({ schema: mockSchema });

      expect(result.fieldsets[0].fields).toContain('url');
      expect(result.properties.url).toEqual({
        title: 'Results page',
        widget: 'url',
        configPath: 'url',
      });
    });
  });
});
