<?php

declare(strict_types=1);

use Spark\Api\ApiError;
use Spark\Api\Paging;

/** @var callable $check provided by run.php */

echo "Paging::fromQuery\n";

$rejects = function (array $query, int $total = 0): ?string {
    try {
        Paging::fromQuery($query, $total);
        return null;
    } catch (ApiError $error) {
        return $error->status . ' ' . $error->getMessage();
    }
};

$check('defaults to the first page of ten', Paging::fromQuery([], 25), ['page' => 1, 'pageCount' => 3, 'limit' => 10, 'offset' => 0]);
$check('blank values count as unset', Paging::fromQuery(['page' => '', 'pageSize' => ''], 5), ['page' => 1, 'pageCount' => 1, 'limit' => 10, 'offset' => 0]);
$check('offset follows the page', Paging::fromQuery(['page' => '3', 'pageSize' => '7'], 25), ['page' => 3, 'pageCount' => 4, 'limit' => 7, 'offset' => 14]);
$check('page past the end is clamped', Paging::fromQuery(['page' => '9', 'pageSize' => '10'], 25), ['page' => 3, 'pageCount' => 3, 'limit' => 10, 'offset' => 20]);
$check('no rows still has one page', Paging::fromQuery(['page' => '4'], 0), ['page' => 1, 'pageCount' => 1, 'limit' => 10, 'offset' => 0]);
$check('exact multiple has no empty trailing page', Paging::fromQuery(['pageSize' => '5'], 10)['pageCount'], 2);
$check('page zero', $rejects(['page' => '0']), '400 page must be a positive integer');
$check('page not a number', $rejects(['page' => '-1']), '400 page must be a positive integer');
$check('page size zero', $rejects(['pageSize' => '0']), '400 pageSize must be between 1 and 200');
$check('page size too big', $rejects(['pageSize' => '201']), '400 pageSize must be between 1 and 200');
$check('page size not a number', $rejects(['pageSize' => 'ten']), '400 pageSize must be a positive integer');
