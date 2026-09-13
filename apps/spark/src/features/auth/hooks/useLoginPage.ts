import { useSession } from '@/features/auth/hooks/useSession';
import { login, register } from '@/store/authSlice';
import { useAppDispatch } from '@/store/hooks';
import { showNotice } from '@/store/noticeSlice';
import { useCallback, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

export type LoginMode = 'login' | 'register';

export type UseLoginPageParams = {
  mode: LoginMode;
};

export type UseLoginPageResult = {
  title: string;
  submitLabel: string;
  switchLabel: string;
  username: string;
  password: string;
  confirmPassword: string;
  setUsername: (value: string) => void;
  setPassword: (value: string) => void;
  setConfirmPassword: (value: string) => void;
  /** Shown once a field has been edited; null while valid or untouched. */
  usernameError: string | null;
  passwordError: string | null;
  confirmPasswordError: string | null;
  submitting: boolean;
  canSubmit: boolean;
  /** True once a valid stored session is found, so the page hands over to the app. */
  signedIn: boolean;
  submit: (event: FormEvent) => void;
  switchMode: () => void;
};

/** Mirrors the API's rules so a bad value never leaves the browser. */
const USERNAME_PATTERN = /^[A-Za-z0-9_]{3,32}$/;
const PASSWORD_MIN = 8;
const PASSWORD_MAX = 72;

const COPY = {
  login: {
    title: 'Sign In',
    submitLabel: 'Sign in',
    switchLabel: 'Create an account',
    other: '/register',
    thunk: login,
  },
  register: {
    title: 'Create Account',
    submitLabel: 'Create account',
    switchLabel: 'I already have an account',
    other: '/login',
    thunk: register,
  },
} as const;

export const validateUsername = (username: string) =>
  USERNAME_PATTERN.test(username) ? null : '3 to 32 letters, digits or underscores';

export const validatePassword = (password: string) => {
  const bytes = new TextEncoder().encode(password).length;
  if (bytes < PASSWORD_MIN) return `At least ${PASSWORD_MIN} characters`;
  if (bytes > PASSWORD_MAX) return `At most ${PASSWORD_MAX} characters`;
  return null;
};

export const useLoginPage = ({ mode }: UseLoginPageParams): UseLoginPageResult => {
  const { status } = useSession();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [username, setUsernameState] = useState('');
  const [password, setPasswordState] = useState('');
  const [confirmPassword, setConfirmPasswordState] = useState('');
  const [touched, setTouched] = useState({ username: false, password: false, confirm: false });
  const [submitting, setSubmitting] = useState(false);

  const setUsername = useCallback((value: string) => {
    setTouched((prev) => ({ ...prev, username: true }));
    setUsernameState(value);
  }, []);
  const setPassword = useCallback((value: string) => {
    setTouched((prev) => ({ ...prev, password: true }));
    setPasswordState(value);
  }, []);
  const setConfirmPassword = useCallback((value: string) => {
    setTouched((prev) => ({ ...prev, confirm: true }));
    setConfirmPasswordState(value);
  }, []);

  const usernameInvalid = validateUsername(username);
  const passwordInvalid = validatePassword(password);
  const confirmInvalid =
    mode === 'register' && confirmPassword !== password ? 'Passwords do not match' : null;
  const canSubmit =
    !submitting && usernameInvalid === null && passwordInvalid === null && confirmInvalid === null;

  const submit = useCallback(
    (event: FormEvent) => {
      event.preventDefault();
      if (!canSubmit) return;
      setSubmitting(true);
      void dispatch(COPY[mode].thunk({ username, password }))
        .unwrap()
        .then(() => navigate('/', { replace: true }))
        .catch((message: string) => {
          dispatch(showNotice(message));
          setSubmitting(false);
        });
    },
    [canSubmit, dispatch, mode, navigate, password, username],
  );

  const switchMode = useCallback(() => navigate(COPY[mode].other), [mode, navigate]);

  return {
    title: COPY[mode].title,
    submitLabel: COPY[mode].submitLabel,
    switchLabel: COPY[mode].switchLabel,
    username,
    password,
    confirmPassword,
    setUsername,
    setPassword,
    setConfirmPassword,
    usernameError: touched.username ? usernameInvalid : null,
    passwordError: touched.password ? passwordInvalid : null,
    confirmPasswordError: touched.confirm ? confirmInvalid : null,
    submitting,
    canSubmit,
    signedIn: status === 'signedIn',
    submit,
    switchMode,
  };
};
