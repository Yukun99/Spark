import { ConfirmDialog } from '@/components/dialogs/confirmDialog';
import { PlaceOrderDialog } from '@/features/widgets/instrument/dialog/placeOrderDialog';
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

/** Placed orders as a table, newest first. */
export const OrdersWidget = ({ widget }: OrdersWidgetProps) => {
  const {
    title,
    rows,
    deleting,
    cancelling,
    selected,
    orderForm,
    openDelete,
    openCopy,
    openEdit,
    openCancel,
    closeDialog,
    confirmDelete,
    confirmCancel,
  } = useOrdersWidget(widget);

  return (
    <>
      <WidgetFrame widget={widget} name={title} onDelete={openDelete}>
        <WidgetLabel>{title}</WidgetLabel>
        <WidgetScrollArea>
          {rows.length === 0 ? (
            <Typography sx={{ fontSize: STRIP_TEXT_PX, color: gray[50], textAlign: 'center' }}>
              No orders yet
            </Typography>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: ORDERS_COLUMNS, rowGap: 1 }}>
              <OrdersHeader />
              {rows.map((row) => (
                <OrdersRow
                  key={row.key}
                  row={row}
                  onCopy={openCopy}
                  onEdit={openEdit}
                  onCancel={openCancel}
                />
              ))}
            </Box>
          )}
        </WidgetScrollArea>
      </WidgetFrame>
      <ConfirmDialog
        open={deleting}
        title='Delete widget?'
        onConfirm={confirmDelete}
        onCancel={closeDialog}
      >
        The widget will be removed from the grid.
      </ConfirmDialog>
      <ConfirmDialog
        open={cancelling}
        title='Cancel order?'
        onConfirm={confirmCancel}
        onCancel={closeDialog}
      >
        {selected !== null &&
          `The ${selected.side} order for ${selected.productId} will be cancelled. Fulfilled amount will not be affected.`}
      </ConfirmDialog>
      {orderForm !== null && <PlaceOrderDialog {...orderForm} onClose={closeDialog} />}
    </>
  );
};
