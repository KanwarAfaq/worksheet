import type {MetadataRoute} from 'next';
import {siteOrigin,indexingEnabled} from '@/lib/site-url';
export default function robots():MetadataRoute.Robots{
 if(!indexingEnabled)return {rules:[{userAgent:'*',disallow:'/'}]};
 return {rules:[{userAgent:'*',allow:'/',disallow:[
  '/api/','/admin/','/account/','/contribute/','/create/ai/','/worksheets?'
 ]}],sitemap:siteOrigin()+'/sitemap.xml',host:siteOrigin()};
}
