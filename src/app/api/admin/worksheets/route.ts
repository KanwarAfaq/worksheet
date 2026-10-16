import { NextResponse } from 'next/server';
import { requireOwner } from '@/lib/admin-server';
import { parseEditableWorksheet } from '@/lib/worksheet-editor-fields';

export const dynamic = 'force-dynamic';
const reply = (payload: object, status: number) =>
  NextResponse.json(payload, { status, headers: { 'Cache-Control': 'private, no-store' } });

export async function GET(request: Request) {
  const access = await requireOwner(request);
  if (!access.ok) return reply({ error: 'Access denied.' }, access.status);
  const { data, error } = await access.db.from('worksheets')
    .select('id,title,slug,summary,status,category_id,grade_id,created_at,updated_at,worksheet_files(id)')
    .order('created_at', { ascending: false }).limit(100);
  if (error) return reply({ error: 'Could not load worksheets.' }, 500);
  return reply({ worksheets: (data||[]).map(({worksheet_files,...row})=>({
  ...row,file_count:worksheet_files?.length||0
 })) }, 200);
}

export async function POST(request: Request) {
  const access = await requireOwner(request);
  if (!access.ok) return reply({ error: 'Access denied.' }, access.status);
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return reply({ error: 'Invalid request body.' }, 400); }
  const valid = parseEditableWorksheet({ ...body, status: 'draft' });
  if (!valid) return reply({ error: 'Check the required fields and metadata lengths.' }, 400);
  const { data: category } = await access.db.from('categories')
    .select('id').eq('id', valid.category_id).eq('status', 'active').maybeSingle();
  if (!category) return reply({ error: 'Choose an active subject.' }, 400);

  const base = valid.title.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'worksheet';
  const slug = base + '-' + crypto.randomUUID().slice(0, 8);
  const { data, error } = await access.db.from('worksheets')
    .insert({ ...valid, slug, status: 'draft', created_by: access.user.id, source: 'manual' })
    .select('id,title,slug,status,created_at').single();
  if (error) return reply({ error: 'Unable to create draft. Check your subject and grade.' }, 400);
  return reply({ worksheet: data }, 201);
}
