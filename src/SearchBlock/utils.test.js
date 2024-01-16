import { applyBlockSettings } from './utils';

describe('applyBlockSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should cache and reuse the result for the same input', () => {
    const config = {
      searchui: {
        myApp: {
          someConfig: {},
        },
      },
    };
    const appName = 'myApp';
    const data = {
      field1: 'newValue1',
    };
    const schema = {
      properties: {
        field1: {
          configPath: 'someConfig.path1',
        },
      },
    };

    // Initial call
    const result1 = applyBlockSettings(config, appName, data, schema);

    // Second call with the same input
    const result2 = applyBlockSettings(config, appName, data, schema);

    // Verify that the results are the same, indicating caching
    expect(result1).toBe(result2);
  });

  it('should not cache results for different input', () => {
    const config = {
      searchui: {
        myApp: {
          someConfig: {},
          facets: [],
        },
      },
    };
    const appName = 'myApp';
    const data1 = {
      field1: 'newValue1',
    };
    const data2 = {
      field2: 'newValue2',
    };
    const schema = {
      properties: {
        field1: {
          configPath: 'someConfig.path1',
        },
      },
    };

    // Initial call with data1
    const result1 = applyBlockSettings(config, appName, data1, schema);

    // Second call with data2
    const result2 = applyBlockSettings(config, appName, data2, schema);

    // Verify that the results are different, indicating no caching
    expect(result1).not.toBe(result2);
  });

  it('should modify config based on schema and data', () => {
    const config = {
      searchui: {
        myApp: {
          someConfig: {},
          facets: [
            {
              field: 'facet1',
              showInFacetsList: false,
            },
            {
              field: 'facet2',
              showInFacetsList: true,
            },
            {
              field: 'facet3',
              showInFacetsList: true,
            },
          ],
          resultViews: [
            {
              id: 'view1',
              isDefault: false,
            },
          ],
          path1: 'value1',
        },
      },
    };
    const appName = 'myApp';
    const data = {
      field1: 'newValue1',
      field2: 'newValue2',
      defaultResultView: 'view1',
      availableFacets: ['facet1'],
      defaultFacets: ['facet2'],
      defaultFilters: [
        { name: 'filter1', value: 'filterValue1' },
        { name: 'filter1', value: undefined },
      ],
    };
    const schema = {
      properties: {
        field1: {
          configPath: 'someConfig.path1',
        },
        field2: {
          configPath: 'someConfig.path2',
        },
      },
    };

    const result = applyBlockSettings(config, appName, data, schema);

    // Verify that the config has been modified correctly
    expect(result).toEqual({
      searchui: {
        myApp: {
          path1: 'value1',
          facets: [
            {
              field: 'facet1',
              showInFacetsList: true,
              alwaysVisible: false,
            },
            {
              field: 'facet2',
              showInFacetsList: true,
              alwaysVisible: true,
            },
            {
              field: 'facet3',
              showInFacetsList: false,
              alwaysVisible: false,
            },
          ],
          resultViews: [
            {
              id: 'view1',
              isDefault: true,
            },
          ],
          someConfig: {
            path1: 'newValue1',
            path2: 'newValue2',
          },
        },
      },
    });
  });

  it('should modify config based on schema and data', () => {
    const config = {
      searchui: {
        myApp: {
          someConfig: {},
          facets: [
            {
              field: 'filter1',
              showInFacetsList: false,
            },
            {
              field: 'facet2',
              showInFacetsList: true,
            },
            {
              field: 'facet3',
              showInFacetsList: true,
            },
          ],
          resultViews: [
            {
              id: 'view1',
              isDefault: false,
            },
          ],
          path1: 'value1',
        },
      },
    };
    const appName = 'myApp';
    const data = {
      field1: 'newValue1',
      field2: 'newValue2',
      defaultResultView: 'view1',
      availableFacets: ['facet1'],
      defaultFacets: ['facet2'],
      defaultFilters: [
        { name: 'filter1', value: 'filterValue1' },
        { name: 'filter2', value: undefined },
      ],
    };
    const schema = {
      properties: {
        field1: {
          configPath: 'test.someConfig.path1',
        },
        field2: {
          configPath: 'someConfig.path2',
        },
      },
    };

    const result = applyBlockSettings(config, appName, data, schema);

    // Verify that the config has been modified correctly
    expect(result).toEqual({
      searchui: {
        myApp: {
          path1: 'value1',
          facets: [
            {
              field: 'filter1',
              default: 'filterValue1',
              showInFacetsList: false,
              alwaysVisible: false,
            },
            {
              field: 'facet2',
              showInFacetsList: true,
              alwaysVisible: true,
            },
            {
              field: 'facet3',
              showInFacetsList: false,
              alwaysVisible: false,
            },
          ],
          resultViews: [
            {
              id: 'view1',
              isDefault: true,
            },
          ],
          someConfig: {
            path2: 'newValue2',
          },
          test: {
            someConfig: {
              path1: 'newValue1',
            },
          },
        },
      },
    });
  });

  it('should handle modifyConfig functions', () => {
    const config = {
      searchui: {
        myApp: {
          someConfig: {},
          path1: 'value1',
        },
      },
    };
    const appName = 'myApp';
    const data = {
      field1: 'newValue1',
      field2: 'newValue2',
    };
    const schema = {
      properties: {
        field1: {
          modifyConfig: (settings, value) => {
            settings.someConfig.path1 = value;
          },
        },
        field2: {
          modifyConfig: (settings, value) => {
            settings.someConfig.path2 = value;
          },
        },
      },
    };

    const result = applyBlockSettings(config, appName, data, schema);

    // Verify that the config has been modified correctly
    expect(result).toEqual({
      searchui: {
        myApp: {
          path1: 'value1',
          someConfig: {
            path1: 'newValue1',
            path2: 'newValue2',
          },
        },
      },
    });
  });
});
