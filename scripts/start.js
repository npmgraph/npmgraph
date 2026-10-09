import { execFileSync, spawn } from 'node:child_process';
import process from 'node:process';

const env = {
  ...process.env,
  VERCEL_GIT_COMMIT_SHA: execFileSync('git', ['rev-parse', 'HEAD'], {
    encoding: 'utf8',
  }).trim(),
};
const parcel = spawn(
  process.execPath,
  [
    'node_modules/parcel/lib/bin.js',
    'serve',
    '--no-cache',
    ...process.argv.slice(2),
  ],
  { env, stdio: 'inherit' },
);

parcel.on('exit', code => {
  process.exitCode = code ?? 1;
});
