import { GRID_COLS, GRID_ROWS } from '@/features/grid/gridConfig';
import { GridDots } from '@/features/grid/gridDots';
import { getEmptyCells } from '@/features/grid/gridOccupancy';
import { GridPlaceholder } from '@/features/grid/gridPlaceholder';
import { useDragTarget } from '@/features/grid/hooks/useDragTarget';
import type { WidgetLayout } from '@/features/grid/gridTypes';
import { sameLayout } from '@/store/layoutSlice';
import Box from '@mui/material/Box';
import { useMemo, type ReactNode } from 'react';

export type WidgetGridProps = {
  layouts: WidgetLayout[];
  children?: ReactNode;
};

/** Cells not covered by a widget; a widget being dragged frees its own cells so they can show. */
export const WidgetGrid = ({ layouts, children }: WidgetGridProps) => {
  const { dragSource } = useDragTarget();
  const emptyCells = useMemo(
    () => getEmptyCells(layouts.filter((layout) => !sameLayout(layout, dragSource))),
    [layouts, dragSource],
  );

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
