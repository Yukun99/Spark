import { WidgetGrid } from '@/features/grid/widgetGrid';
import { WidgetFrame } from '@/features/widgets/widgetFrame';
import { toggleEditMode } from '@/store/layoutSlice';
import { createAppStore } from '@/store/store';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
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
    fireEvent.pointerMove(frame, pointer(50 + 2 * CELL, 50 + CELL));
    expect(store.getState().layout.dragTarget).toMatchObject({ row: 2, col: 3 });
    expect(frame).toHaveStyle({ transform: `translate(${2 * CELL}px, ${CELL}px)` });

    fireEvent.pointerUp(frame, pointer(50 + 2 * CELL, 50 + CELL));
    expect(store.getState().layout.dragTarget).toBeNull();
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
