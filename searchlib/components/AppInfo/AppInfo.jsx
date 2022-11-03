import React from 'react';
import getIndexInfo from '@eeacms/search/lib/getIndexInfo';
import { DateTime } from 'luxon';
import { useAtom } from 'jotai';
import { indexMetadataAtom, hasRequestAtom } from './state';

const getInfo = async (appConfig) => {
  const { elastic_index } = appConfig;

  if (elastic_index === '_all') return ''; // we don't support _all

  const info = await getIndexInfo(appConfig);

  if (info.error || info.detail) {
    // eslint-disable-next-line
    console.warn('Error in retrieving index info', info);
    return '';
  }

  try {
    const indexes = Object.keys(info);
    if (indexes.length < 1) return '';

    const creation_ts = info[indexes[0]].settings.index.creation_date;
    const dt = DateTime.fromMillis(parseInt(creation_ts));
    return dt.toLocaleString(DateTime.DATETIME_FULL);
  } catch {
    console.log('info', info);
    return '';
  }
};

function AppInfo({ appConfig, ...rest }) {
  const { app_name, app_version } = appConfig;
  const hostname = window.runtimeConfig?.HOSTNAME || 'localhost';

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
        setIndexMetadata(response || '');
      });
    }
  }, [appConfig, indexMetadata, setIndexMetadata, hasRequest, setHasRequest]);

  return (
    <div {...rest} className="sui-app-info">
      Application data last refreshed <strong>{indexMetadata}</strong>. Version
      info{' '}
      <strong>
        {app_name}:{app_version}
      </strong>{' '}
      on <strong>{hostname}</strong>.
    </div>
  );
}

export default AppInfo;
