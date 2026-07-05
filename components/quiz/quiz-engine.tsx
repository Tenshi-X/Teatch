'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProgressRing } from '@/components/dashboard/progress-ring';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Clock,
  Send,
  Trophy,
  RotateCcw,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn, formatDuration } from '@/lib/utils';
import type { Question } from '@/types';
import Link from 'next/link';

interface QuizEngineProps {
  worksheetId: string;
  childId: string;
  questions: Question[];
  worksheetTitle: string;
}

export function QuizEngine({
  worksheetId,
  childId,
  questions,
  worksheetTitle,
}: QuizEngineProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [elapsed, setElapsed] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    correct: number;
    total: number;
  } | null>(null);

  const currentQ = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;

  // Timer
  useEffect(() => {
    if (isCompleted) return;
    const interval = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isCompleted]);

  const setAnswer = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = async () => {
    if (answeredCount < questions.length) {
      const unanswered = questions.length - answeredCount;
      const confirm = window.confirm(
        `Masih ada ${unanswered} soal yang belum dijawab. Lanjutkan submit?`
      );
      if (!confirm) return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createClient();

      // Calculate score
      let correct = 0;
      const answerRecords: {
        question_id: string;
        user_answer: string;
        is_correct: boolean;
      }[] = [];

      for (const q of questions) {
        const userAnswer = answers[q.id] || '';
        
        let isCorrect = false;

        if (q.type === 'essay') {
          // Assume correct if they wrote at least 10 characters
          isCorrect = userAnswer.trim().length >= 10;
        } else if (q.type === 'matching' || q.type === 'image_matching') {
          try {
            const parsedAnswer = JSON.parse(userAnswer);
            const pairs = q.options as any[];
            let allCorrect = true;
            for (const pair of pairs) {
              if (parsedAnswer[pair.left] !== pair.right) {
                allCorrect = false;
                break;
              }
            }
            isCorrect = allCorrect && Object.keys(parsedAnswer).length === pairs.length;
          } catch (e) {
            isCorrect = false;
          }
        } else {
          // Short answer / multiple choice / guess_image
          const cleanUser = userAnswer.toLowerCase().replace(/[^a-z0-9]/g, '');
          const cleanAnswer = (q.answer || '').toLowerCase().replace(/[^a-z0-9]/g, '');
          isCorrect = cleanUser === cleanAnswer;
        }

        if (isCorrect) correct++;
        answerRecords.push({
          question_id: q.id,
          user_answer: userAnswer,
          is_correct: isCorrect,
        });
      }

      const score = Math.round((correct / questions.length) * 100);

      // Create attempt
      const { data: attemptData, error: attemptError } = await (supabase as any)
        .from('attempts')
        .insert({
          worksheet_id: worksheetId,
          child_id: childId,
          score,
          total_questions: questions.length,
          correct_answers: correct,
          duration: elapsed,
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (attemptError || !attemptData) throw attemptError;
      const attempt = attemptData as any;

      // Save individual answers
      const answersWithAttemptId = answerRecords.map((a) => ({
        ...a,
        attempt_id: attempt.id,
      }));

      const { error: answersError } = await (supabase as any)
        .from('answers')
        .insert(answersWithAttemptId);

      setResult({ score, correct, total: questions.length });
      setIsCompleted(true);
      toast.success('Latihan selesai! 🎉');
    } catch (error) {
      toast.error('Gagal menyimpan hasil latihan');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Results screen
  if (isCompleted && result) {
    return (
      <div className="max-w-lg mx-auto text-center animate-fade-in-up">
        <Card padding="lg">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-lg shadow-primary-500/25 mb-4">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-1">Latihan Selesai! 🎉</h2>
            <p className="text-surface-400">{worksheetTitle}</p>
          </div>

          <div className="flex justify-center mb-6">
            <ProgressRing
              value={result.score}
              size={140}
              color={result.score >= 80 ? '#22C55E' : result.score >= 60 ? '#F59E0B' : '#EF4444'}
              label="Nilai"
            />
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-secondary-500">{result.correct}</p>
              <p className="text-xs text-surface-400">Benar</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-danger-500">
                {result.total - result.correct}
              </p>
              <p className="text-xs text-surface-400">Salah</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{formatDuration(elapsed)}</p>
              <p className="text-xs text-surface-400">Waktu</p>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <Link href={`/worksheets/${worksheetId}`}>
              <Button variant="outline">
                <ArrowLeft size={16} />
                Lihat Pembahasan
              </Button>
            </Link>
            <Link href="/worksheets/new">
              <Button>
                <RotateCcw size={16} />
                Latihan Baru
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">{worksheetTitle}</h1>
          <p className="text-sm text-surface-400">
            Soal {currentIndex + 1} dari {questions.length}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" size="md">
            <Clock size={14} className="mr-1" />
            {formatDuration(elapsed)}
          </Badge>
          <Badge variant="primary" size="md">
            {answeredCount}/{questions.length}
          </Badge>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question navigation buttons */}
      <div className="flex flex-wrap gap-2">
        {questions.map((q, i) => (
          <button
            key={q.id}
            onClick={() => setCurrentIndex(i)}
            className={cn(
              'w-9 h-9 rounded-lg text-sm font-medium transition-all cursor-pointer',
              i === currentIndex
                ? 'bg-primary-600 text-white shadow-md'
                : answers[q.id]
                ? 'bg-secondary-100 dark:bg-secondary-900/30 text-secondary-700 dark:text-secondary-300'
                : 'bg-surface-100 dark:bg-surface-800 text-surface-500 hover:bg-surface-200 dark:hover:bg-surface-700'
            )}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Current question */}
      <Card padding="lg">
        <div className="mb-4">
          <Badge variant="outline" size="sm" className="mb-3">
            Soal {currentIndex + 1}
          </Badge>
          <p className="text-base font-medium leading-relaxed">{currentQ.question}</p>
        </div>

        {/* Image */}
        {currentQ.image_url && (
          <div className="mb-4 rounded-xl overflow-hidden border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={currentQ.image_url} 
              alt="Pertanyaan visual" 
              className="w-full h-auto max-h-[300px] object-contain mx-auto"
              loading="lazy"
            />
          </div>
        )}

        {/* Multiple choice */}
        {currentQ.type === 'multiple_choice' && Array.isArray(currentQ.options) && (
          <div className="space-y-2">
            {(currentQ.options as string[]).map((option, i) => {
              const letter = String.fromCharCode(65 + i);
              const isSelected = answers[currentQ.id] === option;
              return (
                <button
                  key={i}
                  onClick={() => setAnswer(currentQ.id, option)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-left transition-all cursor-pointer',
                    isSelected
                      ? 'bg-primary-50 dark:bg-primary-900/20 border-2 border-primary-500 shadow-sm'
                      : 'bg-surface-50 dark:bg-surface-800/30 border-2 border-transparent hover:border-surface-200 dark:hover:border-surface-700'
                  )}
                >
                  <span
                    className={cn(
                      'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                      isSelected
                        ? 'bg-primary-600 text-white'
                        : 'bg-surface-200 dark:bg-surface-700 text-surface-500'
                    )}
                  >
                    {letter}
                  </span>
                  <span className="flex-1">{option}</span>
                  {isSelected && (
                    <CheckCircle size={18} className="text-primary-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Short answer */}
        {currentQ.type === 'short_answer' && (
          <input
            type="text"
            value={answers[currentQ.id] || ''}
            onChange={(e) => setAnswer(currentQ.id, e.target.value)}
            placeholder="Ketik jawaban Anda..."
            className="input-base text-base"
          />
        )}

        {/* Essay */}
        {currentQ.type === 'essay' && (
          <textarea
            value={answers[currentQ.id] || ''}
            onChange={(e) => setAnswer(currentQ.id, e.target.value)}
            placeholder="Tuliskan jawaban Anda..."
            rows={6}
            className="input-base text-sm resize-none"
          />
        )}

        {/* Guess Image */}
        {currentQ.type === 'guess_image' && (
          <input
            type="text"
            value={answers[currentQ.id] || ''}
            onChange={(e) => setAnswer(currentQ.id, e.target.value)}
            placeholder="Tebak gambar ini..."
            className="input-base text-base"
          />
        )}

        {/* Matching */}
        {(currentQ.type === 'matching' || currentQ.type === 'image_matching') && Array.isArray(currentQ.options) && (
          <div className="space-y-3">
            {(currentQ.options as any[]).map((pair, i) => {
              const allRightOptions = (currentQ.options as any[]).map(p => p.right).sort();
              
              let currentSelections: Record<string, string> = {};
              try {
                if (answers[currentQ.id]) {
                  currentSelections = JSON.parse(answers[currentQ.id]);
                }
              } catch(e) {}
              
              const handleSelect = (left: string, right: string) => {
                const newSelections = { ...currentSelections, [left]: right };
                setAnswer(currentQ.id, JSON.stringify(newSelections));
              };

              return (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 rounded-lg bg-surface-50 dark:bg-surface-800/30 border border-surface-200 dark:border-surface-700">
                  <span className="font-medium flex-1 bg-white dark:bg-surface-900 p-2 rounded-md border border-surface-200 dark:border-surface-700">{pair.left}</span>
                  <span className="text-surface-400 hidden sm:block">→</span>
                  <select
                    className="input-base text-sm flex-1 bg-white dark:bg-surface-900 cursor-pointer"
                    value={currentSelections[pair.left] || ''}
                    onChange={(e) => handleSelect(pair.left, e.target.value)}
                  >
                    <option value="" disabled>Pilih pasangan...</option>
                    {allRightOptions.map((opt, idx) => (
                      <option key={idx} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
          disabled={currentIndex === 0}
        >
          <ArrowLeft size={16} />
          Sebelumnya
        </Button>

        {currentIndex < questions.length - 1 ? (
          <Button
            onClick={() => setCurrentIndex(currentIndex + 1)}
          >
            Selanjutnya
            <ArrowRight size={16} />
          </Button>
        ) : (
          <Button
            variant="secondary"
            onClick={handleSubmit}
            isLoading={isSubmitting}
          >
            <Send size={16} />
            Selesai & Submit
          </Button>
        )}
      </div>
    </div>
  );
}
