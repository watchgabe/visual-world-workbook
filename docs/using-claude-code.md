# Using Claude Code

Claude Code is an AI assistant that runs in your terminal and can read, edit, and create files in your project. This is how you'll make all changes to the site — you describe what you want in plain English, and Claude Code handles the code.

## Installing Claude Code

1. Make sure you have Node.js installed (see [Daily Workflow](./daily-workflow.md))
2. Install Claude Code:
   ```bash
   npm install -g @anthropic-ai/claude-code
   ```
3. Run it from your project folder:
   ```bash
   cd visual-world-workbook
   claude
   ```
4. The first time, it will ask you to sign in with your Anthropic account

---

## Best Practices

### 1. Always work from the project folder

Before starting Claude Code, make sure you're in the right folder:
```bash
cd visual-world-workbook
```

### 2. Be specific about what you want

Bad:
> "Fix the brand foundation page"

Good:
> "In the brand foundation overview section, change the heading from 'Welcome to Brand Foundation' to 'Start Building Your Brand Foundation'"

The more specific you are, the better the result.

### 3. Ask Claude to test before committing

After Claude makes changes, always ask:
> "Run the dev server and make sure there are no errors"

Or run it yourself:
```bash
npm run dev
```

Check the site in your browser before deploying.

### 4. Review changes before accepting

Claude Code shows you diffs (before/after) of every change it makes. Read through them:
- Does the change match what you asked for?
- Did it accidentally change something else?
- Does the text look right?

You can accept or reject each change.

### 5. One task at a time

Don't ask for 10 things at once. Make one change, verify it works, then move on:

1. "Change the heading on the overview page" → verify → accept
2. "Add a new tip box in the core values section" → verify → accept
3. "Update the placeholder text in the origin story field" → verify → accept

### 6. Ask Claude to commit and push for you

Once you've verified the changes work, you can say:
> "Commit these changes with the message 'Updated brand foundation headings' and push to GitHub"

This will deploy the changes to the live site.

---

## Common Tasks You Can Ask Claude Code

### Editing text
> "In the brand foundation overview, change the paragraph that says 'old text' to say 'new text'"

### Adding a section tip
> "Add a pro tip box at the end of the core-values section that says 'Think about what your customers value most'"

### Changing form labels
> "In the avatar section, change the label 'Target Audience' to 'Your Ideal Customer'"

### Changing placeholder text
> "Change the placeholder in the origin-story textarea from 'Tell your story...' to 'Share the journey that led you to start your brand...'"

### Understanding the code
> "Explain what the color-palette section does and how users interact with it"

### Finding where something is
> "Where is the text 'Build Your Visual World' in the codebase?"

### Checking for errors
> "Run the build and tell me if there are any errors"

---

## Things to Avoid

### Don't ask Claude to change database field keys
> "Rename the fieldKey from 'core_mission' to 'brand_mission'"

This will break saved data for all existing users. Field keys must stay the same.

### Don't ask Claude to change the authentication system
The auth system (Supabase email/password) is tightly integrated. Changing it requires deep knowledge of the codebase.

### Don't ask Claude to modify environment variables in code
If you need to add or change a secret key, do it in `.env.local` and Vercel settings (see [Environment Variables](./environment-variables.md)), not in the source code.

### Don't ask Claude to "improve" or "refactor" things
Stick to specific, intentional changes. Open-ended requests like "make this better" can introduce unintended changes.

---

## If Something Goes Wrong

If Claude makes a change that breaks things:

1. **Don't panic** — nothing is deployed until you push to GitHub
2. **Tell Claude to undo it:**
   > "Undo all changes you just made"
3. **If you already committed but didn't push:**
   > "Undo the last commit"
4. **If you already pushed**, see [Troubleshooting](./troubleshooting.md) for how to revert a deployment on Vercel

---

## Useful Claude Code Commands

| Command | What it does |
|---------|-------------|
| `/help` | Show available commands |
| `/clear` | Clear the conversation and start fresh |
| `Ctrl + C` | Cancel the current operation |
| `Escape` | Exit Claude Code |

---

## Cost

Claude Code requires an Anthropic API account. Usage is billed based on how much you use it. Simple text edits cost very little (a few cents). For current pricing, see https://www.anthropic.com/pricing.

Alternatively you can use it through a Claude Max subscription ($100/month or $200/month) which includes generous Claude Code usage.
