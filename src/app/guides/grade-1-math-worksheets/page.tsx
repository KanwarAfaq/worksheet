import type {Metadata} from 'next';
import {indexableRobots} from '@/lib/seo';
import GuideArticle,{guideMetadata} from '@/components/guide-article';

export const metadata:Metadata={...guideMetadata('grade-1-math-worksheets'),robots:indexableRobots()};
export default function Page(){return <GuideArticle slug="grade-1-math-worksheets"/>;}
