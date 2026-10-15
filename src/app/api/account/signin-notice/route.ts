import {requireContributor,json} from '@/lib/community-server';
import {notifyWorksheetAdmin} from '@/lib/line-admin';
export const runtime='nodejs';export const dynamic='force-dynamic';
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export async function POST(request:Request){
 const a=await requireContributor(request);
 if(!a.ok)return json({error:'Sign in required'},a.status);
 const bearer=/^Bearer\s+([^\s]+)$/i.exec(request.headers.get('authorization')||'');
 if(!bearer)return json({error:'Missing token'},401);
 let sessionId='';
 try{
  const payload=JSON.parse(Buffer.from(bearer[1].split('.')[1]||'','base64url').toString('utf8'));
  sessionId=typeof payload.session_id==='string'?payload.session_id:'';
  if(payload.sub!==a.user.id||!uuid.test(sessionId))return json({error:'Invalid session'},401);
 }catch{return json({error:'Invalid session'},401);}
 // The JWT was already verified through requireContributor/getUser. Avoid duplicate alerts for browser re-focus.
 const {data:existing}=await a.db.from('worksheet_signin_notices').select('session_id').eq('user_id',a.user.id).eq('session_id',sessionId).maybeSingle();
 if(existing)return json({ok:true,duplicate:true});
 const {error}=await a.db.from('worksheet_signin_notices').insert({user_id:a.user.id,session_id:sessionId});
 if(error){
  if(error.code==='23505')return json({ok:true,duplicate:true});
  return json({error:'Unable to record login event'},500);
 }
 const wasCreatedRecently=Date.now()-Date.parse(a.user.created_at)<10*60*1000;
 const delivered=await notifyWorksheetAdmin(wasCreatedRecently?'user_registered':'user_signed_in',{worksheetId:'N/A',actorId:a.user.id});
 if(!delivered){
  await a.db.from('worksheet_signin_notices').delete().eq('user_id',a.user.id).eq('session_id',sessionId);
  return json({ok:false,message:'LINE is not configured or delivery failed'},503);
 }
 return json({ok:true,delivered:true});
}
