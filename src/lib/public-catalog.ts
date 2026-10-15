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
const db=createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
function first<T>(row:T|T[]|null):T|null{return Array.isArray(row)?(row[0]||null):row;}
export async function publishedWorksheets():Promise<PublicWorksheet[]> {
 try{
  const {data,error}=await db.from('worksheets')
   .select('id,slug,title,summary,description,available_formats,published_at,updated_at,preview_page,categories!worksheets_category_id_fkey(slug,name),grades!worksheets_grade_id_fkey(slug,display_name)')
   .eq('status','published').order('published_at',{ascending:false}).limit(500);
  if(error)return [];
  return ((data||[]) as unknown as Raw[]).map(row=>{
    const c=first(row.categories),g=first(row.grades);
    return{id:row.id,slug:row.slug,title:row.title,summary:row.summary,description:row.description,
      categorySlug:c?.slug==='english'?'reading':c?.slug==='coloring'?'colors':(c?.slug||'other'),categoryName:c?.name||'Worksheet',
      gradeSlug:g?.slug||null,gradeName:g?.display_name||null,
      publishedAt:row.published_at,updatedAt:row.updated_at,previewPage:row.preview_page||1,
      availableFormats:(row.available_formats||[]).filter(x=>['pdf','png','jpg','webp'].includes(x)) as Array<'pdf'|'docx'|'pptx'|'png'|'jpg'|'webp'>};
  });
 }catch{return [];}
}
