import { ConfirmDialog } from '@/components/dialogs/confirmDialog';
import { useOrdersWidget } from '@/features/widgets/orders/hooks/useOrdersWidget';
import { STRIP_TEXT_PX } from '@/features/widgets/valueStrip';
import { WidgetFrame } from '@/features/widgets/widgetFrame';
import { WidgetLabel } from '@/features/widgets/widgetLabel';
import type { OrdersWidget as OrdersWidgetModel } from '@/store/widgetsSlice';
import { gray } from '@/styles/palette';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';

export type OrdersWidgetProps = {
  widget: OrdersWidgetModel;
};

const SCROLLBAR_OPTIONS = { scrollbars: { autoHide: 'leave', autoHideDelay: 400 } } as const;

/** Placed orders, newest first, one plaintext line each. */
export const OrdersWidget = ({ widget }: OrdersWidgetProps) => {
  const { title, rows, deleting, openDelete, closeDialog, confirmDelete } = useOrdersWidget(widget);

  return (
    <>
      <WidgetFrame widget={widget} name={title} onDelete={openDelete}>
        <WidgetLabel>{title}</WidgetLabel>
        <Box sx={{ flex: 1, minHeight: 0 }}>
          <OverlayScrollbarsComponent defer options={SCROLLBAR_OPTIONS} style={{ height: '100%' }}>
            {rows.length === 0 ? (
              <Typography sx={{ fontSize: STRIP_TEXT_PX, color: gray[50], textAlign: 'center' }}>
                No orders yet
              </Typography>
            ) : (
              rows.map((row, index) => (
                <Typography
                  key={index}
                  data-testid='order-row'
                  sx={{ fontSize: STRIP_TEXT_PX, whiteSpace: 'nowrap' }}
                >
                  {row}
                </Typography>
              ))
            )}
          </OverlayScrollbarsComponent>
        </Box>
      </WidgetFrame>
      <ConfirmDialog
        open={deleting}
        title='Delete widget?'
        confirmLabel='Delete'
        onConfirm={confirmDelete}
        onCancel={closeDialog}
      >
        The widget will be removed from the grid.
      </ConfirmDialog>
    </>
  );
};
