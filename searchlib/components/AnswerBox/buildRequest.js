import { buildRequestFilter } from '@eeacms/search/lib/search/query/filters';
import { filterNLPConfig } from './utils';
import { extractExactPhrases } from '@eeacms/search/lib/search/query/fullText';

export const buildFeedbackRequest = (state, appConfig) => {
  const { answer, query, feedback, comment } = state;

  // answer: Optional[str]
  // question: Optional[str]
  // context: Optional[str]
  // document_id: Optional[str] = None
  // offsets_in_document: Optional[List[Span]] = None
  // offsets_in_context: Optional[List[Span]] = None
  // score: Optional[float] = None

  return {
    requestType: 'nlp',
    endpoint: appConfig.nlp.feedback.servicePath,

    document_id: answer.id,
    question: query,
    answer: answer.answer,
    context: answer.full_context, // NOTE: not using answer.context
    offsets_in_document: answer.original_answer.offsets_in_document,
    offsets_in_context: answer.original_answer.offsets_in_context,
    score: answer.score,
    is_correct_answer: feedback === 'helpful',
    is_correct_document: feedback === 'helpful' || feedback === 'wrongpassage',
    no_answer: false,
    meta: {
      comment,
    },

    // pipeline_id: '',
    // origin: 'user-feedback',

    // id: answer.id,
    // document: {
    //   id: answer.id,
    //   content: answer.full_context,
    // },

    // answer: {
    //   ...answer.original_answer,
    //   meta: {},
    // },
    // answer: {
    //   answer: answer.answer,
    //   type: 'extractive',
    //   score: answer.score,
    //   context: answer.context,
    //   document_id: answer.document_id,
    //   offsets_in_document: [
    //     {
    //       start: answer.offset_start,
    //       end: answer.offset_end,
    //     },
    //   ],
    // },
  };
};

export const buildClassifyQuestionRequest = (state, appConfig) => {
  const { searchTerm } = state;

  let query = searchTerm;
  if (query.indexOf('|') > -1) {
    query = query.split('|').filter((p) => !!p.trim());
  }
  if (Array.isArray(query)) {
    query = query.join(' ');
  }

  return {
    requestType: 'nlp',
    endpoint: appConfig.nlp.classifyQuestion.servicePath,
    query,
  };
};

export const buildQuestionRequest = (state, config) => {
  const {
    searchTerm,
    filters,
    // current,
    // resultsPerPage,
    // sortDirection,
    // sortField,
  } = state;

  let question = searchTerm;
  if (question.indexOf('|') > -1) {
    question = question.split('|').filter((p) => !!p.trim());
  }
  if (Array.isArray(question)) {
    question = question.join(' ');
  }

  const filter = buildRequestFilter(filters, config);
  const cutoff = parseFloat(config.nlp.qa.cutoffScore ?? 0.1);

  const body = {
    requestType: 'nlp',
    endpoint: config.nlp.qa.servicePath,
    query: question,
    track_total_hits: false,
    ...(config.debugQuery ? { explain: true } : {}),
    params: {
      DPRequestClassifier: {
        use_dp: config.nlp.qa.use_dp || false,
      },
      QADPRequestClassifier: {
        use_dp: config.nlp.qa.qa_use_dp || false,
      },
      config: filterNLPConfig(config),
      DensePassageRetriever: {
        top_k: parseInt(config.nlp.qa.topk_retriever || 10),
        index: config.nlp.qa.dpr_index,
      },
      RawRetriever: {
        top_k: parseInt(config.nlp.qa.topk_retriever || 10),
        index: config.nlp.qa.raw_index,
      },
      AnswerExtraction: {
        top_k: parseInt(config.nlp.qa.topk_reader || 10),
      },
      AnswerOptimizer: {
        cutoff,
      },
      custom_query: {
        // Dynamic values based on current Search UI state
        function_score: {
          functions: config?.extraQueryParams?.functions,
          score_mode: config?.extraQueryParams?.score_mode,
          query: {
            bool: {
              ...(config?.extraQAQueryFilters || {}),
              must: [
                {
                  multi_match: {
                    // eslint-disable-next-line
                    query: question,
                    minimum_should_match: '75%',
                    fields: [
                      // TODO: use in the above query
                      ...(config.extraQueryParams?.text_fields || [
                        'all_fields_for_freetext',
                      ]),
                    ],
                  },
                },
              ],
              ...(filter && { filter }),
            },
          },
          // functions: [...(config.extraQueryParams?.functions || [])],
          // score_mode: config.extraQueryParams?.score_mode || 'sum',
        },
      },
    },
    // ...(sort && { sort }),
    // ...(size && { size }),
    // ...(from && { from }),
    // isQuestion: true,
  };

  const { phrases } = extractExactPhrases(searchTerm);
  phrases.forEach((phrase) =>
    body.params.custom_query.function_score.query.bool.must.push({
      match_phrase: { all_fields_for_freetext: phrase },
    }),
  );

  return body;
};

export const buildSimilarityRequest = ({ base, candidates }, config) => {
  const body = {
    requestType: 'nlp',
    endpoint: config.nlp.similarity.servicePath,
    base,
    candidates,
  };
  return body;
};

export const buildSpacyRequest = ({ texts }, config) => {
  const body = {
    requestType: 'nlp',
    endpoint: config.nlp.spacy.servicePath,
    texts,
  };
  return body;
};
