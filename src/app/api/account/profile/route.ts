import {requireContributor,json} from '@/lib/community-server';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function GET(request:Request){
 const a=await requireContributor(request);if(!a.ok)return json({error:'Sign in required'},a.status);
 const {data,error}=await a.db.from('worksheet_user_profiles').select('display_name,avatar_sha256,avatar_mime,avatar_updated_at').eq('user_id',a.user.id).maybeSingle();
 if(error)return json({error:'Profile unavailable'},500);
 return json({profile:data||{display_name:'',avatar_sha256:null,avatar_mime:null},email:a.user.email});
}
export async function PATCH(request:Request){
 const a=await requireContributor(request);if(!a.ok)return json({error:'Sign in required'},a.status);
 let display_name='';
 try{const body=await request.json();display_name=typeof body.display_name==='string'?body.display_name.trim():'';}catch{return json({error:'Invalid profile'},400);}
 if(display_name.length>80)return json({error:'Display name must be 80 characters or less'},400);
 const {error}=await a.db.from('worksheet_user_profiles').upsert({user_id:a.user.id,display_name,updated_at:new Date().toISOString()},{onConflict:'user_id'});
 if(error)return json({error:'Unable to update profile'},500);
 return json({display_name});
}
