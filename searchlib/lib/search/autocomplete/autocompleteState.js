import uniq from 'lodash.uniq';

const clean = (text) =>
  text
    .split(' ')
    .filter(function (value) {
      return value.length !== 0;
    })
    .join(' ');

const getHighlight = (term, search_term) => {
  // `${term.slice(0, search_term.length)}<strong>${term}</strong>`,
  const start = term.indexOf(search_term);
  return start > -1
    ? `${search_term}<strong>${term.slice(start + search_term.length)}</strong>`
    : term;
};

export function buildState(
  data,
  { searchTerm },
  config,
  include_searchterm = true,
  skip_highlight = false,
) {
  // console.log('hits', data);
  const buckets_full = data.aggregations?.autocomplete_full?.buckets || [];
  const buckets_last = data.aggregations?.autocomplete_last?.buckets || [];

  // const { autocomplete: settings = {} } = config;

  const phrases = searchTerm.split('|');
  const search_term = phrases[phrases.length - 1];

  const hints = buckets_full
    .map((h) => clean(h.key))
    .filter((h) => h !== search_term);

  if (buckets_full.length === 0) {
    const parts = search_term.split(' ').filter((element) => element);
    parts.pop();
    const prefix = parts.join(' ');
    buckets_last.forEach(({ key }) => {
      if (!hints.includes(key) && key !== search_term) {
        hints.push(prefix + ' ' + clean(key));
      }
    });
  }

  // const current_parts = [];
  // for (var i = 0; i < buckets_last.length; i++) {
  //   if (buckets_last[i].key.split(' ').length < 3) {
  //     current_parts[current_parts.length - 1] = buckets_last[i].key;
  //     hint = current_parts.join(' ');
  //     if (!hints.includes(hint) && hint !== search_term) {
  //       hints.push(clean(hint));
  //     }
  //   }
  // }

  // Add search term as first item in array
  if (include_searchterm) {
    hints.unshift(search_term);
    hints.pop();
  }

  return {
    state: uniq(hints).map((term) => ({
      suggestion: term,
      highlight: skip_highlight ? term : getHighlight(term, search_term),
      data: null,
    })),
    // faq: uniq(hints).map((term) => ({
    //   suggestion: term,
    //   highlight: getHighlight(term, search_term),
    //   data: null,
    // })),
  };
}
