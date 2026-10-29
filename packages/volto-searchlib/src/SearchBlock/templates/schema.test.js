import { searchResultsSchemaEnhancer } from './schema';

describe('searchResultsSchemaEnhancer', () => {
  it('should enhance the schema with appConfig data and set facet properties', () => {
    // Mock data for appConfig, registry, appName, and formData
    const mockAppConfig = {
      facets: [
        { field: 'facet1', label: 'Facet 1' },
        { field: 'facet2', label: 'Facet 2' },
      ],
      resultViews: [
        { id: 'view1', title: 'View 1', isDefault: false },
        { id: 'view2', title: 'View 2', isDefault: true },
      ],
      sortOptions: [
        { value: 'field1', direction: 'asc', name: 'Field 1 Asc' },
        { value: 'field2', direction: 'desc', name: 'Field 2 Desc' },
      ],
    };
    const mockRegistry = {};
    const mockAppName = 'testApp';
    const mockFormData = {};

    const schema = {
      appConfig: mockAppConfig,
      registry: mockRegistry,
      appName: mockAppName,
      properties: {
        name: {
          choices: [],
        },
        value: {
          facetName: '', // Initialize facetName property
          appConfig: null, // Initialize appConfig property
          appName: '', // Initialize appName property
          registry: null, // Initialize registry property
        },
      },
      fieldsets: [],
    };

    // Call the searchResultsSchemaEnhancer function
    const enhancedSchema = searchResultsSchemaEnhancer({
      schema,
      formData: mockFormData,
    });

    const data = {
      name: 'facet1',
    };

    // Assertions
    expect(
      enhancedSchema.properties.defaultFilters.schemaExtender,
    ).toBeDefined();
    expect(
      enhancedSchema.properties.defaultFilters.schemaExtender,
    ).toBeInstanceOf(Function);

    const modifiedSchema =
      enhancedSchema.properties.defaultFilters.schemaExtender(schema, data);

    // Assertions for setFacetWidgetProps
    expect(modifiedSchema.properties.name.choices).toEqual([
      ['facet1', 'Facet 1'],
      ['facet2', 'Facet 2'],
    ]);
    expect(modifiedSchema.properties.value.facetName).toBe('facet1');
    expect(modifiedSchema.properties.value.appConfig).toBe(mockAppConfig);
    expect(modifiedSchema.properties.value.appName).toBe(mockAppName);
    expect(modifiedSchema.properties.value.registry).toBe(mockRegistry);

    // Verify that defaultResultView choices are set based on appConfig
    expect(enhancedSchema.properties.defaultResultView.choices).toEqual([
      ['view1', 'View 1'],
      ['view2', 'View 2'],
    ]);
  });

  it('should enhance the schema with appConfig data and set facet properties', () => {
    const mockRegistry = {};
    const mockAppName = 'testApp';
    const mockFormData = {};

    // Create a mock schema object with the required properties
    const schema = {
      appConfig: undefined,
      registry: mockRegistry,
      appName: mockAppName,
      properties: {
        name: {
          choices: [],
        },
        value: {
          facetName: '', // Initialize facetName property
          appConfig: null, // Initialize appConfig property
          appName: '', // Initialize appName property
          registry: null, // Initialize registry property
        },
      },
      fieldsets: [],
    };

    // Call the searchResultsSchemaEnhancer function
    const enhancedSchema = searchResultsSchemaEnhancer({
      schema,
      formData: mockFormData,
    });

    // Assertions
    expect(
      enhancedSchema.properties.defaultFilters.schemaExtender,
    ).toBeDefined();
    expect(
      enhancedSchema.properties.defaultFilters.schemaExtender,
    ).toBeInstanceOf(Function);

    const modifiedSchema =
      enhancedSchema.properties.defaultFilters.schemaExtender(schema);

    // Assertions for setFacetWidgetProps
    expect(modifiedSchema.properties.name.choices).toEqual([]);
    expect(modifiedSchema.properties.value.facetName).toBe('');
    expect(modifiedSchema.properties.value.appConfig).toBe(null);
    expect(modifiedSchema.properties.value.appName).toBe('');
    expect(modifiedSchema.properties.value.registry).toBe(null);
  });

  it('should enhance the schema with appConfig data and set facet properties', () => {
    // Mock data for appConfig, registry, appName, and formData
    const mockAppConfig = {
      facets: [
        { field: 'facet1', label: 'Facet 1' },
        { field: 'facet2', label: 'Facet 2' },
      ],
      resultViews: [
        { id: 'view1', title: 'View 1', isDefault: false },
        { id: 'view2', title: 'View 2', isDefault: true },
      ],
      sortOptions: [
        { value: 'field1', direction: 'asc', name: 'Field 1 Asc' },
        { value: 'field2', direction: 'desc', name: 'Field 2 Desc' },
      ],
    };
    const mockRegistry = {};
    const mockAppName = 'testApp';
    const mockFormData = {};

    // Create a mock schema object with the required properties
    const schema = {
      appConfig: mockAppConfig,
      registry: mockRegistry,
      appName: mockAppName,
      properties: {
        name: {
          choices: [],
        },
        value: {
          facetName: '', // Initialize facetName property
          appConfig: null, // Initialize appConfig property
          appName: '', // Initialize appName property
          registry: null, // Initialize registry property
        },
        defaultFilters: {
          applied: true,
        },
      },
      fieldsets: [],
    };

    // Call the searchResultsSchemaEnhancer function
    const enhancedSchema = searchResultsSchemaEnhancer({
      schema,
      formData: mockFormData,
    });

    const data = {
      name: 'facet1',
    };

    // Assertions
    expect(
      enhancedSchema.properties.defaultFilters.schemaExtender,
    ).toBeDefined();
    expect(
      enhancedSchema.properties.defaultFilters.schemaExtender,
    ).toBeInstanceOf(Function);

    const modifiedSchema =
      enhancedSchema.properties.defaultFilters.schemaExtender(schema, data);

    expect(modifiedSchema.properties.name.choices).toEqual([
      ['facet1', 'Facet 1'],
      ['facet2', 'Facet 2'],
    ]);
    expect(modifiedSchema.properties.value.facetName).toBe('facet1');
    expect(modifiedSchema.properties.value.appConfig).toBe(mockAppConfig);
    expect(modifiedSchema.properties.value.appName).toBe(mockAppName);
    expect(modifiedSchema.properties.value.registry).toBe(mockRegistry);

    // Verify that defaultResultView choices are set based on appConfig
    expect(enhancedSchema.properties.defaultResultView.choices).toEqual([
      ['view1', 'View 1'],
      ['view2', 'View 2'],
    ]);
  });
});
