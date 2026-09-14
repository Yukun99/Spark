import { EditModeButton } from '@/features/edit/editModeButton';
import { createAppStore } from '@/store/store';
import { render, screen, waitFor } from '@testing-library/react';
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

    await user.click(await screen.findByRole('button', { name: 'Enter edit mode' }));
    await waitFor(() => expect(store.getState().layout.editMode).toBe(true));
    expect(await screen.findByRole('button', { name: 'Save layout' })).toBeInTheDocument();
  });
});
