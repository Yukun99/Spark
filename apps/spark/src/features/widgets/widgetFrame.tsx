import { ClearButton } from '@/components/buttons/clearButton';
import { TILE_GAP_PX, TILE_RADIUS_PX } from '@/features/grid/gridConfig';
import { GridWidget } from '@/features/grid/gridWidget';
import { useDragTarget } from '@/features/grid/hooks/useDragTarget';
import { FreshnessGlow } from '@/features/widgets/freshnessGlow';
import { useWidgetDrag } from '@/features/widgets/hooks/useWidgetDrag';
import { useWidgets } from '@/features/widgets/hooks/useWidgets';
import { ResizeHandles } from '@/features/widgets/resizeHandles';
import { LABEL_FONT_PX, LABEL_LINE_PX, WidgetLabel } from '@/features/widgets/widgetLabel';
import { useEditMode } from '@/hooks/useEditMode';
import type { Widget } from '@/store/widgetsSlice';
import { theme as colours, gray } from '@/styles/palette';
import { shadowSx } from '@/styles/shadows';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FilterListOffIcon from '@mui/icons-material/FilterListOff';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import RefreshIcon from '@mui/icons-material/Refresh';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { Theme } from '@mui/material/styles';
import { useCallback, type MouseEvent, type ReactNode } from 'react';

const CARD_PADDING_PX = 16;

export type WidgetFrameProps = {
  widget: Widget;
  name: string;
  onDelete: () => void;
  onModify?: () => void;
  onExpand?: () => void;
  /** Refetches the widget's data; shows a corner button outside edit mode. */
  onRefresh?: () => void;
  /** Opens a filter for the widget's data; the button keeps the text colour while `filterActive`. */
  onFilter?: () => void;
  filterActive?: boolean;
  /** Clears the widget's column sort; its button sits left of the filter button, lit while `sortActive`. */
  onClearSort?: () => void;
  sortActive?: boolean;
  tickAt?: number;
  children: ReactNode;
};

type CornerButtonProps = {
  label: string;
  onClick: (event: MouseEvent) => void;
  /** Slot from the right edge: 0 is the corner, 1 sits left of it. */
  slot?: number;
  /** Set when the button's feature is in use; undefined for plain actions. */
  active?: boolean;
  children: ReactNode;
};

const CORNER_GAP_PX = 4;

/** Gray at rest, the theme's text colour on hover or while active (dark overrides win over plain `sx`). */
const cornerColourSx = (active: boolean) => (theme: Theme) => ({
  color: active ? colours.navy : gray[50],
  '&:hover': { color: colours.navy },
  ...theme.applyStyles('dark', {
    color: active ? colours.cream : gray[50],
    '&:hover': { color: colours.cream },
  }),
});

/** Round icon button along the card's top-right edge, sized to the title line. */
const CornerButton = ({ label, onClick, slot = 0, active, children }: CornerButtonProps) => (
  <ClearButton
    rounded
    aria-label={label}
    aria-pressed={active}
    onClick={onClick}
    sx={[
      cornerColourSx(active === true),
      {
        position: 'absolute',
        top: 0,
        right: slot * (LABEL_LINE_PX + CORNER_GAP_PX),
        p: 0,
        width: LABEL_LINE_PX,
        height: LABEL_LINE_PX,
      },
    ]}
  >
    {children}
  </ClearButton>
);

/**
 * Card chrome shared by all widgets: drag-to-move, delete and (when `onModify` is given) modify
 * actions in edit mode;
 * outside edit mode, clicking the card or its corner icon calls `onExpand`, and `tickAt`
 * restarts a purple glow that fades while no new tick arrives.
 */
export const WidgetFrame = ({
  widget,
  name,
  onDelete,
  onModify,
  onExpand,
  onRefresh,
  onFilter,
  filterActive = false,
  onClearSort,
  sortActive = false,
  tickAt,
  children,
}: WidgetFrameProps) => {
  const { editMode } = useEditMode();
  const { moveWidget } = useWidgets();
  const { setDragSource, setDragTarget } = useDragTarget();
  const onDrop = useCallback(
    (cell: { row: number; col: number }) => moveWidget(widget.id, cell),
    [moveWidget, widget.id],
  );
  const onDragStart = useCallback(
    () => setDragSource(widget.layout),
    [setDragSource, widget.layout],
  );
  const onDragEnd = useCallback(() => setDragSource(null), [setDragSource]);
  const { dragging, offset, handlers } = useWidgetDrag({
    layout: widget.layout,
    enabled: editMode,
    onStart: onDragStart,
    onHover: setDragTarget,
    onDrop,
    onEnd: onDragEnd,
  });
  const expandable = !editMode && onExpand !== undefined;
  const onExpandClick = useCallback(
    (event: MouseEvent) => {
      event.stopPropagation();
      onExpand?.();
    },
    [onExpand],
  );
  const onRefreshClick = useCallback(
    (event: MouseEvent) => {
      event.stopPropagation();
      onRefresh?.();
    },
    [onRefresh],
  );
  const onFilterClick = useCallback(
    (event: MouseEvent) => {
      event.stopPropagation();
      onFilter?.();
    },
    [onFilter],
  );
  const onClearSortClick = useCallback(
    (event: MouseEvent) => {
      event.stopPropagation();
      onClearSort?.();
    },
    [onClearSort],
  );
  const filterSlot = onRefresh === undefined ? 0 : 1;
  const clearSortSlot = onFilter === undefined ? filterSlot : filterSlot + 1;

  return (
    <GridWidget layout={widget.layout} raised={dragging}>
      <Box
        {...handlers}
        onClick={expandable ? onExpand : undefined}
        data-testid='widget-frame'
        sx={[
          shadowSx('sm'),
          (theme) => ({
            position: 'absolute',
            inset: TILE_GAP_PX,
            p: `${CARD_PADDING_PX}px`,
            borderRadius: `${TILE_RADIUS_PX}px`,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            bgcolor: colours.cream,
            transform: `translate(${offset.dx}px, ${offset.dy}px)`,
            ...(editMode && {
              cursor: dragging ? 'grabbing' : 'grab',
              userSelect: 'none',
              touchAction: 'none',
            }),
            ...(expandable && { cursor: 'pointer' }),
            ...theme.applyStyles('dark', { bgcolor: colours.navy }),
          }),
        ]}
      >
        {!editMode && tickAt !== undefined && <FreshnessGlow tickAt={tickAt} />}
        {editMode && <ResizeHandles widget={widget} paddingPx={CARD_PADDING_PX} />}
        {editMode ? (
          <>
            <WidgetLabel>{name}</WidgetLabel>
            <Stack
              direction='row'
              spacing={3}
              sx={{
                position: 'absolute',
                inset: 0,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {onModify && (
                <ClearButton rounded aria-label='Modify widget' onClick={onModify} sx={{ p: 1 }}>
                  <EditIcon />
                </ClearButton>
              )}
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
              <CornerButton label='Expand widget' onClick={onExpandClick}>
                <FullscreenIcon sx={{ fontSize: LABEL_FONT_PX }} />
              </CornerButton>
            )}
            {onRefresh !== undefined && (
              <CornerButton label={`Refresh ${name.toLowerCase()}`} onClick={onRefreshClick}>
                <RefreshIcon sx={{ fontSize: LABEL_FONT_PX }} />
              </CornerButton>
            )}
            {onFilter !== undefined && (
              <CornerButton
                label={`Filter ${name.toLowerCase()}`}
                onClick={onFilterClick}
                slot={filterSlot}
                active={filterActive}
              >
                <FilterAltIcon sx={{ fontSize: LABEL_FONT_PX }} />
              </CornerButton>
            )}
            {onClearSort !== undefined && (
              <CornerButton
                label='Cancel sort'
                onClick={onClearSortClick}
                slot={clearSortSlot}
                active={sortActive}
              >
                <FilterListOffIcon sx={{ fontSize: LABEL_FONT_PX }} />
              </CornerButton>
            )}
            {children}
          </Box>
        )}
      </Box>
    </GridWidget>
  );
};
