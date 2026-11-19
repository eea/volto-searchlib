import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import SearchBlockEdit from './SearchBlockEdit';
import '@testing-library/jest-dom';

vi.mock('@plone/volto/registry', () => ({
  default: {
    settings: {
      searchlib: {
        searchui: {
          default: {},
        },
      },
    },
  },
}));

vi.mock(
  '@eeacms/volto-eea-chatbot/ChatBlock/hocs/withOnyxData',
  () => {
    return { default: () => (Component) => Component };
  },
  { virtual: true },
);

vi.mock('./edit.less', () => ({}));

vi.mock('./hocs', () => ({
  useDebouncedStableData: vi.fn((data) => data),
}));

vi.mock('@plone/volto/components/manage/Sidebar/SidebarPortal', () => {
  return {
    default: vi.fn((props) => (
      <div>
        <div>Mocked SidebarPortal</div>
        {props.children}
      </div>
    )),
  };
});

vi.mock('@plone/volto/components/manage/Form/BlockDataForm', () => {
  return {
    default: vi.fn((props) => (
      <div>
        <div>Mocked BlockDataForm</div>
        <input id="mocked-blockDataForm" onChange={props.onChangeField} />
        {props.children}
      </div>
    )),
  };
});

vi.mock('./SearchBlockView', () => {
  return {
    default: vi.fn((props) => (
      <div>
        <div>Mocked SearchBlockView</div>
        <input id="mocked-searchBlockView" onChange={props.onChangeSlotfill} />
        <input id="mocked-searchBlockView2" onChange={props.onDeleteSlotfill} />
        {props.children}
      </div>
    )),
  };
});

describe('SearchBlockEdit', () => {
  const mockOnChangeBlock = vi.fn();
  const mockOnChangeField = vi.fn();

  it('renders the SearchBlockView component', () => {
    const { container } = render(
      <SearchBlockEdit
        onChangeBlock={mockOnChangeBlock}
        onChangeField={mockOnChangeField}
        block="someBlock"
        data={{ someData: 'data' }}
      />,
    );
    expect(screen.getByText('Mocked SearchBlockView')).toBeInTheDocument();
    expect(screen.getByText('Mocked SidebarPortal')).toBeInTheDocument();
    expect(screen.getByText('Mocked BlockDataForm')).toBeInTheDocument();

    expect(
      container.querySelector('#mocked-blockDataForm'),
    ).toBeInTheDocument();
    fireEvent.change(container.querySelector('#mocked-blockDataForm'), {
      target: { value: 'someValue' },
    });
    expect(
      container.querySelector('#mocked-searchBlockView'),
    ).toBeInTheDocument();
    fireEvent.change(container.querySelector('#mocked-searchBlockView'), {
      target: { value: 'someValue' },
    });
    expect(
      container.querySelector('#mocked-searchBlockView2'),
    ).toBeInTheDocument();
    fireEvent.change(container.querySelector('#mocked-searchBlockView2'), {
      target: { value: 'someValue' },
    });
  });
});
