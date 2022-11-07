import registry from '@eeacms/search/registry';
import { extractExactPhrases } from '@eeacms/search/lib/search/query/fullText';

const phraseBuilder = (fieldName, phrases) => {
  return phrases.map((phrase) => ({
    match_phrase: {
      [fieldName]: {
        query: phrase,
        slop: 1,
        boost: 10,
      },
    },
  }));
};

export const highlightQueryBuilder = (searchTerm, fieldName) => {
  let { phrases, terms } = extractExactPhrases(searchTerm);
  const hasPhrases = phrases.length > 0;
  if (!hasPhrases) {
    phrases.push(terms);
  }

  const op = hasPhrases ? 'must' : 'should';
  const phrasesQuery = phraseBuilder(fieldName, phrases);
  return {
    highlight_query: {
      bool: {
        must: [
          {
            match: {
              [fieldName]: {
                query: terms,
              },
            },
          },
          ...(op === 'must' ? phrasesQuery : ''),
        ],
        should: [...(op === 'should' ? phrasesQuery : '')],
      },
    },
  };
};

export const buildHighlight = (searchTerm, config) => {
  if (!searchTerm || !config.highlight) return {};

  const _highlight = registry.resolve[config.highlight.queryBuilder.factory];

  return searchTerm && config.highlight?.fields
    ? {
      highlight: {
        ...config.highlight.queryParams,
        fields: Object.assign(
          {},
          ...config.highlight.fields.map((name) => ({
            [name]: _highlight(searchTerm, name),
          })),
        ),
      },
    }
    : {};
};
