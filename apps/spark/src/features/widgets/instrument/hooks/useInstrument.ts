import type { TradeSide } from '@/connections/coinbase';
import { useCoinbaseTicker } from '@/connections/hooks/useCoinbaseTicker';
import { useWidgets } from '@/features/widgets/hooks/useWidgets';
import {
  formatPrice,
  formatCompactSize,
  formatUpdatedAt,
  tickerTime,
} from '@/features/widgets/instrument/tickerFormat';
import type { InstrumentWidget } from '@/store/widgetsSlice';
import { useCallback, useState } from 'react';

type InstrumentDialogKind = 'delete' | 'modify' | 'details' | 'order' | null;

export type UseInstrumentResult = {
  bid: string;
  ask: string;
  lastPrice: string;
  lastSize: string;
  lastSide: TradeSide | undefined;
  updatedAt: string;
  tickAt: number | undefined;
  dialog: InstrumentDialogKind;
  /** Side the order dialog was opened with; only meaningful while `dialog` is 'order'. */
  orderSide: TradeSide;
  openDelete: () => void;
  openModify: () => void;
  openDetails: () => void;
  openOrder: (side: TradeSide) => void;
  closeDialog: () => void;
  confirmDelete: () => void;
  confirmInstrument: (productId: string) => void;
};

export const useInstrument = (widget: InstrumentWidget): UseInstrumentResult => {
  const ticker = useCoinbaseTicker(widget.productId);
  const { removeWidget, setInstrument } = useWidgets();
  const [dialog, setDialog] = useState<InstrumentDialogKind>(null);
  const [orderSide, setOrderSide] = useState<TradeSide>('buy');

  const openDelete = useCallback(() => setDialog('delete'), []);
  const openModify = useCallback(() => setDialog('modify'), []);
  const openDetails = useCallback(() => setDialog('details'), []);
  const openOrder = useCallback((side: TradeSide) => {
    setOrderSide(side);
    setDialog('order');
  }, []);
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
    lastPrice: formatPrice(ticker?.price),
    lastSize: formatCompactSize(ticker?.lastSize),
    lastSide: ticker?.side,
    updatedAt: formatUpdatedAt(ticker),
    tickAt: tickerTime(ticker),
    dialog,
    orderSide,
    openDelete,
    openModify,
    openDetails,
    openOrder,
    closeDialog,
    confirmDelete,
    confirmInstrument,
  };
};
