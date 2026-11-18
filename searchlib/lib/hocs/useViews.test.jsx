import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider, createStore } from 'jotai';
import useViews, {
  activeViewIdAtom,
  getActiveViewId,
  getDefaultViewId,
} from './useViews';

const mockAppConfig = { resultViews: [] };
jest.mock('./appConfig', () => ({
  useAppConfig: () => ({ appConfig: mockAppConfig }),
}));

const globalsearchViews = [
  { id: 'horizontalCard', isDefault: false },
  { id: 'card', isDefault: true },
  { id: 'compactListing', isDefault: false },
];

describe('getDefaultViewId', () => {
  it('uses the view marked as default', () => {
    expect(getDefaultViewId(globalsearchViews)).toBe('card');
  });

  it('falls back to the first view, then to listing', () => {
    expect(getDefaultViewId([{ id: 'table' }, { id: 'cards' }])).toBe('table');
    expect(getDefaultViewId([])).toBe('listing');
    expect(getDefaultViewId()).toBe('listing');
  });
});

describe('getActiveViewId', () => {
  it('keeps an active view of the app', () => {
    expect(getActiveViewId(globalsearchViews, 'horizontalCard')).toBe(
      'horizontalCard',
    );
  });

  it('uses the default view for a view of another app', () => {
    // e.g. after an in-app navigation from the datahub
    expect(getActiveViewId(globalsearchViews, 'datahubCards')).toBe('card');
    expect(getActiveViewId(globalsearchViews, 'listing')).toBe('card');
  });

  it('uses the default view without an active view', () => {
    expect(getActiveViewId(globalsearchViews, null)).toBe('card');
  });
});

const ActiveView = () => {
  const { activeViewId, defaultViewId } = useViews();
  return (
    <span data-testid="view">
      {activeViewId}|{defaultViewId}
    </span>
  );
};

const renderWithActiveView = (activeViewId) => {
  const store = createStore();
  store.set(activeViewIdAtom, activeViewId);
  return render(
    <Provider store={store}>
      <ActiveView />
    </Provider>,
  );
};

describe('useViews', () => {
  beforeEach(() => {
    mockAppConfig.resultViews = globalsearchViews;
  });

  it('ignores the active view left by another search app', () => {
    const { getByTestId } = renderWithActiveView('datahubCards');
    expect(getByTestId('view')).toHaveTextContent('card|card');
  });

  it('returns the active view of the app', () => {
    const { getByTestId } = renderWithActiveView('compactListing');
    expect(getByTestId('view')).toHaveTextContent('compactListing|card');
  });
});
