import { LazyConfirmDialog } from '@/components/dialogs/lazyConfirmDialog';
import { PageBar } from '@/components/pageBar';
import { LIST_ROW_GAP_PX } from '@/features/widgets/hooks/usePageSize';
import {
  LazyInstrumentDialog,
  LazyPlaceOrderDialog,
} from '@/features/widgets/instrument/dialog/lazyDialogs';
import { useWatchlist } from '@/features/widgets/watchlist/hooks/useWatchlist';
import { LazyWatchlistDialog } from '@/features/widgets/watchlist/dialog/lazyDialogs';
import { WatchlistHeader } from '@/features/widgets/watchlist/watchlistHeader';
import { WATCHLIST_COLUMNS, WatchlistRow } from '@/features/widgets/watchlist/watchlistRow';
import { STRIP_TEXT_PX } from '@/features/widgets/valueStrip';
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
    pageRows,
    page,
    pageCount,
    setPage,
    containerRef,
    headerRef,
    rowRef,
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
        <WidgetScrollArea ref={containerRef}>
          {productIds.length === 0 ? (
            <Typography sx={{ fontSize: STRIP_TEXT_PX, color: gray[50], textAlign: 'center' }}>
              No instruments yet
            </Typography>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: WATCHLIST_COLUMNS, rowGap: `${LIST_ROW_GAP_PX}px` }}>
              <WatchlistHeader ref={headerRef} />
              {pageRows.map(({ productId, index }, offset) => (
                <WatchlistRow
                  key={`${productId}-${index}`}
                  ref={offset === 0 ? rowRef : undefined}
                  productId={productId}
                  onOpen={openDetails}
                />
              ))}
            </Box>
          )}
        </WidgetScrollArea>
        <PageBar page={page} pageCount={pageCount} onChange={setPage} />
      </WidgetFrame>
      <LazyConfirmDialog
        open={dialog === 'delete'}
        title='Delete widget?'
        onConfirm={confirmDelete}
        onCancel={closeDialog}
      >
        The widget will be removed from the grid.
      </LazyConfirmDialog>
      {dialog === 'modify' && (
        <LazyWatchlistDialog widget={widget} onConfirm={confirmWatchlist} onCancel={closeDialog} />
      )}
      {detailsProductId !== null && orderSide === null && (
        <LazyInstrumentDialog productId={detailsProductId} onTrade={openOrder} onClose={closeDialog} />
      )}
      {detailsProductId !== null && orderSide !== null && (
        <LazyPlaceOrderDialog productId={detailsProductId} side={orderSide} onClose={closeDialog} />
      )}
    </>
  );
};
