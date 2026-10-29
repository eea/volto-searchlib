import React from 'react';
import HistogramFacetComponent from './HistogramFacetComponent';

const ModalHistogramFacet = (props) => {
  const { title } = props;

  const { HeaderWrapper = 'div', ContentWrapper = 'div' } = props;

  return (
    <>
      <HeaderWrapper>
        <div className="fixedrange__facet__header">
          <div className="facet-title">
            <h3>{title}</h3>
          </div>
        </div>
      </HeaderWrapper>
      <ContentWrapper>
        <HistogramFacetComponent {...props} />
      </ContentWrapper>
    </>
  );
};

export default ModalHistogramFacet;
