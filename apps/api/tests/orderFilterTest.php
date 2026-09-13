<?php

declare(strict_types=1);

use Spark\Api\ApiError;
use Spark\Api\OrderFilter;

/** @var callable $check provided by run.php */

echo "OrderFilter::fromQuery\n";

$rejects = function (array $query): ?string {
    try {
        OrderFilter::fromQuery($query);
        return null;
    } catch (ApiError $error) {
        return $error->status . ' ' . $error->getMessage();
    }
};

$check('empty query filters nothing', OrderFilter::fromQuery([]), ['where' => '', 'params' => []]);
$check('blank values count as unset', OrderFilter::fromQuery(['productId' => '', 'status' => '']), ['where' => '', 'params' => []]);
$check('instrument and side', OrderFilter::fromQuery(['productId' => 'BTC-USD', 'side' => 'buy']), [
    'where' => ' AND product_id = ? AND side = ?',
    'params' => ['BTC-USD', 'buy'],
]);
$check('status and type lists, duplicates dropped', OrderFilter::fromQuery(['status' => 'pending,fulfilling,pending', 'type' => 'limit']), [
    'where' => ' AND status IN (?, ?) AND type IN (?)',
    'params' => ['pending', 'fulfilling', 'limit'],
]);
$check('price range, one side unbound', OrderFilter::fromQuery(['maxPrice' => '100.5']), [
    'where' => ' AND price <= ?',
    'params' => ['100.5'],
]);
$check('time range', OrderFilter::fromQuery(['from' => '1700000000000', 'to' => '1700000100000']), [
    'where' => ' AND placed_at >= ? AND placed_at <= ?',
    'params' => ['1700000000000', '1700000100000'],
]);
$check('bad product id', $rejects(['productId' => 'btc']), '400 productId has an invalid format');
$check('bad side', $rejects(['side' => 'hold']), '400 side must be one of: buy, sell');
$check('bad status in list', $rejects(['status' => 'pending,done']), '400 status must be one of: pending, fulfilling, fulfilled, cancelled');
$check('negative price', $rejects(['minPrice' => '-1']), '400 minPrice must be a non-negative number');
$check('min above max', $rejects(['minPrice' => '10', 'maxPrice' => '9']), '400 minPrice cannot exceed maxPrice');
$check('from after to', $rejects(['from' => '2', 'to' => '1']), '400 from cannot be after to');
$check('non-numeric timestamp', $rejects(['from' => '2026-01-01']), '400 from must be a timestamp in milliseconds');
