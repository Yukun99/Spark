const REVEAL_MS = 160;

/** Nearest ancestor that scrolls vertically, if any. */
export const scrollParent = (element: HTMLElement | null | undefined): HTMLElement | null => {
  for (let node = element?.parentElement ?? null; node !== null; node = node.parentElement) {
    const { overflowY } = getComputedStyle(node);
    if (overflowY === 'auto' || overflowY === 'scroll') return node;
  }
  return null;
};

/**
 * Scrolls `element`'s container just enough to show it, animating the scroll by hand: the
 * OverlayScrollbars viewport ignores `behavior: 'smooth'` on `scrollIntoView` and `scrollTo`.
 */
export const revealInScroller = (element: HTMLElement) => {
  const scroller = scrollParent(element);
  if (scroller === null) {
    element.scrollIntoView?.({ block: 'nearest' });
    return;
  }
  const row = element.getBoundingClientRect();
  const view = scroller.getBoundingClientRect();
  const delta = row.bottom > view.bottom ? row.bottom - view.bottom : Math.min(0, row.top - view.top);
  if (delta === 0) return;
  const from = scroller.scrollTop;
  const startedAt = performance.now();
  const step = (now: number) => {
    const progress = Math.min(1, (now - startedAt) / REVEAL_MS);
    const eased = 1 - (1 - progress) ** 2;
    scroller.scrollTop = from + delta * eased;
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
};
