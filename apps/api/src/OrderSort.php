<?php

declare(strict_types=1);

namespace Spark\Api;

/**
 * Turns the `sort` and `direction` query params of `GET /orders` into an ORDER BY clause.
 * Only whitelisted expressions reach SQL; `seq` (insertion order) breaks every remaining tie.
 */
final class OrderSort
{
    public const COLUMNS = ['instrument', 'status', 'price', 'fulfilment', 'placedAt'];
    public const DIRECTIONS = ['asc', 'desc'];

    private const FILL = 'filled_size / size';
    private const STATUS_RANK = "FIELD(status, 'pending', 'fulfilling', 'fulfilled', 'cancelled')";
    private const TYPE_RANK = "FIELD(type, 'limit', 'market')";

    /** Sort keys per column in ascending order; the direction flips every key. */
    private const KEYS = [
        'instrument' => ['product_id'],
        'status' => [self::FILL, self::STATUS_RANK],
        'price' => ['price', self::TYPE_RANK],
        'fulfilment' => [self::FILL, 'size', 'provider'],
        'placedAt' => ['placed_at'],
    ];

    /**
     * @param array<string, mixed> $query
     * @return string `ORDER BY ...`; newest first when `sort` is unset
     */
    public static function fromQuery(array $query): string
    {
        $column = self::string($query, 'sort');
        if ($column === null) {
            return 'ORDER BY placed_at DESC, seq DESC';
        }
        if (!in_array($column, self::COLUMNS, true)) {
            throw new ApiError(400, 'sort must be one of: ' . implode(', ', self::COLUMNS));
        }
        $direction = self::string($query, 'direction') ?? 'asc';
        if (!in_array($direction, self::DIRECTIONS, true)) {
            throw new ApiError(400, 'direction must be one of: ' . implode(', ', self::DIRECTIONS));
        }
        $sql = strtoupper($direction);
        $keys = array_map(fn(string $key) => "$key $sql", [...self::KEYS[$column], 'seq']);
        return 'ORDER BY ' . implode(', ', $keys);
    }

    private static function string(array $query, string $key): ?string
    {
        $value = $query[$key] ?? null;
        return is_string($value) && $value !== '' ? $value : null;
    }
}
