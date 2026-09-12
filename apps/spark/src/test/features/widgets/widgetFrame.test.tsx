import { GRID_COLS, GRID_ROWS } from '@/features/grid/gridConfig';
import { WidgetGrid } from '@/features/grid/widgetGrid';
import { useWidgets } from '@/features/widgets/hooks/useWidgets';
import { WidgetFrame } from '@/features/widgets/widgetFrame';
import { toggleEditMode } from '@/store/layoutSlice';
import { createAppStore } from '@/store/store';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

const GRID_WIDTH = 600;
const GRID_HEIGHT = 300;
const CELL = 100;

const renderFrame = ({ editMode = true, tickAt }: { editMode?: boolean; tickAt?: number } = {}) => {
  const store = createAppStore();
  if (editMode) store.dispatch(toggleEditMode());
  const widget = store.getState().widgets.items[0];
  const onExpand = vi.fn();
  render(
    <Provider store={store}>
      <WidgetGrid layouts={[widget.layout]}>
        <WidgetFrame
          widget={widget}
          name='BTC-USD'
          onDelete={vi.fn()}
          onModify={vi.fn()}
          onExpand={onExpand}
          tickAt={tickAt}
        >
          <span>content</span>
        </WidgetFrame>
      </WidgetGrid>
    </Provider>,
  );
  const grid = document.querySelector('[data-widget-grid]') as HTMLElement;
  vi.spyOn(grid, 'getBoundingClientRect').mockReturnValue({
    width: GRID_WIDTH,
    height: GRID_HEIGHT,
  } as DOMRect);
  return { store, frame: screen.getByTestId('widget-frame'), onExpand };
};

const GLOW = '[data-testid="freshness-glow"]';

const pointer = (x: number, y: number) => ({ clientX: x, clientY: y, button: 0, pointerId: 1 });

describe('WidgetFrame drag', () => {
  beforeEach(() => {
    HTMLElement.prototype.setPointerCapture = vi.fn();
    HTMLElement.prototype.releasePointerCapture = vi.fn();
  });

  it('shows the hovered target while dragging and moves the widget on release', () => {
    const { store, frame } = renderFrame();

    fireEvent.pointerDown(frame, pointer(50, 50));
    expect(store.getState().layout.dragSource).toMatchObject({ row: 1, col: 1 });
    expect(store.getState().layout.dragTarget).toMatchObject({ row: 1, col: 1 });
    expect(screen.getAllByTestId('grid-placeholder')).toHaveLength(GRID_ROWS * GRID_COLS);

    fireEvent.pointerMove(frame, pointer(50 + 2 * CELL, 50 + CELL));
    expect(store.getState().layout.dragTarget).toMatchObject({ row: 2, col: 3 });
    expect(frame).toHaveStyle({ transform: `translate(${2 * CELL}px, ${CELL}px)` });

    fireEvent.pointerUp(frame, pointer(50 + 2 * CELL, 50 + CELL));
    expect(store.getState().layout.dragTarget).toBeNull();
    expect(store.getState().layout.dragSource).toBeNull();
    expect(screen.getAllByTestId('grid-placeholder')).toHaveLength(GRID_ROWS * GRID_COLS - 1);
    expect(store.getState().widgets.items[0].layout).toMatchObject({ row: 2, col: 3 });
    expect(frame).toHaveStyle({ transform: 'translate(0px, 0px)' });
  });

  it('clamps the target to the grid bounds', () => {
    const { store, frame } = renderFrame();

    fireEvent.pointerDown(frame, pointer(50, 50));
    fireEvent.pointerMove(frame, pointer(50 + 20 * CELL, 50 + 20 * CELL));
    expect(store.getState().layout.dragTarget).toMatchObject({ row: 3, col: 6 });
    fireEvent.pointerUp(frame, pointer(50 + 20 * CELL, 50 + 20 * CELL));
    expect(store.getState().widgets.items[0].layout).toMatchObject({ row: 3, col: 6 });
  });

  it('does not move on a click without dragging', () => {
    const { store, frame } = renderFrame();

    fireEvent.pointerDown(frame, pointer(50, 50));
    fireEvent.pointerMove(frame, pointer(51, 51));
    fireEvent.pointerUp(frame, pointer(51, 51));
    expect(store.getState().widgets.items[0].layout).toMatchObject({ row: 1, col: 1 });
  });

  it('ignores pointer input outside edit mode and expands on click instead', () => {
    const { store, frame, onExpand } = renderFrame({ editMode: false });

    fireEvent.pointerDown(frame, pointer(50, 50));
    fireEvent.pointerMove(frame, pointer(50 + 2 * CELL, 50 + CELL));
    expect(store.getState().layout.dragTarget).toBeNull();
    fireEvent.pointerUp(frame, pointer(50 + 2 * CELL, 50 + CELL));
    expect(store.getState().widgets.items[0].layout).toMatchObject({ row: 1, col: 1 });

    fireEvent.click(frame);
    expect(onExpand).toHaveBeenCalledTimes(1);
  });

  it('snaps the size one cell at a time from the edge bars, staying inside the grid', () => {
    const store = createAppStore();
    store.dispatch(toggleEditMode());
    const Framed = () => {
      const { widgets } = useWidgets();
      return (
        <WidgetGrid layouts={[widgets[0].layout]}>
          <WidgetFrame widget={widgets[0]} name='BTC-USD' onDelete={vi.fn()} onModify={vi.fn()}>
            <span>content</span>
          </WidgetFrame>
        </WidgetGrid>
      );
    };
    render(
      <Provider store={store}>
        <Framed />
      </Provider>,
    );
    const grid = document.querySelector('[data-widget-grid]') as HTMLElement;
    vi.spyOn(grid, 'getBoundingClientRect').mockReturnValue({
      width: GRID_WIDTH,
      height: GRID_HEIGHT,
    } as DOMRect);
    const bar = (edge: string) => screen.getByTestId(`resize-handle-${edge}`);
    const layout = () => store.getState().widgets.items[0].layout;
    expect(screen.getByTestId('widget-frame')).toContainElement(bar('top'));

    fireEvent.pointerDown(bar('bottom'), pointer(50, 100));
    fireEvent.pointerMove(bar('bottom'), pointer(50, 100 + CELL));
    expect(layout()).toMatchObject({ row: 1, rowSpan: 2, colSpan: 1 });
    fireEvent.pointerMove(bar('bottom'), pointer(50, 100 + 10 * CELL));
    expect(layout()).toMatchObject({ row: 1, rowSpan: 3, colSpan: 1 });
    fireEvent.pointerMove(bar('bottom'), pointer(50, 100 - 10 * CELL));
    expect(layout()).toMatchObject({ row: 1, rowSpan: 1, colSpan: 1 });
    fireEvent.pointerUp(bar('bottom'), pointer(50, 100 - 10 * CELL));
    expect(store.getState().layout.dragTarget).toBeNull();

    fireEvent.pointerDown(bar('right'), pointer(100, 50));
    fireEvent.pointerMove(bar('right'), pointer(100 + 2 * CELL, 50));
    expect(layout()).toMatchObject({ col: 1, rowSpan: 1, colSpan: 3 });
    fireEvent.pointerUp(bar('right'), pointer(100 + 2 * CELL, 50));

    fireEvent.pointerDown(bar('left'), pointer(0, 50));
    fireEvent.pointerMove(bar('left'), pointer(CELL, 50));
    expect(layout()).toMatchObject({ col: 2, colSpan: 2 });
    fireEvent.pointerMove(bar('left'), pointer(-5 * CELL, 50));
    expect(layout()).toMatchObject({ col: 1, colSpan: 3 });
    fireEvent.pointerUp(bar('left'), pointer(-5 * CELL, 50));

    fireEvent.pointerDown(bar('top'), pointer(50, 0));
    fireEvent.pointerMove(bar('top'), pointer(50, -CELL));
    expect(layout()).toMatchObject({ row: 1, rowSpan: 1 });
    fireEvent.pointerUp(bar('top'), pointer(50, -CELL));

    act(() => store.dispatch(toggleEditMode()));
    expect(screen.queryByTestId('resize-handle-top')).toBeNull();
  });

  it('shows the freshness glow only outside edit mode with a tick time, remounting it per tick', () => {
    expect(renderFrame({ editMode: false }).frame.querySelector(GLOW)).toBeNull();
    cleanup();
    expect(renderFrame({ editMode: true, tickAt: 1000 }).frame.querySelector(GLOW)).toBeNull();
    cleanup();

    const store = createAppStore();
    const widget = store.getState().widgets.items[0];
    const frameAt = (tickAt: number) => (
      <Provider store={store}>
        <WidgetGrid layouts={[widget.layout]}>
          <WidgetFrame widget={widget} name='BTC-USD' onDelete={vi.fn()} onModify={vi.fn()} tickAt={tickAt}>
            <span>content</span>
          </WidgetFrame>
        </WidgetGrid>
      </Provider>
    );
    const { rerender } = render(frameAt(1000));
    const first = screen.getByTestId('freshness-glow');
    rerender(frameAt(1000));
    expect(screen.getByTestId('freshness-glow')).toBe(first);
    rerender(frameAt(2000));
    expect(screen.getByTestId('freshness-glow')).not.toBe(first);
  });
});
