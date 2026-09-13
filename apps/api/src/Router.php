<?php

declare(strict_types=1);

namespace Spark\Api;

final class Router
{
    /** @var list<array{method: string, regex: string, handler: callable}> */
    private array $routes = [];

    /** `$pattern` may hold `{name}` segments, passed to the handler as `$params['name']`. */
    public function add(string $method, string $pattern, callable $handler): void
    {
        $regex = '#^' . preg_replace('#\{(\w+)\}#', '(?P<$1>[^/]+)', $pattern) . '$#';
        $this->routes[] = ['method' => $method, 'regex' => $regex, 'handler' => $handler];
    }

    public function dispatch(string $method, string $path): void
    {
        $allowed = [];
        foreach ($this->routes as $route) {
            if (!preg_match($route['regex'], $path, $match)) {
                continue;
            }
            if ($route['method'] !== $method) {
                $allowed[] = $route['method'];
                continue;
            }
            $params = array_filter($match, 'is_string', ARRAY_FILTER_USE_KEY);
            ($route['handler'])($params);
            return;
        }
        if ($allowed !== []) {
            header('Allow: ' . implode(', ', array_unique($allowed)));
            throw new ApiError(405, 'Method not allowed');
        }
        throw new ApiError(404, 'Not found');
    }
}
