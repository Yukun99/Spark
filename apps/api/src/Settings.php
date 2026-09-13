<?php

declare(strict_types=1);

namespace Spark\Api;

/** Mirrors `SettingsState` in apps/spark/src/store/settingsSlice.ts. */
final class Settings
{
    public const UPDATE_INTERVAL_OPTIONS_MS = [250, 500, 1000, 2000, 5000, 10000];
    private const DEFAULTS = ['updateIntervalMs' => 1000, 'streaming' => true];

    public static function get(): void
    {
        $userId = Auth::requireUser();
        $row = Db::one('SELECT update_interval_ms, streaming FROM settings WHERE user_id = ?', [$userId]);
        Http::json(200, $row === null ? self::DEFAULTS : self::toJson($row));
    }

    public static function put(): void
    {
        $userId = Auth::requireUser();
        $body = Http::body();
        $interval = Validate::intIn($body, 'updateIntervalMs', self::UPDATE_INTERVAL_OPTIONS_MS);
        $streaming = Validate::bool($body, 'streaming');
        Db::run(
            'INSERT INTO settings (user_id, update_interval_ms, streaming) VALUES (?, ?, ?)'
            . ' ON DUPLICATE KEY UPDATE update_interval_ms = VALUES(update_interval_ms), streaming = VALUES(streaming)',
            [$userId, $interval, (int) $streaming],
        );
        Http::json(200, ['updateIntervalMs' => $interval, 'streaming' => $streaming]);
    }

    private static function toJson(array $row): array
    {
        return ['updateIntervalMs' => (int) $row['update_interval_ms'], 'streaming' => (bool) $row['streaming']];
    }
}
