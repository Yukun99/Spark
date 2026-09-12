import { GRID_COLS, GRID_ROWS } from '@/features/grid/gridConfig';
import { canPlace, findFreeCell, getEmptyCells } from '@/features/grid/gridOccupancy';

describe('gridOccupancy', () => {
  it('returns every cell when nothing is placed', () => {
    expect(getEmptyCells([])).toHaveLength(GRID_ROWS * GRID_COLS);
  });

  it('excludes cells covered by spanning widgets', () => {
    const empty = getEmptyCells([{ row: 2, col: 3, rowSpan: 2, colSpan: 2 }]);
    expect(empty).toHaveLength(GRID_ROWS * GRID_COLS - 4);
    expect(empty).not.toContainEqual({ row: 3, col: 4 });
    expect(empty).toContainEqual({ row: 1, col: 1 });
  });

  it('checks placement against bounds and other widgets', () => {
    const others = [{ row: 1, col: 1, colSpan: 2 }];
    expect(canPlace(others, { row: 1, col: 2 })).toBe(false);
    expect(canPlace(others, { row: 1, col: 3 })).toBe(true);
    expect(canPlace(others, { row: 3, col: 6, colSpan: 2 })).toBe(false);
  });

  it('finds the first free cell that fits the requested size', () => {
    expect(findFreeCell([{ row: 1, col: 1 }])).toEqual({ row: 1, col: 2 });
    expect(findFreeCell([{ row: 1, col: 1, colSpan: 6 }], { rowSpan: 2 })).toEqual({ row: 2, col: 1 });
  });
});
