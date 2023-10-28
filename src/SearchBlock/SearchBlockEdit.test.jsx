import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import SearchBlockEdit from './SearchBlockEdit';
import '@testing-library/jest-dom/extend-expect';

jest.mock('@plone/volto/registry', () => ({
  settings: {
    searchlib: {
      searchui: {
        default: {},
      },
    },
  },
}));

jest.mock('./hocs', () => ({
  useDebouncedStableData: jest.fn((data) => data),
}));

jest.mock('@plone/volto/components', () => ({
  SidebarPortal: jest.fn((props) => (
    <div>
      <div>Mocked SidebarPortal</div>
      {props.children}
    </div>
  )),
  BlockDataForm: jest.fn((props) => (
    <div>
      <div>Mocked BlockDataForm</div>
      <input id="mocked-blockDataForm" onChange={props.onChangeField} />
      {props.children}
    </div>
  )),
}));

jest.mock('./SearchBlockView', () => {
  return jest.fn((props) => (
    <div>
      <div>Mocked SearchBlockView</div>
      <input id="mocked-searchBlockView" onChange={props.onChangeSlotfill} />
      <input id="mocked-searchBlockView2" onChange={props.onDeleteSlotfill} />
      {props.children}
    </div>
  ));
});

describe('SearchBlockEdit', () => {
  const mockOnChangeBlock = jest.fn();
  const mockOnChangeField = jest.fn();

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
