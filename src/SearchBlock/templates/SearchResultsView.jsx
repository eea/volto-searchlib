import React from 'react';
import { BodyClass } from '@plone/volto/helpers';
import { SearchResultsApp } from '@eeacms/search';
import { searchResultsSchemaEnhancer } from './schema';

export default function SearchResultsView(props) {
  const { appName, mode } = props;

  // const ref = React.useRef();
  // const { registry } = props;
  // React.useEffect(() => {
  //   ref.current = registry;
  // });
  // if (!(registry === ref.current))
  //   console.log('SearchResultsView not isSame', ref.current, registry);
  // React.useEffect(() => () => console.log('unmount SearchResultsView'), []);

  return (
    <BodyClass className={`${appName}-view searchlib-page`}>
      <div className="searchlib-block">
        {mode !== 'view' && <div className="searchlib-edit-overlay"></div>}
        <SearchResultsApp {...props} />
      </div>
    </BodyClass>
  );
}

SearchResultsView.schemaEnhancer = searchResultsSchemaEnhancer;
