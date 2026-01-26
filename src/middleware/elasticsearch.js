import download from './download';
import superagent from 'superagent';
import config from '@plone/volto/registry';
import debug from 'debug';

const log = debug('esmiddleware');

// Regex to extract optional prefix in format {prefix_} from path
// Matches: /_es/{status_}appname or /_es/appname
const PREFIX_REGEX = '/_es/(?:{([^}]+)})?';

const extractPrefix = (path) => {
  const match = path.match(`${PREFIX_REGEX}(.+)$`);
  return match?.[1] || '';
};

const esProxyWhitelist = (name) => ({
  GET: [`${PREFIX_REGEX}${name}/_search`],
  POST: [`${PREFIX_REGEX}${name}/_search`],
});

const esDownloadWhitelist = (name) => ({
  POST: [`${PREFIX_REGEX}${name}/_download`],
});

const esSettingsWhitelist = (name) => ({
  GET: [`${PREFIX_REGEX}${name}/_settings`],
});

const esAliasWhitelist = (name) => ({
  GET: [`${PREFIX_REGEX}${name}/_alias`],
});

const esGetDocWhitelist = (name) => ({
  GET: [`${PREFIX_REGEX}${name}/_doc/.*`],
});

function filterRequests(req, whitelist, retVal) {
  const tomatch = whitelist[req.method] || [];
  const matches = tomatch.filter((m) => {
    return decodeURI(req.url).match(m);
  }).length;
  return matches > 0 ? retVal : false;
}

function handleSearchRequest(req, res, params) {
  const { body } = req;
  const { urlES } = params;
  const url = `${urlES}/_search`;
  if (body?.params?.config) {
    delete body.params.config;
  }

  superagent
    .post(url)
    .send(body)
    .set('accept', 'application/json')
    .end((err, resp) => {
      if (resp && resp.body) {
        res.send(resp.body);
      } else {
        res.send({ error: 'Error' });
        log('err', err);
      }
    });
}

const handleSearch = (req, res, next, params) => {
  // This handler is used for both the main (search) request, but also for
  // requests coming for questions.

  let body = req.body || {};
  if (typeof body === 'string') body = JSON.parse(body);
  const { requestType } = body;

  if (requestType) delete body.requestType; // TODO: is this safe?

  handleSearchRequest(req, res, params);
};

const handleSettings = (req, res, next, { appName, urlES }) => {
  const url = `${urlES}/_settings`;
  superagent.get(url).end((err, resp) => {
    if (resp && resp.body) res.send(resp.body);
  });
};

const handleAlias = (req, res, next, { appName, urlES }) => {
  const url = `${urlES}/_alias`;
  superagent.get(url).end((err, resp) => {
    if (resp && resp.body) res.send(resp.body);
  });
};

const handleDownload = (req, res, next, { appName, urlES }) => {
  const body = req.body || {};
  const appConfig =
    body.params?.config || config.settings.searchlib.searchui[appName];
  download(urlES, appConfig, req, res);
};

const DOC_ID_RE = /.*_doc\/(?<url>.+)/m;

const handleDocRequest = (req, res, next, { urlES, docId }) => {
  const url = `${urlES}/_doc/${docId}`;
  log(`Get document: ${url}`);
  superagent.get(url).end((err, resp) => {
    if (resp && resp.body) res.send(resp.body);
  });
};

const getUrlES = (appName, prefix = '') => {
  const baseUrl =
    process.env[`RAZZLE_PROXY_ES_DSN_${appName}`] ||
    process.env.RAZZLE_PROXY_ES_DSN ||
    'http://localhost:9200/_all';

  if (!prefix) return baseUrl;

  // Apply prefix to the index name in the URL
  try {
    const url = new URL(baseUrl);
    const pathParts = url.pathname.split('/').filter(Boolean);
    if (pathParts.length > 0) {
      pathParts[pathParts.length - 1] = `${prefix}${
        pathParts[pathParts.length - 1]
      }`;
    }
    url.pathname = '/' + pathParts.join('/');
    return url.toString();
  } catch {
    return baseUrl;
  }
};

export const createHandler = () => {
  return function esProxyHandler(req, res, next) {
    let urlES;

    const appNames = Object.keys(config.settings.searchlib.searchui);

    // Extract prefix from request path (e.g., {status_} from /_es/{status_}appname/_search)
    const prefix = extractPrefix(decodeURI(req.path));

    const docRequestAppName = appNames
      .map((name) => filterRequests(req, esGetDocWhitelist(name), name))
      .find((b) => b);

    if (docRequestAppName) {
      const docId = req.path.match(DOC_ID_RE).groups['url'];
      urlES = getUrlES(docRequestAppName, prefix);
      handleDocRequest(req, res, next, { urlES, docId });
      return;
    }

    const searchRequestAppName = appNames
      .map((name) => filterRequests(req, esProxyWhitelist(name), name))
      .find((b) => b);

    if (searchRequestAppName) {
      urlES = getUrlES(searchRequestAppName, prefix);

      handleSearch(req, res, next, {
        appName: searchRequestAppName,
        urlES,
      });
      return;
    }

    const settingsAppName = appNames
      .map((name) => filterRequests(req, esSettingsWhitelist(name), name))
      .find((b) => b);

    if (settingsAppName) {
      urlES = getUrlES(settingsAppName, prefix);

      handleSettings(req, res, next, {
        appName: settingsAppName,
        urlES,
      });
      return;
    }

    const aliasAppName = appNames
      .map((name) => filterRequests(req, esAliasWhitelist(name), name))
      .find((b) => b);

    if (aliasAppName) {
      urlES = getUrlES(aliasAppName, prefix);

      handleAlias(req, res, next, {
        appName: aliasAppName,
        urlES,
      });
      return;
    }

    const downloadAppName = appNames
      .map((name) => filterRequests(req, esDownloadWhitelist(name), name))
      .find((b) => b);

    if (downloadAppName) {
      urlES = getUrlES(downloadAppName, prefix);

      handleDownload(req, res, next, {
        appName: downloadAppName,
        urlES,
      });
      return;
    }

    next();
  };
};
