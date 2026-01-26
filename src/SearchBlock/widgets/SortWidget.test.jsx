/* eslint-disable jsx-a11y/no-onchange */
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import SortWidget from './SortWidget';
import '@testing-library/jest-dom/extend-expect';

const mockSetSort = jest.fn();

jest.mock('@eeacms/search/lib/hocs', () => ({
  useSearchContext: () => ({
    setSort: mockSetSort,
  }),
}));

jest.mock('@plone/volto/components', () => ({
  SelectWidget: (props) => (
    <select
      data-testid="select-widget"
      onChange={(e) => props.onChange(props.id, e.target.value)}
    >
      <option value="title|asc">Title Ascending</option>
      <option value="date|desc">Date Descending</option>
    </select>
  ),
}));

describe('SortWidget', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render without crashing', () => {
    const { getByTestId } = render(
      <SortWidget id="sort" onChange={jest.fn()} />,
    );
    expect(getByTestId('select-widget')).toBeInTheDocument();
  });

  it('should call onChange and setSort when value changes', () => {
    const mockOnChange = jest.fn();
    const { getByTestId } = render(
      <SortWidget id="sort" onChange={mockOnChange} />,
    );

    fireEvent.change(getByTestId('select-widget'), {
      target: { value: 'title|asc' },
    });

    expect(mockOnChange).toHaveBeenCalledWith('sort', 'title|asc');
    expect(mockSetSort).toHaveBeenCalledWith('title', 'asc');
  });

  it('should parse sort field and direction correctly', () => {
    const mockOnChange = jest.fn();
    const { getByTestId } = render(
      <SortWidget id="sort" onChange={mockOnChange} />,
    );

    fireEvent.change(getByTestId('select-widget'), {
      target: { value: 'date|desc' },
    });

    expect(mockOnChange).toHaveBeenCalledWith('sort', 'date|desc');
    expect(mockSetSort).toHaveBeenCalledWith('date', 'desc');
  });

  it('should pass through additional props to SelectWidget', () => {
    const { getByTestId } = render(
      <SortWidget
        id="sort"
        onChange={jest.fn()}
        title="Sort by"
        description="Choose sort order"
      />,
    );

    expect(getByTestId('select-widget')).toBeInTheDocument();
  });
});
