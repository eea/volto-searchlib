import superagent from 'superagent';

function trim_slash(text) {
  return text.replace(/^\/+|\/+$/g, '');
}

export default async function getIndexInfo(config) {
  const { host, elastic_index } = config;
  const settings_url =
    trim_slash(host) + '/' + trim_slash(elastic_index) + '/_settings';
  const alias_url =
    trim_slash(host) + '/' + trim_slash(elastic_index) + '/_alias';

  try {
    const settings_resp = await superagent
      .get(settings_url)
      .set('accept', 'application/json');
    const alias_resp = await superagent
      .get(alias_url)
      .set('accept', 'application/json');
    return { settings: settings_resp.body || {}, alias: alias_resp.body || {} };
  } catch (e) {
    return { error: true, statusCode: 500, body: `An error occurred: ${e}` };
  }
}
