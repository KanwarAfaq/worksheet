import 'server-only';
import {createClient} from '@supabase/supabase-js';
import {SUPABASE_PUBLISHABLE_KEY,SUPABASE_URL} from '@/lib/supabase-public';
export type PublicWorksheet={
 id:string;slug:string;title:string;summary:string|null;description:string|null;
 categorySlug:string;categoryName:string;gradeSlug:string|null;gradeName:string|null;
 availableFormats:Array<'pdf'|'docx'|'pptx'|'png'|'jpg'|'webp'>;
 publishedAt:string|null;updatedAt:string|null;previewPage:number;
};
type Cat={slug:string;name:string};
type Grade={slug:string;display_name:string};
type Raw={
 id:string;slug:string;title:string;summary:string|null;description:string|null;
 available_formats:string[];published_at:string|null;updated_at:string|null;preview_page:number;
 categories:Cat|Cat[]|null;grades:Grade|Grade[]|null;
};
export const WORKSHEETS_PER_PAGE=12;
export type CatalogQuery={subject?:string;grade?:string;format?:string;q?:string;page?:number};
export type WorksheetPage={items:PublicWorksheet[];total:number;page:number;pages:number};
const db=createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
function first<T>(row:T|T[]|null):T|null{return Array.isArray(row)?(row[0]||null):row;}
function normalize(rows:Raw[]):PublicWorksheet[]{
 return rows.map(row=>{
   const c=first(row.categories),g=first(row.grades);
   return{id:row.id,slug:row.slug,title:row.title,summary:row.summary,description:row.description,
     categorySlug:c?.slug==='english'?'reading':c?.slug==='coloring'?'colors':(c?.slug||'other'),
     categoryName:c?.name||'Worksheet',gradeSlug:g?.slug||null,gradeName:g?.display_name||null,
     publishedAt:row.published_at,updatedAt:row.updated_at,previewPage:row.preview_page||1,
     availableFormats:(row.available_formats||[]).filter(x=>['pdf','png','jpg','webp'].includes(x)) as PublicWorksheet['availableFormats']};
 });
}
const columns=(categoryInner:boolean,gradeInner:boolean)=>
 'id,slug,title,summary,description,available_formats,published_at,updated_at,preview_page,'+
 'categories'+(categoryInner?'!inner':'!worksheets_category_id_fkey')+'(slug,name),'+
 'grades'+(gradeInner?'!inner':'!worksheets_grade_id_fkey')+'(slug,display_name)';
/** Supabase-backed pagination; the database returns 12 records, not a large list clipped in the browser. */
export async function publishedWorksheetPage(filters:CatalogQuery={}):Promise<WorksheetPage>{
 const page=Math.max(1,Math.min(100000,Number.isInteger(filters.page)?Number(filters.page):1));
 const subject=filters.subject;
 const grade=filters.grade;
 let query=db.from('worksheets')
  .select(columns(!!subject,!!grade),{count:'exact'})
  .eq('status','published')
  .order('published_at',{ascending:false})
  .order('id',{ascending:true});
 if(subject==='reading')query=query.in('categories.slug',['reading','english']);
 else if(subject==='colors')query=query.in('categories.slug',['colors','coloring']);
 else if(subject)query=query.eq('categories.slug',subject);
 if(grade)query=query.eq('grades.slug',grade);
 if(filters.format==='image')query=query.overlaps('available_formats',['png','jpg','webp']);
 else if(filters.format)query=query.contains('available_formats',[filters.format]);
 if(filters.q){
  const clean=filters.q.trim().toLowerCase().slice(0,64).replace(/[^a-z0-9 -]/g,' ').replace(/ +/g,' ').trim();
  const synonyms:Record<string,string[]>={
   addition:['addition','add','sum'],subtraction:['subtraction','subtract','minus'],
   counting:['counting','count','number'],multiplication:['multiplication','multiply','times'],
   division:['division','divide'],spelling:['spelling','spell'],
   vocabulary:['vocabulary','words'],grammar:['grammar','sentences'],
   shapes:['shapes','shape'],animals:['animals','animal'],coloring:['color','colour','coloring']
  };
  const terms=(synonyms[clean]||[clean]).slice(0,3);
  const predicates=terms.flatMap(term=>
   ['title','summary','description'].map(field=>field+'.ilike.%'+term+'%'));
  if(clean)query=query.or(predicates.join(','));
 }
 const {data,error,count}=await query.range((page-1)*WORKSHEETS_PER_PAGE,page*WORKSHEETS_PER_PAGE-1);
 if(error){console.error('Public catalog query failed',error.code);return{items:[],page,total:0,pages:0};}
 const total=count||0;
 return{items:normalize((data||[]) as unknown as Raw[]),page,total,pages:Math.ceil(total/WORKSHEETS_PER_PAGE)};
}
/** Small discovery list only; use publishedWorksheetPage for browse pages. */
export async function publishedWorksheets():Promise<PublicWorksheet[]>{
 try{
  const {data,error}=await db.from('worksheets')
   .select(columns(false,false)).eq('status','published')
   .order('published_at',{ascending:false}).limit(500);
  if(error)return [];
  return normalize((data||[]) as unknown as Raw[]);
 }catch{return [];}
}
