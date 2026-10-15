
import {notFound} from 'next/navigation';
import type {Metadata} from 'next';
import GeneratorWorkspace from '@/components/generator-workspace';
import {typeNames,typeDescriptions} from '@/lib/catalog';
import {indexableRobots,breadcrumbs} from '@/lib/seo';
import StructuredData from '@/components/structured-data';
export function generateStaticParams(){return Object.keys(typeNames).map(type=>({type}));}
export async function generateMetadata({params}:{params:Promise<{type:string}>}):Promise<Metadata>{const {type}=await params;return {title:'Free '+(typeNames[type]||'Worksheet')+' Maker — Printable PDF',
 description:(typeDescriptions[type]||'Create printable worksheets')+' Customize the words and print a worksheet with a teacher answer key.',
 alternates:type in typeNames?{canonical:'/create/'+type}:undefined,
 robots:indexableRobots(type in typeNames)};}
export default async function Maker({params}:{params:Promise<{type:string}>}){const {type}=await params;if(!(type in typeNames))notFound();return <><StructuredData value={breadcrumbs([
 {label:'Home',url:'/'},{label:'Worksheet makers',url:'/create'},
 {label:typeNames[type],url:'/create/'+type}
 ])}/><GeneratorWorkspace type={type as 'word-search'|'word-scramble'|'missing-letters'}/></>;}
