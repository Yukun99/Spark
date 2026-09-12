import { gray } from '@/styles/palette';

export const SCROLLBAR_SIZE_PX = 8;
/** Space between scrolled content and the floating bar. */
export const SCROLLBAR_GAP_PX = 2;
/** How far a scroll host reaches past its content so the bar clears it. */
export const SCROLLBAR_OVERHANG_PX = SCROLLBAR_SIZE_PX + SCROLLBAR_GAP_PX;

export const SCROLLBAR_OPTIONS = { scrollbars: { autoHide: 'leave', autoHideDelay: 400 } } as const;

/** Sizes and colours the OverlayScrollbars bar; put on any ancestor of the scroll host. */
export const scrollbarSx = {
  '& .os-scrollbar': {
    '--os-size': `${SCROLLBAR_SIZE_PX}px`,
    '--os-handle-bg': gray[50],
    '--os-handle-bg-hover': gray[60],
    '--os-handle-bg-active': gray[70],
  },
} as const;
