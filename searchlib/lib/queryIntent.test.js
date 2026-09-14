import { classifyQuery } from './queryIntent';

describe('classifyQuery (query-intent client)', () => {
  let mockFetch;

  const okResponse = (data) => ({
    ok: true,
    status: 200,
    json: () => Promise.resolve(data),
  });

  const eligible = {
    intent: 'question',
    eligible: true,
    abstained: false,
    reason: 'classified',
    model_version: 'setfit-v4',
  };

  const notEligible = {
    intent: 'unknown',
    eligible: false,
    abstained: true,
    reason: 'below_threshold',
    model_version: 'setfit-v4',
  };

  beforeEach(() => {
    mockFetch = jest.fn();
    global.fetch = mockFetch;
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it('returns not eligible without a request for an empty query', async () => {
    await expect(classifyQuery('')).resolves.toEqual({
      eligible: false,
      reason: 'empty',
    });
    await expect(classifyQuery('   ')).resolves.toEqual({
      eligible: false,
      reason: 'empty',
    });
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('returns not eligible without a request for a non-string query', async () => {
    await expect(classifyQuery(undefined)).resolves.toEqual({
      eligible: false,
      reason: 'empty',
    });
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('returns not eligible without a request for a query over 20 words', async () => {
    const longQuery = Array.from({ length: 21 }, (_, i) => `word${i}`).join(
      ' ',
    );
    await expect(classifyQuery(longQuery)).resolves.toEqual({
      eligible: false,
      reason: 'too-long',
    });
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('returns not eligible without a request for a query over 500 chars', async () => {
    const longQuery = 'a'.repeat(501);
    await expect(classifyQuery(longQuery)).resolves.toEqual({
      eligible: false,
      reason: 'too-long',
    });
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('posts the query to the same-origin proxy and maps eligible=true', async () => {
    mockFetch.mockResolvedValue(okResponse(eligible));

    const result = await classifyQuery('Why are wetlands important?');

    expect(mockFetch).toHaveBeenCalledWith(
      '/_qi/classify',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: 'Why are wetlands important?' }),
      }),
    );
    expect(result).toEqual({ eligible: true, reason: 'classified' });
  });

  it('maps an abstention (eligible=false) to not eligible', async () => {
    mockFetch.mockResolvedValue(okResponse(notEligible));

    await expect(classifyQuery('water framework directive')).resolves.toEqual(
      expect.objectContaining({ eligible: false }),
    );
  });

  it('treats a contract-violating payload (eligible + abstained) as not eligible', async () => {
    mockFetch.mockResolvedValue(
      okResponse({
        intent: 'question',
        eligible: true,
        abstained: true,
        reason: 'classified',
      }),
    );

    await expect(classifyQuery('Why are wetlands important?')).resolves.toEqual(
      expect.objectContaining({ eligible: false }),
    );
  });

  it('treats a non-2xx response as not eligible (fail closed)', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 503 });

    await expect(classifyQuery('Why are wetlands important?')).resolves.toEqual(
      {
        eligible: false,
        reason: 'service-error',
      },
    );
  });

  it('treats a network failure as not eligible (fail closed)', async () => {
    mockFetch.mockRejectedValue(new TypeError('network down'));

    await expect(classifyQuery('Why are wetlands important?')).resolves.toEqual(
      {
        eligible: false,
        reason: 'service-error',
      },
    );
  });

  it('treats a malformed JSON body as not eligible (fail closed)', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.reject(new SyntaxError('Unexpected token')),
    });

    await expect(classifyQuery('Why are wetlands important?')).resolves.toEqual(
      {
        eligible: false,
        reason: 'bad-response',
      },
    );
  });

  it('treats a timeout as not eligible (fail closed)', async () => {
    mockFetch.mockImplementation(
      (_url, { signal }) =>
        new Promise((resolve, reject) => {
          signal.addEventListener('abort', () => {
            const err = new Error('Aborted');
            err.name = 'AbortError';
            reject(err);
          });
        }),
    );

    const started = classifyQuery('Why are wetlands important?', {
      timeoutMs: 20,
    });
    await expect(started).resolves.toEqual({
      eligible: false,
      reason: 'timeout',
    });
    await new Promise((r) => setTimeout(r, 50));
  });

  it('honours an external abort signal (superseded search)', async () => {
    mockFetch.mockImplementation(
      (_url, { signal }) =>
        new Promise((resolve, reject) => {
          signal.addEventListener('abort', () => {
            const err = new Error('Aborted');
            err.name = 'AbortError';
            reject(err);
          });
        }),
    );

    const controller = new AbortController();
    const started = classifyQuery('Why are wetlands important?', {
      signal: controller.signal,
    });
    controller.abort();

    await expect(started).resolves.toEqual({
      eligible: false,
      reason: 'aborted',
    });
  });

  it('never throws, even on a rejecting promise chain', async () => {
    mockFetch.mockRejectedValue(new Error('boom'));
    await expect(
      classifyQuery('Why are wetlands important?'),
    ).resolves.toBeDefined();
  });
});
