import superagent from 'superagent';
import { DateTime } from 'luxon';

function trim_slash(text) {
  return text.replace(/^\/+|\/+$/g, '');
}

async function getIndexInfo(config) {
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

export default async function getInfo(appConfig) {
  const { elastic_index } = appConfig;

  if (elastic_index === '_all') return ''; // we don't support _all

  const info = await getIndexInfo(appConfig);

  if (info.error || info.detail) {
    // eslint-disable-next-line
    console.warn('Error in retrieving index info', info);
    return '';
  }

  try {
    const indexes = Object.keys(info['settings']);
    if (indexes.length < 1) return '';
    let aliases = Object.keys(info.alias[indexes[0]]['aliases']);
    aliases = aliases
      .filter((alias) => alias.startsWith('updated_at_'))
      .sort()
      .reverse();
    let update_ts = info.settings[indexes[0]].settings.index.creation_date;
    if (aliases.length > 0) {
      update_ts = aliases[0].substring(11);
    }

    const dt = DateTime.fromMillis(parseInt(update_ts));
    return dt;
  } catch {
    // console.log('info', info);
    return '';
  }
}
