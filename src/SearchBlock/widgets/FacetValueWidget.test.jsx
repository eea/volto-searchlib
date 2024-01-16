/* eslint-disable jsx-a11y/no-onchange */
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import FacetValueWidget from './FacetValueWidget';
import '@testing-library/jest-dom/extend-expect';

jest.mock('@eeacms/search', () => ({
  FacetApp: jest.fn((props) => (
    <div id="facetApp">
      <select
        name="exampleFacet"
        id="exampleFacet"
        onChange={(event) => props.onChange(event.value)}
      >
        <option value="option1">option1</option>
        <option value="option2">option2</option>
      </select>
    </div>
  )),
}));

describe('FacetValueWidget', () => {
  const facetName = 'exampleFacet';
  const value = ['option1', 'option2'];
  const onChange = jest.fn((id, newValue) => newValue);
  const id = 'facetId';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the FacetApp component with correct props', () => {
    const { container } = render(
      <FacetValueWidget
        facetName={facetName}
        value={value}
        onChange={onChange}
        id={id}
      />,
    );

    expect(container.querySelector('#facetApp')).toBeInTheDocument();
  });

  it('should call the onChange callback when the FacetApp component triggers a change', () => {
    const { container } = render(
      <FacetValueWidget
        facetName={facetName}
        value={value}
        onChange={onChange}
        id={id}
      />,
    );

    fireEvent.change(container.querySelector('#facetApp select'), {
      target: { value: 'option1' },
    });

    expect(onChange).toHaveBeenCalled();
    fireEvent.change(container.querySelector('#facetApp select'), {
      target: { value: 'option1' },
    });
    expect(onChange).toHaveBeenCalled();
  });

  it('should not call the onChange callback if the value remains unchanged', () => {
    render(
      <FacetValueWidget
        facetName={facetName}
        value={value}
        onChange={onChange}
        id={id}
      />,
    );

    expect(onChange).not.toHaveBeenCalled();
  });

  it('should not render when facetName prop is not provided', () => {
    const { container } = render(
      <FacetValueWidget value={value} onChange={onChange} id={id} />,
    );

    expect(container.firstChild).toBeNull();
  });
});
