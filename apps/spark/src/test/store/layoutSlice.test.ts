import { layoutReducer, toggleEditMode } from '@/store/layoutSlice';

describe('layoutSlice', () => {
  it('starts with edit mode off and toggles it', () => {
    const initial = layoutReducer(undefined, { type: 'init' });
    expect(initial.editMode).toBe(false);

    const on = layoutReducer(initial, toggleEditMode());
    expect(on.editMode).toBe(true);

    expect(layoutReducer(on, toggleEditMode()).editMode).toBe(false);
  });
});
