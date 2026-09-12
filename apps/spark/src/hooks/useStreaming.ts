import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleStreaming as toggleStreamingAction } from '@/store/settingsSlice';
import { useCallback } from 'react';

export type UseStreamingResult = {
  streaming: boolean;
  toggleStreaming: () => void;
};

export const useStreaming = (): UseStreamingResult => {
  const streaming = useAppSelector((state) => state.settings.streaming);
  const dispatch = useAppDispatch();
  const toggleStreaming = useCallback(() => dispatch(toggleStreamingAction()), [dispatch]);

  return { streaming, toggleStreaming };
};
