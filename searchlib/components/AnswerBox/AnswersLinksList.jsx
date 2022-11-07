import React from 'react';
import cx from 'classnames';
import { Label } from 'semantic-ui-react'; //, Accordion

import ExternalLink from '@eeacms/search/components/Result/ExternalLink';
import { Icon, ResultSource } from '@eeacms/search/components'; //, StringList
import { buildResult } from '@eeacms/search/lib/search/state/results';
import { highlightUrl } from './utils';

export default ({ filtered, appConfig }) => {
  return filtered.map((item, i) => {
    const result = buildResult({ ...item, _source: item.source }, appConfig);
    const clusters = result.clusterInfo;

    return (
      <div key={i} className={cx({ primary: i === 0 })}>
        {Object.keys(clusters).map((cluster, index) => (
          <Icon
            key={index}
            family="Content types"
            {...clusters[cluster].icon}
          />
        ))}
        <ExternalLink href={highlightUrl(result.href, item.answer)}>
          {result.title}
        </ExternalLink>{' '}
        <ResultSource item={result} />
        {result.isNew && (
          <Label className="new-item" horizontal>
            New
          </Label>
        )}
        {result.isExpired && (
          <Label className="archived-item" horizontal>
            Archived
          </Label>
        )}
      </div>
    );
  });
};
