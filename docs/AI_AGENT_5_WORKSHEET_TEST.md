# Run a five-worksheet AI agent test

Owner interface: https://worksheet.live/admin

1. Sign in as the owner.
2. Under **AI worksheet test**, select **Run 5 AI worksheet test**.
3. Confirm the real API quota/storage usage.
4. The page makes five sequential owner-authenticated requests to `POST /api/admin/automation/test` with `{"slot":1}` through `{"slot":5}`. Each request attempts **one** worksheet (to stay within Vercel's execution limit).
5. Wait for a result in each of the five slots. Click **Review PDF** to inspect an actual privately stored one-page worksheet, or choose **Drafts** in Worksheet manager and open an AI Practice item.
6. **Preview & publish** shows the student PDF, metadata, and private file; publish only after inspecting educational accuracy. Use **Reject & delete** for poor-quality agent drafts.
7. The test **does not publish**, change `AUTO_GENERATION_ENABLED`, or turn on Vercel cron. Keep the automation switch disabled until approved.

## Expected outcomes

Five slots: Math, English, Color and Shapes, Math, English (subject categories Math / Reading / Colors). The current Color and Shapes agent produces **text-based shape instructions** rather than an AI-drawn coloring illustration. Each PDF has up to eight questions and answer lines on a single A4 page. There are **no answer-key files from this AI agent yet**; owners must verify solutions manually.

The job uses `daily-ai-<Taipei-date>-<1..5>` slugs. A second test on the same Taiwan-local date **skips completed slots**; failed slots can be retried. It consumes real configured AI provider quota and writes files to private R2. Results may include per-slot failure reasons. A model connectivity PASS alone is not enough to guarantee long-form structured worksheet generation.

## Security

Owner Supabase authentication required, and all generated items are private drafts. No public publish RPC is called. No API keys are returned. The cron endpoint still requires `CRON_SECRET` and `AUTO_GENERATION_ENABLED=true`.
