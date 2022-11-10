import React from 'react';

import { Segment, Button, Message, Label, Icon } from 'semantic-ui-react'; //, Accordion

import { useAppConfig, useSearchContext } from '@eeacms/search/lib/hocs';
import { hasNonDefaultFilters } from '@eeacms/search/lib/search/helpers';

import Answers from './Answers';
import withAnswers from './withAnswers';
import useTimedMessage from './useTimedMessage';
import Loader from '../Loaders';

const AnswerBox = (props) => {
  const { appConfig } = useAppConfig();

  const { data = {}, loading, loaded, searchedTerm, isQuestion } = props;
  const { sortedClusters = [] } = data || {};
  const { searchContext } = props;
  const { resultSearchTerm = '', filters, resetFilters } = searchContext;

  const hasActiveFilters = hasNonDefaultFilters(filters, appConfig);
  // TODO: this is hardcoded for globalsearch
  const hasActiveCluster =
    filters.findIndex((f) => f.field === 'op_cluster') > -1;

  const messageCounter = useTimedMessage({
    resultSearchTerm,
    searchedTerm,
    timeout: 15,
  });

  if (!isQuestion) return null;

  const showLoader = loading && !loaded;
  const hasAnswers =
    resultSearchTerm &&
    searchedTerm === resultSearchTerm &&
    sortedClusters.length;

  const dontShow =
    !(showLoader || (resultSearchTerm && searchedTerm === resultSearchTerm)) ||
    hasActiveCluster;

  if (dontShow) return null;

  return showLoader ? (
    <div className="answers-list">
      <Segment className="answers__loading">
        <div className="loading-tip">
          Searching answers for <strong>{resultSearchTerm}</strong>
          <Loader
            className="three-dots-loader"
            type="ThreeDots"
            visible={true}
            color="#2d9390"
            width={80}
            height={10}
          />
        </div>

        <div className="progress"></div>
      </Segment>
    </div>
  ) : hasAnswers ? (
    <div className="answers-list">
      <Answers
        hasActiveFilters={hasActiveFilters}
        data={data}
        searchedTerm={searchedTerm}
        resetFilters={resetFilters}
      />
    </div>
  ) : hasActiveFilters ? (
    <div className="answers-list">
      <Message icon warning size="small">
        <Icon name="exclamation circle" />
        <Message.Content>
          <p>
            No answers found, but you have active filters. You may try to{' '}
            <Button
              size="mini"
              compact
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                resetFilters();
              }}
            >
              reset
            </Button>{' '}
            the filters to improve the quality of results.
          </p>
        </Message.Content>
      </Message>
    </div>
  ) : (
    messageCounter > 0 && (
      <div className="answers-list">
        <Message icon warning size="small">
          <Icon name="exclamation circle" />
          <Message.Content>
            <span>
              No direct answers for your question.
              <Label circular color="teal">
                {messageCounter}
              </Label>
            </span>
          </Message.Content>
        </Message>
      </div>
    )
  );
};

const WithLiveAnswers = withAnswers(AnswerBox);

const withStateAnswers = (WrappedComponent) => {
  const WrappedAnswerBox = (props) => {
    const searchContext = useSearchContext();
    const { resultSearchTerm = '', query_type } = searchContext;

    const { appConfig } = useAppConfig();
    const {
      qa_queryTypes = [
        'query:interrogative',
        'query:declarative',
        'query:keyword',
        'request:query', // temporary
      ],
    } = appConfig?.nlp?.qa || {};

    const isQuestion = qa_queryTypes.indexOf(query_type) > -1;

    if (searchContext.answers) {
      return (
        <WrappedComponent
          isQuestion={isQuestion}
          data={searchContext.answers}
          loading={false}
          loaded={true}
          searchedTerm={resultSearchTerm}
          searchContext={searchContext}
        />
      );
    } else {
      return <WithLiveAnswers {...props} />;
    }
  };
  return WrappedAnswerBox;
};

export default withStateAnswers(AnswerBox);

/*
answer: "organoleptic factors, physico-chemical factors, toxic substances, microbiological parameters"
context: "nto account when assessing water quality (organoleptic factors, physico-chemical factors, toxic substances, microbiological parameters.↵(Source: RRDA)"
document_id: "http://www.eea.europa.eu/help/glossary/gemet-environmental-thesaurus/total-parameter"
id: "http://www.eea.europa.eu/help/glossary/gemet-environmental-thesaurus/total-parameter"
offset_end: 134
offset_end_in_doc: 176
offset_start: 42
offset_start_in_doc: 84
probability: 0.752453625202179
question: null
score: 6.118757247924805
*/
