import type { CoinbaseProduct } from '@/connections/coinbase';
import {
  useCoinbaseProducts,
  type UseCoinbaseProductsResult,
} from '@/connections/hooks/useCoinbaseProducts';
import type { WatchlistSettings, WatchlistWidget } from '@/store/widgetsSlice';
import { useCallback, useRef, useState } from 'react';

export type WatchlistRow = {
  key: number;
  input: string;
  productId: string | null;
  /** Set on blur when the typed text matches no product. */
  invalid: boolean;
};

export type UseWatchlistDialogParams = {
  widget: WatchlistWidget;
  onConfirm: (settings: WatchlistSettings) => void;
};

export type UseWatchlistDialogResult = UseCoinbaseProductsResult & {
  name: string;
  setName: (name: string) => void;
  rows: WatchlistRow[];
  setRowInput: (index: number, input: string) => void;
  selectRow: (index: number, productId: string) => void;
  blurRow: (index: number) => void;
  removeRow: (index: number) => void;
  canConfirm: boolean;
  confirm: () => void;
};

const isBlank = (row: WatchlistRow) => row.input.trim() === '' && row.productId === null;

const matchProduct = (products: CoinbaseProduct[], input: string) =>
  products.find((product) => product.id === input.trim().toUpperCase())?.id ?? null;

/**
 * Draft name and instrument rows. The list always ends with one blank row so the next instrument
 * can be typed straight away; blank rows are ignored on confirm.
 */
export const useWatchlistDialog = ({
  widget,
  onConfirm,
}: UseWatchlistDialogParams): UseWatchlistDialogResult => {
  const productsResult = useCoinbaseProducts();
  const { products } = productsResult;
  const nextKey = useRef(0);
  const blankRow = useCallback(
    (): WatchlistRow => ({ key: nextKey.current++, input: '', productId: null, invalid: false }),
    [],
  );
  const [name, setName] = useState(widget.name);
  const [rows, setRows] = useState<WatchlistRow[]>(() => [
    ...widget.productIds.map((productId) => ({ ...blankRow(), input: productId, productId })),
    blankRow(),
  ]);

  const update = useCallback(
    (mutate: (current: WatchlistRow[]) => WatchlistRow[]) =>
      setRows((current) => {
        const next = mutate(current);
        while (next.length >= 2 && isBlank(next[next.length - 1]) && isBlank(next[next.length - 2])) {
          next.pop();
        }
        if (next.length === 0 || !isBlank(next[next.length - 1])) next.push(blankRow());
        return next;
      }),
    [blankRow],
  );

  const setRowInput = useCallback(
    (index: number, input: string) =>
      update((current) =>
        current.map((row, i) =>
          i === index ? { ...row, input, productId: matchProduct(products, input), invalid: false } : row,
        ),
      ),
    [products, update],
  );
  const selectRow = useCallback(
    (index: number, productId: string) =>
      update((current) =>
        current.map((row, i) => (i === index ? { ...row, input: productId, productId, invalid: false } : row)),
      ),
    [update],
  );
  const blurRow = useCallback(
    (index: number) =>
      update((current) =>
        current.map((row, i) =>
          i === index ? { ...row, invalid: row.productId === null && row.input.trim() !== '' } : row,
        ),
      ),
    [update],
  );
  const removeRow = useCallback(
    (index: number) => update((current) => current.filter((_, i) => i !== index)),
    [update],
  );

  const canConfirm =
    name.trim().length > 0 && rows.every((row) => row.productId !== null || isBlank(row));
  const confirm = useCallback(() => {
    if (!canConfirm) return;
    onConfirm({
      name,
      productIds: rows.flatMap((row) => (row.productId === null ? [] : [row.productId])),
    });
  }, [canConfirm, name, onConfirm, rows]);

  return {
    ...productsResult,
    name,
    setName,
    rows,
    setRowInput,
    selectRow,
    blurRow,
    removeRow,
    canConfirm,
    confirm,
  };
};
