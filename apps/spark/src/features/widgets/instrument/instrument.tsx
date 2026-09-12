import { ConfirmDialog } from '@/components/dialogs/confirmDialog';
import { TransactionTypeDisplay } from '@/components/transactionTypeDisplay';
import { InstrumentDialog } from '@/features/widgets/instrument/dialog/instrumentDialog';
import { InstrumentSearchDialog } from '@/features/widgets/instrument/dialog/instrumentSearchDialog';
import { useInstrument } from '@/features/widgets/instrument/hooks/useInstrument';
import { ValuePairRow } from '@/features/widgets/instrument/valuePairRow';
import { WidgetFrame } from '@/features/widgets/widgetFrame';
import { WidgetLabel } from '@/features/widgets/widgetLabel';
import Stack from '@mui/material/Stack';
import type { InstrumentWidget as InstrumentWidgetModel } from '@/store/widgetsSlice';

export type InstrumentWidgetProps = {
  widget: InstrumentWidgetModel;
};

export const InstrumentWidget = ({ widget }: InstrumentWidgetProps) => {
  const {
    bid,
    ask,
    lastPrice,
    lastSide,
    updatedAt,
    tickAt,
    dialog,
    openDelete,
    openModify,
    openDetails,
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
        <Stack spacing={1}>
          <ValuePairRow
            left={{ label: 'Bid', value: bid }}
            right={{ label: 'Ask', value: ask, labelFirst: false }}
          />
          <ValuePairRow
            left={{ label: 'Price', value: lastPrice }}
            right={{
              label: 'Type',
              value: <TransactionTypeDisplay side={lastSide} />,
              labelFirst: false,
            }}
          />
        </Stack>
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
        <InstrumentSearchDialog
          productId={widget.productId}
          onConfirm={confirmInstrument}
          onCancel={closeDialog}
        />
      )}
      {dialog === 'details' && (
        <InstrumentDialog productId={widget.productId} onClose={closeDialog} />
      )}
    </>
  );
};
