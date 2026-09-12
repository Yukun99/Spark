import { useDragTarget } from '@/features/grid/hooks/useDragTarget';
import type { GridCell, WidgetLayout } from '@/features/grid/gridTypes';
import { theme as colours } from '@/styles/palette';
import { shadowSx } from '@/styles/shadows';
import { TILE_GAP_PX, TILE_RADIUS_PX } from '@/features/grid/gridConfig';
import Box from '@mui/material/Box';

export type GridPlaceholderProps = {
  cell: GridCell;
};

const covers = (layout: WidgetLayout | null, { row, col }: GridCell) =>
  layout !== null &&
  row >= layout.row &&
  row < layout.row + (layout.rowSpan ?? 1) &&
  col >= layout.col &&
  col < layout.col + (layout.colSpan ?? 1);

export const GridPlaceholder = ({ cell }: GridPlaceholderProps) => {
  const { dragTarget } = useDragTarget();
  const hidden = covers(dragTarget, cell);

  return (
    <Box
      data-testid='grid-placeholder'
      sx={[
        shadowSx('sm'),
        (theme) => ({
          gridRowStart: cell.row,
          gridColumnStart: cell.col,
          m: `${TILE_GAP_PX}px`,
          borderRadius: `${TILE_RADIUS_PX}px`,
          opacity: hidden ? 0 : 1,
          transition: 'opacity 150ms ease-out',
          bgcolor: colours.cream,
          ...theme.applyStyles('dark', { bgcolor: colours.navy }),
        }),
      ]}
    />
  );
};
