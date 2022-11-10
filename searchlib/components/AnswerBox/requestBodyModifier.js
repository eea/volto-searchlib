export default function addQAParams(body, config) {
  // const { from, size } = body;

  if (Object.keys(body.aggs).length !== 0) return body;
  if (!config.enableNLP) return body;

  body.params = {
    ...(body.params || {}),

    DPRequestClassifier: {
      use_dp: config.nlp.qa.use_dp || false,
    },
    QADPRequestClassifier: {
      use_dp: config.nlp.qa.qa_use_dp || false,
    },
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
      cutoff: parseFloat(config.nlp.qa.cutoffScore ?? 0.1),
    },
    QuerySearch: {
      query_types: config.nlp.qa.qa_queryTypes,
    },
  };

  return body;
}
