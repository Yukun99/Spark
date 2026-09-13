import { PageBar } from '@/components/pageBar';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const button = (name: string) => screen.getByRole('button', { name });
const field = () => screen.getByRole('textbox', { name: 'Page' });

describe('PageBar', () => {
  it('disables the steppers at either end and steps one page or to the ends', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = render(<PageBar page={1} pageCount={4} onChange={onChange} />);
    expect(screen.getByText('/ 4')).toBeInTheDocument();
    expect(field()).toHaveValue('1');
    expect(button('First page')).toBeDisabled();
    expect(button('Previous page')).toBeDisabled();
    await user.click(button('Next page'));
    await user.click(button('Last page'));
    expect(onChange.mock.calls).toEqual([[2], [4]]);

    rerender(<PageBar page={4} pageCount={4} onChange={onChange} />);
    expect(field()).toHaveValue('4');
    expect(button('Next page')).toBeDisabled();
    expect(button('Last page')).toBeDisabled();
    await user.click(button('Previous page'));
    await user.click(button('First page'));
    expect(onChange.mock.calls.slice(2)).toEqual([[3], [1]]);
  });

  it('shows one page with everything disabled', () => {
    render(<PageBar page={1} pageCount={1} onChange={vi.fn()} />);
    for (const name of ['First page', 'Previous page', 'Next page', 'Last page']) {
      expect(button(name)).toBeDisabled();
    }
  });

  it('only lets pages in range be typed and applies them on Enter or blur', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<PageBar page={2} pageCount={12} onChange={onChange} />);
    await user.click(field());
    await user.keyboard('9');
    expect(field()).toHaveValue('9');
    await user.keyboard('9');
    expect(field()).toHaveValue('9');
    await user.keyboard('{Backspace}');
    expect(field()).toHaveValue('');
    await user.keyboard('0');
    expect(field()).toHaveValue('');
    await user.keyboard('a');
    expect(field()).toHaveValue('');
    await user.keyboard('12{Enter}');
    expect(onChange).toHaveBeenCalledExactlyOnceWith(12);

    await user.click(field());
    await user.keyboard('{Backspace}');
    await user.tab();
    expect(field()).toHaveValue('2');
    await user.click(field());
    await user.keyboard('2');
    await user.tab();
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
