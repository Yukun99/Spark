export type GridCell = { row: number; col: number };

export type WidgetLayout = GridCell & {
  rowSpan?: number;
  colSpan?: number;
};
