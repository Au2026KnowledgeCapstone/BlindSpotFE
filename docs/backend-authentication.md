# Frontend backend-cookie login integration

## Setup (localhost consistently)

The backend must use the existing Supabase project. Do not create a new project
or accounts to run automated tests. Keep existing local environment files and
Supabase helper configuration: signup/recovery still use them.

Add this line to your existing frontend `.env.local` locally, or create that file
if absent. Do not replace its other values:

```dotenv
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

`.env.example` provides this non-secret example; no existing `.env` files were
changed. Restart Next.js after setting it. Public Next environment values are
compiled into the browser bundle; production requires a build with the actual
HTTPS API origin. The URL must be an origin without a path, query or credentials.
HTTP is accepted only for localhost development, not 127.0.0.1.

Backend variables (configure locally in BlindSpotBE; do not paste values in chat):

- `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY`: same project as the existing frontend.
- `APP_ENV=development`.
- `AUTH_FRONTEND_ORIGINS=http://localhost:3000`.
- `AUTH_BACKEND_ORIGIN=http://localhost:8000`.
- `AUTH_COOKIE_SAMESITE=lax`.

See `BlindSpotBE/docs/authentication.md` for the full backend contract and cookie
retention options. No backend security or cloud settings were changed here.

Backend terminal:

```bash
cd /Users/vanshika/Desktop/capstone/BlindSpotBE
# If dependencies are not installed:
make initialize
make run
```

Frontend terminal:

```bash
cd /Users/vanshika/Desktop/capstone/BlindSpotFE
npm ci
npm run dev -- --hostname localhost --port 3000
```

Use http://localhost:3000 and http://localhost:8000; do not mix localhost with
127.0.0.1. Stop an older local development process yourself if its port is occupied.

## Implemented contract

- Login: `POST /auth/login` with `{email,password}`. A successful result contains
  `{user:{id,email},authenticated:true,confirmation_required:false}`; it does not
  contain a Supabase `session`. The form keeps its validation/design and redirects
  to the existing `/projects/acme-corp` URL.
- Identity: `GET /auth/me`, returning `{id,email}`. No user identity is persisted
  in browser storage or trusted from the old Supabase session.
- Logout: `POST /auth/logout` with `{}`. The existing Log out button is now exposed
  next to Theme in the application header and returns to `/login` on success.
- Every request includes `credentials: "include"` and `cache: "no-store"`.
  Mutations include JSON and `X-CSRF-Protection: 1`. The browser sets Origin;
  the backend validates it separately from credentialed CORS. There is no CSRF
  token to read, store or copy from cookies.
- The backend owns all access/refresh cookies (HttpOnly, and Secure in production).
  Frontend code never reads cookies, sets an Authorization header, receives
  backend tokens in its public response model, or writes tokens to localStorage.
  Theme storage remains unrelated and unchanged.
- Success responses are validated and projected to the user/flag schema. Error
  bodies are not displayed/logged; outages are distinguished from login rejection.
  Requests time out after 15 seconds and failed password submissions are not retried.

## Session checks and bounded refresh

This checkout had no active middleware/proxy session guard or SDK refresh
integration for application pages. The `(app)` layout now uses a client-side
`RequireSession` guard. It checks identity on mount/reload and route changes;
focus, visibility, pageshow/back-forward restoration and session-change events
recheck it. Auth failures hide application children and redirect to `/login`.
Service outages show a verification error, without claiming credentials are
invalid or entering a redirect loop. Reload or refocus can retry manually.

Only a 401 from `/auth/me` can trigger `POST /auth/refresh` with `{}`; success is
followed by one `/auth/me` retry. Refresh rejection or a second 401 ends the check.
Non-401 errors do not trigger refresh, and there is no periodic retry timer.
Concurrent identity lookups in one tab share a promise. Login, logout and
identity/refresh are serialized in one tab and through a named **Web Lock** across
same-origin tabs. Each tab checks `/auth/me` inside the lock before considering
refresh, so queued tabs can use cookies already rotated by an earlier tab. Logout
waits for an in-flight refresh before clearing the session. BroadcastChannel
notifies other open application tabs using a non-secret session-change marker.

On browsers without Web Locks, login/logout and valid access cookies still work,
but automatic refresh is disabled and expired sessions require login again. This
fails closed rather than risking refresh-token reuse across tabs. Use a modern
browser on localhost or HTTPS. Cross-origin frontend installations do not share
Web Locks and need separate production coordination. Network loss during refresh
and the backend's rotation/reuse policy still require deployment-level testing.

The guard is UI behavior, **not server authorization**. Next.js Server Components
are not made authenticated by this browser guard, and backend feature endpoints
and internal callbacks remain unsecured as documented in the backend. Add
server-side authorization before returning private feature data. Current feature
pages still use fixtures; this work does not migrate feature/data APIs.

## Signup and recovery remain separate

The Supabase helpers, signup form, forgot-password page, reset-password page,
confirmation/recovery handling, and SDK configuration are retained. They continue
to create/use the old Supabase SDK session; they do not create the backend cookies.
After confirming signup, explicitly sign in through the login form to establish
backend authentication. A signup-created SDK session alone cannot pass the new
application guard. A backend login alone cannot authorize the legacy SDK's password
update/recovery calls; use their existing recovery-link flow.

Backend logout only logs out the backend session. It does not sign out a retained
legacy SDK signup/recovery session. The recovery page still signs out its SDK
session after updating the password, and does not log out backend cookies. These
sessions must be unified when confirmation/recovery callbacks migrate; this is
**not a complete auth migration**. Existing SDK flows may retain their own session
representation; no backend tokens are transferred to them. Issued access JWTs may
remain usable until expiry after logout; an upstream logout outage clears local
backend cookies without guaranteeing remote revocation.

## Automated checks

```bash
npm run test
npm run typecheck
npm run lint
# Focused mocked backend/UI checks:
npm run test -- src/features/auth/services/backend-auth.test.tsx
```

The integration tests use synthetic data and mocked fetch responses, never real
Supabase credentials. They cover CSRF/request settings, login schema, identity
checks after reload, failures/outages, single refresh with bounded retry,
independent tab instances sharing a lock, logout ordering, UI navigation/guard,
no token exposure/storage, and retained signup/recovery SDK calls. Browser cookie
acceptance and real Supabase/email flows must be checked manually. The existing
Playwright fixture demo stubs `/auth/me` so its fixture pages remain accessible;
run that demo against a frontend configured with NEXT_PUBLIC_API_BASE_URL.

## Manual test

1. Start both applications using the localhost commands above; open a modern
   browser at http://localhost:3000/login. Use an existing confirmed account.
2. Submit the unchanged login form. In Network, verify `/auth/login` returns 200,
   request headers include `X-CSRF-Protection: 1`, JSON contains user/flags and
   no tokens, and navigation goes to `/projects/acme-corp`. Do not copy/share
   request payloads or cookie values from DevTools.
3. In Application/Cookies, check the backend cookie names and HttpOnly attributes
   without copying their values. Local development cookies are bs_access and
   bs_refresh; Secure production cookies use __Host- prefixes.
4. Reload the application page. Verify `/auth/me` succeeds and the page stays
   open. Open a second tab and reload it too. No browser storage token is needed.
5. To exercise refresh without waiting, delete only the access cookie using the
   browser cookie UI, leaving the refresh cookie intact. Reload: expect `/auth/me`
   401, `/auth/refresh` 200 and `/auth/me` 200. Repeatedly failing refresh must
   return to login, rather than making endless requests.
6. Click **Log out** in the application header. Verify `/auth/logout` succeeds,
   cookies are deleted, and `/login` is shown. Revisiting/reloading an application
   page should return to login. Other open application tabs should recheck too.
7. Stop the backend and try login: expect a connection/service message and no
   redirect loop. Restart it before continuing. Signup and recovery must be
   tested separately under the temporary compatibility limitations above.
