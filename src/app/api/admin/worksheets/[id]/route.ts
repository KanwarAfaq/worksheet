import { NextResponse } from 'next/server';
import { requireOwner } from '@/lib/admin-server';
import { parseEditableWorksheet } from '@/lib/worksheet-editor-fields';
import {deletePrivateDraft} from '@/lib/delete-private-draft';

export const dynamic = 'force-dynamic';
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const reply = (payload: object, status: number) =>
  NextResponse.json(payload, { status, headers: { 'Cache-Control': 'private, no-store' } });

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const access = await requireOwner(request);
  if (!access.ok) return reply({ error: 'Access denied.' }, access.status);
  const { id } = await context.params;
  if (!uuid.test(id)) return reply({ error: 'Invalid worksheet ID.' }, 400);
  const { data, error } = await access.db.from('worksheets')
    .select('id,title,slug,summary,description,status,category_id,grade_id,difficulty,language,tags,seo_title,seo_description,featured,preview_page,created_at,updated_at,source')
    .eq('id', id).maybeSingle();
  if (error) return reply({ error: 'Unable to load worksheet.' }, 500);
  if (!data) return reply({ error: 'Worksheet not found.' }, 404);
  return reply({ worksheet: data }, 200);
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const access = await requireOwner(request);
  if (!access.ok) return reply({ error: 'Access denied.' }, access.status);
  const { id } = await context.params;
  if (!uuid.test(id)) return reply({ error: 'Invalid worksheet ID.' }, 400);
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return reply({ error: 'Invalid request body.' }, 400); }
  const valid = parseEditableWorksheet(body);
  if (!valid) return reply({ error: 'Invalid metadata. Check field lengths, language, tags and status.' }, 400);
  const { data: category } = await access.db.from('categories')
    .select('id').eq('id', valid.category_id).eq('status', 'active').maybeSingle();
  if (!category) return reply({ error: 'Choose an active subject.' }, 400);

  // Keep approved/published content immutable; only drafts and archives can change here.
  const { data, error } = await access.db.from('worksheets')
    .update({ ...valid, updated_at: new Date().toISOString() })
    .eq('id', id).in('status', ['draft', 'archived'])
    .select('id,title,slug,summary,description,status,category_id,grade_id,difficulty,language,tags,seo_title,seo_description,featured,preview_page,created_at,updated_at,source')
    .maybeSingle();
  if (error) return reply({ error: 'Could not update worksheet. Check grade, permissions and values.' }, 400);
  if (!data) return reply({ error: 'Only unpublished draft/archived worksheets can be edited.' }, 409);
  return reply({ worksheet: data }, 200);
}

export async function DELETE(request:Request,context:{params:Promise<{id:string}>}){
 const owner=await requireOwner(request);
 if(!owner.ok)return reply({error:'Owner access required.'},owner.status);
 const {id}=await context.params;
 if(!uuid.test(id))return reply({error:'Invalid draft ID.'},400);
 try{
  const result=await deletePrivateDraft(owner.db,id);
  return reply(result,200);
 }catch(e){
  console.error('Owner draft removal failed:',e instanceof Error?e.message:'unknown');
  return reply({error:'Unable to remove worksheet. Check owner access and try again.'},409);
 }
}
