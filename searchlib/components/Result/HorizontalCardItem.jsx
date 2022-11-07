import React from 'react';
import { Label } from 'semantic-ui-react';
import {
  SegmentedBreadcrumb,
  StringList,
  DateTime,
} from '@eeacms/search/components';
import { useAppConfig } from '@eeacms/search/lib/hocs';
import { firstWords, getTermDisplayValue } from '@eeacms/search/lib/utils';

import ExternalLink from './ExternalLink';
import ResultContext from './ResultContext';
import ContentClusters from './ContentClusters';

const ExtraContent = (props) => {
  const { result, vocab } = props;
  return (
    <div>
      <div className="result-bottom">
        <div className="result-info">
          <span className="result-info-title">Published: </span>
          <DateTime format="DATE_MED" value={result.issued} />
        </div>
        <div className="result-info">
          <span className="result-info-title">Topics: </span>
          <StringList value={result.tags} />
        </div>
      </div>
      <div>
        <div className="result-info">
          <span className="result-info-title">Source: </span>
          <ExternalLink href={result.href}>
            <strong title={result.source} className="source">
              {firstWords(
                getTermDisplayValue({
                  vocab,
                  field: 'cluster_name',
                  term: result.source,
                }),
                8,
              )}
            </strong>
            <SegmentedBreadcrumb
              href={result.href}
              short={true}
              maxChars={40}
            />
          </ExternalLink>
        </div>
      </div>
    </div>
  );
};

const HorizontalCardItem = (props) => {
  const { result } = props;
  const { appConfig, registry } = useAppConfig();
  const { vocab = {} } = appConfig;
  const clusters = result.clusterInfo;

  const UniversalCard = registry.resolve['UniversalCard'].component;

  const item = {
    title: (
      <>
        <ExternalLink href={result.href} title={result.title}>
          {result.title}
        </ExternalLink>
        {result.isNew && <Label className="new-item">New</Label>}
        {result.isExpired && <Label className="archived-item">Archived</Label>}
      </>
    ),
    meta: <ContentClusters clusters={clusters} item={result} />,
    description: props.children ? props.children : <ResultContext {...props} />,
    preview_image_url: result.hasImage ? result.thumbUrl : undefined,
    extra: <ExtraContent result={result} vocab={vocab} />,
  };

  const itemModel = {
    hasImage: result.hasImage,
    hasDescription: true,
    '@type': 'searchItem',
  };

  return <UniversalCard item={item} itemModel={itemModel} />;
};

export default HorizontalCardItem;

// import MoreLikeThisTrigger from './MoreLikeThisTrigger';
// const { width } = useWindowDimensions();
// const isSmallScreen = width < 1000;
// {/*{showControls && !isSmallScreen && (
//               <MoreLikeThisTrigger
//                 view={Button}
//                 className="mlt"
//                 compact
//                 color="green"
//                 size="mini"
//                 result={result}
//               >
//                 more like this
//               </MoreLikeThisTrigger>
//             )}*/}
//             {/*{showControls && isSmallScreen && (
//               <Dropdown icon="ellipsis vertical">
//                 <Dropdown.Menu className="mlt">
//                   <MoreLikeThisTrigger result={result} view={Dropdown.Item}>
//                     More like this
//                   </MoreLikeThisTrigger>
//                 </Dropdown.Menu>
//               </Dropdown>
//             )}*/}
