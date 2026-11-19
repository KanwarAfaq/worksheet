import type {Metadata} from 'next';
import {indexableRobots} from '@/lib/seo';
import GuideArticle,{guideMetadata} from '@/components/guide-article';

export const metadata:Metadata={...guideMetadata('cursive-writing-practice-worksheets'),robots:indexableRobots()};
export default function Page(){return <GuideArticle slug="cursive-writing-practice-worksheets"/>;}
