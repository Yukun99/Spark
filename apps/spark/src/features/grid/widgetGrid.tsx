import { GRID_COLS, GRID_ROWS } from '@/features/grid/gridConfig';
import { GridDots } from '@/features/grid/gridDots';
import { getEmptyCells } from '@/features/grid/gridOccupancy';
import { GridPlaceholder } from '@/features/grid/gridPlaceholder';
import type { WidgetLayout } from '@/features/grid/gridTypes';
import Box from '@mui/material/Box';
import { useMemo, type ReactNode } from 'react';

export type WidgetGridProps = {
  layouts: WidgetLayout[];
  children?: ReactNode;
};

export const WidgetGrid = ({ layouts, children }: WidgetGridProps) => {
  const emptyCells = useMemo(() => getEmptyCells(layouts), [layouts]);

  return (
    <Box
      data-widget-grid
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
