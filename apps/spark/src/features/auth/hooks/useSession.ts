import { restoreSession, type AuthStatus, type HydrationStatus, type User } from '@/store/authSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { hydrateSession } from '@/store/hydrate';
import { useCallback, useEffect } from 'react';

export type UseSessionResult = {
  status: AuthStatus;
  user: User | null;
  hydration: HydrationStatus;
  retryHydration: () => void;
};

/** Checks the stored token once on first use, then loads the user's data after sign-in. */
export const useSession = (): UseSessionResult => {
  const { status, user, hydration } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (status === 'unknown') void dispatch(restoreSession());
  }, [dispatch, status]);

  useEffect(() => {
    if (status === 'signedIn' && hydration === 'pending') void dispatch(hydrateSession());
  }, [dispatch, hydration, status]);

  const retryHydration = useCallback(() => void dispatch(hydrateSession()), [dispatch]);

  return { status, user, hydration, retryHydration };
};
