import React from 'react';
import config from '@plone/volto/registry';
import { SearchApp } from '@eeacms/search';
import { SearchBlockSchema } from './schema';
import { BodyClass } from '@plone/volto/helpers';
import { applyBlockSettings } from './utils';
import useWhyDidYouUpdate from '@eeacms/search/lib/hocs/useWhyDidYouUpdate';

// import '@elastic/react-search-ui-views/lib/styles/styles.css';
import './less/styles.less';

const overlayStyle = {
  position: 'absolute',
  width: '100%',
  height: '100%',
  zIndex: '100',
};

export default function SearchBlockView(props) {
  const { data = {}, mode = 'view' } = props;
  const schema = React.useMemo(() => SearchBlockSchema({ formData: data }), [
    data,
  ]);
  const { appName = 'default' } = data;
  const [stableData] = React.useState(data);
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

  useWhyDidYouUpdate('BlockView', { stableData });

  // TODO: this is a hack, please solve it properly

  return (
    <BodyClass className={`${appName}-view searchlib-page`}>
      <div className="searchlib-block">
        {mode !== 'view' ? (
          <div className="overlay" style={overlayStyle}></div>
        ) : (
          ''
        )}
        <SearchApp registry={registry} appName={appName} mode={mode} />
      </div>
    </BodyClass>
  );
}
