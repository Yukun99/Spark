# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.
It is also the onboarding doc for developers, so keep it readable by humans.

## How To Work In This Repo

- Start every session in caveman ultra mode: run `/caveman ultra` before anything else.
- For big tasks, enter plan mode first and confirm implementation specifics with the developer
  before writing code.
- Never run Prettier manually. The IDE formats on save.
- Don't run `nx configure-ai-agents` or similar; it regenerates config for other AI tools, which
  this repo intentionally does not keep.
- When adding text to any `.md` file, keep it brief. Prefer leaving a placeholder and asking the
  developer to fill it in, unless told otherwise.

## Code Structure

- If a component's logic exceeds ~50 lines, move the logic into a `use<ComponentName>` hook in its
  own file. The component then only maps the hook's returned values onto display components.
- Prefer `type` over `interface`.
- No code comments unless the logic is complicated or covers a rare edge case that the code itself
  does not make obvious. Short doc comments on helper functions are fine. Keep every comment as
  short as possible.

## Colours And Theming

- Every colour in the app comes from `apps/spark/src/styles/palette.ts`. Never hardcode a hex/rgba
  in a component or style; add new colours to `palette.ts` first, then reference them.
- Light/dark mode lives in `apps/spark/src/styles/theme.ts` (MUI `colorSchemes`). Defaults to the
  OS preference; `useColorMode` (`src/hooks/useColorMode.ts`) toggles it and MUI persists the
  choice in localStorage. Light: page `gray[10]`, header cream. Dark: page `gray[80]`, header navy.
- Buttons: use `OutlinedButton` (purple border, cream fill, navy text), `FilledButton` (purple
  fill, cream text) or `ClearButton` (no fill; navy text in light, cream in dark) from
  `src/components/buttons/`. Their styles live in `theme.ts` (`MuiButton` overrides); don't restyle per
  usage. Icons come from `@mui/icons-material`.
- Mode-dependent colours: use `theme.applyStyles('dark', {...})` inside `sx`/style overrides,
  importing values from `palette.ts` rather than writing raw hex.
- Shadows: use `shadowSx('sm' | 'md' | 'lg')` from `src/styles/shadows.ts` in `sx` (navy-tinted in
  light, cream-tinted in dark). Don't write `boxShadow` values inline.

## State And Layout

- Redux Toolkit store in `src/store/` (`store.ts`, one `<name>Slice.ts` per slice, typed
  `useAppDispatch`/`useAppSelector` in `hooks.ts`). Components never import the store directly;
  wrap access in a `use<Feature>` hook under `src/hooks/`.
- Features live in `src/features/<feature>/`. The page body is the `WidgetGrid` from
  `src/features/grid/` (size in `gridConfig.ts`); each gridded widget gets its own feature folder
  and is placed with `<GridWidget layout={{ row, col, rowSpan, colSpan }}>` (1-based, spans
  default to 1).
- Shared UI (banner, buttons, page chrome) stays in `src/components/`; styling in `src/styles/`.

## Naming

| Thing                              | Convention             | Example                                |
|------------------------------------|------------------------|----------------------------------------|
| Files                              | lowerCamelCase         | `priceTicker.tsx`, `usePriceTicker.ts` |
| Components                         | UpperCamelCase         | `PriceTicker`                          |
| Component prop types               | `<ComponentName>Props` | `PriceTickerProps`                     |
| Non-component function param types | `<FunctionName>Params` | `FormatPriceParams`                    |
| Markdown headings                  | Title Case With Spaces | `## Code Structure`                    |

For anything not covered here with no clear industry standard, ask the developer before choosing.

## What This Repo Is

A take-home assignment for Spark Systems (FX price data aggregation): a client-side crypto price ticker.

## Workspace Layout

pnpm + Nx 23 monorepo with a single project, `spark`, at `apps/spark` (React 19, Vite 8, Vitest 4,
MUI 9 + Emotion, Redux Toolkit + react-redux). `pnpm-workspace.yaml` also globs `libs/*` for future
shared libraries; the root ESLint config enforces `@nx/enforce-module-boundaries` (currently unrestricted tags).

All Nx targets are inferred from plugins in `nx.json` (`@nx/vite`, `@nx/vitest`, `@nx/eslint`,
`@nx/js/typescript`); there is no `project.json`. Root `package.json` has no scripts, so use `pnpm nx`.

Current state: `apps/spark/src/main.tsx` bootstraps React with the Redux `Provider`, MUI
`ThemeProvider` + `CssBaseline`, and renders `App` (`src/app.tsx`): a `Banner` plus `PageContent`
(the widget grid, a divider and an action column with the edit-mode button). Brand colours live in
`src/styles/palette.ts` (navy `#1C1A33`, cream `#EFECDF`, purple `#6A1B9A`, black, white, plus a
`gray` ramp 10-100). Ticker widgets and the data layer still need to be created.

## Commands

Always run tasks through Nx with the workspace package manager (`pnpm nx ...`), never the underlying
tool directly. Don't guess CLI flags; check `--help` first. Plugin tips live in
`node_modules/@nx/<plugin>/PLUGIN.md` where present.

```sh
pnpm install
pnpm nx dev spark          # Vite dev server on http://localhost:4301
pnpm nx build spark        # outputs to apps/spark/dist
pnpm nx preview spark      # serves the build on http://localhost:4300
pnpm nx test spark         # Vitest (jsdom), single run (watch disabled in vite.config.mts)
pnpm nx lint spark
pnpm nx typecheck spark
pnpm nx run-many -t lint test typecheck build   # everything
```

Single test file / single test name (args after `--` go to Vitest):

```sh
pnpm nx test spark -- src/path/to/file.test.tsx
pnpm nx test spark -- -t "renders bid and ask"
pnpm nx test spark -- --watch
```

`test` depends on `^build` (nx.json `targetDefaults`), so lib builds run first once libs exist.
The root `vitest.config.mts` is a workspace runner that picks up every project's `vite.config.mts`,
so `pnpm exec vitest` at the root runs all projects.

## Conventions The Tooling Enforces

- Path alias `@/*` maps to `apps/spark/src/*`. It is declared in `vite.config.mts`,
  `tsconfig.app.json` and `tsconfig.spec.json`; keep all three in sync if it changes.
- Tests live under `src/test/`, mirroring the source path: `src/components/foo.tsx` is tested by
  `src/test/components/foo.test.tsx`. They run in jsdom with `globals: true`, so `describe/it/expect`
  need no import. `@testing-library/react`, `user-event` and `jest-dom` (via `src/test/testSetup.ts`) are
  set up. Test files are excluded from `tsconfig.app.json` and typed via `tsconfig.spec.json`.
- TypeScript is strict with `noUnusedLocals`, `noImplicitReturns`, `noImplicitOverride`; the app
  uses `module: esnext` / `moduleResolution: bundler` (overriding the base `nodenext`).
- Prettier (on save): printWidth 100, single quotes (also in JSX), trailing commas, LF endings, and
  `prettier-plugin-organize-imports`, so imports get sorted and unused ones removed on format.
- ESLint is flat config: root `eslint.config.mjs` (nx base/typescript/javascript) extended by
  `apps/spark/eslint.config.mjs` with `flat/react`.