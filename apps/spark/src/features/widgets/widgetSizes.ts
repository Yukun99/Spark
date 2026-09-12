import type { WidgetLayout } from '@/features/grid/gridTypes';

export type WidgetType = 'instrument' | 'watchlist' | 'orders';

export type WidgetSize = Required<Pick<WidgetLayout, 'rowSpan' | 'colSpan'>>;

/** Grid footprint each widget type is created with. */
export const WIDGET_SIZES: Record<WidgetType, WidgetSize> = {
  instrument: { rowSpan: 1, colSpan: 1 },
  watchlist: { rowSpan: 2, colSpan: 2 },
  orders: { rowSpan: 1, colSpan: 4 },
};

/** Smallest footprint a widget type can be resized down to. */
export const WIDGET_MIN_SIZES: Record<WidgetType, WidgetSize> = {
  instrument: { rowSpan: 1, colSpan: 1 },
  watchlist: { rowSpan: 1, colSpan: 2 },
  orders: { rowSpan: 1, colSpan: 4 },
};
