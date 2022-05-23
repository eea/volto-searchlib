import download from './download';
import superagent from 'superagent';
import config from '@plone/volto/registry';
import debug from 'debug';

const log = debug('esmiddleware');

const esProxyWhitelist = (name) => ({
  GET: [`/_es/${name}/_search`],
  POST: [`/_es/${name}/_search`],
});

const esDownloadWhitelist = (name) => ({
  POST: [`/_es/${name}/_download`],
});

const esSettingsWhitelist = (name) => ({
  GET: [`/_es/${name}/_settings`],
});

const esGetDocWhitelist = (name) => ({
  GET: [`/_es/${name}/_doc/.*`],
});

function filterRequests(req, whitelist, retVal) {
  const tomatch = whitelist[req.method] || [];
  const matches = tomatch.filter((m) => req.url.match(m)).length;
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

function handleNlpRequest(req, res, params) {
  const { body } = req;
  const { urlNLP } = params;
  const { endpoint } = body;
  delete body.endpoint;

  if (body?.params?.config) {
    delete body.params.config;
  }

  const url = `${urlNLP}/${endpoint}`;
  log('handle nlp', url, urlNLP);

  superagent
    .post(url)
    .send(body)
    .set('accept', 'application/json')
    .end((err, resp) => {
      if (resp && resp.body) {
        res.send(resp.body);
      } else {
        res.send({ error: 'Unknown' });
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

  switch (requestType) {
    case 'nlp':
      handleNlpRequest(req, res, params);
      break;
    default:
      handleSearchRequest(req, res, params);
  }
};

const handleSettings = (req, res, next, { appName, urlNLP, urlES }) => {
  const url = `${urlES}/_settings`;
  superagent.get(url).end((err, resp) => {
    if (resp && resp.body) res.send(resp.body);
  });
};

const handleDownload = (req, res, next, { appName, urlNLP, urlES }) => {
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

const getUrlNLP = (appName) => {
  return (
    process.env[`RAZZLE_PROXY_QA_DSN_${appName}`] ||
    process.env.RAZZLE_PROXY_QA_DSN ||
    'http://localhost:8000/api'
  );
};

const getUrlES = (appName) => {
  return (
    process.env[`RAZZLE_PROXY_ES_DSN_${appName}`] ||
    process.env.RAZZLE_PROXY_ES_DSN ||
    'http://localhost:9200/_all'
  );
};

export const createHandler = () => {
  return function esProxyHandler(req, res, next) {
    let urlES, urlNLP;

    const appNames = Object.keys(config.settings.searchlib.searchui);

    const docRequestAppName = appNames
      .map((name) => filterRequests(req, esGetDocWhitelist(name), name))
      .find((b) => b);

    if (docRequestAppName) {
      const docId = req.path.match(DOC_ID_RE).groups['url'];
      urlES = getUrlES(docRequestAppName);
      handleDocRequest(req, res, next, { urlES, docId });
      return;
    }

    const searchRequestAppName = appNames
      .map((name) => filterRequests(req, esProxyWhitelist(name), name))
      .find((b) => b);

    if (searchRequestAppName) {
      const body = req.body || {};
      const conf =
        body.params?.config ||
        config.settings.searchlib.searchui[searchRequestAppName];

      log('conf', searchRequestAppName, conf.enableNLP);

      urlNLP = getUrlNLP(searchRequestAppName);
      urlES = getUrlES(searchRequestAppName);

      handleSearch(req, res, next, {
        appName: searchRequestAppName,
        urlNLP,
        urlES: conf.enableNLP ? urlNLP : urlES,
      });
      return;
    }

    const settingsAppName = appNames
      .map((name) => filterRequests(req, esSettingsWhitelist(name), name))
      .find((b) => b);

    if (settingsAppName) {
      urlNLP = getUrlNLP(settingsAppName);
      urlES = getUrlES(settingsAppName);

      handleSettings(req, res, next, {
        appName: settingsAppName,
        urlNLP,
        urlES,
      });
      return;
    }

    const downloadAppName = appNames
      .map((name) => filterRequests(req, esDownloadWhitelist(name), name))
      .find((b) => b);

    if (downloadAppName) {
      urlNLP = getUrlNLP(downloadAppName);
      urlES = getUrlES(downloadAppName);

      handleDownload(req, res, next, {
        appName: downloadAppName,
        urlNLP,
        urlES,
      });
      return;
    }

    next();
  };
};
