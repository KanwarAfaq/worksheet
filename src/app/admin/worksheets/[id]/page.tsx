import type { Metadata } from 'next';
import WorksheetEditor from '@/components/worksheet-editor';

export const metadata: Metadata = { title: 'Edit worksheet', robots: { index: false, follow: false } };
export default async function EditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <WorksheetEditor id={id} />;
}
