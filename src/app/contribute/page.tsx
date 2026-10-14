import type {Metadata} from 'next';
import Contribute from '@/components/contribute';
export const metadata:Metadata={title:'Share a worksheet',description:'Make or share up to five free printable worksheets with the community.'};
export default function ContributePage(){return <Contribute/>;}
