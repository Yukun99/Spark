import { ApiError, apiFetch, clearToken, describeApiError, isUnauthorized, readToken, writeToken } from '@/connections/api';

const reply = (status: number, body?: unknown) =>
  ({
    ok: status >= 200 && status < 300,
    status,
    url: 'http://localhost/api/x',
    text: () => Promise.resolve(body === undefined ? '' : JSON.stringify(body)),
  }) as Response;

const fetchMock = () => vi.mocked(fetch);

describe('apiFetch', () => {
  beforeEach(() => clearToken());

  it('sends JSON with the bearer token and decodes the reply', async () => {
    writeToken('abc');
    fetchMock().mockResolvedValueOnce(reply(201, { id: 'x' }));
    await expect(apiFetch('/orders', { method: 'POST', body: { size: 1 } })).resolves.toEqual({ id: 'x' });
    expect(fetch).toHaveBeenCalledWith('/api/orders', {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: 'Bearer abc' },
      body: '{"size":1}',
    });
  });

  it('omits the token and content type when not needed', async () => {
    writeToken('abc');
    fetchMock().mockResolvedValueOnce(reply(200, []));
    await apiFetch('/auth/login', { auth: false });
    expect(fetch).toHaveBeenCalledWith('/api/auth/login', { method: 'GET', headers: {}, body: undefined });
  });

  it('resolves to undefined on an empty reply', async () => {
    fetchMock().mockResolvedValueOnce(reply(204));
    await expect(apiFetch('/auth/logout', { method: 'POST' })).resolves.toBeUndefined();
  });

  it('turns error replies into ApiError with the server message', async () => {
    fetchMock().mockResolvedValueOnce(reply(409, { error: 'Order is no longer open' }));
    const error = await apiFetch('/orders/1/cancel').catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 409, message: 'Order is no longer open' });
    expect(describeApiError(error, 'fallback')).toBe('Order is no longer open');
  });

  it('flags 401 and falls back to a generic message when the reply has none', async () => {
    fetchMock().mockResolvedValueOnce(reply(401));
    const error = await apiFetch('/orders').catch((caught: unknown) => caught);
    expect(isUnauthorized(error)).toBe(true);
    expect(describeApiError(error, 'fallback')).toBe('Request failed with status 401');
  });

  it('reports network failures as status 0 with the fallback message', async () => {
    fetchMock().mockRejectedValueOnce(new TypeError('Failed to fetch'));
    const error = await apiFetch('/orders').catch((caught: unknown) => caught);
    expect(error).toMatchObject({ status: 0, message: 'Could not reach the server' });
    expect(describeApiError(error, 'fallback')).toBe('fallback');
    expect(isUnauthorized(error)).toBe(false);
  });
});

describe('token storage', () => {
  it('round-trips through localStorage', () => {
    clearToken();
    expect(readToken()).toBeNull();
    writeToken('t');
    expect(readToken()).toBe('t');
    clearToken();
    expect(readToken()).toBeNull();
  });
});
