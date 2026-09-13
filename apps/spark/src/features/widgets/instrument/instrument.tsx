import { LazyConfirmDialog } from '@/common/components/dialogs/lazyConfirmDialog';
import { TransactionTypeDisplay } from '@/common/components/transactionTypeDisplay';
import { TradeButtons } from '@/features/widgets/instrument/tradeButtons';
import {
  LazyInstrumentDialog,
  LazyInstrumentSearchDialog,
  LazyPlaceOrderDialog,
} from '@/features/widgets/instrument/dialog/lazyDialogs';
import { useInstrument } from '@/features/widgets/instrument/hooks/useInstrument';
import { ValuePairRow } from '@/features/widgets/instrument/valuePairRow';
import { ValueStrip } from '@/features/widgets/valueStrip';
import { WidgetFrame } from '@/features/widgets/widgetFrame';
import { WidgetLabel } from '@/features/widgets/widgetLabel';
import type { InstrumentWidget as InstrumentWidgetModel } from '@/store/widgetsSlice';
import { gray } from '@/styles/palette';
import Divider from '@mui/material/Divider';

export type InstrumentWidgetProps = {
  widget: InstrumentWidgetModel;
};

export const InstrumentWidget = ({ widget }: InstrumentWidgetProps) => {
  const {
    bid,
    ask,
    lastPrice,
    lastSize,
    lastSide,
    updatedAt,
    tickAt,
    dialog,
    orderSide,
    openDelete,
    openModify,
    openDetails,
    openOrder,
    closeDialog,
    confirmDelete,
    confirmInstrument,
  } = useInstrument(widget);

  return (
    <>
      <WidgetFrame
        widget={widget}
        name={widget.productId}
        onDelete={openDelete}
        onModify={openModify}
        onExpand={openDetails}
        tickAt={tickAt}
      >
        <WidgetLabel caption={`Last Refresh: ${updatedAt}`}>{widget.productId}</WidgetLabel>
        <ValueStrip sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <TradeButtons onTrade={openOrder} />
          <Divider sx={{ borderColor: gray[50] }} />
          <ValuePairRow
            left={{ label: 'Bid Price', value: bid }}
            right={{ label: 'Ask Price', value: ask }}
          />
          <ValuePairRow
            left={{ label: 'Last Price', value: lastPrice }}
            right={{
              label: 'Last Size',
              value: <TransactionTypeDisplay side={lastSide} label={lastSize} />,
            }}
          />
        </ValueStrip>
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
        <LazyInstrumentSearchDialog
          productId={widget.productId}
          onConfirm={confirmInstrument}
          onCancel={closeDialog}
        />
      )}
      {dialog === 'details' && (
        <LazyInstrumentDialog productId={widget.productId} onTrade={openOrder} onClose={closeDialog} />
      )}
      {dialog === 'order' && (
        <LazyPlaceOrderDialog productId={widget.productId} side={orderSide} onClose={closeDialog} />
      )}
    </>
  );
};