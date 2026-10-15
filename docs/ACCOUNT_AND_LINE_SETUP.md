# Worksheet Studio account and LINE notification setup

This checklist applies **only to Worksheet Studio**.

## Supabase Authentication
In Supabase project `ijikaqxgsfsakdtzzgkc`, enable Email and Google under Authentication → Providers.
- Email/password signup is already implemented. Keep confirmation emails enabled.
- For email code sign-in, edit the **Magic Link** email template to include `{{ .Token }}` (6-digit OTP) instead of relying only on a confirmation link. Keep the Confirm signup template intact.
- Enable Google provider using OAuth credentials from Google Cloud. In Google Cloud's OAuth client, authorize Supabase's callback URL displayed in the provider settings.
- In Supabase Authentication → URL Configuration, add `https://worksheet-tau-six.vercel.app/contribute` as an allowed redirect URL (and localhost callback for development).

## Vercel environment variables (Production)
```text
LINE_CHANNEL_ACCESS_TOKEN=<LINE Messaging API channel access token>
LINE_ADMIN_USER_ID=<recipient's LINE user ID, after the bot is added>
WORKSHEET_WEBHOOK_SECRET=<random long secret shared with Supabase database webhook>
NEXT_PUBLIC_SITE_URL=https://worksheet-tau-six.vercel.app
```
Never put tokens in GitHub commits, client-side variables, screenshots, or chat.

## LINE alert events
- Verified user PDF/DOCX upload
- User submits worksheet for review
- Google/password sign-in, deduplicated by authenticated session in `worksheet_signin_notices` (new accounts signing in shortly after creation are labeled as registrations)
- Direct registration webhook (optional backup mechanism, not yet configured)

Set up a Supabase **Database Webhook** on schema `auth`, table `users`, `INSERT`, URL:
`https://worksheet-tau-six.vercel.app/api/webhooks/user-registered`
Add header `x-worksheet-webhook-secret` with the secret above.
Depending on dashboard restrictions, an auth.users webhook may require a SQL trigger with pg_net or a Supabase Edge Function instead; verify supported options before enabling.
The user registration route rejects all requests without the configured secret and expected event shape.

### Important
These hooks are best-effort, not durable delivery. For high-volume or guaranteed alerts, use a transactional outbox, retries, and deduplication. Additional admin events (moderation decisions, failed scheduled jobs, account security alerts) are future extensions.
Test a new signup, one legitimate PDF upload and a submission after credentials and webhook configuration. Inspect LINE delivery logs before claiming success.

## Work remaining before production
- Verify auth/email templates and Google Cloud consent screen in Supabase.
- Run type checks, integration tests and browser QA for mobile navigation, light/dark persistence and login redirects.
- Verify protected download gateway, review permissions, PDFs, and upload abuse limits.
- Review all admin event types and extend notification coverage only where appropriate.

## Troubleshooting Google login / missing LINE alerts
- Google OAuth succeeding does **not** imply a registration webhook has been configured.
- The account page posts a verified, session-deduplicated login event to `/api/account/signin-notice`.
- If LINE secrets are missing, invalid, or the bot cannot reach the admin user, this endpoint returns a server error and does not mark the alert delivered. Check Vercel runtime logs and LINE Messaging API channel permissions.
- The Messaging API bot must be added as a friend by the admin LINE user.
- A user registered by email but not yet signed in is not covered by the login event. Enable a secure `auth.users` webhook for immediate email registrations. Never send a webhook without an authentication secret.
- `WORKSHEET_WEBHOOK_SECRET` is only required for the separate registration webhook, not the authenticated sign-in endpoint.
- Save/like and avatar records use RLS and only their owners can read them.
