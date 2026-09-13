<?php

declare(strict_types=1);

namespace Spark\Api;

final class Db
{
    private const DUPLICATE_KEY_ERRNO = 1062;

    private static ?\PDO $pdo = null;

    public static function pdo(): \PDO
    {
        if (self::$pdo === null) {
            $config = require __DIR__ . '/../config.php';
            $dsn = sprintf('mysql:host=%s;dbname=%s;charset=utf8mb4', $config['host'], $config['name']);
            self::$pdo = new \PDO($dsn, $config['user'], $config['password'], [
                \PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION,
                \PDO::ATTR_DEFAULT_FETCH_MODE => \PDO::FETCH_ASSOC,
                \PDO::ATTR_EMULATE_PREPARES => false,
            ]);
        }
        return self::$pdo;
    }

    public static function run(string $sql, array $params = []): \PDOStatement
    {
        $statement = self::pdo()->prepare($sql);
        $statement->execute($params);
        return $statement;
    }

    public static function one(string $sql, array $params = []): ?array
    {
        $row = self::run($sql, $params)->fetch();
        return $row === false ? null : $row;
    }

    public static function all(string $sql, array $params = []): array
    {
        return self::run($sql, $params)->fetchAll();
    }

    public static function isDuplicate(\PDOException $exception): bool
    {
        return ($exception->errorInfo[1] ?? null) === self::DUPLICATE_KEY_ERRNO;
    }

    /** Runs `$work` inside a transaction, rolling back on any throw. */
    public static function transaction(callable $work): void
    {
        $pdo = self::pdo();
        $pdo->beginTransaction();
        try {
            $work();
            $pdo->commit();
        } catch (\Throwable $exception) {
            $pdo->rollBack();
            throw $exception;
        }
    }
}
