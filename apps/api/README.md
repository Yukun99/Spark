# Spark API

Plain PHP 8.3 + PDO, no Composer. Deployed to `/api/` next to the Spark bundle by
`.github/workflows/deploy.yml`, which also writes `config.php` from the `DB_NAME`, `DB_USER`
and `DB_PASSWORD` secrets. Locally, copy `config.example.php` to `config.php` (gitignored).

Live URL: https://spark.yukunxu.com/api

## Setup

1. Run `schema.sql` in cPanel phpMyAdmin.
2. Grant the DB user `SELECT`, `INSERT`, `UPDATE`, `DELETE`.
3. Add the three secrets in GitHub, push to `master`.

## Endpoints

All bodies and responses are JSON. Everything except `/auth/register` and `/auth/login` needs
`Authorization: Bearer <token>`. Errors are `{ "error": string }`.

| Method | Path                  | Body → Response                                     |
|--------|-----------------------|-----------------------------------------------------|
| POST   | `/auth/register`      | `{username, password}` → `{token, user}` (201)      |
| POST   | `/auth/login`         | `{username, password}` → `{token, user}`            |
| POST   | `/auth/logout`        | → 204                                               |
| GET    | `/auth/me`            | → `{id, username}`                                  |
| GET    | `/orders`             | → `Order[]`                                         |
| POST   | `/orders`             | `OrderDraft` → `Order` (201)                        |
| PATCH  | `/orders/{id}`        | `OrderChanges` → `Order` (409 if not open)          |
| POST   | `/orders/{id}/cancel` | → `Order` (409 if not open)                         |
| GET    | `/settings`           | → `{updateIntervalMs, streaming}`                   |
| PUT    | `/settings`           | `{updateIntervalMs, streaming}` → same              |
| GET    | `/widgets`            | → `Widget[]`                                        |
| PUT    | `/widgets`            | `Widget[]` → `Widget[]` (replaces the whole layout) |

Shapes match `Order`, `SettingsState` and `Widget` in `apps/spark/src/store/`.

## Lint

`pnpm nx lint api` runs `php -l` over every file; needs PHP on PATH (`winget install PHP.PHP.8.3`).
