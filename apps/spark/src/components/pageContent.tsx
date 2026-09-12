import { AddWidgetButton } from '@/features/edit/addWidgetButton';
import { EditModeButton } from '@/features/edit/editModeButton';
import { UpdateIntervalButton } from '@/features/edit/updateIntervalButton';
import { BANNER_HEIGHT } from '@/features/grid/gridConfig';
import { WidgetGrid } from '@/features/grid/widgetGrid';
import { InstrumentWidget } from '@/features/widgets/instrument';
import { useEditMode } from '@/hooks/useEditMode';
import { useWidgets } from '@/features/widgets/hooks/useWidgets';
import type { Widget } from '@/store/widgetsSlice';
import { gray } from '@/styles/palette';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import { useMemo } from 'react';

const REVEAL_MS = 200;

const SCROLLBAR_OPTIONS = { scrollbars: { autoHide: 'leave', autoHideDelay: 400 } } as const;

const renderWidget = (widget: Widget) => {
  switch (widget.type) {
    case 'instrument':
      return <InstrumentWidget key={widget.id} widget={widget} />;
  }
};

export const PageContent = () => {
  const { widgets } = useWidgets();
  const { editMode } = useEditMode();
  const layouts = useMemo(() => widgets.map((widget) => widget.layout), [widgets]);

  return (
    <Box component='main' sx={{ display: 'flex', height: `calc(100vh - ${BANNER_HEIGHT})` }}>
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          '& .os-scrollbar': {
            '--os-size': '8px',
            '--os-handle-bg': gray[50],
            '--os-handle-bg-hover': gray[60],
            '--os-handle-bg-active': gray[70],
          },
        }}
      >
        <OverlayScrollbarsComponent defer options={SCROLLBAR_OPTIONS} style={{ height: '100%' }}>
          <Box sx={{ height: '100%', p: 3 }}>
            <WidgetGrid layouts={layouts}>{widgets.map(renderWidget)}</WidgetGrid>
          </Box>
        </OverlayScrollbarsComponent>
      </Box>
      <Divider orientation='vertical' flexItem sx={{ borderColor: gray[50] }} />
      <Stack component='aside' sx={{ p: 3, alignItems: 'center' }}>
        <EditModeButton />
        <Collapse in={editMode} timeout={REVEAL_MS}>
          <Stack
            spacing={3}
            sx={{
              pt: 3,
              alignItems: 'center',
              opacity: editMode ? 1 : 0,
              transform: editMode ? 'none' : 'translateY(-24px) scale(0.5)',
              transition: `opacity ${REVEAL_MS}ms ease-out, transform ${REVEAL_MS}ms ease-out`,
            }}
          >
            <AddWidgetButton />
            <UpdateIntervalButton />
          </Stack>
        </Collapse>
      </Stack>
    </Box>
  );
};
