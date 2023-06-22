import React from 'react';
import { BodyClass } from '@plone/volto/helpers';
import { SearchResultsApp } from '@eeacms/search';
import { searchResultsSchemaEnhancer } from './schema';

export default function SearchResultsView(props) {
  const { appName, mode } = props;

  return (
    <BodyClass className={`${appName}-view searchlib-page`}>
      <div className="searchlib-block">
        {mode !== 'view' && <div className="searchlib-edit-overlay"></div>}
        <SearchResultsApp {...props} />
      </div>
    </BodyClass>
  );
}

SearchResultsView.schemaEnhancer = (props) => {
  const schema = searchResultsSchemaEnhancer(props);
  return schema;
};
