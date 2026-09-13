import { useSession } from '@/features/auth/hooks/useSession';
import { login, register } from '@/store/authSlice';
import { useAppDispatch } from '@/store/hooks';
import { showNotice } from '@/store/noticeSlice';
import { useCallback, useMemo, useState, type FormEvent } from 'react';
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
export const FIELD_MAX = 32;
const USERNAME_MIN = 3;
const USERNAME_PATTERN = /^[A-Za-z0-9_]+$/;
const PASSWORD_MIN = 8;
const SPACE_ERROR = 'Spaces are not allowed';

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

export const validateUsername = (username: string) => {
  if (username.length > FIELD_MAX) return `At most ${FIELD_MAX} characters`;
  if (username.length < USERNAME_MIN || !USERNAME_PATTERN.test(username)) {
    return `${USERNAME_MIN} to ${FIELD_MAX} letters, digits or underscores`;
  }
  return null;
};

export const validatePassword = (password: string) => {
  const bytes = new TextEncoder().encode(password).length;
  if (bytes < PASSWORD_MIN) return `At least ${PASSWORD_MIN} characters`;
  if (bytes > FIELD_MAX) return `At most ${FIELD_MAX} characters`;
  return null;
};

/** Drops spaces from typed or pasted input; `spaced` says whether any were dropped. */
const stripSpaces = (value: string) => {
  const stripped = value.replace(/\s/g, '');
  return { stripped, spaced: stripped !== value };
};

type Field = 'username' | 'password' | 'confirm';
const untouched: Record<Field, boolean> = { username: false, password: false, confirm: false };

export const useLoginPage = ({ mode }: UseLoginPageParams): UseLoginPageResult => {
  const { status } = useSession();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [username, setUsernameState] = useState('');
  const [password, setPasswordState] = useState('');
  const [confirmPassword, setConfirmPasswordState] = useState('');
  const [touched, setTouched] = useState(untouched);
  /** Fields whose last edit contained a space; the warning shows until the next clean edit. */
  const [spaced, setSpaced] = useState(untouched);
  const [submitting, setSubmitting] = useState(false);

  const setter = useCallback(
    (field: Field, set: (value: string) => void) => (value: string) => {
      const next = stripSpaces(value);
      setTouched((prev) => ({ ...prev, [field]: true }));
      setSpaced((prev) => ({ ...prev, [field]: next.spaced }));
      set(next.stripped);
    },
    [],
  );
  const setUsername = useMemo(() => setter('username', setUsernameState), [setter]);
  const setPassword = useMemo(() => setter('password', setPasswordState), [setter]);
  const setConfirmPassword = useMemo(() => setter('confirm', setConfirmPasswordState), [setter]);

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
    usernameError: spaced.username ? SPACE_ERROR : touched.username ? usernameInvalid : null,
    passwordError: spaced.password ? SPACE_ERROR : touched.password ? passwordInvalid : null,
    confirmPasswordError: spaced.confirm ? SPACE_ERROR : touched.confirm ? confirmInvalid : null,
    submitting,
    canSubmit,
    signedIn: status === 'signedIn',
    submit,
    switchMode,
  };
};
