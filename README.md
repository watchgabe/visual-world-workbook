# Brand Launch Playbook

Welcome! This is your guide to getting the project live and maintaining it going forward.

---

## Getting Started — First-Time Deploy

If this is your first time setting up the project, follow the **[Deploy Guide](./docs/DEPLOY.md)** — it walks you through switching GitHub Pages, importing the project on Vercel, adding your secret keys, and going live. No coding knowledge needed.

---

## Working on the project locally

If you want to run the project on your own computer (e.g., to make changes with Claude), you'll need to set up a local environment file:

1. In the root folder of the project, find the file called `.env.example`
2. Duplicate it and rename the copy to `.env.local`
3. Open `.env.local` and fill in the values — these are the same keys you added on Vercel (Supabase URL, anon key, service role key, etc.)
4. Run `npm install` then `npm run dev` in the terminal, or ask Claude to do it for you

**Important:** The `.env.local` file contains your secret keys, but it's already set up to be ignored by Git — it will never be uploaded to GitHub. This is intentional. Secrets should only live on your machine or on Vercel, never in the code repository.

---

## How updates work

Every time someone pushes code to the **main** branch on GitHub, Vercel automatically builds and deploys a new version. You don't need to do anything — it just happens.

If code is pushed to any other branch, Vercel creates a **preview deployment** (a temporary URL) so you can check the changes before they go live.

---

## Keeping the project running

### Things that should "just work"

- **Deployments** — automatic on every code push
- **SSL certificates** — auto-renewed by Vercel
- **Database** — managed by Supabase, no maintenance needed

### Things to watch out for

- **If the site shows "Service unavailable" errors** — check that the environment variables on Vercel still match what's in Supabase. Supabase keys don't usually change, but if you regenerate them you'll need to update Vercel too.
- **If login stops working** — verify the Supabase project is active (free-tier projects pause after 1 week of inactivity). Go to your Supabase dashboard and unpause it.
- **If you need to change an environment variable** — go to Vercel > Project Settings > Environment Variables, update the value, then click **Redeploy** (Deployments tab > three-dot menu on the latest deployment > Redeploy).

### Admin access

To give someone admin access to the dashboard (`/admin`), an existing admin can promote them directly from the admin dashboard — go to `/admin`, find the user, and toggle their role.

---

## Detailed Guides

| Guide | What it covers |
|-------|---------------|
| [Deploy Guide](./docs/DEPLOY.md) | First-time setup — GitHub Pages, Vercel, environment variables |
| [Daily Workflow](./docs/daily-workflow.md) | Running the project locally, testing, and deploying changes |
| [Editing Content](./docs/editing-content.md) | How to edit module text, add sections, and update course material |
| [Environment Variables](./docs/environment-variables.md) | All API keys and secrets — where they live, how to change them |
| [Custom Domain](./docs/custom-domain.md) | Changing or adding a custom domain on Vercel |
| [Managing Users](./docs/managing-users.md) | Admin dashboard, promoting admins, resetting passwords |
| [Using Claude Code](./docs/using-claude-code.md) | Best practices for using Claude Code to make changes safely |
| [Troubleshooting](./docs/troubleshooting.md) | Common issues and how to fix them |
| [Architecture Overview](./docs/architecture-overview.md) | High-level explanation of how the app is built (for reference) |

---

## The Golden Rule

**Always test locally before pushing to GitHub.** When you push code to GitHub, the live site updates automatically. If a bad deploy goes out, you can revert it (see [Troubleshooting](./docs/troubleshooting.md)), but it's always better to catch problems before they go live.

---

## Need Help?

If something breaks and you can't figure it out from these guides, the most useful things to share with a developer are:

1. What you asked Claude Code to do
2. What you expected to happen
3. What actually happened (screenshot the error if possible)
4. The Vercel deployment logs (see [Troubleshooting](./docs/troubleshooting.md))

---

## Quick reference

| What                  | Where                                                         |
| --------------------- | ------------------------------------------------------------- |
| Live site             | Your Vercel project URL or custom domain                      |
| Deploy logs           | [vercel.com](https://vercel.com) > your project > Deployments |
| Database & users      | [supabase.com](https://supabase.com/dashboard) > your project |
| Code                  | [github.com](https://github.com) > your repository            |
| Environment variables | Vercel > Project Settings > Environment Variables             |

---

*Last updated: April 2026*
