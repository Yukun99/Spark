import { GRID_COLS, GRID_ROWS } from '@/features/grid/gridConfig';
import { gray } from '@/styles/palette';
import Box from '@mui/material/Box';

const DOT_PX = '3px';

const innerIntersections = Array.from({ length: GRID_ROWS - 1 }, (_, r) =>
  Array.from({ length: GRID_COLS - 1 }, (_, c) => ({ row: r + 1, col: c + 1 })),
).flat();

export const GridDots = () => (
  <>
    {innerIntersections.map(({ row, col }) => (
      <Box
        key={`${row}-${col}`}
        data-testid='grid-dot'
        sx={{
          position: 'absolute',
          top: `${(row / GRID_ROWS) * 100}%`,
          left: `${(col / GRID_COLS) * 100}%`,
          width: DOT_PX,
          height: DOT_PX,
          borderRadius: '50%',
          bgcolor: gray[50],
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
        }}
      />
    ))}
  </>
);