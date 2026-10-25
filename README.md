# Windows Rollup source-entry build regression

`npm run build-artifacts` fails on a fresh Windows checkout because `src\create-sinon-api.js` is classified as an external named import. Resolving entry paths before handing them to Rollup lets the existing absolute-path handling keep them internal. The new real Rollup test also checks every generated CommonJS relative path; no public API manifest or package layout changes.

Baseline: `84e91a491b5d88b81e6a80e5dd3f77520577f9e8`.
Candidate: `ff9f101db520cbb07b85861aa6794ed48a7d661b` (two files; exact SHA-256 in candidate.json).

## Reproduce

In disposable clean checkouts, install the exact lockfile with `npm ci` and run `npm run build-artifacts`. On Windows the baseline reports `Entry module "src\create-sinon-api.js" cannot be external`; the candidate finishes its CommonJS, UMD and ESM artifacts. Run `node node_modules/mocha/bin/mocha.js test/scripts/rollup-config-test.js` on the candidate. To compare the same new test on the baseline, restore only that test from the candidate into the disposable baseline checkout, leaving rollup.config.mjs unchanged. It fails on Windows and passes on Linux, as expected for this platform regression.

## Actual results

Windows 11, Node24.14.0/npm11.16.0: official build PASS, new regression0PASS/1FAIL before ->1PASS after, official Node1561PASS/12existingpending, Chromium156.0.8078.4 browser1553PASS/13existingpending, WebWorker1PASS, ESM10PASS, six real packed consumer fixtures and exact public API manifest PASS. Coverage uses the original coverage.cjs and nested nyc thresholds: statements97.48%, branches92.42%, functions98.16%, lines97.46%.

Linux Debian13, Node24.14.0, real Chrome Headless Shell147.0.7727.57: unmodified `npm test`, `npm run lint`, `npm run prettier:check`, `npm run test-esm-support`, `npm run test-contract`, `npm run check-dependencies` and `npm run test-coverage -- --chrome "$PUPPETEER_EXECUTABLE_PATH" --allow-chrome-as-root` all PASS. npm test includes Node1561PASS/12pending, browser1553PASS/13pending and worker1PASS. Six packed CJS/ESM fixtures, browser module/global smoke and all coverage thresholds pass. The same exact new regression and official build also pass on the Linux baseline. No browser suite was silently skipped: browser launch was separately required and the runner rejects a `Skipping` message.

Additional actual Linux `npm run test-node` matrix: Node22.23.4,25.9.0,26.12.1 each1561PASS/12existingpending; Node24.14.0 covered above. Official downloaded runtime versions, URLs and SHA-256 checks against official SHASUMS256.txt are recorded in node-matrix.json. Hosted GitHub checks are separate and were not claimed to have run before this PR.

## Boundaries and harnesses

The Windows npm scripts have separate pre-existing single-quote glob and npm/npx spawn problems. The literal-quote lint error is reproduced on the exact baseline with the same locked dependencies; full direct ESLint and Prettier pass. For additional Windows browser/worker/coverage proof only, the external harness JSON-encodes generated require paths and passes a built bundle to the unchanged Mochify/esbuild/coverage tooling. For packed fixtures it invokes npm pack directly before the unchanged consumers/manifest helper. These alternate runs are not reported as unmodified Windows script successes. The Linux official commands above cover the original scripts unchanged.

Initial Docker disk I/O stalls were setup failures, not product failures. The exact Linux snapshots and already-locked Linux dependencies were moved to tmpfs; cached Debian browser libraries were extracted there and supplied through LD_LIBRARY_PATH. Only our disposable validation container was restarted; no production service was touched. This neither patches the browser tests nor replaces the real browser. No cloud browser/paid service was called. No generated lib/pkg, lockfile, manifests or unrelated Windows script fixes are in the product commit.

This bug was discovered while running the official build, independently of an issue. Old issue2384's reported source symptom already passes current main and is not claimed fixed or closed by this change.
