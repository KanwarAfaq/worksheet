import {timingSafeEqual} from 'node:crypto';
import {notifyWorksheetAdmin} from '@/lib/line-admin';
export const runtime='nodejs';
export async function POST(request:Request){
 const secret=process.env.WORKSHEET_WEBHOOK_SECRET;
 const received=request.headers.get('x-worksheet-webhook-secret')||'';
 if(!secret||Buffer.byteLength(secret)!==Buffer.byteLength(received)||!timingSafeEqual(Buffer.from(secret),Buffer.from(received)))
  return Response.json({error:'Unauthorized'},{status:401});
 let body:{type?:string;table?:string;record?:{id?:unknown}};
 try{body=await request.json();}catch{return Response.json({error:'Invalid payload'},{status:400});}
 if(body.type!=='INSERT'||body.table!=='users'||typeof body.record?.id!=='string'||!/^[0-9a-f-]{36}$/i.test(body.record.id))
  return Response.json({error:'Unexpected event'},{status:400});
 await notifyWorksheetAdmin('user_registered',{worksheetId:'N/A',actorId:body.record.id});
 return Response.json({ok:true});
}
