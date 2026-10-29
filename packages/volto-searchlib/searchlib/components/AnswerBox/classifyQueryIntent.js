// Pre-LLM query intent classifier (English, fail closed).
//
// Order matters:
//   1. empty input
//   2. overly long input (pasted text, not a search question)
//   3. question - interrogative/auxiliary start or a trailing '?'
//   4. exploratory - explicit commands and topic phrases
//   5. claim - sentence-like statements worth fact-checking
//   6. retrieval - document types, years and short noun phrases
//   7. unknown - everything else (no AI call)
const QUESTION_START_PATTERN =
  /^(?:whats|whos|who|what|when|where|why|which|whose|whom|isn't|aren't|wasn't|weren't|can't|couldn't|won't|wouldn't|shouldn't|don't|doesn't|didn't|hasn't|haven't|hadn't|am|is|are|was|were|can|could|do|does|did|has|have|had|should|would|will|must|might|shall)\b/i;
const EXPLORATORY_START_PATTERN =
  /^(?:explain|compare|describe|assess|evaluate|analyse|analyze|summarise|summarize|discuss|investigate|explore|outline|review|break\s+down|give\s+me\s+a\s+(?:(?:short|brief|quick)\s+)?summary|tell\s+me\s+about|ways\s+to|tips\s+for|ideas\s+for)\b/i;
const EXPLORATORY_TOPIC_PATTERN =
  /^(?:the\s+|a\s+|an\s+)?(?:effects?|impacts?|relationships?|reasons?|roles?|causes?|consequences?|drivers|factors|challenges|barriers|trends|status|state|progress|overview|summary|analysis)\s+(?:of|between|for|in|on|to|behind)\b/i;
// Sentence-like claims. Causative verbs that double as common search nouns
// (results, leads, led - e.g. "LED") require the in/to preposition so they
// only match the verbal usage.
const CLAIM_PATTERN =
  /\b(?:(?:is|are|was|were)\s+\S+|(?:do|does|did|is|are|was|were|has|have|had|can|could|will|would|should)\s+not\b|(?:has|have|had)\s+been\b|(?:isn't|aren't|wasn't|weren't|can't|couldn't|won't|wouldn't|shouldn't|don't|doesn't|didn't|hasn't|haven't|hadn't)\s+\S+|(?:will|should)\s+\S+|(?:causes?|caused|kills?|killed|dies|died|pollutes|threatens?|threatened|undermines?|undermined|weakens?|weakened|strengthens?|strengthened|accelerates?|accelerated|hinders?|hindered|boosts?|boosted|doubles?|doubled|triples?|tripled|saves?|saved|drove)\b|(?:results?|resulted|leads?|led)\s+(?:in|to)\b|(?:increases?|increased|decreases?|decreased|improves?|improved|damages?|damaged|harms?|harmed|reduces?|reduced|rises?|rose|falls?|fell|exceeds?|exceeded|prevents?|prevented|affects?|affected|contributes?|contributed)\b|(?:better|worse|more|less|higher|lower|faster|slower|cheaper|greater|smaller|stronger|weaker)\s+than\b)/i;
const RETRIEVAL_HINT_PATTERN =
  /\b(?:report|reports|pdf|pdfs|dataset|datasets|data|database|databases|statistics|statistic|statistical|strategy|strategies|publication|publications|directive|directives|guides?|guidelines?|facts?|white\s?papers?|outlines?|plan|plans|assessment|assessments|review|reviews|inventory|inventories|maps?|charts?|figures?|tables?)\b/i;
const YEAR_PATTERN = /\b(?:19|20)\d{2}\b/;
const SHORT_NOUN_PHRASE_WORD_COUNT = 3;
const MAX_QUERY_WORD_COUNT = 20;

const normalizeQuery = (query) =>
  typeof query === 'string' ? query.trim().replace(/\s+/g, ' ') : '';

const countWords = (query) =>
  query.match(/[a-z0-9]+(?:['’-][a-z0-9]+)*/gi)?.length || 0;

export function classifyQueryIntent(
  query,
  { minimumClaimWords = 4, maxQueryWords = MAX_QUERY_WORD_COUNT } = {},
) {
  const normalizedQuery = normalizeQuery(query);

  if (!normalizedQuery) {
    return {
      intent: 'unknown',
      shouldGenerateAI: false,
      reason: 'empty',
    };
  }

  const wordCount = countWords(normalizedQuery);

  // Queries far longer than a search question are usually pasted text and
  // must not spend an LLM call.
  if (wordCount > maxQueryWords) {
    return {
      intent: 'unknown',
      shouldGenerateAI: false,
      reason: 'too-long',
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

  if (wordCount >= minimumClaimWords && CLAIM_PATTERN.test(normalizedQuery)) {
    return {
      intent: 'claim',
      shouldGenerateAI: true,
      reason: 'claim',
    };
  }

  if (
    RETRIEVAL_HINT_PATTERN.test(normalizedQuery) ||
    YEAR_PATTERN.test(normalizedQuery) ||
    wordCount <= SHORT_NOUN_PHRASE_WORD_COUNT
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
