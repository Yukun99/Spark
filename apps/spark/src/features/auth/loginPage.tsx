import { ClearButton } from '@/components/buttons/clearButton';
import { FilledButton } from '@/components/buttons/filledButton';
import { useLoginPage, type LoginMode } from '@/features/auth/hooks/useLoginPage';
import { gray, status, theme as colours } from '@/styles/palette';
import { shadowSx } from '@/styles/shadows';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { Theme } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Navigate } from 'react-router-dom';

export type LoginPageProps = {
  mode: LoginMode;
};

const CARD_WIDTH_PX = 360;
const CARD_RADIUS_PX = 8;
const CAPTION_FONT_PX = 10;
const CAPTION_LINE_PX = 15;
const CAPTION_GAP_PX = 3;
const TITLE_FONT_PX = 20;

/** Caption under a field, always rendered so the rows below never shift. */
const captionProps = (error: string | null) => ({
  formHelperText: {
    sx: (theme: Theme) => ({
      fontSize: CAPTION_FONT_PX,
      lineHeight: `${CAPTION_LINE_PX}px`,
      mt: `${CAPTION_GAP_PX}px`,
      mx: 0,
      color: error === null ? gray[50] : status.error.light,
      ...theme.applyStyles('dark', { color: error === null ? gray[50] : status.error.dark }),
    }),
  },
});

const cardSx = [
  shadowSx('lg'),
  (theme: Theme) => ({
    width: CARD_WIDTH_PX,
    maxWidth: '100%',
    p: 3,
    borderRadius: `${CARD_RADIUS_PX}px`,
    bgcolor: colours.cream,
    color: colours.navy,
    ...theme.applyStyles('dark', { bgcolor: colours.navy, color: colours.cream }),
  }),
];

export const LoginPage = ({ mode }: LoginPageProps) => {
  const {
    title,
    submitLabel,
    switchLabel,
    username,
    password,
    confirmPassword,
    setUsername,
    setPassword,
    setConfirmPassword,
    usernameError,
    passwordError,
    confirmPasswordError,
    submitting,
    canSubmit,
    signedIn,
    submit,
    switchMode,
  } = useLoginPage({ mode });

  if (signedIn) return <Navigate to='/' replace />;

  return (
    <Box component='main' sx={{ display: 'flex', justifyContent: 'center', pt: 10, px: 2 }}>
      <Stack component='form' onSubmit={submit} noValidate sx={cardSx} spacing={1}>
        <Typography component='h2' sx={{ fontSize: TITLE_FONT_PX, fontWeight: 500, mb: 1 }}>
          {title}
        </Typography>
        <TextField
          label='Username'
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          error={usernameError !== null}
          helperText={usernameError ?? ' '}
          slotProps={{ ...captionProps(usernameError), htmlInput: { autoComplete: 'username' } }}
          autoFocus
          size='small'
        />
        <TextField
          label='Password'
          type='password'
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={passwordError !== null}
          helperText={passwordError ?? ' '}
          slotProps={{
            ...captionProps(passwordError),
            htmlInput: { autoComplete: mode === 'login' ? 'current-password' : 'new-password' },
          }}
          size='small'
        />
        {mode === 'register' && (
          <TextField
            label='Confirm password'
            type='password'
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            error={confirmPasswordError !== null}
            helperText={confirmPasswordError ?? ' '}
            slotProps={{
              ...captionProps(confirmPasswordError),
              htmlInput: { autoComplete: 'new-password' },
            }}
            size='small'
          />
        )}
        <FilledButton type='submit' disabled={!canSubmit} sx={{ mt: 1 }}>
          {submitting ? 'Please wait…' : submitLabel}
        </FilledButton>
        <ClearButton onClick={switchMode} disabled={submitting}>
          {switchLabel}
        </ClearButton>
      </Stack>
    </Box>
  );
};
