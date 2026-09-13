import '@testing-library/jest-dom/vitest';

// No test may reach the real API by accident; files that need one mock `@/connections/api`.
beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn(() => Promise.reject(new Error('fetch is not available in tests'))),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});
