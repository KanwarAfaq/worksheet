import { NextResponse } from 'next/server';
import { requireOwner } from '@/lib/admin-server';

export const dynamic = 'force-dynamic';
const reply = (payload: object, status: number) =>
  NextResponse.json(payload, { status, headers: { 'Cache-Control': 'private, no-store' } });

export async function GET(request: Request) {
  const access = await requireOwner(request);
  if (!access.ok) return reply({ error: 'Access denied.' }, access.status);
  const { data, error } = await access.db.from('worksheets')
    .select('id,title,slug,summary,status,category_id,grade_id,created_at')
    .order('created_at', { ascending: false }).limit(100);
  if (error) return reply({ error: 'Could not load worksheets.' }, 500);
  return reply({ worksheets: data || [] }, 200);
}

export async function POST(request: Request) {
  const access = await requireOwner(request);
  if (!access.ok) return reply({ error: 'Access denied.' }, access.status);
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return reply({ error: 'Invalid request body.' }, 400); }

  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const summary = typeof body.summary === 'string' ? body.summary.trim() : '';
  const categoryId = typeof body.category_id === 'string' ? body.category_id : '';
  const gradeId = typeof body.grade_id === 'string' && body.grade_id ? body.grade_id : null;
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (title.length < 3 || title.length > 140 || summary.length > 700 || !uuid.test(categoryId) || (gradeId && !uuid.test(gradeId)))
    return reply({ error: 'Enter a title (3–140 characters), valid subject and optional grade.' }, 400);

  const { data: category } = await access.db.from('categories').select('id')
    .eq('id', categoryId).eq('status', 'active').maybeSingle();
  if (!category) return reply({ error: 'Choose an active subject.' }, 400);

  const base = title.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'worksheet';
  const slug = base + '-' + crypto.randomUUID().slice(0, 8);
  const { data, error } = await access.db.from('worksheets')
    .insert({
      title, summary: summary || null, category_id: categoryId, grade_id: gradeId,
      slug, created_by: access.user.id, status: 'draft', source: 'manual'
    }).select('id,title,slug,status,created_at').single();

  if (error) return reply({ error: 'Unable to create draft. Check the selected grade and try again.' }, 400);
  return reply({ worksheet: data }, 201);
}
