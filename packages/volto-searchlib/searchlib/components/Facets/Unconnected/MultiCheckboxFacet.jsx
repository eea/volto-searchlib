/**
 * A customized version of the CheckboxFacet
 */
import React from 'react';
import cx from 'classnames';

function getFilterValueDisplay(filterValue) {
  if (filterValue === undefined || filterValue === null) return '';
  if (filterValue.hasOwnProperty('name')) return filterValue.name;
  return String(filterValue);
}

const getTranslatedFilterValueDisplay = (option, facetValues) => {
  const index = facetValues.findIndex((opt) => opt.value === option);
  return getFilterValueDisplay(index > -1 ? facetValues[index] : option);
};

const remapValues = (options, facetValues) => {
  const valueMap = Object.assign(
    {},
    ...options.map((opt) => ({ [opt.value]: opt })),
  );
  return facetValues.map((f) => valueMap[f.value]).filter((o) => !!o);
};

function MultiCheckboxFacet({
  className,
  label,
  onMoreClick,
  onRemove,
  onSelect,
  options,
  showMore,
  showSearch,
  onSearch,
  searchPlaceholder,
  facetValues,
}) {
  return (
    <fieldset className={cx('sui-facet', className)}>
      <legend className="sui-facet__title">{label}</legend>

      {showSearch && (
        <div className="sui-facet-search">
          <input
            className="sui-facet-search__text-input"
            type="search"
            placeholder={searchPlaceholder || 'Search'}
            onChange={(e) => {
              onSearch(e.target.value);
            }}
          />
        </div>
      )}

      <div className="sui-multi-checkbox-facet">
        {options.length < 1 && <div>No matching options</div>}
        {(facetValues ? remapValues(options, facetValues) : options).map(
          (option) => {
            const checked = option.selected;
            return (
              <label
                key={`${getFilterValueDisplay(option.value)}`}
                htmlFor={`example_facet_${label}${getFilterValueDisplay(
                  option.value,
                )}`}
                className="sui-multi-checkbox-facet__option-label"
              >
                <div className="sui-multi-checkbox-facet__option-input-wrapper">
                  <input
                    id={`example_facet_${label}${getFilterValueDisplay(
                      option.value,
                    )}`}
                    type="checkbox"
                    className="sui-multi-checkbox-facet__checkbox"
                    checked={checked}
                    onChange={() =>
                      checked ? onRemove(option.value) : onSelect(option.value)
                    }
                  />
                  <span className="sui-multi-checkbox-facet__input-text">
                    {facetValues
                      ? getTranslatedFilterValueDisplay(
                          option.value,
                          facetValues,
                        )
                      : getFilterValueDisplay(option.value)}
                  </span>
                </div>
                <span className="sui-multi-checkbox-facet__option-count">
                  {option.count.toLocaleString('en')}
                </span>
              </label>
            );
          },
        )}
      </div>

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
  );
}

export default MultiCheckboxFacet;
