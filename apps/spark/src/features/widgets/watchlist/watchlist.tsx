import { ConfirmDialog } from '@/components/dialogs/confirmDialog';
import { InstrumentDialog } from '@/features/widgets/instrument/dialog/instrumentDialog';
import { PlaceOrderDialog } from '@/features/widgets/instrument/dialog/placeOrderDialog';
import { useWatchlist } from '@/features/widgets/watchlist/hooks/useWatchlist';
import { WatchlistDialog } from '@/features/widgets/watchlist/dialog/watchlistDialog';
import { WatchlistHeader } from '@/features/widgets/watchlist/watchlistHeader';
import { WATCHLIST_COLUMNS, WatchlistRow } from '@/features/widgets/watchlist/watchlistRow';
import { WidgetFrame } from '@/features/widgets/widgetFrame';
import { WatchlistLabel } from '@/features/widgets/watchlist/watchlistLabel';
import { WidgetScrollArea } from '@/features/widgets/widgetScrollArea';
import type { WatchlistWidget as WatchlistWidgetModel } from '@/store/widgetsSlice';
import { gray } from '@/styles/palette';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export type WatchlistWidgetProps = {
  widget: WatchlistWidgetModel;
};

export const WatchlistWidget = ({ widget }: WatchlistWidgetProps) => {
  const {
    title,
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
        <WatchlistLabel title={title} productIds={productIds} />
        <WidgetScrollArea>
          {productIds.length === 0 ? (
            <Typography sx={{ fontSize: 12, color: gray[50], textAlign: 'center' }}>
              No instruments yet
            </Typography>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: WATCHLIST_COLUMNS, rowGap: 1 }}>
              <WatchlistHeader />
              {productIds.map((productId, index) => (
                <WatchlistRow key={`${productId}-${index}`} productId={productId} onOpen={openDetails} />
              ))}
            </Box>
          )}
        </WidgetScrollArea>
      </WidgetFrame>
      <ConfirmDialog
        open={dialog === 'delete'}
        title='Delete widget?'
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
