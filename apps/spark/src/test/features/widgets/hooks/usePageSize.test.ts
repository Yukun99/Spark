import { FALLBACK_PAGE_SIZE, usePageSize } from '@/features/widgets/hooks/usePageSize';
import { act, renderHook } from '@testing-library/react';

const ESTIMATE = { header: 20, row: 30 };

describe('usePageSize', () => {
  it('falls back to a fixed page size where layout cannot be observed', () => {
    const { result } = renderHook(() => usePageSize({ estimate: ESTIMATE }));
    expect(result.current.pageSize).toBe(FALLBACK_PAGE_SIZE);
  });

  it('measures the rows that fit from the container, header and first row, remeasuring on resize', () => {
    let callback: ResizeObserverCallback = () => undefined;
    const observe = vi.fn();
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(cb: ResizeObserverCallback) {
          callback = cb;
        }
        observe = observe;
        disconnect = vi.fn();
        unobserve = vi.fn();
      },
    );
    const { result } = renderHook(() => usePageSize({ estimate: ESTIMATE }));
    expect(result.current.pageSize).toBeNull();

    const container = document.createElement('div');
    let height = 0;
    Object.defineProperty(container, 'clientHeight', { get: () => height });
    act(() => result.current.containerRef(container));
    expect(observe).toHaveBeenCalledWith(container);
    expect(result.current.pageSize).toBeNull();

    height = 20 + (30 + 8) * 3 + 5;
    act(() => callback([], {} as ResizeObserver));
    expect(result.current.pageSize).toBe(3);

    const row = document.createElement('div');
    Object.defineProperty(row, 'offsetHeight', { get: () => 50 });
    result.current.rowRef.current = row;
    act(() => callback([], {} as ResizeObserver));
    expect(result.current.pageSize).toBe(2);

    height = 30;
    act(() => callback([], {} as ResizeObserver));
    expect(result.current.pageSize).toBe(1);
  });
});
