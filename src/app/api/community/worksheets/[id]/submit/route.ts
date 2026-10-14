import {requireContributor,json} from '@/lib/community-server';
export const runtime='nodejs';export const dynamic='force-dynamic';
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){
 const a=await requireContributor(request);if(!a.ok)return json({error:'Sign in required.'},a.status);
 const {id}=await params;if(!uuid.test(id))return json({error:'Invalid worksheet ID.'},400);
 const {error}=await a.db.rpc('submit_free_worksheet',{p_worksheet_id:id});
 if(error)return json({error:'Please complete the title, description, rights declaration and upload a verified file.'},409);
 return json({status:'review',notice:'Submitted for automated safety checks. It is not public yet.'});
}
