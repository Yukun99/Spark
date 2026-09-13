<?php

declare(strict_types=1);

namespace Spark\Api;

/** Mirrors `Order` in apps/spark/src/store/ordersSlice.ts. */
final class Orders
{
    public const SIDES = ['buy', 'sell'];
    public const TYPES = ['market', 'limit'];
    public const TIME_IN_FORCE = ['GTC', 'IOC', 'FOK'];
    public const STATUSES = ['pending', 'fulfilling', 'fulfilled', 'cancelled'];
    public const OPEN_STATUSES = ['pending', 'fulfilling'];
    public const PRODUCT_ID_MAX = 20;
    public const PRODUCT_ID_PATTERN = '/^[A-Z0-9]{1,10}-[A-Z0-9]{1,10}$/';
    private const PROVIDER_MAX = 32;
    private const COLUMNS = 'id, product_id, side, type, time_in_force, price, size, filled_size, status, provider, placed_at, updated_at';

    /** One page of the user's orders, newest first, filtered (see `OrderFilter`) before paging. */
    public static function list(): void
    {
        $userId = Auth::requireUser();
        $filter = OrderFilter::fromQuery($_GET);
        Execution::advance($userId);
        $where = ' FROM orders WHERE user_id = ?' . $filter['where'];
        $params = [$userId, ...$filter['params']];
        $total = (int) Db::one('SELECT COUNT(*) AS total' . $where, $params)['total'];
        $paging = Paging::fromQuery($_GET, $total);
        $rows = Db::all(
            'SELECT ' . self::COLUMNS . $where . ' ORDER BY placed_at DESC, id DESC'
            . " LIMIT {$paging['limit']} OFFSET {$paging['offset']}",
            $params,
        );
        Http::json(200, [
            'items' => array_map(self::toJson(...), $rows),
            'page' => $paging['page'],
            'pageCount' => $paging['pageCount'],
            'total' => $total,
        ]);
    }

    /** Distinct instruments the user has ever ordered, for the filter dropdown. */
    public static function products(): void
    {
        $userId = Auth::requireUser();
        $rows = Db::all('SELECT DISTINCT product_id FROM orders WHERE user_id = ? ORDER BY product_id', [$userId]);
        Http::json(200, array_column($rows, 'product_id'));
    }

    public static function create(): void
    {
        $userId = Auth::requireUser();
        $body = Http::body();
        $id = Util::nanoid();
        $now = Util::nowMs();
        Db::run(
            'INSERT INTO orders (id, user_id, product_id, side, type, time_in_force, price, size, filled_size, status, provider, placed_at, ticked_at)'
            . ' VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?)',
            [
                $id,
                $userId,
                Validate::string($body, 'productId', self::PRODUCT_ID_MAX, self::PRODUCT_ID_PATTERN),
                Validate::enum($body, 'side', self::SIDES),
                ...self::changes($body),
                'pending',
                Validate::string($body, 'provider', self::PROVIDER_MAX),
                $now,
                $now,
            ],
        );
        Http::json(201, self::toJson(self::find($userId, $id)));
    }

    public static function update(array $params): void
    {
        $userId = Auth::requireUser();
        Execution::advance($userId);
        $order = self::findOpen($userId, $params['id']);
        $changes = self::changes(Http::body());
        if ((float) $changes[3] < (float) $order['filled_size']) {
            throw new ApiError(400, 'size cannot be below filledSize');
        }
        Db::run(
            'UPDATE orders SET type = ?, time_in_force = ?, price = ?, size = ?, updated_at = ? WHERE id = ? AND user_id = ?',
            [...$changes, Util::nowMs(), $order['id'], $userId],
        );
        Http::json(200, self::toJson(self::find($userId, $order['id'])));
    }

    public static function cancel(array $params): void
    {
        $userId = Auth::requireUser();
        Execution::advance($userId);
        $order = self::findOpen($userId, $params['id']);
        Db::run(
            'UPDATE orders SET status = ?, updated_at = ? WHERE id = ? AND user_id = ?',
            ['cancelled', Util::nowMs(), $order['id'], $userId],
        );
        Http::json(200, self::toJson(self::find($userId, $order['id'])));
    }

    /** `OrderChanges` validated, in column order: type, timeInForce, price, size. */
    private static function changes(array $body): array
    {
        return [
            Validate::enum($body, 'type', self::TYPES),
            Validate::enum($body, 'timeInForce', self::TIME_IN_FORCE),
            Validate::positiveDecimal($body, 'price'),
            Validate::positiveDecimal($body, 'size'),
        ];
    }

    private static function find(int $userId, string $id): array
    {
        $order = Db::one('SELECT ' . self::COLUMNS . ' FROM orders WHERE id = ? AND user_id = ?', [$id, $userId]);
        if ($order === null) {
            throw new ApiError(404, 'Order not found');
        }
        return $order;
    }

    private static function findOpen(int $userId, string $id): array
    {
        $order = self::find($userId, $id);
        if (!in_array($order['status'], self::OPEN_STATUSES, true)) {
            throw new ApiError(409, 'Order is no longer open');
        }
        return $order;
    }

    private static function toJson(array $row): array
    {
        $json = [
            'id' => $row['id'],
            'productId' => $row['product_id'],
            'side' => $row['side'],
            'type' => $row['type'],
            'timeInForce' => $row['time_in_force'],
            'price' => (float) $row['price'],
            'size' => (float) $row['size'],
            'filledSize' => (float) $row['filled_size'],
            'status' => $row['status'],
            'provider' => $row['provider'],
            'placedAt' => (int) $row['placed_at'],
        ];
        if ($row['updated_at'] !== null) {
            $json['updatedAt'] = (int) $row['updated_at'];
        }
        return $json;
    }
}
