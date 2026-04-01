# Feature Landscape

**Domain:** Course/learning platform — brownfield migration (HTML/iframe → Next.js)
**Researched:** 2026-04-01
**Project:** Brand Launch Playbook

---

## Context: What This Platform Already Has

Before categorizing, this is a brownfield migration. The feature set already exists. The question is:
1. Which existing features must survive perfectly (table stakes)?
2. Which existing features are differentiators worth polishing?
3. Which absent features are worth adding during migration?
4. Which should be explicitly avoided?

Existing: 5 course modules, form-based workshops, per-section progress tracking, dark/light theme,
admin dashboard, AI content generation (Claude), Circle.so badges, waterfall analyzer,
mobile-responsive layout, print-friendly playbook view.

---

## Table Stakes

Features users expect from any course platform. Missing or broken = users abandon or distrust
the product. Every single one of these already exists in the old platform — the migration must
preserve all of them without regression.

| Feature | Why Expected | Complexity | Migration Notes |
|---------|--------------|------------|-----------------|
| Persistent progress tracking | Students expect to pick up where they left off; data loss destroys trust | Medium | Critical: current localStorage system is unreliable. Must migrate to Supabase-backed state with zero data loss |
| Auto-save on all form fields | Users do not hit "Save" manually; unexpected loss of typed work causes churn | Medium | Current platform has 4 different save implementations. Must unify into a single debounced hook |
| Module/section navigation | Clear wayfinding through course structure is assumed | Low | Exists via iframe loading; migrating to Next.js App Router routing is an improvement |
| Mobile-responsive layout | 70%+ of internet users are on mobile; non-responsive = unusable | Medium | Exists; must be preserved in new component library |
| Auth / protected access | Course content should only be visible to enrolled students | Medium | Critical gap: current system uses localStorage email with no real auth. Magic link via Supabase is the migration fix |
| Admin dashboard | Platform operators need to see user progress and manage accounts | Medium | Exists; must be ported with server-side auth replacing client-side password |
| Dark/light theme toggle | Expected in any modern product; accessibility and preference | Low | Exists; move to React Context-managed CSS variable approach |
| Clear completion states | Students need to know what they've finished and what remains | Low | Exists as progress rings; must be preserved |
| Print / export of work | Students expect to own their output, not be locked into the platform | Medium | Exists as print-friendly playbook view; must be preserved |
| Fast, reliable page loads | Course platforms with slow loads lose students; iframes are notoriously slow | Low | Migration to Next.js App Router eliminates iframe load lag — this is a direct improvement |

---

## Differentiators

Features that set this platform apart. The existing platform already has several strong ones.
These are worth preserving with fidelity and potentially polishing.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| AI content generation (Claude) | Students can generate drafts for brand copy, saving hours of blank-page work | High | Already implemented via Supabase edge function (claude-proxy). Migration wraps it in a Next.js API route for key security. Do not rebuild — preserve exactly |
| Module completion badges (Circle.so) | Credential + social proof. Students can share badges from a recognized community platform | Medium | Already implemented via circle-proxy edge function. Preserve as-is |
| Waterfall analyzer (YouTube transcript repurposing) | High-value content tool specific to the brand/content strategy audience | High | Already implemented via waterfall-analyzer edge function. Wrap in API route, preserve logic |
| Compiled Playbook module | Aggregates all workshop outputs into a single shareable document — rare in course platforms | Medium | Exists; must function correctly after per-module data is centralized in Supabase |
| Form-based workshops (not video-first) | Active learning vs passive video watching; higher engagement and output quality | Medium | The entire UX model is differentiated. Migration to reusable components (WorkshopTextarea, OptionSelector) must preserve the interaction model |
| Section-based progression (not lesson-based) | Granular completion tracking within modules gives a sense of momentum | Low | Exists; must be preserved in new SectionWrapper component |

---

## Anti-Features

Things to explicitly NOT build during this migration. The scope is already defined in PROJECT.md
Out of Scope, but this frames the reasoning in product terms.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Video hosting / video player | No video content exists in this platform; adding it is scope creep and cost | Stay form/text-based; the workshop model is the product identity |
| Discussion forums / community within the app | Circle.so is already the community layer; duplicating it creates confusion and split engagement | Keep Circle.so as the social layer; do not add in-app comments or forums |
| Leaderboards / point systems | Gamification for its own sake. This is a solo-work course, not a competitive environment | Badges via Circle.so are sufficient; adding leaderboards to a brand strategy course is off-tone |
| Password-based auth | Passwords add friction, create support burden, and are a security liability | Magic link only — already the planned approach |
| Social login (Google/GitHub) | Adds OAuth complexity and out-of-scope OAuth app setup; not aligned with the student persona | Magic link is sufficient; add OAuth in a future phase only if usage data demands it |
| In-app messaging / DMs | Community interaction belongs in Circle.so; this platform is a solo workspace | Out of scope entirely |
| Mobile native app | Web-only is sufficient for this course format; native app is a major investment for unclear ROI | Responsive web covers the need |
| Real-time collaboration | This is individual brand work; real-time collab introduces complexity for no gain | Individual-only model is correct for this domain |
| Stripe / payments | The platform does not handle enrollment or billing; Circle.so or external tools handle that | Do not add a payment layer; keep the platform as a logged-in learning environment only |
| New course modules | Out of scope explicitly. Migration is 1:1 content fidelity | Build the 6 existing modules (5 + welcome) and stop |
| Custom email sender | Supabase Auth handles magic link emails natively; custom email templates are a nice-to-have, not a must | Use Supabase's default email for auth; defer branding of auth emails |

---

## Feature Dependencies

Dependency chains that constrain build order. A feature cannot be built before its dependency.

```
Supabase Auth (magic link)
  → Protected routes (middleware)
    → All module pages (gated)
      → Per-user progress tracking (Supabase)
        → Compiled Playbook (aggregates per-user module data)
          → Print-friendly playbook view

React Context (user + progress state)
  → Auto-save hook (needs user context to associate saves)
    → WorkshopTextarea / WorkshopInput / OptionSelector (components use hook)
      → All 5 course modules (built on top of components)

Server-side admin route protection
  → Admin dashboard (user list, progress viewer, delete)

Next.js API routes (claude-proxy, circle-proxy, waterfall-analyzer)
  → AI generation UI in modules
  → Badge awarding on module completion
  → Waterfall analyzer UI
```

---

## MVP Recommendation

For the migration specifically (not a greenfield build), MVP is:

**Must land in first phase (core trust features):**
1. Auth: Supabase magic link replacing localStorage email — the biggest trust deficit in the current platform
2. Single Supabase service module — unblocks all other work; eliminates 4 competing implementations
3. React Context for user + progress — required before any module can be migrated
4. Auto-save hook — required before any workshop form is migrated

**Must land before any module is considered done:**
5. Reusable component library (WorkshopTextarea, WorkshopInput, OptionSelector, SectionNav, ProgressRing)
6. Section wrapper with completion tracking

**Defer to final phase (works standalone, not blocking):**
- Admin dashboard — internal tool; students don't need it in early phases
- API route wrappers for edge functions — existing edge functions still work during migration; wrappers can be added per-module as each module is migrated

**Do not add during migration:**
- Any feature not in the existing platform
- Any integration not already wired (no new OAuth, no payment, no video)

---

## Confidence Notes

| Finding | Confidence | Source |
|---------|------------|--------|
| Table stakes list | HIGH | Cross-referenced with LMS feature surveys, platform comparison articles, and existing platform inventory |
| Auto-save UX patterns (Saving.../Saved states) | HIGH | GitLab Pajamas Design System (official), multiple UX sources |
| Magic link as sufficient auth for this audience | MEDIUM | Supabase docs, industry patterns; no direct study of this specific student persona |
| Circle.so as community layer (no in-app forum) | HIGH | Existing architecture; avoiding duplication is a well-established product principle |
| Gamification anti-feature judgment | MEDIUM | Supported by audience analysis (solo brand strategy work) and scope constraints; not a universal rule |

---

## Sources

- [14 Non-Negotiable Features Your Online Teaching Platform Better Have in 2026](https://medium.com/@emily_87545/14-non-negotiable-features-your-online-teaching-platform-better-have-in-2026-92ae657d894a)
- [Top 25 Learning Management System Features — Docebo](https://www.docebo.com/learning-network/blog/lms-features/)
- [Designing an LMS That Learners Love: UI/UX Best Practices for 2025](https://techhbs.com/designing-lms-ui-ux-best-practices/)
- [Saving and feedback — GitLab Pajamas Design System](https://design.gitlab.com/usability/saving-and-feedback)
- [Passwordless login via Magic Links — Supabase Features](https://supabase.com/features/passwordless-login-via-magicklink)
- [How Online Communities Are Revolutionising Course Completion Rates](https://www.newzenler.com/blog/how-online-communities-are-revolutionising-course-completion-rates-and-student-success)
- [11 best online course platforms to choose from in 2025 — Circle.so](https://circle.so/blog/best-online-course-platforms)
- [Modern LMS vs Traditional LMS — Disco](https://www.disco.co/blog/modern-lms-vs-traditional-lms)
