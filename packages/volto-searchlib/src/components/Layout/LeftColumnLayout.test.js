import React from 'react';
import renderer from 'react-test-renderer';
import LeftColumnLayout from './LeftColumnLayout';

describe('LeftColumnLayout', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<LeftColumnLayout />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
