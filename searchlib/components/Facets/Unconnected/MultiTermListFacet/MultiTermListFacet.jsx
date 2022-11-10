import React from 'react';
import cx from 'classnames';
import { ToggleSort, Icon } from '@eeacms/search/components';
import { useSort } from '@eeacms/search/lib/hocs';
import { Checkbox } from 'semantic-ui-react'; // , Header, Divider
import { useAppConfig } from '@eeacms/search/lib/hocs';

import FacetOptions from './FacetOptions';

const MultiTermListFacet = (props) => {
  const {
    className,
    label,
    onMoreClick,
    onChange,
    onRemove,
    onSelect,
    options,
    showMore,
    showSearch,
    onSearch,
    searchPlaceholder,
    onChangeFilterType,
    filterType = 'any',
    field,
    HeaderWrapper = 'div',
    ContentWrapper = 'div',
    iconsFamily,
    onChangeFilterExact,
    filterExact,
    enableExact = false,
    availableOptions,
  } = props;

  const { appConfig } = useAppConfig();
  const facetConfig = appConfig.facets.find((f) => f.field === field);
  const defaultSortOn = facetConfig?.sortOn || 'count';

  const secondToggleSortConfig = {
    label: facetConfig?.sortOnCustomLabel || 'Alphabetical',
    sortOn: facetConfig?.sortOn || 'value',
  };

  const { sortedValues: sortedOptions, toggleSort, sorting } = useSort(
    options,
    ['value', 'count', 'custom'],
    {
      defaultSortOn: defaultSortOn,
      defaultSortOrder: {
        // each criteria has its own default sort order
        count: 'descending',
        value: 'ascending',
        custom: 'ascending',
      },
    },
    field,
  );

  const byLetters = {};
  if (sorting.sortOn === 'value') {
    byLetters.letters = [];
    sortedOptions.forEach((item) => {
      const firstLetter = item.value[0];
      if (!byLetters.letters.includes(firstLetter)) {
        byLetters.letters.push(firstLetter);
        byLetters[firstLetter] = [];
      }
      byLetters[firstLetter].push(item);
    });
  }

  const numbersLimits = [1000, 500, 100, 50, 10, 1];
  const byNumbers = {};
  if (sorting.sortOn === 'count') {
    byNumbers.numbers = [];
    sortedOptions.forEach((item) => {
      const count = item.count;
      for (const number of numbersLimits) {
        if (count >= number) {
          if (!byNumbers.numbers.includes(number)) {
            byNumbers.numbers.push(number);
            byNumbers[number] = [];
          }
          byNumbers[number].push(item);
          break;
        }
      }
    });
  }

  const customClass =
    'facet-' + (facetConfig.title || label).replace(' ', '-').toLowerCase();

  return (
    <>
      <HeaderWrapper className={customClass}>
        <div className="multitermlist__facet__header">
          <div className="multitermlist__facet__header_bottom">
            <div className="facet-title">
              <h4>{facetConfig?.title || label}</h4>
            </div>
            <div className="order-controls">
              <span className="label">match all selected</span>
              <Checkbox
                toggle
                checked={filterType === 'all'}
                onChange={(e, { checked }) =>
                  onChangeFilterType(checked ? 'all' : 'any')
                }
              />
              {enableExact && (
                <>
                  <span className="label">Only specific to selection</span>
                  <Checkbox
                    toggle
                    checked={!!filterExact}
                    onChange={(e, { checked }) => {
                      onChangeFilterExact(checked);
                    }}
                  />
                </>
              )}
              <span className="label">Sort by:</span>
              <ToggleSort
                label={secondToggleSortConfig.label}
                onToggle={() => toggleSort(secondToggleSortConfig.sortOn)}
                on={sorting.sortOn === secondToggleSortConfig.sortOn}
                icon={
                  sorting.sortOrder === 'ascending' ? (
                    <Icon name="sort alphabet ascending" />
                  ) : (
                    <Icon name="sort alphabet descending" />
                  )
                }
              />
              <ToggleSort
                label="Count"
                onToggle={() => toggleSort('count')}
                on={sorting.sortOn === 'count'}
                icon={
                  sorting.sortOrder === 'ascending' ? (
                    <Icon name="sort numeric ascending" />
                  ) : (
                    <Icon name="sort numeric descending" />
                  )
                }
              />
            </div>
          </div>
          {showSearch && (
            <div className="search">
              <Icon name="search" size="small" color="blue" />
              <input
                className="multitermlist__search__text-input"
                type="search"
                placeholder={searchPlaceholder || 'Search'}
                onChange={(e) => onSearch(e.target.value)}
              />
            </div>
          )}
        </div>
      </HeaderWrapper>
      <ContentWrapper>
        <fieldset
          className={cx(
            'sui-facet searchlib-multiterm-facet',
            className,
            customClass,
          )}
        >
          <FacetOptions
            field={field}
            groupedOptionsByLetters={byLetters}
            groupedOptionsByNumbers={byNumbers}
            iconsFamily={iconsFamily}
            label={label}
            onRemove={onRemove}
            onChange={onChange}
            onSelect={onSelect}
            sortedOptions={sortedOptions}
            availableOptions={availableOptions}
            sorting={sorting}
            enableExact={enableExact}
          />
          {showMore && (
            <button
              type="button"
              className="sui-facet-view-more"
              onClick={onMoreClick}
              aria-label="Show more options"
            >
              + More
            </button>
          )}
        </fieldset>
      </ContentWrapper>
    </>
  );
};

export default MultiTermListFacet;
