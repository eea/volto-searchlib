import React from 'react';
import cx from 'classnames';
import { Resizable } from '@eeacms/search/components'; // , FacetWrapper

function getFilterValueDisplay(filterValue) {
  if (filterValue === undefined || filterValue === null) return '';
  if (filterValue.hasOwnProperty('name')) return filterValue.name;
  return String(filterValue);
}

const FacetOptions = (props) => {
  const { options, label, onSelect, onRemove } = props;
  return (
    <div className="sui-multi-checkbox-facet">
      {options.map((option) => {
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
                name={`multiterm_facet_${label}`}
                type="radio"
                className="sui-multi-checkbox-facet__checkbox"
                checked={checked}
                onChange={() => {
                  options.forEach((opt) => {
                    if (opt.value.name === option.value.name) {
                      onSelect(opt.value);
                    } else {
                      onRemove(opt.value);
                    }
                  });
                }}
              />
              <span className="radio-checkmark" />
              <span className="sui-multi-checkbox-facet__input-text">
                {getFilterValueDisplay(option.value)}
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

const ViewComponent = (props) => {
  const { className, label, onRemove, onSelect, options, facets } = props;
  return (
    <fieldset className={cx('sui-facet searchlib-fixedrange-facet', className)}>
      {/* <legend className="sui-facet__title">{label}</legend> */}

      {options.length < 1 && <div>No matching options</div>}

      <Resizable>
        <FacetOptions
          options={options}
          label={label}
          facets={facets}
          onSelect={onSelect}
          onRemove={onRemove}
        />
      </Resizable>
    </fieldset>
  );
};

// const FixedRangeFacetComponent = (props) => {
//   return <ViewComponent {...props} />;
// };

export default ViewComponent;
