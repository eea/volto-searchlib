import React from 'react';
import { Icon } from 'semantic-ui-react';
import cx from 'classnames';
import { Resizable, ToggleSort, Term } from '@eeacms/search/components';
import { useSort } from '@eeacms/search/lib/hocs';
import { useAppConfig, useSearchContext } from '@eeacms/search/lib/hocs';

function getFilterValueDisplay(filterValue) {
  if (filterValue === undefined || filterValue === null) return '';
  if (filterValue.hasOwnProperty('name')) return filterValue.name;
  return String(filterValue);
}
const FacetOptions = (props) => {
  const { sortedOptions, label, onSelect, onRemove, field } = props;
  return (
    <div className="sui-multi-checkbox-facet">
      {sortedOptions.map((option) => {
        const checked = option.selected;
        return (
          <label
            key={`${getFilterValueDisplay(option.value)}`}
            htmlFor={`multiterm_facet_${label}${getFilterValueDisplay(
              option.value,
            )}`}
            className="sui-multi-checkbox-facet__option-label"
          >
            <div className="sui-multi-checkbox-facet__option-input-wrapper">
              <input
                id={`multiterm_facet_${label}${getFilterValueDisplay(
                  option.value,
                )}`}
                type="checkbox"
                className="sui-multi-checkbox-facet__checkbox"
                checked={checked}
                onChange={() => {
                  sortedOptions.forEach((opt) => {
                    if (opt.value === option.value) {
                      onSelect(opt.value);
                    } else {
                      onRemove(opt.value);
                    }
                  });
                }}
              />
              <span className="radio-checkmark" />
              <span className="sui-multi-checkbox-facet__input-text">
                <Term term={option.value} field={field} />
              </span>
            </div>
            <span className="sui-multi-checkbox-facet__option-count">
              ({option.count.toLocaleString('en')})
            </span>
          </label>
        );
      })}
    </div>
  );
};

const SingleTermFacetViewComponent = (props) => {
  const {
    className,
    label,
    onRemove,
    onSelect,
    options, // options is the actual value
    showSearch,
    onSearch,
    field,
  } = props;
  const searchContext = useSearchContext();
  const { filters = [] } = searchContext;

  const initialValue =
    (filters.find((f) => f.field === field) || {})?.values || [];

  const { appConfig } = useAppConfig();
  const facetConfig = appConfig.facets.find((f) => f.field === field);
  const configSortOn = facetConfig.sortOn || 'count';
  const configSortOrder = facetConfig.sortOrder || 'descending';
  let defaultSortOrder = {
    // each criteria has its own default sort order
    count: 'descending',
    value: 'ascending',
    custom: 'ascending',
  };

  defaultSortOrder[configSortOn] = configSortOrder;
  const { sortedValues: sortedOptions, toggleSort, sorting } = useSort(
    options,
    ['value', 'count'],
    {
      defaultSortOn: configSortOn,
      defaultSortOrder: defaultSortOrder,
    },
    field,
  );

  const sortedOptionsAdjusted = sortedOptions.map((item) => {
    if (initialValue.includes(item.value)) {
      item.selected = true;
    }
    return item;
  });

  return (
    <fieldset className={cx('sui-facet searchlib-multiterm-facet', className)}>
      {/*<legend className="sui-facet__title">{label}</legend>*/}

      {showSearch && (
        <div className="sui-facet-search">
          {/* <Icon name="search" size="small" color="blue" /> */}
          <input
            className="sui-facet-search__text-input"
            type="search"
            placeholder={'Quick search'}
            onChange={(e) => {
              onSearch(e.target.value);
            }}
          />
        </div>
      )}

      {options.length < 1 && <div>No matching options</div>}

      <div className="sui-multi-checkbox-facet facet-term-controls">
        <div className="sui-multi-checkbox-facet__option-label">
          <span className="sui-multi-checkbox-facet__option-count">
            <ToggleSort
              label="Alphabetical order"
              onToggle={() => toggleSort('value')}
              // on={sorting.sortOn === 'value'}
              icon={
                sorting.sortOrder === 'ascending' &&
                sorting.sortOn === 'value' ? (
                  <Icon name="sort alphabet ascending" />
                ) : (
                  <Icon name="sort alphabet descending" />
                )
              }
            />
            <ToggleSort
              label="Count"
              onToggle={() => toggleSort('count')}
              // on={sorting.sortOn === 'count'}
              icon={
                sorting.sortOrder === 'ascending' &&
                sorting.sortOn === 'count' ? (
                  <Icon name="sort numeric ascending" />
                ) : (
                  <Icon name="sort numeric descending" />
                )
              }
            />
          </span>
        </div>
      </div>
      <Resizable>
        <FacetOptions
          // sortedOptions={sortedOptions}
          sortedOptions={sortedOptionsAdjusted}
          label={label}
          onSelect={onSelect}
          onRemove={onRemove}
          field={field}
        />
      </Resizable>
    </fieldset>
  );
};

export default SingleTermFacetViewComponent;
