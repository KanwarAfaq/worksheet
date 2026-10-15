import {siteOrigin,indexingEnabled} from '@/lib/site-url';

export const siteName='Worksheet Studio';
export const siteDescription='Create free printable worksheets for Grades 1–6. Browse classroom-friendly PDF and image activities in math, reading, spelling, grammar, writing and more.';
export const absoluteUrl=(pathname:string)=>new URL(pathname,siteOrigin()).toString();
export const structuredData=(data:Record<string,unknown>|Record<string,unknown>[]) =>
 JSON.stringify(data).replace(/</g,'\\u003c');
export const indexableRobots=(allowed=true)=>({
 index:indexingEnabled&&allowed,follow:indexingEnabled&&allowed
});
export function breadcrumbs(parts:{label:string;url:string}[]){
 return {'@context':'https://schema.org','@type':'BreadcrumbList',
  itemListElement:parts.map((part,i)=>({
    '@type':'ListItem',position:i+1,name:part.label,item:absoluteUrl(part.url)
  }))};
}
export function websiteGraph(){
 const base=siteOrigin();
 return {'@context':'https://schema.org','@graph':[
  {'@type':'Organization','@id':base+'/#organization',name:siteName,
   url:base+'/',logo:absoluteUrl('/favicon.svg')},
  {'@type':'WebSite','@id':base+'/#website',name:siteName,url:base+'/',
   inLanguage:'en',description:siteDescription,publisher:{'@id':base+'/#organization'},
   isAccessibleForFree:true}
 ]};
}
