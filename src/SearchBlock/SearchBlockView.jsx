import React from 'react';
import config from '@plone/volto/registry';
import { SearchBlockSchema } from './schema';
import { applySchemaEnhancer, withBlockExtensions } from '@plone/volto/helpers';
import { applyBlockSettings } from './utils';
import { useDebouncedStableData } from './hocs';
import useWhyDidYouUpdate from '@eeacms/search/lib/hocs/useWhyDidYouUpdate';

import './less/styles.less';

function SearchBlockView(props) {
  const { data = {}, mode = 'view', variation } = props;
  const { appName = 'default' } = data;
  const stableData = useDebouncedStableData(data);

  const schema = React.useMemo(() => {
    let schema = SearchBlockSchema({ formData: stableData });
    schema = applySchemaEnhancer({ schema, formData: stableData });
    return schema;
  }, [stableData]);

  const registry = React.useMemo(() => {
    // TODO: this has the effect that the appConfig is never stable if the
    // schema changes.
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

  useWhyDidYouUpdate('Variation', { Variation });

  return (
    <div>
      {mode !== 'view' && 'EEA Semantic Search block'}
      <Variation registry={registry} appName={appName} mode={mode} />
    </div>
  );
}

export default withBlockExtensions(SearchBlockView);
