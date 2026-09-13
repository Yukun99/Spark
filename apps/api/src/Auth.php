<?php

declare(strict_types=1);

namespace Spark\Api;

final class Auth
{
    private const TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;
    private const TOKEN_BYTES = 32;
    private const USERNAME_MAX = 32;
    private const USERNAME_PATTERN = '/^[A-Za-z0-9_]{3,32}$/';
    private const PASSWORD_MIN = 8;
    /** bcrypt ignores anything past 72 bytes. */
    private const PASSWORD_MAX = 72;

    public static function register(): void
    {
        [$username, $password] = self::credentials();
        try {
            Db::run(
                'INSERT INTO users (username, password_hash, created_at) VALUES (?, ?, ?)',
                [$username, password_hash($password, PASSWORD_DEFAULT), Util::nowMs()],
            );
        } catch (\PDOException $exception) {
            if (Db::isDuplicate($exception)) {
                throw new ApiError(409, 'Username is already taken');
            }
            throw $exception;
        }
        Http::json(201, self::session((int) Db::pdo()->lastInsertId(), $username));
    }

    public static function login(): void
    {
        [$username, $password] = self::credentials();
        $user = Db::one('SELECT id, username, password_hash FROM users WHERE username = ?', [$username]);
        if ($user === null || !password_verify($password, $user['password_hash'])) {
            throw new ApiError(401, 'Invalid username or password');
        }
        Db::run('DELETE FROM sessions WHERE user_id = ? AND expires_at <= ?', [$user['id'], Util::nowMs()]);
        Http::json(200, self::session((int) $user['id'], $user['username']));
    }

    public static function logout(): void
    {
        $token = Http::bearerToken();
        if ($token !== null) {
            Db::run('DELETE FROM sessions WHERE token_hash = ?', [self::hashToken($token)]);
        }
        Http::noContent();
    }

    public static function me(): void
    {
        $userId = self::requireUser();
        $user = Db::one('SELECT id, username FROM users WHERE id = ?', [$userId]);
        if ($user === null) {
            throw new ApiError(401, 'Invalid or expired token');
        }
        Http::json(200, ['id' => (int) $user['id'], 'username' => $user['username']]);
    }

    /** User id behind the bearer token; 401 when missing, unknown or expired. */
    public static function requireUser(): int
    {
        $token = Http::bearerToken();
        if ($token === null) {
            throw new ApiError(401, 'Missing bearer token');
        }
        $row = Db::one(
            'SELECT user_id FROM sessions WHERE token_hash = ? AND expires_at > ?',
            [self::hashToken($token), Util::nowMs()],
        );
        if ($row === null) {
            throw new ApiError(401, 'Invalid or expired token');
        }
        return (int) $row['user_id'];
    }

    /** @return array{0: string, 1: string} username and password from the body */
    private static function credentials(): array
    {
        $body = Http::body();
        $username = Validate::string($body, 'username', self::USERNAME_MAX, self::USERNAME_PATTERN);
        $password = $body['password'] ?? null;
        $length = is_string($password) ? strlen($password) : 0;
        if ($length < self::PASSWORD_MIN || $length > self::PASSWORD_MAX) {
            throw new ApiError(400, sprintf('password must be %d to %d characters', self::PASSWORD_MIN, self::PASSWORD_MAX));
        }
        return [$username, $password];
    }

    private static function session(int $userId, string $username): array
    {
        $token = bin2hex(random_bytes(self::TOKEN_BYTES));
        $now = Util::nowMs();
        Db::run(
            'INSERT INTO sessions (token_hash, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)',
            [self::hashToken($token), $userId, $now, $now + self::TOKEN_TTL_MS],
        );
        return ['token' => $token, 'user' => ['id' => $userId, 'username' => $username]];
    }

    private static function hashToken(string $token): string
    {
        return hash('sha256', $token);
    }
}
