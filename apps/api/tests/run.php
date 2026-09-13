<?php

declare(strict_types=1);

// Plain-PHP test runner: each *Test.php file uses `$check(label, actual, expected)`.

foreach (['ApiError', 'Util', 'Execution', 'Orders', 'OrderFilter'] as $class) {
    require __DIR__ . "/../src/$class.php";
}

$failures = 0;

/** Prints the label and counts failures instead of stopping. */
$check = function (string $label, mixed $actual, mixed $expected) use (&$failures): void {
    if ($actual === $expected) {
        echo "  ok   $label\n";
        return;
    }
    $failures++;
    echo "  FAIL $label\n       expected " . var_export($expected, true) . "\n       got      " . var_export($actual, true) . "\n";
};

foreach (glob(__DIR__ . '/*Test.php') as $file) {
    require $file;
}

echo $failures === 0 ? "All passed\n" : "$failures failed\n";
exit($failures === 0 ? 0 : 1);
