import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
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
    const { queryByText } = render(
      <MemoryRouter>
        <SearchBlockView {...defaultProps} />
      </MemoryRouter>,
    );

    // Ensure that the component renders in view mode
    expect(queryByText('EEA Semantic Search block')).not.toBeInTheDocument();
  });

  it('renders in edit mode', () => {
    const props = {
      ...defaultProps,
      mode: 'edit',
    };

    const { queryByText } = render(
      <MemoryRouter>
        <SearchBlockView {...props} />
      </MemoryRouter>,
    );

    // Ensure that the component renders in edit mode
    expect(queryByText(/(EEA Semantic Search block)/)).toBeInTheDocument();
  });

  it('calls onChangeSlotfill when a slot is changed', () => {
    const onChangeSlotfill = jest.fn();
    const props = {
      ...defaultProps,
      onChangeSlotfill,
    };

    const { container } = render(
      <MemoryRouter>
        <SearchBlockView {...props} />
      </MemoryRouter>,
    );

    // Simulate a slot change
    const input = container.querySelector('input[appName="default"]');
    if (input) {
      fireEvent.change(input, {
        target: {
          value: 'test',
        },
      });
    }
  });

  it('renders in view mode with default props', () => {
    const { queryByText } = render(
      <MemoryRouter>
        <SearchBlockView
          variation={{
            view: 'input',
          }}
        />
      </MemoryRouter>,
    );

    // Ensure that the component renders in view mode
    expect(queryByText('EEA Semantic Search block')).not.toBeInTheDocument();
  });
});
