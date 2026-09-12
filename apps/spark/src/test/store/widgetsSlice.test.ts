import { GRID_COLS, GRID_ROWS } from '@/features/grid/gridConfig';
import {
  addInstrumentWidget,
  moveWidget,
  removeWidget,
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
    state = widgetsReducer(state, addInstrumentWidget());
    expect(state.items[1].layout).toEqual({ row: 1, col: 2 });

    for (let i = 0; i < GRID_ROWS * GRID_COLS; i++) state = widgetsReducer(state, addInstrumentWidget());
    expect(state.items).toHaveLength(GRID_ROWS * GRID_COLS);
  });

  it('removes a widget by id', () => {
    const state = widgetsReducer(initial(), removeWidget('initial'));
    expect(state.items).toHaveLength(0);
  });

  it('moves onto free cells but rejects occupied or out-of-range targets', () => {
    let state = widgetsReducer(initial(), addInstrumentWidget());
    const second = state.items[1].id;

    state = widgetsReducer(state, moveWidget({ id: second, row: 3, col: 6 }));
    expect(state.items[1].layout).toEqual({ row: 3, col: 6 });

    state = widgetsReducer(state, moveWidget({ id: second, row: 1, col: 1 }));
    expect(state.items[1].layout).toEqual({ row: 3, col: 6 });

    state = widgetsReducer(state, moveWidget({ id: second, row: 4, col: 1 }));
    expect(state.items[1].layout).toEqual({ row: 3, col: 6 });
  });

  it('changes the tracked instrument', () => {
    const state = widgetsReducer(initial(), setWidgetInstrument({ id: 'initial', productId: 'ETH-USD' }));
    expect(state.items[0].productId).toBe('ETH-USD');
  });
});
