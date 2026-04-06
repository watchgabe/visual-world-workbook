# Deploying the Brand Launch Playbook

This guide walks you through deploying the project on Vercel and connecting it to Supabase. No coding knowledge is needed — just follow each step.

---

## What you need before starting

- A **GitHub account** (the code lives there)
- A **Vercel account** (free plan works) — sign up at [vercel.com](https://vercel.com) using your GitHub account
- Access to the **Supabase project** dashboard (you should already have this)

---

## Step 1: Import the project on Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"**
3. Find and select the **visual-world-workbook** repository
4. Leave all the default settings as they are (Vercel auto-detects Next.js)
5. **Do NOT click Deploy yet** — you need to add environment variables first (Step 2)

---

## Step 2: Add environment variables on Vercel

Before deploying, you need to tell Vercel how to connect to Supabase. These are secret keys that the app needs to work.

On the same import page (or go to **Project Settings > Environment Variables**), add these 4 variables:

### Required variables

| Name                            | Where to find it                                                                     | What it does                                                                                                                                  |
| ------------------------------- | ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase Dashboard > **Settings > API** > Project URL                                | Tells the app where your database lives                                                                                                       |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard > **Settings > API** > Project API keys > `anon` `public`         | Public key for users to read/write their own data                                                                                             |
| `SUPABASE_SERVICE_ROLE_KEY`     | Supabase Dashboard > **Settings > API** > Project API keys > `service_role` `secret` | Admin key for the server — **never share this publicly**                                                                                      |
| `RAPIDAPI_KEY`                  | Your [RapidAPI](https://rapidapi.com) account > subscribed APIs                      | Powers the Instagram profile lookup in the Visual World module. If not set, Instagram features just won't appear — everything else works fine |

**For each variable:**

1. Type the name exactly as shown (including capitalization)
2. Paste the value from Supabase
3. Leave the environment checkboxes as default (Production, Preview, and Development should all be checked)
4. Click **Add**

---

## Step 3: Deploy

Click **Deploy**. Vercel will build and publish the site. This takes about 1 minute.

When it finishes, you'll see a green checkmark and a URL like `your-project.vercel.app`. Click it to verify the site is working.

---

## Step 4: Set up a custom domain (optional)

1. Go to **Project Settings > Domains**
2. Type your domain (e.g., `app.yourbrand.com`)
3. Vercel will show you DNS records to add at your domain registrar (like GoDaddy, Namecheap, etc.)
4. Add the records, wait a few minutes for them to propagate, and Vercel will issue an SSL certificate automatically

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

To give someone admin access to the dashboard (`/admin`):

1. Go to **Supabase Dashboard > Authentication > Users**
2. Find the user and click on them
3. Under `app_metadata`, add or edit: `"role": "admin"`
4. Save — they can now access `/admin` on the site

Alternatively, an existing admin can promote other users directly from the admin dashboard.

---

## The `.env.local` file (for local development only)

If a developer needs to run the project on their own computer, they should:

1. Copy `.env.example` to `.env.local`
2. Fill in the same values from Supabase (same keys as Vercel)
3. Run `npm install` then `npm run dev`

**Important:** `.env.local` is already in `.gitignore` — it will never be uploaded to GitHub. This is intentional. Secrets should only live on your machine or on Vercel, never in the code repository.

---

## Quick reference

| What                  | Where                                                         |
| --------------------- | ------------------------------------------------------------- |
| Live site             | Your Vercel project URL or custom domain                      |
| Deploy logs           | [vercel.com](https://vercel.com) > your project > Deployments |
| Database & users      | [supabase.com](https://supabase.com/dashboard) > your project |
| Code                  | [github.com](https://github.com) > your repository            |
| Environment variables | Vercel > Project Settings > Environment Variables             |
