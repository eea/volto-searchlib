import superagent from 'superagent';

export default async function runRequest(body, config, url, method = 'POST') {
  const { host, elastic_index } = config;

  // url = url || `${host}/${elastic_index}/_search`;

  let dest;
  if (url) {
    dest = url;
  } else {
    dest = new URL(host);
    dest.pathname = `/${elastic_index}/_search`;
  }

  let action = superagent.get;
  if (method === 'POST') {
    action = superagent.post;
  }

  let resp;
  try {
    resp = await action(dest.toString())
      .send(body)
      .set('accept', 'application/json');
    return resp;
  } catch (e) {
    return { statusCode: 500, body: `An error occurred: ${e}` };
  }
}
