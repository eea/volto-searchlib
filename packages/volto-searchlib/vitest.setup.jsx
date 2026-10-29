import { vi } from 'vitest';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { blocksConfig } from '@plone/volto/config/Blocks';
import installSlate from '@plone/volto-slate/index';

global.jest = vi;

global.jest = {
  ...global.jest,
  advanceTimersByTime: vi.advanceTimersByTime.bind(vi),
};

var mockSemanticComponents = await vi.importActual('semantic-ui-react');
var mockComponents = await vi.importActual('@plone/volto/components');
var mockRegistry = await vi.importActual('@plone/volto/registry');
var config = mockRegistry.default;

config.blocks.blocksConfig = {
  ...blocksConfig,
  ...config.blocks.blocksConfig,
};

vi.doMock('semantic-ui-react', () => ({
  __esModule: true,
  ...mockSemanticComponents,
  Popup: ({ content, trigger }) => {
    return (
      <div className="popup">
        <div className="trigger">{trigger}</div>
        <div className="content">{content}</div>
      </div>
    );
  },
}));

vi.doMock('@plone/volto/components', () => {
  return {
    __esModule: true,
    ...mockComponents,
    SidebarPortal: ({ children }) => <div id="sidebar">{children}</div>,
  };
});

vi.doMock('@plone/volto/registry', () => ({
  ...mockRegistry,
  default: [installSlate].reduce((acc, apply) => apply(acc), config),
}));

const mockStore = configureStore([thunk]);

global.fetch = vi.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({}),
  }),
);

global.store = mockStore({
  intl: {
    locale: 'en',
    messages: {},
    formatMessage: vi.fn(),
  },
  content: {
    create: {},
    subrequests: [],
  },
  connected_data_parameters: {},
  screen: {
    page: {
      width: 768,
    },
  },
});

// Volto 19.5's test-setup-globals stubs localStorage with no-op mocks, which
// breaks the storage-backed AI summary toggle (searchlib/lib/aiSummaryToggle).
// Restore a functional in-memory implementation; this setup file runs after
// the Volto one, so the override wins.
const localStorageData = new Map();
vi.stubGlobal('localStorage', {
  getItem: (key) =>
    localStorageData.has(key) ? localStorageData.get(key) : null,
  setItem: (key, value) => localStorageData.set(key, String(value)),
  removeItem: (key) => localStorageData.delete(key),
  clear: () => localStorageData.clear(),
  key: (index) => Array.from(localStorageData.keys())[index] ?? null,
  get length() {
    return localStorageData.size;
  },
});
