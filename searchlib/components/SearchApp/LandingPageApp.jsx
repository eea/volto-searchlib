import React from 'react';
import BasicSearchApp from './BasicSearchApp';
import { useSearchDriver } from '@eeacms/search/lib/hocs';
import { stateToQueryString } from '@eeacms/search';

function BoostrapLandingPageView(props) {
  const { appConfig, registry, onSubmitSearch } = props;

  const InitialViewComponent =
    appConfig.initialView?.factory &&
    registry.resolve[appConfig.initialView.factory].component;

  const driver = useSearchDriver();
  const timerRef = React.useRef();

  React.useEffect(() => {
    function handler(state) {
      timerRef.current && clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        onSubmitSearch(stateToQueryString(state));
      }, 200);
    }

    if (driver && onSubmitSearch) {
      driver.subscriptions.push(handler);
    }

    return () => timerRef.current && clearTimeout(timerRef.current);
  }, [driver, onSubmitSearch]);

  return <InitialViewComponent {...props} />;
}

export default function LandingPageApp(props) {
  return (
    <BasicSearchApp
      {...props}
      uniqueId="landingPage"
      searchViewComponent={BoostrapLandingPageView}
    />
  );
}
