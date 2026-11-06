import React from 'react';
import { Dropdown } from 'semantic-ui-react';
import { useAppConfig, useSearchContext } from '@eeacms/search/lib/hocs';

const ResultsPerPageSelector = (props) => {
  const { appConfig } = useAppConfig();
  const { availableResultsPerPage } = appConfig;

  const options = availableResultsPerPage.map((item) => ({
    key: item,
    text: <> {item} </>,
    value: item,
  }));

  const searchContext = useSearchContext();
  const { resultsPerPage, setResultsPerPage } = searchContext;

  return (
    <div className="results-selector">
      <span>
        <Dropdown
          icon="chevron down"
          text={`${resultsPerPage} results / page`}
          key={resultsPerPage}
          inline
          options={options}
          defaultValue={resultsPerPage}
          onChange={(e, { value }) => {
            setResultsPerPage(value);
          }}
        />
      </span>
    </div>
  );
};

export default ResultsPerPageSelector;
