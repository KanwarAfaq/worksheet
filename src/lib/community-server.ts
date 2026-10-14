import {createClient, type SupabaseClient, type User} from '@supabase/supabase-js';
import {SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY} from '@/lib/supabase-public';

type Access={ok:true;db:SupabaseClient;user:User}|{ok:false;status:401|403};
export async function requireContributor(request:Request):Promise<Access>{
  const match=/^Bearer\s+([^\s]+)$/i.exec(request.headers.get('authorization')||'');
  if(!match)return{ok:false,status:401};
  const db=createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{
    auth:{persistSession:false,autoRefreshToken:false},
    global:{headers:{Authorization:'Bearer '+match[1]}}
  });
  const {data,error}=await db.auth.getUser(match[1]);
  if(error||!data.user)return{ok:false,status:401};
  if(!data.user.email_confirmed_at)return{ok:false,status:403};
  return{ok:true,db,user:data.user};
}
export const json=(value:object,status=200)=>new Response(JSON.stringify(value),{status,headers:{
 'Content-Type':'application/json','Cache-Control':'private, no-store'
}});
