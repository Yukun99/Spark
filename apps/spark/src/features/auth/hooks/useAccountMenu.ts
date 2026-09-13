import { logout } from '@/store/authSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useCallback } from 'react';

export type UseAccountMenuResult = {
  /** Null while signed out, so the banner shows nothing. */
  username: string | null;
  signOut: () => void;
};

export const useAccountMenu = (): UseAccountMenuResult => {
  const username = useAppSelector((state) => state.auth.user?.username ?? null);
  const dispatch = useAppDispatch();
  const signOut = useCallback(() => void dispatch(logout()), [dispatch]);

  return { username, signOut };
};
