---
phase: quick
plan: 260403-njm
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/auth/LoginForm.tsx
  - src/app/login/page.tsx
  - src/app/auth/callback/route.ts
autonomous: true
requirements: [quick-task]

must_haves:
  truths:
    - "User can sign up with email + password and is immediately logged in (auto-confirm)"
    - "User can sign in with email + password"
    - "Invalid credentials show clear error message"
    - "Auth callback route no longer exists"
    - "No 'check your email' flow remains in the UI"
  artifacts:
    - path: "src/components/auth/LoginForm.tsx"
      provides: "Email+password login form with sign-up/sign-in toggle"
      contains: "signUp|signInWithPassword"
    - path: "src/app/login/page.tsx"
      provides: "Updated welcome copy (no magic link mention)"
  key_links:
    - from: "src/components/auth/LoginForm.tsx"
      to: "supabase.auth.signUp / signInWithPassword"
      via: "createClient() from @/lib/supabase/client"
      pattern: "supabase\\.auth\\.(signUp|signInWithPassword)"
---

<objective>
Replace magic link authentication with email+password auth (auto-confirm enabled in Supabase).

Purpose: Eliminate the "check your email" friction and callback route. Users sign up or sign in instantly with email+password.
Output: Rewritten LoginForm with sign-up/sign-in modes, updated login page copy, deleted auth callback route.
</objective>

<execution_context>
@/Users/joao/.claude/get-shit-done/workflows/execute-plan.md
@/Users/joao/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/components/auth/LoginForm.tsx
@src/app/login/page.tsx
@src/app/auth/callback/route.ts
@src/context/AuthContext.tsx
@src/middleware.ts
</context>

<interfaces>
<!-- AuthContext stays unchanged — LoginForm does not import it. -->
<!-- LoginForm uses createClient from @/lib/supabase/client directly. -->
<!-- After successful signUp/signIn, Supabase client-side SDK fires onAuthStateChange -->
<!-- which AuthContext already listens to, so user state updates automatically. -->

From src/lib/supabase/client.ts:
```typescript
export function createClient(): SupabaseClient
```

From src/context/AuthContext.tsx:
```typescript
// onAuthStateChange listener already handles session updates from signUp/signIn
// No changes needed here
```

LoginForm props interface (keep unchanged):
```typescript
interface LoginFormProps {
  redirectPath: string
  errorParam: string | null
}
```
</interfaces>

<tasks>

<task type="auto">
  <name>Task 1: Rewrite LoginForm for email+password auth and update login page copy</name>
  <files>src/components/auth/LoginForm.tsx, src/app/login/page.tsx</files>
  <action>
Rewrite `src/components/auth/LoginForm.tsx` to replace magic link with email+password:

1. **State changes:**
   - Remove: `sent`, `secondsLeft`, `showResend` states (magic link flow)
   - Add: `password` state (string), `mode` state ('signin' | 'signup')
   - Keep: `name`, `email`, `loading`, `errorMessage`, `errorParam` handling

2. **Remove entirely:**
   - The `handleSend` and `handleResend` functions
   - The `sent` conditional return block (envelope icon, "Check your email", resend countdown)
   - The countdown useEffect

3. **Auth logic (handleSubmit):**
   - If `mode === 'signup'`: call `supabase.auth.signUp({ email, password, options: { data: name.trim() ? { full_name: name.trim() } : undefined } })`
   - If `mode === 'signin'`: call `supabase.auth.signInWithPassword({ email, password })`
   - On success: redirect with `window.location.href = redirectPath` (hard redirect like signOut does, ensures clean state)
   - On error: map error messages — "Invalid login credentials" to "Invalid email or password.", "User already registered" to "An account with this email already exists. Try signing in.", rate limit errors to existing rate_limit message, fallback to generic error

4. **Form UI updates:**
   - Keep the name field ONLY when `mode === 'signup'` (hide for sign-in)
   - Keep the email field as-is
   - Add password field after email: same styling as email input, `type="password"`, `autoComplete="new-password"` for signup / `autoComplete="current-password"` for signin, placeholder "Password", `minLength={6}`
   - Change submit button text: "Sign up" when signup mode, "Sign in" when signin mode
   - Add mode toggle link below the submit button: "Already have an account? Sign in" / "Don't have an account? Sign up" — styled as a text link with `color: var(--orange)`, `fontSize: '14px'`, `cursor: 'pointer'`, centered text
   - Keep the loading spinner exactly as-is
   - Keep the error display block exactly as-is

5. **Update AUTH_ERRORS:**
   - Remove `link_expired` entry
   - Add `invalid_credentials: "Invalid email or password."`
   - Add `user_exists: "An account with this email already exists. Try signing in."`
   - Keep `unknown` and `rate_limit`

6. **Update `src/app/login/page.tsx`:**
   - Change the subtitle paragraph from "Enter your email to receive a magic link and sign in." to "Sign in or create an account to continue."
   - Everything else in login/page.tsx stays exactly the same
  </action>
  <verify>
    <automated>cd /Users/joao/projects/visual-world-workbook && npx next build 2>&1 | tail -20</automated>
  </verify>
  <done>LoginForm renders email+password fields with sign-up/sign-in toggle. No magic link references remain. Login page subtitle updated. Build succeeds.</done>
</task>

<task type="auto">
  <name>Task 2: Delete auth callback route</name>
  <files>src/app/auth/callback/route.ts</files>
  <action>
Delete the file `src/app/auth/callback/route.ts` and its parent directories if empty:
- Remove `src/app/auth/callback/route.ts`
- Remove `src/app/auth/callback/` directory
- Remove `src/app/auth/` directory (if no other files remain in it)

This route handled magic link code exchange (`exchangeCodeForSession`) which is no longer needed with email+password auth.

Verify no other files import from or reference `/auth/callback`:
- The only reference was in LoginForm's `emailRedirectTo` which Task 1 already removed.
  </action>
  <verify>
    <automated>cd /Users/joao/projects/visual-world-workbook && test ! -f src/app/auth/callback/route.ts && npx next build 2>&1 | tail -5</automated>
  </verify>
  <done>Auth callback route deleted. No broken imports. Build succeeds.</done>
</task>

</tasks>

<verification>
- `npx next build` completes without errors
- No references to `signInWithOtp`, `magic link`, `check your email`, or `/auth/callback` remain in `src/`
- LoginForm.tsx contains `signUp` and `signInWithPassword` calls
- `src/app/auth/callback/route.ts` does not exist
</verification>

<success_criteria>
- Users can sign up with email+password (auto-confirm) and are immediately authenticated
- Users can sign in with email+password
- No magic link flow remnants exist in the codebase
- Auth callback route is removed
- Middleware, AuthContext, and admin auth are unchanged
- Build passes cleanly
</success_criteria>

<output>
After completion, create `.planning/quick/260403-njm-replace-magic-link-auth-with-email-passw/260403-njm-SUMMARY.md`
</output>
