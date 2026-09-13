import { LazyConfirmDialog } from '@/components/dialogs/lazyConfirmDialog';
import { PageBar } from '@/components/pageBar';
import { LIST_ROW_GAP_PX } from '@/features/widgets/hooks/usePageSize';
import { LazyPlaceOrderDialog } from '@/features/widgets/instrument/dialog/lazyDialogs';
import { LazyOrderFilterDialog } from '@/features/widgets/orders/dialog/lazyDialogs';
import { useOrdersWidget } from '@/features/widgets/orders/hooks/useOrdersWidget';
import { ORDERS_COLUMNS, OrdersHeader, OrdersRow } from '@/features/widgets/orders/ordersRow';
import { STRIP_TEXT_PX } from '@/features/widgets/valueStrip';
import { WidgetFrame } from '@/features/widgets/widgetFrame';
import { WidgetLabel } from '@/features/widgets/widgetLabel';
import { WidgetScrollArea } from '@/features/widgets/widgetScrollArea';
import type { OrdersWidget as OrdersWidgetModel } from '@/store/widgetsSlice';
import { gray } from '@/styles/palette';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export type OrdersWidgetProps = {
  widget: OrdersWidgetModel;
};

/** Placed orders as a table, newest first unless a column is sorted. */
export const OrdersWidget = ({ widget }: OrdersWidgetProps) => {
  const {
    name,
    title,
    caption,
    rows,
    page,
    pageCount,
    goToPage,
    containerRef,
    headerRef,
    rowRef,
    deleting,
    cancelling,
    filtering,
    filter,
    sort,
    selected,
    orderForm,
    openDelete,
    openCopy,
    openEdit,
    openCancel,
    openFilter,
    closeDialog,
    confirmDelete,
    confirmCancel,
    applyFilter,
    sortBy,
    clearSort,
    refresh,
  } = useOrdersWidget(widget);

  return (
    <>
      <WidgetFrame
        widget={widget}
        name={name}
        onDelete={openDelete}
        onRefresh={refresh}
        onFilter={openFilter}
        onClearSort={clearSort}
      >
        <WidgetLabel caption={caption}>{title}</WidgetLabel>
        <WidgetScrollArea ref={containerRef}>
          {rows.length === 0 ? (
            <Typography sx={{ fontSize: STRIP_TEXT_PX, color: gray[50], textAlign: 'center' }}>
              No orders yet
            </Typography>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: ORDERS_COLUMNS, rowGap: `${LIST_ROW_GAP_PX}px` }}>
              <OrdersHeader ref={headerRef} sort={sort} onSort={sortBy} />
              {rows.map((row, index) => (
                <OrdersRow
                  key={row.key}
                  ref={index === 0 ? rowRef : undefined}
                  row={row}
                  onCopy={openCopy}
                  onEdit={openEdit}
                  onCancel={openCancel}
                />
              ))}
            </Box>
          )}
        </WidgetScrollArea>
        <PageBar page={page} pageCount={pageCount} onChange={goToPage} />
      </WidgetFrame>
      <LazyConfirmDialog
        open={deleting}
        title='Delete widget?'
        onConfirm={confirmDelete}
        onCancel={closeDialog}
      >
        The widget will be removed from the grid.
      </LazyConfirmDialog>
      <LazyConfirmDialog
        open={cancelling}
        title='Cancel order?'
        onConfirm={confirmCancel}
        onCancel={closeDialog}
      >
        {selected !== null &&
          `The ${selected.side} order for ${selected.productId} will be cancelled. Fulfilled amount will not be affected.`}
      </LazyConfirmDialog>
      {orderForm !== null && <LazyPlaceOrderDialog {...orderForm} onClose={closeDialog} />}
      {filtering && (
        <LazyOrderFilterDialog initial={filter} onApply={applyFilter} onClose={closeDialog} />
      )}
    </>
  );
};
