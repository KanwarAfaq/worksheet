import type {Metadata} from 'next';
import AccountPasswordReset from '@/components/account-password-reset';
export const metadata:Metadata={title:'Reset account password',robots:{index:false,follow:false}};
export default function Page(){return <AccountPasswordReset/>;}
