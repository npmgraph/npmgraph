# Copilot Agent Instructions

## Pull Requests

When creating a pull request, use a Conventional Commit title in the format `type(scope): description` (for example, `fix(graph): handle empty dependencies`). Use a valid Conventional Commit type and keep the description concise. PR titles are validated by `.github/workflows/pr.yml`.

## Before Committing

Always run `npm run fix` before committing changes. This runs ESLint with `--fix` and Prettier in parallel to ensure code is properly linted and formatted.
If `npm run fix` reports errors that cannot be auto-fixed, resolve them manually and re-run it before committing. Do not commit while it still fails.

```sh
npm run fix
```

Note: `npm run lint` requires Node.js 24 (`Object.groupBy` is unavailable in older versions). Run `npm run types` for TypeScript checks, which work on all supported versions.
