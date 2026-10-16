---
applyTo: 'components/**,hooks/**'
---

- Function components with hooks only; styles go in a colocated `*.module.scss`.
- Avoid unnecessary `useEffect`; the lint config includes `react-you-might-not-need-an-effect` and `react-doctor`.
- Put non-UI logic in `lib/` so it can be unit tested.
