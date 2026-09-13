import { useNotice } from '@/common/components/hooks/useNotice';
import { theme as colours, trade } from '@/styles/palette';
import { shadowSx } from '@/styles/shadows';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';

const AUTO_HIDE_MS = 6000;
const ANCHOR = { vertical: 'bottom', horizontal: 'center' } as const;

/** Error toast fed by the notice slice; failed API calls land here. */
export const NoticeSnackbar = () => {
  const { message, dismiss } = useNotice();

  return (
    <Snackbar
      open={message !== null}
      autoHideDuration={AUTO_HIDE_MS}
      onClose={dismiss}
      anchorOrigin={ANCHOR}
    >
      <Alert
        severity='error'
        variant='filled'
        onClose={dismiss}
        sx={[shadowSx('xl'), { bgcolor: trade.sell.dark, color: colours.cream }]}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};
