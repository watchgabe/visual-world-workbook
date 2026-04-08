# Custom Domain

This guide explains how to add, change, or remove a custom domain for your site on Vercel.

## Current Setup

By default, your site is available at a `.vercel.app` URL (e.g., `your-project.vercel.app`). You can add a custom domain like `playbook.yourbrand.com`.

---

## Adding a Custom Domain

### Step 1: Add the domain in Vercel

1. Go to https://vercel.com and log in
2. Click on your project
3. Go to **Settings** → **Domains**
4. Type your domain (e.g., `playbook.yourbrand.com`) and click **Add**

### Step 2: Configure DNS

Vercel will show you DNS instructions. There are two options:

**Option A: Subdomain (recommended)** — e.g., `playbook.yourbrand.com`
- Go to your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.)
- Add a **CNAME** record:
  - **Name/Host:** `playbook` (or whatever subdomain you chose)
  - **Value/Target:** `cname.vercel-dns.com`

**Option B: Root domain** — e.g., `yourbrand.com`
- Add an **A** record:
  - **Name/Host:** `@`
  - **Value:** `76.76.21.21`

### Step 3: Wait for verification

- DNS changes can take 5 minutes to 48 hours to propagate (usually under 30 minutes)
- Vercel will automatically issue an SSL certificate once DNS is verified
- The domain status in Vercel will change from "Pending" to a green checkmark

### Step 4: Update Supabase redirect URL

This is critical for login to work on the new domain:

1. Go to **Supabase Dashboard** → **Authentication** → **URL Configuration**
2. Under **Site URL**, change it to your new domain: `https://playbook.yourbrand.com`
3. Under **Redirect URLs**, add: `https://playbook.yourbrand.com/auth/callback`
4. Keep the old `.vercel.app` URL in the redirect list as a backup

---

## Changing to a Different Domain

1. Add the new domain first (follow steps above)
2. Once the new domain is working, remove the old one:
   - Vercel **Settings** → **Domains** → click the three dots next to the old domain → **Remove**
3. Update the **Site URL** in Supabase to the new domain
4. Add the new domain's callback URL in Supabase redirect URLs

---

## Removing a Custom Domain

1. Go to Vercel **Settings** → **Domains**
2. Click the three dots (⋯) next to the domain → **Remove**
3. Your site will still be available at the `.vercel.app` URL
4. Update Supabase **Site URL** back to the `.vercel.app` URL

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Domain shows "Invalid Configuration" | Double-check DNS records at your registrar. Make sure there are no conflicting records. |
| SSL certificate not issued | Wait up to 1 hour. If still pending, remove and re-add the domain in Vercel. |
| Login doesn't work on new domain | Make sure you updated the Site URL and added the callback URL in Supabase Auth settings. |
| "Too many redirects" error | If using Cloudflare, set SSL mode to **Full (Strict)**, not "Flexible". |
