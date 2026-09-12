import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setUpdateInterval as setUpdateIntervalAction } from '@/store/settingsSlice';
import { useCallback } from 'react';

export type UseUpdateIntervalResult = {
  updateIntervalMs: number;
  setUpdateInterval: (ms: number) => void;
};

export const useUpdateInterval = (): UseUpdateIntervalResult => {
  const updateIntervalMs = useAppSelector((state) => state.settings.updateIntervalMs);
  const dispatch = useAppDispatch();
  const setUpdateInterval = useCallback(
    (ms: number) => dispatch(setUpdateIntervalAction(ms)),
    [dispatch],
  );

  return { updateIntervalMs, setUpdateInterval };
};
