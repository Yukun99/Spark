import { useCoinbaseTicker } from '@/connections/hooks/useCoinbaseTicker';
import { useWidgets } from '@/features/widgets/hooks/useWidgets';
import { formatPrice, formatUpdatedAt } from '@/features/widgets/instrument/tickerFormat';
import type { InstrumentWidget } from '@/store/widgetsSlice';
import { useCallback, useState } from 'react';

type InstrumentDialogKind = 'delete' | 'modify' | 'details' | null;

export type UseInstrumentResult = {
  bid: string;
  ask: string;
  updatedAt: string;
  dialog: InstrumentDialogKind;
  openDelete: () => void;
  openModify: () => void;
  openDetails: () => void;
  closeDialog: () => void;
  confirmDelete: () => void;
  confirmInstrument: (productId: string) => void;
};

export const useInstrument = (widget: InstrumentWidget): UseInstrumentResult => {
  const ticker = useCoinbaseTicker(widget.productId);
  const { removeWidget, setInstrument } = useWidgets();
  const [dialog, setDialog] = useState<InstrumentDialogKind>(null);

  const openDelete = useCallback(() => setDialog('delete'), []);
  const openModify = useCallback(() => setDialog('modify'), []);
  const openDetails = useCallback(() => setDialog('details'), []);
  const closeDialog = useCallback(() => setDialog(null), []);
  const confirmDelete = useCallback(() => {
    setDialog(null);
    removeWidget(widget.id);
  }, [removeWidget, widget.id]);
  const confirmInstrument = useCallback(
    (productId: string) => {
      setDialog(null);
      setInstrument(widget.id, productId);
    },
    [setInstrument, widget.id],
  );

  return {
    bid: formatPrice(ticker?.bid),
    ask: formatPrice(ticker?.ask),
    updatedAt: formatUpdatedAt(ticker),
    dialog,
    openDelete,
    openModify,
    openDetails,
    closeDialog,
    confirmDelete,
    confirmInstrument,
  };
};
