# Deployment Guide — Brand Launch Playbook

## Prerequisites

- A [Vercel](https://vercel.com) account (free tier works)
- Access to the [Supabase](https://supabase.com) project dashboard
- This Git repository connected to GitHub/GitLab

---

## Step 1: Create Vercel Project

1. Go to https://vercel.com/dashboard
2. Click **"Add New"** > **"Project"**
3. Click **"Import Git Repository"** and select this repo
4. Vercel auto-detects Next.js — accept the defaults
5. **Do NOT deploy yet** — set environment variables first (Step 2)

---

## Step 2: Set Environment Variables

In the Vercel project settings > **Environment Variables**, add these 3 variables:

| Variable | Value | Where to find it |
|----------|-------|------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxx.supabase.co` | Supabase Dashboard > Settings > API > **Project URL** |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGci...` | Supabase Dashboard > Settings > API > **anon public** |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGci...` | Supabase Dashboard > Settings > API > **service_role** (secret) |

Set all 3 for **all environments** (Production, Preview, Development).

Then click **"Deploy"**.

---

## Step 3: Configure Supabase Auth Redirect URLs

After the first deploy, Vercel assigns a production URL (e.g., `https://your-app.vercel.app`).

1. Go to **Supabase Dashboard** > **Authentication** > **URL Configuration**
2. Under **Redirect URLs**, add:
   ```
   https://your-app.vercel.app/auth/callback
   ```
3. Make sure this is also present (for local development):
   ```
   http://localhost:3000/auth/callback
   ```
4. Under **Site URL**, set:
   ```
   https://your-app.vercel.app
   ```

---

## Step 4: Set Up Admin User

To access the admin dashboard at `/admin`:

1. Go to **Supabase Dashboard** > **Authentication** > **Users**
2. Find the admin user's row, click the three dots > **Edit User**
3. In the **App Metadata** field, set:
   ```json
   {"role": "admin"}
   ```
4. Save

---

## Step 5: Create Database Tables

If not already done, run the SQL schema in Supabase:

1. Go to **Supabase Dashboard** > **SQL Editor**
2. Paste the contents of `supabase/schema.sql` from this repo
3. Click **Run**

This creates:
- `blp_responses` — stores all user workshop answers
- `blp_config` — stores admin configuration (Circle API key)

---

## Step 6: Verify

1. Visit your production URL — login page should load
2. Enter an email and request a magic link
3. Check email — the link should point to your production URL (not localhost)
4. Click the link — you should land on the dashboard
5. Navigate to a module, type in a form field — auto-save should work
6. Visit `/admin` — admin dashboard should load (if you set up the admin role)
7. Sign out — should redirect to login

---

## Custom Domain (Optional)

To use a custom domain instead of `.vercel.app`:

1. Vercel project > **Settings** > **Domains**
2. Add your domain (e.g., `playbook.yourdomain.com`)
3. Follow DNS instructions Vercel provides
4. Update Supabase redirect URL to include the custom domain:
   ```
   https://playbook.yourdomain.com/auth/callback
   ```

---

## Environment Variables Reference

| Variable | Public? | Used by |
|----------|---------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes (client) | Browser + server Supabase clients |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes (client) | Browser + server Supabase clients |
| `SUPABASE_SERVICE_ROLE_KEY` | **No (server only)** | Admin routes, API proxy routes |

The `SUPABASE_SERVICE_ROLE_KEY` is never exposed to the browser. It's used only in:
- `/api/claude`, `/api/circle`, `/api/waterfall` (edge function proxies)
- `/api/admin/delete-user`, `/api/admin/circle-config` (admin operations)
- `src/lib/admin/service-client.ts` (admin data fetching)
