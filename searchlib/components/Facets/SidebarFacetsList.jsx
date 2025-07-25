import React from 'react';
import { Sidebar, Button, Icon, Dimmer } from 'semantic-ui-react';
import {
  useSearchContext,
  useOutsideClick,
  useWindowDimensions,
} from '@eeacms/search/lib/hocs';
import FacetResolver from './FacetResolver';
import { defineMessages } from 'react-intl';
import { useIntl } from 'react-intl';

const messages = defineMessages({
  clearAll: {
    id: 'clear all',
    defaultMessage: 'clear all',
  },
  filters: {
    id: 'Filters',
    defaultMessage: 'Filters',
  },
});

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
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 768;

  useOutsideClick(nodeRef, onClose);
  const searchContext = useSearchContext();
  const intl = useIntl();
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
              <h3>{intl.formatMessage(messages.filters)}</h3>
              <Button
                basic
                className="clear-btn"
                content={intl.formatMessage(messages.clearAll)}
                onClick={() => {
                  searchContext.resetFilters();
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    searchContext.resetFilters();
                  }
                }}
              />

              <Button
                basic
                className="close-btn"
                onClick={() => {
                  onClose(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onClose(true);
                  }
                }}
              >
                <Icon name="close" />
              </Button>
            </div>
            {facets.map((facetInfo, i) => (
              <FacetResolver
                key={i}
                {...facetInfo}
                {...searchContext}
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
      {isSmallScreen && (
        <Dimmer active={open} verticalAlign="top" className="sidebar-dimmer" />
      )}
    </div>
  );
}
