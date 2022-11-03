import runRequest from '@eeacms/search/lib/runRequest';
import {
  buildAutocompleteRequest,
  buildDidYouMeanRequest,
  buildFaqRequest,
} from './autocompleteRequest';
import { buildState } from './autocompleteState';

export async function getDidYouMeanTerms(props, config) {
  const didYouMeanRequestBody = buildDidYouMeanRequest(props, config);
  const didYouMeanJson = await runRequest(didYouMeanRequestBody, config);

  const keys = Object.keys(didYouMeanJson.body?.suggest || []).sort();

  let terms = [];
  keys.forEach((key) => {
    const dym = didYouMeanJson.body.suggest[key][0];
    terms.push(dym.options.length === 0 ? dym.text : dym.options[0].text);
  });

  return terms;
}

export async function getAutocompleteSuggestions(props, config) {
  // console.log('onAutocomplete', { requestBody, props, config });
  const { searchTerm } = props;
  if (searchTerm.length > 1 && searchTerm[searchTerm.length - 1] === '|') {
    Promise.resolve({});
  }

  const didYouMeanTerms = await getDidYouMeanTerms(props, config);

  const requestBody = buildAutocompleteRequest(
    { searchTerm: didYouMeanTerms.join(' ') },
    config,
  );
  const json = await runRequest(requestBody, config);
  const didYouMeanState = buildState(
    json.body,
    props,
    config,
    config.autocomplete.include_searchterm,
    true,
  );

  const faqRequestBody = buildFaqRequest(
    { searchTerm: didYouMeanTerms.join(' ') },
    config,
  );
  const faqJson = await runRequest(faqRequestBody, config);
  const faqState = buildState(faqJson.body, props, config, false, true);
  return {
    didYouMean: didYouMeanState.state.slice(0,3),
    faq: faqState.state.slice(0,3),
  };
}

// const x = {
//   size: 0,
//   aggs: {
//     autocomplete_full: {
//       terms: {
//         field: 'autocomplete',
//         order: {
//           _count: 'desc',
//         },
//         include: 'europe.*',
//       },
//     },
//     autocomplete_last: {
//       terms: {
//         field: 'autocomplete',
//         order: {
//           _count: 'desc',
//         },
//         include: 'europe.*',
//       },
//     },
//   },
//   query: {
//     bool: {
//       must: [
//         {
//           term: {
//             hasWorkflowState: 'published',
//           },
//         },
//         {
//           constant_score: {
//             filter: {
//               bool: {
//                 should: [
//                   {
//                     bool: {
//                       must_not: {
//                         exists: {
//                           field: 'issued',
//                         },
//                       },
//                     },
//                   },
//                   {
//                     range: {
//                       'issued.date': {
//                         lte: '2021-06-16T15:43:34Z',
//                       },
//                     },
//                   },
//                 ],
//               },
//             },
//           },
//         },
//         {
//           constant_score: {
//             filter: {
//               bool: {
//                 should: [
//                   {
//                     bool: {
//                       must_not: {
//                         exists: {
//                           field: 'expires',
//                         },
//                       },
//                     },
//                   },
//                   {
//                     range: {
//                       expires: {
//                         gte: '2021-06-16T15:43:34Z',
//                       },
//                     },
//                   },
//                 ],
//               },
//             },
//           },
//         },
//       ],
//     },
//   },
// };
