'use client';

import { ChildCard } from '@/components/children/child-card';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { deleteChild } from '@/app/actions/children';
import { Plus, Users } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import type { Child } from '@/types';

interface ChildrenListProps {
  children: Child[];
}

export function ChildrenList({ children }: ChildrenListProps) {
  const [deleteTarget, setDeleteTarget] = useState<Child | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const result = await deleteChild(deleteTarget.id);
    if (result?.error) {
      toast.error(result.error);
      setIsDeleting(false);
    } else {
      toast.success('Profil anak berhasil dihapus');
      setDeleteTarget(null);
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Anak Saya</h1>
          <p className="text-surface-400 text-sm mt-1">
            Kelola profil anak Anda
          </p>
        </div>
        <Link href="/children/new">
          <Button>
            <Plus size={18} />
            Tambah Anak
          </Button>
        </Link>
      </div>

      {/* List */}
      {children.length === 0 ? (
        <EmptyState
          icon={<Users size={48} />}
          title="Belum ada profil anak"
          description="Tambahkan profil anak untuk mulai membuat latihan belajar dengan bantuan AI."
          action={
            <Link href="/children/new">
              <Button>
                <Plus size={18} />
                Tambah Anak Pertama
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger-children">
          {children.map((child) => (
            <ChildCard
              key={child.id}
              child={child}
              onDelete={() => setDeleteTarget(child)}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Hapus Profil Anak"
        size="sm"
      >
        <p className="text-sm text-surface-500 mb-6">
          Apakah Anda yakin ingin menghapus profil{' '}
          <strong className="text-[var(--fg)]">{deleteTarget?.name}</strong>?
          Semua data latihan dan riwayat akan ikut terhapus.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
            Batal
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            isLoading={isDeleting}
          >
            Hapus
          </Button>
        </div>
      </Modal>
    </div>
  );
}
