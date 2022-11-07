import React from 'react';
import { useSearchContext } from '@eeacms/search/lib/hocs';
import { getDidYouMeanTerms } from '@eeacms/search/lib/search/autocomplete/suggestions';
import { useAppConfig } from '@eeacms/search/lib/hocs';
import { Button, Message, Icon } from 'semantic-ui-react';

const getSuggestions = async (term, config) => {
  const suggestions = await getDidYouMeanTerms({ searchTerm: term }, config);
  return suggestions.join(' ');
};
export const NoResults = (props) => {
  const {
    resultSearchTerm,
    setSearchTerm,
    resetFilters,
    query_type,
  } = useSearchContext();
  const { appConfig } = useAppConfig();
  const {
    qa_queryTypes = [
      'query:interrogative',
      'query:declarative',
      'query:keyword',
    ],
  } = appConfig?.nlp?.qa || {};
  const isQuestion = qa_queryTypes.indexOf(query_type) > -1;
  const [suggestions, setSuggestions] = React.useState();
  React.useEffect(() => {
    if (resultSearchTerm.trim().length > 0) {
      getSuggestions(resultSearchTerm, appConfig).then((rsp) => {
        const rsp_suggestion = rsp.replace(/[^a-zA-Z ]/g, ' ').trim();
        if (resultSearchTerm.trim() !== rsp_suggestion) {
          setSuggestions(rsp_suggestion);
        } else {
          setSuggestions(null);
        }
      });
    }
  });

  const applyQuery = React.useCallback(
    (text) => {
      setSearchTerm(text, { shouldClearFilters: false });
    },
    [setSearchTerm],
  );
  return (
    <>
      {resultSearchTerm.trim().length > 0 && (
        <>
          <h3>
            We could not find any results for '<b>{resultSearchTerm.trim()}</b>'
          </h3>
          <>
            {suggestions && (
              <p>
                <span>Try instead: </span>
                <Button
                  as="a"
                  className="suggestions-button"
                  primary
                  size="mini"
                  onClick={(evt) => {
                    evt.preventDefault();
                    applyQuery(suggestions);
                  }}
                >
                  {suggestions}
                </Button>
              </p>
            )}
          </>
          <ul>
            <li>check your spelling</li>
            <li>enter fewer words</li>
            <li>check the selected filters</li>
          </ul>
        </>
      )}
      {resultSearchTerm.trim().length === 0 && (
        <>
          <h3>We could not find any results for your search criteria</h3>
          <ul>
            <li>check the selected filters</li>
          </ul>
        </>
      )}
      {!isQuestion && (
        <div className="answers-list">
          <Message icon warning size="small">
            <Icon name="exclamation circle" />
            No results found, but you have active filters. You may try to{' '}
            <Button
              size="mini"
              compact
              primary
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                resetFilters();
              }}
            >
              reset
            </Button>{' '}
            the filters.
          </Message>
        </div>
      )}
    </>
  );
};
