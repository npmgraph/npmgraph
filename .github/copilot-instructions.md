# Copilot Agent Instructions

## Before Committing

Always run `npm run fix` before committing changes. This runs ESLint with `--fix` and Prettier in parallel to ensure code is properly linted and formatted.

```sh
npm run fix
```

Note: `npm run lint` requires Node.js 24 (`Object.groupBy` is unavailable in older versions). Run `npm run types` for TypeScript checks, which work on all supported versions.
