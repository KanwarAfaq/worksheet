import {NextResponse} from 'next/server';
import {requireOwner} from '@/lib/admin-server';
import {r2Configured} from '@/lib/r2-server';
export const runtime='nodejs';export const dynamic='force-dynamic';
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){
  const a=await requireOwner(request);
  if(!a.ok)return NextResponse.json({error:'Access denied.'},{status:a.status});
  const {id}=await params;
  if(!uuid.test(id))return NextResponse.json({error:'Invalid worksheet ID.'},{status:400});
  let action='';
  try{action=String((await request.json())?.action||'');}catch{}
  if(!['publish','unpublish'].includes(action))
    return NextResponse.json({error:'Invalid publication action.'},{status:400});
  if(action==='publish'&&(!r2Configured()||!process.env.SUPABASE_SERVICE_ROLE_KEY))
    return NextResponse.json({error:'Set private R2 credentials and SUPABASE_SERVICE_ROLE_KEY in Vercel before publishing.'},{status:503});
  // Definer RPC double-checks ownership, completed metadata, draft state and any verified student file.
  const {error}=await a.db.rpc(action==='publish'?'publish_verified_worksheet':'unpublish_worksheet',{p_worksheet_id:id});
  if(error)return NextResponse.json({error:'Action refused. Verify your metadata (title and summary), one student file, owner role and worksheet status.'},{status:409});
  return NextResponse.json({status:action==='publish'?'published':'draft'},{headers:{'Cache-Control':'private, no-store'}});
}
