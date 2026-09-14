import React from 'react';
import { useAppConfig } from '@eeacms/search/lib/hocs';
import ExternalLink from './ExternalLink';
import ResultContext from './ResultContext';

const CardItem = ({ result, children }) => {
  const { registry } = useAppConfig();
  const UniversalCard = registry.resolve.UniversalCard.component;
  const metaTypes = Array.isArray(result.metaTypes)
    ? result.metaTypes
    : [result.metaTypes];
  const tags = Array.isArray(result.tags) ? result.tags : [result.tags];
  const source =
    result.href.replace(/^https?:\/\//, '').split('/')[0] || result.source;

  const item = {
    '@id': result.href,
    title: result.title,
    type_title: metaTypes.filter(Boolean).join(', ') || 'Other',
    EffectiveDate: result.issued?.toISO() || undefined,
    ExpirationDate: result.expires?.toISO() || undefined,
    Subject: tags.filter(Boolean),
  };

  const itemModel = {
    '@type': 'visualizationCard',
    hasContentType: true,
    hasDate: true,
    maxTitle: 4,
    hasDescription: true,
    hasTags: true,
    hasLabel: true,
    enableCTAPopup: false,
    callToAction: {
      enable: true,
      label: 'Read more',
    },
  };

  return (
    <UniversalCard
      item={item}
      itemModel={itemModel}
      description={children || <ResultContext result={result} />}
      head_title={
        source && (
          <>
            Source: <ExternalLink href={result.href}>{source}</ExternalLink>
          </>
        )
      }
      // An empty preview uses the shared placeholder instead of the SOER endpoint.
      preview_image_url={result.hasImage ? result.thumbUrl || '' : ''}
    />
  );
};

export default CardItem;
