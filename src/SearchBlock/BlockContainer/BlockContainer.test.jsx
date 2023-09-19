import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import BlockContainer from './BlockContainer';

describe('BlockContainer', () => {
  const mockProps = {
    mode: 'view',
    block: 'someBlock',
    data: { '@type': 'someType' },
    selected: false,
    onChangeSlotfill: jest.fn(),
    onSelectSlotfill: jest.fn(),
    properties: {},
    metadata: {},
  };
  it('should render RenderBlocks when mode is "view" and data is present', () => {
    render(
      <MemoryRouter>
        <BlockContainer {...mockProps} />
      </MemoryRouter>,
    );
    expect(
      screen.getByText('Your specific text or element'),
    ).toBeInTheDocument();
  });
  it('should not render anything when mode is "view" and data is not present', () => {
    render(
      <MemoryRouter>
        <BlockContainer {...mockProps} data={null} />
      </MemoryRouter>,
    );
  });
  it('should render BlockEdit when mode is not "view" and data is present', () => {
    render(
      <MemoryRouter>
        <BlockContainer {...mockProps} mode="edit" />
      </MemoryRouter>,
    );
  });
  it('should render NewBlockAddButton when mode is not "view" and data is not present', () => {
    render(
      <MemoryRouter>
        <BlockContainer {...mockProps} mode="edit" data={null} />
      </MemoryRouter>,
    );
  });
});
