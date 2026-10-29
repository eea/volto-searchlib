import { SearchBlockSchema } from './schema';

describe('SearchBlockSchema', () => {
  it('should return default schema without formData', () => {
    const schema = SearchBlockSchema({});
    expect(schema.title).toBe('Searchlib Block');
    expect(schema.required).toEqual(['appName']);
  });

  it('should modify the config with valid JSON', () => {
    const schema = SearchBlockSchema({});
    const modifyConfig = schema.properties.customConfig.modifyConfig;
    const config = { existingKey: 'existingValue' };
    const data = '{"newKey": "newValue"}';

    modifyConfig(config, data);

    expect(config).toEqual({
      existingKey: 'existingValue',
      newKey: 'newValue',
    });
  });

  it('should not modify the config with invalid JSON', () => {
    const schema = SearchBlockSchema({});
    const modifyConfig = schema.properties.customConfig.modifyConfig;
    const config = { existingKey: 'existingValue' };
    const data = 'invalid JSON';

    modifyConfig(config, data);

    expect(config).toEqual({
      existingKey: 'existingValue',
    });
  });

  it('should overwrite existing keys in the config', () => {
    const schema = SearchBlockSchema({});
    const modifyConfig = schema.properties.customConfig.modifyConfig;
    const config = { keyToOverwrite: 'oldValue' };
    const data = '{"keyToOverwrite": "newValue"}';

    modifyConfig(config, data);

    expect(config).toEqual({
      keyToOverwrite: 'newValue',
    });
  });
});
