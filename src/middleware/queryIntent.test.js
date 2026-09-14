import fetch from 'node-fetch';

import { isPathAllowed, ALLOWED_PATHS } from './queryIntent';

// Mock node-fetch
jest.mock('node-fetch');

describe('queryIntent middleware', () => {
  let req, res, next, middleware;

  beforeEach(() => {
    fetch.mockReset();
    // Clear the module cache so middleware is re-imported with current env vars
    jest.resetModules();
    // Re-mock after reset
    jest.mock('node-fetch', () => jest.fn());

    req = {
      url: '/_qi/classify',
      method: 'POST',
      body: { query: 'Why are wetlands important?' },
      headers: {},
      ip: '127.0.0.1',
    };
    res = {
      send: jest.fn(),
      set: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete process.env.QUERY_INTENT_SERVICE_URL;
    delete process.env.QUERY_INTENT_TIMEOUT_MS;
  });

  it('proxies POST /_qi/classify to the service /v1/classify path', async () => {
    process.env.QUERY_INTENT_SERVICE_URL = 'http://qi:8100';
    middleware = require('./queryIntent').default;
    const mockedFetch = require('node-fetch');

    mockedFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          intent: 'question',
          eligible: true,
          abstained: false,
          reason: 'classified',
          model_version: 'setfit-v4',
        }),
    });

    await middleware(req, res, next);

    expect(mockedFetch).toHaveBeenCalledWith(
      'http://qi:8100/v1/classify',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ query: 'Why are wetlands important?' }),
        timeout: 2000,
      }),
    );
    expect(res.set).toHaveBeenCalledWith('Content-Type', 'application/json');
    expect(res.status).not.toHaveBeenCalled();
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        intent: 'question',
        eligible: true,
      }),
    );
  });

  it('proxies GET /_qi/health to the service /health path', async () => {
    process.env.QUERY_INTENT_SERVICE_URL = 'http://qi:8100';
    middleware = require('./queryIntent').default;
    const mockedFetch = require('node-fetch');

    req.url = '/_qi/health';
    req.method = 'GET';
    req.body = undefined;

    mockedFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ status: 'ok' }),
    });

    await middleware(req, res, next);

    expect(mockedFetch).toHaveBeenCalledWith(
      'http://qi:8100/health',
      expect.objectContaining({ method: 'GET' }),
    );
    expect(res.send).toHaveBeenCalledWith({ status: 'ok' });
  });

  it('strips a trailing slash from the service URL', async () => {
    process.env.QUERY_INTENT_SERVICE_URL = 'http://qi:8100/';
    middleware = require('./queryIntent').default;
    const mockedFetch = require('node-fetch');

    mockedFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ eligible: false }),
    });

    await middleware(req, res, next);

    expect(mockedFetch).toHaveBeenCalledWith(
      'http://qi:8100/v1/classify',
      expect.any(Object),
    );
  });

  it('honours the QUERY_INTENT_TIMEOUT_MS env override', async () => {
    process.env.QUERY_INTENT_SERVICE_URL = 'http://qi:8100';
    process.env.QUERY_INTENT_TIMEOUT_MS = '750';
    middleware = require('./queryIntent').default;
    const mockedFetch = require('node-fetch');

    mockedFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ eligible: false }),
    });

    await middleware(req, res, next);

    expect(mockedFetch).toHaveBeenCalledWith(
      'http://qi:8100/v1/classify',
      expect.objectContaining({ timeout: 750 }),
    );
  });

  it('returns 502 when the service is unreachable', async () => {
    process.env.QUERY_INTENT_SERVICE_URL = 'http://qi:8100';
    middleware = require('./queryIntent').default;
    const mockedFetch = require('node-fetch');

    mockedFetch.mockRejectedValue(new Error('ECONNREFUSED'));

    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(502);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.stringContaining('Query intent service unavailable'),
      }),
    );
  });

  it('returns 502 with a fixed message when the service times out (no URL leak)', async () => {
    process.env.QUERY_INTENT_SERVICE_URL = 'http://qi:8100';
    process.env.QUERY_INTENT_TIMEOUT_MS = '1';
    middleware = require('./queryIntent').default;
    const mockedFetch = require('node-fetch');

    const timeoutError = new Error('request timed out');
    timeoutError.type = 'request-timeout';
    mockedFetch.mockRejectedValue(timeoutError);

    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(502);
    expect(res.send).toHaveBeenCalledWith({
      error: 'Query intent service unavailable',
    });
  });

  it('never forwards the internal service URL from connection errors', async () => {
    process.env.QUERY_INTENT_SERVICE_URL = 'http://qi.internal:8100';
    middleware = require('./queryIntent').default;
    const mockedFetch = require('node-fetch');

    mockedFetch.mockRejectedValue(
      new Error(
        "request to 'http://qi.internal:8100/v1/classify' failed, reason: connect ECONNREFUSED",
      ),
    );

    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(502);
    const payload = res.send.mock.calls[0][0];
    expect(JSON.stringify(payload)).not.toContain('qi.internal');
    expect(JSON.stringify(payload)).not.toContain('http://');
  });

  it('falls back to the 2000ms timeout for invalid QUERY_INTENT_TIMEOUT_MS values', async () => {
    for (const bad of ['abc', '0', '-5', '']) {
      process.env.QUERY_INTENT_SERVICE_URL = 'http://qi:8100';
      process.env.QUERY_INTENT_TIMEOUT_MS = bad;
      middleware = require('./queryIntent').default;
      const mockedFetch = require('node-fetch');
      mockedFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ eligible: false }),
      });

      await middleware(req, res, next);

      expect(mockedFetch).toHaveBeenCalledWith(
        'http://qi:8100/v1/classify',
        expect.objectContaining({ timeout: 2000 }),
      );
    }
  });

  it('forwards the upstream error status and body when the service fails', async () => {
    process.env.QUERY_INTENT_SERVICE_URL = 'http://qi:8100';
    middleware = require('./queryIntent').default;
    const mockedFetch = require('node-fetch');

    mockedFetch.mockResolvedValue({
      ok: false,
      status: 503,
      text: () =>
        Promise.resolve(
          JSON.stringify({ error: 'classifier unavailable', detail: 'nope' }),
        ),
    });

    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.send).toHaveBeenCalledWith({
      error: 'Query intent service error (503)',
    });
  });

  it('returns 503 when QUERY_INTENT_SERVICE_URL is not configured', async () => {
    delete process.env.QUERY_INTENT_SERVICE_URL;
    middleware = require('./queryIntent').default;
    const mockedFetch = require('node-fetch');

    await middleware(req, res, next);

    expect(mockedFetch).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(503);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.stringContaining('QUERY_INTENT_SERVICE_URL'),
      }),
    );
  });

  it('rejects disallowed paths with 404', async () => {
    process.env.QUERY_INTENT_SERVICE_URL = 'http://qi:8100';
    middleware = require('./queryIntent').default;

    req.url = '/_qi/admin/config';
    req.method = 'POST';

    await middleware(req, res, next);

    expect(res.statusCode).toBe(404);
    expect(res.send).toHaveBeenCalledWith({ error: 'Not Found' });
  });

  it('rejects allowed path with wrong HTTP method', async () => {
    process.env.QUERY_INTENT_SERVICE_URL = 'http://qi:8100';
    middleware = require('./queryIntent').default;

    req.url = '/_qi/classify';
    req.method = 'GET';

    await middleware(req, res, next);

    expect(res.statusCode).toBe(404);
    expect(res.send).toHaveBeenCalledWith({ error: 'Not Found' });
  });
});

describe('queryIntent path allowlist', () => {
  it('allows /classify with POST', () => {
    expect(isPathAllowed('/classify', 'POST', ALLOWED_PATHS)).toBe(true);
  });

  it('allows /health with GET', () => {
    expect(isPathAllowed('/health', 'GET', ALLOWED_PATHS)).toBe(true);
  });

  it('rejects /classify with GET', () => {
    expect(isPathAllowed('/classify', 'GET', ALLOWED_PATHS)).toBe(false);
  });

  it('rejects /health with POST', () => {
    expect(isPathAllowed('/health', 'POST', ALLOWED_PATHS)).toBe(false);
  });

  it('rejects disallowed paths', () => {
    expect(isPathAllowed('/admin/config', 'POST', ALLOWED_PATHS)).toBe(false);
    expect(isPathAllowed('/../../etc/passwd', 'POST', ALLOWED_PATHS)).toBe(
      false,
    );
  });

  it('strips query strings before comparison', () => {
    expect(isPathAllowed('/classify?x=1', 'POST', ALLOWED_PATHS)).toBe(true);
  });
});
