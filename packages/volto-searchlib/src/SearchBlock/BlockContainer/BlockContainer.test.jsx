import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import BlockContainer from './BlockContainer';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-intl-redux';
import '@testing-library/jest-dom';

const mockStore = configureStore();
let store;

vi.mock('@plone/volto/components/manage/Blocks/Block/Edit', () => ({
  __esModule: true,
  default: () => <div>Block Edit</div>,
}));

vi.mock('@plone/volto/components/theme/View/RenderBlocks', () => ({
  __esModule: true,
  default: () => <div>Render Blocks</div>,
}));

vi.mock('./NewBlockAddButton', () => ({
  __esModule: true,
  default: () => <div>New Block Add Button</div>,
}));

describe('BlockContainer', () => {
  const mockProps = {
    mode: 'view',
    block: 'someBlock',
    data: { '@type': 'someType' },
    selected: false,
    onChangeSlotfill: vi.fn(),
    onSelectSlotfill: vi.fn(),
    properties: {},
    metadata: {},
  };

  beforeEach(() => {
    vi.clearAllMocks();
    store = mockStore({
      intl: {
        locale: 'en',
        formatMessage: () => 'Select layout',
      },
    });
  });
  afterEach(() => {
    vi.clearAllMocks();
  });
  it('should render RenderBlocks when mode is "view" and data is present', () => {
    const { queryByText } = render(
      <Provider store={store}>
        <MemoryRouter>
          <BlockContainer {...mockProps} />
        </MemoryRouter>
      </Provider>,
    );
    expect(queryByText('Render Blocks')).toBeInTheDocument();
    expect(queryByText('Block Edit')).not.toBeInTheDocument();
    expect(queryByText('New Block Add Button')).not.toBeInTheDocument();
  });
  it('should not render anything when mode is "view" and data is not present', () => {
    const { queryByText } = render(
      <Provider store={store}>
        <MemoryRouter>
          <BlockContainer {...mockProps} data={null} />
        </MemoryRouter>
      </Provider>,
    );
    expect(queryByText('Render Blocks')).not.toBeInTheDocument();
    expect(queryByText('Block Edit')).not.toBeInTheDocument();
    expect(queryByText('New Block Add Button')).not.toBeInTheDocument();
  });
  it('should render BlockEdit when mode is not "view" and data is present', () => {
    const { queryByText } = render(
      <Provider store={store}>
        <MemoryRouter>
          <BlockContainer {...mockProps} mode="edit" />
        </MemoryRouter>
      </Provider>,
    );
    expect(queryByText('Block Edit')).toBeInTheDocument();
    expect(queryByText('Render Blocks')).not.toBeInTheDocument();
    expect(queryByText('New Block Add Button')).not.toBeInTheDocument();
  });
  it('should render NewBlockAddButton when mode is not "view" and data is not present', () => {
    const { queryByText } = render(
      <Provider store={store}>
        <MemoryRouter>
          <BlockContainer {...mockProps} mode="edit" data={null} />
        </MemoryRouter>
      </Provider>,
    );
    expect(queryByText('New Block Add Button')).toBeInTheDocument();
    expect(queryByText('Block Edit')).not.toBeInTheDocument();
    expect(queryByText('Render Blocks')).not.toBeInTheDocument();
  });
});
