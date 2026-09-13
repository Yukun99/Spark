<?php

declare(strict_types=1);

namespace Spark\Api;

/** Field validators; each returns the typed value or throws a 400 `ApiError`. */
final class Validate
{
    private const DECIMAL_SCALE = 10;

    public static function string(array $body, string|int $key, int $max, ?string $pattern = null): string
    {
        $value = $body[$key] ?? null;
        if (!is_string($value) || $value === '' || strlen($value) > $max) {
            throw new ApiError(400, "$key must be a string of 1 to $max bytes");
        }
        if ($pattern !== null && !preg_match($pattern, $value)) {
            throw new ApiError(400, "$key has an invalid format");
        }
        return $value;
    }

    public static function enum(array $body, string $key, array $allowed): string
    {
        $value = $body[$key] ?? null;
        if (!is_string($value) || !in_array($value, $allowed, true)) {
            throw new ApiError(400, "$key must be one of: " . implode(', ', $allowed));
        }
        return $value;
    }

    /** Positive number, returned as a fixed-scale string ready to bind to a DECIMAL column. */
    public static function positiveDecimal(array $body, string $key): string
    {
        $value = $body[$key] ?? null;
        if ((!is_int($value) && !is_float($value)) || !is_finite($value) || $value <= 0) {
            throw new ApiError(400, "$key must be a positive number");
        }
        return number_format((float) $value, self::DECIMAL_SCALE, '.', '');
    }

    public static function int(array $body, string $key, int $min = PHP_INT_MIN): int
    {
        $value = $body[$key] ?? null;
        if (!is_int($value) || $value < $min) {
            throw new ApiError(400, "$key must be an integer of at least $min");
        }
        return $value;
    }

    public static function intIn(array $body, string $key, array $allowed): int
    {
        $value = $body[$key] ?? null;
        if (!is_int($value) || !in_array($value, $allowed, true)) {
            throw new ApiError(400, "$key must be one of: " . implode(', ', $allowed));
        }
        return $value;
    }

    public static function bool(array $body, string $key): bool
    {
        $value = $body[$key] ?? null;
        if (!is_bool($value)) {
            throw new ApiError(400, "$key must be a boolean");
        }
        return $value;
    }

    public static function list(array $body, string $key, int $max): array
    {
        $value = $body[$key] ?? null;
        if (!is_array($value) || !array_is_list($value) || count($value) > $max) {
            throw new ApiError(400, "$key must be an array of at most $max items");
        }
        return $value;
    }
}
