import { GRID_COLS, GRID_ROWS } from '@/features/grid/gridConfig';
import { GridDots } from '@/features/grid/gridDots';
import { GridPlaceholder } from '@/features/grid/gridPlaceholder';
import { useWidgetGrid } from '@/features/grid/useWidgetGrid';
import Box from '@mui/material/Box';
import type { ReactNode } from 'react';

export type WidgetGridProps = {
  children?: ReactNode;
};

export const WidgetGrid = ({ children }: WidgetGridProps) => {
  const { emptyCells } = useWidgetGrid(children);

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'grid',
        gridTemplateRows: `repeat(${GRID_ROWS}, minmax(0, 1fr))`,
        gridTemplateColumns: `repeat(${GRID_COLS}, minmax(0, 1fr))`,
        width: '100%',
        height: '100%',
      }}
    >
      {emptyCells.map((cell) => (
        <GridPlaceholder key={`${cell.row}-${cell.col}`} cell={cell} />
      ))}
      {children}
      <GridDots />
    </Box>
  );
};
