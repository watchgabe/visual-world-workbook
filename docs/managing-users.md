# Managing Users

## Admin Dashboard

The app has a built-in admin dashboard at `/admin` on your site. Only users with the admin role can access it.

The admin dashboard lets you:
- See all registered users
- View each user's progress through the modules
- **Make a user an admin or remove admin access** (toggle button on the user detail panel)
- Delete users
- Manage Circle community integration settings

---

## Making Someone an Admin

### From the Admin Dashboard (easiest)

1. Go to `/admin` on your site
2. Click on a user to open their detail panel
3. Click the **toggle admin role** button
4. The user now has (or no longer has) admin access

### From Supabase (alternative)

If you can't access the admin dashboard (e.g., you're the only admin and got locked out):

1. Go to **Supabase Dashboard** (https://supabase.com → your project)
2. Click **Authentication** in the left sidebar
3. Click **Users**
4. Find the user and click the three dots (⋯) → **Edit User**
5. In the **App Metadata** field, set:
   ```json
   {"role": "admin"}
   ```
6. Click **Save**

To remove admin access via Supabase, change the metadata to:
```json
{}
```

---

## Resetting a User's Password

1. Go to **Supabase Dashboard** → **Authentication** → **Users**
2. Find the user
3. Click the three dots (⋯) → **Send Password Recovery**
4. The user will receive an email with a reset link

**Note:** Make sure the user's email is correct and that emails are not going to spam.

---

## Deleting a User

You can delete users from:

- **The admin dashboard** (`/admin` on your site) — click the delete button next to the user
- **Supabase Dashboard** → **Authentication** → **Users** → three dots → **Delete User**

**Warning:** Deleting a user removes their account but their saved responses remain in the database. This is by design — it preserves data integrity.

---

## Viewing User Data

User responses (their workshop answers) are stored in the `blp_responses` table in Supabase.

To view raw data:

1. Go to **Supabase Dashboard** → **Table Editor**
2. Click on `blp_responses`
3. You can filter by user ID to see a specific user's answers

Each row contains:
- `user_id` — which user
- `field_key` — which form field
- `value` — what they typed
- `updated_at` — when they last saved

---

## Common Questions

**Q: How many users can the app handle?**
A: Supabase free tier supports up to 50,000 monthly active users. The Pro plan ($25/month) removes this limit.

**Q: Can I export user data?**
A: Yes — in Supabase Table Editor, you can export the `blp_responses` table as CSV.

**Q: Can users sign up on their own?**
A: Yes, anyone can create an account with their email and password at the login page. If you want to restrict signups, you can disable "Enable Email Signup" in Supabase Dashboard → Authentication → Providers → Email.
