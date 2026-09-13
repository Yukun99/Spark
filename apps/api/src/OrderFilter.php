<?php

declare(strict_types=1);

namespace Spark\Api;

/** Turns the query string of `GET /orders` into SQL clauses; every parameter is optional. */
final class OrderFilter
{
    private const DECIMAL_PATTERN = '/^\d+(\.\d{1,10})?$/';
    private const EPOCH_PATTERN = '/^\d{1,15}$/';

    /**
     * @param array<string, mixed> $query
     * @return array{where: string, params: list<string>} `where` is empty or starts with ` AND`
     */
    public static function fromQuery(array $query): array
    {
        $clauses = [];
        $params = [];

        $productId = self::string($query, 'productId');
        if ($productId !== null) {
            if (!preg_match(Orders::PRODUCT_ID_PATTERN, $productId)) {
                throw new ApiError(400, 'productId has an invalid format');
            }
            $clauses[] = 'product_id = ?';
            $params[] = $productId;
        }

        $side = self::string($query, 'side');
        if ($side !== null) {
            $clauses[] = 'side = ?';
            $params[] = self::oneOf($side, Orders::SIDES, 'side');
        }

        foreach ([['status', 'status', Orders::STATUSES], ['type', 'type', Orders::TYPES]] as [$key, $column, $allowed]) {
            $values = self::list($query, $key, $allowed);
            if ($values !== []) {
                $clauses[] = "$column IN (" . implode(', ', array_fill(0, count($values), '?')) . ')';
                array_push($params, ...$values);
            }
        }

        $min = self::decimal($query, 'minPrice');
        $max = self::decimal($query, 'maxPrice');
        if ($min !== null && $max !== null && (float) $min > (float) $max) {
            throw new ApiError(400, 'minPrice cannot exceed maxPrice');
        }
        if ($min !== null) {
            $clauses[] = 'price >= ?';
            $params[] = $min;
        }
        if ($max !== null) {
            $clauses[] = 'price <= ?';
            $params[] = $max;
        }

        $from = self::epoch($query, 'from');
        $to = self::epoch($query, 'to');
        if ($from !== null && $to !== null && $from > $to) {
            throw new ApiError(400, 'from cannot be after to');
        }
        if ($from !== null) {
            $clauses[] = 'placed_at >= ?';
            $params[] = $from;
        }
        if ($to !== null) {
            $clauses[] = 'placed_at <= ?';
            $params[] = $to;
        }

        return [
            'where' => $clauses === [] ? '' : ' AND ' . implode(' AND ', $clauses),
            'params' => $params,
        ];
    }

    private static function string(array $query, string $key): ?string
    {
        $value = $query[$key] ?? null;
        return is_string($value) && $value !== '' ? $value : null;
    }

    private static function oneOf(string $value, array $allowed, string $key): string
    {
        if (!in_array($value, $allowed, true)) {
            throw new ApiError(400, "$key must be one of: " . implode(', ', $allowed));
        }
        return $value;
    }

    /** Comma-separated values, each checked against `$allowed`, duplicates dropped. */
    private static function list(array $query, string $key, array $allowed): array
    {
        $raw = self::string($query, $key);
        if ($raw === null) {
            return [];
        }
        $values = array_values(array_unique(array_filter(explode(',', $raw), fn(string $v) => $v !== '')));
        foreach ($values as $value) {
            self::oneOf($value, $allowed, $key);
        }
        return $values;
    }

    private static function decimal(array $query, string $key): ?string
    {
        $value = self::string($query, $key);
        if ($value === null) {
            return null;
        }
        if (!preg_match(self::DECIMAL_PATTERN, $value)) {
            throw new ApiError(400, "$key must be a non-negative number");
        }
        return $value;
    }

    private static function epoch(array $query, string $key): ?string
    {
        $value = self::string($query, $key);
        if ($value === null) {
            return null;
        }
        if (!preg_match(self::EPOCH_PATTERN, $value)) {
            throw new ApiError(400, "$key must be a timestamp in milliseconds");
        }
        return $value;
    }
}
