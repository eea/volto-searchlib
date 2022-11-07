import React from 'react';
import { useAppConfig } from '@eeacms/search/lib/hocs';
import { Component } from '@eeacms/search/components';
import { useSearchContext } from '@eeacms/search/lib/hocs';
import { Modal, Button, Icon, Card } from 'semantic-ui-react';
import { useAtom } from 'jotai';
import { visibleFacetsAtom } from './state';

const Facet = ({
  info,
  defaultWrapper,
  filters,
  selectedFilters,
  visibleFacets,
}) => {
  const { factory, wrapper } = info;

  // const facet = registry.resolve[factory];
  const FacetWrapperComponent = wrapper ? Component : defaultWrapper;
  const props = {
    ...info,
    ...info.params,
    // ...facet,
  };
  const { field } = info;
  const Facet = React.useCallback(
    (props) => <Component factoryName={factory} {...props} field={field} />,
    [factory, field],
  );

  return (
    <>
      {visibleFacets.map((filter, i) => {
        return info.field === filter ? (
          <FacetWrapperComponent
            {...props}
            factoryName={wrapper}
            field={info.field}
            view={Facet}
            key={i}
          />
        ) : null;
      })}
    </>
  );
};

const FacetsList = ({ view, defaultWrapper }) => {
  const { appConfig } = useAppConfig();
  const searchContext = useSearchContext();
  const ViewComponent = view || Component;
  const { facets = [] } = appConfig;
  const { filters = [], clearFilters } = searchContext;

  const facetValues = facets
    .filter((f) => !f.isFilter && f.showInFacetsList)
    .map((f) => f.field);
  const filterValues = filters
    .filter((f) => facetValues.includes(f.field))
    .map((f) => f.field);
  const alwaysVisibleFacets = facets
    .filter((f) => f.alwaysVisible)
    .map((f) => f.field);

  const [isOpened, setIsOpened] = React.useState();
  const [visibleFacets, setVisibleFacets] = useAtom(visibleFacetsAtom);
  const [selectFilters, setSelectFilters] = React.useState(visibleFacets);
  const { current: defaultValues } = React.useRef(filterValues);
  const { current: selectFiltersValues } = React.useRef(selectFilters);

  React.useEffect(() => {
    const allFilters = [...new Set([...defaultValues, ...selectFiltersValues])];
    setVisibleFacets(allFilters);
  }, [setVisibleFacets, selectFiltersValues, defaultValues]);

  return (
    <>
      <div className="facet-list-header">
        <h4>Filter Results</h4>
        <Button
          basic
          className="clear-btn"
          content="clear all filters"
          onClick={() => {
            searchContext.resetFilters();
            // const exclude = facets
            //   .filter((f) => f.isFilter)
            //   .map((f) => f.field);
            // clearFilters(exclude);
            // setVisibleFacets(alwaysVisibleFacets);
          }}
        />
      </div>

      <ViewComponent name="DefaultFacetsList">
        <>
          {facets
            .filter((f) => f.showInFacetsList)
            .map((info, i) => (
              <Facet
                info={info}
                filters={filters}
                visibleFacets={visibleFacets}
                key={i}
                defaultWrapper={defaultWrapper}
              />
            ))}
        </>

        <Modal
          className="filters-modal"
          onClose={() => setIsOpened(false)}
          onOpen={() => setIsOpened(true)}
          open={isOpened}
          trigger={<Button className="add-facet-btn">+ Add filters</Button>}
        >
          <Modal.Header>
            <h4>Add filters</h4>
          </Modal.Header>
          <Modal.Content>
            <div className="modal-content-section">
              <h5 className="modal-section-title">
                Active filters ({visibleFacets.length})
                <Button
                  basic
                  className="clear-btn"
                  content="clear all filters"
                  onClick={() => {
                    setSelectFilters(alwaysVisibleFacets);
                  }}
                />
              </h5>
              <div className="facets-wrapper">
                {facets
                  .filter((facet) => selectFilters.includes(facet.field))
                  .map((facet, i) => (
                    <Card
                      key={i}
                      header={
                        <div className="card-header">
                          <span className="text" title={facet.label}>
                            {facet.label}
                          </span>
                          {!facet.alwaysVisible && (
                            <Button
                              className="clear-filters"
                              size="mini"
                              onClick={() => {
                                let filterValuesBtn = selectFilters.filter(
                                  (l) => l !== facet.field,
                                );
                                setSelectFilters(filterValuesBtn);
                              }}
                            >
                              <Icon name="close" role="button" />
                            </Button>
                          )}
                        </div>
                      }
                      className="facet"
                      onClick={() => {}}
                    />
                  ))}
              </div>
            </div>
            <div className="modal-content-section">
              <h5 className="modal-section-title">Add more filters</h5>
              <div className="filter-buttons">
                {facets
                  .filter((facet) => facet.showInFacetsList)
                  .filter((facet) => !selectFilters.includes(facet.field))
                  .map((facet, i) => (
                    <Button
                      className="add-filter"
                      key={i}
                      onClick={() => {
                        setSelectFilters([...selectFilters, facet.field]);
                      }}
                    >
                      {facet.label}
                    </Button>
                  ))}
              </div>
            </div>
          </Modal.Content>
          <Modal.Actions>
            <Button
              content="Close"
              onClick={() => {
                setIsOpened(false);
              }}
            />
            <Button
              primary
              content="Apply"
              onClick={() => {
                const exclude = facets
                  .filter((f) => selectFilters.includes(f.field))
                  .map((f) => f.field);
                clearFilters(exclude);
                setVisibleFacets(selectFilters);
                setIsOpened(false);
              }}
            />
          </Modal.Actions>
        </Modal>
      </ViewComponent>
    </>
  );
};

export default FacetsList;
