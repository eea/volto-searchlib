import { registry } from '@eeacms/search';

export default function healthcheck(req, res, next) {
  const { id } = req.params;
  const appConfig = registry.searchui[id];
  if (appConfig.healthcheck) {
    appConfig
      .healthcheck(appConfig)
      .then((body) => res.send(body))
      .catch((body) => {
        res.send({ error: body });
      });
  } else {
    next();
  }
}
