const API_BASE = '/api';
const TOKEN_KEY = 'spark-token';
const JSON_TYPE = 'application/json';

export type ApiMethod = 'GET' | 'POST' | 'PUT' | 'PATCH';

export type ApiRequest = {
  method?: ApiMethod;
  body?: unknown;
  /** Send the stored bearer token; off for login and register. */
  auth?: boolean;
};

/** Failed request; `status` is the HTTP status, or 0 when the request never got a response. */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const isUnauthorized = (error: unknown) => error instanceof ApiError && error.status === 401;

/** Message to show the user for a failed request; falls back when the error carries none. */
export const describeApiError = (error: unknown, fallback: string) =>
  error instanceof ApiError && error.status !== 0 ? error.message : fallback;

export const readToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const writeToken = (token: string) => {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // Storage blocked: the session then lasts until reload.
  }
};

export const clearToken = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Nothing to clear.
  }
};

/** Decoded JSON body; a non-JSON error page (a proxy or challenge page) counts as no body. */
const parseBody = async (response: Response): Promise<unknown> => {
  if (response.status === 204) return undefined;
  const text = await response.text();
  if (text === '') return undefined;
  try {
    return JSON.parse(text);
  } catch {
    if (response.ok) throw new ApiError(response.status, 'Unexpected response from the server');
    return undefined;
  }
};

const errorMessage = (body: unknown, status: number) =>
  typeof body === 'object' && body !== null && typeof (body as { error?: unknown }).error === 'string'
    ? (body as { error: string }).error
    : `Request failed with status ${status}`;

/** JSON request to the Spark API; resolves to the decoded body or throws an `ApiError`. */
export const apiFetch = async <T>(
  path: string,
  { method = 'GET', body, auth = true }: ApiRequest = {},
): Promise<T> => {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers['content-type'] = JSON_TYPE;
  const token = auth ? readToken() : null;
  if (token !== null) headers.authorization = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, 'Could not reach the server');
  }
  const decoded = await parseBody(response);
  if (!response.ok) throw new ApiError(response.status, errorMessage(decoded, response.status));
  return decoded as T;
};
