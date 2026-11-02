import { createRoot } from 'react-dom/client';
import { useEffect, useState } from 'react';
import { WorksheetBuilder } from '@/components/worksheets/worksheet-builder';
import { QuizEngine } from '@/components/quiz/quiz-engine';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { useChildStore } from '@/lib/stores/child-store';
import { fixtures } from './fixtures';
import { owner, worksheetId, Link } from './browser-mocks';
import type { Child } from '@/types';
import LandingPage from '@/app/page';
import { DashboardView } from '@/app/(dashboard)/dashboard/dashboard-view';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { ToastProvider } from '@/components/providers/toast-provider';
const child: Child = {
  id: '22222222-2222-4222-8222-222222222222',
  parent_id: owner,
  name: 'Anak Contoh',
  birth_date: '2018-01-01',
  level: 'SD',
  grade: 'Kelas 2',
  interests: [],
  favorite_subjects: [],
  photo_url: null,
  created_at: '2026-10-30',
  updated_at: '2026-10-30',
};
function Preview() {
  const [path, setPath] = useState(location.pathname);
  const [metrics, setMetrics] = useState('');
  useEffect(() => {
    const update = () => setPath(location.pathname);
    window.addEventListener('qa-route', update);
    return () => window.removeEventListener('qa-route', update);
  }, []);
  const questions = Array.from({ length: 3 }, (_, i) => ({
    ...fixtures[0],
    id: `66666666-6666-4666-8666-${String(i + 1).padStart(12, '0')}`,
  }));
  if (path === '/')
    return (
      <ThemeProvider>
        <LandingPage />
      </ThemeProvider>
    );
  return (
    <ThemeProvider>
      <ToastProvider />
      <DashboardShell
        ownerId={owner}
        userName="Akun contoh lokal"
        initialChildren={[child]}
        worksheetQuota={10}
      >
        <div className="mb-5 space-y-2 rounded-lg border p-3 text-sm">
          <p>
            QA lokal: data contoh, tanpa akun provider. Respons pembuatan
            sengaja diputus; hasil tetap disimpan oleh server tiruan.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/">Halaman depan</Link>
            <Link href="/dashboard">Dashboard contoh</Link>
            <Link href="/design-system">Komponen dan dialog</Link>
            <Link href="/worksheets/new">Buka pembuat latihan</Link>
            <button onClick={() => location.reload()}>
              Muat ulang halaman
            </button>
            <button
              onClick={async () =>
                setMetrics(
                  JSON.stringify(await (await fetch('/api/qa/metrics')).json())
                )
              }
            >
              Lihat jumlah operasi
            </button>
          </div>
          <output>{metrics}</output>
        </div>
        {path === '/design-system' ? (
          <ControlPreview />
        ) : path === '/dashboard' ? (
          <DashboardView
            insightsLocked={false}
            byChild={{
              [child.id]: {
                stats: {
                  totalWorksheets: 1,
                  totalAttempts: 1,
                  averageScore: 100,
                  totalQuestions: 3,
                },
                pendingReviews: 1,
                latestWorksheet: {
                  id: worksheetId,
                  title: 'Latihan contoh Matematika',
                },
                activities: [],
                topics: [],
              },
            }}
          />
        ) : path.endsWith('/new') ? (
          <WorksheetBuilder
            ownerId={owner}
            scopeMode="public"
            enabledTypes={['multiple_choice', 'short_answer', 'true_false']}
            availability={{ enabled: true, message: null }}
          />
        ) : path.endsWith('/attempt') ? (
          <QuizEngine
            ownerId={owner}
            worksheetId={worksheetId}
            childId={child.id}
            worksheetTitle="Latihan contoh"
            questions={questions}
          />
        ) : (
          <div className="card space-y-4 p-6">
            <h1 className="text-2xl font-semibold">
              Latihan yang sama berhasil dipulihkan
            </h1>
            <p>
              Hasil ini berasal dari pembacaan status, tanpa operasi AI baru.
            </p>
            <Link href={`/worksheets/${worksheetId}/attempt`}>
              Mulai latihan contoh
            </Link>
          </div>
        )}
      </DashboardShell>
    </ThemeProvider>
  );
}
function ControlPreview() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  return (
    <section className="mx-auto max-w-2xl space-y-5">
      <h1 className="workbook-heading">Komponen Teatch</h1>
      <Input label="Nama latihan" helperText="Bantuan terhubung ke input." />
      <Input label="Nama latihan" error="Pesan kesalahan contoh." />
      <Select
        label="Pelajaran"
        options={[
          { value: 'math', label: 'Matematika' },
          { value: 'language', label: 'Bahasa Indonesia' },
        ]}
        helperText="Pilih satu pelajaran."
      />
      <Select
        label="Pelajaran"
        options={[]}
        placeholder="Pilih pelajaran"
        error="Pilih pelajaran terlebih dahulu."
      />
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => setOpen(true)}>Buka dialog contoh</Button>
        <Button
          variant="outline"
          onClick={() => setMessage('Tindakan kedua dijalankan.')}
        >
          Tindakan kedua
        </Button>
        <Button disabled>Tombol nonaktif</Button>
      </div>
      <output role="status">{message}</output>
      <Modal isOpen={open} title="Dialog contoh" onClose={() => setOpen(false)}>
        <div className="space-y-5">
          <Input
            label="Catatan"
            helperText="Tab tetap di dalam dialog. Escape menutup dialog."
          />
          <Button
            onClick={() => {
              setMessage('Catatan contoh disimpan.');
              setOpen(false);
            }}
          >
            Simpan catatan contoh
          </Button>
        </div>
      </Modal>
    </section>
  );
}
useChildStore.getState().setChildren([child]);
createRoot(document.getElementById('root')!).render(<Preview />);
