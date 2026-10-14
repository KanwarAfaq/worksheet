
import {notFound} from 'next/navigation';
import type {Metadata} from 'next';
import GeneratorWorkspace from '@/components/generator-workspace';
import {typeNames,typeDescriptions} from '@/lib/catalog';
export function generateStaticParams(){return Object.keys(typeNames).map(type=>({type}));}
export async function generateMetadata({params}:{params:Promise<{type:string}>}):Promise<Metadata>{const {type}=await params;return {title:typeNames[type]||'Worksheet Maker',description:typeDescriptions[type]||''};}
export default async function Maker({params}:{params:Promise<{type:string}>}){const {type}=await params;if(!(type in typeNames))notFound();return <GeneratorWorkspace type={type as 'word-search'|'word-scramble'|'missing-letters'}/>;}
