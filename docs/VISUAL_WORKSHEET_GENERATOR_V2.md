# Illustrated AI worksheet generation v2

Original vector PDFs. Five slots:
1. Early Math: picture-counting addition with fruit or garden drawings
2. Early English: six word-to-picture matching cards with original animal/nature icons
3. Colors: large black-outline shape robot or rocket with a color key
4. Higher Math: eight arithmetic puzzle cards with large answer circles
5. Upper English: 11 × 11 word-search grid with eight validated theme words

The AI selects a small topic/theme and permitted vocabulary from a bounded set.
All pictures, correct arithmetic, grid words and printable geometry are generated
and validated by deterministic layout code. There are no copyrighted worksheet
images, logos or copied illustrations.

For each slot, the agent saves BOTH a student PDF and an admin-only teacher key PDF,
verifies R2 SHA-256 of both, and creates a PRIVATE draft. It never auto-publishes.
Manual owner test at `/admin` -> `Run 5 AI worksheet test` creates visual-v2 slugs
`daily-ai-visual2-YYYY-MM-DD-N`, leaving older text-heavy drafts untouched.
A second run that day reuses the successful draft links.
All text for students is brief; the designs print on one A4 page.

CAUTION: AI-selected themes/words are suggestions, not a guarantee of pedagogical
quality. Educator review is required. Never use reference worksheets or external
copyrighted drawings as source assets for a published PDF.
