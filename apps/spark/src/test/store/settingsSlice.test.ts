import {
  cycleUpdateInterval,
  setUpdateInterval,
  settingsReducer,
  toggleStreaming,
  UPDATE_INTERVAL_OPTIONS_MS,
} from '@/store/settingsSlice';

describe('settingsSlice', () => {
  it('cycles through the options and wraps around', () => {
    let state = settingsReducer(undefined, { type: 'init' });
    const seen: number[] = [];
    for (let i = 0; i < UPDATE_INTERVAL_OPTIONS_MS.length; i++) {
      state = settingsReducer(state, cycleUpdateInterval());
      seen.push(state.updateIntervalMs);
    }
    expect(seen).toEqual([2000, 5000, 10000, 250, 500, 1000]);
  });

  it('cycles to the first option from a value outside the list', () => {
    const state = settingsReducer(
      settingsReducer(undefined, setUpdateInterval(123)),
      cycleUpdateInterval(),
    );
    expect(state.updateIntervalMs).toBe(250);
  });

  it('starts streaming and toggles it off and on', () => {
    const initial = settingsReducer(undefined, { type: 'init' });
    expect(initial.streaming).toBe(true);
    const off = settingsReducer(initial, toggleStreaming());
    expect(off.streaming).toBe(false);
    expect(settingsReducer(off, toggleStreaming()).streaming).toBe(true);
  });
});
