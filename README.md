# Brand Launch Playbook — Maintenance Guide

Welcome! This folder contains everything you need to maintain, update, and manage the Brand Launch Playbook application.

## Quick Links

| Guide | What it covers |
|-------|---------------|
| [Daily Workflow](./docs/daily-workflow.md) | Running the project locally, testing, and deploying changes |
| [Editing Content](./docs/editing-content.md) | How to edit module text, add sections, and update course material |
| [Environment Variables](./docs/environment-variables.md) | All API keys and secrets — where they live, how to change them |
| [Custom Domain](./docs/custom-domain.md) | Changing or adding a custom domain on Vercel |
| [Managing Users](./docs/managing-users.md) | Admin dashboard, promoting admins, resetting passwords |
| [Using Claude Code](./docs/using-claude-code.md) | Best practices for using Claude Code to make changes safely |
| [Troubleshooting](./docs/troubleshooting.md) | Common issues and how to fix them |
| [Architecture Overview](./docs/architecture-overview.md) | High-level explanation of how the app is built (for reference) |

## The Golden Rule

**Always test locally before pushing to GitHub.** When you push code to GitHub, the live site updates automatically. If a bad deploy goes out, you can revert it (see [Troubleshooting](./docs/troubleshooting.md)), but it's always better to catch problems before they go live.

## Need Help?

If something breaks and you can't figure it out from these guides, the most useful things to share with a developer are:

1. What you asked Claude Code to do
2. What you expected to happen
3. What actually happened (screenshot the error if possible)
4. The Vercel deployment logs (see [Troubleshooting](./docs/troubleshooting.md))
