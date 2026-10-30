import React, { useEffect } from 'react';
import { render } from '@testing-library/react';
import { Provider, useSetAtom, atom } from 'jotai';
import TopFilterLayout from './TopFilterLayout';
import '@testing-library/jest-dom';

const mockIsLandingPageAtom = atom(false);
const mockLoadingAtom = atom(false);
const mockIsLoadingSummaryAtom = atom(false);

jest.mock(
  '@eeacms/search/state',
  () => ({
    get isLandingPageAtom() {
      return mockIsLandingPageAtom;
    },
    loadingFamily: () => mockLoadingAtom,
  }),
  { virtual: true },
);

jest.mock(
  '@eeacms/search/lib/hocs/useSearchAssist',
  () => ({
    get isLoadingSummaryAtom() {
      return mockIsLoadingSummaryAtom;
    },
  }),
  { virtual: true },
);

describe('TopFilterLayout', () => {
  const appConfig = {
    appName: 'test-app',
    onlyLandingPage: false,
    enableChatbotAnswer: true,
  };

  const SetAtoms = ({ isLoading, isLoadingSummary }) => {
    const setLoading = useSetAtom(mockLoadingAtom);
    const setIsLoadingSummary = useSetAtom(mockIsLoadingSummaryAtom);

    useEffect(() => {
      setLoading(isLoading);
      setIsLoadingSummary(isLoadingSummary);
    }, [isLoading, isLoadingSummary, setLoading, setIsLoadingSummary]);

    return null;
  };

  const renderLayout = ({ isLoading, isLoadingSummary }) =>
    render(
      <Provider>
        <SetAtoms isLoading={isLoading} isLoadingSummary={isLoadingSummary} />
        <TopFilterLayout
          appConfig={appConfig}
          header={<div>header</div>}
          bodyHeader={<div>body-header</div>}
          bodyContent={<div>body-content</div>}
          bodyFooter={<div>body-footer</div>}
          sideContent={<div>side-content</div>}
        />
      </Provider>,
    );

  it('shows the page dimmer while the search results are loading', () => {
    const { container } = renderLayout({
      isLoading: true,
      isLoadingSummary: false,
    });

    expect(container.querySelector('.ui.dimmer.active')).toBeInTheDocument();
  });

  it('does not show the page dimmer while only the AI summary is loading', () => {
    const { container } = renderLayout({
      isLoading: false,
      isLoadingSummary: true,
    });

    expect(
      container.querySelector('.ui.dimmer.active'),
    ).not.toBeInTheDocument();
    // The results themselves must stay visible.
    expect(container.querySelector('.body-content')).toBeVisible();
  });
});
