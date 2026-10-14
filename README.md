# Worksheet Studio

A free-first, accessible educational worksheet website built from the **Worksheet Website Complete Implementation Plan v1.2**.

## Stage 1: responsive public website and three generators

- Home, English/Mathematics/Coloring category pages, browsing sample catalog and worksheet detail examples.
- Word Search, Word Scramble, Missing Letters worksheet makers, deterministic seeded logic, print preview, optional answer keys, and client-side PDF export.
- Responsive design with vector/CSS illustrations (no paid image API).
- TypeScript + Next.js 15 + React 19 + Lucide icons + jsPDF.
- Supabase foundation database created in project `ijikaqxgsfsakdtzzgkc`; all 16 tables have RLS.
- **Not yet complete:** live worksheets, admin authentication and management dashboard, R2 protected file gateway, batch publishing, production SEO, content rights verification.

Sample catalog cards are **placeholders** rather than downloadable files and are not included in the published worksheet sitemap.

## Local development

Requirements: Node.js 22+

```bash
npm install
npm run dev
npm run lint
npm test
npm run build
```

Visit http://localhost:3000.

## Preview deployment

Follow [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) to connect Vercel to this GitHub repository and enable automatic deployment. Secrets are not required to browse the sample pages or use the local-only worksheet generators.

## Security

- No visitors sign up or upload files in MVP.
- Anonymous generator inputs stay in the browser.
- Supabase database uses RLS; sensitive file keys are not exposed via public APIs.
- Public R2 bucket URLs will **not** be enabled; v1.2 requires website-first access via a checked first-party gateway.
- Before production, verify print/PDF layouts and conversion/font correctness with full browser QA.

## Next steps

1. Check Vercel build and browser interactions.
2. Add Supabase-backed worksheet queries and authenticated admin sign-in.
3. Implement private R2 objects, verified SHA-256 upload pipeline and first-party downloads.
4. Implement admin editor, review workflow, batch generation, audit trails, backups and publication.
5. Upload licensed worksheets and complete SEO/testing.

**Domain** will be purchased when the site is ready. **Admin email:** kmafaq2@gmail.com.
