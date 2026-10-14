import 'server-only';
import {createClient} from '@supabase/supabase-js';
import {SUPABASE_PUBLISHABLE_KEY,SUPABASE_URL} from '@/lib/supabase-public';

export type PublicWorksheet={
 id:string;slug:string;title:string;summary:string|null;description:string|null;
 categorySlug:string;categoryName:string;gradeSlug:string|null;gradeName:string|null;
 availableFormats:Array<'pdf'|'docx'|'pptx'>;
};
type Cat={slug:string;name:string};
type Grade={slug:string;display_name:string};
type Raw={
 id:string;slug:string;title:string;summary:string|null;description:string|null;
 available_formats:string[];
 categories:Cat|Cat[]|null;grades:Grade|Grade[]|null;
};
const db=createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
function first<T>(row:T|T[]|null):T|null{return Array.isArray(row)?(row[0]||null):row;}
export async function publishedWorksheets():Promise<PublicWorksheet[]> {
 try{
  const {data,error}=await db.from('worksheets')
   .select('id,slug,title,summary,description,available_formats,categories!worksheets_category_id_fkey(slug,name),grades!worksheets_grade_id_fkey(slug,display_name)')
   .eq('status','published').order('published_at',{ascending:false}).limit(100);
  if(error)return [];
  return ((data||[]) as unknown as Raw[]).map(row=>{
    const c=first(row.categories),g=first(row.grades);
    return{id:row.id,slug:row.slug,title:row.title,summary:row.summary,description:row.description,
      categorySlug:c?.slug||'other',categoryName:c?.name||'Worksheet',
      gradeSlug:g?.slug||null,gradeName:g?.display_name||null,
      availableFormats:(row.available_formats||[]).filter(x=>['pdf','docx','pptx'].includes(x)) as Array<'pdf'|'docx'|'pptx'>};
  });
 }catch{return [];}
}
