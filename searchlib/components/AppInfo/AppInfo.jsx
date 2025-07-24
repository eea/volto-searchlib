import React from 'react';
import getInfo from '@eeacms/search/lib/getIndexInfo';
import { useAtom } from 'jotai';
// import { DateTime } from 'luxon';
import { indexMetadataAtom, hasRequestAtom } from './state';

const formatDate = (date) => {
  return date.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short',
  });
};

function AppInfo({ appConfig, ...rest }) {
  const { app_name, app_version } = appConfig;
  // const hostname = window.runtimeConfig?.HOSTNAME || 'localhost';

  const [indexMetadata, setIndexMetadata] = useAtom(indexMetadataAtom);
  const [hasRequest, setHasRequest] = useAtom(hasRequestAtom);

  React.useEffect(() => {
    if (!hasRequest) {
      setHasRequest(true);
    } else {
      return;
    }
    if (!indexMetadata) {
      getInfo(appConfig).then((response) => {
        setIndexMetadata(response ? formatDate(response) : '');
      });
    }
  }, [appConfig, indexMetadata, setIndexMetadata, hasRequest, setHasRequest]);

  return (
    <div {...rest} className="sui-app-info">
      Application data last refreshed <strong>{indexMetadata}</strong>. Version
      info{' '}
      <strong>
        {app_name}:{app_version}
      </strong>
      .
    </div>
  );
}

export default AppInfo;
