# Architecture Overview

This is a reference document explaining how the app is built. You don't need to understand all of this to make content changes, but it's useful context if you're working with a developer or doing deeper modifications.

---

## Tech Stack

| Technology | What it does | Version |
|-----------|-------------|---------|
| **Next.js** | The web framework (handles pages, routing, server) | 15 |
| **React** | The UI library (builds what you see in the browser) | 19 |
| **TypeScript** | JavaScript with type safety (fewer bugs) | 5 |
| **Tailwind CSS** | Styling system (controls how things look) | 4 |
| **Supabase** | Database + authentication (stores data and handles login) | — |
| **Vercel** | Hosting platform (runs the live site) | — |
| **shadcn/ui** | Pre-built UI components (buttons, inputs, cards) | — |

---

## How the App Works

```
User visits site
    ↓
Vercel serves the Next.js app
    ↓
Middleware checks: is user logged in?
    ├── No  → Redirect to /login
    └── Yes → Show the requested page
              ↓
         Page loads module content
              ↓
         User fills in workshop fields
              ↓
         Auto-save sends data to Supabase
              ↓
         Data is stored in blp_responses table
```

---

## Folder Structure (What Lives Where)

```
visual-world-workbook/
├── docs/                    # Documentation guides
├── README.md                # ← Start here (main guide with links to all docs)
├── public/                  # Static files (images, fonts)
├── src/
│   ├── app/                 # Pages and routes
│   │   ├── (app)/           # All pages behind login
│   │   │   ├── modules/     # Course module pages
│   │   │   ├── playbook/    # Compiled playbook view
│   │   │   └── welcome/     # Welcome landing page
│   │   ├── admin/           # Admin dashboard
│   │   ├── api/             # Server-side API endpoints
│   │   └── login/           # Login page
│   ├── components/
│   │   ├── sections/        # Module content (THE MAIN CONTENT FILES)
│   │   ├── workshop/        # Form components (inputs, textareas, etc.)
│   │   ├── layout/          # Sidebar, topbar, navigation
│   │   └── admin/           # Admin-specific components
│   ├── context/             # App-wide state (auth, progress, theme)
│   ├── hooks/               # Reusable logic (auto-save)
│   ├── lib/                 # Utilities and helpers
│   │   ├── supabase/        # Database connection code
│   │   └── modules.ts       # Module/section definitions
│   └── types/               # TypeScript type definitions
├── .env.local               # Your local secret keys (not in Git)
├── package.json             # Project dependencies and scripts
└── CLAUDE.md                # Instructions for Claude Code
```

---

## Key Concepts

### Pages vs Components

- **Pages** (in `src/app/`) define URLs — each folder becomes a route
  - `src/app/login/` → `yoursite.com/login`
  - `src/app/(app)/modules/[slug]/[section]/` → `yoursite.com/modules/brand-foundation/overview`
- **Components** (in `src/components/`) are reusable pieces of UI that pages use

### Server vs Client

Next.js has two types of code:
- **Server code** — runs on Vercel's servers, can access secrets, talks to the database directly
- **Client code** — runs in the user's browser, handles interactions like typing in forms

Files with `"use client"` at the top are client code. Everything else is server code by default.

### Auto-Save

When a user types in a workshop field, the `useAutoSave` hook automatically saves their input to Supabase after they stop typing (debounced). There's no "save" button — it just works.

### Authentication Flow

1. User enters email + password at `/login`
2. Supabase validates credentials and creates a session
3. The session is stored as a cookie in the browser
4. On every page load, middleware checks this cookie
5. If valid → user sees the page. If expired → redirect to login.

### Admin Access

Admin access is controlled by a `role` field in the user's Supabase metadata:
- Regular user: no role set
- Admin: `{"role": "admin"}` in app_metadata
- Middleware blocks non-admin users from `/admin/*` routes

---

## External Services

| Service | What it does | Dashboard URL |
|---------|-------------|---------------|
| **Vercel** | Hosts the live site, handles deployments | https://vercel.com/dashboard |
| **Supabase** | Database, auth, user management | https://supabase.com/dashboard |
| **GitHub** | Stores the code, triggers deployments | https://github.com |

When you push code to GitHub, Vercel automatically detects the change and deploys a new version. This typically takes 1-2 minutes.
