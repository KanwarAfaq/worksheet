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
- New user registration, once the database webhook is configured

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
