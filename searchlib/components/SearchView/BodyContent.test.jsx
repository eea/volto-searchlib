import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BodyContent } from './BodyContent';

let mockActiveViewId = 'card';
const ContentView = ({ children }) => (
  <div data-testid="content">{children}</div>
);
const CardItem = ({ result }) => <span>{result.id}</span>;
const mockRegistry = {
  resolve: {
    DefaultContentView: { component: ContentView },
    CardItem: { component: CardItem },
  },
};

jest.mock('@eeacms/search/lib/hocs', () => ({
  useViews: () => ({ activeViewId: mockActiveViewId }),
  useSearchContext: () => ({ results: [{ id: 'a' }, { id: 'b' }] }),
  useAppConfig: () => ({ registry: mockRegistry }),
}));

const appConfig = {
  showLandingPage: false,
  resultViews: [
    { id: 'card', factories: { view: 'Card.Group', item: 'CardItem' } },
    { id: 'broken', factories: { view: 'Card.Group', item: 'MissingItem' } },
  ],
};

describe('BodyContent', () => {
  it('renders the results with the item of the active view', () => {
    mockActiveViewId = 'card';
    const { getByTestId } = render(
      <BodyContent appConfig={appConfig} wasInteracted />,
    );
    expect(getByTestId('content')).toHaveTextContent('ab');
  });

  it('does not crash when the item component is not registered', () => {
    mockActiveViewId = 'broken';
    const { getByTestId } = render(
      <BodyContent appConfig={appConfig} wasInteracted />,
    );
    expect(getByTestId('content')).toBeEmptyDOMElement();
  });
});
