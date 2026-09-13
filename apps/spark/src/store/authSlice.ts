import {
  apiFetch,
  clearToken,
  describeApiError,
  readToken,
  writeToken,
} from '@/connections/api';
import { createAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';

export type User = { id: number; username: string };

export type Credentials = { username: string; password: string };

type Session = { token: string; user: User };

/** unknown: not checked yet; checking: validating a stored token. */
export type AuthStatus = 'unknown' | 'checking' | 'signedIn' | 'signedOut';

/** Loading the signed-in user's orders, settings and widgets from the server. */
export type HydrationStatus = 'pending' | 'loading' | 'done' | 'failed';

export type AuthState = {
  status: AuthStatus;
  user: User | null;
  hydration: HydrationStatus;
};

const initialState: AuthState = { status: 'unknown', user: null, hydration: 'pending' };

const NO_TOKEN = 'no token';

/** Drops the token and resets every slice; dispatched on logout and on any 401. */
export const sessionCleared = createAction('auth/sessionCleared');

export const restoreSession = createAsyncThunk('auth/restore', async (_, { rejectWithValue }) => {
  if (readToken() === null) return rejectWithValue(NO_TOKEN);
  try {
    return await apiFetch<User>('/auth/me');
  } catch (error) {
    clearToken();
    return rejectWithValue(describeApiError(error, 'Could not restore the session'));
  }
});

const signIn = (path: string, fallback: string) =>
  createAsyncThunk<User, Credentials, { rejectValue: string }>(
    `auth/${path}`,
    async (credentials, { rejectWithValue }) => {
      try {
        const session = await apiFetch<Session>(`/auth/${path}`, {
          method: 'POST',
          body: credentials,
          auth: false,
        });
        writeToken(session.token);
        return session.user;
      } catch (error) {
        return rejectWithValue(describeApiError(error, fallback));
      }
    },
  );

export const login = signIn('login', 'Could not sign in');
export const register = signIn('register', 'Could not create the account');

export const logout = createAsyncThunk('auth/logout', async (_, { dispatch }) => {
  try {
    await apiFetch('/auth/logout', { method: 'POST' });
  } catch {
    // The token is dropped either way.
  }
  clearToken();
  dispatch(sessionCleared());
});

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    hydrationStarted: (state) => {
      state.hydration = 'loading';
    },
    hydrationFinished: (state) => {
      state.hydration = 'done';
    },
    hydrationFailed: (state) => {
      state.hydration = 'failed';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sessionCleared, (state) => {
        state.status = 'signedOut';
        state.user = null;
        state.hydration = 'pending';
      })
      .addCase(restoreSession.pending, (state) => {
        state.status = 'checking';
      })
      .addCase(restoreSession.rejected, (state) => {
        state.status = 'signedOut';
        state.user = null;
      });
    for (const thunk of [restoreSession, login, register]) {
      builder.addCase(thunk.fulfilled, (state, action) => {
        state.status = 'signedIn';
        state.user = action.payload;
        state.hydration = 'pending';
      });
    }
  },
});

export const { hydrationStarted, hydrationFinished, hydrationFailed } = authSlice.actions;
export const authReducer = authSlice.reducer;
