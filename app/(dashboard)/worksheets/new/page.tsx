'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useChildStore } from '@/lib/stores/child-store';
import { createClient } from '@/lib/supabase/client';
import { saveWorksheet } from '@/app/actions/worksheets';
import { buildGeneratePrompt } from '@/services/ai/prompts';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { QuestionPreview } from '@/components/worksheets/question-preview';
import { calculateAge } from '@/lib/utils';
import { QUESTION_TYPES, DIFFICULTIES } from '@/types';
import { LEARNING_SEGMENTS } from '@/lib/config/segments';
import {
  Sparkles,
  Loader2,
  Save,
  RotateCcw,
  Eye,
  EyeOff,
  ArrowLeft,
  Users,
  Wand2,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Subject, AIGeneratedWorksheet, AIGenerateParams } from '@/types';
import Link from 'next/link';

export default function NewWorksheetPage() {
  const router = useRouter();
  const { activeChild } = useChildStore();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [questionType, setQuestionType] = useState('multiple_choice');
  const [difficulty, setDifficulty] = useState('sedang');
  const [questionCount, setQuestionCount] = useState(5);
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [result, setResult] = useState<AIGeneratedWorksheet | null>(null);
  const [showAnswers, setShowAnswers] = useState(false);

  // Fetch subjects for the child's level
  useEffect(() => {
    if (!activeChild) return;
    const fetchSubjects = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('subjects')
        .select('*')
        .eq('level', activeChild.level)
        .order('name');
      setSubjects(data || []);
    };
    fetchSubjects();
  }, [activeChild]);

  const derivedSegmentId = useMemo(() => {
    const subjectName = subjects.find(s => s.id === selectedSubject)?.name?.toLowerCase() || '';
    if (subjectName.includes('matematika')) return 'matematika';
    if (subjectName.includes('indonesia')) return 'bahasa_indonesia';
    if (subjectName.includes('inggris')) return 'bahasa_inggris';
    if (subjectName.includes('ipa') || subjectName.includes('sains')) return 'ipa';
    if (subjectName.includes('ips') || subjectName.includes('sejarah')) return 'ips';
    if (subjectName.includes('logika')) return 'logika';
    return 'umum';
  }, [selectedSubject, subjects]);

  const derivedSegment = useMemo(() => {
    return LEARNING_SEGMENTS.find(s => s.id === derivedSegmentId) || LEARNING_SEGMENTS[0];
  }, [derivedSegmentId]);

  // Filter allowed question types
  const filteredQuestionTypes = useMemo(() => {
    return QUESTION_TYPES.filter(t => derivedSegment.allowedQuestionTypes.includes(t.value as any));
  }, [derivedSegment]);

  // Auto-select first valid type if current is invalid
  useEffect(() => {
    if (filteredQuestionTypes.length > 0 && !filteredQuestionTypes.some(t => t.value === questionType)) {
      setQuestionType(filteredQuestionTypes[0].value);
    }
  }, [filteredQuestionTypes, questionType]);

  if (!activeChild) {
    return (
      <EmptyState
        icon={<Users size={48} />}
        title="Pilih profil anak terlebih dahulu"
        description="Silakan tambahkan atau pilih profil anak di header untuk mulai membuat latihan."
        action={
          <Link href="/children/new">
            <Button>Tambah Anak</Button>
          </Link>
        }
      />
    );
  }

  const handleGenerate = async () => {
    if (!selectedSubject) {
      toast.error('Pilih mata pelajaran terlebih dahulu');
      return;
    }

    setIsGenerating(true);
    setResult(null);

    const subject = subjects.find((s) => s.id === selectedSubject);

    const params: AIGenerateParams = {
      segmentId: derivedSegmentId,
      childName: activeChild.name,
      age: calculateAge(activeChild.birth_date),
      level: activeChild.level,
      grade: activeChild.grade || '',
      subject: subject?.name || '',
      questionType: questionType as AIGenerateParams['questionType'],
      difficulty: difficulty as AIGenerateParams['difficulty'],
      questionCount,
      topic: topic || undefined,
    };

    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Gagal menggenerate soal');
      }

      const data = (await res.json()) as AIGeneratedWorksheet;
      setResult(data);
      toast.success(`${data.questions.length} soal berhasil digenerate! 🎉`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Gagal menggenerate soal'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!result || !activeChild) return;

    setIsSaving(true);

    try {
      const subject = subjects.find((s) => s.id === selectedSubject);
      const params: AIGenerateParams = {
        segmentId: derivedSegmentId,
        childName: activeChild.name,
        age: calculateAge(activeChild.birth_date),
        level: activeChild.level,
        grade: activeChild.grade || '',
        subject: subject?.name || '',
        questionType: questionType as AIGenerateParams['questionType'],
        difficulty: difficulty as AIGenerateParams['difficulty'],
        questionCount,
        topic: topic || undefined,
      };

      const worksheet = await saveWorksheet(
        { ...params, subjectId: selectedSubject, childId: activeChild.id },
        result,
        buildGeneratePrompt(params)
      );

      toast.success('Worksheet berhasil disimpan!');
      router.push(`/worksheets/${worksheet.id}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Gagal menyimpan worksheet'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const subjectOptions = subjects.map((s) => ({
    value: s.id,
    label: `${s.icon || ''} ${s.name}`,
  }));

  const questionTypeOptions = filteredQuestionTypes.map((t) => ({
    value: t.value,
    label: `${t.icon} ${t.label}`,
  }));

  const difficultyOptions = DIFFICULTIES.map((d) => ({
    value: d.value,
    label: d.label,
  }));

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Wand2 className="text-primary-500" />
          Buat Latihan AI
        </h1>
        <p className="text-surface-400 text-sm mt-1">
          Generate soal otomatis untuk{' '}
          <strong className="text-[var(--fg)]">{activeChild.name}</strong> ({activeChild.level})
        </p>
      </div>

      {/* Form */}
      <Card padding="lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Mata Pelajaran (Database)"
            options={subjectOptions}
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            placeholder="Pilih mata pelajaran"
            required
          />

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
              Jumlah Soal
            </label>
            <input
              type="range"
              min={1}
              max={20}
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="w-full accent-primary-600"
            />
            <div className="flex justify-between text-xs text-surface-400 mt-1">
              <span>1</span>
              <span className="font-medium text-primary-600 dark:text-primary-400 text-sm">
                {questionCount} soal
              </span>
              <span>20</span>
            </div>
          </div>

          <Select
            label="Tipe Soal"
            options={questionTypeOptions}
            value={questionType}
            onChange={(e) => setQuestionType(e.target.value)}
            disabled={!selectedSubject}
          />

          <Select
            label="Tingkat Kesulitan"
            options={difficultyOptions}
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
          />
        </div>

        <div className="mt-4">
          <Input
            label="Topik Spesifik (opsional)"
            placeholder="contoh: Pecahan, Fotosintesis, Pahlawan Nasional"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            helperText="Biarkan kosong untuk topik acak sesuai kurikulum"
          />
        </div>

        <div className="mt-6 flex gap-3">
          <Button
            onClick={handleGenerate}
            isLoading={isGenerating}
            size="lg"
            disabled={!selectedSubject}
          >
            <Sparkles size={18} />
            {isGenerating ? 'Menggenerate...' : 'Generate Soal'}
          </Button>

          {result && (
            <>
              <Button variant="outline" onClick={handleGenerate} disabled={isGenerating}>
                <RotateCcw size={16} />
                Regenerate
              </Button>
              <Button variant="ghost" onClick={() => setShowAnswers(!showAnswers)}>
                {showAnswers ? <EyeOff size={16} /> : <Eye size={16} />}
                {showAnswers ? 'Sembunyikan Jawaban' : 'Lihat Jawaban'}
              </Button>
            </>
          )}
        </div>
      </Card>

      {/* Loading state */}
      {isGenerating && (
        <Card padding="lg" className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-100 dark:bg-primary-900/30 mb-4">
            <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
          </div>
          <h3 className="text-lg font-semibold mb-1">AI sedang membuat soal...</h3>
          <p className="text-sm text-surface-400">
            Tunggu sebentar, Gemini sedang memproses permintaan Anda
          </p>
        </Card>
      )}

      {/* Results */}
      {result && !isGenerating && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">{result.title}</h2>
              <p className="text-sm text-surface-400">
                {result.questions.length} soal digenerate
              </p>
            </div>
            <Button onClick={handleSave} isLoading={isSaving}>
              <Save size={16} />
              Simpan & Lanjutkan
            </Button>
          </div>

          <div className="space-y-3 stagger-children">
            {result.questions.map((q, i) => (
              <QuestionPreview
                key={i}
                question={q}
                index={i}
                showAnswer={showAnswers}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
