# Daily AI worksheet automation

GitHub Actions workflow: `.github/workflows/daily-worksheet-agent.yml`
- Every day at 01:00 UTC (09:00 Asia/Taipei), the workflow sends **5 sequential** authenticated requests to `https://worksheet.live/api/automation/generate?slot=1..5`.
- Each request generates exactly one private illustrated PDF draft + teacher answer key in Cloudflare R2 and Supabase. The daily slugs are idempotent; retries do not duplicate completed worksheets.
- The final slot checks the community review queue and sends one admin LINE summary.
- Every generated worksheet stays `draft` until an owner reviews/publishes it.
- The Vercel Cron was removed to avoid duplicate triggers and a 5-worksheet job timing out.

**The GitHub workflow cannot execute until setup is complete:**
1. Under GitHub → Settings → Secrets and variables → Actions, create `WORKSHEET_CRON_SECRET` with the **same value** as Vercel's `CRON_SECRET`. Do not put it in source or chat.
2. Set Vercel Production `AUTO_GENERATION_ENABLED=true`. Redeploy Vercel.
3. Run GitHub → Actions → Daily worksheet agent (5 private drafts) → Run workflow once. Verify five unique drafts, associated verified PDF and answer key files, and admin LINE message.
4. Ensure the production domain and Vercel deployment are healthy. Monitor Action failures and API costs.

Owner manual generation: Admin → AI worksheet test → choose Math / English / Color counts (up to 10 total).
Manual generated documents use unique per-request IDs and do not change the daily schedule.
User-facing AI maker is limited to 3 daily shared text/color-image generations.
