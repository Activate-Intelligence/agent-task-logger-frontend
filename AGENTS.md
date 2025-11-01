# Repository Guidelines

## Project Structure & Module Organization
- `src/app` hosts App Router routes, layouts, and server-first entry points; keep data fetching inside route segments when possible.
- `src/components` centralizes shadcn-derived UI primitives and feature widgets; prefer colocated `index.ts` re-exports for discoverability.
- `src/hooks`, `src/lib`, `src/stores`, and `src/types` hold shared logic, utilities, zustand stores, and TypeScript contracts; reuse before adding new modules.
- `public` stores static assets served as-is; update `public/favicon*` when branding changes.
- `terraform/` captures deployment infrastructure; coordinate with the platform team before modifying.
- `frontend/` contains legacy prototypes—validate relevance before editing.

## Build, Test, and Development Commands
- `npm install` installs dependencies; run after pulling new UI or infra modules.
- `npm run dev` starts the Next.js dev server with fast refresh at http://localhost:3000.
- `npm run build` generates the production bundle used by OpenNext; run before shipping infra changes.
- `npm run start` serves the built app locally and mirrors the Lambda environment.
- `npm run lint` runs ESLint with the Next.js config; fix or suppress rule violations inline.
- `npm run typecheck` enforces strict TypeScript settings (`strict`, `noUnused*`); keep the run clean before pushing.

## Coding Style & Naming Conventions
Use TypeScript with functional React components and 2-space indentation. Prefer server components unless client-only hooks (`useState`, `useEffect`) are required. Name files with kebab-case (`task-table.tsx`), colocate component styles via Tailwind utility classes, and import modules through the `@/` alias. Run linting and type checks after refactoring to avoid regressions.

## Testing Guidelines
Automated tests are not yet established; treat new features as an opportunity to propose unit or e2e coverage. Document manual verification steps in PRs and ensure `lint` and `typecheck` succeed. If adding tests, place React unit specs alongside features in `src/**/__tests__` and align names with the component under test.

## Commit & Pull Request Guidelines
Follow the conventional commit style visible in history (`fix:`, `chore:`, `feat:`). Keep messages imperative, summarize scope in 72 characters, and describe context in the body when needed. For PRs, link the relevant issue, outline changes, list verification commands, and attach UI screenshots or screencasts for visual updates. Request review from code owners and wait for CI before merging.
