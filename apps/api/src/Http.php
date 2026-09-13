<?php

declare(strict_types=1);

namespace Spark\Api;

final class Http
{
    public static function json(int $status, mixed $data): never
    {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
        exit;
    }

    public static function noContent(): never
    {
        http_response_code(204);
        exit;
    }

    /** Decoded JSON body, `[]` when empty. */
    public static function body(): array
    {
        $raw = file_get_contents('php://input');
        if ($raw === false || trim($raw) === '') {
            return [];
        }
        try {
            $decoded = json_decode($raw, true, 16, JSON_THROW_ON_ERROR);
        } catch (\JsonException) {
            throw new ApiError(400, 'Malformed JSON body');
        }
        if (!is_array($decoded)) {
            throw new ApiError(400, 'JSON body must be an object or array');
        }
        return $decoded;
    }

    /** Token from `Authorization: Bearer ...`, checking the places Apache may stash it. */
    public static function bearerToken(): ?string
    {
        $header = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? null;
        if ($header === null && function_exists('apache_request_headers')) {
            $headers = array_change_key_case(apache_request_headers(), CASE_LOWER);
            $header = $headers['authorization'] ?? null;
        }
        if (!is_string($header) || !preg_match('/^Bearer\s+(\S+)$/i', $header, $match)) {
            return null;
        }
        return $match[1];
    }

    /** Request path relative to the directory holding index.php, e.g. `/orders/abc`. */
    public static function routePath(): string
    {
        $path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
        $base = rtrim(str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? '/')), '/');
        if ($base !== '' && str_starts_with($path, $base)) {
            $path = substr($path, strlen($base));
        }
        return '/' . trim($path, '/');
    }
}
