import React from 'react';
import { Icon } from 'semantic-ui-react';
import cx from 'classnames';
import { Resizable, ToggleSort, Term } from '@eeacms/search/components';
import { useSort } from '@eeacms/search/lib/hocs';
// import MultiTypeFacetWrapper from './MultiTypeFacetWrapper';

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
                onChange={() =>
                  checked ? onRemove(option.value) : onSelect(option.value)
                }
              />
              <span className="checkmark" />
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

const Select = ({ options, value, onChange, className }) => {
  const [val, setVal] = React.useState(value);
  const handler = (e) => {
    onChange(e.target.value);
    setVal(e.target.value);
  };

  return (
    <select
      onBlur={handler}
      onChange={handler}
      value={val}
      className={className}
    >
      {options.map((opt) => (
        <option value={opt.value} key={opt.key}>
          {opt.text}
        </option>
      ))}
    </select>
  );
};

const ViewComponent = (props) => {
  const {
    className,
    label,
    onMoreClick,
    onRemove,
    onSelect,
    options, // options is the actual value
    showMore,
    showSearch,
    onSearch,
    // searchPlaceholder,
    onChangeFilterType,
    field,
    filterType = 'any',
  } = props;

  const filterTypes = [
    { key: 2, text: 'Match any', value: 'any' },
    { key: 1, text: 'Match all', value: 'all' },
  ];

  // const sortedOptions = sorted(options, sortOn, sortOrder);

  const { sortedValues: sortedOptions, toggleSort, sorting } = useSort(
    options,
    ['value', 'count'],
    {
      defaultSortOn: 'count',
      defaultSortOrder: 'descending',
    },
  );

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
          <div className="sui-multi-checkbox-facet__option-input-wrapper">
            <div className="sui-multi-checkbox-facet__checkbox"></div>
            <span className="sui-multi-checkbox-facet__input-text">
              <Select
                className="match-select"
                value={filterType}
                options={filterTypes}
                onChange={onChangeFilterType}
              />
            </span>
          </div>

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
          sortedOptions={sortedOptions}
          label={label}
          onSelect={onSelect}
          onRemove={onRemove}
          field={field}
        />
      </Resizable>

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
};

export default ViewComponent;
