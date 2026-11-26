# Copilot Agent Instructions

## Pull Requests

When creating a pull request, use a Conventional Commit PR title in the format `type(scope): description` (for example, `fix(graph): handle empty dependencies`). Use one of these types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert, matching the default allowed list in https://github.com/commitizen/conventional-commit-types. Keep the description concise.

## URL API Documentation

When changing code that reads, writes, adds, removes, or changes the behavior or accepted values of URL search or hash parameters, update the `URL API` section in `README.md` in the same change. Keep the documented fields, defaults, value formats, and examples aligned with the implementation.
