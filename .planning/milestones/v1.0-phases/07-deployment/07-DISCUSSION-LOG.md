# Phase 7: Deployment - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.

**Date:** 2026-04-03
**Phase:** 07-deployment
**Areas discussed:** Vercel project setup, Environment variables, Magic link redirect URLs, Smoke test scope

---

## Vercel Project Setup

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, existing project | Already have a Vercel project linked. | |
| No, create from scratch | Need to create new Vercel project and connect repo. | ✓ |

**User's choice:** Create from scratch

| Option | Description | Selected |
|--------|-------------|----------|
| Custom domain | Point a domain to the app. | |
| Default Vercel domain | Use .vercel.app URL. | ✓ |

**User's choice:** Default Vercel domain

---

## Environment Variables

| Option | Description | Selected |
|--------|-------------|----------|
| Same project (Recommended) | Same Supabase for dev and production. | ✓ |
| Separate staging + production | Different Supabase projects. | |

**User's choice:** Same project

---

## Magic Link Redirect URLs

| Option | Description | Selected |
|--------|-------------|----------|
| Document as manual step (Recommended) | Add production URL to Supabase dashboard. | ✓ |
| Create a setup script | Programmatic via Supabase Management API. | |

**User's choice:** Manual step

---

## Smoke Test

| Option | Description | Selected |
|--------|-------------|----------|
| Manual checklist (Recommended) | Walk through after deploy. | |
| Automated E2E | Playwright/Cypress. | |
| Other | No smoke tests for now. | ✓ |

**User's choice:** No smoke tests for now. Manual verification by user is sufficient.

---

## Claude's Discretion

- Vercel build settings
- .env.example file
- Build configuration tweaks

## Deferred Ideas

None
