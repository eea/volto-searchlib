import React from 'react';
import { Accordion, Icon } from 'semantic-ui-react';
import { useAtom } from 'jotai';
import { openFacetsAtom } from '../state';
import { useUpdateAtom } from 'jotai/utils';
import { useAppConfig, useSearchContext } from '@eeacms/search/lib/hocs';
import Facet from '../Facet';

const AccordionFacetWrapper = (props) => {
  const { collapsable = true, field, label } = props;
  const searchContext = useSearchContext();
  const { filters } = searchContext;

  const hasFilter = !!filters.find((filter) => field === filter.field);
  const [openFacets] = useAtom(openFacetsAtom);
  const updateOpenFacets = useUpdateAtom(openFacetsAtom);

  const { appConfig } = useAppConfig();
  const facet = appConfig.facets?.find((f) => f.field === field);
  const fallback = props.filterType ? props.filterType : facet.filterType;
  const defaultValue = field
    ? filters?.find((f) => f.field === field)?.type || fallback
    : fallback;

  const [defaultTypeValue] = (defaultValue || '').split(':');

  const [localFilterType, setLocalFilterType] = React.useState(
    defaultTypeValue,
  );

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

  let isOpened = openFacets[field]?.opened || false;
  const [counter, setCounter] = React.useState(0);

  return collapsable ? (
    <Accordion>
      <Accordion.Title
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
      >
        {label}
        <Icon className="ri-arrow-down-s-line" />
      </Accordion.Title>
      <Accordion.Content active={isOpened}>
        <Facet
          {...props}
          active={isOpened}
          filterType={localFilterType}
          isInAccordion={true}
          onChangeFilterType={(v) => setLocalFilterType(v)}
        />
      </Accordion.Content>
    </Accordion>
  ) : (
    <Facet
      {...props}
      isInAccordion={true}
      filterType={localFilterType}
      onChangeFilterType={(v) => setLocalFilterType(v)}
    />
  );
};

export default AccordionFacetWrapper;
