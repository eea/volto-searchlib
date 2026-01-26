import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import LandingPageView from './LandingPageView';
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
  LandingPageApp: ({ onSubmitSearch, children }) => (
    <div data-testid="landing-page-app">
      <button
        data-testid="submit-search"
        onClick={() => onSubmitSearch && onSubmitSearch('q=test')}
      >
        Search
      </button>
      {children}
    </div>
  ),
}));

describe('LandingPageView', () => {
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
  });

  it('should render without crashing', () => {
    const { getByTestId } = render(<LandingPageView {...defaultProps} />);
    expect(getByTestId('landing-page-app')).toBeInTheDocument();
  });

  it('should navigate to search URL when submitting search', () => {
    const { getByTestId } = render(<LandingPageView {...defaultProps} />);

    fireEvent.click(getByTestId('submit-search'));

    expect(mockPush).toHaveBeenCalledWith('/search?q=test');
  });

  it('should not navigate when url is not configured', () => {
    const propsWithoutUrl = {
      appName: 'testApp',
      registry: {
        searchui: {
          testApp: {},
        },
      },
    };

    const { getByTestId } = render(<LandingPageView {...propsWithoutUrl} />);

    fireEvent.click(getByTestId('submit-search'));

    expect(mockPush).not.toHaveBeenCalled();
  });

  it('should render children', () => {
    const { getAllByText } = render(
      <LandingPageView {...defaultProps}>
        <div>Child content</div>
      </LandingPageView>,
    );

    expect(getAllByText('Child content').length).toBeGreaterThan(0);
  });

  describe('schemaEnhancer', () => {
    it('should add url field to schema', () => {
      const mockSchema = {
        fieldsets: [{ fields: [] }],
        properties: {},
      };

      const result = LandingPageView.schemaEnhancer({ schema: mockSchema });

      expect(result.fieldsets[0].fields).toContain('url');
      expect(result.properties.url).toEqual({
        title: 'Results page',
        widget: 'url',
        configPath: 'url',
      });
    });
  });
});
