/**
 * This is the display card for the "More like this" selection
 */

import React from 'react';
import { useAtom } from 'jotai';
import { moreLikeThisAtom } from '@eeacms/search/state';
import { DateTime, StringList, Icon } from '@eeacms/search/components';
import ExternalLink from '@eeacms/search/components/Result/ExternalLink';
import { Image, Button } from 'semantic-ui-react';
import { useResult } from '@eeacms/search/lib/hocs';

const MoreLikeThisEntry = (props) => {
  const { value, field, type, removeFilter } = props;
  const [result] = useAtom(moreLikeThisAtom);
  const item = useResult(result, value);

  return item ? (
    <div className="mlt-filter ui fluid card facet active">
      <div className="mlt-card content">
        <div className="header">
          <span className="text" title="More like this">
            More like this
          </span>
          <span className="clear-filters">
            <Button
              size="mini"
              onClick={(evt) => {
                evt.preventDefault();
                removeFilter(field, value, type);
              }}
            >
              Clear
            </Button>
          </span>
        </div>
        <Image
          className="img-thumbnail"
          src={item.thumbUrl}
          wrapped
          ui={false}
          fluid
          centered
          style={{ backgroundImage: `url('${item.thumbUrl}')` }}
          as={ExternalLink}
          href={item.href}
          target="_blank"
          rel="noreferrer"
        />
        <h4>
          <a href={item.href} target="_blank" rel="noreferrer">
            <Icon name="external" size="small" />
            {item.title}
          </a>
        </h4>
        <div className="meta">
          <DateTime format="DATE_MED" value={item.issued} />
          &nbsp;
          {Object.entries(item.clusterInfo).map(([clusterName, cluster]) => (
            <>
              <div key={clusterName}>
                <Icon family="Content types" name={cluster.icon.name} />
                <StringList value={cluster.content_types} />
              </div>
            </>
          ))}
        </div>
      </div>
    </div>
  ) : (
    ''
  );
};

export default MoreLikeThisEntry;
