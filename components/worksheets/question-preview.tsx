import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { CheckCircle, XCircle } from 'lucide-react';
import type { AIGeneratedQuestion } from '@/types';

interface QuestionPreviewProps {
  question: AIGeneratedQuestion;
  index: number;
  showAnswer?: boolean;
}

export function QuestionPreview({ question, index, showAnswer = false }: QuestionPreviewProps) {
  const typeLabels: Record<string, string> = {
    multiple_choice: 'Pilihan Ganda',
    short_answer: 'Isian Singkat',
    essay: 'Uraian',
    matching: 'Menghubungkan',
    guess_image: 'Tebak Gambar',
    image_matching: 'Cocokkan Gambar',
  };

  return (
    <Card padding="md" className="animate-fade-in">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-sm font-bold text-primary-600 dark:text-primary-400 shrink-0">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" size="sm">
              {typeLabels[question.type] || question.type}
            </Badge>
          </div>

          <p className="text-sm font-medium mb-3 leading-relaxed">
            {question.question}
          </p>

          {/* Image */}
          {(question as any).image_url && (
            <div className="mb-4 rounded-xl overflow-hidden border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={(question as any).image_url} 
                alt="Pertanyaan visual" 
                className="w-full h-auto max-h-[300px] object-contain"
                loading="lazy"
              />
            </div>
          )}

          {/* Multiple choice options */}
          {question.type === 'multiple_choice' && question.options && (
            <div className="space-y-2 mb-3">
              {question.options.map((option, i) => {
                const letter = String.fromCharCode(65 + i);
                const isCorrect = showAnswer && option === question.answer;
                return (
                  <div
                    key={i}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                      isCorrect
                        ? 'bg-secondary-50 dark:bg-secondary-900/20 border border-secondary-200 dark:border-secondary-800'
                        : 'bg-surface-50 dark:bg-surface-800/30'
                    }`}
                  >
                    <span className="font-medium text-surface-400 w-5">{letter}.</span>
                    <span className="flex-1">{option}</span>
                    {isCorrect && (
                      <CheckCircle size={16} className="text-secondary-500 shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Matching pairs */}
          {question.type === 'matching' && question.pairs && (
            <div className="space-y-2 mb-3">
              {question.pairs.map((pair, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 text-sm"
                >
                  <span className="px-3 py-1.5 rounded-lg bg-primary-50 dark:bg-primary-900/20 font-medium">
                    {pair.left}
                  </span>
                  <span className="text-surface-400">→</span>
                  <span className="px-3 py-1.5 rounded-lg bg-secondary-50 dark:bg-secondary-900/20 font-medium">
                    {pair.right}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Answer & Explanation */}
          {showAnswer && (
            <div className="mt-3 space-y-2">
              <div className="p-3 rounded-lg bg-secondary-50 dark:bg-secondary-900/20 border border-secondary-100 dark:border-secondary-800">
                <p className="text-xs font-medium text-secondary-600 dark:text-secondary-400 mb-1">
                  ✅ Jawaban:
                </p>
                <p className="text-sm">{question.answer}</p>
              </div>
              {question.explanation && (
                <div className="p-3 rounded-lg bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800">
                  <p className="text-xs font-medium text-primary-600 dark:text-primary-400 mb-1">
                    💡 Pembahasan:
                  </p>
                  <p className="text-sm">{question.explanation}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
