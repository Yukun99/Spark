import Box from '@mui/material/Box';
import type { ReactNode } from 'react';

export type WidgetLayout = {
  row: number;
  col: number;
  rowSpan?: number;
  colSpan?: number;
};

export type GridWidgetProps = {
  layout: WidgetLayout;
  children?: ReactNode;
};

export const GridWidget = ({ layout, children }: GridWidgetProps) => {
  const { row, col, rowSpan = 1, colSpan = 1 } = layout;

  return (
    <Box
      sx={{
        gridRowStart: row,
        gridRowEnd: `span ${rowSpan}`,
        gridColumnStart: col,
        gridColumnEnd: `span ${colSpan}`,
        minWidth: 0,
        minHeight: 0,
      }}
    >
      {children}
    </Box>
  );
};
