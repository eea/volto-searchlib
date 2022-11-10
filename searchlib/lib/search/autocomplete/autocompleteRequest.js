function getTodayWithTime() {
  const d = new Date();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const hour = d.getHours();
  const minute = d.getMinutes();
  const second = d.getSeconds();

  const output = [
    d.getFullYear(),
    '-',
    month < 10 ? '0' : '',
    month,
    '-',
    day < 10 ? '0' : '',
    day,
    'T',
    hour < 10 ? '0' : '',
    hour,
    ':',
    minute < 10 ? '0' : '',
    minute,
    ':',
    second < 10 ? '0' : '',
    second,
    'Z',
  ].join('');
  return output;
}
const zeroPad = (num, places) => String(num).padStart(places, '0');

export function buildDidYouMeanRequest({ searchTerm }, config) {
  const cleanSearchTerms = searchTerm;
  const terms = cleanSearchTerms.split(' ');
  const query = {
    size: 0,
    suggest: Object.assign(
      {},
      ...terms.map((term, idx) => ({
        [`did_you_mean_${zeroPad(idx, 3)}`]: {
          text: term,
          phrase: {
            field: 'did_you_mean',
          },
        },
      })),
    ),
    query: {
      bool: {
        must: [], // TODO: predefined_filters
      },
    },
    ...(config.enableNLP && {
      ...config.requestParams,
    }),
  };
  /*const query = {
    size: 0,
    suggest: {
      did_you_mean_0: {
        text: 'watre',
        phrase: {
          field: 'did_you_mean',
        },
      },
    },
  };*/
  // console.log(query);
  return query;
}

export function buildAutocompleteRequest({ searchTerm }, config) {
  const phrases = searchTerm.split('|');
  let search_term = phrases[phrases.length - 1];

  let previous_search_term;

  // const correct_search_term = search_term;
  //
  // if (correct_search_term) {
  //   search_term = correct_search_term.join(' ');
  // }

  const current_parts = search_term.split(' ').filter(function (value) {
    return value.length !== 0;
  });

  let last_modified_word = search_term;
  if (previous_search_term !== '') {
    last_modified_word = current_parts[current_parts.length - 1];
  }

  previous_search_term = search_term;

  const query = {
    size: 0,
    aggs: {
      autocomplete_full: {
        terms: {
          field: 'autocomplete',
          order: {
            _count: 'desc',
          },
          include: search_term + '.*',
        },
      },
      autocomplete_last: {
        terms: {
          field: 'autocomplete',
          order: {
            _count: 'desc',
          },
          include: last_modified_word + '.*',
        },
      },
    },
    query: {
      bool: {
        must: [], // TODO: predefined_filters
      },
    },
    ...(config.enableNLP && {
      ...config.requestParams,
    }),
  };

  return query;
}

export function buildFaqRequest({ searchTerm }, config) {
  const phrases = searchTerm.split('|');
  let search_term = phrases[phrases.length - 1];

  // const correct_search_term = search_term;
  //
  // if (correct_search_term) {
  //   search_term = correct_search_term.join(' ');
  // }
  const query = {
    size: 0,
    aggs: {
      autocomplete_full: {
        terms: {
          field: 'title.index',
        },
      },
    },
    query: {
      bool: {
        should: [
          {
            bool: {
              must_not: {
                exists: {
                  field: 'expires',
                },
              },
            },
          },
          {
            range: {
              expires: {
                gte: getTodayWithTime(),
              },
            },
          },
        ],
        must: [
          { range: { 'issued.date': { lte: getTodayWithTime() } } },
          {
            multi_match: {
              query: search_term,
              fields: 'title',
              minimum_should_match: '80%',
            },
          },
          {
            match: {
              objectProvides: 'FAQ',
            },
          },
          {
            match: {
              language: 'en',
            },
          },
        ],
      },
    },
    ...(config.enableNLP && {
      ...config.requestParams,
    }),
  };
  return query;
}
