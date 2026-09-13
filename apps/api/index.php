<?php

declare(strict_types=1);

use Spark\Api\ApiError;
use Spark\Api\Auth;
use Spark\Api\Http;
use Spark\Api\Orders;
use Spark\Api\Router;
use Spark\Api\Settings;
use Spark\Api\Widgets;

foreach (['ApiError', 'Util', 'Http', 'Db', 'Validate', 'Router', 'Auth', 'Execution', 'OrderFilter', 'OrderSort', 'Paging', 'Orders', 'Settings', 'Widgets'] as $class) {
    require __DIR__ . "/src/$class.php";
}

// Shortest round-trip float output (77450.12, not 77450.1199999…) whatever the host php.ini says.
ini_set('serialize_precision', '-1');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

$router = new Router();
$router->add('POST', '/auth/register', Auth::register(...));
$router->add('POST', '/auth/login', Auth::login(...));
$router->add('POST', '/auth/logout', Auth::logout(...));
$router->add('GET', '/auth/me', Auth::me(...));
$router->add('GET', '/orders', Orders::list(...));
$router->add('GET', '/orders/products', Orders::products(...));
$router->add('POST', '/orders', Orders::create(...));
$router->add('PATCH', '/orders/{id}', Orders::update(...));
$router->add('POST', '/orders/{id}/cancel', Orders::cancel(...));
$router->add('GET', '/settings', Settings::get(...));
$router->add('PUT', '/settings', Settings::put(...));
$router->add('GET', '/widgets', Widgets::get(...));
$router->add('PUT', '/widgets', Widgets::put(...));

try {
    $router->dispatch($_SERVER['REQUEST_METHOD'] ?? 'GET', Http::routePath());
} catch (ApiError $error) {
    Http::json($error->status, ['error' => $error->getMessage()]);
} catch (Throwable $throwable) {
    error_log((string) $throwable);
    Http::json(500, ['error' => 'Internal server error']);
}
