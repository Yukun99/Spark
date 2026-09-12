import { EditModeButton } from '@/features/grid/editModeButton';
import { createAppStore } from '@/store/store';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';

describe('EditModeButton', () => {
  it('toggles edit mode in the store', async () => {
    const store = createAppStore();
    const user = userEvent.setup();
    render(
      <Provider store={store}>
        <EditModeButton />
      </Provider>,
    );

    await user.click(screen.getByRole('button', { name: 'Enter edit mode' }));
    expect(store.getState().layout.editMode).toBe(true);
    expect(screen.getByRole('button', { name: 'Save layout' })).toBeInTheDocument();
  });
});
