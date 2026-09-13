import { describeApiError, isUnauthorized } from '@/connections/api';
import { sessionCleared } from '@/store/authSlice';
import { showNotice } from '@/store/noticeSlice';
import type { Dispatch, UnknownAction } from '@reduxjs/toolkit';

/** Signs out on 401, otherwise surfaces the failure in the notice snackbar. */
export const reportApiFailure = (
  dispatch: Dispatch<UnknownAction>,
  error: unknown,
  fallback: string,
) => {
  if (isUnauthorized(error)) dispatch(sessionCleared());
  else dispatch(showNotice(describeApiError(error, fallback)));
};
