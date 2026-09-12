import { ConfirmDialog } from '@/components/dialogs/confirmDialog';
import { InstrumentDialog } from '@/features/widgets/instrument/dialog/instrumentDialog';
import { PlaceOrderDialog } from '@/features/widgets/instrument/dialog/placeOrderDialog';
import { useWatchlist } from '@/features/widgets/watchlist/hooks/useWatchlist';
import { WatchlistDialog } from '@/features/widgets/watchlist/dialog/watchlistDialog';
import { WatchlistHeader } from '@/features/widgets/watchlist/watchlistHeader';
import { WATCHLIST_COLUMNS, WatchlistRow } from '@/features/widgets/watchlist/watchlistRow';
import { WidgetFrame } from '@/features/widgets/widgetFrame';
import { WidgetLabel } from '@/features/widgets/widgetLabel';
import type { WatchlistWidget as WatchlistWidgetModel } from '@/store/widgetsSlice';
import { gray } from '@/styles/palette';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';

export type WatchlistWidgetProps = {
  widget: WatchlistWidgetModel;
};

const SCROLLBAR_OPTIONS = { scrollbars: { autoHide: 'leave', autoHideDelay: 400 } } as const;

export const WatchlistWidget = ({ widget }: WatchlistWidgetProps) => {
  const {
    title,
    updatedAt,
    productIds,
    dialog,
    detailsProductId,
    orderSide,
    openDelete,
    openModify,
    openDetails,
    openOrder,
    closeDialog,
    confirmDelete,
    confirmWatchlist,
  } = useWatchlist(widget);

  return (
    <>
      <WidgetFrame widget={widget} name={title} onDelete={openDelete} onModify={openModify}>
        <WidgetLabel caption={`Last Refresh: ${updatedAt}`}>{title}</WidgetLabel>
        <Box sx={{ flex: 1, minHeight: 0 }}>
          <OverlayScrollbarsComponent defer options={SCROLLBAR_OPTIONS} style={{ height: '100%' }}>
            {productIds.length === 0 ? (
              <Typography sx={{ fontSize: 12, color: gray[50], textAlign: 'center' }}>
                No instruments yet
              </Typography>
            ) : (
              <Box sx={{ display: 'grid', gridTemplateColumns: WATCHLIST_COLUMNS, rowGap: 1 }}>
                <WatchlistHeader />
                {productIds.map((productId) => (
                  <WatchlistRow key={productId} productId={productId} onOpen={openDetails} />
                ))}
              </Box>
            )}
          </OverlayScrollbarsComponent>
        </Box>
      </WidgetFrame>
      <ConfirmDialog
        open={dialog === 'delete'}
        title='Delete widget?'
        confirmLabel='Delete'
        onConfirm={confirmDelete}
        onCancel={closeDialog}
      >
        The widget will be removed from the grid.
      </ConfirmDialog>
      {dialog === 'modify' && (
        <WatchlistDialog widget={widget} onConfirm={confirmWatchlist} onCancel={closeDialog} />
      )}
      {detailsProductId !== null && orderSide === null && (
        <InstrumentDialog productId={detailsProductId} onTrade={openOrder} onClose={closeDialog} />
      )}
      {detailsProductId !== null && orderSide !== null && (
        <PlaceOrderDialog productId={detailsProductId} side={orderSide} onClose={closeDialog} />
      )}
    </>
  );
};
