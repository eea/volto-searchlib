export const EXACT_PHRASES = 'exactPhrases';
// export const INCLUDE_ARCHIVED = 'Include archived content';

export const SLOTS = [
  'aboveSearchInput',
  'belowSearchInput',
  'aboveResults',
  'belowResults',
];

export const SEARCH_STATE_IDS = {
  any: 'any',
  isLandingPage: 'isLandingPage',
  hasResults: 'hasResults',
  hasNoResults: 'hasNoResults',
};

export const SEARCH_STATES = [
  [SEARCH_STATE_IDS.any, 'Always'],
  [SEARCH_STATE_IDS.isLandingPage, 'Landing page'],
  [SEARCH_STATE_IDS.hasResults, 'Has results'],
  [SEARCH_STATE_IDS.hasNoResults, 'Has no results'],
];
