<?php

declare(strict_types=1);

namespace Spark\Api;

/**
 * Mock execution: open orders progress by wall-clock in 5 s steps whenever they are read, so the
 * demo needs no daemon. `pending` starts being worked after one step; each later step fills a
 * share of the size until the order is fulfilled.
 */
final class Execution
{
    public const STEP_MS = 5000;
    /** Catch-up cap; an order fulfils in well under this many steps. */
    public const MAX_STEPS = 200;
    private const FILL_RATIO = [
        'market' => [0.30, 0.60],
        'limit' => [0.10, 0.30],
    ];
    private const DECIMAL_SCALE = 10;

    /** Advances every open order of the user by the steps elapsed since it was last ticked. */
    public static function advance(int $userId, ?int $now = null): void
    {
        $now ??= Util::nowMs();
        $orders = Db::all(
            'SELECT id, type, time_in_force, size, filled_size, status, ticked_at FROM orders'
            . ' WHERE user_id = ? AND status IN (?, ?)',
            [$userId, 'pending', 'fulfilling'],
        );
        foreach ($orders as $order) {
            $steps = min(self::MAX_STEPS, intdiv(max(0, $now - (int) $order['ticked_at']), self::STEP_MS));
            if ($steps === 0) {
                continue;
            }
            $changes = self::simulate($order, $steps, self::random(...));
            Db::run(
                'UPDATE orders SET filled_size = ?, status = ?, ticked_at = ? WHERE id = ? AND ticked_at = ?',
                [
                    $changes['filled_size'],
                    $changes['status'],
                    (int) $order['ticked_at'] + $steps * self::STEP_MS,
                    $order['id'],
                    $order['ticked_at'],
                ],
            );
        }
    }

    /**
     * Pure step simulation. `$random(min, max)` supplies the fill ratio of each step.
     *
     * @param array{type: string, time_in_force: string, size: string|float, filled_size: string|float, status: string} $order
     * @return array{filled_size: string, status: string}
     */
    public static function simulate(array $order, int $steps, callable $random): array
    {
        $size = (float) $order['size'];
        $filled = (float) $order['filled_size'];
        $status = $order['status'];
        for ($step = 0; $step < $steps && $status !== 'fulfilled'; $step++) {
            if ($status === 'pending') {
                $status = 'fulfilling';
                continue;
            }
            if ($status !== 'fulfilling') {
                break;
            }
            [$min, $max] = self::FILL_RATIO[$order['type']] ?? self::FILL_RATIO['limit'];
            $ratio = $order['time_in_force'] === 'FOK' ? 1.0 : $random($min, $max);
            $filled = min($size, $filled + $size * $ratio);
            if ($filled >= $size) {
                $filled = $size;
                $status = 'fulfilled';
            }
        }
        return ['filled_size' => number_format($filled, self::DECIMAL_SCALE, '.', ''), 'status' => $status];
    }

    private static function random(float $min, float $max): float
    {
        return $min + ($max - $min) * mt_rand() / mt_getrandmax();
    }
}
