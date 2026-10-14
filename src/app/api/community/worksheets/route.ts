import {requireContributor,json} from '@/lib/community-server';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function GET(request:Request){
 const a=await requireContributor(request);if(!a.ok)return json({error:'Please sign in and confirm your email.'},a.status);
 const {data,error}=await a.db.from('worksheets').select('id,title,summary,slug,status,created_at,category_id,grade_id')
  .eq('created_by',a.user.id).order('created_at',{ascending:false}).limit(50);
 if(error)return json({error:'Unable to load your worksheets.'},500);
 return json({items:data||[],used:(data||[]).length,limit:5});
}
export async function POST(request:Request){
 const a=await requireContributor(request);if(!a.ok)return json({error:'Confirm your email and sign in first.'},a.status);
 let categoryId='',gradeId:null|string=null;
 try{
  const body=await request.json();
  categoryId=String(body.category_id||'');
  gradeId=typeof body.grade_id==='string'&&body.grade_id?body.grade_id:null;
 }catch{return json({error:'Invalid worksheet settings.'},400);}
 const uuid=/^[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12}$/i;
 if(!uuid.test(categoryId)||(gradeId&&!uuid.test(gradeId)))return json({error:'Select a valid subject and grade.'},400);
 const {data,error}=await a.db.rpc('create_free_worksheet',{p_category_id:categoryId,p_grade_id:gradeId});
 if(error)return json({error:error.message.includes('limit')?'You have used your 5 free worksheet slots. Private subscriptions are coming later.':'Unable to create worksheet. Check your email confirmation and subject.'},409);
 return json({id:data},201);
}
