---
phase: quick
plan: 1
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/auth/LoginForm.tsx
  - src/components/layout/Sidebar.tsx
  - src/components/auth/UserModal.tsx
autonomous: true
requirements: []
must_haves:
  truths:
    - "Login form shows an optional name field above the email field"
    - "Name is passed as full_name in user_metadata via signInWithOtp data option"
    - "Sidebar avatar shows first letter of name when available, falls back to email initial"
    - "UserModal displays name above email when available"
  artifacts:
    - path: "src/components/auth/LoginForm.tsx"
      provides: "Optional name input + signInWithOtp data param"
      contains: "full_name"
    - path: "src/components/layout/Sidebar.tsx"
      provides: "Avatar initial from user_metadata.full_name with email fallback"
      contains: "user_metadata"
    - path: "src/components/auth/UserModal.tsx"
      provides: "Name display above email"
      contains: "name"
  key_links:
    - from: "src/components/auth/LoginForm.tsx"
      to: "supabase.auth.signInWithOtp"
      via: "data: { full_name: name }"
      pattern: "data.*full_name"
    - from: "src/components/layout/Sidebar.tsx"
      to: "src/components/auth/UserModal.tsx"
      via: "name prop passed from user.user_metadata"
      pattern: "user_metadata.*full_name"
---

<objective>
Add an optional name field to the login form so users can identify themselves beyond just email. Pass the name to Supabase user_metadata via signInWithOtp, and display it in the sidebar avatar and user modal.

Purpose: Personalize the user experience by showing names instead of just email initials.
Output: Updated LoginForm, Sidebar, and UserModal components.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/components/auth/LoginForm.tsx
@src/components/layout/Sidebar.tsx
@src/components/auth/UserModal.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add optional name field to LoginForm and pass to signInWithOtp</name>
  <files>src/components/auth/LoginForm.tsx</files>
  <action>
1. Add a `name` state variable initialized to empty string (alongside existing `email` state, line 18 area).

2. Add a name input field BEFORE the email input (before line 186). Use the same styling pattern as the email input. Key differences:
   - id="name", type="text", placeholder="Your name (optional)"
   - NOT required (no `required` attribute)
   - No `autoFocus` (keep autoFocus on email)
   - autoComplete="name"
   - Label text: "Your name" with "(optional)" in normal weight
   - Same label styling (12px, uppercase, var(--dim), etc.)
   - Same input styling (var(--card) background, var(--border), var(--radius-md), etc.)
   - Same onFocus/onBlur border color transition

3. In the `handleSend` function (line 50-74), update the signInWithOtp call to pass the name in the data option. Change from:
   ```
   options: {
     emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectPath)}`,
   }
   ```
   To:
   ```
   options: {
     emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectPath)}`,
     data: name.trim() ? { full_name: name.trim() } : undefined,
   }
   ```
   Only send data when name is non-empty so we don't overwrite existing metadata with empty values.

4. Do NOT change the submit button disabled logic — it should still only require email (name is optional).
  </action>
  <verify>
    <automated>cd /Users/joao/projects/visual-world-workbook && npx next build 2>&1 | tail -5</automated>
  </verify>
  <done>Login form renders name field above email. Name is optional. signInWithOtp passes full_name in data when provided.</done>
</task>

<task type="auto">
  <name>Task 2: Update Sidebar avatar and UserModal to display name</name>
  <files>src/components/layout/Sidebar.tsx, src/components/auth/UserModal.tsx</files>
  <action>
**Sidebar.tsx changes:**

1. Line 393 — Update the avatar initial to prefer full_name from user_metadata. Change:
   ```
   {user.email ? user.email[0].toUpperCase() : '?'}
   ```
   To:
   ```
   {user.user_metadata?.full_name
     ? user.user_metadata.full_name[0].toUpperCase()
     : user.email
       ? user.email[0].toUpperCase()
       : '?'}
   ```

2. Lines 397-401 — Update the UserModal rendering to pass name prop. Change:
   ```
   <UserModal
     email={user.email ?? ''}
     onSignOut={signOut}
     onClose={() => setModalOpen(false)}
   />
   ```
   To:
   ```
   <UserModal
     email={user.email ?? ''}
     name={user.user_metadata?.full_name ?? undefined}
     onSignOut={signOut}
     onClose={() => setModalOpen(false)}
   />
   ```

**UserModal.tsx changes:**

1. Update the UserModalProps interface to add optional name:
   ```
   interface UserModalProps {
     email: string
     name?: string
     onSignOut: () => void
     onClose: () => void
   }
   ```

2. Destructure `name` in the component function params.

3. Replace the email paragraph (lines 43-55) with a block that shows name and email. When name exists, show name as the primary line (13px, var(--text), fontWeight 600) and email below as secondary (12px, var(--dim)). When no name, show email as before (13px, var(--text)). Both lines should have overflow: hidden, textOverflow: ellipsis, whiteSpace: nowrap. The name line title attribute should be the full name. The email line title should be the email.
  </action>
  <verify>
    <automated>cd /Users/joao/projects/visual-world-workbook && npx next build 2>&1 | tail -5</automated>
  </verify>
  <done>Sidebar avatar shows name initial when available (falls back to email initial). UserModal shows name above email when available. Build passes with no type errors.</done>
</task>

</tasks>

<verification>
- Build succeeds without type errors
- Login form shows optional name field above email
- Sidebar avatar uses name initial when user_metadata.full_name exists
- UserModal shows name and email when name available, email only otherwise
</verification>

<success_criteria>
- Optional name input renders above email on login page
- signInWithOtp sends full_name in data option when name provided
- Sidebar avatar initial prefers full_name over email
- UserModal displays name prominently with email as secondary when name exists
- No TypeScript errors, build passes clean
</success_criteria>

<output>
After completion, create `.planning/quick/260403-esz-add-optional-name-field-to-login-form-pa/260403-esz-SUMMARY.md`
</output>
