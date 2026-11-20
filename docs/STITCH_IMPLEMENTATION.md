# Stitch frontend reference

Source: https://stitch.withgoogle.com/projects/13763254151213275367

The current Stitch screens supersede the older compact, blue-navigation layout in DESIGN.md for page composition. The app uses a white sidebar, charcoal active navigation and primary actions, a cool gray canvas, large white rounded cards, and pill-shaped inputs and actions.

| Route | Stitch reference |
| --- | --- |
| `/projects/:id` | Overview (Integrated Shell), screen `d78cdcffed1440e79b45837ed6bbdf58` |
| `/projects/:id/requirements` | Requirements, screen `548e1d02a72440e5a131fd3adfb40197` |
| `/projects/:id/runs` | Test Runs & Telemetry, screen `43a58f4c43224a06bf41c91afb69bf3c` |
| `/projects/:id/setup` and `/environments` | Project Setup & Environments, screen `3e62b4e63a28419680a03ad4106eac90` |
| `/projects/:id/members` | Team & Collaboration, screen `c199a5354d2f4e1ebdf1e00d2a5eeb29` |
| `/account/settings` | Account Settings, screen `31e25be6c32640c5b2e1646925a38ece` |
| Authentication routes | Login, Sign Up, Forgot Password, Reset Password |

Application data replaces sample names, counts, results, and environments. Missing backend fields such as member email, seat limits, 2FA status, commit metadata, and runner health are not fabricated. Profile display name, avatar, and timezone are device-local preferences scoped by account email; they do not update the server identity. The requirements library and import dialog follow the v2 frontend: BRD and SRS are uploaded with an optional design specification to POST /projects/:id/imports as multipart form data. GitHub imports are shown as unavailable because the current backend has no GitHub-import endpoint. Source excerpts, acceptance criteria, and approval actions are shown in a separate details dialog. Telemetry uses verdicts from up to 50 recent completed runs and discloses how many results are available.

`e2e/stitch-pages.spec.ts` checks the overview composition, requirement search/tabs/pagination, environment selection, member search, profile persistence, telemetry, and narrow viewports with isolated API fixtures. It also captures desktop screenshots under `/tmp/stitch-*-desktop.png`.

## Project setup refresh

Setup now groups application/environment counts, target selection, authentication, and verification into a single workflow. New applications and new/edit environment forms use native dialogs. Public targets can be verified without credentials; authenticated targets use write-only credentials, an explicit success selector, and optional login selectors. Verification errors remain distinct from successful saves. Environment-specific links to test runs retain the selected target. Network allowlists and live-browser configuration from v2 are not exposed because the current backend does not implement that contract.

## Final interface refinements

Dashboard shows the project directory and opens project creation in a native modal; new projects enter Project Setup. Navigation omits Settings and Environments, and the header shows the current project without a switcher. Setup focuses on environment cards, collapsible credentials, and a compact verification action; required application records are managed automatically. Team uses supplied member names with a signed-in email fallback and member-only invitations.

Test Runs places the requirement composer beside Runs Summary, with outcome-filtered history below. Reports show the overall verdict and requirement results without charts, metadata cards, timeline, screenshot displays, or live browser connections. Session rechecks preserve the authenticated layout during navigation. Profile names remain device-local; the proposed shared first/last-name change was cancelled.
