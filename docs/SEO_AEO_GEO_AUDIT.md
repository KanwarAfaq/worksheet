# Worksheet Studio — SEO, AEO & GEO implementation and launch audit

Reviewed Oct 15, 2026. Codebase: GitHub `KanwarAfaq/worksheet`; preview: `https://worksheet-tau-six.vercel.app/`.
This document is a **code-based audit**, not proof of live Google indexing or site performance.

## Implemented
- Search-friendly titles and descriptions, canonical page URLs, English locale and OG/Twitter preview image.
- Structured data: Organization and WebSite site-wide, BreadcrumbList on hierarchy pages, LearningResource on published worksheet detail pages, FAQPage on a real FAQ page and HowTo on a visible printing guide.
- Actual answers on the FAQ page, original printing advice, human-readable worksheet previews and internal links.
- Dynamic `/sitemap.xml` containing primary landing pages, usable subject pages and **only published worksheets that meet a minimal metadata and public-file threshold**. The page-specific sitemap is not a substitute for quality editorial review.
- Robots rules avoid private APIs, accounts and admin URLs; faceted search URLs use noindex and a library canonical.
- English-focused worldwide content; no invented geographic office or fake localized hreflang pages.

## Critical launch blockers
1. **Search indexing intentionally OFF**: `ENABLE_SEARCH_INDEXING` defaults false. This produces `noindex`, `robots.txt` disallow-all and an empty sitemap. Keep disabled until the launch checklist below passes.
2. **Canonical domain**: replace Vercel preview origin with the domain once acquired. Set `NEXT_PUBLIC_SITE_URL=https://example.com` in Vercel, connect the domain and redirect alternate hostnames.
3. **Google Search Console**: add a verified Domain property using DNS TXT; or URL-prefix property for the preview. Set optional `GOOGLE_SITE_VERIFICATION` only when using HTML meta verification. After indexing is enabled, submit `https://yourdomain/sitemap.xml` once and monitor indexing. You do not need to manually resubmit the sitemap every day.
4. **Thin, legacy published items** (audited from DB, not from downloaded files): a published “Word Search” listing has the summary “Word Search” and an English legacy category; an “ABC” item is PPTX-only, while the public website serves PDF/raster images. Complete unique, verified descriptions and choose the supported format/category; do not create fabricated grade claims.
5. **Legal/privacy**: provide a dedicated public contact channel, actual rights/takedown process, retention/deletion controls, jurisdiction-appropriate privacy/terms, and consent rules for any analytics or AI-provider handling before public indexing. The current privacy page explicitly identifies remaining work.
6. **Quality and ownership**: human-check worksheets' educational correctness, redistribution rights, downloadable files and printed teacher/student separation. Do not publish unchecked automated or community submissions at scale.
7. **Deployment verification**: check successful production build and inspect homepage, `robots.txt`, `sitemap.xml`, FAQ, detailed worksheet and OG image with a real browser; external live requests were not independently accessible from the assistant's environment.

## GSC launch sequence
- Attach your domain to Vercel and select its preferred HTTPS hostname; configure `NEXT_PUBLIC_SITE_URL`.
- Review policies, populate at least several genuinely valuable original worksheets with clear grades, topics, descriptions and real previews.
- Set `ENABLE_SEARCH_INDEXING=true` in Vercel for the production environment **only**; redeploy.
- Validate robots/sitemap/metadata/schema with Search Console URL Inspection, Rich Results Test and live browser responses.
- Verify domain property; submit sitemap once; check Pages indexing and Performance regularly.
- Refresh sitemaps automatically on request through the dynamic route; no daily resubmission needed.

## AEO/GEO editorial principles
Answer real user questions near relevant activities, show grade, subject, difficulty and content format visibly, and make educational claims grounded in the actual worksheet. Include descriptive internal links and unique, authoritative explanations. Do not invent reviews, authors, teaching credentials, location claims or educational efficacy numbers. No AI-specific hacks or `llms.txt` are required by Google. Google does not promise AI citations or ranking from adding JSON-LD alone.

## Optional growth work
- Expand useful original worksheet inventory across Grade 1–6 gaps with editorial quality checks.
- Add worksheet topic landing pages only where sufficient nonduplicative resources exist.
- Consider image previews with descriptive alt text and performance-optimized thumbnails.
- Test Core Web Vitals with PageSpeed Insights / Search Console; code-only audit cannot verify LCP or CLS.
- Build actual support/takedown pages once the owner provides public contact details.
