import React from 'react';
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

  React.useEffect(
    () => () => {
      console.log('unmount SRV');
    },
    [],
  );

  return (
    <BodyClass className={`${appName}-view searchlib-page`}>
      <div className="searchlib-block">
        {mode !== 'view' && (
          <div className="overlay" style={overlayStyle}></div>
        )}
        <SearchResultsApp {...props} />
        {props.children}
      </div>
    </BodyClass>
  );
}

function FilterSchema({ formData }) {
  return {
    title: 'Filter',
    fieldsets: [
      {
        id: 'default',
        title: 'Default',
        fields: ['name', 'value'],
      },
    ],
    properties: {
      name: {
        title: 'Filter',
        choices: [],
      },
      value: {
        title: 'Value',
        widget: 'facet_value',
      },
    },
    required: [],
  };
}

const setFacetWidgetProps = (appConfig, registry, appName) => {
  return (schema, data, intl) => {
    // Note: this is a hack, it's needed to be able to pass the computed
    // appConfig from the edit block. Hackish because the block schemaEnhancers
    // (and the ObjectWidget) aren't passed the whole available props

    schema.properties.name.choices = appConfig.facets.map((facet) => [
      facet.id || facet.field,
      facet.label || facet.field,
    ]);

    schema.properties.value.facetName = data.name;
    schema.properties.value.appConfig = appConfig;
    schema.properties.value.appName = appName;
    schema.properties.value.registry = registry;

    // console.log('setfacet', { schema, appConfig, data });
    return schema;
  };
};

SearchResultsView.schemaEnhancer = ({ schema, formData }) => {
  const { appConfig, registry, appName } = schema;

  schema.fieldsets[0].fields.unshift(
    'defaultResultView',
    'alwaysSearchOnInitialLoad',
    'showFilters',
    'defaultFilters',
    'defaultSort',
  );

  schema.properties = {
    ...schema.properties,

    alwaysSearchOnInitialLoad: {
      title: 'Autoload results',
      type: 'boolean',
      default: true,
      configPath: 'alwaysSearchOnInitialLoad',
    },
    showFilters: {
      title: 'Show filters?',
      type: 'boolean',
      default: true,
      configPath: 'showFilters',
    },
    defaultFilters: {
      title: 'Default filters',
      widget: 'object_list',
      schema: FilterSchema({ formData }),
      schemaExtender: (schema) => schema,
    },
    defaultSort: {
      title: 'Default sort',
      choices: [],
    },
  };

  if (appConfig) {
    const { resultViews } = appConfig;

    // fill in defaultResultView choices
    schema.properties.defaultResultView = {
      ...schema.properties.defaultResultView,
      choices: resultViews.map(({ id, title }) => [id, title]),
      default: resultViews.find(({ isDefault }) => isDefault).id,
    };
    const { schemaExtender } = schema.properties.defaultFilters;

    if (!schemaExtender.applied) {
      const extender = setFacetWidgetProps(appConfig, registry, appName);
      extender.applied = true;
      schema.properties.defaultFilters.schemaExtender = extender;
    }

    schema.properties.defaultSort.choices = appConfig.sortOptions.map((opt) => [
      `${opt.value}|${opt.direction}`,
      opt.name,
    ]);
  }

  return schema;
};
