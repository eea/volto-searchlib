import React, { useEffect } from 'react';
import { render } from '@testing-library/react';
import { Provider, useSetAtom } from 'jotai';
import { loadingFamily } from '@eeacms/search/state';
import TopFilterLayout from './TopFilterLayout';
import '@testing-library/jest-dom';

describe('TopFilterLayout', () => {
  const appConfig = {
    appName: 'test-app',
    onlyLandingPage: false,
    enableChatbotAnswer: true,
  };

  // Drive the real state atoms instead of mocking the module: the component
  // reads `loadingFamily(appName)` and `isLandingPageAtom` from
  // @eeacms/search/state.
  const SetAtoms = ({ isLoading, isLoadingSummary }) => {
    const setLoading = useSetAtom(loadingFamily(appConfig.appName));

    useEffect(() => {
      setLoading(isLoading);
    }, [isLoading, isLoadingSummary, setLoading]);

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
