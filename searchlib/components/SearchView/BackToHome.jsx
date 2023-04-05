import React from 'react';
import { SearchContext as SUISearchContext } from '@elastic/react-search-ui';
import { useHistory } from 'react-router-dom';
import { Icon } from 'semantic-ui-react';

export default function BackToHome({
  appConfig,
  wasInteracted,
  searchContext,
  resetInteracted,
}) {
  const { landingPageURL } = appConfig;
  let backToHome = landingPageURL;
  const domain = typeof window !== 'undefined' ? window.location.host : null;

  if (landingPageURL && landingPageURL.startsWith('http')) {
    const url = new URL(landingPageURL);
    if (url.host === domain) {
      backToHome = url.pathname;
    }
  }
  const history = useHistory();

  const isLocal = backToHome && history.location.pathname === backToHome;
  const { driver } = React.useContext(SUISearchContext);

  const resetSearch = (e) => {
    driver.URLManager.history.replace(history.location.pathname);
    resetInteracted();
    searchContext.resetSearch({});
  };

  if (!wasInteracted) return null;

  return backToHome ? (
    backToHome.startsWith('/') ? (
      <a
        href={backToHome}
        className="back-link"
        onClick={() => {
          if (isLocal) {
            resetSearch();
          }
        }}
      >
        <Icon className="arrow left" />
        Back to search home
      </a>
    ) : (
      <a
        href={backToHome}
        className="back-link"
        onClick={() => {
          if (isLocal) {
            resetSearch();
          }
        }}
      >
        <Icon className="arrow left" />
        Back to search home
      </a>
    )
  ) : (
    <a
      className="back-link"
      as="a"
      onClick={(e) => {
        resetSearch();
        e.preventDefault();
      }}
      onKeyDown={(e) => {
        resetSearch();
        e.preventDefault();
      }}
      role="button"
      href="./"
    >
      <Icon className="arrow left" />
      Back to search home
    </a>
  );
}
