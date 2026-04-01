# Phase 2: Authentication - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-01
**Phase:** 02-authentication
**Areas discussed:** Login page design, Session & redirect flow, Sign-out experience, Error & edge cases

---

## Login Page Design

### Q1: How should the login page look?

| Option | Description | Selected |
|--------|-------------|----------|
| Branded & warm | Dark background with FSCreative brand, course title, friendly welcome message | ✓ |
| Minimal & clean | Just email input and button on a centered card, no branding | |
| Old app style | Replicate exact visual of old app's email entry | |

**User's choice:** Branded & warm
**Notes:** None

### Q2: Standalone layout or inside app shell?

| Option | Description | Selected |
|--------|-------------|----------|
| Standalone | Full-page centered card, no sidebar/topbar. Clean entry point | ✓ |
| Inside app shell | Login form in main content area with sidebar visible but disabled | |

**User's choice:** Standalone
**Notes:** None

### Q3: Post-email confirmation UI

| Option | Description | Selected |
|--------|-------------|----------|
| Inline success message | Form transforms to show confirmation on same page | |
| Separate confirmation page | Navigate to /login/check-email | |
| You decide | Claude picks best approach | ✓ |

**User's choice:** You decide
**Notes:** Claude has discretion on confirmation UI approach

### Q4: Resend magic link option

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, after ~30s delay | Show Resend button after short delay | ✓ |
| No, keep simple | Just confirmation message, re-enter email if needed | |

**User's choice:** Yes, after a short delay
**Notes:** None

---

## Session & Redirect Flow

### Q1: Where do users land after magic link auth?

| Option | Description | Selected |
|--------|-------------|----------|
| Dashboard / module list | Main app view with sidebar showing all modules | ✓ |
| Last visited page | Redirect back to page they were trying to access | |
| Welcome module | Always land on Module 00 first | |

**User's choice:** Dashboard / module list
**Notes:** None

### Q2: Remember original URL for redirect after login?

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, redirect back after login | Store URL as query param, redirect there post-auth | ✓ |
| No, always dashboard | Simpler flow, always land on dashboard | |

**User's choice:** Yes, redirect back after login
**Notes:** None

### Q3: Access gate or open to any email?

| Option | Description | Selected |
|--------|-------------|----------|
| Open to any email | Any email can sign in, Supabase creates user automatically | ✓ |
| Allowlist only | Only pre-registered emails, others see 'not enrolled' | |
| You decide | Claude picks based on old app behavior | |

**User's choice:** Open to any email
**Notes:** Access control handled externally via Circle.so enrollment

---

## Sign-Out Experience

### Q1: Where should sign-out button live?

| Option | Description | Selected |
|--------|-------------|----------|
| Sidebar footer | Small button near theme toggle | |
| User menu dropdown | Avatar/email dropdown with sign-out option | |
| You decide | Claude picks best location | |

**User's choice:** (Other) Inside a user modal with personal info, clear progress, etc.
**Notes:** User has a broader vision for a user modal that includes sign-out among other features

### Q2: Build minimal modal now or temporary button?

| Option | Description | Selected |
|--------|-------------|----------|
| Minimal modal now | Basic modal with email display + sign-out. Other features later | ✓ |
| Temporary button, full modal later | Simple sign-out link for now, full modal in future phase | |

**User's choice:** Minimal modal now
**Notes:** Modal will be extended in later phases with clear progress, personal info, etc.

### Q3: Confirmation before sign-out?

| Option | Description | Selected |
|--------|-------------|----------|
| Instant sign-out | Click -> signed out -> redirect to login. No dialog | ✓ |
| Confirmation dialog | "Are you sure?" before proceeding | |

**User's choice:** Instant sign-out
**Notes:** None

---

## Error & Edge Cases

### Q1: Error message tone

| Option | Description | Selected |
|--------|-------------|----------|
| Friendly & helpful | Warm language matching course's supportive brand | ✓ |
| Neutral & technical | Standard direct messaging | |
| You decide | Claude picks based on brand feel | |

**User's choice:** Friendly & helpful
**Notes:** None

### Q2: Loading state while sending magic link

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, button spinner | Button shows spinner and disables | ✓ |
| You decide | Claude picks best loading pattern | |

**User's choice:** Yes, button spinner
**Notes:** None

### Q3: Failed magic link callback behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Redirect to login with error | Send to login page with friendly error message | ✓ |
| Dedicated error page | Standalone /auth/error page | |
| You decide | Claude picks best approach | |

**User's choice:** Redirect to login with error message
**Notes:** None

---

## Claude's Discretion

- Inline confirmation UI approach (animation, icon, layout after email submission)
- Middleware implementation details (matcher patterns, cookie refresh)
- Auth callback route structure
- AuthContext shape and provider placement
- Rate limiting for magic link requests

## Deferred Ideas

None — discussion stayed within phase scope
