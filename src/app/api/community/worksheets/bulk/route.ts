import {requireContributor,json} from '@/lib/community-server';
import {deletePrivateDraft} from '@/lib/delete-private-draft';
export const runtime='nodejs';export const dynamic='force-dynamic';
const uuid=/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
/** User may remove only their own worksheets, including published ones.
 * The database RPC checks ownership independently for every supplied id.
 */
export async function DELETE(request:Request){
 const a=await requireContributor(request);if(!a.ok)return json({error:'Sign in required'},a.status);
 let ids:unknown;
 try{ids=(await request.json()).ids;}catch{return json({error:'Invalid selection'},400);}
 if(!Array.isArray(ids)||ids.length<1||ids.length>20||new Set(ids).size!==ids.length||
  !ids.every(x=>typeof x==='string'&&uuid.test(x)))
  return json({error:'Select 1–20 different worksheets'},400);
 const results:Array<{id:string;ok:boolean;error?:string}>=[];
 for(const id of ids as string[]){
  try{await deletePrivateDraft(a.db,id);results.push({id,ok:true});}
  catch{results.push({id,ok:false,error:'Not owned or already removed'});}
 }
 return json({deleted:results.filter(r=>r.ok).length,results});
}
