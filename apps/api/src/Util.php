<?php

declare(strict_types=1);

namespace Spark\Api;

final class Util
{
    /** Same alphabet as Redux Toolkit's `nanoid()`, so server and client ids look alike. */
    private const NANOID_ALPHABET = 'ModuleSymbhasOwnPr-0123456789ABCDEFGHNRVfgctiUvz_KqYTJkLxpZXIjQW';
    public const NANOID_LENGTH = 21;

    public static function nowMs(): int
    {
        return (int) floor(microtime(true) * 1000);
    }

    public static function nanoid(): string
    {
        $bytes = random_bytes(self::NANOID_LENGTH);
        $id = '';
        for ($i = 0; $i < self::NANOID_LENGTH; $i++) {
            $id .= self::NANOID_ALPHABET[ord($bytes[$i]) & 63];
        }
        return $id;
    }
}
