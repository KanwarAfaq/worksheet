import type {Metadata} from 'next';
import Contribute from '@/components/contribute';
import {indexableRobots} from '@/lib/seo';
export const metadata:Metadata={title:'Share a Worksheet',description:'Sign in to upload your own worksheet and manage saved resources.',robots:indexableRobots(false)};
export default function ContributePage(){return <Contribute/>;}
