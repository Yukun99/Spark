import { GRID_COLS, GRID_ROWS } from '@/features/grid/gridConfig';
import { GridWidget } from '@/features/grid/gridWidget';
import { WidgetGrid } from '@/features/grid/widgetGrid';
import { render, screen } from '@testing-library/react';

describe('WidgetGrid', () => {
  it('renders a dot at every inner intersection', () => {
    render(<WidgetGrid />);
    expect(screen.getAllByTestId('grid-dot')).toHaveLength((GRID_ROWS - 1) * (GRID_COLS - 1));
  });

  it('fills every unoccupied cell with a placeholder', () => {
    render(
      <WidgetGrid>
        <GridWidget layout={{ row: 1, col: 1, colSpan: 2 }} />
      </WidgetGrid>,
    );
    expect(screen.getAllByTestId('grid-placeholder')).toHaveLength(GRID_ROWS * GRID_COLS - 2);
    expect(screen.getAllByTestId('grid-placeholder-line')).toHaveLength(
      (GRID_ROWS * GRID_COLS - 2) * 5,
    );
  });

  it('places a widget on the requested cells', () => {
    render(
      <WidgetGrid>
        <GridWidget layout={{ row: 2, col: 3, rowSpan: 2, colSpan: 2 }}>
          <span>widget</span>
        </GridWidget>
      </WidgetGrid>,
    );
    const cell = screen.getByText('widget').parentElement;
    expect(cell).toHaveStyle({
      gridRowStart: '2',
      gridRowEnd: 'span 2',
      gridColumnStart: '3',
      gridColumnEnd: 'span 2',
    });
  });
});
