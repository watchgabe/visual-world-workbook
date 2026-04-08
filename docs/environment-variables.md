# Environment Variables (API Keys & Secrets)

Environment variables are the secret keys and configuration values your app needs to connect to external services. They live in two places:

1. **Locally** — in a file called `.env.local` on your computer (never uploaded to GitHub)
2. **On Vercel** — in the project settings (used by the live site)

**When you change a key, you must update it in BOTH places.**

---

## All Variables

| Variable | What it does | Where to find it | Secret? |
|----------|-------------|-------------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Connects the app to your database | Supabase Dashboard → Settings → API → **Project URL** | No |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public auth key for user login | Supabase Dashboard → Settings → API → **anon public** | No |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin key for server-side operations | Supabase Dashboard → Settings → API → **service_role secret** | **YES** |
| `RAPIDAPI_KEY` | Instagram embed feature (optional) | Your RapidAPI account dashboard | **YES** |

### About the `NEXT_PUBLIC_` prefix

Variables that start with `NEXT_PUBLIC_` are visible in the browser. This is by design — the Supabase URL and anon key are meant to be public (they're restricted by Supabase's Row Level Security).

Variables WITHOUT this prefix (like `SUPABASE_SERVICE_ROLE_KEY`) are **server-only** and never exposed to users. **Never add `NEXT_PUBLIC_` to the service role key.**

---

## How to Change a Key Locally

1. Open the file `.env.local` in the project root with any text editor
2. Find the variable you want to change
3. Replace the value (the part after the `=` sign)
4. Save the file
5. Restart the local server (`Ctrl + C` then `npm run dev`)

Example `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://abcdefgh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
RAPIDAPI_KEY=abc123...
```

---

## How to Change a Key on Vercel (Live Site)

1. Go to https://vercel.com and log in
2. Click on your project
3. Go to **Settings** (top menu)
4. Click **Environment Variables** (left sidebar)
5. Find the variable you want to change
6. Click the three dots (⋯) next to it → **Edit**
7. Paste the new value
8. Make sure it's enabled for **Production**, **Preview**, and **Development**
9. Click **Save**
10. **Redeploy the project** for the change to take effect:
    - Go to the **Deployments** tab
    - Click the three dots (⋯) next to the latest deployment
    - Click **Redeploy**

**Important:** Changing an environment variable on Vercel does NOT take effect until you redeploy.

---

## How to Add a New Variable

### On Vercel:

1. Go to project **Settings** → **Environment Variables**
2. Enter the variable name (e.g., `MY_NEW_KEY`)
3. Enter the value
4. Select which environments it applies to (usually all three)
5. Click **Save**
6. Redeploy

### Locally:

1. Open `.env.local`
2. Add a new line: `MY_NEW_KEY=your-value-here`
3. Save and restart the dev server

### In the code:

To use the new variable in your code, reference it as:

```tsx
// Server-side only (API routes, server components)
const myKey = process.env.MY_NEW_KEY;

// Client-side (browser) — variable name MUST start with NEXT_PUBLIC_
const myPublicKey = process.env.NEXT_PUBLIC_MY_KEY;
```

---

## When Would You Need to Change Keys?

- **Rotating Supabase keys** — If you regenerate API keys in Supabase (Settings → API → Regenerate), update them everywhere.
- **Switching Supabase projects** — If you create a new Supabase project, all three Supabase variables change.
- **RapidAPI key expired** — Get a new key from your RapidAPI dashboard and update it.

---

## Security Reminders

- **Never share** `SUPABASE_SERVICE_ROLE_KEY` publicly — it has full admin access to your database
- **Never commit** `.env.local` to GitHub — it's already in `.gitignore` so this shouldn't happen
- If you accidentally expose a secret, **rotate it immediately** in Supabase and update everywhere
