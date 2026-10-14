import 'server-only';
import {GetObjectCommand} from '@aws-sdk/client-s3';
import {r2Client} from '@/lib/r2-server';
import {safeDocumentFilename,type WorksheetFileType} from '@/lib/file-validation';

type StoredFile={object_key:string;r2_bucket:string;mime_type:string;variant:string;id:string};
export async function deliverPrivateFile(file:StoredFile,inline=false):Promise<Response> {
  if(!['pdf','docx','pptx'].includes(file.variant))return new Response('Not found',{status:404});
  if(inline && file.variant!=='pdf')return new Response('PDF preview is unavailable for this format',{status:415});
  const client=r2Client();
  const obj=await client.send(new GetObjectCommand({Bucket:file.r2_bucket,Key:file.object_key}));
  if(!obj.Body)return new Response('File not found',{status:404});
  const bytes=await obj.Body.transformToByteArray();
  const headers=new Headers({
    'Content-Type':file.mime_type,
    'Content-Disposition':(inline?'inline':'attachment')+'; filename="'+safeDocumentFilename(file.variant as WorksheetFileType,file.id)+'"',
    'X-Content-Type-Options':'nosniff',
    'Cache-Control':'private, no-store',
    'Content-Security-Policy':"default-src 'none'; sandbox"
  });
  return new Response(Buffer.from(bytes),{status:200,headers});
}
