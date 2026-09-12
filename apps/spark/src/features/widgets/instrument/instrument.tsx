import { ConfirmDialog } from '@/components/dialogs/confirmDialog';
import { TransactionTypeDisplay } from '@/components/transactionTypeDisplay';
import { InstrumentDialog } from '@/features/widgets/instrument/dialog/instrumentDialog';
import { InstrumentSearchDialog } from '@/features/widgets/instrument/dialog/instrumentSearchDialog';
import { useInstrument } from '@/features/widgets/instrument/hooks/useInstrument';
import { ValuePairRow } from '@/features/widgets/instrument/valuePairRow';
import { WidgetFrame } from '@/features/widgets/widgetFrame';
import { WidgetLabel } from '@/features/widgets/widgetLabel';
import type { InstrumentWidget as InstrumentWidgetModel } from '@/store/widgetsSlice';
import Stack from '@mui/material/Stack';

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