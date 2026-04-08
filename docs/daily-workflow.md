# Daily Workflow

This is the day-to-day process for making changes to the site. You'll use **Claude Code** to make all changes — it handles editing files, committing, and pushing to GitHub for you.

## Prerequisites (One-Time Setup)

You need these installed on your computer:

1. **Node.js** (version 20 or higher) — Download from https://nodejs.org (pick the LTS version)
2. **Git** — Download from https://git-scm.com/downloads
3. **Claude Code** — See [Using Claude Code](./using-claude-code.md) for installation

### First-Time Project Setup

Open your terminal (Terminal app on Mac, Command Prompt on Windows) and run these commands one at a time:

```bash
git clone https://github.com/YOUR_USERNAME/visual-world-workbook.git
```

```bash
cd visual-world-workbook
```

```bash
npm install
```

```bash
cp .env.example .env.local
```

Then open `.env.local` in your editor and fill in the values. See [Environment Variables](./environment-variables.md) for where to find each value.

---

## The Workflow (Every Time You Make a Change)

### Step 1: Open Claude Code

Open your terminal, go to the project folder, and start Claude Code:

```bash
cd visual-world-workbook
```

```bash
claude
```

### Step 2: Ask Claude Code to pull the latest version

Before making changes, tell Claude:

> "Pull the latest code from GitHub"

This makes sure you have the most recent version.

### Step 3: Start the local server

Tell Claude:

> "Start the dev server"

Or run it yourself in a separate terminal window:

```bash
npm run dev
```

Then open your browser to `http://localhost:3000` — you'll see the site running locally.

### Step 4: Tell Claude Code what to change

Describe what you want in plain English. See [Using Claude Code](./using-claude-code.md) for tips on how to phrase requests and examples of common tasks.

### Step 5: Review and test

After Claude makes changes:
- Check the site in your browser at `http://localhost:3000`
- Click around the pages that were changed
- Make sure nothing looks broken
- Check on mobile too (resize your browser window)

### Step 6: Deploy

Once you're happy with the changes, tell Claude:

> "Commit these changes and push to GitHub"

Claude will write a commit message, commit, and push. This automatically triggers a deployment on Vercel.

### Step 7: Verify the deployment

1. Go to https://vercel.com and log in
2. Click on the project
3. You'll see the new deployment building (takes 1-2 minutes)
4. Once it shows a green checkmark, the live site is updated
5. Visit the live site to double-check everything looks good

---

## Quick Reference

| What you want to do | Tell Claude Code |
|---------------------|-----------------|
| Pull latest code | "Pull the latest code from GitHub" |
| Start local server | "Start the dev server" (or run `npm run dev` yourself) |
| Make a change | Describe what you want in plain English |
| Deploy changes | "Commit these changes and push to GitHub" |
| Undo uncommitted changes | "Undo all my changes" |
| Check for errors | "Run the build and check for errors" |
