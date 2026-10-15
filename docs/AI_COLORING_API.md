# AI worksheet and coloring APIs

Official CGU image documentation: https://air.cgu.edu.tw/workspace4/LLMAPI/api_call_en.html

## Image generation through existing CGU account
- `CGU_API_KEY`: existing server-only key for CGU gateway (must be set in Vercel production).
- `CGU_IMAGE_MODEL=chatgpt-image-latest` (optional); alternatives listed by CGU are `gpt-image-2`, `gpt-image-1.5`, `gpt-image-1`, `gpt-image-1-mini`.
- Backend uses `POST https://air.cgu.edu.tw/cgullmapi/v1/images/generations`, not CGU's text/chat endpoint.
- CGU's documented model catalogue is not proof of account authorization. Check `GET /v1/models` using your own key and `GET /v1/me/usage` for remaining quotas.
- CGU school/local models use *local token quota*, whereas image models consume the **OpenAI cost quota (USD)**. Monitor spending and quotas before switching on broadly.
- The code chooses CGU if `CGU_API_KEY` exists; otherwise it can use optional direct `AI_IMAGE_API_KEY` and `AI_IMAGE_MODEL`. Keys remain on the backend.
- The image endpoint permits 1–4 distinct objects, verifies authenticated account, enforces five AI generations daily, checks returned PNG bytes and caps response size.
- Built-in drawing templates continue to work without sign-in or provider credits; arbitrary requests require an image-capable model.
- The `/api/ai/color-ideas` endpoint uses CGU/Groq/NIM text models to suggest drawable object names, not to generate pixels. Suggestions are limited to 20 per verified user per day.
- Image results are temporary in browser memory; worksheets are **not automatically published**.

## Important operational checks
- Test one actual CGU image request using a signed-in test account; compilation alone cannot verify API key permission or remaining balance.
- Configure billing alerts and spending controls in the CGU portal, plus abuse monitoring on production.
- For future deployment: content moderation, explicit public-upload consent, provider error rate tracking, image-result format handling, and improved per-request quota accounting under concurrency.
