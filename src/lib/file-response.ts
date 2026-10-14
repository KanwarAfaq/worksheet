import 'server-only';
import {GetObjectCommand} from '@aws-sdk/client-s3';
import {r2Client} from '@/lib/r2-server';
import {acceptableTypes,previewableTypes,safeDocumentFilename,type WorksheetFileType} from '@/lib/file-validation';

type StoredFile={object_key:string;r2_bucket:string;mime_type:string;variant:string;id:string};
export async function deliverPrivateFile(file:StoredFile,inline=false):Promise<Response>{
 const type=file.variant as WorksheetFileType;
 if(!(type in acceptableTypes))return new Response('Not found',{status:404});
 if(file.mime_type!==acceptableTypes[type])return new Response('Invalid file metadata',{status:502});
 if(inline&&!previewableTypes.includes(type))return new Response('Preview is not available for this format. Download to review.',{status:415});
 const obj=await r2Client().send(new GetObjectCommand({Bucket:file.r2_bucket,Key:file.object_key}));
 if(!obj.Body)return new Response('File not found',{status:404});
 const bytes=await obj.Body.transformToByteArray();
 return new Response(Buffer.from(bytes),{status:200,headers:{
  'Content-Type':file.mime_type,
  'Content-Disposition':(inline?'inline':'attachment')+'; filename="'+safeDocumentFilename(type,file.id)+'"',
  'X-Content-Type-Options':'nosniff',
  'Cache-Control':'private, no-store',
  'Content-Security-Policy':"default-src 'none'; sandbox"
 }});
}
