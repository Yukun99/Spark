import type { GridCell } from '@/features/grid/gridOccupancy';
import { theme as colours, gray } from '@/styles/palette';
import { shadowSx } from '@/styles/shadows';
import Box from '@mui/material/Box';

export type GridPlaceholderProps = {
  cell: GridCell;
};

const LINE_COUNT = 5;

export const GridPlaceholder = ({ cell: { row, col } }: GridPlaceholderProps) => (
  <Box
    data-testid='grid-placeholder'
    sx={[
      shadowSx('sm'),
      (theme) => ({
        gridRowStart: row,
        gridColumnStart: col,
        m: 3,
        p: 3,
        borderRadius: '24px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-evenly',
        bgcolor: colours.cream,
        ...theme.applyStyles('dark', { bgcolor: colours.navy }),
      }),
    ]}
  >
    {Array.from({ length: LINE_COUNT }, (_, i) => (
      <Box
        key={i}
        data-testid='grid-placeholder-line'
        sx={{ height: '0.5px', bgcolor: gray[50] }}
      />
    ))}
  </Box>
);