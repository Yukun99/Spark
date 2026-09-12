import { TransactionTypeDisplay } from '@/components/transactionTypeDisplay';
import { trade } from '@/styles/palette';
import { render, screen } from '@testing-library/react';

describe('TransactionTypeDisplay', () => {
  it('shows Buy on green and Sell on red at the requested size', () => {
    render(
      <>
        <TransactionTypeDisplay side='buy' />
        <TransactionTypeDisplay side='sell' fontSize={14} />
      </>,
    );
    expect(screen.getByText('Buy')).toHaveStyle({ backgroundColor: trade.buy.light, fontSize: 12 });
    expect(screen.getByText('Sell')).toHaveStyle({
      backgroundColor: trade.sell.light,
      fontSize: 14,
    });
  });

  it('shows a bare placeholder before any trade', () => {
    render(<TransactionTypeDisplay side={undefined} />);
    expect(screen.getByText('--')).not.toHaveAttribute('data-side');
  });
});
