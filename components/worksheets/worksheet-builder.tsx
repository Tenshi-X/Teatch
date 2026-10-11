'use client';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { useChildStore } from '@/lib/stores/child-store';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { getObjectives, subjectSegment } from '@/lib/learning/objectives';
import {
  generationInputSchema,
  type GenerationInput,
} from '@/lib/learning/contracts';
import { TYPE_LABELS } from './question-content';
import type { GenerationAvailability } from '@/lib/learning/generation-availability';
import { Users } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import type { Subject } from '@/types';
function subscribePending(notify: () => void) {
  window.addEventListener('storage', notify);
  window.addEventListener('teatch-generation', notify);
  return () => {
    window.removeEventListener('storage', notify);
    window.removeEventListener('teatch-generation', notify);
  };
}
function readPending(key: string) {
  try {
    return localStorage.getItem(key) || '';
  } catch {
    return '';
  }
}

export function WorksheetBuilder({
  initialTopic = '',
  initialSubject = '',
  enabledTypes,
  availability,
}: {
  initialTopic?: string;
  initialSubject?: string;
  enabledTypes: GenerationInput['questionType'][];
  availability: GenerationAvailability;
}) {
  const { activeChild } = useChildStore();
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectId, setSubjectId] = useState(initialSubject);
  const [type, setType] =
    useState<GenerationInput['questionType']>('multiple_choice');
  const [difficulty, setDifficulty] =
    useState<GenerationInput['difficulty']>('sedang');
  const [count, setCount] = useState(5);
  const [topic, setTopic] = useState(initialTopic);
  const [objectiveId, setObjectiveId] = useState('');
  const [busy, setBusy] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const pendingKey = `teatch:generation:${activeChild?.id || 'none'}`;
  const rawPending = useSyncExternalStore(
    subscribePending,
    () => readPending(pendingKey),
    () => ''
  );
  let storedPending: GenerationInput | undefined;
  try {
    const parsed = generationInputSchema.safeParse(JSON.parse(rawPending));
    if (parsed.success && parsed.data.childId === activeChild?.id)
      storedPending = parsed.data;
  } catch {
    /* No pending generation. */
  }
  const pending = availability.enabled ? storedPending : undefined;
  const requestKey = pending?.requestKey;
  const savePending = (input: GenerationInput | null) => {
    try {
      if (input) localStorage.setItem(pendingKey, JSON.stringify(input));
      else localStorage.removeItem(pendingKey);
      window.dispatchEvent(new Event('teatch-generation'));
      return true;
    } catch {
      toast.error(
        'Permintaan belum dapat disimpan pada perangkat ini. Izinkan penyimpanan perangkat lalu coba lagi.'
      );
      return false;
    }
  };
  useEffect(() => {
    if (!activeChild) return;
    let cancelled = false;
    createClient()
      .from('subjects')
      .select('*')
      .eq('level', activeChild.level)
      .order('name')
      .then(({ data, error }) => {
        if (!cancelled) {
          setSubjects(data || []);
          if (error) toast.error('Pelajaran belum dapat dimuat.');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [activeChild]);
  if (!activeChild)
    return (
      <EmptyState
        icon={<Users size={48} />}
        title="Pilih profil anak"
        description="Tambahkan atau pilih anak untuk membuat latihan."
        action={
          <Link href="/children/new">
            <Button>Tambah anak</Button>
          </Link>
        }
      />
    );
  const subject = subjects.find(
    (s) => s.id === (pending?.subjectId || subjectId)
  );
  const types = subject
    ? enabledTypes.filter((t) =>
        subjectSegment(subject.name).allowedQuestionTypes.includes(t)
      )
    : [];
  const selectedType =
    pending?.questionType ||
    (types.includes(type) ? type : types[0] || 'multiple_choice');
  const objectives = subject
    ? getObjectives(subject.name, activeChild.level, activeChild.grade || '')
    : [];
  const chosenObjective = pending?.objectiveId || objectiveId;
  const validObjective = objectives.some((o) => o.id === chosenObjective)
    ? chosenObjective
    : '';
  const maxCount =
    selectedType === 'image_label'
      ? 3
      : selectedType === 'guess_image'
        ? 17
        : 20;
  const actualCount = pending?.questionCount || Math.min(count, maxCount);
  const generate = async () => {
    if (!availability.enabled) {
      setGenerationError(availability.message);
      return;
    }
    if (!subject) return;
    setGenerationError(null);
    setBusy(true);
    const input: GenerationInput = pending || {
      childId: activeChild.id,
      subjectId: subject.id,
      requestKey: crypto.randomUUID(),
      questionType: selectedType,
      difficulty,
      questionCount: actualCount,
      topic,
      objectiveId: validObjective || undefined,
    };
    if (!savePending(input)) {
      setBusy(false);
      return;
    }
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      const data = (await res.json()) as {
        error?: string;
        worksheetId?: string;
        retrySameKey?: boolean;
      };
      if (!res.ok || !data.worksheetId) {
        // A definite failed response permits a new operation; network failures retain the key.
        if (!data.retrySameKey) savePending(null);
        throw new Error(data.error || 'Pembuatan belum berhasil.');
      }
      savePending(null);
      toast.success('Draf tersimpan. Periksa soal sebelum mulai.');
      router.push(`/worksheets/${data.worksheetId}`);
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Sambungan terputus. Kirim ulang untuk mengambil draf yang sama.';
      setGenerationError(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <header className="border-b border-[var(--card-border)] pb-5">
        <p className="learning-eyebrow">Siapkan materi belajar</p>
        <h1 className="mt-2 text-3xl font-semibold">
          Buat latihan untuk {activeChild.name}
        </h1>
        <p className="mt-2 text-[var(--text-muted)]">
          Tentukan materi dan bentuk soal. Draf bisa diperiksa sebelum anak
          mulai.
        </p>
      </header>
      <Card padding="lg">
        {!availability.enabled && (
          <p
            role="status"
            className="mb-4 rounded-lg border border-primary-300 p-4 text-sm"
          >
            {availability.message}
          </p>
        )}
        <fieldset className="min-w-0">
          <legend className="mb-4 text-lg font-semibold">
            1. Materi belajar
          </legend>
          <div className="grid sm:grid-cols-2 gap-5">
            <Select
              label="Mata pelajaran"
              value={subject?.id || ''}
              options={subjects.map((s) => ({ value: s.id, label: s.name }))}
              placeholder="Pilih pelajaran"
              disabled={busy || !!requestKey}
              onChange={(e) => {
                setSubjectId(e.target.value);
                setObjectiveId('');
              }}
            />
            <Select
              label="Tujuan belajar"
              value={validObjective}
              options={objectives.map((o) => ({ value: o.id, label: o.label }))}
              placeholder="Pilih tujuan atau isi topik"
              disabled={busy || !!requestKey || !subject}
              onChange={(e) => setObjectiveId(e.target.value)}
            />
            <Input
              label="Topik spesifik (opsional)"
              value={pending?.topic ?? topic}
              maxLength={200}
              disabled={busy || !!requestKey}
              placeholder="Contoh: penjumlahan sampai 20"
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>
        </fieldset>
        <fieldset className="mt-7 min-w-0 border-t border-[var(--card-border)] pt-6">
          <legend className="float-left mb-4 w-full text-lg font-semibold">
            2. Bentuk latihan
          </legend>
          <div className="clear-both grid sm:grid-cols-2 gap-5">
            <Select
              label="Tipe soal"
              value={selectedType}
              options={types.map((t) => ({ value: t, label: TYPE_LABELS[t] }))}
              disabled={busy || !!requestKey || !subject}
              onChange={(e) =>
                setType(e.target.value as GenerationInput['questionType'])
              }
            />
            <Select
              label="Kesulitan"
              value={pending?.difficulty || difficulty}
              options={['mudah', 'sedang', 'sulit'].map((d) => ({
                value: d,
                label: d,
              }))}
              disabled={busy || !!requestKey}
              onChange={(e) =>
                setDifficulty(e.target.value as GenerationInput['difficulty'])
              }
            />
            <label className="text-sm">
              Jumlah soal: <b>{actualCount}</b>
              <input
                aria-label="Jumlah soal"
                className="block w-full my-3"
                type="range"
                min={1}
                max={maxCount}
                value={actualCount}
                disabled={busy || !!requestKey}
                onChange={(e) => setCount(Number(e.target.value))}
              />
            </label>
          </div>
        </fieldset>
        <div className="mt-7 border-t border-[var(--card-border)] pt-5">
          <h2 className="font-semibold">3. Periksa sebelum membuat draf</h2>
          <p className="mt-2 text-sm">
            {subject?.name || 'Pilih pelajaran'} · {TYPE_LABELS[selectedType]} ·{' '}
            {actualCount} soal · {pending?.difficulty || difficulty}
          </p>
          <p className="text-sm text-[var(--text-muted)] my-4">
            {validObjective &&
            objectives.find((o) => o.id === validObjective)?.curriculumVerified
              ? 'Tujuan ini dipetakan ke lingkup capaian pembelajaran resmi; draf tetap perlu diperiksa.'
              : 'Panduan topik lokal; pemetaan kurikulum untuk materi ini belum diverifikasi.'}{' '}
            Jika draf berhasil dibuat, {actualCount} kuota soal akan digunakan;
            koreksi manual dan latihan ulang gratis.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={generate}
              disabled={!availability.enabled || !subject || !types.length}
              isLoading={busy}
            >
              {!availability.enabled
                ? 'Pembuatan AI belum tersedia'
                : requestKey
                  ? 'Ambil hasil / kirim ulang'
                  : 'Buat draf latihan'}
            </Button>
            {requestKey && !busy && (
              <Button variant="outline" onClick={() => savePending(null)}>
                Mulai permintaan baru
              </Button>
            )}
            {!availability.enabled && storedPending && !busy && (
              <Button variant="outline" onClick={() => savePending(null)}>
                Hapus permintaan tersimpan
              </Button>
            )}
          </div>
          {generationError && (
            <p
              role="alert"
              className="mt-4 rounded-lg border border-error-500 p-3 text-sm"
            >
              {generationError}
            </p>
          )}
          {requestKey && !busy && (
            <p className="text-sm mt-3">
              Ada permintaan yang belum dikonfirmasi. Kirim ulang memakai kunci
              yang sama. Pembuatan baru menggunakan kuota baru.
            </p>
          )}
          {busy && (
            <p className="text-sm mt-4" role="status">
              Sedang menyusun dan memeriksa soal. Draf akan disimpan otomatis.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
