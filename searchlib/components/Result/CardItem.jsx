import React from 'react';
import { useAppConfig } from '@eeacms/search/lib/hocs';
import ExternalLink from './ExternalLink';

// The visualisation card of the Listing Block (volto-listing-block): content
// type above the title, publishing date below it, then the preview image.
const ELEMENTS_ORDER = [
  'contentType',
  'title',
  'date',
  'benchmark',
  'description',
  'image',
  'tags',
  'cta',
];

// Search results show the title, content type, date, preview and source;
// title and preview link to the result.
const itemModel = {
  '@type': 'card',
  imagePosition: 'top',
  elementsOrder: ELEMENTS_ORDER,
  hasMetaType: true,
  hasDate: true,
  maxTitle: 4,
  hasDescription: false,
  hasTags: false,
  hasLabel: false,
  hasBenchmarkLevel: false,
  enableCTAPopup: false,
  callToAction: { enable: false },
};

const CardItem = ({ result }) => {
  const { registry } = useAppConfig();
  const UniversalCard = registry.resolve.UniversalCard.component;
  const metaTypes = Array.isArray(result.metaTypes)
    ? result.metaTypes
    : [result.metaTypes];
  const source =
    result.href.replace(/^https?:\/\//, '').split('/')[0] || result.source;

  const item = {
    '@id': result.href,
    title: result.title,
    type_title: metaTypes.filter(Boolean).join(', ') || 'Other',
    EffectiveDate: result.issued?.toISO() || undefined,
  };

  return (
    <UniversalCard
      item={item}
      itemModel={itemModel}
      head_title={
        source && (
          <>
            Source: <ExternalLink href={result.href}>{source}</ExternalLink>
          </>
        )
      }
      // An empty preview uses the shared placeholder.
      preview_image_url={result.hasImage ? result.thumbUrl || '' : ''}
    />
  );
};

export default CardItem;
