import React from 'react';
import { Button, Form } from 'semantic-ui-react';
import { withSearch } from '@elastic/react-search-ui';

const DownloadButton = ({ searchContext, appConfig }) => {
  const { searchTerm, filters } = searchContext;
  const {
    host = 'http://0.0.0.0:9200',
    // elastic_index,
    showDownloadButton,
    appName,
  } = appConfig;
  const es_url = new URL(host);
  // TODO: this hardcodes the _es router
  es_url.pathname = `_es/${appName}/_download`;
  return showDownloadButton ? (
    <Form action={es_url.href} method="post">
      <input
        type="hidden"
        name="query"
        value={JSON.stringify({ searchTerm, filters })}
      />
      <Button type="submit" className="download-btn">
        Download search results (CSV)
      </Button>
    </Form>
  ) : null;
};

export default withSearch((context) => ({ searchContext: context }))(
  DownloadButton,
);
