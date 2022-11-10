import React from 'react';
import { Icon, Term } from '@eeacms/search/components';
import { Card } from 'semantic-ui-react'; // , Header, Divider

import OptionsGroupedByLetters from './OptionsGroupedByLetters';
import OptionsGroupedByNumbers from './OptionsGroupedByNumbers';
import SortedOptions from './SortedOptions';
import { getFilterValueDisplay } from './utils';

import cx from 'classnames';

const FacetOptions = (props) => {
  const {
    sortedOptions,
    groupedOptionsByLetters,
    groupedOptionsByNumbers,
    sorting,
    onSelect,
    onRemove,
    iconsFamily,
    field,
    availableOptions,
  } = props;

  const sortedOptionKeys = sortedOptions.map((o) => o.value);
  const zeroValueOptions = (availableOptions || [])
    .filter((name) => !sortedOptionKeys.includes(name))
    .map((name) => ({ value: name, count: 0, selected: false }));

  let isGroupedByLetters = false;
  if (Object.keys(groupedOptionsByLetters).length > 0) {
    if (
      groupedOptionsByLetters.letters.length >= 5 &&
      sortedOptions.length >= 100
    ) {
      // Apply grouping by letters only if we have at least 5 groups and
      // at least 100 options.
      isGroupedByLetters = true;
    }
  }

  let isGroupedByNumbers = false;
  if (Object.keys(groupedOptionsByNumbers).length > 0) {
    if (
      groupedOptionsByNumbers.numbers.length >= 3 &&
      sortedOptions.length >= 50
    ) {
      // Apply grouping by numbers only if we have at least 5 groups and
      // at least 50 options.
      isGroupedByNumbers = true;
    }
  }

  const OptionButton = React.useMemo(
    () => ({ option, checked, iconsFamily, field, onRemove, onSelect }) => (
      <Card
        key={`${getFilterValueDisplay(option.value)}`}
        onClick={() =>
          checked ? onRemove(option.value) : onSelect(option.value)
        }
        className={cx('term', { active: checked })}
      >
        <Card.Content>
          <Card.Header>
            {iconsFamily && (
              <Icon
                family={iconsFamily}
                type={option.value}
                className="facet-option-icon"
              />
            )}

            <Term term={option.value} field={field} />
          </Card.Header>
        </Card.Content>
        <Card.Content extra>
          <span className="count">({option.count.toLocaleString('en')})</span>
        </Card.Content>
      </Card>
    ),
    [],
  );

  const optionProps = {
    sortedOptions,
    groupedOptionsByNumbers,
    groupedOptionsByLetters,
    onRemove,
    onSelect,
    iconsFamily,
    field,
    sorting,
    OptionButton,
  };

  return (
    <div>
      {isGroupedByLetters ? (
        <OptionsGroupedByLetters {...optionProps} />
      ) : isGroupedByNumbers ? (
        <OptionsGroupedByNumbers {...optionProps} />
      ) : (
        <SortedOptions {...optionProps} />
      )}

      {sortedOptions.length < 1 && <div>No matching options</div>}

      <Card.Group itemsPerRow={5}>
        {zeroValueOptions.map((option, index) => (
          <Card
            key={`${getFilterValueDisplay(option.value)}`}
            className="disabled term"
          >
            <Card.Content>
              <Card.Header>
                {iconsFamily && (
                  <Icon
                    family={iconsFamily}
                    type={option.value}
                    className="facet-option-icon"
                  />
                )}

                <Term term={option.value} field={field} />
              </Card.Header>
            </Card.Content>
            <Card.Content extra>
              <span className="count">
                ({option.count.toLocaleString('en')})
              </span>
            </Card.Content>
          </Card>
        ))}
      </Card.Group>
    </div>
  );
};

export default FacetOptions;
