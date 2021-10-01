import download from './download';
import superagent from 'superagent';
import config from '@plone/volto/registry';

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

function filterRequests(req, whitelist, retVal) {
  const tomatch = whitelist[req.method] || [];
  const matches = tomatch.filter((m) => req.url.match(m)).length;
  return matches > 0 ? retVal : false;
}

function handleSearchRequest(req, res, params) {
  const { body } = req;
  const { urlES } = params;
  const url = `${urlES}/_search`;

  superagent
    .post(url)
    .send(body)
    .set('accept', 'application/json')
    .end((err, resp) => {
      if (resp && resp.body) res.send(resp.body);
    });
}

function handleNlpRequest(req, res, params) {
  const { body } = req;
  const { urlNLP } = params;
  const { endpoint } = body;
  delete body.endpoint;
  const url = `${urlNLP}/${endpoint}`;

  superagent
    .post(url)
    .send(body)
    .set('accept', 'application/json')
    .end((err, resp) => {
      if (resp && resp.body) res.send(resp.body);
    });
}

const handleSearch = (req, res, next, params) => {
  // This handler is used for both the main (search) request, but also for
  // requests coming for questions.

  const body = req.body || {};
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
  const appConfig = config.settings.searchlib.searchui[appName];
  download(urlES, appConfig, req, res);
};

export const createHandler = ({ urlNLP, urlES }) => {
  return function esProxyHandler(req, res, next) {
    const appNames = Object.keys(config.settings.searchlib.searchui);

    let appName;
    appName = appNames
      .map((name) => filterRequests(req, esProxyWhitelist(name), name))
      .find((b) => b);

    if (appName) {
      const conf = config.settings.searchlib.searchui[appName];
      handleSearch(req, res, next, {
        appName,
        urlNLP,
        urlES: conf.enableNLP ? urlNLP : urlES,
      });
      return;
    }

    appName = appNames
      .map((name) => filterRequests(req, esSettingsWhitelist(name), name))
      .find((b) => b);

    if (appName) {
      handleSettings(req, res, next, { appName, urlNLP, urlES });
      return;
    }

    appName = appNames
      .map((name) => filterRequests(req, esDownloadWhitelist(name), name))
      .find((b) => b);

    if (appName) {
      handleDownload(req, res, next, { appName, urlNLP, urlES });
      return;
    }

    next();
  };
};
