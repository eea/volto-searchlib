import React from 'react';
import { useAppConfig } from '@eeacms/search/lib/hocs';

const CardItem = ({ result }) => {
  const { registry } = useAppConfig();
  const UniversalCard = registry.resolve.UniversalCard.component;
  const metaTypes = Array.isArray(result.metaTypes)
    ? result.metaTypes
    : [result.metaTypes];

  const item = {
    '@id': result.href,
    title: result.title,
    type_title: metaTypes.filter(Boolean).join(', ') || 'Other',
    EffectiveDate: result.issued?.toISO() || undefined,
  };

  const itemModel = {
    '@type': 'visualizationCard',
    hasContentType: true,
    hasDate: true,
    maxTitle: 4,
    hasDescription: false,
    hasTags: false,
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
      // An empty preview uses the shared placeholder instead of the SOER endpoint.
      preview_image_url={result.hasImage ? result.thumbUrl || '' : ''}
    />
  );
};

export default CardItem;
