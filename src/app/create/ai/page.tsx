import type {Metadata} from 'next';
import AIWorksheetMaker from '@/components/ai-worksheet-maker';
import {indexableRobots} from '@/lib/seo';

// Account-based generator: exclude from search until the public product is ready.
export const metadata:Metadata={
 title:'AI Worksheet Maker',
 description:'Create printable PDF and image worksheets for Grades 1–6.',
 alternates:{canonical:'/create/ai'},
 robots:indexableRobots(false)
};
export default function Page(){return <AIWorksheetMaker/>;}
