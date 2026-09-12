import { gray, theme as colours } from '@/styles/palette';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export type ValuePairSide = {
  label: string;
  value: string;
  labelFirst?: boolean;
};

export type ValuePairRowProps = {
  left: ValuePairSide;
  right: ValuePairSide;
};

const TEXT_PX = 12;

const Label = ({ children }: { children: string }) => (
  <Typography sx={{ fontSize: TEXT_PX }}>{children}</Typography>
);

/** Value on a chip in the card colour so it stands out from the row strip. */
const Value = ({ children }: { children: string }) => (
  <Typography
    sx={(theme) => ({
      fontSize: TEXT_PX,
      px: 0.75,
      borderRadius: '3px',
      bgcolor: colours.cream,
      ...theme.applyStyles('dark', { bgcolor: colours.navy }),
    })}
  >
    {children}
  </Typography>
);

const Side = ({ label, value, labelFirst = true }: ValuePairSide) => (
  <Box
    sx={{
      flex: 1,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 1,
      minWidth: 0,
    }}
  >
    {labelFirst ? (
      <>
        <Label>{label}</Label>
        <Value>{value}</Value>
      </>
    ) : (
      <>
        <Value>{value}</Value>
        <Label>{label}</Label>
      </>
    )}
  </Box>
);

/** Two label/value pairs side by side on a tinted strip, split by a thin divider. */
export const ValuePairRow = ({ left, right }: ValuePairRowProps) => (
  <Box
    sx={(theme) => ({
      display: 'flex',
      alignItems: 'stretch',
      width: '100%',
      p: 1,
      borderRadius: '3px',
      bgcolor: gray[20],
      ...theme.applyStyles('dark', { bgcolor: gray[70] }),
    })}
  >
    <Side {...left} />
    <Box sx={{ width: '1px', mx: 1, bgcolor: gray[50] }} />
    <Side {...right} />
  </Box>
);
