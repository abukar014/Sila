# Sila — Design System Brief
> Source of truth pulled from live code (`apps/mobile/lib/tokens.ts` + all screen files) + phone screenshots, June 2026.
> **Ignore any `brand_assets/` folder** — it is outdated and does not reflect the current design.
> Screenshots are in the `sila-screens/` folder alongside this file. Filenames are prefixed by flow.

---

## What Sila Is

Muslim mental health provider directory. Connects clients to verified, culturally-aware Muslim therapists, counselors, and psychiatrists. Two user types:
- **Clients** — browse and book providers (no account required)
- **Providers** — licensed clinicians who apply, get verified, and manage their listing

**Brand voice:** Warm, human, calm. No corporate distance. No em dashes. Short sentences. Copy should feel like a trusted friend who happens to know mental health — not a startup. Avoid "seamlessly", "empower", "leverage". Error messages: plain and specific, never snarky.

---

## App Navigation Overview

The app has two distinct entry paths from one shared home screen:

```
Home (00-home.png)
  ├── "Find a provider"  → FLOW A: Client path
  └── "List your practice"  → FLOW B: Provider sign-up
                              └── returning providers: FLOW C (sign-in link on account screen)
```

Provider dashboard (Flow D) is only reachable after completing sign-up + verification, or by signing in.

---

## Color Palette

All colors are exact — no Tailwind defaults, no approximations.

```
Teal (primary)
  teal        #1A5C5A   primary interactive, icons, links, active states
  tealDeep    #134543   CTA button backgrounds, dark teal surfaces
  tealNight   #0E2C2A   deepest teal, home screen gradient start, dark banners
  tealMid     #2A5A5A   mid tone
  tealSoft    #4F8584   lighter teal, subtle accents

Clay (warm accent)
  clay        #A06A57   eyebrows, warm labels, section hints, borders, accents

Warm neutrals (backgrounds)
  paper       #FBF7EF   lightest warm white, glass card base
  sand        #F5EFE6   mid warm background
  line        #E2D9C7   dividers, borders on light surfaces

Ink (text)
  ink         #1F1B16   primary text
  ink70       rgba(31,27,22,0.70)
  ink54       rgba(31,27,22,0.54)   secondary text, labels
  ink36       rgba(31,27,22,0.36)   placeholder, disabled

Cream (text on dark surfaces)
  creamFull   #F5EFE6
  cream60     rgba(245,239,230,0.60)
  cream40     rgba(245,239,230,0.40)

Glass surfaces
  GLASS_BG    rgba(251,247,239,0.68)   glass card background
  glassPaper  rgba(236,228,214,0.82)
  glassWhite  rgba(255,255,255,0.62)
  glassDark   rgba(14,44,42,0.72)

Semantic
  verified    #3F6A58   "Open" status, verified badge
```

---

## Typography

Two font families only. No exceptions.

**Display / Editorial:** `Cormorant Garamond` — always Italic. Used for screen headlines, provider names, wordmarks, large decorative text. Feels refined, literary, human.

**UI:** `DM Sans` — all weights. Everything else: labels, body, buttons, inputs, metadata. Clean and readable at small sizes.

### Type Scale
```
Display (Cormorant Garamond Italic)
  displayXl   48px / lh 52  ls -1      splash wordmark
  displayLg   36px / lh 40  ls -0.8
  displayMd   28px / lh 34  ls -0.5
  displaySm   22px / lh 28  ls -0.3    sheet headers, welcome name

Body (DM Sans Regular)
  bodyLg      17px / lh 27
  bodyMd      15px / lh 23
  bodySm      13px / lh 21

Labels (DM Sans SemiBold/Bold)
  labelLg     15px / lh 22
  labelMd     13px / lh 20
  labelSm     11px / lh 17
  capsXs      10px / lh 15  ls 1.4  UPPERCASE   section eyebrows, field labels
```

### Exact font family strings (React Native fontFamily values)
```
CormorantGaramond_400Regular_Italic
CormorantGaramond_600SemiBold
DMSans_400Regular
DMSans_500Medium
DMSans_600SemiBold
DMSans_700Bold
```

---

## Spacing & Radius Tokens

```
Spacing: xs=4  sm=8  md=16  lg=24  xl=32  xxl=48  3xl=64
Radius:  sm=8  md=14  lg=18  xl=24  full=999
```

Card radius in practice: `16` (dashboard cards), `14` (form fields, provider cards, filter chips).

---

## Shadow System

All shadows are **clay-tinted** (`shadowColor: '#A06A57'`), never black.

```
subtle   offset(0,3)   opacity 0.10   radius 10   elevation 3    search bars, inputs
card     offset(0,6)   opacity 0.16   radius 18   elevation 6    provider cards, glass cards
float    offset(0,16)  opacity 0.18   radius 36   elevation 10   CTAs, bottom sheets
```

---

## Glass Card Pattern

Every card surface uses this exact layering — non-negotiable:

```
Layer 1 (bottom): BlurView  intensity=72, tint="light", absoluteFill
Layer 2:          glassHighlight  position absolute, top 0, height 1.5px, rgba(255,255,255,0.68)
Layer 3 (top):    Content

Container styles:
  backgroundColor: rgba(251,247,239,0.68)
  borderWidth: 1
  borderColor: rgba(160,106,87,0.28)   ← clay-tinted border
  overflow: 'hidden'                    ← required for BlurView clipping
```

JSX pattern — always in this order:
```jsx
<View style={[styles.card, shadow.card, glassBorder]}>
  <BlurView intensity={72} tint="light" style={StyleSheet.absoluteFill} />
  <View style={glassHighlight} />   {/* ALWAYS first child */}
  {/* content */}
</View>
```

---

## Background System

**Warm background** — all provider and client screens post-home:
```
LinearGradient colors={['#FBF7EF', '#F5EFE6', '#EEE5D3']} locations={[0, 0.5, 1]}
```

**Dark teal background** — home screen and pending/verification screen:
```
LinearGradient colors={['#0E2C2A', '#134543', '#1A5C5A', '#1F4A3E']} locations={[0, 0.28, 0.62, 1]}
```
With clay glow decoration: `width/height 280, borderRadius 140, backgroundColor #A06A57, opacity 0.14, top -60, right -40`

---

## Watermark

Every warm-background screen has the Arabic word **صلة** as a large decorative watermark:
```
position: absolute, top: -20, right: -20
fontFamily: DMSans_400Regular
fontSize: 180
color: #1A5C5A (teal)
opacity: 0.07  (some screens use 0.06)
zIndex: 0
aria-hidden
```
صلة (Sila) = "bond/connection" in Arabic. Purely decorative. Always top-right, always clipped by the screen edge.

---

## Screen Flows

### Screenshot naming convention
```
00        = shared entry point
A##       = Client path screens
B##       = Provider sign-up path
C##       = Provider auth (sign-in / password)
D##       = Provider dashboard + management
```

---

### 00 — Home Screen
**File:** `00-home.png`
**Background:** Dark teal gradient
**From:** App launch
**Goes to:**
- "Find a provider" → `A01` (client directory index)
- "List your practice" → `B01` (provider account creation)

**Layout:**
- Full-bleed dark teal LinearGradient
- Cream arch SVG shape (pointed arch, fills most of screen)
- Clay radial glow blob top-right (decorative, opacity 0.14)
- Logo area centered in upper arch: "Sila" in Cormorant 96px italic, "صلة" below in DM Sans 13px, tagline below that
- Two CTA cards pinned to bottom of arch:
  - "Find a provider" — solid tealDeep card, cream text, search icon
  - "List your practice" — glass card, dark ink text, + icon
- Terms/privacy footer text below cards

---

### FLOW A — Client Path

#### A01 — Directory Index (Category Picker)
**Files:** `A01-client-directory-index.png`, `A01b-client-directory-index-scrolled.png`
**From:** Home → "Find a provider"
**Goes to:** `A02` (location) — each category card pushes to location with a `type` param; "See all providers" skips category filter

**Layout:**
- "FIND A PROVIDER" eyebrow in clay capsXs
- Headline: "What type of help *are you looking for?*" — DM Sans Regular + Cormorant Italic for the accent words
- 5 category rows (glass cards with icon box + title + subtitle + → arrow):
  - Individual therapy / Family & couples therapy / Psychiatry / Clinical psychologist / See all providers
- Crisis line card at bottom (always visible): "Need immediate help? Call 988..."

#### A02 — Location / Zip Entry
**Files:** `A02a-client-location.png`, `A02b-client-location-scrolled.png`
**From:** A01 (any category tap)
**Goes to:** `A03` (provider list) — with zip param if entered, or without if skipped

**Layout:**
- "STEP 01 · LOCATION" eyebrow
- Clay location pin illustration (decorative, centered)
- Headline in Cormorant italic: "Where are you looking for care?"
- Zip code input field (glass card)
- "Find providers" CTA button (disabled/grey when empty)
- "Skip — show all providers" underline link
- Two feature callout cards below: "Find nearby providers" + "Private by default"
- Privacy note at bottom: "We use your zip code only to show nearby providers. It is never stored."

#### A03 — Provider Directory List
**File:** `A03-client-provider-list.png`
**From:** A02 (zip entered or skipped)
**Goes to:**
- "Filter" button → `A04` (filter sheet overlay)
- Tap any provider card → `A05` (provider bottom sheet)

**Layout:**
- Back button (teal, top left)
- Headline in Cormorant italic: "Find someone who *gets it.*" with "gets it." in teal
- Search bar: BlurView pill, magnifier icon, placeholder "Name, specialty, language…"
- Quick filter chips (horizontal scroll): Open · Telehealth · In-person — toggle on/off
- Results bar: green live dot + "N verified providers" count + Filter button (pill, shows count badge when active)
- Provider cards list (glass cards, 12px gap):
  - Circular avatar (52px, colored bg or photo), name, credentials, state
  - Specialty tags (first tag clay-tinted, rest teal-tinted)
  - Format + availability: e.g. "Telehealth · Open" or "Telehealth · Full for now"
  - › chevron

#### A04 — Filter Sheet
**Files:** `A04a-client-filter-active.png` (filters applied, "Show results · 4 active"), `A04b-client-filter-default.png` (no filters, "Done" button)
**From:** A03 → Filter button (fades in as full-screen modal)
**Goes to:** A03 (dismissed via Done / Show results / ✕)

**Layout:**
- Full-screen modal with fade animation (not a bottom sheet — fills entire screen)
- Background: warm LinearGradient (same as all warm screens)
- Header row: ✕ close button (clay-tinted pill) · "Filter" title · "Clear all" (clay text, only visible when filters active)
- 5 filter sections (each with section label in clay capsXs + glass card with chips):
  - **Category**: All / Therapy / Faith-integrated / Family & Couples / Psychiatry
  - **Format**: All / Telehealth / In-person
  - **Availability**: All / Open / Full for now
  - **Faith approach**: All / Faith-integrated / Faith-sensitive / Faith-neutral / Secular
  - **Focus area**: multi-select chips (Anxiety / Depression / Trauma / Grief / OCD / Couples / Family conflict / Postpartum / ADHD)
- Bottom CTA button:
  - No filters active: "Done" (solid tealDeep)
  - Filters active: "Show results · N active" (solid tealDeep)

#### A05 — Provider Bottom Sheet (Quick Preview)
**File:** `A05-client-provider-sheet.png`
**From:** A03 → tap any provider card (springs up from bottom)
**Goes to:**
- "View full profile →" → `A06` (public profile)
- "Back" → dismisses back to A03

**Layout:**
- Background list dims behind sheet
- Bottom sheet: BlurView glass, drag handle at top, spring animation from bottom
- Provider header: circular avatar + name (Cormorant italic) + credentials + modality
- Bio excerpt card (glass, 4 lines max)
- Details card (glass): Languages row + Insurance row
- "View full profile →" primary CTA (tealDeep, full width)
- "Back" secondary CTA (outline teal border)

#### A06 — Provider Public Profile
**Files:** `A06a-client-public-profile.png`, `A06b-client-public-profile-mid.png`, `A06c-client-public-profile-bottom.png`
**From:** A05 → "View full profile →"
**Goes to:**
- "Continue to scheduler →" → exits app to provider's external scheduling URL (Calendly, SimplePractice, etc.)
- "Go back" → back to A05

**Layout (scrollable, 3 visible states):**
- **Header (dark teal):** circular photo (96px) or initials avatar, provider name in Cormorant italic, credentials + state, "✓ Sila Verified" pill badge
- **Pull quote:** italic quote in Cormorant, separator line
- **Session info card:** Format / Languages / Availability rows
- **"ABOUT [NAME]" section:** bio in glass card
- **"FOCUS AREAS" section:** specialty chips
- **"TREATMENT APPROACHES" section:** approach chips (teal-tinted)
- **"INSURANCE & FEES" section:** glass card with in-network insurance checklist (✓ teal) + out-of-pocket fees table
- **Privacy note card:** "A NOTE ON PRIVACY" in clay capsXs — explains Sila won't see what happens after they leave
- **Sticky bottom CTAs:** "Continue to scheduler →" (tealDeep) + "Go back" (outline)

---

### FLOW B — Provider Sign-Up

All screens: warm gradient background + صلة watermark. Progress indicator top-right (dots + "N of 4 · Step name").

#### B01 — Account Creation (Step 1 of 4)
**File:** `B01-provider-signup-account.png`
**From:** Home → "List your practice" OR sign-in screen → "Get started"
**Goes to:** B02 (credentials) → Continue

**Layout:**
- Back button + progress dots (1 of 4 · Account)
- Headline: "Let's get you *started*" — DM Sans Regular + clay accent
- Subtitle: "Two minutes is all it takes to sign up."
- Fields (glass cards): Full legal name / Work email / Password + Confirm (side by side) / Date of birth
- "By continuing you agree to our Privacy Policy."
- "Already have an account? Sign in" link row
- "Continue" CTA (tealDeep, full width, pinned to bottom)

#### B02 — Credentials (Step 2 of 4)
**File:** `B02-provider-signup-credentials.png`
**From:** B01 → Continue
**Goes to:** B03 (profile) → Continue

**Layout:**
- Back button + progress dots (2 of 4 · Credentials)
- Headline: "Tell us how to *verify you*" — clay accent
- Subtitle: "We check this against NPPES, OIG, and your state board."
- Fields (glass cards): NPI Number (full width) / License # + License Type (side by side) / License State + Specialty (side by side)
- Privacy note: "Your credentials are used for verification only and are never shared publicly."
- "Continue" CTA

#### B03 — Profile (Step 3 of 4)
**Files:** `B03a-provider-signup-profile-top.png`, `B03b-provider-signup-profile-mid.png`, `B03c-provider-signup-profile-lower.png`, `B03d-provider-signup-profile-bottom.png`
**From:** B02 → Continue
**Goes to:** B04 (review) → Continue (from bottom of scrollable form)

**This is a long scrollable form — 4 screenshots to show full content.**

**Top (B03a):**
- Back button + progress dots (3 of 4 · Profile)
- Headline: "How should clients *find you?*" — clay accent
- Subtitle: "This is your public-facing profile."
- **PHOTO section:** glass card with circular avatar placeholder (+) + "Upload a profile photo" + "Square crop · JPEG · Required"
- **FAITH APPROACH section:** 2×2 grid of selectable cards (teal border when selected), each with title + description:
  - Faith-integrated: "Spiritual practice and scripture woven into sessions"
  - Faith-sensitive: "Religion-aware; honors beliefs without centering them"
  - Faith-neutral: "Evidence-based; follows the client's lead on faith"
  - Secular: "Strictly clinical; faith kept outside the room"
- **SESSION FORMAT section:** 3 pill chips — Telehealth / In-person / Both (single select)
- **LANGUAGES section:** glass text field "Languages spoken"
- **FOCUS AREAS section header**

**Middle (B03b):**
- **FOCUS AREAS section:** glass card with selected tags (teal bg + ×) + "Common:" quick-add chips (clay-tinted, unselected) + "+ Add custom" link
- **TREATMENT APPROACHES section:** glass card with toggle chips (all unselected by default)
  - CBT / DBT / EMDR / ACT / Gottman method / Narrative therapy / Somatic therapy / Mindfulness / ERP / IFS / Psychodynamic / Solution-focused
- **PULL QUOTE section:** "2 sentences max · Write like you're talking to a friend, not writing a resume."
  - Glass textarea with "IN YOUR OWN WORDS" label + "0 / 2" sentence counter

**Lower (B03c):**
- Continuation of pull quote textarea
- **BIO section:** glass textarea "TELL CLIENTS ABOUT YOUR APPROACH *" (required)
- **SCHEDULING section:** glass field "SCHEDULING LINK *" (required) — placeholder "calendly.com/your-name"
- **IN-NETWORK INSURANCE section:** glass card with "Quick add:" chips (Cigna / United Healthcare / Humana / Medicare) + "+ Add plan" link
- **OUT-OF-POCKET FEES:** fee table rows beginning to show

**Bottom (B03d):**
- Fees table: Individual session ($150–200 range placeholder) / Couples session optional / Initial consultation
- "Continue" CTA (slightly desaturated teal when form incomplete)

#### B04 — Review & Submit (Step 4 of 4)
**File:** `B04-provider-signup-review.png`
**From:** B03 → Continue
**Goes to:** B05 (pending) → "Submit for verification"

**Layout:**
- Back button + progress dots (4 of 4 · Review)
- Headline: "Ready to *submit*" — clay accent
- Subtitle: "Review your verification details before we begin."
- **VERIFICATION DETAILS card:** glass card with "tap to edit" link + rows: Full name / Date of birth / NPI number / License # / License type / License state
- Privacy note below card: explains details are checked against NPPES, OIG, SAM.gov, and state board
- **WHAT HAPPENS NEXT card:** glass card with teal left border accent — "Automated checks run immediately. Human review of your state license takes up to 3 business days. We'll email you when you're live."
- "Submit for verification" CTA (tealDeep, full width)

#### B05 — Pending / Under Review
**File:** `B05-provider-signup-pending.png`
**From:** B04 → Submit for verification
**Goes to:** This screen persists until admin approves. On next sign-in, routes to dashboard if approved.

**Layout (dark teal background — same gradient as home):**
- "Sila" wordmark in Cormorant italic + "صلة" Arabic below (cream, small)
- Headline: "Almost **there**" — Cormorant italic + DM Sans Bold for "there"
- Subtitle: "Your application is under review."
- Verification checklist card (glassDark surface):
  - NPPES identity match · In progress (clay dot)
  - OIG exclusion list · In progress
  - SAM.gov check · In progress
  - State license review · In progress
- Bottom section (warm gradient fading up from bottom): "We've got it from here." + explanation copy
- No explicit navigation — provider waits for email

---

### FLOW C — Provider Auth (Returning Provider)

#### C01 — Sign In
**File:** `C01-provider-auth-sign-in.png`
**From:** Home → "List your practice" → account screen → "Already have an account? Sign in"
**Goes to:**
- Success → routes based on onboarding state:
  - If credentials incomplete → B02
  - If profile incomplete → B03
  - If pending → B05
  - If verified/in_review/rejected/excluded → D01/D02 (dashboard)
- "Forgot password?" → C02
- "Get started" → B01 (account creation)

**Layout:**
- Back button (top left, teal)
- "FOR PROVIDERS" eyebrow in clay capsXs
- Headline: "Welcome **back**" — DM Sans Regular + DM Sans SemiBold clay accent on "back"
- Subtitle: "Sign in to manage your provider profile."
- Glass field cards: Email address / Password (with Show/Hide toggle)
- "Forgot password?" right-aligned link (teal)
- "Sign in" CTA (tealDeep, full width)
- "or" divider with clay-tinted lines
- "Don't have an account? **Get started**" row

#### C02 — Forgot Password
**File:** `C02-provider-auth-forgot-password.png`
**From:** C01 → "Forgot password?"
**Goes to:** C03 (check email) → submit

**Layout:**
- Back button
- "PASSWORD RESET" eyebrow in clay capsXs
- Headline: "Forgot your **password?**" — split weight + clay accent
- Subtitle: "Enter the email on your provider account. We'll send a reset link right away."
- Email address field (glass card)
- "Send reset link" CTA (tealDeep)

#### C03 — Check Your Email
**File:** `C03-provider-auth-check-email.png`
**From:** C02 → submit email
**Goes to:**
- "Back to sign in" → C01
- "Wrong email? Try again" → C02

**Layout:**
- Centered glass card containing:
  - Envelope icon in circular teal-tinted badge
  - "Check your email" heading (DM Sans SemiBold ~24px)
  - "We sent a password reset link to **[email]**" — email in clay color
  - "The link expires in 24 hours. If you don't see it, check your spam folder."
- "Back to sign in" CTA (tealDeep, full width, outside card)
- "Wrong email? Try again" text link (teal, centered)

> **Not captured:** Reset password screen (`app/(auth)/reset-password.tsx`) — requires clicking the actual email link to access.

---

### FLOW D — Provider Dashboard & Management

Accessible after: verified provider signs in (C01 → success), or after B05 pending screen once approved.

#### D01 — Dashboard (First Visit — Welcome Banner)
**File:** `D01-provider-dashboard-first-visit.png`
**From:** First sign-in after verification approval
**Goes to:** D02 (same screen after dismissing banner)

**Layout:**
- Warm gradient + watermark
- **Welcome banner** (tealNight background, dismissible with ✕):
  - "You've been approved. Welcome to Sila."
  - "Your profile is live. Clients can find you in the directory now."
- "✓ Verified Provider" pill badge (teal-tinted)
- "Welcome back" label + first name in Cormorant italic 44px
- (rest same as D02 below)

#### D02 — Dashboard (Standard)
**File:** `D02-provider-dashboard.png`
**From:** D01 (banner dismissed) or any return sign-in
**Goes to:**
- "View public profile" → A06 (public profile, read-only view)
- "Edit profile" → D03 (edit profile form)
- "Scheduling link" → D04 (edit scheduling)
- Sign out → C01 (sign-in)

**Layout:**
- "✓ Verified Provider" pill badge
- "Welcome back" label + first name in Cormorant italic 44px
- **Accepting clients card** (glass, shadow.card):
  - "Open to new clients" title + iOS Switch toggle
  - Subtitle changes: "Your profile is visible and clients can reach out." OR "Clients will see your schedule is full for now."
  - Clay divider
  - Helper note below divider (also changes with toggle state)
- **Profile snapshot card** (glass):
  - Circular photo (56px) or initials fallback + name + credentials + "Verified [date]" in teal
  - Bio snippet (3 lines, ink54)
- **"QUICK ACTIONS" section label** (capsXs)
- **Quick actions card** (glass container, 3 rows with clay dividers):
  - ↗ View public profile · See what clients see
  - ✎ Edit profile · Bio, photo, languages, fees
  - ⧗ Scheduling link · [current URL or "Not set"]
- **Sign out** text button (teal, centered, bottom)

#### D03 — Edit Profile
**Files:** `D03a-provider-edit-profile-top.png`, `D03b-provider-edit-profile-mid.png`, `D03c-provider-edit-profile-lower.png`, `D03d-provider-edit-profile-bottom.png`
**From:** D02 → "Edit profile"
**Goes to:** D02 (on save) or Back

**Key difference from B03 (onboarding profile):** No progress steps, no Continue — has "Save changes" button at bottom. Changes go live immediately. Same field layout.

**Top (D03a):**
- Back button
- "Edit profile" heading (DM Sans, large, not Cormorant)
- Subtitle: "Changes go live immediately."
- **PHOTO:** glass card with current circular photo + "Tap to change photo" + "Square crop · JPEG"
- **BIO:** glass textarea (pre-filled)
- **PULL QUOTE:** glass textarea (pre-filled, 2 sentence max)
- **SCHEDULING LINK:** glass field (pre-filled)
- **SESSION FORMAT** chips beginning to show at bottom

**Middle (D03b):**
- Scheduling link field
- Session format chips (Telehealth / In-person / Both)
- Languages field
- Faith approach (pill chips, single select)
- Focus areas: selected tags (teal + ×) + "Common:" quick-add chips + "+ Add custom"

**Lower (D03c):**
- Focus areas continued
- Treatment approaches chips (multi-select, teal border when active)

**Bottom (D03d):**
- Treatment approaches continued
- **IN-NETWORK INSURANCE:** selected tags + quick-add chips + "+ Add plan"
- **OUT-OF-POCKET FEES:** 3-row table (Individual / Couples optional / Initial consultation), right-aligned number inputs
- **"Save changes"** CTA (tealDeep, full width)

#### D04 — Edit Scheduling
**File:** `D04-provider-edit-scheduling.png`
**From:** D02 → "Scheduling link"
**Goes to:** D02 (on save) or Back

**Layout:**
- Back button
- "Scheduling link" heading
- Subtitle: "Where clients go to book with you. Calendly, SimplePractice, Jane — any URL works."
- Glass field: "BOOKING URL" label + current URL
- "Save" CTA (tealDeep, full width)
- Keyboard open by default (URL field focused)

---

## Component Patterns

### Provider Card (directory list)
- `borderRadius: 14`, glass bg + glassBorder + shadow.card
- BlurView + glassHighlight inside
- Circular avatar: outer 52px (colored bg, white border 1.5px), inner 46px (overflow hidden)
- Avatar fallback: Cormorant italic initials on deterministic colored bg (same color every time for same name)
- First specialty tag: clay-tinted pill. Subsequent tags: teal-tinted.
- Accepting status: "· Open" in verified green (#3F6A58), "· Full for now" in clay opacity 0.75

### Form Field Cards
- `borderRadius: 14`, glass bg + glassBorder + shadow.subtle
- `glassHighlight` as first child always
- Field label: capsXs in ink54
- Input: DM Sans Medium 14px ink

### Faith Approach Grid (B03 / D03)
- 2×2 grid of selectable cards, each with title + description subtitle
- Selected state: teal border + teal dot + teal title text
- Unselected: clay-tinted border, ink text

### Primary CTA Button
- Height: 54px, borderRadius: 14
- Background: `#134543` (tealDeep)
- Text: DM Sans SemiBold 15px, paper/cream
- Shadow: float (clay-tinted)

### Section Labels (eyebrows)
- DM Sans Bold 10px, letterSpacing 1.4, UPPERCASE, ink ~0.40 opacity

### Pill Badges (verified, status)
- Background: primary color at 0.08–0.12 opacity + border at 0.18–0.22 opacity
- Text: primary color, DM Sans SemiBold 11px

### Quick Action Rows
- 36×36 icon box (teal-tinted bg, rounded 10, teal icon)
- Title DM Sans SemiBold 14px + subtitle DM Sans Regular 11px ink45
- › arrow right, ink25
- Clay divider (rgba(160,106,87,0.10)) between rows

---

## Copy Style Rules

- No em dashes — use commas, periods, or separate sentences
- Warm, direct, human tone — write like a trusted friend
- Short sentences — never stack more than 2 clauses
- Avoid: "seamlessly", "empower", "leverage", startup speak
- Availability: "Full for now" not "Not accepting" — preserves dignity
- Error messages: plain and specific, never snarky
- Verification states: empathetic, not bureaucratic

---

## What's Not Yet Implemented (June 2026)

- Fees for some seeded providers — they need to fill in via Edit Profile (data issue, no code change)
- Some provider photos need re-upload (arrayBuffer fix is in place, re-upload via Edit Profile)
- SAM.gov System Account — apply at sam.gov before launch (public API can't access exclusions endpoint without it)
- Universal Links / deep linking setup (AASA file + assetlinks.json needed before EAS build)
- EAS Build — App Store + Play Store submission (Apple $99/yr, Google $25 one-time)
- Marketing site deploy to silacare.health (static HTML in Sila Web/ folder)
- Admin dashboard deploy to Vercel (currently localhost only)
