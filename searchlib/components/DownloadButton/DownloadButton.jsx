import React from 'react';
import { Button, Form } from 'semantic-ui-react';
import { withSearch } from '@elastic/react-search-ui';
import path from 'path';

const DownloadButton = (props) => {
  const { searchTerm, filters } = props.searchContext;
  const { host = 'http://0.0.0.0:9200', elastic_index } = props.appConfig;
  const es_url = new URL(host);
  es_url.pathname = path.join(elastic_index, '_download');
  return (
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
  );
};

export default withSearch((context) => ({ searchContext: context }))(
  DownloadButton,
);
