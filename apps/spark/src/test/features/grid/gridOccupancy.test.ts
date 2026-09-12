import { GRID_COLS, GRID_ROWS } from '@/features/grid/gridConfig';
import { getEmptyCells } from '@/features/grid/gridOccupancy';

describe('getEmptyCells', () => {
  it('returns every cell when nothing is placed', () => {
    expect(getEmptyCells([])).toHaveLength(GRID_ROWS * GRID_COLS);
  });

  it('excludes cells covered by spanning widgets', () => {
    const empty = getEmptyCells([{ row: 2, col: 3, rowSpan: 2, colSpan: 2 }]);
    expect(empty).toHaveLength(GRID_ROWS * GRID_COLS - 4);
    expect(empty).not.toContainEqual({ row: 3, col: 4 });
    expect(empty).toContainEqual({ row: 1, col: 1 });
  });
});
