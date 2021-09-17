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

const handleSearch = (req, res, next, { appName, urlQA, urlES }) => {
  const body = req.body;
  if (body.question) {
    const { question } = body;
    delete body.question;
    const qaBody = {
      query: question,
      custom_query: JSON.stringify(body),
      top_k_retriever: 100,
      top_k_reader: 4,
    };
    //console.log('qa req', qa, question, qaBody);
    superagent
      .post(urlQA)
      .send(qaBody)
      .set('accept', 'application/json')
      .end((err, resp) => {
        // eslint-disable-next-line
        console.log(err, resp);
        if (resp && resp.body) res.send(resp.body);
      });
  } else {
    const url = `${urlES}/_search`;
    superagent
      .post(url)
      .send(body)
      .set('accept', 'application/json')
      .end((err, resp) => {
        if (resp && resp.body) res.send(resp.body);
      });
  }
};

const handleSettings = (req, res, next, { appName, urlQA, urlES }) => {
  const url = `${urlES}/_settings`;
  superagent.get(url).end((err, resp) => {
    if (resp && resp.body) res.send(resp.body);
  });
};

const handleDownload = (req, res, next, { appName, urlQA, urlES }) => {
  const appConfig = config.settings.searchlib.searchui[appName];
  download(urlES, appConfig, req, res);
};

export const createHandler = ({ urlQA, urlES }) => {
  return function esProxyHandler(req, res, next) {
    const appNames = Object.keys(config.settings.searchlib.searchui);

    let appName;
    appName = appNames
      .map((name) => filterRequests(req, esProxyWhitelist(name), name))
      .find((b) => b);

    if (appName) {
      console.log('handle search', req.path, urlQA, urlES);
      handleSearch(req, res, next, { appName, urlQA, urlES });
      return;
    }

    appName = appNames
      .map((name) => filterRequests(req, esSettingsWhitelist(name), name))
      .find((b) => b);

    if (appName) {
      console.log('handle settings', req.path, urlQA, urlES);
      handleSettings(req, res, next, { appName, urlQA, urlES });
      return;
    }

    appName = appNames
      .map((name) => filterRequests(req, esDownloadWhitelist(name), name))
      .find((b) => b);

    if (appName) {
      console.log('handle download', req.path, urlQA, urlES);
      handleDownload(req, res, next, { appName, urlQA, urlES });
      return;
    }

    console.log('next', req.path);
    next();
  };
};
