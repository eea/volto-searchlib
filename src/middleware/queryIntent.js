import fetch from 'node-fetch';
import debug from 'debug';

const log = debug('volto-searchlib-query-intent');

const MSG_NOT_CONFIGURED =
  'Invalid configuration: missing QUERY_INTENT_SERVICE_URL';

/**
 * Same-origin proxy for the query-intent classifier service
 * (SetFit model behind a FastAPI app), mirroring the chatbot's
 * `/_da/` / `/_ha/` proxy pattern:
 *
 * - the browser only ever sees the `/_qi/...` same-origin paths
 * - the real service URL comes from the QUERY_INTENT_SERVICE_URL
 *   env variable (set in rancher, e.g. http://eea-query-intent:8100)
 * - only allowlisted paths are forwarded (confused-deputy protection)
 *
 * Client paths and the service paths they map to:
 *   POST /_qi/classify -> POST /v1/classify
 *   GET  /_qi/health   -> GET  /health
 *
 * Failure mode: any upstream error, timeout, or missing configuration
 * yields a non-2xx JSON response; the client treats that as
 * "not eligible" (fail closed, no AI summary, search unaffected).
 */

// Allowed paths for the _qi proxy. When adding new endpoints,
// update this list.
const ALLOWED_PATHS = [
  { clientPath: '/classify', servicePath: '/v1/classify', methods: ['POST'] },
  { clientPath: '/health', servicePath: '/health', methods: ['GET'] },
];

/**
 * Check whether a stripped path matches the allowlist.
 * Strips query strings before comparison.
 */
function isPathAllowed(strippedPath, method) {
  const cleanPath = strippedPath.split('?')[0];
  return ALLOWED_PATHS.some(
    (entry) => entry.clientPath === cleanPath && entry.methods.includes(method),
  );
}

export { isPathAllowed, ALLOWED_PATHS };

export default async function middleware(req, res, next) {
  const path = req.url.replace('/_qi/', '/');

  // Reject paths not on the allowlist — prevents Confused Deputy attacks
  if (!isPathAllowed(path, req.method)) {
    res.statusCode = 404;
    res.statusMessage = 'Not Found';
    res.send({ error: 'Not Found' });
    return;
  }

  const serviceUrl = process.env.QUERY_INTENT_SERVICE_URL;
  if (!serviceUrl) {
    res.statusCode = 503;
    res.statusMessage = MSG_NOT_CONFIGURED;
    res.send({ error: MSG_NOT_CONFIGURED });
    return;
  }

  const servicePath = ALLOWED_PATHS.find(
    (entry) => entry.clientPath === path.split('?')[0],
  ).servicePath;
  const timeoutMs = parseInt(process.env.QUERY_INTENT_TIMEOUT_MS || '2000', 10);

  const reqUrl = `${serviceUrl.replace(/\/+$/, '')}${servicePath}`;

  const options = {
    method: req.method,
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: timeoutMs,
  };

  if (req.body && req.method === 'POST') {
    // Only the query is forwarded; everything else is rejected by
    // the service schema anyway.
    options.body = JSON.stringify({ query: req.body.query ?? '' });
  }

  log(`Query intent request: ${req.method} ${reqUrl}`);

  try {
    const response = await fetch(reqUrl, options);

    res.set('Content-Type', 'application/json');

    if (!response.ok) {
      const text = await response.text();
      log(`Query intent service error: ${response.status} ${text}`);
      res.status(response.status).send({
        error: `Query intent service error: ${text || response.status}`,
      });
      return;
    }

    const result = await response.json();
    res.send(result);
  } catch (error) {
    // Timeout, connection refused, DNS failure, ...
    // The client fails closed on any non-2xx, so the summary is
    // simply skipped and the search page keeps working.
    log(`Query intent service unavailable: ${error.message}`);
    res.status(502).send({
      error: `Query intent service unavailable: ${error.message || 'connection failed'}`,
    });
  }
}
