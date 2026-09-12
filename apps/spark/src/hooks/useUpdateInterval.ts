import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  cycleUpdateInterval as cycleUpdateIntervalAction,
  setUpdateInterval as setUpdateIntervalAction,
} from '@/store/settingsSlice';
import { useCallback } from 'react';

export type UseUpdateIntervalResult = {
  updateIntervalMs: number;
  updateIntervalLabel: string;
  setUpdateInterval: (ms: number) => void;
  cycleUpdateInterval: () => void;
};

/** Formats an interval as `250ms` below one second, otherwise `2s`. */
export const formatInterval = (ms: number): string =>
  ms < 1000 ? `${ms}ms` : `${ms / 1000}s`;

export const useUpdateInterval = (): UseUpdateIntervalResult => {
  const updateIntervalMs = useAppSelector((state) => state.settings.updateIntervalMs);
  const dispatch = useAppDispatch();
  const setUpdateInterval = useCallback(
    (ms: number) => dispatch(setUpdateIntervalAction(ms)),
    [dispatch],
  );
  const cycleUpdateInterval = useCallback(() => dispatch(cycleUpdateIntervalAction()), [dispatch]);

  return {
    updateIntervalMs,
    updateIntervalLabel: formatInterval(updateIntervalMs),
    setUpdateInterval,
    cycleUpdateInterval,
  };
};
