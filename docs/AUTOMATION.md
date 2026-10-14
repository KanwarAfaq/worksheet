# Automated original worksheet generation and community review

The free-first Vercel cron runs once daily at 04:00 UTC.

Security: `GET /api/automation/generate` requires `Authorization: Bearer <CRON_SECRET>`.
Vercel sets the authorization header for scheduled invocations when CRON_SECRET is configured.

Environment:
- `SUPABASE_SERVICE_ROLE_KEY`: server-only, required for private R2 delivery and the autonomous agent
- `R2_BUCKET, R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY`: private R2 credentials
- `CRON_SECRET`: long randomly-generated nonpublic token; required by cron
- `AUTO_GENERATION_ENABLED=true`: opt-in switch to publish original worksheets automatically; default disabled

Automated generation is **original-content only**, with deterministic, audited Grade 1 addition and Grade 2 spelling templates. Each run produces up to two worksheets with PDF and editable DOCX versions. Checks verify question/answer counts, uniqueness, R2 re-read SHA-256, metadata, idempotent daily slugs, and existence of both formats before publication.

Community submissions are not blindly auto-published. The scheduled moderation stage checks basic metadata, permitted formats, checksum registration, and rights **attestation**, then flags them as needing content and copyright review. Neither copyright ownership nor file safety can be reliably established from an attestation and magic bytes alone.

Further work before unattended community publication: malware scanning, PDF/DOCX content extraction and moderation, copyright/rights validation, spam and abuse prevention, reporting/takedown.

Daily limits and billing are subject to Vercel plan restrictions and must be reviewed before enabling commercial use.
