# Worksheet Studio AI provider setup (server-side only)

The AI maker requires a logged-in Supabase account and has an atomic 5-generations-per-user-per-UTC-day quota. It generates a validated JSON question set, and the browser renders printable student PDF/PNG and separate teacher PDF. It does **not** automatically publish user-generated content.

## Provider fallback (first success wins)
1. CGU Local: `CGU_API_KEY`, default `CGU_LOCAL_MODEL=gpt-oss:20b`
2. CGU OpenAI-compatible: same `CGU_API_KEY`, default `CGU_COMPAT_MODEL=gpt-oss-120b` (school pool). For a permitted OpenAI-cost model choose `gpt-6-luna`; check the account's `/models` endpoint.
3. Groq: `GROQ_API_KEY`, default `GROQ_MODEL=llama-3.3-70b-versatile`
4. NVIDIA NIM: `NVIDIA_NIM_API_KEY`, default `NVIDIA_NIM_MODEL=meta/llama-3.3-70b-instruct`

CGU Base URL: `https://air.cgu.edu.tw/cgullmapi/v1`
CGU API guide: `https://air.cgu.edu.tw/workspace4/LLMAPI/api_call.html`

All routes are server-only. Add keys to **Vercel → Worksheet → Settings → Environment Variables → Production** (and Preview if testing). Never add secret keys to `NEXT_PUBLIC_`, GitHub source, or screenshots.

The API route follows each provider's OpenAI-compatible chat completions endpoint, with request timeouts and schema validation. A provider may fail because the model isn't available on your account or due to quota; failed providers are skipped. The server returns a generic error to avoid exposing keys.

## Operations
- Use the signed-in account UI at `/create/ai`.
- For scheduled automation, use a separate authenticated, admin-only cron endpoint with `CRON_SECRET` and a distinct generation quota. Do **not** expose the browser generation endpoint to GitHub Actions using someone else's access token.
- Review questions and answers before publishing. Teacher answer keys must be private.
- For image-first illustrations, use a separate image-generation API integration; this release exports the *worksheet page* as PNG and does not call image generation.
- The old original deterministic agent still needs refactoring to remove DOCX output before enabling automatic publishing. Leave `AUTO_GENERATION_ENABLED=false` until then.
