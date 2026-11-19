import type {Metadata} from 'next';
import {indexableRobots} from '@/lib/seo';
import GuideArticle,{guideMetadata} from '@/components/guide-article';

export const metadata:Metadata={...guideMetadata('word-search-maker-guide'),robots:indexableRobots()};
export default function Page(){return <GuideArticle slug="word-search-maker-guide"/>;}
