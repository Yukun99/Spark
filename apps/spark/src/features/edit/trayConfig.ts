// Relative import: `appShell.ts` pulls this into the Vite config, where the `@/` alias is absent.
import { TILE_GAP_PX } from '../grid/gridConfig.ts';

/** Icon size for the buttons in the edit tray; smaller than the 24px save button icon. */
export const TRAY_ICON_PX = 20;
/** MUI icon default size and the padding the rounded action buttons wrap it in. */
export const ICON_PX = 24;
export const BUTTON_PAD_PX = 8;
export const BUTTON_PX = ICON_PX + 2 * BUTTON_PAD_PX;
/** Ring drawn around the save button in edit mode. */
export const RING_PAD_PX = 8;
export const RING_PX = BUTTON_PX + 2 * RING_PAD_PX;
/** Action column: its widest child (the ring) plus the column's side padding. */
export const ACTION_COLUMN_WIDTH_PX = RING_PX + 2 * TILE_GAP_PX;
