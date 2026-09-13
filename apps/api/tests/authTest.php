<?php

declare(strict_types=1);

use Spark\Api\ApiError;
use Spark\Api\Auth;

/** @var callable $check provided by run.php */

echo "Auth::password\n";

$rejects = function (mixed $password): ?string {
    try {
        Auth::password($password);
        return null;
    } catch (ApiError $error) {
        return $error->status . ' ' . $error->getMessage();
    }
};

$check('eight characters pass', Auth::password('abcdefgh'), 'abcdefgh');
$check('thirty-two characters pass', Auth::password(str_repeat('a', 32)), str_repeat('a', 32));
$check('too short', $rejects('abcdefg'), '400 password must be 8 to 32 characters');
$check('too long', $rejects(str_repeat('a', 33)), '400 password must be 8 to 32 characters');
$check('missing', $rejects(null), '400 password must be 8 to 32 characters');
$check('space inside', $rejects('pass word1'), '400 password cannot contain spaces');
$check('tab inside', $rejects("pass\tword1"), '400 password cannot contain spaces');
