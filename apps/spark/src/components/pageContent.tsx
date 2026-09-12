import { EditTray } from '@/features/edit/editTray';
import { ACTION_COLUMN_WIDTH_PX } from '@/features/edit/trayConfig';
import { StreamingButton } from '@/features/edit/streamingButton';
import { UpdateIntervalButton } from '@/features/edit/updateIntervalButton';
import { BANNER_HEIGHT, TILE_GAP_PX } from '@/features/grid/gridConfig';
import { WidgetGrid } from '@/features/grid/widgetGrid';
import { useWidgets } from '@/features/widgets/hooks/useWidgets';
import { InstrumentWidget } from '@/features/widgets/instrument/instrument';
import { OrdersWidget } from '@/features/widgets/orders/orders';
import { WatchlistWidget } from '@/features/widgets/watchlist/watchlist';
import type { Widget } from '@/store/widgetsSlice';
import { gray } from '@/styles/palette';
import { SCROLLBAR_OPTIONS, scrollbarSx } from '@/styles/scrollbar';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import { useMemo } from 'react';

const renderWidget = (widget: Widget) => {
  switch (widget.type) {
    case 'instrument':
      return <InstrumentWidget key={widget.id} widget={widget} />;
    case 'watchlist':
      return <WatchlistWidget key={widget.id} widget={widget} />;
    case 'orders':
      return <OrdersWidget key={widget.id} widget={widget} />;
  }
};

export const PageContent = () => {
  const { widgets } = useWidgets();
  const layouts = useMemo(() => widgets.map((widget) => widget.layout), [widgets]);

  return (
    <Box component='main' sx={{ display: 'flex', height: `calc(100vh - ${BANNER_HEIGHT})` }}>
      <Box
        sx={{ flex: 1, minWidth: 0, ...scrollbarSx }}
      >
        <OverlayScrollbarsComponent defer options={SCROLLBAR_OPTIONS} style={{ height: '100%' }}>
          <Box sx={{ height: '100%', p: `${TILE_GAP_PX}px` }}>
            <WidgetGrid layouts={layouts}>{widgets.map(renderWidget)}</WidgetGrid>
          </Box>
        </OverlayScrollbarsComponent>
      </Box>
      <Divider orientation='vertical' flexItem sx={{ borderColor: gray[50] }} />
      <Stack
        component='aside'
        sx={{
          width: ACTION_COLUMN_WIDTH_PX,
          paddingX: `${TILE_GAP_PX}px`,
          paddingY: `${TILE_GAP_PX * 2}px`,
          alignItems: 'center',
          gap: `${TILE_GAP_PX}px`,
        }}
      >
        <StreamingButton />
        <UpdateIntervalButton />
        <EditTray />
      </Stack>
    </Box>
  );
};