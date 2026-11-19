import getRegistry from '@eeacms/search/lib/getRegistry';

export function buildResult(hit, config, ...extras) {
  const Model = getRegistry().resolve[config.resultItemModel.factory];
  return new Model(hit, config, ...extras);
}

export default function buildResults(hits, config, ...extras) {
  return hits.map((hit) => buildResult(hit, config, ...extras));
}
