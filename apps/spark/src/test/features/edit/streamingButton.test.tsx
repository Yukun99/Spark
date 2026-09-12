import { StreamingButton } from '@/features/edit/streamingButton';
import { createAppStore } from '@/store/store';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';

describe('StreamingButton', () => {
  it('pauses and resumes streaming in the store', async () => {
    const store = createAppStore();
    const user = userEvent.setup();
    render(
      <Provider store={store}>
        <StreamingButton />
      </Provider>,
    );

    await user.click(screen.getByRole('button', { name: 'Pause streaming' }));
    expect(store.getState().settings.streaming).toBe(false);
    await user.click(screen.getByRole('button', { name: 'Resume streaming' }));
    expect(store.getState().settings.streaming).toBe(true);
  });
});
