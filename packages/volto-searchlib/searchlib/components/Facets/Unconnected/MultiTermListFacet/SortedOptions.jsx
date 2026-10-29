import React from 'react';
import { Card } from 'semantic-ui-react'; // , Header, Divider
import { Icon, Term } from '@eeacms/search/components';
import cx from 'classnames';
import { getFilterValueDisplay } from './utils';
import ActiveFiltersList from './ActiveFiltersList';

const SortedOptions = (props) => {
  const { sortedOptions, onRemove, onSelect, iconsFamily, field } = props;

  return (
    <>
      <ActiveFiltersList
        sortedOptions={sortedOptions}
        onRemove={onRemove}
        iconsFamily={iconsFamily}
        field={field}
      />

      <h5 className="modal-section-title">Add more filters</h5>
      <Card.Group itemsPerRow={5}>
        {sortedOptions.map((option, i) => {
          const checked = option.selected;
          return (
            <Card
              key={`${getFilterValueDisplay(option.value)}`}
              onClick={() => {
                checked ? onRemove(option.value) : onSelect(option.value);
              }}
              className={cx('term', {
                active: checked,
              })}
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
    </>
  );
};

export default SortedOptions;
