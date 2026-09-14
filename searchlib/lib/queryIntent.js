/**
 * Client for the query-intent classifier service.
 *
 * The browser only talks to the same-origin `/_qi/` proxy (see
 * src/middleware/queryIntent.js), which forwards to the service URL
 * configured on the server via QUERY_INTENT_SERVICE_URL.
 *
 * Fail-closed contract: every guard hit, network error, timeout,
 * non-2xx status, or malformed payload resolves to
 * `{ eligible: false }`. This client never throws and never blocks
 * the search page — it only decides whether an AI summary may start.
 */

const CLASSIFY_PATH = '/_qi/classify';

// Mirror the service-side local guards so obviously non-classifiable
// input does not even leave the browser.
const MAX_QUERY_CHARS = 500; // service schema limit
const MAX_QUERY_WORDS = 20; // service local guard
const DEFAULT_TIMEOUT_MS = 2000;

const countWords = (query) => query.match(/\S+/g)?.length || 0;

/**
 * Local pre-flight guards (empty / too long).
 * Returns the guard reason, or null when the query is classifiable.
 */
function localGuard(query) {
  if (typeof query !== 'string' || !query.trim()) return 'empty';
  if (query.length > MAX_QUERY_CHARS) return 'too-long';
  if (countWords(query) > MAX_QUERY_WORDS) return 'too-long';
  return null;
}

/**
 * Ask the query-intent service whether a search term warrants an AI
 * summary.
 *
 * @param {string} query the (normalized) search term
 * @param {object} [options]
 * @param {number} [options.timeoutMs] give up after this long (default 2000)
 * @param {AbortSignal} [options.signal] external abort (e.g. a newer
 *        search superseded this one); the internal timeout still applies
 * @returns {Promise<{eligible: boolean, reason: string}>}
 */
export function classifyQuery(
  query,
  { timeoutMs = DEFAULT_TIMEOUT_MS, signal } = {},
) {
  const guard = localGuard(query);
  if (guard) {
    return Promise.resolve({ eligible: false, reason: guard });
  }

  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  const onExternalAbort = () => controller.abort();
  if (signal) {
    if (signal.aborted) {
      controller.abort();
    } else {
      signal.addEventListener('abort', onExternalAbort);
    }
  }

  return fetch(CLASSIFY_PATH, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
    signal: controller.signal,
  })
    .then((response) => {
      if (!response.ok) {
        return { eligible: false, reason: 'service-error' };
      }
      return response.json().then(
        (data) => ({
          // The service guarantees eligible=false on abstention and on
          // retrieval/unknown; only an explicit true may open the gate.
          eligible: data?.eligible === true && data?.abstained !== true,
          reason: data?.reason || 'classified',
        }),
        () => ({ eligible: false, reason: 'bad-response' }),
      );
    })
    .catch((err) => ({
      eligible: false,
      reason:
        err?.name === 'AbortError'
          ? timedOut
            ? 'timeout'
            : 'aborted'
          : 'service-error',
    }))
    .finally(() => {
      clearTimeout(timer);
      if (signal) {
        signal.removeEventListener('abort', onExternalAbort);
      }
    });
}

export default classifyQuery;
