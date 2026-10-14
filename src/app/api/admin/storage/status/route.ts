import {NextResponse} from 'next/server';
import {requireOwner} from '@/lib/admin-server';
import {r2Configured,MAX_UPLOAD_BYTES} from '@/lib/r2-server';

export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(request:Request){
  const access=await requireOwner(request);
  if(!access.ok)return NextResponse.json({error:'Access denied.'},{status:access.status});
  return NextResponse.json({
    storageConfigured:r2Configured(),
    publicationConfigured:!!process.env.SUPABASE_SERVICE_ROLE_KEY,
    maxUploadBytes:MAX_UPLOAD_BYTES,
    bucket:'worksheet-files'
  },{headers:{'Cache-Control':'private, no-store'}});
}
