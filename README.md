# BlindSpot Frontend

BlindSpot uses the Next.js App Router with React and TypeScript. Application
routes live in `src/app`. Fonts are Inter and JetBrains Mono, loaded through
`next/font/google`.

## Local setup

Use Node.js 22 (see `.nvmrc`). If `nvm` is unavailable in your terminal,
load it first. Then select the project's version before installing dependencies
or starting the app:

```bash
source "$HOME/.nvm/nvm.sh" # only needed when the nvm command is unavailable
nvm use
npm ci
```

Use `.env.example` as a configuration reference. Add missing variables to your
existing local environment file without overwriting its other settings:

- `NEXT_PUBLIC_API_BASE_URL=https://api.example.com`: HTTPS FastAPI backend origin. Explicit `http://localhost` is accepted for isolated previews and local development; deployed environments must use HTTPS.
- `NEXT_PUBLIC_SUPABASE_URL`: existing Supabase project's URL.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: that project's publishable key.

The Supabase variables remain necessary for existing SDK-backed features. Signup,
password recovery and project tenancy use the FastAPI backend. Use the same
Supabase project in both repositories. Keep real environment values out of
version control; `.env.example` contains placeholders. Restart Next.js after
changing public environment variables.

Start the configured backend in a separate terminal:

```bash
cd /Users/vanshika/Desktop/capstone/BlindSpotBE
make run
```

Start the frontend from BlindSpotFE:

```bash
npm run dev -- --hostname localhost --port 3000
```

Open http://localhost:3000/login. Use **localhost for both applications**:
frontend `http://localhost:3000`, backend `http://localhost:8000`. Do not mix
localhost with 127.0.0.1. The backend must allow `http://localhost:3000` through
its explicit auth-origin configuration. See the
[backend-authentication guide](docs/backend-authentication.md) for complete
backend setup, CSRF/session contracts, refresh behavior, and manual tests.

## Authentication and current limitations

The backend authentication integration uses POST `/auth/login`, GET `/auth/me`,
POST `/auth/refresh`, and POST `/auth/logout`. Login consumes user information
and authentication flags, not Supabase session tokens in JSON. Requests include
credentials; mutations send JSON and `X-CSRF-Protection: 1`. Access and refresh
tokens are held in backend HttpOnly cookies rather than frontend localStorage.
The application layout uses `RequireSession` for browser-side identity checks;
it does not secure backend feature endpoints or authenticate Server Components.

Signup, email confirmation, recovery requests and password updates use the same
backend cookie session with backend-owned PKCE. Keep the shared Supabase email
templates unchanged, and add the backend callback allowlist patterns documented
in [the authentication guide](docs/backend-authentication.md). The backend exchanges
authorization codes and stores tokens only in HttpOnly cookies. Password resets
require a server-issued recovery permission bound to the recovered session.

The `/workspace` route redirects to the authenticated, backend-cookie project
directory. Project setup reads applications, environments, saved scan requests,
and recorded results through `GET /projects/{pid}/workspace`; scan creation
records a queued request only. The team flow API and execution/engine endpoints
remain unavailable, so flows/runs/details show explicit unavailable states and
never treat fixtures as customer results. Fixtures remain test-only. The run
trace detail UI components remain intact for use when real execution data is
available. Server
endpoints remain authoritative for project, invitation and membership authorization;
project setup and member writes are shown only to owners/admins.

## Checks

```bash
npm run test
npm run typecheck
npm run lint
npm run test -- src/features/auth/services/backend-auth.test.tsx
```

Auth integration tests use mocked backend responses and synthetic data. For
manual login, page-reload, refresh and logout checks, follow the
[manual test instructions](docs/backend-authentication.md#manual-test).

## Next.js resources

- [Next.js documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)
- [Next.js source](https://github.com/vercel/next.js)
