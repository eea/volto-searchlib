import React from 'react';
import ReactDOM from 'react-dom';
import SearchApp from './SearchApp';

import registry from './registry';
import installDemo from './demo';

it('renders without crashing', () => {
  const demoRegistry = installDemo(registry);
  const div = document.createElement('div');
  ReactDOM.render(<SearchApp registry={demoRegistry} appName="wise" />, div);
  ReactDOM.unmountComponentAtNode(div);
});
