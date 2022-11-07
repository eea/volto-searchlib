import React from 'react';
import { useAtom } from 'jotai';
import { Button, Card, Dimmer, Icon, Sticky, Segment } from 'semantic-ui-react';

import { ModalFacetWrapper } from '@eeacms/search/components';
import { bodyContentRefAtom, showFacetsAsideAtom } from '@eeacms/search/state';
import {
  useWindowDimensions,
  useSearchContext,
  useAppConfig,
} from '@eeacms/search/lib/hocs';
import { hasAppliedCustomFilters } from '@eeacms/search/lib/utils';

import FacetsList from './FacetsList';
import MoreLikeThis from './Connected/MoreLikeThis';
import { ErrorBoundary } from '@elastic/react-search-ui';

const SmallScreenFacets = () => {
  const [active, setActive] = React.useState(false);
  //const [showFacets] = useAtom(showFacetsAsideAtom);

  return (
    <div>
      <Dimmer active={active} verticalAlign="top" page className="facet-dimmer">
        {active ? (
          <>
            <ErrorBoundary>
              <MoreLikeThis />
            </ErrorBoundary>
            <FacetsList
              defaultWraper={ModalFacetWrapper}
              view={({ children }) => (
                <Card.Group stackable itemsPerRow={1}>
                  {children}
                </Card.Group>
              )}
            />
          </>
        ) : (
          ''
        )}

        <Button.Group>
          <Button
            className="show-filters"
            toggle
            onClick={() => {
              setActive(false);
            }}
          >
            <Icon name="filter" />
            Hide Filters
          </Button>
        </Button.Group>
      </Dimmer>

      <Button.Group>
        <Button
          className="show-filters"
          toggle
          onClick={() => {
            setActive(true);
          }}
        >
          <Icon name="filter" />
          Filters
        </Button>
      </Button.Group>
    </div>
  );
};

const LargeScreenFacets = ({ isLoading }) => {
  const [bodyRef] = useAtom(bodyContentRefAtom);
  const [showFacets, setShowFacets] = useAtom(showFacetsAsideAtom);
  const { width } = useWindowDimensions();
  const isActive = width > 766;

  return (
    <Sticky context={bodyRef} active={isActive}>
      <Segment className="facetslist-wrapper" loading={isLoading}>
        {showFacets ? (
          <>
            <ErrorBoundary>
              <MoreLikeThis />
            </ErrorBoundary>
            <FacetsList
              defaultWraper={ModalFacetWrapper}
              view={({ children }) => (
                <Card.Group stackable itemsPerRow={1}>
                  {children}
                </Card.Group>
              )}
            />
          </>
        ) : (
          ''
        )}
        <Button
          className="show-filters"
          toggle
          active={showFacets}
          onClick={() => {
            setShowFacets(!showFacets);
          }}
        >
          <Icon name="filter" />
          {showFacets ? 'Hide filters' : 'Filters'}
        </Button>
      </Segment>
    </Sticky>
  );
};

const SMALL_SCREEN_SIZE = 766;

export default () => {
  const [, setShowFacets] = useAtom(showFacetsAsideAtom);
  const { appConfig } = useAppConfig();
  const { width } = useWindowDimensions();

  const isSmallScreen = width <= SMALL_SCREEN_SIZE;
  const searchContext = useSearchContext();
  const hasFilters =
    searchContext.filters.length > 0 &&
    hasAppliedCustomFilters(searchContext.filters, appConfig);

  React.useEffect(() => {
    if (hasFilters) setShowFacets(true);
  }, [hasFilters, setShowFacets]);

  return isSmallScreen ? (
    <SmallScreenFacets {...searchContext} />
  ) : (
    <LargeScreenFacets {...searchContext} />
  );
};
