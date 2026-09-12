import { ClearButton } from '@/components/buttons/clearButton';
import { TILE_GAP_PX, TILE_RADIUS_PX } from '@/features/grid/gridConfig';
import { GridWidget } from '@/features/grid/gridWidget';
import { FreshnessGlow } from '@/features/widgets/freshnessGlow';
import { useDragTarget } from '@/features/grid/hooks/useDragTarget';
import { useWidgetDrag } from '@/features/widgets/hooks/useWidgetDrag';
import { LABEL_FONT_PX, LABEL_LINE_PX, WidgetLabel } from '@/features/widgets/widgetLabel';
import { useEditMode } from '@/hooks/useEditMode';
import { useWidgets } from '@/features/widgets/hooks/useWidgets';
import type { Widget } from '@/store/widgetsSlice';
import { theme as colours } from '@/styles/palette';
import { shadowSx } from '@/styles/shadows';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { useCallback, type MouseEvent, type ReactNode } from 'react';

const CARD_PADDING = 2;

export type WidgetFrameProps = {
  widget: Widget;
  name: string;
  onDelete: () => void;
  onModify: () => void;
  onExpand?: () => void;
  tickAt?: number;
  children: ReactNode;
};

/**
 * Card chrome shared by all widgets: drag-to-move, delete and modify actions in edit mode;
 * outside edit mode, clicking the card or its corner icon calls `onExpand`, and `tickAt`
 * restarts a purple glow that fades while no new tick arrives.
 */
export const WidgetFrame = ({
  widget,
  name,
  onDelete,
  onModify,
  onExpand,
  tickAt,
  children,
}: WidgetFrameProps) => {
  const { editMode } = useEditMode();
  const { moveWidget } = useWidgets();
  const { setDragTarget } = useDragTarget();
  const onDrop = useCallback(
    (cell: { row: number; col: number }) => moveWidget(widget.id, cell),
    [moveWidget, widget.id],
  );
  const { dragging, offset, handlers } = useWidgetDrag({
    layout: widget.layout,
    enabled: editMode,
    onHover: setDragTarget,
    onDrop,
  });
  const expandable = !editMode && onExpand !== undefined;
  const onExpandClick = useCallback(
    (event: MouseEvent) => {
      event.stopPropagation();
      onExpand?.();
    },
    [onExpand],
  );

  return (
    <GridWidget layout={widget.layout}>
      <Box
        {...handlers}
        onClick={expandable ? onExpand : undefined}
        data-testid='widget-frame'
        sx={[
          shadowSx('sm'),
          (theme) => ({
            position: 'absolute',
            inset: TILE_GAP_PX,
            p: CARD_PADDING,
            borderRadius: `${TILE_RADIUS_PX}px`,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            bgcolor: colours.cream,
            transform: `translate(${offset.dx}px, ${offset.dy}px)`,
            zIndex: dragging ? 1 : 'auto',
            ...(editMode && { cursor: dragging ? 'grabbing' : 'grab', userSelect: 'none', touchAction: 'none' }),
            ...(expandable && { cursor: 'pointer' }),
            ...theme.applyStyles('dark', { bgcolor: colours.navy }),
          }),
        ]}
      >
        {!editMode && tickAt !== undefined && <FreshnessGlow tickAt={tickAt} />}
        {editMode ? (
          <>
            <WidgetLabel>{name}</WidgetLabel>
            <Stack
              direction='row'
              spacing={3}
              sx={{ position: 'absolute', inset: 0, justifyContent: 'center', alignItems: 'center' }}
            >
              <ClearButton rounded aria-label='Modify widget' onClick={onModify} sx={{ p: 1 }}>
                <EditIcon />
              </ClearButton>
              <ClearButton rounded aria-label='Delete widget' onClick={onDelete} sx={{ p: 1 }}>
                <CloseIcon />
              </ClearButton>
            </Stack>
          </>
        ) : (
          <Box
            sx={{
              position: 'relative',
              flex: 1,
              minHeight: 0,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {expandable && (
              <ClearButton
                rounded
                aria-label='Expand widget'
                onClick={onExpandClick}
                sx={{ position: 'absolute', top: 0, right: 0, p: 0, height: LABEL_LINE_PX }}
              >
                <FullscreenIcon sx={{ fontSize: LABEL_FONT_PX }} />
              </ClearButton>
            )}
            {children}
          </Box>
        )}
      </Box>
    </GridWidget>
  );
};
