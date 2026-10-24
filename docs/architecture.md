# OctoFit Tracker architecture

OctoFit Tracker is a three-tier application for a school fitness program. The starter code includes API contracts and intentionally incomplete implementation points so you can use GitHub Copilot agent mode in a test-driven loop.

![Three-tier OctoFit architecture](../.github/images/octofit-architecture.svg)

## Tier boundaries

- **Presentation tier**: React 19, Vite, React Router, Bootstrap, and a shared API client in `octofit-tracker/frontend/src`.
- **Logic tier**: Express and TypeScript routes/services in `octofit-tracker/backend/src` expose `/api/*` behavior on port `8000`.
- **Data tier**: Mongoose models and seed data in `octofit-tracker/backend/src/models` and `src/scripts/seed.ts` persist to MongoDB on port `27017`.

## Ports and environment rules

- MongoDB: `27017`
- Express API: `8000`
- Vite frontend: `5173`
- The browser calls relative `/api` paths. Vite proxies them to `http://localhost:8000`, so the unauthenticated API port stays private in Codespaces. `VITE_API_BASE_URL` can override the base URL.

## API contract

| Capability | Method and path | Expected behavior |
| --- | --- | --- |
| Activity tracking | `GET /api/activities`, `POST /api/activities` | List and create valid activity records. POST accepts `userId`, `teamId`, `type`, and `minutes`; `userId` and `teamId` must be well-formed IDs for an existing user and team; otherwise respond with a deliberate 4xx (never a 500 from a cast error). A created activity stores the submitted `user`, `team`, `type`, and `minutes` plus computed `points` and `occurredAt`. |
| Teams | `GET /api/teams`, `POST /api/teams` | List and create teams with members. Created and listed teams keep the submitted `name` and `mascot`. Reject a team without a name with `400`. |
| Leaderboard | `GET /api/leaderboard` | Return teams ordered by the sum of their activity points, highest first. Each entry has `teamName`, `totalPoints`, and a 1-based `rank`. |
| Workout suggestions | `GET /api/workouts/suggestions/:userEmail` | Recommend workouts from recent activity patterns for the matching seeded user's email address. The first suggestion's `focus` matches that user's goal or recent activity, with a `reason` explaining why. An email with no matching user returns a deliberate 4xx (for example, `404`). |

## Implementation decisions

Record your plan here before editing code.

- Presentation tier decision: Keep route-level views and rendering in React components; use the shared API client for relative `/api` requests. Each view handles loading, empty, success, and accessible error states without embedding business or persistence logic.
- Logic tier decision: Keep route handlers thin and put validation and capability behavior in `octofitService.ts`. Convert invalid input, malformed or missing references, and unknown users into deliberate 4xx responses rather than uncaught Mongoose errors or 500s.
- Data tier decision: Use Mongoose schemas for required fields, references, and defaults (including an empty team-members array). Keep seed operations idempotent and additive so unrelated existing records are retained.
- Activity tracking approach: Validate the user and team IDs and confirm both records exist before creating an activity. Require a supported activity type and positive minutes, compute points deterministically as one point per minute, and assign `occurredAt` on the server.
- Team management approach: Require a non-empty name, preserve the submitted name and mascot, and default members to an empty array. Accept member IDs for creation without replacing or deleting unrelated team/user records.
- Leaderboard approach: Sum activity points per team, include teams with no activity at zero, sort by total points descending with team name as a stable tie-breaker, and assign 1-based ranks.
- Workout suggestions approach: Find the user by email or return 404. Prefer the user's most recent activity type as the focus signal, falling back to their fitness goal; rank matching workouts first and include a reason tied to that signal.

## Test plan

Record the commands you run and what each failure means.

- Data-tier command: `npm run test:data --prefix octofit-tracker/backend` checks model validation/defaults and repeatable, non-destructive seeding. Baseline run: 4 failed, 1 passed; failures mean one or more schema contracts are not enforced or the seed contract regressed.
- API command: `npm run test:api --prefix octofit-tracker/backend` checks request validation, persistence, ordering, and recommendation behavior through HTTP. Baseline run: 4 failed; latest run: 4 passed. Failures indicate missing service behavior, incorrect response status/data, or a broken API contract.
- Frontend command: `npm test --prefix octofit-tracker/frontend` checks API-backed content and loading, empty, and accessible error states for each view. Baseline run: 15 failed; failures indicate incomplete UI integration or a presentation contract regression.
- Backend build command: `npm run build --prefix octofit-tracker/backend` checks TypeScript compilation. Not run yet; failures indicate backend type errors that must be resolved before integration.
- Frontend build command: `npm run build --prefix octofit-tracker/frontend` checks frontend TypeScript compilation and the Vite production bundle. Not run yet; failures indicate frontend type or bundling errors.
