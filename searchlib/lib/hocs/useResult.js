/**
 * A hoc that would automatically retrieve a document from ElasticSearch in
 * case there document doesn't already exist (as result)
 */

import React from 'react';
import { useAppConfig } from '@eeacms/search/lib/hocs';
import runRequest from '@eeacms/search/lib/runRequest';
import { useAtom, atom } from 'jotai';
import { atomFamily } from 'jotai/utils';

// TODO: should use atomWithDefault
const docFamily = atomFamily((docId) => atom());

// Copied here because of circular import issued
// import { buildResult } from '@eeacms/search/lib/search/state/results';
function buildResult(hit, config, registry, ...extras) {
  const Model = registry.resolve[config.resultItemModel.factory];
  return new Model(hit, config, ...extras);
}

export const useResult = (initial, id) => {
  const { appConfig, registry } = useAppConfig();

  const docAtom = docFamily(id);
  const [docData, setDocData] = useAtom(docAtom);

  React.useEffect(() => {
    let ignore = false;

    const doIt = async () => {
      const dest = new URL(appConfig.host);
      dest.pathname = `${appConfig.elastic_index}/_doc/${encodeURIComponent(
        id,
      )}`;
      const resp = await runRequest({}, appConfig, dest, 'get');
      const result = buildResult(resp.body, appConfig, registry);
      setDocData(result);
    };

    if (!ignore && !docData) {
      doIt();
    }
    return () => {
      ignore = true;
    };
  }, [appConfig, id, initial, docData, setDocData, registry]);

  return initial || docData;
};
