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
  return (
    <ThemeProvider>
      <DashboardShell
        ownerId={owner}
        userName="Akun contoh lokal"
        initialChildren={[child]}
        worksheetQuota={10}
      >
        <div className="mb-5 space-y-2 rounded-lg border p-3 text-sm">
          <p>
            QA lokal — data contoh, tanpa akun provider. Respons pembuatan
            sengaja diputus; hasil tetap disimpan oleh server tiruan.
          </p>
          <div className="flex flex-wrap gap-3">
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
        {path.endsWith('/new') ? (
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
useChildStore.getState().setChildren([child]);
createRoot(document.getElementById('root')!).render(<Preview />);
