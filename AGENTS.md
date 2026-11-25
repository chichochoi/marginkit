# MarginKit Agent Instructions

MarginKit is a zero-dependency Node.js v22 ESM static calculator platform (`tools/published/` and `tools/staged/`).

## Token-Saving Workflow for Scheduled Runs
1. **NEVER** read existing files in `tools/published/` or `tools/staged/`. Use `data/catalog-index.json` or `npm run status` instead.
2. Start by running `node scripts/status.mjs` to pull latest changes and check `neededCount`.
3. If `neededCount === 0`, stop immediately.
4. When generating new tools into `tools/staged/<slug>.mjs`, read ONLY `docs/TOOL_SPEC.md` and write up to `maxGeneratePerRun` (3) modules matching `nextTopics` from `status.mjs`.
5. Every calculator MUST export `meta` and a standalone `export function compute(values) { ... }` (no outer closures, no shorthand method syntax) that runs safely in both Node and browser `new Function`.
6. Finish by running `npm run sync` (which runs `verify`, `build`, `git add/commit/pull/push`).
