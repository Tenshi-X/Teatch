import { ChildForm } from '@/components/children/child-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tambah Anak',
};

export default function NewChildPage() {
  return (
    <div className="animate-fade-in-up">
      <ChildForm mode="create" />
    </div>
  );
}
