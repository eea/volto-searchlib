import superagent from 'superagent';
import * as path from 'path';

export default async function getIndexInfo(config) {
  const { host, elastic_index } = config;
  const settings_url = path.join(host, elastic_index, '_settings');
  const alias_url = path.join(host, elastic_index, '_alias');

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
