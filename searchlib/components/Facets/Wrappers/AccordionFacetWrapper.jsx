import React from 'react';
import { connect } from 'react-redux';
import { Accordion, Icon } from 'semantic-ui-react';
import { useAtom } from 'jotai';
import { openFacetsAtom } from '../state';
import { useSetAtom } from 'jotai';
import { useAppConfig, useSearchContext } from '@eeacms/search/lib/hocs';
import Facet from '../Facet';
import { Dimmer } from 'semantic-ui-react';

const AccordionFacetWrapper = (props) => {
  const {
    collapsable = true,
    field,
    label,
    token,
    isLoading,
    eventEmitter,
  } = props;
  const searchContext = useSearchContext();
  const { facets, filters } = searchContext;

  const hasFilter = !!filters.find((filter) => field === filter.field);
  const [openFacets] = useAtom(openFacetsAtom);
  const updateOpenFacets = useSetAtom(openFacetsAtom);

  const { appConfig } = useAppConfig();
  const facet = appConfig.facets?.find((f) => f.field === field);
  const fallback = props.filterType ? props.filterType : facet.filterType;
  const defaultValue = field
    ? filters?.find((f) => f.field === field)?.type || fallback
    : fallback;

  const [defaultTypeValue] = (defaultValue || '').split(':');

  const [localFilterType, setLocalFilterType] =
    React.useState(defaultTypeValue);

  const onChangeFilterType = (v) => {
    console.log('??? ', v);
    setLocalFilterType(v);
    if (!eventEmitter) return;
    eventEmitter.emit('change:filterType', {
      field,
      type: v,
    });
  };

  React.useEffect(() => {
    let temp = openFacets;
    if (hasFilter && !(field in openFacets)) {
      temp[field] = { opened: true };
    } else {
      if (!(field in openFacets)) {
        temp[field] = { opened: false };
      }
    }
    updateOpenFacets(temp);
  }, [hasFilter, field, openFacets, updateOpenFacets]);

  React.useEffect(() => {
    if (!eventEmitter) return;

    function changeFilterType(data) {
      if (data.field === 'spatial') {
        console.log('HA?! ', { eventEmitter, data });
      }

      if (data.field === field) {
        setLocalFilterType(data.type);
      }
    }

    eventEmitter.on('change:filterType', changeFilterType);

    return () => {
      eventEmitter.off('change:filterType', changeFilterType);
    };
  }, [eventEmitter]);

  let isOpened = openFacets[field]?.opened || false;
  const [counter, setCounter] = React.useState(0);
  if (facets[field] === undefined) return null;
  if (facet?.authOnly && token === undefined) return null;
  return collapsable ? (
    <Accordion>
      <Accordion.Title
        tabIndex={0}
        active={isOpened}
        onClick={() => {
          setCounter(counter + 1); // Force render
          let temp = openFacets;
          if (isOpened) {
            temp[field] = { opened: false };
            isOpened = false;
          } else {
            temp[field] = { opened: true };
            isOpened = true;
          }
          updateOpenFacets(temp);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            setCounter(counter + 1); // Force render
            let temp = openFacets;
            if (isOpened) {
              temp[field] = { opened: false };
              isOpened = false;
            } else {
              temp[field] = { opened: true };
              isOpened = true;
            }
            updateOpenFacets(temp);
          }
        }}
      >
        {label}
        <Icon className="ri-arrow-down-s-line" />
      </Accordion.Title>
      <Accordion.Content active={isOpened}>
        {isLoading && <Dimmer active></Dimmer>}
        <Facet
          {...props}
          active={isOpened}
          filterType={localFilterType}
          isInAccordion={true}
          onChangeFilterType={onChangeFilterType}
        />
      </Accordion.Content>
    </Accordion>
  ) : (
    <Facet
      {...props}
      isInAccordion={true}
      filterType={localFilterType}
      onChangeFilterType={onChangeFilterType}
    />
  );
};

export default connect((state) => ({
  token: state.userSession?.token,
}))(AccordionFacetWrapper);
