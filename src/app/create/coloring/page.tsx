import type {Metadata} from 'next';
import ColoringMaker from '@/components/coloring-maker';
import {indexableRobots} from '@/lib/seo';
export const metadata:Metadata={
 title:'Free Coloring Page Maker — Pick Up to 4 Objects',
 description:'Choose from original outline drawings of animals, fruits, nature, shapes and everyday objects. Make a free coloring worksheet and save as PDF or PNG.',
 alternates:{canonical:'/create/coloring'},robots:indexableRobots()
};
export default async function Page({searchParams}:{searchParams:Promise<{category?:string}>}){
 const {category}=await searchParams;
 return <ColoringMaker initialGroup={category}/>;
}
