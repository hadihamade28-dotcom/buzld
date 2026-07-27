# Buzld agent notes

- **Web UI** lives in `apps/web` (TanStack Start). Prefer this for product UI work.
- **Native / BLE** lives in `apps/mobile` (Expo).
- **Backend** lives in `supabase/`.
- Do not force-push or rewrite published history if this branch is still synced to Lovable.

## Cursor Cloud specific instructions

- Monorepo uses **npm workspaces** (root `package.json`). A single root `npm install` installs both `apps/web` and `apps/mobile`; there is no root lockfile (each app has its own). Ignore `apps/web/bun.lock` — the environment uses npm.
- Run everything from the repo root. Standard scripts are in root `package.json`: `npm run dev` (web), `npm run build` (web), `npm run lint` (web), `npm run typecheck` (mobile). Core logic tests: `node scripts/test-core.mjs`.
- **Web (`apps/web`) is the primary product** and the only service that runs fully in this VM. It uses mock data (`src/lib/mock-data.ts`) and needs **no** env vars / Supabase to run or build.
- The web dev server listens on **http://localhost:8080** (the Lovable vite config auto-picks the port/host), not the `5173` mentioned in the README.
- Known pre-existing failures (NOT caused by setup, do not "fix" as part of env work): `npm run lint` reports prettier formatting errors, and `npm run typecheck` reports `StyleSheet.absoluteFillObject` type errors in `apps/mobile`. The tooling itself works.
- `apps/mobile` is an Expo app requiring a physical device / dev build for BLE + haptics; it cannot be fully run in this VM (typecheck/metro only).
- `supabase/` scripts (`scripts/push-schema.mjs`, `scripts/deploy-functions.mjs`) target a remote hosted project and need `SUPABASE_ACCESS_TOKEN` / `SUPABASE_DB_PASSWORD`; not required for local web dev.
