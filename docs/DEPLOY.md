# Deploying the Brand Launch Playbook

This guide walks you through deploying the project on Vercel and connecting it to Supabase. No coding knowledge is needed — just follow each step.

---

## What you need before starting

- A **Vercel account** (free plan works) — sign up at [vercel.com](https://vercel.com) using your GitHub account
- Access to the **Supabase project** dashboard (you should already have this)

---

## Step 1: Switch GitHub Pages to the v0 branch

Your site is currently live on GitHub Pages from the **main** branch. Since the new version will be built on **main** and deployed on Vercel, you need to point GitHub Pages to the **v0** branch so your current site stays live while we work.

1. Go to your repository on GitHub
2. Click **Settings** (top menu bar)
3. In the left sidebar, click **Pages**
4. Under **Branch**, you'll see it's set to `main` — change it to `v0`
5. Click **Save**

Your site will stay at the same URL and look exactly the same — `v0` is an exact copy of what's live right now.

---

## Step 2: Import the project on Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"**
3. Find and select the **visual-world-workbook** repository
4. Leave all the default settings as they are (Vercel auto-detects Next.js)
5. **Do NOT click Deploy yet** — you need to add environment variables first (Step 3)

---

## Step 3: Add environment variables on Vercel

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

## Step 4: Deploy

Click **Deploy**. Vercel will build and publish the site. This takes about 1 minute.

When it finishes, you'll see a green checkmark and a URL like `your-project.vercel.app`. Click it to verify the site is working.

---

## Step 5: Configure Supabase redirect URLs

For login to work on your new Vercel URL, you need to tell Supabase about it:

1. Go to **Supabase Dashboard** → **Authentication** → **URL Configuration**
2. Under **Site URL**, enter your Vercel URL (e.g., `https://your-project.vercel.app`)
3. Under **Redirect URLs**, click **Add URL** and add: `https://your-project.vercel.app/auth/callback`
4. Click **Save**

If you set up a custom domain later (Step 6), you'll need to update these URLs to match the new domain.

---

## Step 6: Set up a custom domain (optional)

1. Go to **Project Settings > Domains**
2. Type your domain (e.g., `app.yourbrand.com`)
3. Vercel will show you DNS records to add at your domain registrar (like GoDaddy, Namecheap, etc.)
4. Add the records, wait a few minutes for them to propagate, and Vercel will issue an SSL certificate automatically
