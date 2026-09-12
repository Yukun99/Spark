import { STRIP_TEXT_PX, ValueChip, ValueStrip } from '@/features/widgets/valueStrip';
import { gray } from '@/styles/palette';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';

export type ValuePairSide = {
  label: string;
  /** Strings go on a chip; anything else (e.g. a trade side chip) renders as given. */
  value: ReactNode;
};

export type ValuePairRowProps = {
  left: ValuePairSide;
  right: ValuePairSide;
};

const Label = ({ children }: { children: string }) => (
  <Typography sx={{ fontSize: STRIP_TEXT_PX }}>{children}</Typography>
);

const Value = ({ value }: Pick<ValuePairSide, 'value'>) =>
  typeof value === 'string' ? <ValueChip>{value}</ValueChip> : value;

type SideProps = ValuePairSide & { align: 'start' | 'end' };

/** Label stacked over its value, hugging the strip's outer edge. */
const Side = ({ label, value, align }: SideProps) => (
  <Box
    sx={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: `flex-${align}`,
      gap: 0.5,
      minWidth: 0,
    }}
  >
    <Label>{label}</Label>
    <Value value={value} />
  </Box>
);

/** Two stacked label/value pairs side by side on a tinted strip, split by a thin divider. */
export const ValuePairRow = ({ left, right }: ValuePairRowProps) => (
  <ValueStrip sx={{ display: 'flex', alignItems: 'stretch' }}>
    <Side {...left} align='start' />
    <Box sx={{ width: '1px', mx: 1, bgcolor: gray[50] }} />
    <Side {...right} align='end' />
  </ValueStrip>
);