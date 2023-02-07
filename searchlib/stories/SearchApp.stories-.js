import React from 'react';
import { SearchApp } from '@eeacms/search';
import config from '@eeacms/search/registry';
import installDemo from 'demo/src/demo';

import '@elastic/react-search-ui-views/lib/styles/styles.css';
import 'demo/src/semantic-ui.less';

const page = {
  title: 'Search UI/Demos',
  component: SearchApp,
  args: {
    appName: 'wise',
    elastic_index: 'esbootstrapdata-wise_latest',
    host: 'http://localhost:9200',
  },
  argTypes: {
    appName: {
      control: {
        type: 'select',
        options: ['wise', 'minimal'],
      },
    },
    debug: {
      control: {
        type: 'boolean',
      },
    },
  },
};
export default page;

const Template = (args) => {
  const registry = installDemo(config);
  registry.searchui[args.appName].host = args.host;
  registry.searchui[args.appName].elastic_index = args.elastic_index;
  return <SearchApp registry={registry} appName={args.appName} />;
};

export const Full = Template.bind({});
