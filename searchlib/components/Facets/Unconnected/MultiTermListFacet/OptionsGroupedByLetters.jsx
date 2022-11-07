import React from 'react';
import { Card } from 'semantic-ui-react'; // , Header, Divider
import ActiveFiltersList from './ActiveFiltersList';

const OptionsGroupedByLetters = (props) => {
  const {
    groupedOptionsByLetters,
    onRemove,
    onSelect,
    iconsFamily,
    field,
    OptionButton,
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
      {groupedOptionsByLetters.letters.map((letter, index) => (
        <div className="by-groups" key={letter}>
          <div
            className={`group-heading ${index === 0 ? 'first' : ''}`}
            key={letter + 'h'}
          >
            <span>{letter}</span>
          </div>
          <div className="group-content" key={letter + 'c'}>
            <Card.Group itemsPerRow={5}>
              {groupedOptionsByLetters[letter].map((option, i) => (
                <OptionButton
                  option={option}
                  checked={option.selected}
                  iconsFamily={iconsFamily}
                  field={field}
                  onRemove={onRemove}
                  onSelect={onSelect}
                />
              ))}
            </Card.Group>
          </div>
        </div>
      ))}
      ;
    </>
  );
};

export default OptionsGroupedByLetters;
