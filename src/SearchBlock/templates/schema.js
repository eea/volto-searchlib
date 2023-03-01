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
      facet.activeFilterLabel || facet.label || facet.field,
    ]);

    schema.properties.value.facetName = data.name;
    schema.properties.value.appConfig = appConfig;
    schema.properties.value.appName = appName;
    schema.properties.value.registry = registry;

    return schema;
  };
};

export const searchResultsSchemaEnhancer = ({ schema, formData }) => {
  const { appConfig, registry, appName } = schema;

  schema.fieldsets.splice(1, 0, {
    id: 'searchResultsSettings',
    title: 'Search results settings',
    fields: [
      'defaultResultView',
      'alwaysSearchOnInitialLoad',
      'showFilters',
      'showFacets',
      'showSorting',
      'showClusters',
      'availableFacets',
      'defaultFacets',
      'defaultFilters',
      'defaultSort',
      'landingPageURL',
    ],
  });

  schema.properties = {
    ...schema.properties,

    alwaysSearchOnInitialLoad: {
      title: 'Autoload results',
      type: 'boolean',
      default: true,
      configPath: 'alwaysSearchOnInitialLoad',
    },
    showFilters: {
      title: 'Show active filters?',
      type: 'boolean',
      default: true,
      configPath: 'showFilters',
    },
    showFacets: {
      title: 'Show facets?',
      type: 'boolean',
      default: true,
      configPath: 'showFacets',
    },
    showClusters: {
      title: 'Show tab clusters?',
      type: 'boolean',
      default: true,
      configPath: 'showClusters',
    },
    showSorting: {
      title: 'Show sorting?',
      type: 'boolean',
      default: true,
      configPath: 'showSorting',
    },
    defaultFilters: {
      title: 'Pre-applied filters',
      widget: 'object_list',
      schema: FilterSchema({ formData }),
      schemaExtender: (schema) => schema,
    },
    availableFacets: {
      title: 'Available Facets',
      widget: 'array',
      choices: [],
    },
    defaultFacets: {
      title: 'Default Facets',
      widget: 'array',
      choices: [],
    },
    defaultSort: {
      title: 'Default sort',
      // widget: 'sort_widget',
      choices: [],
    },
    landingPageURL: {
      title: 'Landing page URL',
      widget: 'url',
      configPath: 'landingPageURL',
    },
  };

  if (appConfig) {
    const { resultViews } = appConfig;
    // console.log(appConfig);

    const availableFacets = appConfig.facets?.map(({ field, label }) => [
      field,
      label,
    ]);

    // if (appConfig.landingPageURL) {
    //   schema.properties.landingPageURL.default = appConfig.landingPageURL;
    // }

    schema.properties.availableFacets.choices = availableFacets;
    schema.properties.defaultFacets.choices = availableFacets;

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

    schema.properties.defaultSort = {
      ...schema.properties.defaultSort,
      appConfig,
      registry,
      appName,
      choices: appConfig.sortOptions.map((opt) => [
        `${opt.value}|${opt.direction}`,
        opt.name,
      ]),
    };
  }

  return schema;
};
