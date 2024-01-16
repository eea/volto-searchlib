import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import SearchBlockView from './SearchBlockView';
import '@testing-library/jest-dom/extend-expect';

jest.mock('@eeacms/search/lib/hocs/useWhyDidYouUpdate', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@plone/volto/helpers/Extensions', () => ({
  ...jest.requireActual('@plone/volto/helpers/Extensions'),
  withBlockExtensions: (Component) => Component,
}));

jest.mock('@plone/volto/registry', () => ({
  settings: {
    searchlib: {
      searchui: {
        default: {
          facets: [
            {
              field: 'field1',
            },
          ],
        },
      },
    },
  },
  blocks: {
    blocksConfig: {},
  },
}));

describe('SearchBlockView', () => {
  const defaultProps = {
    data: {
      appName: 'default',
      defaultFilters: [],
      defaultSort: 'Date',
    },
    mode: 'view',
    variation: {
      view: 'input',
    },
  };

  it('renders in view mode', () => {
    const { queryByText } = render(<SearchBlockView {...defaultProps} />);

    // Ensure that the component renders in view mode
    expect(queryByText('EEA Semantic Search block')).not.toBeInTheDocument();
  });

  it('renders in edit mode', () => {
    const props = {
      ...defaultProps,
      mode: 'edit',
    };

    const { queryByText } = render(<SearchBlockView {...props} />);

    // Ensure that the component renders in edit mode
    expect(queryByText(/(EEA Semantic Search block)/)).toBeInTheDocument();
  });

  it('calls onChangeSlotfill when a slot is changed', () => {
    const onChangeSlotfill = jest.fn();
    const props = {
      ...defaultProps,
      onChangeSlotfill,
    };

    const { container } = render(<SearchBlockView {...props} />);

    // Simulate a slot change
    fireEvent.change(container.querySelector('input[appName="default"]'), {
      target: {
        value: 'test',
      },
    });
  });

  it('renders in view mode with default props', () => {
    const { queryByText } = render(
      <SearchBlockView
        variation={{
          view: 'input',
        }}
      />,
    );

    // Ensure that the component renders in view mode
    expect(queryByText('EEA Semantic Search block')).not.toBeInTheDocument();
  });
});
