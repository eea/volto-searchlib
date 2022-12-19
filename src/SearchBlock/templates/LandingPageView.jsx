import React from 'react';
import { LandingPageApp } from '@eeacms/search';

function LandingPageView(props) {
  return <LandingPageApp {...props} />;
}

LandingPageView.schemaEnhancer = ({ schema }) => {
  schema.fieldsets[0].fields.push('url');
  schema.properties.url = {
    title: 'Results page',
    widget: 'url',
  };

  return schema;
};

export default LandingPageView;
