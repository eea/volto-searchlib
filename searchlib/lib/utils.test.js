import { default as installDemo } from './demo.js';
import registry from './registry';

describe('injectFactories', () => {
  it('recursively resolves and injects factories', () => {
    const demoRegistry = installDemo(registry);
    const config = demoRegistry.searchui.wise;
  });
});
