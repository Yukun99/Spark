// Relative imports: this file is bundled into the Vite config, which has no `@/` alias.
// noinspection ES6PreferShortImport
import { ACTION_COLUMN_WIDTH_PX } from '../features/edit/trayConfig';
// noinspection ES6PreferShortImport
import {
  BANNER_HEIGHT,
  GRID_COLS,
  GRID_ROWS,
  TILE_GAP_PX,
  TILE_RADIUS_PX,
} from '../features/grid/gridConfig';
// noinspection ES6PreferShortImport
import { SEED_WIDGETS } from '../store/widgetSeed';
import { fonts } from './fonts';
import { gray, theme as colours } from './palette';
import { shadows } from './shadows';

export const APP_TITLE = 'Trading App';

/** Banner title type, shared with the static shell so both paint identically. */
export const bannerTitleSx = {
  fontFamily: fonts.display,
  fontSize: 30,
  fontWeight: 500,
  letterSpacing: '0.08em',
} as const;

const DARK = '[data-mui-color-scheme="dark"]';
const PULSE_MS = 1600;

/**
 * Critical CSS for the banner and skeleton grid painted straight from index.html before the
 * bundle runs. Mirrors `Banner`, `PageContent`, `WidgetFrame`, the `CssBaseline` page background
 * and MUI's default body line-height.
 */
export const appShellCss = [
  `body{background:${gray[10]}}`,
  `${DARK} body{background:${gray[80]}}`,
  `.app-shell{position:relative;height:${BANNER_HEIGHT};display:flex;align-items:center;justify-content:center;background:${colours.cream};color:${colours.navy};box-shadow:${shadows.light.md}}`,
  `${DARK} .app-shell{background:${colours.navy};color:${colours.cream};box-shadow:${shadows.dark.md}}`,
  `.app-shell h1{margin:0;font-family:${bannerTitleSx.fontFamily};font-size:${bannerTitleSx.fontSize}px;font-weight:${bannerTitleSx.fontWeight};letter-spacing:${bannerTitleSx.letterSpacing};line-height:1.5}`,
  `.app-shell-main{display:flex;height:calc(100vh - ${BANNER_HEIGHT})}`,
  `.app-shell-grid{flex:1;min-width:0;padding:${TILE_GAP_PX}px;display:grid;grid-template-rows:repeat(${GRID_ROWS},minmax(0,1fr));grid-template-columns:repeat(${GRID_COLS},minmax(0,1fr))}`,
  `.app-shell-divider{border-right:1px solid ${gray[50]}}`,
  `.app-shell-aside{width:${ACTION_COLUMN_WIDTH_PX}px}`,
  `.app-shell-card{position:relative;min-width:0;min-height:0}`,
  `.app-shell-card::after{content:"";position:absolute;inset:${TILE_GAP_PX}px;border-radius:${TILE_RADIUS_PX}px;background:${colours.cream};box-shadow:${shadows.light.sm};animation:app-shell-pulse ${PULSE_MS}ms ease-in-out infinite}`,
  `${DARK} .app-shell-card::after{background:${colours.navy};box-shadow:${shadows.dark.sm}}`,
  `@keyframes app-shell-pulse{50%{opacity:0.5}}`,
  `@media (prefers-reduced-motion:reduce){.app-shell-card::after{animation:none}}`,
].join('\n');

const skeletonCards = SEED_WIDGETS.map(({ layout }) => {
  const { row, col, rowSpan = 1, colSpan = 1 } = layout;
  return `<div class="app-shell-card" style="grid-area:${row}/${col}/span ${rowSpan}/span ${colSpan}"></div>`;
}).join('');

export const appShellHtml =
  `<header class="app-shell"><h1>${APP_TITLE}</h1></header>` +
  `<main class="app-shell-main"><div class="app-shell-grid">${skeletonCards}</div>` +
  `<div class="app-shell-divider"></div><aside class="app-shell-aside"></aside></main>`;

/**
 * Mirrors MUI's InitColorSchemeScript (`mui-mode` storage key, `data-mui-color-scheme`
 * attribute) so the shell paints in the stored or system mode without a flash.
 */
export const colorSchemeScript =
  "(function(){try{var m=localStorage.getItem('mui-mode')||'system';" +
  "if(m==='system')m=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';" +
  "document.documentElement.setAttribute('data-mui-color-scheme',m)}catch(e){}})()";

/** Hides the skeleton cards when the app will show the login page instead of the grid. */
export const shellModeScript =
  "(function(){try{if(location.pathname!=='/'||!localStorage.getItem('spark-token'))" +
  "document.documentElement.classList.add('app-shell-bare')}catch(e){}})()";
