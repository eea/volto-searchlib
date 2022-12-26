import React from 'react';
import config from '@plone/volto/registry';
import { SearchBlockSchema } from './schema';
import { applySchemaEnhancer, withBlockExtensions } from '@plone/volto/helpers';
import { applyBlockSettings } from './utils';
import { useDebouncedStableData } from './hocs';
import useWhyDidYouUpdate from '@eeacms/search/lib/hocs/useWhyDidYouUpdate';

import './less/styles.less';

function SearchBlockView(props) {
  const { data = {}, mode = 'view', variation, children } = props;
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
      mode,
    };
    return reg;
  }, [appName, stableData, schema, mode]);

  const Variation = variation.view;

  useWhyDidYouUpdate('Variation', { Variation });

  // TODO: why the double rendering?

  return (
    <div>
      {mode !== 'view' && 'EEA Semantic Search block'}
      {JSON.stringify(data.defaultFilters)}
      <Variation
        registry={registry}
        appName={appName}
        mode={mode}
        defaultFilters={data.defaultFilters
          ?.map((f) => (f.value ? f.value : undefined))
          .filter((f) => !!f)}
      >
        {mode !== 'view' ? children : null}
      </Variation>
    </div>
  );
}

export default withBlockExtensions(SearchBlockView);
