import type {MetadataRoute} from 'next';
import {siteOrigin,indexingEnabled} from '@/lib/site-url';
export default function robots():MetadataRoute.Robots{
 if(!indexingEnabled)return {rules:[{userAgent:'*',disallow:'/'}]};
 // Private HTML declares noindex. Crawlers must reach it to read that directive.
 const ai=['GPTBot','OAI-SearchBot','ChatGPT-User','ClaudeBot','Claude-SearchBot','Claude-User','PerplexityBot','Perplexity-User','Google-Extended','Applebot-Extended','CCBot'];
 return {rules:[{userAgent:'*',allow:'/',disallow:[
  '/api/'
 ]},{userAgent:ai,allow:'/',disallow:['/api/']}],sitemap:siteOrigin()+'/sitemap.xml',host:siteOrigin()};
}
