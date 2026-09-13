import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clearNotice } from '@/store/noticeSlice';
import { useCallback } from 'react';

export type UseNoticeResult = {
  message: string | null;
  dismiss: () => void;
};

export const useNotice = (): UseNoticeResult => {
  const message = useAppSelector((state) => state.notice.message);
  const dispatch = useAppDispatch();
  const dismiss = useCallback(() => dispatch(clearNotice()), [dispatch]);

  return { message, dismiss };
};
