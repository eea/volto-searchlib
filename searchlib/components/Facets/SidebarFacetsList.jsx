import React from 'react';
import { Sidebar, Button } from 'semantic-ui-react';
import { useSearchContext, useOutsideClick } from '@eeacms/search/lib/hocs';
import FacetResolver from './FacetResolver';

export default function SidebarFacetsList(props) {
  const {
    onClose,
    open,
    facets,
    // applySearch,
    // isLiveSearch,
    // setIsLiveSearch,
  } = props;
  const nodeRef = React.useRef(null);

  useOutsideClick(nodeRef, onClose);
  const searchContext = useSearchContext();

  return (
    <div ref={nodeRef}>
      <Sidebar
        visible={open}
        animation="overlay"
        icon="labeled"
        width="wide"
        direction="right"
      >
        <div className="sidebar-wrapper">
          <div className="sidebar-content">
            <div className="sidebar-header">
              <h3>Filters</h3>
              <Button
                basic
                className="clear-btn"
                content="Clear all"
                onClick={() => {
                  searchContext.resetFilters();
                }}
              />
            </div>
            {facets.map((facetInfo, i) => (
              <FacetResolver
                key={i}
                {...searchContext}
                {...facetInfo}
                wrapper="AccordionFacetWrapper"
              />
            ))}
          </div>
          {/* <div className="sidebar-footer">
            {!isLiveSearch && <Button onClick={applySearch}>Apply</Button>}
            <Radio
              toggle
              label="Live search"
              checked={isLiveSearch}
              onChange={(e, { checked }) => setIsLiveSearch(checked)}
            />
          </div> */}
        </div>
      </Sidebar>
    </div>
  );
}
