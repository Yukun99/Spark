<?php

declare(strict_types=1);

namespace Spark\Api;

/** Turns `page` and `pageSize` query params into a LIMIT/OFFSET window over `$total` rows. */
final class Paging
{
    public const DEFAULT_PAGE_SIZE = 10;
    public const MAX_PAGE_SIZE = 200;

    /**
     * @param array<string, mixed> $query
     * @return array{page: int, pageCount: int, limit: int, offset: int} `page` is clamped to `pageCount`
     */
    public static function fromQuery(array $query, int $total): array
    {
        $pageSize = self::int($query, 'pageSize', self::DEFAULT_PAGE_SIZE);
        if ($pageSize < 1 || $pageSize > self::MAX_PAGE_SIZE) {
            throw new ApiError(400, 'pageSize must be between 1 and ' . self::MAX_PAGE_SIZE);
        }
        $page = self::int($query, 'page', 1);
        if ($page < 1) {
            throw new ApiError(400, 'page must be a positive integer');
        }
        $pageCount = max(1, (int) ceil($total / $pageSize));
        $page = min($page, $pageCount);
        return [
            'page' => $page,
            'pageCount' => $pageCount,
            'limit' => $pageSize,
            'offset' => ($page - 1) * $pageSize,
        ];
    }

    private static function int(array $query, string $key, int $default): int
    {
        $value = $query[$key] ?? null;
        if (!is_string($value) || $value === '') {
            return $default;
        }
        if (!preg_match('/^\d{1,9}$/', $value)) {
            throw new ApiError(400, "$key must be a positive integer");
        }
        return (int) $value;
    }
}
