export default function extractAnswers(state, response, config) {
  if (!response.answers) return state;
  if (!response?.hits?.hits?.length && state.answers) {
    delete state['answers'];
  }

  const { answers = [], similarity: simResp } = response;

  let cutoff = 0.1;
  try {
    cutoff = parseFloat(config.nlp.qa.cutoffScore ?? 0.1);
  } catch {
    cutoff = 0.1;
  }
  const validAnswers = answers?.filter((item) => item.score >= cutoff);

  const { clusters = [] } = simResp || {};

  // form clusters of responses, ordered by the highest scoring
  // member of the cluster. Inside each cluster we de-duplicate
  // (don't list the same link twice)

  const clusterMap = {};
  clusters.forEach(([sent, clusterId]) => {
    clusterMap[clusterId] = [...(clusterMap[clusterId] || []), sent];
  });

  const clusterizedAnswers = Object.assign(
    {},
    ...Object.keys(clusterMap).map((clusterId) => ({
      [clusterId]: clusterMap[clusterId].reduce((acc, sent) => {
        return [...acc, ...validAnswers.filter((ans) => ans.answer === sent)]
          .reduce((acc, ans) => {
            // filter out duplicate results (same URL)
            return acc.findIndex((a) => a.source?.about === ans.source?.about) >
              -1
              ? acc
              : [...acc, ans];
          }, [])
          .sort((a, b) =>
            a.score > b.score ? -1 : a.score === b.score ? 0 : 1,
          );
      }, []),
    })),
  );

  const sortedClusters = Object.values(
    clusterizedAnswers,
  ).sort((batchA, batchB) =>
    batchA[0]?.score > batchB[0]?.score
      ? -1
      : batchA[0]?.score === batchB[0]?.score
      ? 0
      : 1,
  );

  state.answers = {
    clusters,
    answers: validAnswers,
    sortedClusters,
  };

  // console.log('extract answers', state, response);
  return state;
}
