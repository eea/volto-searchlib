import React from 'react';
import { render } from '@testing-library/react';
import SearchResultsView from './SearchResultsView';
import '@testing-library/jest-dom/extend-expect';

jest.mock('@plone/volto/helpers', () => ({
  BodyClass: ({ children, className }) => (
    <div data-testid="body-class" data-classname={className}>
      {children}
    </div>
  ),
}));

jest.mock('@eeacms/search', () => ({
  SearchResultsApp: (props) => <div data-testid="search-results-app" />,
}));

jest.mock('./schema', () => ({
  searchResultsSchemaEnhancer: jest.fn((props) => ({
    fieldsets: [{ fields: [] }],
    properties: {},
  })),
}));

describe('SearchResultsView', () => {
  const defaultProps = {
    appName: 'testApp',
    mode: 'view',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render without crashing', () => {
    const { getByTestId } = render(<SearchResultsView {...defaultProps} />);
    expect(getByTestId('body-class')).toBeInTheDocument();
    expect(getByTestId('search-results-app')).toBeInTheDocument();
  });

  it('should render with correct body class', () => {
    const { getByTestId } = render(<SearchResultsView {...defaultProps} />);
    expect(getByTestId('body-class')).toHaveAttribute(
      'data-classname',
      'testApp-view searchlib-page',
    );
  });

  it('should not render overlay in view mode', () => {
    const { container } = render(
      <SearchResultsView {...defaultProps} mode="view" />,
    );
    expect(
      container.querySelector('.searchlib-edit-overlay'),
    ).not.toBeInTheDocument();
  });

  it('should render overlay in edit mode', () => {
    const { container } = render(
      <SearchResultsView {...defaultProps} mode="edit" />,
    );
    expect(
      container.querySelector('.searchlib-edit-overlay'),
    ).toBeInTheDocument();
  });

  describe('schemaEnhancer', () => {
    it('should call searchResultsSchemaEnhancer', () => {
      const { searchResultsSchemaEnhancer } = require('./schema');
      const mockProps = {
        schema: {
          fieldsets: [{ fields: [] }],
          properties: {},
        },
      };

      const result = SearchResultsView.schemaEnhancer(mockProps);

      expect(searchResultsSchemaEnhancer).toHaveBeenCalledWith(mockProps);
      expect(result).toEqual({
        fieldsets: [{ fields: [] }],
        properties: {},
      });
    });
  });
});
