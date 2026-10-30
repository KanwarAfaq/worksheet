import type {MetadataRoute} from 'next';
import {subjects,typeNames} from '@/lib/catalog';
import {guides} from '@/lib/guides';
import {publishedWorksheets} from '@/lib/public-catalog';
import {siteOrigin,indexingEnabled} from '@/lib/site-url';

export const dynamic='force-dynamic';
export default async function sitemap():Promise<MetadataRoute.Sitemap>{
 if(!indexingEnabled)return [];
 const base=siteOrigin();
 const origin=(path:string)=>base+path;
 const live=(await publishedWorksheets()).filter(w=>
  (w.summary||'').trim().length>=25 && w.title.trim().length>=5 &&
  w.availableFormats.length>0);
 const publicSubjects=new Set(live.map(w=>w.categorySlug));
 const routes=[
  {path:'/',priority:1},
  {path:'/worksheets',priority:.85},
  {path:'/create',priority:.8},
  {path:'/create/coloring',priority:.8},
  {path:'/create/templates',priority:.8},
  {path:'/faq',priority:.7},
  {path:'/guides/printing-worksheets',priority:.7},
  ...guides.map(g=>({path:'/guides/'+g.slug,priority:.7})),
  {path:'/about',priority:.4},
  ...Object.keys(typeNames).map(type=>({path:'/create/'+type,priority:.8})),
  ...subjects.filter(s=>publicSubjects.has(s.slug)).map(s=>({path:'/'+s.slug,priority:.75}))
 ];
 return [
  ...routes.map(({path,priority})=>({url:origin(path),
   changeFrequency:'weekly' as const,priority})),
  ...live.map(w=>({url:origin('/worksheets/'+encodeURIComponent(w.slug)),
   ...(w.updatedAt && !Number.isNaN(new Date(w.updatedAt).getTime()) ? {lastModified:new Date(w.updatedAt)} : {}),changeFrequency:'monthly' as const,priority:.8}))
 ];
}
