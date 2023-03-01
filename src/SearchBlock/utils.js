import { cloneDeep, isEqual } from 'lodash';

/**
 * Reuse the schema to allow pinpointing in the config, to allow adjusting the
 * data based on the schema definition.
 *
 * There's two styles of pinpointing:
 *
 * - with `configPath` you can use a dotted path to the key name
 * - with `modifyConfig` you can write a function that can change the settings
 *
 */
const _applyBlockSettings = (config, appName, data, schema) => {
  // apply mutations inline to the config

  config = cloneDeep(config);
  // TODO: this has the side-effect that it mutates the global config
  // Viewing this block will also "fix" the global config for the middleware
  const settings = config.searchui[appName];
  Object.keys(data).forEach((fieldName) => {
    const field = schema.properties[fieldName];
    if (!field) return;
    const { configPath, modifyConfig } = field;
    if (modifyConfig) {
      modifyConfig(settings, data[fieldName]);
    } else if (!configPath) {
      return config;
    } else {
      const [key, ...bits] = configPath.split('.').reverse();
      bits.reverse();
      let branch = settings;
      bits.forEach((bit) => {
        if (Object.keys(branch).indexOf(bit) === -1) {
          branch[bit] = {};
        }
        branch = branch[bit];
      });
      // console.log('set', { branch, key, field: data[fieldName], fieldName });
      branch[key] = data[fieldName];
    }
  });

  if (data.defaultResultView) {
    settings.resultViews.forEach((view) => {
      view.isDefault = view.id === data.defaultResultView;
    });
  }

  // console.log(settings, data);
  const availableFacets = [
    ...(data.availableFacets || []),
    ...(data.defaultFacets || []),
  ];

  if (data.availableFacets) {
    settings.facets.forEach((f) => {
      f.showInFacetsList = availableFacets.indexOf(f.field) > -1 ? true : false;
    });
  }

  if (data.defaultFacets) {
    settings.facets.forEach((f) => {
      f.alwaysVisible = data.defaultFacets.indexOf(f.field) > -1 ? true : false;
    });
  }

  if (data.defaultFilters) {
    const filters = data.defaultFilters
      .map((f) => ({
        [f.name]: f.value ? f.value : { field: f.name, values: [] },
      }))
      .reduce((acc, cur) => ({ ...acc, ...cur }), {});
    settings.facets.forEach((f) => {
      if (filters[f.field]) {
        f.default = filters[f.field];
      }
    });
  }
  // console.log(data, settings);

  return config;
};

let _params, _cachedResult;

const cacheOnce = (func) => (config, appName, data, schema) => {
  // Because React uses object identity to recreate components, we try to
  // create a stable version of the "registry" by only producing it again if
  // the data has changed
  if (!_params || !isEqual(_params, { appName, data })) {
    _cachedResult = _applyBlockSettings(config, appName, data, schema);
    _params = { appName, data };
    // console.log('recomputed');
  }
  return _cachedResult;
};

export const applyBlockSettings = cacheOnce(_applyBlockSettings);
