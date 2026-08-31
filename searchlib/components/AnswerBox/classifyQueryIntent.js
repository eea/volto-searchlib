const QUESTION_START_PATTERN =
  /^(?:who|what|when|where|why|how|which|whose|whom|am|is|are|was|were|can|could|do|does|did|has|have|had|should|would|will)\b/i;
const EXPLORATORY_START_PATTERN =
  /^(?:explain|compare|describe|assess|evaluate|analyse|analyze|summarise|summarize|discuss|investigate|explore|tell me about)\b/i;
const EXPLORATORY_TOPIC_PATTERN =
  /^(?:effects?|impact|relationship|reasons?|role|causes?|consequences?)\s+(?:of|between|for)\b/i;
const CLAIM_PATTERN =
  /\b(?:(?:is|are|was|were)\s+\S+|(?:do|does|did|is|are|was|were|has|have|had|can|could|will|would|should)\s+not\b|(?:causes?|caused|leads?|led|results?|resulted|increases?|increased|decreases?|decreased|improves?|improved|damages?|damaged|harms?|harmed|reduces?|reduced|rises?|rose|falls?|fell|exceeds?|exceeded|prevents?|prevented|affects?|affected|contributes?|contributed)\b|(?:better|worse|more|less|higher|lower)\s+than\b)/i;
const RETRIEVAL_HINT_PATTERN =
  /\b(?:report|reports|pdf|pdfs|dataset|datasets|statistics|statistic|strategy|strategies|publication|publications|directive|directives|guide|guidelines?|fact\s?sheet|white\s?paper|outline|plan|plans|assessment|assessments|review|reviews|inventory|inventories)\b/i;
const YEAR_PATTERN = /\b(?:19|20)\d{2}\b/;
const SHORT_NOUN_PHRASE_WORD_COUNT = 3;

const normalizeQuery = (query) =>
  typeof query === 'string' ? query.trim().replace(/\s+/g, ' ') : '';

const countWords = (query) =>
  query.match(/[a-z0-9]+(?:['’-][a-z0-9]+)*/gi)?.length || 0;

export function classifyQueryIntent(query, { minimumClaimWords = 4 } = {}) {
  const normalizedQuery = normalizeQuery(query);

  if (!normalizedQuery) {
    return {
      intent: 'unknown',
      shouldGenerateAI: false,
      reason: 'empty',
    };
  }

  if (
    /\?\s*$/.test(normalizedQuery) ||
    QUESTION_START_PATTERN.test(normalizedQuery)
  ) {
    return {
      intent: 'question',
      shouldGenerateAI: true,
      reason: 'question',
    };
  }

  if (
    EXPLORATORY_START_PATTERN.test(normalizedQuery) ||
    EXPLORATORY_TOPIC_PATTERN.test(normalizedQuery)
  ) {
    return {
      intent: 'exploratory',
      shouldGenerateAI: true,
      reason: 'exploratory',
    };
  }

  if (
    countWords(normalizedQuery) >= minimumClaimWords &&
    CLAIM_PATTERN.test(normalizedQuery)
  ) {
    return {
      intent: 'claim',
      shouldGenerateAI: true,
      reason: 'claim',
    };
  }

  if (
    RETRIEVAL_HINT_PATTERN.test(normalizedQuery) ||
    YEAR_PATTERN.test(normalizedQuery) ||
    countWords(normalizedQuery) <= SHORT_NOUN_PHRASE_WORD_COUNT
  ) {
    return {
      intent: 'retrieval',
      shouldGenerateAI: false,
      reason: 'retrieval',
    };
  }

  return {
    intent: 'unknown',
    shouldGenerateAI: false,
    reason: 'unknown',
  };
}
