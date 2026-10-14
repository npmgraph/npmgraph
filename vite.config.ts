import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import svgr from 'vite-plugin-svgr';

const envKeys = [
  'BUGSNAG_KEY',
  'VERCEL_ENV',
  'VERCEL_GIT_COMMIT_SHA',
  'VERCEL_GIT_PULL_REQUEST_ID',
];

// eslint-disable-next-line unicorn/no-top-level-side-effects -- Vite config
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), svgr({ include: '**/*.svg?react' })],
    define: Object.fromEntries(
      envKeys.map(key => [`process.env.${key}`, `${JSON.stringify(env[key])}`]),
    ),
  };
});
