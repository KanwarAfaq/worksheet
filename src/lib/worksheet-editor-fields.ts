export type EditableWorksheet = {
  title: string; summary: string | null; description: string | null;
  category_id: string; grade_id: string | null; difficulty: string | null;
  language: string; tags: string[]; seo_title: string | null;
  seo_description: string | null; featured: boolean; status: 'draft' | 'archived';
};

export function parseEditableWorksheet(body: Record<string, unknown>): EditableWorksheet | null {
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const summary = typeof body.summary === 'string' ? body.summary.trim() : '';
  const description = typeof body.description === 'string' ? body.description.trim() : '';
  const category_id = typeof body.category_id === 'string' ? body.category_id : '';
  const grade_id = body.grade_id === null || body.grade_id === '' || body.grade_id === undefined
    ? null : typeof body.grade_id === 'string' ? body.grade_id : 'invalid';
  const difficulty = body.difficulty === null || body.difficulty === '' || body.difficulty === undefined
    ? null : body.difficulty;
  const language = typeof body.language === 'string' ? body.language.trim().toLowerCase() : 'en';
  const tags = Array.isArray(body.tags) ? body.tags : [];
  const seo_title = typeof body.seo_title === 'string' ? body.seo_title.trim() : '';
  const seo_description = typeof body.seo_description === 'string' ? body.seo_description.trim() : '';
  const featured = body.featured === true;
  const status = body.status === 'archived' ? 'archived' : body.status === 'draft' || body.status === undefined ? 'draft' : null;
  const cleanedTags = tags.map(item => typeof item === 'string' ? item.trim().toLowerCase() : '').filter(Boolean);
  if (
    title.length < 3 || title.length > 140 || summary.length > 700 ||
    description.length > 8000 || !uuid.test(category_id) || (grade_id !== null && !uuid.test(grade_id)) ||
    (difficulty !== null && !['beginner', 'intermediate', 'advanced'].includes(String(difficulty))) ||
    !/^[a-z]{2,3}(?:-[a-z]{2})?$/.test(language) ||
    tags.length > 12 || cleanedTags.some(tag => tag.length > 32 || !/^[\p{L}\p{N} -]+$/u.test(tag)) ||
    seo_title.length > 70 || seo_description.length > 180 || !status ||
    (body.featured !== undefined && typeof body.featured !== 'boolean')
  ) return null;
  return {
    title, summary: summary || null, description: description || null,
    category_id, grade_id, difficulty: difficulty === null ? null : String(difficulty),
    language, tags: [...new Set(cleanedTags)],
    seo_title: seo_title || null, seo_description: seo_description || null,
    featured, status
  };
}
