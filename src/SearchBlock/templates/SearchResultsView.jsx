import { BodyClass } from '@plone/volto/helpers';
import { SearchResultsApp } from '@eeacms/search';

const overlayStyle = {
  position: 'absolute',
  width: '100%',
  height: '100%',
  zIndex: '100',
};

export default function SearchResultsView(props) {
  const { appName, mode } = props;

  return (
    <BodyClass className={`${appName}-view searchlib-page`}>
      <div className="searchlib-block">
        {mode !== 'view' && (
          <div className="overlay" style={overlayStyle}></div>
        )}
        <SearchResultsApp {...props} />
      </div>
    </BodyClass>
  );
}

SearchResultsView.schemaEnhancer = ({ schema }) => {
  schema.fieldsets[0].fields.unshift(
    'defaultResultView',
    'alwaysSearchOnInitialLoad',
    'showFilters',
  );
  schema.properties.alwaysSearchOnInitialLoad = {
    title: 'Autoload results',
    type: 'boolean',
    default: true,
    configPath: 'alwaysSearchOnInitialLoad',
  };
  schema.properties.showFilters = {
    title: 'Show filters?',
    type: 'boolean',
    default: true,
    configPath: 'showFilters',
  };

  return schema;
};
