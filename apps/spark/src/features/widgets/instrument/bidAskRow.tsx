import { gray } from '@/styles/palette';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export type BidAskRowProps = {
  bid: string;
  ask: string;
};

const TEXT_PX = 12;

const Side = ({ label, value, labelFirst }: { label: string; value: string; labelFirst: boolean }) => (
  <Box sx={{ flex: 1, display: 'flex', justifyContent: 'space-between', gap: 1, minWidth: 0 }}>
    {labelFirst ? (
      <>
        <Typography sx={{ fontSize: TEXT_PX }}>{label}</Typography>
        <Typography sx={{ fontSize: TEXT_PX }}>{value}</Typography>
      </>
    ) : (
      <>
        <Typography sx={{ fontSize: TEXT_PX }}>{value}</Typography>
        <Typography sx={{ fontSize: TEXT_PX }}>{label}</Typography>
      </>
    )}
  </Box>
);

export const BidAskRow = ({ bid, ask }: BidAskRowProps) => (
  <Box
    data-testid='bid-ask-row'
    sx={(theme) => ({
      display: 'flex',
      alignItems: 'stretch',
      width: '100%',
      p: 1,
      borderRadius: '3px',
      bgcolor: gray[10],
      ...theme.applyStyles('dark', { bgcolor: gray[80] }),
    })}
  >
    <Side label='Bid' value={bid} labelFirst />
    <Box sx={{ width: '1px', mx: 1, bgcolor: gray[50] }} />
    <Side label='Ask' value={ask} labelFirst={false} />
  </Box>
);
