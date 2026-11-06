# BlindSpot Frontend

BlindSpot uses the Next.js App Router with React and TypeScript. Application
routes live in `src/app`. Fonts are Inter and JetBrains Mono, loaded through
`next/font/google`.

## Local setup

Use Node.js 22 (see `.nvmrc`) and install dependencies:

```bash
npm ci
```

Use `.env.example` as a configuration reference. Add missing variables to your
existing local environment file without overwriting its other settings:

- `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000`: FastAPI authentication backend.
- `NEXT_PUBLIC_SUPABASE_URL`: existing Supabase project's URL.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: that project's publishable key.

The Supabase variables remain necessary for signup, password recovery, and the
SDK-backed workspace. Use the same Supabase project in both repositories. Keep
real environment values out of version control; `.env.example` contains only
placeholders. Restart Next.js after changing public environment variables.

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

Signup, confirmation/recovery handling, and password updates still use the
Supabase SDK and its separate session. The `/workspace` page also uses direct
Supabase SDK authentication/data access; backend cookie login alone does not
establish that SDK session. Backend logout does not clear a retained SDK session.
After confirming signup, sign in through the login page for backend cookie
access to the application. These flows still need to be unified; the complete
authentication migration is not finished.

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
