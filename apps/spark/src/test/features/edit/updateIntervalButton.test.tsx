import { UpdateIntervalButton } from '@/features/edit/updateIntervalButton';
import { createAppStore } from '@/store/store';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';

describe('UpdateIntervalButton', () => {
  it('cycles through the interval options and shows the current one', async () => {
    const store = createAppStore();
    const user = userEvent.setup();
    render(
      <Provider store={store}>
        <UpdateIntervalButton />
      </Provider>,
    );

    const button = screen.getByRole('button', { name: /refresh interval/ });
    expect(button).toHaveTextContent('1s');

    for (const label of ['2s', '5s', '10s', '250ms', '500ms', '1s']) {
      await user.click(button);
      expect(button).toHaveTextContent(label);
    }
    expect(store.getState().settings.updateIntervalMs).toBe(1000);
  });
});
