# Contributing

## Setup

Requires Node.js 24+.

```sh
npm ci
npm start
```

## Before opening a PR

```sh
npm run fix   # lint + format
npm test      # format check, lint, types, unit tests, build
```

PR titles and commit messages use [Conventional Commits](https://www.conventionalcommits.org/): `type(scope): description`.

## AI-assisted contributions

AI tools are welcome. Project context for them lives in [copilot-instructions.md](copilot-instructions.md) (also referenced by [AGENTS.md](../AGENTS.md)).

- You are responsible for everything you submit: review, run, and understand AI-generated changes.
- Disclosing significant AI assistance in the PR description is encouraged, not required.
- Keep changes focused; avoid unrelated refactors.
