import React from 'react';
import { Card } from 'semantic-ui-react'; // , Header, Divider
import { Icon, Term } from '@eeacms/search/components';
import cx from 'classnames';

import { getFilterValueDisplay } from './utils';
import ActiveFiltersList from './ActiveFiltersList';

const OptionsGroupedByNumbers = (props) => {
  const {
    groupedOptionsByNumbers,
    sorting,
    onRemove,
    onSelect,
    iconsFamily,
    field,
    sortedOptions,
  } = props;

  return (
    <>
      <ActiveFiltersList
        sortedOptions={sortedOptions}
        onRemove={onRemove}
        iconsFamily={iconsFamily}
        field={field}
      />
      {groupedOptionsByNumbers.numbers.map((number, index) => {
        let label = '';
        let nextLimit = 0;
        if (sorting.sortOrder === 'descending') {
          if (index === 0) {
            label = `More than ${number}`;
          } else {
            nextLimit = groupedOptionsByNumbers.numbers[index - 1];
            label = `${number}...${nextLimit}`;
          }
        } else {
          nextLimit = groupedOptionsByNumbers.numbers[index + 1];
          if (nextLimit === undefined) {
            label = `More than ${number}`;
          } else {
            label = `${number}...${nextLimit}`;
          }
        }
        return (
          <div className="by-groups" key={number}>
            <h5
              className={`group-heading ${index === 0 ? 'first' : ''}`}
              key={number + 'h'}
            >
              <span>{label}</span>
            </h5>
            <div className="group-content" key={number + 'c'}>
              <Card.Group itemsPerRow={5}>
                {groupedOptionsByNumbers[number].map((option, i) => {
                  const checked = option.selected;
                  return (
                    <Card
                      key={`${getFilterValueDisplay(option.value)}`}
                      onClick={() =>
                        checked
                          ? onRemove(option.value)
                          : onSelect(option.value)
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
                        <span className="count">
                          ({option.count.toLocaleString('en')})
                        </span>
                      </Card.Content>
                    </Card>
                  );
                })}
              </Card.Group>
            </div>
          </div>
        );
      })}
      ;
    </>
  );
};

export default OptionsGroupedByNumbers;
