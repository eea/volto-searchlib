/**
 * A breadcrumb to show an enhanced URL path for a result
 */
import React from 'react';
import ExternalLink from '@eeacms/search/components/Result/ExternalLink';
import {
  SegmentedBreadcrumb,
  // DateTime
} from '@eeacms/search/components'; //, StringList
import { firstWords, getTermDisplayValue } from '@eeacms/search/lib/utils';
import { useAppConfig } from '@eeacms/search/lib/hocs';

const ResultSource = ({ item }) => {
  const { appConfig } = useAppConfig();
  const { vocab = {} } = appConfig;

  return (
    <div className="source">
      <span className="result-info-title">Source: </span>

      <ExternalLink href={item.href}>
        <strong title={item.source} className="source">
          {firstWords(
            getTermDisplayValue({
              vocab,
              field: 'cluster_name',
              term: item.source,
            }),
            8,
          )}
        </strong>
        <SegmentedBreadcrumb href={item.href} short={true} maxChars={40} />
      </ExternalLink>

      {/*<span className="answer__date">
        (<DateTime format="DATE_MED" value={item.issued} />)
      </span>*/}
    </div>
  );
};

export default ResultSource;
