import type { WidgetLayout } from '@/features/grid/gridTypes';
import { useWidgets } from '@/features/widgets/hooks/useWidgets';
import { useWidgetResize, type ResizeEdge } from '@/features/widgets/hooks/useWidgetResize';
import { WIDGET_SIZES } from '@/features/widgets/widgetSizes';
import type { Widget } from '@/store/widgetsSlice';
import { theme as colours } from '@/styles/palette';
import Box from '@mui/material/Box';
import { useCallback } from 'react';

export type ResizeHandlesProps = {
  widget: Widget;
  /** Card padding the bars are centred in. */
  paddingPx: number;
};

const BAR_LONG_PX = 50;
const BAR_SHORT_PX = 6;
const EDGES: ResizeEdge[] = ['top', 'bottom', 'left', 'right'];

/** Hit area spanning the full padding depth along one edge, with the pill centred inside it. */
const hitSx = (edge: ResizeEdge, paddingPx: number) => {
  const vertical = edge === 'top' || edge === 'bottom';
  return {
    position: 'absolute' as const,
    zIndex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    touchAction: 'none' as const,
    width: vertical ? BAR_LONG_PX : paddingPx,
    height: vertical ? paddingPx : BAR_LONG_PX,
    cursor: vertical ? 'ns-resize' : 'ew-resize',
    [edge]: 0,
    ...(vertical ? { left: '50%', transform: 'translateX(-50%)' } : { top: '50%', transform: 'translateY(-50%)' }),
  };
};

const pillSx = (edge: ResizeEdge) => {
  const vertical = edge === 'top' || edge === 'bottom';
  return {
    borderRadius: `${BAR_SHORT_PX / 2}px`,
    bgcolor: colours.purple,
    width: vertical ? BAR_LONG_PX : BAR_SHORT_PX,
    height: vertical ? BAR_SHORT_PX : BAR_LONG_PX,
  };
};

/** Drag pills on all four card edges, each inside a padding-deep hit area, that snap the size. */
export const ResizeHandles = ({ widget, paddingPx }: ResizeHandlesProps) => {
  const { resizeWidget } = useWidgets();
  const onResize = useCallback(
    (layout: WidgetLayout) => resizeWidget(widget.id, layout),
    [resizeWidget, widget.id],
  );
  const { handlersFor } = useWidgetResize({
    layout: widget.layout,
    minSize: WIDGET_SIZES[widget.type],
    onResize,
  });

  return (
    <>
      {EDGES.map((edge) => (
        <Box
          key={edge}
          data-testid={`resize-handle-${edge}`}
          aria-label={`Resize from ${edge}`}
          {...handlersFor(edge)}
          sx={hitSx(edge, paddingPx)}
        >
          <Box sx={pillSx(edge)} />
        </Box>
      ))}
    </>
  );
};
