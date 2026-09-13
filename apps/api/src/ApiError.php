<?php

declare(strict_types=1);

namespace Spark\Api;

/** Error surfaced to the client as `{error}` with the given HTTP status. */
final class ApiError extends \RuntimeException
{
    public function __construct(public readonly int $status, string $message)
    {
        parent::__construct($message);
    }
}
