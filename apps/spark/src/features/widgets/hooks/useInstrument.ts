import type { Ticker } from '@/connections/coinbase';
import { useCoinbaseTicker } from '@/connections/hooks/useCoinbaseTicker';
import { useWidgets } from '@/features/widgets/hooks/useWidgets';
import type { InstrumentWidget } from '@/store/widgetsSlice';
import { useCallback, useState } from 'react';

type InstrumentDialogKind = 'delete' | 'modify' | null;

export type UseInstrumentResult = {
  bid: string;
  ask: string;
  updatedAt: string;
  dialog: InstrumentDialogKind;
  openDelete: () => void;
  openModify: () => void;
  closeDialog: () => void;
  confirmDelete: () => void;
  confirmInstrument: (productId: string) => void;
};

const priceFormat = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 8,
});

const formatPrice = (value: number | undefined) =>
  value === undefined ? '--' : priceFormat.format(value);

const timeFormat = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  fractionalSecondDigits: 3,
  hour12: false,
});

/** Exchange timestamp of the tick when present, otherwise the time it arrived. */
const formatUpdatedAt = (ticker: Ticker | undefined) => {
  if (!ticker) return '--';
  const exchangeTime = Date.parse(ticker.time);
  return timeFormat.format(Number.isNaN(exchangeTime) ? ticker.receivedAt : exchangeTime);
};

export const useInstrument = (widget: InstrumentWidget): UseInstrumentResult => {
  const ticker = useCoinbaseTicker(widget.productId);
  const { removeWidget, setInstrument } = useWidgets();
  const [dialog, setDialog] = useState<InstrumentDialogKind>(null);

  const openDelete = useCallback(() => setDialog('delete'), []);
  const openModify = useCallback(() => setDialog('modify'), []);
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
    closeDialog,
    confirmDelete,
    confirmInstrument,
  };
};
