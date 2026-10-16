import {requireContributor,json} from '@/lib/community-server';
import {parseEditableWorksheet} from '@/lib/worksheet-editor-fields';
import {deletePrivateDraft} from '@/lib/delete-private-draft';
export const runtime='nodejs';export const dynamic='force-dynamic';
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
type Context={params:Promise<{id:string}>};
export async function GET(request:Request,{params}:Context){
 const a=await requireContributor(request);if(!a.ok)return json({error:'Sign in required.'},a.status);
 const {id}=await params;if(!uuid.test(id))return json({error:'Invalid worksheet ID.'},400);
 const {data,error}=await a.db.from('worksheets').select('id,title,summary,category_id,grade_id,status,slug,preview_page')
  .eq('id',id).eq('created_by',a.user.id).maybeSingle();
 if(error||!data)return json({error:'Not found.'},404);
 return json({worksheet:data});
}
export async function PATCH(request:Request,{params}:Context){
 const a=await requireContributor(request);if(!a.ok)return json({error:'Sign in required.'},a.status);
 const {id}=await params;if(!uuid.test(id))return json({error:'Invalid worksheet ID.'},400);
 let body:Record<string,unknown>;
 try{body=await request.json();}catch{return json({error:'Invalid worksheet data.'},400);}
 // Do not allow arbitrary status, authorship, files or publication changes.
 const title=typeof body.title==='string'?body.title.trim():'';
 const summary=typeof body.summary==='string'?body.summary.trim():'';
 const subject=typeof body.category_id==='string'?body.category_id:'';
 const grade=typeof body.grade_id==='string'&&body.grade_id?body.grade_id:null;
 const previewPage=body.preview_page===undefined?1:Number(body.preview_page);
 if(title.length<3||title.length>140||summary.length>700||!uuid.test(subject)||(grade&&!uuid.test(grade))||!Number.isInteger(previewPage)||previewPage<1||previewPage>200)
   return json({error:'Enter a title, description and valid subject/grade.'},400);
 const {data,error}=await a.db.from('worksheets')
  .update({title,summary:summary||null,category_id:subject,grade_id:grade,preview_page:previewPage,updated_at:new Date().toISOString()})
  .eq('id',id).eq('created_by',a.user.id).eq('status','draft')
  .select('id,title,summary,status,category_id,grade_id,preview_page').maybeSingle();
 if(error||!data)return json({error:'Draft cannot be changed. It may have already been submitted.'},409);
 return json({worksheet:data});
}

export async function DELETE(request:Request,{params}:Context){
 const a=await requireContributor(request);
 if(!a.ok)return json({error:'Sign in required.'},a.status);
 const {id}=await params;
 if(!uuid.test(id))return json({error:'Invalid worksheet ID.'},400);
 try{
  const result=await deletePrivateDraft(a.db,id);
  return json(result);
 }catch(e){
  console.error('Contributor draft removal failed:',e instanceof Error?e.message:'unknown');
  return json({error:'Could not delete draft. Confirm it is your unpublished worksheet.'},403);
 }
}
