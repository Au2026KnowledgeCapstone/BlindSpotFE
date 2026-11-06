# Frontend backend-cookie authentication with PKCE

Signup, login, current-user lookup, recovery requests, password updates, refresh
and logout use FastAPI. Authorization-code exchange happens only in the backend.
Main's account menu, account settings, form styling and page URLs are preserved.
Session tokens and PKCE verifiers never enter frontend JSON or localStorage.

## Local setup and shared-project callbacks

Keep existing local environment files. Frontend `.env.local` needs:

```dotenv
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

Backend local settings use the existing Supabase project and publishable key:
SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, APP_ENV=development,
AUTH_FRONTEND_ORIGINS=http://localhost:3000,
AUTH_BACKEND_ORIGIN=http://localhost:8000,
AUTH_EMAIL_FRONTEND_ORIGIN=http://localhost:3000, AUTH_COOKIE_SAMESITE=lax.
AUTH_FLOW_ENCRYPTION_KEY must be a persistent Fernet key shared by backend workers.
The backend authentication guide explains generating it without printing it or
overwriting existing values. Install updated backend requirements first.

Keep shared Supabase email templates unchanged, using their existing standard
ConfirmationURL links. In the existing project's Authentication → URL
Configuration, manually ADD these narrowly scoped patterns; retain all other
clients' entries and the Site URL:

```text
http://localhost:8000/auth/callback/signup/*
http://localhost:8000/auth/callback/recovery/*
```

Each actual callback URL ends in a random 32-character transaction ID. The
single-segment wildcard is needed for simultaneous requests; it is confined to
these trusted backend paths. Production uses your exact HTTPS backend origin
with the same path patterns. No arbitrary redirect or `next` URL is accepted.
No templates, dashboard settings or real emails were changed by this code.

```bash
# Backend terminal
cd /Users/vanshika/Desktop/capstone/BlindSpotBE
make initialize
make run

# Frontend terminal
cd /Users/vanshika/Desktop/capstone/BlindSpotFE
npm ci
npm run dev -- --hostname localhost --port 3000
```

Use localhost for BOTH apps (3000/8000), not 127.0.0.1. Restart Next after public
environment changes. Retain SDK project variables for workspace consumers.

## Signup and recovery flow

The backend creates a random verifier and S256 challenge during signup/recovery
initiation. An encrypted HttpOnly transaction cookie binds the verifier to this
browser, its purpose and 15-minute expiry. Separate per-request cookies allow up
to eight overlapping flows without overwriting another tab's verifier.

The standard email link verifies the action at Supabase and redirects to the
backend with a code. Backend exchanges it using that browser's verifier, deletes
the transaction cookie on success/failure, and redirects to clean `/login` for
signup or `/reset-password` for recovery. Codes never reach a frontend callback
handler. There is no TokenHash fragment parser, custom email page or browser SDK
exchange fallback. Shared templates do not need custom link markup.

Signup handles user/authenticated/confirmation_required flags, including no
session when confirmation is required. Email confirmation is distinct from
establishing a browser session: after confirmation, users can log in normally
if automatic exchange cannot complete. Recovery requires the initiating browser;
if its transaction is missing, expired, invalid or already consumed, request a
new recovery email from the browser that will open it. Standard links retain
email-scanner/prefetch consumption risks.

## Recovery-specific authorization

A verified recovery exchange issues an encrypted, short-lived recovery permission
cookie bound to that user AND the returned access/refresh session. Only the
backend can create it. GET `/auth/recovery` verifies this permission and identity;
the reset page uses it before showing the form. A normal login, signup callback
or frontend flag cannot authorize POST `/auth/password/update`.

The grant expires after at most 10 minutes (capped by access expiry). A legitimate
refresh rebinds it to rotated tokens without extending its original expiry.
Password updates and logout clear it and cancel pending email transactions.
A successful password update clears local session cookies and offers login; if
remote logout fails after the change, its message explicitly reports that. Old
access JWTs may remain usable until expiry; there is no immediate all-device
revocation claim. Backend policy/nonce requirements still apply.

## Existing request and session security

Every frontend API call uses credentials:include and cache:no-store. Mutations
send JSON and X-CSRF-Protection:1; the browser supplies the explicit allowed
Origin checked by the backend. There is no readable CSRF token to store. CORS
remains credentialed with explicit origins, and backend session checks never
fall back to an old Supabase SDK session.

The GET email callback uses browser-bound PKCE verification instead of a custom
POST header that email navigation cannot provide. Safe fixed destinations,
transaction-purpose checks, expiry, authenticated encryption and Supabase code
verification remain mandatory. Backend callback query strings are removed from
ASGI scope, Uvicorn logs replace the entire callback target with [redacted], and
callback/auth responses have no-store/no-referrer headers. Proxies/APM must also
redact callback URLs before production; no such cloud changes are made here.

Login/logout and RequireSession behavior remain: me 401 permits one refresh and
one me retry, same-tab identity calls share a promise, and Web Locks serialize
same-origin tab mutations. Recovery checks similarly permit at most one refresh
on 401, while missing permission (403) fails closed without refreshing. Browsers
without Web Locks require login again after expiry. Existing UI guards do not
secure Server Components or backend feature endpoints.

## Checks and manual browser tests

```bash
npm run typecheck
npm run test
npm run test -- src/features/auth
npm run lint
```

Tests mock backend responses with synthetic data; no real credentials or emails
are used. Backend tests independently mock Supabase PKCE/challenges/code reuse.

1. Configure settings and the callback patterns above yourself. Keep templates
   unchanged. Start both apps, intentionally sign up with an address you control,
   and expect the check-email message without assuming a session.
2. Open its standard confirmation email in the initiating browser. It must pass
   through the backend and land on clean `/login` without code/verifier/token
   parameters. Sign in normally if needed; reload an application page and check
   `/auth/me`. Never copy/share callback URLs, request bodies or cookie values.
3. Request recovery at `/forgot-password`. Open that standard email in the same
   browser. `/reset-password` must check `/auth/recovery` before showing its form.
   Update matching passwords; then sign in with the new password and log out via
   the account menu.
4. Request two links and open them in reverse order: completing one must not
   delete the other's pending transaction. Try an expired/reused link or another
   browser without its cookie: recovery must fail safely and offer a new link.
5. Visit `/reset-password` with only an ordinary login: no reset permission/form
   should be granted. Test refresh/reload and confirm expiry is not extended for
   recovery permission. Logout must prevent pending callbacks restoring a session.
6. Inspect backend access logs for the redacted callback target, without codes or
   transaction IDs. Stop/restart the backend to test safe outage handling.

## Remaining limitations

PKCE requires the initiating browser/device. Pending flows/recovery grants are
invalidated by encryption-key rotation; all backend replicas need the same key.
Email delivery, project allowlists, production cookies and external log-redaction
need manual verification. A lost exchange response can consume a code; confirmed
signup users can log in, recovery users should request another link.

Workspace still uses Supabase SDK identity/database operations and its helpers
and packages remain for those consumers. A backend cookie session does not create
that SDK session; workspace/data migration, roles, feature authorization, AI,
CAPTCHA/MFA/reauthentication UI and deployment remain outside this task.

Full backend reference: `BlindSpotBE/docs/authentication.md`.
Official [Supabase PKCE documentation](https://supabase.com/docs/guides/auth/sessions/pkce-flow).
