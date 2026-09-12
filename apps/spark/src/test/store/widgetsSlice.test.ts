import { GRID_COLS, GRID_ROWS } from '@/features/grid/gridConfig';
import type { WidgetLayout } from '@/features/grid/gridTypes';
import {
  addWidget,
  moveWidget,
  removeWidget,
  resizeWidget,
  setWatchlist,
  setWidgetInstrument,
  widgetsReducer,
  type WidgetsState,
} from '@/store/widgetsSlice';

const initial = () => widgetsReducer(undefined, { type: 'init' });

describe('widgetsSlice', () => {
  it('seeds one BTC widget in the first cell', () => {
    expect(initial().items).toEqual([
      expect.objectContaining({ productId: 'BTC-USD', layout: { row: 1, col: 1 } }),
    ]);
  });

  it('adds widgets into the first free cell and stops when the grid is full', () => {
    let state: WidgetsState = initial();
    state = widgetsReducer(state, addWidget('instrument'));
    expect(state.items[1].layout).toEqual({ row: 1, col: 2, rowSpan: 1, colSpan: 1 });

    for (let i = 0; i < GRID_ROWS * GRID_COLS; i++) state = widgetsReducer(state, addWidget('instrument'));
    expect(state.items).toHaveLength(GRID_ROWS * GRID_COLS);
  });

  it('adds an empty 2x2 watchlist where it fits, or at a requested free cell', () => {
    let state = widgetsReducer(initial(), addWidget('watchlist'));
    expect(state.items[1]).toMatchObject({
      type: 'watchlist',
      name: 'Watchlist',
      productIds: [],
      layout: { row: 1, col: 2, rowSpan: 2, colSpan: 2 },
    });

    state = widgetsReducer(state, addWidget('watchlist', { row: 2, col: 2 }));
    expect(state.items).toHaveLength(2);
    state = widgetsReducer(state, addWidget('watchlist', { row: 2, col: 5 }));
    expect(state.items[2].layout).toEqual({ row: 2, col: 5, rowSpan: 2, colSpan: 2 });
  });

  it('removes a widget by id', () => {
    const state = widgetsReducer(initial(), removeWidget('initial'));
    expect(state.items).toHaveLength(0);
  });

  it('moves onto free cells but rejects occupied or out-of-range targets', () => {
    let state = widgetsReducer(initial(), addWidget('instrument'));
    const second = state.items[1].id;

    state = widgetsReducer(state, moveWidget({ id: second, row: 3, col: 6 }));
    expect(state.items[1].layout).toMatchObject({ row: 3, col: 6 });

    state = widgetsReducer(state, moveWidget({ id: second, row: 1, col: 1 }));
    expect(state.items[1].layout).toMatchObject({ row: 3, col: 6 });

    state = widgetsReducer(state, moveWidget({ id: second, row: 4, col: 1 }));
    expect(state.items[1].layout).toMatchObject({ row: 3, col: 6 });
  });

  it('resizes within the grid onto free cells, never below the type minimum', () => {
    let state = widgetsReducer(initial(), addWidget('watchlist', { row: 1, col: 3 }));
    const watchlist = state.items[1].id;

    const at = (id: string, layout: Partial<WidgetLayout>) =>
      resizeWidget({ id, row: 1, col: 1, rowSpan: 1, colSpan: 1, ...layout });

    state = widgetsReducer(state, at('initial', { rowSpan: 2, colSpan: 2 }));
    expect(state.items[0].layout).toMatchObject({ rowSpan: 2, colSpan: 2 });
    state = widgetsReducer(state, at('initial', { rowSpan: 2, colSpan: 3 }));
    expect(state.items[0].layout).toMatchObject({ rowSpan: 2, colSpan: 2 });
    state = widgetsReducer(state, at('initial', { rowSpan: 4, colSpan: 2 }));
    expect(state.items[0].layout).toMatchObject({ rowSpan: 2, colSpan: 2 });
    state = widgetsReducer(state, at('initial', { row: 0, rowSpan: 3, colSpan: 2 }));
    expect(state.items[0].layout).toMatchObject({ row: 1, rowSpan: 2, colSpan: 2 });

    state = widgetsReducer(state, at(watchlist, { col: 3, rowSpan: 1, colSpan: 2 }));
    expect(state.items[1].layout).toMatchObject({ rowSpan: 2, colSpan: 2 });
    state = widgetsReducer(state, at(watchlist, { col: 3, rowSpan: 3, colSpan: 4 }));
    expect(state.items[1].layout).toMatchObject({ row: 1, col: 3, rowSpan: 3, colSpan: 4 });
    state = widgetsReducer(state, at(watchlist, { row: 2, col: 3, rowSpan: 2, colSpan: 4 }));
    expect(state.items[1].layout).toMatchObject({ row: 2, col: 3, rowSpan: 2, colSpan: 4 });
  });

  it('renames a watchlist and replaces its instruments, deduplicated', () => {
    let state = widgetsReducer(initial(), addWidget('watchlist'));
    const id = state.items[1].id;
    state = widgetsReducer(state, setWatchlist({ id, name: ' Majors ', productIds: ['BTC-USD', 'ETH-USD', 'BTC-USD'] }));
    expect(state.items[1]).toMatchObject({ name: 'Majors', productIds: ['BTC-USD', 'ETH-USD'] });

    state = widgetsReducer(state, setWatchlist({ id, name: '  ', productIds: [] }));
    expect(state.items[1]).toMatchObject({ name: 'Watchlist', productIds: [] });
    state = widgetsReducer(state, setWatchlist({ id: 'initial', name: 'x', productIds: [] }));
    expect(state.items[0]).not.toHaveProperty('name');
  });

  it('changes the tracked instrument', () => {
    const state = widgetsReducer(initial(), setWidgetInstrument({ id: 'initial', productId: 'ETH-USD' }));
    expect(state.items[0]).toMatchObject({ productId: 'ETH-USD' });
  });
});
