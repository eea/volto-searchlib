import React from 'react';
import { render } from '@testing-library/react';
import FullView from './FullView';
import '@testing-library/jest-dom/extend-expect';

jest.mock('@plone/volto/helpers', () => ({
  BodyClass: ({ children, className }) => (
    <div data-testid="body-class" data-classname={className}>
      {children}
    </div>
  ),
}));

jest.mock('@eeacms/search', () => ({
  SEARCH_STATES: [['default'], ['loading'], ['results']],
  SLOTS: ['top', 'bottom'],
  SearchApp: (props) => (
    <div data-testid="search-app">
      {props.top}
      {props.bottom}
    </div>
  ),
}));

jest.mock('./../BlockContainer', () => ({
  SlotEditor: ({ slot }) => <div data-testid={`slot-editor-${slot}`} />,
  BlockContainer: ({ block }) => (
    <div data-testid={`block-container-${block}`} />
  ),
}));

jest.mock('./schema', () => ({
  searchResultsSchemaEnhancer: jest.fn(() => ({
    fieldsets: [{ fields: [] }, { fields: [] }],
    properties: {},
  })),
}));

describe('FullView', () => {
  const defaultProps = {
    appName: 'testApp',
    mode: 'view',
    slotFills: {},
    onChangeSlotfill: jest.fn(),
    onDeleteSlotfill: jest.fn(),
    onSelectSlotfill: jest.fn(),
    selectedSlotFill: null,
    properties: {},
    metadata: {},
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render without crashing', () => {
    const { getByTestId } = render(<FullView {...defaultProps} />);
    expect(getByTestId('body-class')).toBeInTheDocument();
    expect(getByTestId('search-app')).toBeInTheDocument();
  });

  it('should render with correct body class', () => {
    const { getByTestId } = render(<FullView {...defaultProps} />);
    expect(getByTestId('body-class')).toHaveAttribute(
      'data-classname',
      'testApp-view searchlib-page',
    );
  });

  it('should not render overlay in view mode', () => {
    const { container } = render(<FullView {...defaultProps} mode="view" />);
    expect(
      container.querySelector('.searchlib-edit-overlay'),
    ).not.toBeInTheDocument();
  });

  it('should render overlay in edit mode', () => {
    const { container } = render(<FullView {...defaultProps} mode="edit" />);
    expect(
      container.querySelector('.searchlib-edit-overlay'),
    ).toBeInTheDocument();
  });

  it('should call onSelectSlotfill when overlay is clicked', () => {
    const mockOnSelectSlotfill = jest.fn();
    const { container } = render(
      <FullView
        {...defaultProps}
        mode="edit"
        onSelectSlotfill={mockOnSelectSlotfill}
      />,
    );

    const overlay = container.querySelector('.searchlib-edit-overlay');
    overlay.click();

    expect(mockOnSelectSlotfill).toHaveBeenCalledWith(null);
  });

  it('should render SlotEditors in edit mode', () => {
    const { getByTestId } = render(<FullView {...defaultProps} mode="edit" />);
    expect(getByTestId('slot-editor-top')).toBeInTheDocument();
    expect(getByTestId('slot-editor-bottom')).toBeInTheDocument();
  });

  describe('schemaEnhancer', () => {
    it('should enhance schema with showLandingPage and showDownloadButton', () => {
      const mockProps = {
        schema: {
          fieldsets: [{ fields: [] }, { fields: [] }],
          properties: {},
        },
      };

      const result = FullView.schemaEnhancer(mockProps);

      expect(result.fieldsets[1].fields).toContain('showLandingPage');
      expect(result.fieldsets[1].fields).toContain('showDownloadButton');
      expect(result.properties.showLandingPage).toEqual({
        title: 'Show intro statistics?',
        type: 'boolean',
        default: true,
        configPath: 'showLandingPage',
      });
      expect(result.properties.showDownloadButton).toEqual({
        title: 'Show download button?',
        type: 'boolean',
        default: false,
        configPath: 'showDownloadButton',
      });
    });
  });
});
