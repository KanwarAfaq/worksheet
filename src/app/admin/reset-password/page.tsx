import type { Metadata } from 'next';
import ResetPassword from '@/components/reset-password';
export const metadata: Metadata = { title: 'Reset admin password', robots: { index: false, follow: false } };
export default function PasswordResetPage() { return <ResetPassword />; }
