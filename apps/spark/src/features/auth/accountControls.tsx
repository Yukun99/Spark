import { ClearButton } from '@/common/components/buttons/clearButton';
import { useAccountMenu } from '@/features/auth/hooks/useAccountMenu';
import { gray } from '@/styles/palette';
import LogoutIcon from '@mui/icons-material/Logout';
import Typography from '@mui/material/Typography';

const NAME_FONT_PX = 12;

/** Signed-in username for the banner; nothing while signed out. */
export const AccountName = () => {
  const { username } = useAccountMenu();
  if (username === null) return null;
  return <Typography sx={{ fontSize: NAME_FONT_PX, color: gray[50] }}>{username}</Typography>;
};

export const SignOutButton = () => {
  const { username, signOut } = useAccountMenu();
  if (username === null) return null;
  return (
    <ClearButton rounded onClick={signOut} aria-label='Sign out' sx={{ p: 1 }}>
      <LogoutIcon />
    </ClearButton>
  );
};
