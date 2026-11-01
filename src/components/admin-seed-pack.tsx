'use client';
import {useMemo,useState} from 'react';
import type {Session} from '@supabase/supabase-js';
import {PackagePlus} from 'lucide-react';
import pack from '@/lib/seed-pack.json';
type Option={id:string;name?:string;display_name?:string;slug?:string};
type Item=(typeof pack)[number];
const norm=(s:string)=>s.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const ALIAS:Record<string,string[]>={math:['math','maths','mathematics'],reading:['reading','reading comprehension'],
 grammar:['grammar'],vocabulary:['vocabulary','vocab'],spelling:['spelling','phonics'],writing:['writing'],
 colors:['colors','colours','coloring','colouring','color','coloring pages']};
function guess(cat:string,cats:Option[]){
 const names=ALIAS[cat]||[cat];
 const hit=cats.find(c=>names.includes(norm(c.slug||''))||names.includes(norm(c.name||'')));
 return hit?.id||'';
}
export default function AdminSeedPack({session,categories,grades}:{session:Session;categories:Option[];grades:Option[]}){
 const slugs=useMemo(()=>[...new Set(pack.map(p=>p.category))],[]);
 const [map,setMap]=useState<Record<string,string>>({});
 const [log,setLog]=useState<string[]>([]);
 const [busy,setBusy]=useState(false);
 const [open,setOpen]=useState(false);
 const catFor=(slug:string)=>map[slug]??guess(slug,categories);
 const gradeId=(label:string)=>{
  const n=label.replace(/\D/g,'');
  return grades.find(g=>norm(g.display_name||g.name||'')===norm(label))?.id
   ||grades.find(g=>n&&(g.display_name||g.name||'').replace(/\D/g,'')===n&&/grade/i.test(g.display_name||g.name||''))?.id||null;
 };
 const add=(m:string)=>setLog(l=>[...l,m]);
 async function run(){
  if(busy)return;
  const missing=slugs.filter(s=>!catFor(s));
  if(missing.length){add('Choose a subject for: '+missing.join(', '));return;}
  setBusy(true);setLog([]);
  const headers={Authorization:'Bearer '+session.access_token};
  let ok=0,skipped=0,failed=0;
  try{
   const res=await fetch('/api/admin/worksheets',{headers,cache:'no-store'});
   const existing=new Set(((await res.json()).worksheets||[]).map((w:{title:string})=>norm(w.title)));
   for(const it of pack as Item[]){
    if(existing.has(norm(it.title))){skipped++;add('Skipped (already exists): '+it.title);continue;}
    let id='';
    try{
     const created=await fetch('/api/admin/worksheets',{method:'POST',cache:'no-store',
      headers:{...headers,'Content-Type':'application/json'},
      body:JSON.stringify({title:it.title,summary:it.summary,description:it.description,
       category_id:catFor(it.category),grade_id:gradeId(it.grade),difficulty:it.difficulty,language:'en',
       tags:it.tags,seo_title:it.seoTitle,seo_description:it.seoDescription,preview_page:1})});
     const c=await created.json();
     if(!created.ok)throw new Error(c.error||'create failed');
     id=c.worksheet.id;
     const up=async(file:string,role:string)=>{
      const blob=await (await fetch('/_seed/'+file)).blob();
      const f=new File([blob],file,{type:'application/pdf'});
      const form=new FormData();form.set('file',f);form.set('role',role);
      form.set('rights_confirmed','yes');form.set('license_basis','original');
      const r=await fetch('/api/admin/worksheets/'+id+'/files',{method:'POST',cache:'no-store',headers,body:form});
      const j=await r.json().catch(()=>({}));
      if(!r.ok)throw new Error(j.error||role+' upload failed');
     };
     await up(it.student,'student');
     if(it.answers)await up(it.answers,'answer');
     const pub=await fetch('/api/admin/worksheets/'+id+'/publication',{method:'POST',cache:'no-store',
      headers:{...headers,'Content-Type':'application/json'},body:JSON.stringify({action:'publish'})});
     const pj=await pub.json().catch(()=>({}));
     if(!pub.ok)throw new Error(pj.error||'publish failed');
     ok++;add('Published: '+it.title);
    }catch(e){
     failed++;add('FAILED '+it.title+': '+(e instanceof Error?e.message:'error')+(id?' (draft kept)':''));
    }
   }
  }catch(e){add('Error: '+(e instanceof Error?e.message:'failed'));}
  add('Done. Published '+ok+', skipped '+skipped+', failed '+failed+'.');
  setBusy(false);
 }
 return <section className="admin-new-draft dashboard-create-card">
  <h2><PackagePlus size={27}/> Import starter pack</h2>
  <p>{pack.length} original PDF worksheets (math, English, coloring) with SEO titles and descriptions. Uploads to your database and R2, then publishes. Safe to re-run: existing titles are skipped.</p>
  <button type="button" className="button button-outline" onClick={()=>setOpen(!open)}>Subjects mapping</button>
  {open&&slugs.map(s=><label key={s} style={{display:'block',marginTop:8}}>{s}
   <select value={catFor(s)} onChange={e=>setMap({...map,[s]:e.target.value})} disabled={busy}>
    <option value="">Choose…</option>{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
   </select></label>)}
  <button type="button" className="button button-dark" onClick={run} disabled={busy||!categories.length}
   style={{marginTop:12}}>{busy?'Importing…':'Import and publish '+pack.length+' worksheets'}</button>
  {log.length>0&&<pre style={{maxHeight:240,overflow:'auto',fontSize:12,whiteSpace:'pre-wrap'}}>{log.join('\n')}</pre>}
 </section>;
}
