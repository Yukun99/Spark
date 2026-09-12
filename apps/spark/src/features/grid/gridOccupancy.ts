import { GRID_COLS, GRID_ROWS } from '@/features/grid/gridConfig';
import type { WidgetLayout } from '@/features/grid/gridWidget';

export type GridCell = { row: number; col: number };

const cellKey = ({ row, col }: GridCell) => `${row}-${col}`;

/** Cells (1-based) not covered by any of the given widget layouts. */
export const getEmptyCells = (layouts: WidgetLayout[]): GridCell[] => {
  const occupied = new Set<string>();
  for (const { row, col, rowSpan = 1, colSpan = 1 } of layouts) {
    for (let r = row; r < row + rowSpan; r++) {
      for (let c = col; c < col + colSpan; c++) {
        occupied.add(cellKey({ row: r, col: c }));
      }
    }
  }

  const empty: GridCell[] = [];
  for (let row = 1; row <= GRID_ROWS; row++) {
    for (let col = 1; col <= GRID_COLS; col++) {
      if (!occupied.has(cellKey({ row, col }))) empty.push({ row, col });
    }
  }
  return empty;
};
