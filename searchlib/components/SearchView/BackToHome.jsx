import { Link } from 'react-router-dom';
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

  const resetSearch = (e) => {
    e.preventDefault();
    resetInteracted();
    searchContext.resetSearch({});
  };

  if (!wasInteracted) return null;

  return backToHome ? (
    backToHome.startsWith('/') ? (
      <Link to={backToHome} className="back-link">
        <Icon className="arrow left" />
        Back to search home
      </Link>
    ) : (
      <a href={backToHome} className="back-link">
        <Icon className="arrow left" />
        Back to search home
      </a>
    )
  ) : (
    <a
      className="back-link"
      as="a"
      onClick={resetSearch}
      onKeyDown={resetSearch}
      role="button"
      href="./"
    >
      <Icon className="arrow left" />
      Back to search home
    </a>
  );
}
