import { apiFetch } from '@/connections/api';
import { createFakeApi, type FakeApiState } from '@/test/fixtures/fakeApi';

/**
 * Points the mocked `apiFetch` at a fresh fake. The test file must first hoist
 * `vi.mock('@/connections/api', ...)` replacing `apiFetch` with `vi.fn()`.
 */
export const installFakeApi = (overrides: Partial<FakeApiState> = {}) => {
  const fake = createFakeApi(overrides);
  vi.mocked(apiFetch).mockImplementation(fake.handle);
  return fake;
};
