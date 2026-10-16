---
applyTo: '**/*.test.ts'
---

- Use Vitest (`describe`, `it`, `expect`) and match the style of neighboring tests.
- Keep tests offline and deterministic; mock network calls rather than hitting the npm registry.
- Run a single file with `npx vitest run --project unit <path>`.
