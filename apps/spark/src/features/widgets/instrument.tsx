import { ConfirmDialog } from '@/components/dialogs/confirmDialog';
import { BidAskRow } from '@/features/widgets/bidAskRow';
import { InstrumentDialog } from '@/features/widgets/instrumentDialog';
import { useInstrument } from '@/features/widgets/hooks/useInstrument';
import { WidgetFrame } from '@/features/widgets/widgetFrame';
import { WidgetLabel } from '@/features/widgets/widgetLabel';
import type { InstrumentWidget as InstrumentWidgetModel } from '@/store/widgetsSlice';

export type InstrumentWidgetProps = {
  widget: InstrumentWidgetModel;
};

export const InstrumentWidget = ({ widget }: InstrumentWidgetProps) => {
  const { bid, ask, dialog, openDelete, openModify, closeDialog, confirmDelete, confirmInstrument } =
    useInstrument(widget);

  return (
    <>
      <WidgetFrame widget={widget} name={widget.productId} onDelete={openDelete} onModify={openModify}>
        <WidgetLabel>{widget.productId}</WidgetLabel>
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
        <InstrumentDialog
          productId={widget.productId}
          onConfirm={confirmInstrument}
          onCancel={closeDialog}
        />
      )}
    </>
  );
};
