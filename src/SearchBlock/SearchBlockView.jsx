import React from 'react';
import config from '@plone/volto/registry';
import { SearchBlockSchema } from './schema';
import { withBlockExtensions } from '@plone/volto/helpers';
import { applyBlockSettings } from './utils';
import { isEqual } from 'lodash';

import './less/styles.less';

const useDebouncedStableData = (data, timeout = 100) => {
  const [stableData, setStableData] = React.useState(data);
  const timer = React.useRef();

  const isSameData = isEqual(stableData, data);

  React.useEffect(() => {
    if (timer.current) clearInterval(timer.current);

    timer.current = setTimeout(() => {
      if (!isSameData) setStableData(data);
    }, timeout);
    return () => timer.current && clearTimeout(timer.current);
  }, [data, isSameData, timeout]);

  return stableData;
};

function SearchBlockView(props) {
  const { data = {}, mode = 'view', variation } = props;
  const schema = React.useMemo(() => SearchBlockSchema({ formData: data }), [
    data,
  ]);
  const { appName = 'default' } = data;
  const stableData = useDebouncedStableData(data);

  const registry = React.useMemo(() => {
    const reg = applyBlockSettings(
      config.settings.searchlib,
      appName,
      stableData,
      schema,
    );
    reg.searchui[appName] = {
      ...reg.searchui[appName],
      requestParams: {
        ...(stableData.rawIndex
          ? {
              params: {
                index: stableData.rawIndex,
              },
            }
          : {}),
      },
    };
    return reg;
  }, [appName, stableData, schema]);

  const Variation = variation.view;

  return <Variation registry={registry} appName={appName} mode={mode} />;
}

export default withBlockExtensions(SearchBlockView);
