import { registry } from '@eeacms/search';

export default function healthcheck(req, res, next) {
  const { id } = req.params;
  const { query } = req;

  const appConfig = registry.searchui[id];
  const hc = registry.resolve[appConfig?.healthcheck];
  if (hc) {
    hc(appConfig, query)
      .then((body) => res.send(body))
      .catch((body) => {
        res.send({ error: body });
      });
  } else {
    res.send({ error: 'config not found' });
  }
}
