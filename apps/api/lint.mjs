import { spawnSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';

const root = import.meta.dirname;
const files = [
  'index.php',
  'config.example.php',
  ...readdirSync(join(root, 'src'))
    .filter((file) => file.endsWith('.php'))
    .map((file) => join('src', file)),
];

let failed = false;
for (const file of files) {
  const result = spawnSync('php', ['-l', file], { cwd: root, stdio: 'inherit' });
  if (result.error) {
    console.error('php not found on PATH. Install PHP 8.3 (winget install PHP.PHP.8.3) to lint apps/api.');
    process.exit(1);
  }
  if (result.status !== 0) failed = true;
}
process.exit(failed ? 1 : 0);
