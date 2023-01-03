import React from 'react';
import { LandingPageApp } from '@eeacms/search';
import { useHistory } from 'react-router-dom';
import { flattenToAppURL } from '@plone/volto/helpers';

function LandingPageView(props) {
  const { registry, appName } = props;
  const appConfig = registry.searchui[appName];
  const url = flattenToAppURL(appConfig.url || '');
  const history = useHistory();

  return (
    <>
      <LandingPageApp
        {...props}
        onSubmitSearch={
          url
            ? (qs) => {
                // window.location = `${url}?${qs}`;
                history.push(`${url}?${qs}`);
              }
            : null
        }
      />
      {props.children}
    </>
  );
}

LandingPageView.schemaEnhancer = ({ schema }) => {
  schema.fieldsets[0].fields.push('url');
  schema.properties.url = {
    title: 'Results page',
    widget: 'url',
    configPath: 'url',
  };

  return schema;
};

export default LandingPageView;
