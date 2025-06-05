import React from 'react';
import { useSelector } from 'react-redux';
import {
  useAppConfig,
  useProxiedSearchContext,
  useSearchContext,
  useOutsideClick,
  useWindowDimensions,
  SearchContext,
} from '@eeacms/search/lib/hocs';
import { Facet as SUIFacet } from '@eeacms/search/components';
import { Dimmer, Modal, Button } from 'semantic-ui-react';
import { atomFamily } from 'jotai/utils';
import { useAtom, atom } from 'jotai';
import cx from 'classnames';
import { useIntl } from 'react-intl';

import ActiveFilters from '../ActiveFilters';

const SMALL_SCREEN_SIZE = 766;

const dropdownOpenFamily = atomFamily(
  (name) => atom(false),
  (a, b) => a === b,
);

const DropdownFacetWrapper = (props) => {
  const {
    field,
    label,
    title,
    removeFilter,
    sortedOptions,
    filterType,
    isLoading,
  } = props;
  const token = useSelector((state) => state.userSession.token);
  const rawSearchContext = useSearchContext();
  const { searchContext: facetSearchContext, applySearch } =
    useProxiedSearchContext(rawSearchContext);
  const { facets, filters } = facetSearchContext;

  const { appConfig } = useAppConfig();
  const facet = appConfig.facets?.find((f) => f.field === field);
  const fallback = filterType ? props.filterType : facet.filterType;

  const defaultValue = React.useMemo(
    () =>
      field
        ? filters?.find((f) => f.field === field)?.type || fallback
        : fallback,
    [field, filters, fallback],
  );

  const filtersCount = rawSearchContext.filters
    .filter((filter) => filter.field === field)
    .map((filter) => filter.values.length);
  const filterConfig = appConfig.facets.find(
    (f) => (f.id || f.field) === field,
  );

  const hideActiveFilters = facet.hideActiveFilters || false;
  const [defaultTypeValue] = (defaultValue || '').split(':');
  const [localFilterType, setLocalFilterType] =
    React.useState(defaultTypeValue);
  const dropdownAtom = dropdownOpenFamily(field);
  const [isOpen, setIsOpen] = useAtom(dropdownAtom);
  const nodeRef = React.useRef();
  const { width } = useWindowDimensions();
  const isSmallScreen = width < SMALL_SCREEN_SIZE;

  const intl = useIntl();
  const labelPrint =
    typeof label === 'object' ? intl.formatMessage(label) : label;

  useOutsideClick(nodeRef, () => setIsOpen(false));

  React.useEffect(() => {
    if (defaultValue !== localFilterType) {
      setLocalFilterType(defaultValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValue]);

  if (facets[field] === undefined) return null;
  if (facet?.authOnly && token === undefined) return null;

  return (
    <>
      <div className="dropdown-facet">
        {isSmallScreen ? (
          <Modal
            className="dropdown-facet-modal"
            onClose={() => setIsOpen(false)}
            onOpen={() => setIsOpen(true)}
            open={isOpen}
            trigger={
              <span className="facet-title">
                {labelPrint ? <>{labelPrint} </> : <>{title} </>}
                {filtersCount.length > 0 && (
                  <span className="count">({filtersCount})</span>
                )}
                <i aria-hidden="true" className="icon ri-arrow-down-s-line" />
              </span>
            }
          >
            <Modal.Header>
              <span className="facet-label">
                {props.label}{' '}
                {filtersCount.length > 0 && (
                  <span className="count">({filtersCount})</span>
                )}
              </span>
            </Modal.Header>
            <Modal.Content>
              <SearchContext.Provider value={facetSearchContext}>
                <SUIFacet
                  {...props}
                  active={isOpen}
                  filterType={localFilterType}
                  onChangeFilterType={(v) => setLocalFilterType(v)}
                />
              </SearchContext.Provider>
              {!hideActiveFilters && (
                <ActiveFilters
                  sortedOptions={sortedOptions}
                  onRemove={(value) => {
                    removeFilter(field, value, filterConfig.filterType);
                  }}
                  field={field}
                />
              )}
            </Modal.Content>
            <Modal.Actions>
              <Button
                content="Close"
                onClick={() => {
                  setIsOpen(false);
                }}
              />
              <Button
                primary
                content="Apply"
                onClick={() => {
                  applySearch();
                  setIsOpen(false);
                }}
              />
            </Modal.Actions>
          </Modal>
        ) : (
          <div ref={nodeRef}>
            <Button
              basic
              className={cx('facet-btn', {
                active: isOpen,
              })}
              onClick={() => setIsOpen(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setIsOpen(true);
                }
                if (e.key === 'Escape') {
                  setIsOpen(false);
                }
              }}
            >
              <span className="facet-title">
                {labelPrint ? <>{labelPrint} </> : <>{title} </>}
                {filtersCount.length > 0 && (
                  <span className="count">({filtersCount})</span>
                )}
                <i aria-hidden="true" className="icon ri-arrow-down-s-line" />
              </span>
            </Button>

            {isOpen && (
              <div
                role="tab"
                tabIndex={0}
                className={cx('facet-wrapper', {
                  active: isOpen,
                })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setIsOpen(true);
                  }
                  if (e.key === 'Escape') {
                    setIsOpen(false);
                  }
                }}
              >
                {isLoading && <Dimmer active></Dimmer>}
                <SUIFacet
                  {...props}
                  active={isOpen}
                  filterType={localFilterType}
                  onChangeFilterType={(v) => setLocalFilterType(v)}
                />

                {!hideActiveFilters && (
                  <ActiveFilters
                    sortedOptions={sortedOptions}
                    onRemove={(value) => {
                      removeFilter(field, value, filterConfig.filterType);
                    }}
                    field={field}
                  />
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {isOpen && (
        <Dimmer active={isOpen} verticalAlign="top" className="facet-dimmer" />
      )}
    </>
  );
};

export default DropdownFacetWrapper;
