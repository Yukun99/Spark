import { RadioRow } from '@/components/forms/radioRow';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('option rows', () => {
  it('keeps focus on the control when its label text is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<RadioRow label='Side' value='buy' options={['buy', 'sell']} onChange={onChange} />);
    const sell = screen.getByRole('radio', { name: 'sell' });
    const blurs: string[] = [];
    sell.addEventListener('blur', () => blurs.push('sell'));

    await user.click(screen.getByText('sell'));
    expect(onChange).toHaveBeenCalledWith('sell');
    expect(sell).toHaveFocus();
    expect(blurs).toEqual([]);
  });
});
