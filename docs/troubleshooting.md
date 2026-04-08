# Troubleshooting

Common issues and how to fix them.

---

## Local Development Issues

### "npm run dev" fails or shows errors

**Try reinstalling dependencies:**
```bash
rm -rf node_modules
npm install
npm run dev
```

**Check your Node.js version:**
```bash
node --version
```
You need version 20 or higher. If it's lower, download the latest LTS from https://nodejs.org.

### Site loads but login doesn't work locally

Your `.env.local` file is probably missing or has wrong values:
1. Make sure `.env.local` exists in the project root
2. Check that all values are correct (see [Environment Variables](./environment-variables.md))
3. Restart the dev server after changing `.env.local`

### Changes don't show up in the browser

1. Save the file in your editor
2. Refresh the browser (Cmd+R on Mac, Ctrl+R on Windows)
3. If still not showing, stop the server (Ctrl+C) and start it again (`npm run dev`)
4. Try a hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

---

## Deployment Issues

### Push to GitHub succeeded but site didn't update

1. Go to https://vercel.com → your project → **Deployments**
2. Check if there's a new deployment:
   - **Building** (orange) — Wait for it to finish
   - **Error** (red) — Click on it to see the error log
   - **No new deployment** — Make sure you pushed to the correct branch (usually `main` or `v1`)

### Deployment failed (red error on Vercel)

1. Click on the failed deployment in Vercel
2. Click **"View Build Logs"**
3. Scroll to the bottom — the error message is usually there
4. Common causes:
   - **TypeScript error** — You have a syntax mistake in the code. Run `npm run build` locally to see the same error.
   - **Missing environment variable** — A key is missing on Vercel. Check [Environment Variables](./environment-variables.md).
   - **Import error** — A file is importing something that doesn't exist. Make sure you didn't accidentally delete or rename a file.

### How to revert a bad deployment

If you pushed a broken change to the live site:

**Option 1: Redeploy the previous version (quickest)**
1. Go to Vercel → **Deployments**
2. Find the last working deployment (green checkmark)
3. Click the three dots (⋯) → **Promote to Production**
4. This instantly rolls back the live site

**Option 2: Revert the code and push again**
```bash
git revert HEAD
git push
```
This creates a new commit that undoes the last change.

---

## Login / Authentication Issues

### "Invalid login credentials" for a user who definitely has an account

1. Try the password reset flow (see [Managing Users](./managing-users.md))
2. Check in Supabase Dashboard → Authentication → Users that the user exists
3. Make sure the user's email is confirmed (check the "Email Confirmed" column)

### Login works locally but not on the live site

The Supabase redirect URL is probably not configured for your production domain:

1. Go to **Supabase Dashboard** → **Authentication** → **URL Configuration**
2. Make sure your production URL is in the **Redirect URLs** list:
   ```
   https://your-domain.com/auth/callback
   ```
3. Make sure the **Site URL** matches your production domain

### After login, user gets redirected back to login

This usually means the session cookie isn't being set. Check:
1. Are your Supabase environment variables correct on Vercel?
2. Is the site URL in Supabase matching the actual domain?
3. Try clearing browser cookies for the site and logging in again

---

## Admin Dashboard Issues

### Can't access /admin — redirected to home

The user doesn't have admin role. See [Managing Users](./managing-users.md) for how to set admin metadata.

### Admin page loads but shows no users

Check that `SUPABASE_SERVICE_ROLE_KEY` is correctly set on Vercel. The admin features need this key to list all users.

---

## Data Issues

### User's saved answers disappeared

Answers are saved in the `blp_responses` table in Supabase. Check:
1. Go to Supabase → Table Editor → `blp_responses`
2. Filter by the user's ID
3. If data is there but not showing in the app, there may be a field key mismatch

**Most common cause:** Someone changed a `fieldKey` in the code. The old data is still in the database under the old key, but the app is looking for the new key. Solution: change the `fieldKey` back to what it was.

---

## Still Stuck?

Gather this information before asking for help:

1. **What you were trying to do**
2. **What happened instead** (screenshot if possible)
3. **Browser console errors**: Right-click → Inspect → Console tab → screenshot any red errors
4. **Vercel build logs** (if deployment failed)
5. **Which browser and device** you're using
