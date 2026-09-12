import { GRID_COLS, GRID_ROWS } from '@/features/grid/gridConfig';
import type { GridCell, WidgetLayout } from '@/features/grid/gridTypes';

const cellKey = ({ row, col }: GridCell) => `${row}-${col}`;

const cellsOf = ({ row, col, rowSpan = 1, colSpan = 1 }: WidgetLayout): GridCell[] => {
  const cells: GridCell[] = [];
  for (let r = row; r < row + rowSpan; r++) {
    for (let c = col; c < col + colSpan; c++) cells.push({ row: r, col: c });
  }
  return cells;
};

const occupiedKeys = (layouts: WidgetLayout[]) =>
  new Set(layouts.flatMap((layout) => cellsOf(layout).map(cellKey)));

export const fitsInGrid = ({ row, col, rowSpan = 1, colSpan = 1 }: WidgetLayout) =>
  row >= 1 && col >= 1 && row + rowSpan - 1 <= GRID_ROWS && col + colSpan - 1 <= GRID_COLS;

/** True when `layout` is inside the grid and overlaps none of `others`. */
export const canPlace = (others: WidgetLayout[], layout: WidgetLayout) => {
  if (!fitsInGrid(layout)) return false;
  const occupied = occupiedKeys(others);
  return cellsOf(layout).every((cell) => !occupied.has(cellKey(cell)));
};

/** Cells (1-based) not covered by any of the given widget layouts. */
export const getEmptyCells = (layouts: WidgetLayout[]): GridCell[] => {
  const occupied = occupiedKeys(layouts);
  const empty: GridCell[] = [];
  for (let row = 1; row <= GRID_ROWS; row++) {
    for (let col = 1; col <= GRID_COLS; col++) {
      if (!occupied.has(cellKey({ row, col }))) empty.push({ row, col });
    }
  }
  return empty;
};

/** First cell (row-major) where a widget of the given size fits, if any. */
export const findFreeCell = (
  layouts: WidgetLayout[],
  size: Pick<WidgetLayout, 'rowSpan' | 'colSpan'> = {},
): GridCell | undefined =>
  getEmptyCells(layouts).find((cell) => canPlace(layouts, { ...cell, ...size }));
