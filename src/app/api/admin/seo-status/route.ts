import {requireOwner} from '@/lib/admin-server';
import {indexingEnabled,siteOrigin} from '@/lib/site-url';
export const dynamic='force-dynamic';
export async function GET(request:Request){
 const a=await requireOwner(request);
 if(!a.ok)return Response.json({error:'Access denied'},{status:a.status});
 const {count,error}=await a.db.from('worksheets').select('id',{head:true,count:'exact'}).eq('status','published');
 const origin=siteOrigin();
 const warnings:string[]=[];
 if(!indexingEnabled)warnings.push('Indexing is disabled. Check ENABLE_SEARCH_INDEXING in Vercel Production.');
 if(origin!=='https://worksheet.live')warnings.push('Canonical domain differs from worksheet.live.');
 if(error)warnings.push('Could not count published worksheets.');
 return Response.json({origin,indexable:indexingEnabled,published:count||0,sitemap:origin+'/sitemap.xml',
  robots:origin+'/robots.txt',warnings},{headers:{'Cache-Control':'private, no-store'}});
}
