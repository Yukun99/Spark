import { useCoinbaseProducts, type UseCoinbaseProductsResult } from '@/connections/hooks/useCoinbaseProducts';
import type { WatchlistSettings, WatchlistWidget } from '@/store/widgetsSlice';
import { useCallback, useState } from 'react';

export type UseWatchlistDialogParams = {
  widget: WatchlistWidget;
  onConfirm: (settings: WatchlistSettings) => void;
};

export type UseWatchlistDialogResult = UseCoinbaseProductsResult & {
  name: string;
  setName: (name: string) => void;
  rows: (string | null)[];
  setRow: (index: number, productId: string | null) => void;
  addRow: () => void;
  canConfirm: boolean;
  confirm: () => void;
};

/** Local draft of the watchlist name and instrument rows; empty rows are dropped on confirm. */
export const useWatchlistDialog = ({
  widget,
  onConfirm,
}: UseWatchlistDialogParams): UseWatchlistDialogResult => {
  const products = useCoinbaseProducts();
  const [name, setName] = useState(widget.name);
  const [rows, setRows] = useState<(string | null)[]>(widget.productIds);

  const setRow = useCallback((index: number, productId: string | null) => {
    setRows((current) => current.map((row, i) => (i === index ? productId : row)));
  }, []);
  const addRow = useCallback(() => setRows((current) => [...current, null]), []);

  const canConfirm = name.trim().length > 0;
  const confirm = useCallback(() => {
    if (!canConfirm) return;
    onConfirm({ name, productIds: rows.filter((row): row is string => row !== null) });
  }, [canConfirm, name, onConfirm, rows]);

  return { ...products, name, setName, rows, setRow, addRow, canConfirm, confirm };
};
