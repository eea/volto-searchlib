import React from 'react';
import { Item } from 'semantic-ui-react';
import { useAppConfig } from '@eeacms/search/lib/hocs/appConfig';
import String from './String';
import { ResultHeader } from './ResultModal';

// needed because of weird use of component from react-search-ui
const Inner = (props) => {
  const { result } = props;
  const { appConfig } = useAppConfig();
  const { listingViewParams } = appConfig;
  // console.log('appConfig', listingViewParams);

  return (
    <Item>
      <Item.Content>
        <ResultHeader {...props} {...listingViewParams} appConfig={appConfig} />
        <Item.Extra>
          {listingViewParams?.extraFields?.map(({ field, label }, i) => (
            <div className="simple-item-extra" key={i}>
              <em>{label}:</em> <String val={result[field]?.raw} />
            </div>
          ))}
        </Item.Extra>
      </Item.Content>
    </Item>
  );
};

const ResultItem = (props) => {
  return <Inner {...props} />;
};

export default ResultItem;
