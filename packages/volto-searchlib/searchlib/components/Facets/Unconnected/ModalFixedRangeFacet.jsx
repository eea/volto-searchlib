import React from 'react';
import { Card } from 'semantic-ui-react'; // , Header, Image
// import { useAppConfig } from '@eeacms/search/lib/hocs';

import cx from 'classnames';

function getFilterValueDisplay(filterValue) {
  if (filterValue === undefined || filterValue === null) return '';
  if (filterValue.hasOwnProperty('name')) return filterValue.name;
  return String(filterValue);
}

const FacetOptions = (props) => {
  const { options, onSelect, onRemove } = props;
  return (
    <div className="sui-multi-checkbox-facet">
      <Card.Group
      // itemsPerRow={5}
      >
        {options.map((option) => {
          const checked = option.selected;
          return (
            <Card
              key={`${getFilterValueDisplay(option.value)}`}
              onClick={() =>
                //              checked ? onRemove(option.value) : onSelect(option.value)
                options.forEach((opt) => {
                  if (opt.value.name === option.value.name) {
                    onSelect(opt.value);
                  } else {
                    onRemove(opt.value);
                  }
                })
              }
              className={cx('term', { active: checked })}
            >
              <Card.Content>
                <Card.Header>{getFilterValueDisplay(option.value)}</Card.Header>
              </Card.Content>
              <Card.Content extra>
                <span className="count">
                  ({option.count.toLocaleString('en')})
                </span>
              </Card.Content>
            </Card>
          );
        })}
      </Card.Group>
    </div>
  );
};

const ViewComponent = (props) => {
  const {
    label,
    onRemove,
    onSelect,
    options,
    facets,
    // field,
    HeaderWrapper = 'div',
    ContentWrapper = 'div',
    // title,
  } = props;
  // const { appConfig } = useAppConfig();
  // const facetConfig = appConfig.facets.find((f) => (f.id || f.field) === field);
  return (
    <>
      <HeaderWrapper>
        <div className="fixedrange__facet__header">
          {/*<div className="facet-title">
            <h3>{title || label}</h3>
          </div>*/}
        </div>
      </HeaderWrapper>
      <ContentWrapper>
        {options.length < 1 && <div>No matching options</div>}

        <FacetOptions
          options={options}
          label={label}
          facets={facets}
          onSelect={onSelect}
          onRemove={onRemove}
        />
      </ContentWrapper>
    </>
  );
};

const ModalFixedRangeFacetComponent = (props) => {
  return <ViewComponent {...props} />;
};

export default ModalFixedRangeFacetComponent;
