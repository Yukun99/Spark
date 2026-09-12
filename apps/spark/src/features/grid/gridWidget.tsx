import type { WidgetLayout } from '@/features/grid/gridTypes';
import { useSpanTransition } from '@/features/grid/hooks/useSpanTransition';
import Box from '@mui/material/Box';
import { useRef, type ReactNode } from 'react';

export type GridWidgetProps = {
  layout: WidgetLayout;
  raised?: boolean;
  children?: ReactNode;
};

/** Grid cell area for one widget; sits above the grid dots, `raised` lifts it above siblings. */
export const GridWidget = ({ layout, raised = false, children }: GridWidgetProps) => {
  const { row, col, rowSpan = 1, colSpan = 1 } = layout;
  const ref = useRef<HTMLDivElement>(null);
  useSpanTransition(ref, layout);

  return (
    <Box
      ref={ref}
      sx={{
        position: 'relative',
        zIndex: raised ? 2 : 1,
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
