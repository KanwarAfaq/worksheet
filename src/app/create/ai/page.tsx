import type {Metadata} from 'next';import AIWorksheetMaker from '@/components/ai-worksheet-maker';
export const metadata:Metadata={title:'AI Worksheet Maker',description:'Create printable PDF and image worksheets for Grades 1–6.'};
export default function Page(){return <AIWorksheetMaker/>;}
