import { useDragTarget } from '@/features/grid/hooks/useDragTarget';
import type { GridCell, WidgetLayout } from '@/features/grid/gridTypes';
import { gray, theme as colours } from '@/styles/palette';
import { shadowSx } from '@/styles/shadows';
import Box from '@mui/material/Box';

export type GridPlaceholderProps = {
  cell: GridCell;
};

const LINE_COUNT = 5;

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
          m: 3,
          p: 3,
          borderRadius: '24px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-evenly',
          opacity: hidden ? 0 : 1,
          transition: 'opacity 150ms ease-out',
          bgcolor: colours.cream,
          ...theme.applyStyles('dark', { bgcolor: colours.navy }),
        }),
      ]}
    >
      {Array.from({ length: LINE_COUNT }, (_, i) => (
        <Box
          key={i}
          data-testid='grid-placeholder-line'
          sx={{ height: '1.5px', bgcolor: gray[50] }}
        />
      ))}
    </Box>
  );
};
