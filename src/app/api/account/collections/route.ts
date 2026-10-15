import {requireContributor,json} from '@/lib/community-server';
export const runtime='nodejs';export const dynamic='force-dynamic';
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const tables={saved:'worksheet_user_saves',liked:'worksheet_user_likes'} as const;
type Collection=keyof typeof tables;
export async function GET(request:Request){
 const a=await requireContributor(request);if(!a.ok)return json({error:'Sign in required'},a.status);
 const entries:Record<Collection,{worksheet_id:string}[]>={saved:[],liked:[]};
 for(const kind of ['saved','liked'] as const){
  const {data,error}=await a.db.from(tables[kind]).select('worksheet_id').eq('user_id',a.user.id).order('created_at',{ascending:false}).limit(200);
  if(error)return json({error:'Unable to read your collection'},500);
  entries[kind]=data||[];
 }
 const ids=[...new Set([...entries.saved,...entries.liked].map(x=>x.worksheet_id))];
 const {data:worksheets,error}=ids.length?await a.db.from('worksheets').select('id,title,slug,summary,status').in('id',ids).eq('status','published'): {data:[],error:null};
 if(error)return json({error:'Unable to load worksheets'},500);
 return json({saved:entries.saved.map(x=>x.worksheet_id),liked:entries.liked.map(x=>x.worksheet_id),worksheets:worksheets||[]});
}
export async function POST(request:Request){
 const a=await requireContributor(request);if(!a.ok)return json({error:'Sign in required'},a.status);
 let body:{kind?:string;id?:string;active?:boolean};
 try{body=await request.json();}catch{return json({error:'Invalid request'},400);}
 if(!body||!(body.kind==='saved'||body.kind==='liked')||!uuid.test(body.id||'')||typeof body.active!=='boolean')return json({error:'Invalid worksheet action'},400);
 const table=tables[body.kind];
 if(body.active){
  const {data:w}=await a.db.from('worksheets').select('id').eq('id',body.id).eq('status','published').maybeSingle();
  if(!w)return json({error:'Worksheet is not published'},404);
  const {error}=await a.db.from(table).upsert({user_id:a.user.id,worksheet_id:body.id},{onConflict:'user_id,worksheet_id'});
  if(error)return json({error:'Unable to save worksheet action'},500);
 }else{
  const {error}=await a.db.from(table).delete().eq('user_id',a.user.id).eq('worksheet_id',body.id);
  if(error)return json({error:'Unable to remove worksheet action'},500);
 }
 return json({kind:body.kind,id:body.id,active:body.active});
}
