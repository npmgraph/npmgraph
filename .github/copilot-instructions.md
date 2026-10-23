# Copilot Agent Instructions

## Pull Requests

When creating a pull request, use a Conventional Commit title in the format `type(scope): description` (for example, `fix(graph): handle empty dependencies`). Use one of these types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert, matching the allowed list in `.github/workflows/pr.yml`. Keep the description concise. PR titles are validated by `.github/workflows/pr.yml`.

## Before Committing

If Lefthook pre-commit hooks are enabled, rely on them for formatting, linting, and tests; fix any reported failures before committing. Do not run these checks separately just for the commit.

If Lefthook pre-commit hooks are not enabled, run `npm run format:check`, `npm run lint`, and `npm run test:unit` before committing. `npm run lint` requires Node.js 24. If it fails because the Node.js version is below 24, report the version mismatch and do not silently skip or substitute another check.

## URL API Documentation

When changing code that reads, writes, adds, removes, or changes the behavior or accepted values of URL search or hash parameters, update the `URL API` section in `README.md` in the same change. Keep the documented fields, defaults, value formats, and examples aligned with the implementation.
