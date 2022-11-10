import React from 'react';
import { Facet } from '@eeacms/search/components';
import { Card, Modal, Button, Icon } from 'semantic-ui-react'; // , Header, Image
import { useSearchContext, useAppConfig } from '@eeacms/search/lib/hocs';

import OptionsWrapper from './OptionsWrapper';
import { useFilterState } from './state';
import { visibleFacetsAtom } from '@eeacms/search/state';
import { useAtom } from 'jotai';

const FacetWrapperComponent = (props) => {
  const searchContext = useSearchContext();
  const { filters = [], addFilter, removeFilter } = searchContext;
  const { field, label } = props;
  const [isOpened, setIsOpened] = React.useState();
  const [visibleFacets, setVisibleFacets] = useAtom(visibleFacetsAtom);

  const { appConfig } = useAppConfig();
  const { facets } = appConfig;
  const facet = appConfig.facets?.find((f) => f.field === field);
  // const fallback = facet ? facet.filterType : defaultType;

  const fallback = props.filterType ? props.filterType : facet.filterType;

  const defaultValue = field
    ? filters?.find((f) => f.field === field)?.type || fallback
    : fallback;

  const [defaultTypeValue, defaultIsExact] = (defaultValue || '').split(':');

  const [localFilterType, setLocalFilterType] = React.useState(
    defaultTypeValue,
  );

  const [isExact, setIsExact] = React.useState(defaultIsExact);

  const alwaysVisibleFacets = facets
    .filter((f) => f.alwaysVisible)
    .map((f) => f.field);

  const initialValue =
    (filters.find((f) => f.field === field) || {})?.values || [];
  const isActive = initialValue.length > 0;

  const [state, dispatch] = useFilterState(
    field,
    !initialValue
      ? []
      : Array.isArray(initialValue)
      ? initialValue
      : [initialValue],
  );

  const OptionsView = props.view;

  const BoundOptionsWrapper = React.useCallback(
    (innerProps) => {
      return (
        <OptionsWrapper
          {...innerProps}
          field={field}
          facet={facet}
          filterType={localFilterType}
          onChangeFilterType={(v) => setLocalFilterType(v)}
          view={OptionsView}
          filterExact={isExact}
          onChangeFilterExact={(v) => setIsExact(v)}
        />
      );
    },
    [OptionsView, facet, field, isExact, localFilterType],
  );

  return (
    <Modal
      className={(isActive && 'facet active') || 'facet'}
      onClose={() => setIsOpened(false)}
      onOpen={() => setIsOpened(true)}
      open={isOpened}
      trigger={
        <Card
          header={
            <div className="card-header">
              <span className="text" title={label}>
                {label}

                {filters.map((filter, index) => {
                  return filter.field === field ? (
                    <span key={index}> ({filter.values.length})</span>
                  ) : null;
                })}

                {initialValue.length > 0 && (
                  <Button
                    className="clear-filters"
                    size="mini"
                    onClick={(evt) => {
                      evt.preventDefault();

                      if (!alwaysVisibleFacets.includes(field)) {
                        let filteredValues = visibleFacets.filter(
                          (l) => l !== facet.field,
                        );
                        setVisibleFacets(filteredValues);
                      }

                      if (Array.isArray(state)) {
                        (state || []).forEach((v) => {
                          dispatch({
                            type: 'reset',
                            value: [],
                            id: 'btn-clear-filters',
                          });
                          removeFilter(
                            field,
                            v,
                            `${localFilterType}${isExact ? ':exact' : ''}`,
                          );
                        });
                      } else {
                        dispatch({
                          type: 'reset',
                          value: [],
                          id: 'btn-clear-filters',
                        });
                        removeFilter(
                          field,
                          [state || ''],
                          `${localFilterType}${isExact ? ':exact' : ''}`,
                        );
                      }
                    }}
                  >
                    <Icon name="close" role="button" />
                  </Button>
                )}
              </span>
            </div>
          }
          className={(isActive && 'facet active') || 'facet'}
          onClick={() => {}}
        />
      }
    >
      <Facet
        {...props}
        active={isOpened}
        view={BoundOptionsWrapper}
        state={state}
      />

      <Modal.Actions>
        <Button
          onClick={() => {
            setIsOpened(false);
            dispatch({ type: 'reset', value: initialValue, id: 'btn-cancel' });
          }}
        >
          Cancel
        </Button>
        <Button
          primary
          content="Apply"
          onClick={() => {
            setIsOpened(false);
            removeFilter(field, '', '');
            removeFilter(field, '', 'any');
            removeFilter(field, '', 'all');
            removeFilter(field, '', 'any:exact');
            removeFilter(field, '', 'all:exact');
            // console.log('state', state);
            if (Array.isArray(state)) {
              (state || []).forEach((v) => {
                addFilter(
                  field,
                  v,
                  `${localFilterType}${isExact ? ':exact' : ''}`,
                );
              });
            } else {
              addFilter(
                field,
                [state || ''],
                `${localFilterType}${isExact ? ':exact' : ''}`,
              );
            }
          }}
        />
      </Modal.Actions>
    </Modal>
  );
};

export default FacetWrapperComponent;
