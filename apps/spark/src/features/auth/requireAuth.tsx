import { FilledButton } from '@/common/components/buttons/filledButton';
import { useSession } from '@/features/auth/hooks/useSession';
import { gray } from '@/styles/palette';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

export type RequireAuthProps = {
  children: ReactNode;
};

/** Renders children only for a signed-in, hydrated session; sends everyone else to /login. */
export const RequireAuth = ({ children }: RequireAuthProps) => {
  const { status, hydration, retryHydration } = useSession();

  if (status === 'signedOut') return <Navigate to='/login' replace />;
  if (hydration === 'failed') {
    return (
      <Stack sx={{ alignItems: 'center', gap: 2, pt: 8 }}>
        <Typography sx={{ color: gray[50] }}>Could not load your data.</Typography>
        <FilledButton onClick={retryHydration}>Retry</FilledButton>
      </Stack>
    );
  }
  // The static shell's skeleton stays on screen while the token and data load.
  if (status !== 'signedIn' || hydration !== 'done') return null;
  return children;
};
