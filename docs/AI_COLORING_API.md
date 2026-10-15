# AI worksheet integration
- Text models already supported by Worksheet Studio: CGU (local and compatible), Groq, NVIDIA NIM. These use text/chat-completion endpoints. They **do not imply image-model access**.
- `POST /api/ai/color-ideas`: verified contributor, 20 object-suggestion requests/day in Supabase. Uses configured chat models, safely parses object names; only suggestions, not images.
- `POST /api/ai/color-image`: verified contributor, existing five-AI-generations/day quota. Uses `https://api.openai.com/v1/images/generations` with server-only `AI_IMAGE_API_KEY`. The default `AI_IMAGE_MODEL` is `gpt-image-2`. Output must be valid bounded-size PNG, never public by default. Failed calls attempt a server-side quota refund.
- Built-in 12+ original vector drawings remain free with no sign-in or API credits. Arbitrary objects use image generation, not merely text-model classification.
- Add `AI_IMAGE_API_KEY` (image generation-enabled key with billing) and optionally `AI_IMAGE_MODEL` in Vercel. Redeploy. Never set NEXT_PUBLIC_ keys and never add API secrets to GitHub.
- Before high-volume use, implement spending alerts, stronger abuse controls, provider usage monitoring, output review, and cost limits. Model availability and pricing vary by provider.
- AI text models can also help generate worksheet drafts, summaries, grade/topic tags and educational quality checks. Verify results before auto-publication; do not automatically trust rights or content claims.
