import type { TradeSide } from '@/connections/coinbase';
import { MAX_DECIMALS } from '@/features/widgets/instrument/dialog/orderValidation';
import type { OrderFilter, OrderStatus, OrderType } from '@/store/ordersSlice';
import dayjs, { type Dayjs } from 'dayjs';
import { useCallback, useState } from 'react';

/** Radio value meaning "don't filter by side". */
export const ANY_SIDE = 'any';
export type SideChoice = TradeSide | typeof ANY_SIDE;

export type FilterForm = {
  productId: string | null;
  side: SideChoice;
  statuses: OrderStatus[];
  types: OrderType[];
  minPrice: string;
  maxPrice: string;
  from: Dayjs | null;
  to: Dayjs | null;
};

export type UseOrderFilterDialogParams = {
  initial: OrderFilter;
  onApply: (filter: OrderFilter) => void;
};

export type UseOrderFilterDialogResult = {
  form: FilterForm;
  setProductId: (productId: string | null) => void;
  setSide: (side: SideChoice) => void;
  toggleStatus: (status: OrderStatus) => void;
  toggleType: (type: OrderType) => void;
  setMinPrice: (value: string) => void;
  setMaxPrice: (value: string) => void;
  setFrom: (value: Dayjs | null) => void;
  setTo: (value: Dayjs | null) => void;
  minPriceError: string | null;
  maxPriceError: string | null;
  toError: string | null;
  canConfirm: boolean;
  clear: () => void;
  confirm: () => void;
};

const NUMBER_PATTERN = /^\d*\.?\d*$/;

const EMPTY_FORM: FilterForm = {
  productId: null,
  side: ANY_SIDE,
  statuses: [],
  types: [],
  minPrice: '',
  maxPrice: '',
  from: null,
  to: null,
};

/** Blank is allowed (unbound); otherwise a non-negative number with sane precision. */
export const validateBound = (value: string): string | null => {
  const trimmed = value.trim();
  if (trimmed === '') return null;
  if (!NUMBER_PATTERN.test(trimmed) || Number.isNaN(Number(trimmed))) return 'Enter a number';
  const decimals = trimmed.split('.')[1]?.length ?? 0;
  if (decimals > MAX_DECIMALS) return `At most ${MAX_DECIMALS} decimal places`;
  return null;
};

const toggle = <T>(values: T[], value: T) =>
  values.includes(value) ? values.filter((item) => item !== value) : [...values, value];

/** Seeds the form from an active filter so reopening the dialog shows what is applied. */
export const formFromFilter = (filter: OrderFilter): FilterForm => ({
  productId: filter.productId ?? null,
  side: filter.side ?? ANY_SIDE,
  statuses: [...(filter.statuses ?? [])],
  types: [...(filter.types ?? [])],
  minPrice: filter.minPrice === undefined ? '' : String(filter.minPrice),
  maxPrice: filter.maxPrice === undefined ? '' : String(filter.maxPrice),
  from: filter.from === undefined ? null : dayjs(filter.from),
  to: filter.to === undefined ? null : dayjs(filter.to),
});

/** Only set fields make it into the filter; dates cover whole days. */
export const filterFromForm = (form: FilterForm): OrderFilter => {
  const filter: OrderFilter = {};
  if (form.productId !== null) filter.productId = form.productId;
  if (form.side !== ANY_SIDE) filter.side = form.side;
  if (form.statuses.length > 0) filter.statuses = [...form.statuses];
  if (form.types.length > 0) filter.types = [...form.types];
  if (form.minPrice.trim() !== '') filter.minPrice = Number(form.minPrice);
  if (form.maxPrice.trim() !== '') filter.maxPrice = Number(form.maxPrice);
  if (form.from !== null) filter.from = form.from.startOf('day').valueOf();
  if (form.to !== null) filter.to = form.to.endOf('day').valueOf();
  return filter;
};

export const useOrderFilterDialog = ({
  initial,
  onApply,
}: UseOrderFilterDialogParams): UseOrderFilterDialogResult => {
  const [form, setForm] = useState<FilterForm>(() => formFromFilter(initial));
  const patch = useCallback(
    (changes: Partial<FilterForm>) => setForm((prev) => ({ ...prev, ...changes })),
    [],
  );

  const setProductId = useCallback((productId: string | null) => patch({ productId }), [patch]);
  const setSide = useCallback((side: SideChoice) => patch({ side }), [patch]);
  const toggleStatus = useCallback(
    (status: OrderStatus) => setForm((prev) => ({ ...prev, statuses: toggle(prev.statuses, status) })),
    [],
  );
  const toggleType = useCallback(
    (type: OrderType) => setForm((prev) => ({ ...prev, types: toggle(prev.types, type) })),
    [],
  );
  const setMinPrice = useCallback((minPrice: string) => patch({ minPrice }), [patch]);
  const setMaxPrice = useCallback((maxPrice: string) => patch({ maxPrice }), [patch]);
  const setFrom = useCallback((from: Dayjs | null) => patch({ from }), [patch]);
  const setTo = useCallback((to: Dayjs | null) => patch({ to }), [patch]);

  const minPriceError = validateBound(form.minPrice);
  const boundsValid = minPriceError === null && validateBound(form.maxPrice) === null;
  const rangeInverted =
    boundsValid &&
    form.minPrice.trim() !== '' &&
    form.maxPrice.trim() !== '' &&
    Number(form.minPrice) > Number(form.maxPrice);
  const maxPriceError =
    validateBound(form.maxPrice) ?? (rangeInverted ? 'Must be at least the minimum price' : null);
  const invalidDate = (value: Dayjs | null) => value !== null && !value.isValid();
  const toError =
    invalidDate(form.from) || invalidDate(form.to)
      ? 'Enter a valid date'
      : form.from !== null && form.to !== null && form.from.isAfter(form.to, 'day')
        ? 'Must be on or after the start date'
        : null;
  const canConfirm = minPriceError === null && maxPriceError === null && toError === null;

  const clear = useCallback(() => setForm(EMPTY_FORM), []);
  const confirm = useCallback(() => {
    if (canConfirm) onApply(filterFromForm(form));
  }, [canConfirm, form, onApply]);

  return {
    form,
    setProductId,
    setSide,
    toggleStatus,
    toggleType,
    setMinPrice,
    setMaxPrice,
    setFrom,
    setTo,
    minPriceError,
    maxPriceError,
    toError,
    canConfirm,
    clear,
    confirm,
  };
};
