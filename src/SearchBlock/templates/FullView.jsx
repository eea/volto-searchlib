import React from 'react';
import { BodyClass } from '@plone/volto/helpers';
import { SearchApp } from '@eeacms/search';

const overlayStyle = {
  position: 'absolute',
  width: '100%',
  height: '100%',
  zIndex: '100',
};

function FullView(props) {
  const { appName, mode } = props;

  // TODO: (about bodyclass) this is a hack, please solve it properly

  return (
    <BodyClass className={`${appName}-view searchlib-page`}>
      <div className="searchlib-block">
        {mode !== 'view' && (
          <div className="overlay" style={overlayStyle}></div>
        )}
        <SearchApp {...props} />
        {props.children}
      </div>
    </BodyClass>
  );
}

FullView.schemaEnhancer = ({ schema }) => {
  // schema.fieldsets[0].fields.unshift('defaultResultView');

  return schema;
};

export default FullView;
