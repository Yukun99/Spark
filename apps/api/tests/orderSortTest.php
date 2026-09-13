<?php

declare(strict_types=1);

use Spark\Api\ApiError;
use Spark\Api\OrderSort;

/** @var callable $check provided by run.php */

echo "OrderSort::fromQuery\n";

$rejects = function (array $query): ?string {
    try {
        OrderSort::fromQuery($query);
        return null;
    } catch (ApiError $error) {
        return $error->status . ' ' . $error->getMessage();
    }
};

$fill = 'filled_size / size';
$statusRank = "FIELD(status, 'pending', 'fulfilling', 'fulfilled', 'cancelled')";
$typeRank = "FIELD(type, 'limit', 'market')";

$check('no sort is newest first', OrderSort::fromQuery([]), 'ORDER BY placed_at DESC, seq DESC');
$check('blank values count as unset', OrderSort::fromQuery(['sort' => '', 'direction' => '']), 'ORDER BY placed_at DESC, seq DESC');
$check('direction alone changes nothing', OrderSort::fromQuery(['direction' => 'desc']), 'ORDER BY placed_at DESC, seq DESC');
$check('instrument defaults to ascending', OrderSort::fromQuery(['sort' => 'instrument']), 'ORDER BY product_id ASC, seq ASC');
$check('instrument descending', OrderSort::fromQuery(['sort' => 'instrument', 'direction' => 'desc']), 'ORDER BY product_id DESC, seq DESC');
$check('status: status order, then fill share', OrderSort::fromQuery(['sort' => 'status', 'direction' => 'asc']), "ORDER BY $statusRank ASC, $fill ASC, seq ASC");
$check('status descending flips every key', OrderSort::fromQuery(['sort' => 'status', 'direction' => 'desc']), "ORDER BY $statusRank DESC, $fill DESC, seq DESC");
$check('price: price, then limit before market', OrderSort::fromQuery(['sort' => 'price']), "ORDER BY price ASC, $typeRank ASC, seq ASC");
$check('fulfilment: fill share, size, provider', OrderSort::fromQuery(['sort' => 'fulfilment']), "ORDER BY $fill ASC, size ASC, provider ASC, seq ASC");
$check('fulfilment descending', OrderSort::fromQuery(['sort' => 'fulfilment', 'direction' => 'desc']), "ORDER BY $fill DESC, size DESC, provider DESC, seq DESC");
$check('submission time ascending is oldest first', OrderSort::fromQuery(['sort' => 'placedAt']), 'ORDER BY placed_at ASC, seq ASC');
$check('unknown column', $rejects(['sort' => 'actions']), '400 sort must be one of: instrument, status, price, fulfilment, placedAt');
$check('sql in column', $rejects(['sort' => 'price; DROP TABLE orders']), '400 sort must be one of: instrument, status, price, fulfilment, placedAt');
$check('bad direction', $rejects(['sort' => 'price', 'direction' => 'up']), '400 direction must be one of: asc, desc');
