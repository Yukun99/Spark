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

Current state: the scaffolded app was stripped down. `apps/spark/index.html` still references
`/src/main.tsx` and `/src/styles.css`, neither of which exists yet; the only source file is
`apps/spark/src/style/palette.ts` (brand colours: navy `#1C1A33`, cream `#EFECDF`, purple `#6A1B9A`,
plus black/white opacity ramps). Entry point and app code still need to be created.

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
- Tests live next to source as `*.test.tsx` / `*.spec.tsx` under `src/` (or `tests/`), run in jsdom
  with `globals: true`, so `describe/it/expect` need no import. `@testing-library/react`,
  `user-event` and `jest-dom` are installed. Test files are excluded from `tsconfig.app.json` and
  typed via `tsconfig.spec.json`.
- TypeScript is strict with `noUnusedLocals`, `noImplicitReturns`, `noImplicitOverride`; the app
  uses `module: esnext` / `moduleResolution: bundler` (overriding the base `nodenext`).
- Prettier (on save): printWidth 100, single quotes (also in JSX), trailing commas, LF endings, and
  `prettier-plugin-organize-imports`, so imports get sorted and unused ones removed on format.
- ESLint is flat config: root `eslint.config.mjs` (nx base/typescript/javascript) extended by
  `apps/spark/eslint.config.mjs` with `flat/react`.