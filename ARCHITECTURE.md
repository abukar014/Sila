# Sila — Architecture Overview

_Last updated: May 2026_

---

## What Sila Is

Sila is a verified provider directory for licensed mental health and medical professionals. It connects clients to vetted clinicians without acting as a middleman — no PHI passes through the platform. Providers list their practice once, get verified once, and receive inquiries directly.

The platform has two sides:
- **Providers** — licensed clinicians who apply, get credentialed, and maintain a public profile
- **Admins** — Sila staff who review applications, run verification checks, and make approval decisions
- **Clients** (future) — end users who search the directory and contact providers directly

---

## Tech Stack

| Layer | Tool |
|---|---|
| Framework | Next.js 16 (App Router) |
| Database + Auth | Supabase (Postgres + Supabase Auth) |
| Email | Resend |
| External APIs | NPPES, OIG LEIE, SAM.gov |
| Hosting | Vercel |
| Language | TypeScript |

---

## Database Tables

### `providers`
The core table. One row per provider. Created at account signup, filled in progressively through onboarding.

Key fields:
- `id`, `user_id` — links to Supabase auth user
- `name`, `email`, `slug`
- `npi`, `dob`, `license_number`, `license_type`, `state`
- `verification_status` — `pending` | `in_review` | `verified` | `excluded`
- `status` — `active` | `inactive`
- `verified`, `verified_date`
- `bio`, `pull_quote`, `photo_url`, `scheduling_url`
- `specialties`, `languages`, `insurances`, `gender`
- `telehealth`, `in_person`, `accepting_clients`
- `faith_approach`
- `verification_notes` — internal admin notes, not shown to provider

### `verification_logs`
Append-only audit log. Every check run and every decision made writes a row here.

Key fields:
- `provider_id`, `check_type`, `result`, `raw_output`
- `check_type` values: `nppes`, `leie`, `sam`, `state_license`, `decision`, `credential_edit`
- `result` values: `clear`, `flagged`, `review_required`, `excluded`, `verified`, `updated`, `in_review`

### `flagged_npis`
Permanent NPI blocklist. Once an NPI is here, no account can register with it again regardless of email.

Key fields:
- `npi` (primary key), `provider_name`, `provider_id`, `reason`, `flagged_by`, `flagged_at`

---

## Provider Onboarding Flow

1. **Home (`/`)** — Sila splash screen. Two entry points: Find a Provider (client-side, future) and List Your Practice (provider onboarding).
2. **Provider Landing (`/provider`)** — Explains the value prop and verification process. Links to Get Started or Sign In.
3. **Account (`/onboarding/account`)** — Full name, work email, password. Creates Supabase auth user and inserts a `providers` row with `verification_status: pending`.
4. **Credentials (`/onboarding/credentials`)** — NPI, date of birth, license number, license type, state. PATCHes the provider row.
5. **Profile (`/onboarding/profile`)** — Bio, specialties, languages, faith approach, gender, telehealth/in-person, accepting clients.
6. **Scheduling (`/onboarding/scheduling`)** — Scheduling URL and photo URL.
7. **Done** — Provider lands in the admin Queue with `verification_status: pending`. They see a "pending review" state in their dashboard.

`sila_provider_id` is stored in `localStorage` after account creation and used to identify the provider across all onboarding steps and the dashboard.

---

## Provider Dashboard (`/dashboard`)

Providers see their current verification status and profile summary after signing in. States:

- **Pending** — application received, under review
- **In Review** — flagged for additional verification, provider may have been asked to resubmit credentials
- **Excluded** — account ineligible, NPI permanently blocked
- **Verified + Active** — profile live in directory

Sign-in (`/onboarding/sign-in`) uses Supabase `signInWithPassword`, looks up the providers row by `user_id`, and stores `sila_provider_id` in localStorage.

---

## Admin Dashboard (`/admin`)

Protected by `proxy.ts` — all `/admin/*` and `/api/admin/*` routes require an `Authorization: Bearer <ADMIN_SECRET>` header. The admin login page (`/admin/login`) sets this in a cookie.

### Four Tabs

| Tab | Filter | Meaning |
|---|---|---|
| Queue | `verification_status = pending` | New applications awaiting first review |
| In Review | `verification_status = in_review` | Flagged for additional verification |
| Excluded | `verification_status = excluded` | Permanently blocked (NPI on blocklist) |
| Verified | `verification_status = verified` | Approved and live |

### Provider Detail Page (`/admin/providers/[id]`)

Two-column layout:
- **Left** — Provider Profile: all submitted fields read-only, plus a collapsible "Correct credentials" editor at the bottom
- **Right** — Verification Panel: run checks, view results, make decisions

---

## Automated Verification Checks

All three checks are triggered manually by admin from the provider detail page. Results are stored in `verification_logs`.

### NPPES (National Provider Registry)
- Verifies the submitted NPI exists and matches the provider's name
- Pulls `gender` from registry and writes it to the providers row if currently null
- Result: `clear` (NPI matches name) or `flagged` (mismatch or not found)

### OIG LEIE (HHS Exclusion List)
Confidence scoring — does NOT auto-block. Returns a result for admin to evaluate.

| Match | Result |
|---|---|
| NPI match | `excluded` |
| DOB match | `excluded` |
| Name + 2 corroborating fields (state, specialty) | `excluded` |
| Name + 1 corroborating field | `review_required` |
| Name only, other fields mismatch | `review_required` — "likely different individual" |
| No match | `clear` |

### SAM.gov (Federal Exclusions)
- Searches by name against active federal exclusions
- Cross-references state if available
- Name + state match → `excluded`; name only → `review_required`; no match → `clear`

### State License
Manual step — admin verifies on the state board website and clicks "Mark verified." Quick links to TX Medical Board, TX BHEC, TX Board of Nursing, TX Dental Board are provided.

All four checks must be completed before the "Approve provider" button is enabled.

---

## Decision Workflows

### Approve
- Sets `verification_status: verified`, `status: active`, `verified: true`, `verified_date: today`
- Email: "You're live on Sila"

### Move to In Review
- Sets `verification_status: in_review`, `status: inactive`
- Admin writes an internal note (stored in `verification_notes`, never shown to provider)
- Optional checkbox: "Email provider asking them to submit corrected credentials"
  - **Unchecked** → email: "under additional review, we'll be in touch in 2–3 days"
  - **Checked** → email: "action needed — reply with correct NPI, DOB, license number, state"

### Confirm Exclusion & Block NPI
- Admin must manually check a confirmation checkbox before the button activates
- Sets `verification_status: excluded`, `status: inactive`
- Inserts NPI into `flagged_npis` (permanent block — survives account deletion)
- Email: exclusion notice with specific registry match details, 5-day dispute window

---

## Credential Correction Flow (In Review)

When a provider submits incorrect credentials (wrong NPI, typo in DOB, etc.):

1. Admin moves provider to In Review, checks "request corrections" box
2. Provider receives email asking them to reply with correct NPI, DOB, license
3. Admin receives corrected info, opens provider detail page
4. Expands "Correct credentials" section at the bottom of the Provider Profile card
5. Updates NPI, DOB, license number, license type, and/or state
6. Save writes the changes and logs a `credential_edit` entry to `verification_logs`
7. Admin re-runs NPPES, LEIE, SAM checks with the corrected data
8. If clear → approve. No account recreation needed.

---

## Email Triggers (via Resend)

| Event | Subject | Route |
|---|---|---|
| Approved | "You're live on Sila" | `/api/admin/providers/[id]/decision` |
| In Review | "Your Sila application — additional review underway" | `/api/admin/providers/[id]/decision` |
| In Review + correction request | "Action needed — please verify your credentials with Sila" | `/api/admin/providers/[id]/decision` |
| Excluded | "Your Sila application — account status" | `/api/admin/providers/[id]/flag` |

Requires a verified Resend domain for production. The `resend.dev` test domain only delivers to the Resend account owner's email.

---

## Access Control

### Admin
- `proxy.ts` intercepts all `/admin/*` and `/api/admin/*` requests
- Checks for a valid `admin_token` cookie set at login
- Cookie value must match `ADMIN_SECRET` env var
- No Supabase auth involved — intentionally simple for internal tooling

### Providers
- Supabase Auth handles sign-up and sign-in
- After auth, `sila_provider_id` stored in `localStorage`
- All provider-facing API calls (`/api/onboarding/[id]`) use this ID to scope updates
- Supabase Row Level Security (RLS) should be enabled on `providers` for production

---

## Environment Variables

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase public key (client-side) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase admin key (server-side only) |
| `RESEND_API_KEY` | Resend API key for email sending |
| `RESEND_FROM_EMAIL` | From address — must be a verified domain for production |
| `SAM_API_KEY` | SAM.gov API key for federal exclusion checks |
| `ADMIN_SECRET` | Password for admin dashboard access |
