import { SCROLLBAR_OPTIONS, SCROLLBAR_OVERHANG_PX } from '@/styles/scrollbar';
import Box from '@mui/material/Box';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import type { ReactNode, Ref } from 'react';

export type WidgetScrollAreaProps = {
  children: ReactNode;
  /** Reaches the outer box, whose height is the space the rows share. */
  ref?: Ref<HTMLDivElement>;
};

/**
 * Fills the rest of the card and scrolls its children. The host reaches into the card's right
 * padding and the content pads it back, so the floating bar sits just past the rows, not over them.
 */
export const WidgetScrollArea = ({ children, ref }: WidgetScrollAreaProps) => (
  <Box ref={ref} sx={{ flex: 1, minHeight: 0, mr: `-${SCROLLBAR_OVERHANG_PX}px` }}>
    <OverlayScrollbarsComponent defer options={SCROLLBAR_OPTIONS} style={{ height: '100%' }}>
      <Box sx={{ pr: `${SCROLLBAR_OVERHANG_PX}px` }}>{children}</Box>
    </OverlayScrollbarsComponent>
  </Box>
);
