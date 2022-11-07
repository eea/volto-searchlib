import superagent from 'superagent';

export default async function getIndexInfo(config) {
  const { host, elastic_index } = config;

  const url = `${host}/${elastic_index}/_settings`;

  try {
    const resp = await superagent.get(url).set('accept', 'application/json');
    return resp.body || {};
  } catch (e) {
    return { error: true, statusCode: 500, body: `An error occurred: ${e}` };
  }
}
