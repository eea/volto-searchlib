// import { EXACT_PHRASES } from '@eeacms/search/constants';

export function extractExactPhrases(searchTerm) {
  const parts = searchTerm.split('"'); // split by "
  const phrases = parts
    .slice(0, -1) // remove last element from the array
    .filter((el, idx) => idx % 2 === 1); // return odd elements of the array
  let terms = parts.filter((el, idx) => idx % 2 !== 1); // return odd elements of the array
  if (parts.length % 2 !== 1) {
    terms.push(parts[parts.length - 1]);
  }
  return {
    phrases,
    terms: terms
      .map((el) => el.trim())
      .filter((el) => el.length > 0)
      .join(' ')
      .trim(),
  };
}

export function buildFullTextMatch(searchTerm = '', filters = [], config) {
  // const originalSearchTerm = searchTerm;

  const { phrases } = extractExactPhrases(searchTerm);
  let must_query = [{ match_all: {} }];
  if (searchTerm.length > 0) {
    must_query = [
      {
        multi_match: {
          query: searchTerm,
          minimum_should_match: '75%',
          fields: [
            // TODO: use in the above query
            ...(config.extraQueryParams?.text_fields || [
              'all_fields_for_freetext',
            ]),
          ],
        },
      },
    ];
    phrases.forEach((phrase) =>
      must_query.push({ match_phrase: { all_fields_for_freetext: phrase } }),
    );
  }
  return must_query;
}
// ,
// {
//   match_phrase: {
//     all_fields_for_freetext: "Europe has plenty of water"
//   }
// },

// const exactPhraseFilter = filters.find(
//   ({ field }) => field === EXACT_PHRASES,
// );
// const isExact = exactPhraseFilter ? exactPhraseFilter.values[0] : false;

// if (searchTerm.indexOf('|') > -1) {
//   searchTerm = searchTerm.split('|').filter((p) => !!p.trim());
// }
// if (!isExact && Array.isArray(searchTerm)) {
//   searchTerm = searchTerm.join(' ');
// }

// return searchTerm
//   ? Array.isArray(searchTerm)
//     ? searchTerm.length > 0
//       ? {
//         intervals: {
//           all_fields_for_freetext: {
//             all_of: {
//               ordered: true,
//               intervals: searchTerm.map((phrase) => ({
//                 match: {
//                   query: phrase,
//                   max_gaps: 0,
//                   ordered: true,
//                 },
//               })),
//             },
//           },
//         },
//       }
//       : { match_all: {} }
//     : {
//       multi_match: {
//         query: searchTerm,
//         minimum_should_match: '75%',
//         fields: [
//           // TODO: use in the above query
//           ...(config.extraQueryParams?.text_fields || [
//             'all_fields_for_freetext',
//           ]),
//         ],
//       },
//     }
//   : { match_all: {} };
