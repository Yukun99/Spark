<?php

declare(strict_types=1);

use Spark\Api\Execution;

/** @var callable $check provided by run.php */

echo "Execution::simulate\n";

$order = fn(array $overrides = []): array => [
    'type' => 'limit',
    'time_in_force' => 'GTC',
    'size' => '10',
    'filled_size' => '0',
    'status' => 'pending',
    ...$overrides,
];
$always = fn(float $min, float $max): float => $max;
$lowest = fn(float $min, float $max): float => $min;

$check('pending stays pending with no steps', Execution::simulate($order(), 0, $always), [
    'filled_size' => '0.0000000000',
    'status' => 'pending',
]);
$check('pending becomes fulfilling after one step, nothing filled', Execution::simulate($order(), 1, $always), [
    'filled_size' => '0.0000000000',
    'status' => 'fulfilling',
]);
$check('limit fills 10% per step at the low end', Execution::simulate($order(), 3, $lowest), [
    'filled_size' => '2.0000000000',
    'status' => 'fulfilling',
]);
$check('market fills 60% per step at the high end', Execution::simulate($order(['type' => 'market']), 2, $always), [
    'filled_size' => '6.0000000000',
    'status' => 'fulfilling',
]);
$check('fills clamp to the size and finish as fulfilled', Execution::simulate($order(['type' => 'market']), 5, $always), [
    'filled_size' => '10.0000000000',
    'status' => 'fulfilled',
]);
$check('FOK fills everything in one working step', Execution::simulate($order(['time_in_force' => 'FOK']), 2, $lowest), [
    'filled_size' => '10.0000000000',
    'status' => 'fulfilled',
]);
$check('a partly filled order continues from its fill', Execution::simulate($order(['status' => 'fulfilling', 'filled_size' => '9.5']), 1, $lowest), [
    'filled_size' => '10.0000000000',
    'status' => 'fulfilled',
]);
$check('cancelled orders are untouched', Execution::simulate($order(['status' => 'cancelled', 'filled_size' => '3']), 50, $always), [
    'filled_size' => '3.0000000000',
    'status' => 'cancelled',
]);
$check('fulfilled orders are untouched', Execution::simulate($order(['status' => 'fulfilled', 'filled_size' => '10']), 50, $always), [
    'filled_size' => '10.0000000000',
    'status' => 'fulfilled',
]);
$check('the random ratio is used within the type range', Execution::simulate(
    $order(['status' => 'fulfilling']),
    1,
    fn(float $min, float $max): float => ($min + $max) / 2,
), ['filled_size' => '2.0000000000', 'status' => 'fulfilling']);
