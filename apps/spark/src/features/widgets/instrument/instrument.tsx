import { ConfirmDialog } from '@/components/dialogs/confirmDialog';
import { BidAskRow } from '@/features/widgets/instrument/bidAskRow';
import { InstrumentDialog } from '@/features/widgets/instrument/dialog/instrumentDialog';
import { InstrumentSearchDialog } from '@/features/widgets/instrument/dialog/instrumentSearchDialog';
import { useInstrument } from '@/features/widgets/instrument/hooks/useInstrument';
import { WidgetFrame } from '@/features/widgets/widgetFrame';
import { WidgetLabel } from '@/features/widgets/widgetLabel';
import type { InstrumentWidget as InstrumentWidgetModel } from '@/store/widgetsSlice';

export type InstrumentWidgetProps = {
  widget: InstrumentWidgetModel;
};

export const InstrumentWidget = ({ widget }: InstrumentWidgetProps) => {
  const {
    bid,
    ask,
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
        <BidAskRow bid={bid} ask={ask} />
      </WidgetFrame>
      <ConfirmDialog
        open={dialog === 'delete'}
        title='Delete widget?'
        confirmLabel='Delete'
        onConfirm={confirmDelete}
        onCancel={closeDialog}
      >
        The {widget.productId} widget will be removed from the grid.
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
