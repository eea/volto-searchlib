import { registry } from '@eeacms/search';

const getHCConf = (appName) => {
  return {
    documentCountThreshold:
      process.env[`RAZZLE_PROXY_DOCUMENTCOUNTTHRESHOLD_${appName}`],
    queryTimeSecondsThreshold_OK:
      process.env[`RAZZLE_PROXY_QUERYTIMESECONDSTHRESHOLD_OK_${appName}`],
    queryTimeSecondsThreshold_WARNING:
      process.env[`RAZZLE_PROXY_QUERYTIMESECONDSTHRESHOLD_WARNING__${appName}`],
    indexUpdatedHoursThreshold_OK:
      process.env[`RAZZLE_PROXY_INDEXUPDATEDHOURSTHRESHOLD_OK_${appName}`],
    indexUpdatedHoursThreshold_WARNING:
      process.env[`RAZZLE_PROXY_INDEXUPDATEDHOURSTHRESHOLD_WARNING_${appName}`],
    failedSyncThreshold_OK:
      process.env[`RAZZLE_PROXY_FAILEDSYNCTHRESHOLD_OK_${appName}`],
    failedSyncThreshold_WARNING:
      process.env[`RAZZLE_PROXY_FAILEDSYNCTHRESHOLD_WARNING_${appName}`],
  };
};

export default function healthcheck(req, res, next) {
  const { id } = req.params;

  const { query } = req;
  let hc_params = getHCConf(id);
  hc_params = { ...hc_params, ...query };
  const appConfig = registry.searchui[id];
  const hc = registry.resolve[appConfig?.healthcheck];
  if (hc) {
    hc(appConfig, hc_params)
      .then((body) => res.send(body))
      .catch((body) => {
        res.send(body);
      });
  } else {
    res.send({ error: 'config not found' });
  }
}
