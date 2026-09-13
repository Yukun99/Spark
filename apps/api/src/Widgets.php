<?php

declare(strict_types=1);

namespace Spark\Api;

/** Mirrors `Widget` in apps/spark/src/store/widgetsSlice.ts; PUT replaces the whole layout. */
final class Widgets
{
    public const TYPES = ['instrument', 'watchlist', 'orders'];
    private const ID_PATTERN = '/^[A-Za-z0-9_-]{1,21}$/';
    private const NAME_MAX = 64;
    private const MAX_WIDGETS = 200;
    private const MAX_WATCHLIST_PRODUCTS = 200;
    private const COLUMNS = 'id, type, grid_row, grid_col, row_span, col_span, product_id, name, product_ids';

    public static function get(): void
    {
        Http::json(200, self::load(Auth::requireUser()));
    }

    public static function put(): void
    {
        $userId = Auth::requireUser();
        $body = Http::body();
        if (!array_is_list($body) || count($body) > self::MAX_WIDGETS) {
            throw new ApiError(400, sprintf('Body must be an array of at most %d widgets', self::MAX_WIDGETS));
        }
        $rows = [];
        foreach ($body as $index => $widget) {
            if (!is_array($widget)) {
                throw new ApiError(400, "widgets[$index] must be an object");
            }
            $row = self::toRow($widget);
            if (isset($rows[$row['id']])) {
                throw new ApiError(400, "Duplicate widget id {$row['id']}");
            }
            $rows[$row['id']] = $row;
        }
        Db::transaction(function () use ($userId, $rows): void {
            Db::run('DELETE FROM widgets WHERE user_id = ?', [$userId]);
            foreach ($rows as $row) {
                Db::run(
                    'INSERT INTO widgets (user_id, ' . self::COLUMNS . ') VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                    [$userId, ...array_values($row)],
                );
            }
        });
        Http::json(200, self::load($userId));
    }

    private static function load(int $userId): array
    {
        $rows = Db::all(
            'SELECT ' . self::COLUMNS . ' FROM widgets WHERE user_id = ? ORDER BY grid_row, grid_col',
            [$userId],
        );
        return array_map(self::toJson(...), $rows);
    }

    /** Validated widget as a row in `COLUMNS` order. */
    private static function toRow(array $widget): array
    {
        $layout = $widget['layout'] ?? null;
        if (!is_array($layout)) {
            throw new ApiError(400, 'layout must be an object');
        }
        $type = Validate::enum($widget, 'type', self::TYPES);
        $row = [
            'id' => Validate::string($widget, 'id', Util::NANOID_LENGTH, self::ID_PATTERN),
            'type' => $type,
            'row' => Validate::int($layout, 'row', 1),
            'col' => Validate::int($layout, 'col', 1),
            'rowSpan' => isset($layout['rowSpan']) ? Validate::int($layout, 'rowSpan', 1) : 1,
            'colSpan' => isset($layout['colSpan']) ? Validate::int($layout, 'colSpan', 1) : 1,
            'productId' => null,
            'name' => null,
            'productIds' => null,
        ];
        if ($type === 'instrument') {
            $row['productId'] = Validate::string($widget, 'productId', Orders::PRODUCT_ID_MAX, Orders::PRODUCT_ID_PATTERN);
        }
        if ($type === 'watchlist') {
            $row['name'] = Validate::string($widget, 'name', self::NAME_MAX);
            $productIds = Validate::list($widget, 'productIds', self::MAX_WATCHLIST_PRODUCTS);
            foreach ($productIds as $index => $productId) {
                Validate::string($productIds, $index, Orders::PRODUCT_ID_MAX, Orders::PRODUCT_ID_PATTERN);
            }
            $row['productIds'] = json_encode($productIds, JSON_THROW_ON_ERROR);
        }
        return $row;
    }

    private static function toJson(array $row): array
    {
        $json = [
            'id' => $row['id'],
            'type' => $row['type'],
            'layout' => [
                'row' => (int) $row['grid_row'],
                'col' => (int) $row['grid_col'],
                'rowSpan' => (int) $row['row_span'],
                'colSpan' => (int) $row['col_span'],
            ],
        ];
        if ($row['type'] === 'instrument') {
            $json['productId'] = $row['product_id'];
        }
        if ($row['type'] === 'watchlist') {
            $json['name'] = $row['name'];
            $json['productIds'] = json_decode($row['product_ids'] ?? '[]', true, 4, JSON_THROW_ON_ERROR);
        }
        return $json;
    }
}
