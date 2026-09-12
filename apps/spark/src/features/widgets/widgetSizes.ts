import type { WidgetLayout } from '@/features/grid/gridTypes';

export type WidgetType = 'instrument' | 'watchlist';

export type WidgetSize = Required<Pick<WidgetLayout, 'rowSpan' | 'colSpan'>>;

/** Grid footprint each widget type is created with. */
export const WIDGET_SIZES: Record<WidgetType, WidgetSize> = {
  instrument: { rowSpan: 1, colSpan: 1 },
  watchlist: { rowSpan: 2, colSpan: 2 },
};
