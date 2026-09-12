import { layoutReducer, setDragTarget, toggleEditMode } from '@/store/layoutSlice';

describe('layoutSlice', () => {
  it('starts with edit mode off and toggles it', () => {
    const initial = layoutReducer(undefined, { type: 'init' });
    expect(initial.editMode).toBe(false);

    const on = layoutReducer(initial, toggleEditMode());
    expect(on.editMode).toBe(true);

    expect(layoutReducer(on, toggleEditMode()).editMode).toBe(false);
  });

  it('tracks the drag target and clears it when edit mode toggles', () => {
    let state = layoutReducer(undefined, { type: 'init' });
    state = layoutReducer(state, setDragTarget({ row: 2, col: 3 }));
    expect(state.dragTarget).toEqual({ row: 2, col: 3 });

    const same = layoutReducer(state, setDragTarget({ row: 2, col: 3 }));
    expect(same.dragTarget).toBe(state.dragTarget);

    expect(layoutReducer(state, toggleEditMode()).dragTarget).toBeNull();
  });
});
