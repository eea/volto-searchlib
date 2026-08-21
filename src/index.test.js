// Define __SERVER__ global before importing the module
import applyConfig from './index';
import '@testing-library/jest-dom';

global.__SERVER__ = false;

// Mock the registry
vi.mock('@eeacms/search', () => ({
  registry: {
    searchui: {
      default: {},
    },
  },
}));

// Mock code icon
vi.mock('@plone/volto/icons/code.svg', () => ({ default: 'code-icon' }));

// Mock the components
vi.mock('./SearchBlock/SearchBlockView', () => ({
  default: 'SearchBlockView',
}));
vi.mock('./SearchBlock/SearchBlockEdit', () => ({
  default: 'SearchBlockEdit',
}));
vi.mock('./SearchBlock/schema', () => ({
  SearchBlockSchema: { title: 'Search Block' },
}));
vi.mock('./SearchBlock/templates', () => ({
  FullView: Object.assign(() => null, { schemaEnhancer: vi.fn() }),
  SearchInputView: Object.assign(() => null, { schemaEnhancer: vi.fn() }),
  LandingPageView: Object.assign(() => null, { schemaEnhancer: vi.fn() }),
  SearchResultsView: Object.assign(() => null, { schemaEnhancer: vi.fn() }),
}));
vi.mock('./SearchBlock/widgets/FacetValueWidget', () => ({
  default: 'FacetValueWidget',
}));
vi.mock('./SearchBlock/widgets/SortWidget', () => ({ default: 'SortWidget' }));

describe('applyConfig', () => {
  let config;

  beforeEach(() => {
    config = {
      widgets: {
        widget: {},
      },
      settings: {
        expressMiddleware: [],
      },
      blocks: {
        blocksConfig: {},
      },
    };
  });

  it('should register FacetValueWidget', () => {
    const result = applyConfig(config);
    expect(result.widgets.widget.facet_value).toBe('FacetValueWidget');
  });

  it('should register SortWidget', () => {
    const result = applyConfig(config);
    expect(result.widgets.widget.sort_widget).toBe('SortWidget');
  });

  it('should set searchlib registry in settings', () => {
    const result = applyConfig(config);
    expect(result.settings.searchlib).toBeDefined();
  });

  it('should register searchlib block', () => {
    const result = applyConfig(config);
    expect(result.blocks.blocksConfig.searchlib).toBeDefined();
    expect(result.blocks.blocksConfig.searchlib.id).toBe('searchlib');
    expect(result.blocks.blocksConfig.searchlib.title).toBe(
      'EEA Semantic Search',
    );
  });

  it('should configure block with correct properties', () => {
    const result = applyConfig(config);
    const blockConfig = result.blocks.blocksConfig.searchlib;

    expect(blockConfig.group).toBe('common');
    expect(blockConfig.view).toBe('SearchBlockView');
    expect(blockConfig.edit).toBe('SearchBlockEdit');
    expect(blockConfig.restricted).toBe(false);
    expect(blockConfig.mostUsed).toBe(false);
    expect(blockConfig.blockHasOwnFocusManagement).toBe(true);
    expect(blockConfig.sidebarTab).toBe(1);
  });

  it('should configure variations', () => {
    const result = applyConfig(config);
    const variations = result.blocks.blocksConfig.searchlib.variations;

    expect(variations).toHaveLength(4);
    expect(variations[0].id).toBe('fullView');
    expect(variations[0].isDefault).toBe(true);
    expect(variations[1].id).toBe('searchInputOnly');
    expect(variations[2].id).toBe('landingPageOnly');
    expect(variations[3].id).toBe('searchResultsOnly');
  });

  it('should configure security settings', () => {
    const result = applyConfig(config);
    const security = result.blocks.blocksConfig.searchlib.security;

    expect(security.addPermission).toEqual([]);
    expect(security.view).toEqual([]);
  });

  it('should return the modified config', () => {
    const result = applyConfig(config);
    expect(result).toBe(config);
  });
});
