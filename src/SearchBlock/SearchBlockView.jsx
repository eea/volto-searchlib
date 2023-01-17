import React from 'react';
import config from '@plone/volto/registry';
import { SearchBlockSchema } from './schema';
import { applySchemaEnhancer, withBlockExtensions } from '@plone/volto/helpers';
import { applyBlockSettings } from './utils';
import { useDebouncedStableData } from './hocs';
import useWhyDidYouUpdate from '@eeacms/search/lib/hocs/useWhyDidYouUpdate';

import './less/styles.less';

function SearchBlockView(props) {
  const {
    data = {},
    mode = 'view',
    variation,
    children,
    onChangeSlotfill,
    onDeleteSlotfill,
    onSelectSlotfill,
    selectedSlotFill,
    properties,
    metadata,
    location,
    path,
  } = props;
  const { appName = 'default' } = data;
  const blacklist = ['slotFills', 'defaultFilters', 'defaultSort'];

  const stableData = useDebouncedStableData(
    Object.assign(
      {},
      ...Object.keys(data)
        .filter((k) => blacklist.indexOf(k) === -1)
        .map((k) => ({ [k]: data[k] })),
    ),
  );

  const schema = React.useMemo(() => {
    let schema = SearchBlockSchema({ formData: stableData });
    schema = applySchemaEnhancer({ schema, formData: stableData });
    return schema;
  }, [stableData]);

  const registry = React.useMemo(() => {
    // TODO: this has the effect that the appConfig is never stable if the
    // schema changes, even if it's unrelated.
    // console.log('redo registry');
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

  useWhyDidYouUpdate('SearchBlockView', {
    registry,
    stableData,
    schema,
    mode,
    appName,
  });

  const key = `${location?.pathname || path}-${props.data?.appName}`;
  // console.log('render searchblockview', key);
  const Variation = variation.view;
  // React.useEffect(() => () => console.log('unmount SearchBlockView'), []);

  return (
    <div>
      {mode !== 'view' && 'EEA Semantic Search block'}
      {/* {JSON.stringify(data.defaultFilters)} */}
      <Variation
        key={key}
        slotFills={data.slotFills}
        registry={registry}
        appName={appName}
        mode={mode}
        defaultSort={data.defaultSort}
        defaultFilters={data.defaultFilters}
        onChangeSlotfill={onChangeSlotfill}
        onDeleteSlotfill={onDeleteSlotfill}
        onSelectSlotfill={onSelectSlotfill}
        selectedSlotFill={selectedSlotFill}
        properties={properties}
        metadata={metadata}
      >
        {mode !== 'view' ? children : null}
      </Variation>
    </div>
  );
}

export default withBlockExtensions(SearchBlockView);
