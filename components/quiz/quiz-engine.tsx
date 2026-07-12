'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
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
import { MathText } from '@/components/ui/math-text';
import { InteractiveJumble, InteractiveOrdering, InteractiveGrouping, InteractiveImageOptions } from './interactions';

interface QuizEngineProps {
  worksheetId: string;
  childId: string;
  questions: Question[];
  worksheetTitle: string;
}

type ExtendedQuestion = Question & {
  story?: string;
  image_options?: string[];
  categories?: string[];
  items?: any[];
};

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

  const currentQ = questions[currentIndex] as ExtendedQuestion;
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
          {currentQ.type === 'story_qa' && currentQ.story && (
            <div className="mb-4 p-4 bg-surface-50 dark:bg-surface-800 rounded-xl text-sm leading-relaxed border border-surface-200 dark:border-surface-700 italic">
              {currentQ.story}
            </div>
          )}
          <MathText content={currentQ.question} className="text-base font-medium leading-relaxed" />
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
                  <span className="flex-1"><MathText content={option} /></span>
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

        {/* True False */}
        {currentQ.type === 'true_false' && (
          <div className="flex gap-4">
            <button
              onClick={() => setAnswer(currentQ.id, 'Benar')}
              className={cn(
                "flex-1 p-4 rounded-xl border-2 font-bold text-lg transition-all cursor-pointer",
                answers[currentQ.id] === 'Benar' ? "bg-primary-600 border-primary-600 text-white shadow-md" : "bg-surface-50 dark:bg-surface-800 border-surface-200 dark:border-surface-700 hover:border-primary-400"
              )}
            >
              ✅ Benar
            </button>
            <button
              onClick={() => setAnswer(currentQ.id, 'Salah')}
              className={cn(
                "flex-1 p-4 rounded-xl border-2 font-bold text-lg transition-all cursor-pointer",
                answers[currentQ.id] === 'Salah' ? "bg-danger-600 border-danger-600 text-white shadow-md" : "bg-surface-50 dark:bg-surface-800 border-surface-200 dark:border-surface-700 hover:border-danger-400"
              )}
            >
              ❌ Salah
            </button>
          </div>
        )}

        {/* Jumbles */}
        {(currentQ.type === 'word_jumble' || currentQ.type === 'sentence_jumble') && Array.isArray(currentQ.options) && (
          <InteractiveJumble 
            options={currentQ.options as string[]}
            value={answers[currentQ.id] || ''}
            onChange={(val) => setAnswer(currentQ.id, val)}
          />
        )}

        {/* Ordering */}
        {currentQ.type === 'ordering' && Array.isArray(currentQ.options) && (
          <InteractiveOrdering 
            options={currentQ.options as string[]}
            value={answers[currentQ.id] || ''}
            onChange={(val) => setAnswer(currentQ.id, val)}
          />
        )}

        {/* Choose Image */}
        {currentQ.type === 'choose_image' && Array.isArray(currentQ.image_options) && (
          <InteractiveImageOptions 
            options={currentQ.image_options as string[]}
            value={answers[currentQ.id] || ''}
            onChange={(val) => setAnswer(currentQ.id, val)}
          />
        )}

        {/* Grouping */}
        {currentQ.type === 'grouping' && currentQ.categories && currentQ.items && (
          <InteractiveGrouping 
            categories={currentQ.categories as string[]}
            items={currentQ.items as any[]}
            value={answers[currentQ.id] || ''}
            onChange={(val) => setAnswer(currentQ.id, val)}
          />
        )}

        {/* Math short answers / standard short answers */}
        {['pattern_completion', 'count_image', 'image_label', 'story_qa'].includes(currentQ.type) && (
          <input
            type={currentQ.type === 'count_image' ? "number" : "text"}
            value={answers[currentQ.id] || ''}
            onChange={(e) => setAnswer(currentQ.id, e.target.value)}
            placeholder={currentQ.type === 'count_image' ? "Masukkan angka..." : "Ketik jawaban Anda..."}
            className="input-base text-base"
          />
        )}

        {/* Matching */}
        {(currentQ.type === 'matching' || currentQ.type === 'image_matching') && Array.isArray(currentQ.options) && (
          <InteractiveMatching 
            options={currentQ.options as any[]}
            value={answers[currentQ.id] || '{}'}
            onChange={(val) => setAnswer(currentQ.id, val)}
          />
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

const InteractiveMatching = ({ options, value, onChange }: { options: any[], value: string, onChange: (val: string) => void }) => {
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  
  // Create a stable shuffled version of the right options based on the options
  const rightOptions = useMemo(() => {
    return [...options].map(p => p.right).sort(() => Math.random() - 0.5);
  }, [options]);

  let currentSelections: Record<string, string> = {};
  try {
    currentSelections = JSON.parse(value);
  } catch(e) {}

  const handleLeftClick = (left: string) => {
    if (selectedLeft === left) {
      setSelectedLeft(null);
    } else {
      setSelectedLeft(left);
    }
  };

  const handleRightClick = (right: string) => {
    if (selectedLeft) {
      const newSelections = { ...currentSelections, [selectedLeft]: right };
      onChange(JSON.stringify(newSelections));
      setSelectedLeft(null);
    } else {
      const linkedLeft = Object.keys(currentSelections).find(key => currentSelections[key] === right);
      if (linkedLeft) {
         const newSelections = { ...currentSelections };
         delete newSelections[linkedLeft];
         onChange(JSON.stringify(newSelections));
      }
    }
  };

  const getConnectedRight = (left: string) => {
    return currentSelections[left];
  };

  const colors = [
    'bg-primary-100 dark:bg-primary-900/30 border-primary-500 text-primary-700 dark:text-primary-300',
    'bg-secondary-100 dark:bg-secondary-900/30 border-secondary-500 text-secondary-700 dark:text-secondary-300',
    'bg-warning-100 dark:bg-warning-900/30 border-warning-500 text-warning-700 dark:text-warning-300',
    'bg-danger-100 dark:bg-danger-900/30 border-danger-500 text-danger-700 dark:text-danger-300',
    'bg-blue-100 dark:bg-blue-900/30 border-blue-500 text-blue-700 dark:text-blue-300',
    'bg-purple-100 dark:bg-purple-900/30 border-purple-500 text-purple-700 dark:text-purple-300',
  ];

  const getColorIndex = (left: string) => {
    const idx = options.findIndex(o => o.left === left);
    return idx % colors.length;
  };

  return (
    <div className="flex gap-4 sm:gap-8 justify-between mt-4 relative">
      {/* Left Column */}
      <div className="flex-1 space-y-3">
        {options.map((pair, i) => {
          const isSelected = selectedLeft === pair.left;
          const connectedRight = getConnectedRight(pair.left);
          const hasConnection = !!connectedRight;
          const colorClass = hasConnection ? colors[getColorIndex(pair.left)] : 'bg-surface-50 dark:bg-surface-800 border-surface-200 dark:border-surface-700 hover:border-surface-400 dark:hover:border-surface-500';
          const activeClass = isSelected ? 'ring-2 ring-primary-500 border-primary-500 shadow-md' : '';

          return (
            <button
              key={`left-${i}`}
              onClick={() => handleLeftClick(pair.left)}
              className={cn(
                "w-full p-4 rounded-xl border-2 text-left font-medium transition-all cursor-pointer",
                colorClass,
                activeClass
              )}
            >
              <div className="flex justify-between items-center">
                 <span>{pair.left}</span>
                 {hasConnection && <CheckCircle size={18} className="shrink-0 opacity-75" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Right Column */}
      <div className="flex-1 space-y-3">
        {rightOptions.map((right, i) => {
          const linkedLeft = Object.keys(currentSelections).find(key => currentSelections[key] === right);
          const hasConnection = !!linkedLeft;
          const colorClass = hasConnection ? colors[getColorIndex(linkedLeft)] : 'bg-surface-50 dark:bg-surface-800 border-surface-200 dark:border-surface-700 hover:border-surface-400 dark:hover:border-surface-500';
          
          return (
            <button
              key={`right-${i}`}
              onClick={() => handleRightClick(right)}
              className={cn(
                "w-full p-4 rounded-xl border-2 text-center font-medium transition-all cursor-pointer",
                colorClass,
                selectedLeft && !hasConnection ? 'animate-pulse border-primary-300 shadow-sm' : ''
              )}
            >
               {right}
            </button>
          );
        })}
      </div>
    </div>
  );
};
