# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

SchoolERP is a monolithic school management system: an Express/TypeScript/Prisma (MongoDB) backend, a
React 19/Vite/Tailwind frontend, a `contracts/` package of shared Zod schemas, and a separate Jest+axios
integration-test package that exercises the backend over HTTP. `backend/`, `frontend/`, and `contracts/` are
npm workspaces under the root `package.json` (run `npm install` once at the repo root — it links
`@schoolerp/contracts` into both `backend/node_modules` and `frontend/node_modules`); `test/` stays a fully
independent package. Every command below is still run from inside the relevant directory.

`ALIGNMENT_PLAN.md` at the repo root is the phased plan (approved 2026-08-23) for bringing the backend and
frontend into end-to-end type safety via that `contracts/` package — read it before starting work on any
phase it describes, and update its status markers as phases complete.

`PAGES_PLAN.md` at the repo root is the authoritative map of every frontend page to its form fields and the
backend API it calls (generated from the Zod schemas and Prisma schema). Consult it before building or
modifying a page or route — it also lists known gaps (e.g. no online payment flow yet, no Finance/Contact
Messages pages scaffolded despite the API existing). Endpoints migrated to `contracts/` (see
ALIGNMENT_PLAN.md Phase 1) are noted inline; those are the authoritative source over the prose description
if the two ever disagree.

### The `contracts/` workspace

`contracts/src/**` holds one Zod schema per migrated API operation — request AND response — imported by
both sides: the backend's `core/http/defineRoute.ts` validates a request against it and type-checks the
handler's return value against it before sending; the frontend's `lib/api/typed-client.ts` (`api(route,
opts)`) uses the same object to build the request and type the result, and the same body schemas work as
`react-hook-form` + `zodResolver` validators. As of Phase 3 (ALIGNMENT_PLAN.md, 2026-08-23), every
backend endpoint that's actually called by a frontend page is contract-backed — the module-level
`types/index.ts` files, `backend/src/shared/types.ts`, and `frontend/src/lib/types.ts` were all
dead code by the end of Phase 3 and were deleted. The one holdout is `POST /auth/signup`: it exists
at the API level but no page calls it (Admin's Create Student/Teacher forms create the linked `User`
internally instead), so it was left on the older pattern —
`core/responses/ApiResponse.ts`'s `OkResponse`/`CreatedResponse`/`AcceptedResponse` with a schema
defined inline in its controller. When adding a genuinely new endpoint, follow the pattern in
`contracts/src/admin/student.ts` and `backend/src/modules/admin/controllers/student.controller.ts`.

After editing anything in `contracts/src`, run `npm run build -w contracts` (or `npm run dev -w contracts`
to watch) before the backend or frontend will see the change — both consume the built `dist/`, not the
source, so there is no live-source-linking shortcut here.

**Wire conventions on migrated (contract-backed) routes only** — everything NOT yet migrated still uses the
old conventions described further down (`DD-MM-YYYY` dates, business-key-or-Mongo-id lookups, `data: null`
on mutations):
- Dates are ISO on the wire in both directions: `YYYY-MM-DD` for a date, `YYYY-MM` for a month.
  `DD-MM-YYYY` is display-only, done in the frontend (`frontend/src/lib/date.ts`) — never sent or parsed
  off the network.
- A create/update mutation's response is the affected resource, not `null`. A delete's response is
  `{ <businessKeyField>: value }` (or `{ id }` when the resource has no business key, e.g. `Class`).
- Detail/update/delete routes take the resource's business key in the URL (`studentId`, `teacherId`,
  `subjectCode`) — never a raw Mongo id.
- Error responses carry `code` and, for a validation failure, a flattened `issues: [{path, message}]` array
  in addition to the existing `message`/`success` fields.

## Commands

### Backend (`backend/`, uses Bun for dev, Node for prod)
```
bun --watch src/index.ts   # dev (via `npm run dev`) — needs DATABASE_URL etc. in backend/.env
npm run build               # prisma generate && tsc -> dist/
npm run start                # node dist/index.js
npm run lint / lint:fix      # eslint
npm run format                # prettier --write
npm run typecheck             # tsc --noEmit
npm run seed                  # bun prisma/seed.ts
npx prisma generate           # regenerate client after editing prisma/schema.prisma
```
Copy `backend/.env.example` to `backend/.env` first. Only `DATABASE_URL` (a MongoDB connection string —
Prisma uses the `mongodb` provider), `PORT` (defaults to 5000), `ACCESS_TOKEN_SECRET` and
`REFRESH_TOKEN_SECRET` matter for local dev; the rest of `.env.example` (AWS, Redis, PhonePe, Google OAuth,
etc.) are placeholders for integrations that don't exist in the code yet — ignore them. The `DATABASE_URL`
in the checked-out `backend/.env` (not committed) points at a live shared Atlas cluster, not a local
Mongo — treat it accordingly: fine for read-only checks (`bun --watch src/index.ts` + a GET request), but
don't run anything that writes/deletes without confirming first, and note that `npm run seed` (`bun
prisma/seed.ts`) is destructive — running it re-seeds this shared database, not a disposable local one.

That seed data is also stale relative to the current Zod rules: it hardcodes `studentId`/`teacherId` like
`"S101"`/`"T101"` (the schemas require `STU########`/`TCH########`) and `className: "Class 10"` (the
schema caps `className` at 3 characters). It was created with direct `prisma.*.create` calls, bypassing
validation entirely, so this went unnoticed until response validation started checking list-endpoint output
against `@schoolerp/contracts` schemas in Phase 1 — every endpoint whose response includes `className`,
`studentId`, or `teacherId` 500s against this specific database (confirmed so far: `GET /admin/class`,
`/admin/student`, `/admin/teacher`, `/admin/exam`, `/admin/academic/time-table`,
`/admin/finance/student-fee`, `/admin/finance/teacher-salary`, and — found live-testing Phase 7's new
analytics endpoints — `/admin/analytics/attendance` and `/admin/analytics/staff`, both of which surface
a `studentId`/`teacherId` in a table row; `/admin/analytics/academics` almost certainly has the same
issue for the same reason, unconfirmed only because there was no valid `examId` to test with against
this database) until `prisma/seed.ts` is fixed to match current validation and re-run (a write — confirm
before doing that).

### Frontend (`frontend/`)
```
npm run dev          # vite dev server
npm run build          # tsc -b && vite build
npm run lint / lint:fix
npm run format
npm run typecheck
```
`VITE_API_URL` (default `http://localhost:5000/api/v1`) points the frontend at the backend.

### Integration tests (`test/`, separate Jest package, no unit tests exist)
```
npm test              # jest --runInBand
```
These are **live HTTP integration tests** (`test/src/axios.ts` hardcodes
`baseURL: http://localhost:5000/api/v1`) — the backend must already be running with a reachable database
before `npm test` will pass. There's no mocking. To run a single suite: `npx jest admin-route` (jest
matches by filename/path); to run one test: `npx jest -t "test name"`.

### Pre-commit
`contracts`, `backend`, and `frontend` all run lint-staged on commit (eslint --fix, then prettier --write)
via `.husky/pre-commit`, invoked from the repo root; the `contracts` step also typechecks and rebuilds
`dist/` so a commit never ships backend/frontend code compiled against a stale contracts build.

## Backend architecture

Express app assembled in `backend/src/app.ts`; entrypoint `backend/src/index.ts` also starts a WebSocket
log stream (`modules/log`, served at `ws://.../api/v1/logs/live`) alongside the HTTP server. All routes are
mounted under `/api/v1` (`auth`, `admin`, `student`, `teacher`, `user`, `logs`); `/health-check` and
`/api/docs` (Swagger JSON, built in `swagger.ts` from each module's `swagger/` folder) sit outside that
prefix. Path alias `@/*` → `backend/src/*` (see `tsconfig.json`) — use it instead of relative `../../..`.

**Module layout** — each of `modules/{admin,auth,student,teacher,user}` follows the same shape:
`<module>.route.ts` (re-exports `routes/index.ts`) → `routes/*.route.ts` (wires middleware + validation) →
`controllers/*.controller.ts` (`defineRoute` + a contract — see below) → `services/*.service.ts` (Prisma
queries + business logic, typed against the contract's input/output types). There's no per-module
`types/index.ts` anymore — those were deleted once Phase 3 moved everything into `contracts/`; the one
exception (`auth.controller.ts`'s `signup`) validates its own inline schema, since it isn't contract-backed
(see "The `contracts/` workspace" above). Follow the route→controller→service split for any new endpoint
rather than putting Prisma calls in a controller.

**Request flow conventions**:
- The controller is `defineRoute(someContract.operation, async ({ params, query, body, user }) => {...})`
  (`core/http/defineRoute.ts`) — it validates params/query/body against the contract, validates the
  handler's return value against the contract's response schema, and sends the envelope itself. Don't call
  `validateSchema` or construct an `OkResponse`/etc. by hand inside one of these — `defineRoute` does both.
- The one non-contract route (`signup`) still uses the older pattern directly: wrapped in `asyncHandler`
  (`core/responses`) so a thrown error reaches `errorHandlerMiddleware` (`core/errors/index.ts`); input
  validated via `validateSchema(ZodSchema, req.body)` (`core/errors/validateSchema.ts`), which throws a
  `ValidationError` (a subclass of `ApiError`, `core/errors/ApiError.ts`) on failure; success sent via
  `OkResponse`/`CreatedResponse`/`AcceptedResponse` from `core/responses/ApiResponse.ts` — always
  `res.status(N).json(new XResponse(data))`, never a raw object. This is also the pattern to reach for if
  you ever need a route that genuinely can't fit the contract shape.
- Either way, a thrown `ApiError` is caught by `errorHandlerMiddleware` and serialized as
  `{ success: false, statusCode, message, code, issues? }` — `issues` (flattened Zod field errors) is only
  present for a `ValidationError` built from a failed `validateSchema`/`defineRoute` parse.
- Auth: `verifyJWT` (`core/middlewares/auth.middleware.ts`) reads `access_token` from an httpOnly cookie or
  a `Bearer` header, verifies it, and sets `req.user = { id, role }` — the **User** row's id, not a
  Teacher/Student profile id. A protected Teacher/Student route that needs the profile id calls
  `resolveTeacherId(req)` / `resolveStudentId(req)` (same file) rather than using `req.user.id` directly —
  several controllers used to do the latter and it silently matched nothing (ALIGNMENT_PLAN.md 2A/B1–B4).
  Role guards `AdminOnly` / `StudentOnly` / `TeacherOnly` run after `verifyJWT`. Apply both on any new
  protected route.

**Data model** (`backend/prisma/schema.prisma`, MongoDB): `User` (login identity + `Role` enum:
Admin/Teacher/Student/Finance — Finance has no module yet) 1:1 with `Student`/`Teacher` profile records.
Domain models: `Class`, `Subject`, `TimeTable`, `Exam`→`ExamSubject`→`ExamResult`, `Notice`,
`AcademicCalendar`, `StudentAttendance`/`ClassAttendance`, `TeacherAttendance`, and finance records
`StudentFee`→`FeeBreakdown`, `TeacherSalary`, `Transaction` (general ledger; `TxnCategory` distinguishes
Fee/Salary/Utility/Infrastructure/Other). IDs referenced in the API (`studentId`, `teacherId`, `classId`,
etc.) are human-readable business keys (e.g. `STU########`, `TCH########`) distinct from Mongo `_id`s —
check a module's service layer for which one a given endpoint expects.

## Frontend architecture

Feature-first layout under `frontend/src/modules/<Role>/pages/*.tsx` (Admin/Auth/Student/Teacher/Home/
Contact), routed in `frontend/src/routes/index.tsx` via `react-router-dom`'s `createBrowserRouter`, each
role's routes nested under a `*RouteWrapper` (`components/layout/route-wrappers.tsx`). **These wrappers
currently do not check auth or role at all** — they just render `<AppLayout role="...">` — despite the name
suggesting otherwise; this is a known gap (ALIGNMENT_PLAN.md Part 0.5/A1, Part 3.1), not something to build
on. Shared primitives live in `components/ui/` (shadcn/ui components — see `components.json`) and
`components/layout/`. Path alias `@` → `frontend/src` (`vite.config.ts`).

- API calls go through `lib/api.ts`'s `apiClient` (axios, `withCredentials: true`, baseURL from
  `VITE_API_URL`), with a response interceptor that transparently retries once via `POST /user/refresh` on
  a 401 (skipped for the login/refresh calls themselves). Per-domain wrappers live in
  `lib/services/*.service.ts` (`admin.service.ts`, `auth.service.ts`, `student.service.ts`,
  `teacher.service.ts`, `contact.service.ts`) — add new endpoints there rather than calling `apiClient`
  directly from a page. Every method is a one-liner over `lib/api/typed-client.ts`'s
  `api(someContract.operation, { params?, query?, body? })` — no manual response typing; `api()` already
  unwraps the envelope and returns data typed from the contract. There's no hand-typed fallback path
  anymore (`frontend/src/lib/types.ts` was deleted in Phase 3) — a genuinely new, not-yet-contract-backed
  endpoint would need its own local type in the page/service that calls it.
- Data fetching/mutation uses `@tanstack/react-query`; forms use `react-hook-form` + `@hookform/resolvers`,
  with `zodResolver` taking the relevant contract's body schema directly (e.g.
  `zodResolver(CreateStudentBody)` from `@schoolerp/contracts`) — that's the same schema the backend
  validates against, so there's nothing to keep in sync by hand.
- As of Phase 6 (2026-08-24), every page in `Admin/*`, `Teacher/*`, and `Student/*` is wired to real
  data — no mock/sample arrays left anywhere in the app. A prior version of this file claimed
  `Teacher/Attendance.tsx` and `Teacher/Results.tsx` were wired back in Phase 3 — that was never
  actually true (both were 100% hardcoded roster/exam data with no `useQuery` at all, confirmed when
  Phase 6 went to build on top of them). Take that as a caution, not an assurance: don't treat a
  "wired" claim anywhere in this file as verified without spot-checking the actual page for a
  `useQuery` call, since this file can drift from the code and has before.

### Windows filesystem case sensitivity

All `frontend/src/modules/*` directories (`Admin`, `Auth`, `Contact`, `Home`, `Student`, `Teacher`) are
PascalCase both in git and on disk, matching every import (`@/modules/Admin/pages/...`). Earlier this
repo's history had a mismatch (on-disk lowercase vs. git-tracked PascalCase, from commit `68af462`'s
partial fix); that's been fully resolved — don't reintroduce lowercase module directories.

If a future rename ever needs revisiting: on Windows' case-insensitive filesystem, plain `mv`/rename of a
*file* to a different case works fine, but renaming/deleting a *directory* in place to change only its case
can fail with `Access is denied` even with full ACL permissions (observed here — root-caused to something,
possibly OneDrive's sync engine since this repo lives under `OneDrive\Documents\...`, holding a persistent
handle on the directory object itself). PowerShell `Rename-Item` and `Remove-Item` hit this; git bash's
`mv`/`rmdir` did too for the exact locked directory. The reliable fix: move the directory's *contents* out
to a sibling temp dir, `rmdir` the now-empty original, `mkdir` a fresh directory with the correct casing,
then move the contents back in — recreating the directory object from scratch sidesteps whatever held the
lock on the old one.
