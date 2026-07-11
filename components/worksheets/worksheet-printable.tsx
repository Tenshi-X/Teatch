import React, { forwardRef } from 'react';
import type { Worksheet, Question } from '@/types';
import { formatDate } from '@/lib/utils';
import { BookOpen } from 'lucide-react';

interface WorksheetPrintableProps {
  worksheet: Worksheet & { subjects: { name: string; icon: string; color: string } | null };
  questions: Question[];
  showAnswers?: boolean;
}

export const WorksheetPrintable = forwardRef<HTMLDivElement, WorksheetPrintableProps>(
  ({ worksheet, questions, showAnswers = false }, ref) => {
    return (
      <div ref={ref} className="p-8 bg-white text-black min-h-screen" style={{ width: '210mm', margin: '0 auto' }}>
        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-surface-200 pb-6 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-primary-600 text-white p-2 rounded-lg">
                <BookOpen size={24} />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-surface-900">Teatch</h1>
            </div>
            <h2 className="text-xl font-semibold mt-4 text-surface-800">{worksheet.title}</h2>
            {worksheet.subjects && (
              <p className="text-surface-600">
                Mata Pelajaran: {worksheet.subjects.name}
              </p>
            )}
            <p className="text-surface-600">
              Tingkat Kesulitan: {worksheet.difficulty.charAt(0).toUpperCase() + worksheet.difficulty.slice(1)}
            </p>
          </div>

          <div className="text-right space-y-4">
            <div className="border border-surface-300 rounded-md p-3 w-48 text-left">
              <div className="text-xs text-surface-500 mb-1">Nama:</div>
              <div className="border-b border-surface-300 h-5"></div>
            </div>
            <div className="border border-surface-300 rounded-md p-3 w-48 text-left">
              <div className="text-xs text-surface-500 mb-1">Tanggal:</div>
              <div className="border-b border-surface-300 h-5"></div>
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-8">
          {questions.map((q, i) => (
            <div key={q.id} className="break-inside-avoid">
              <div className="flex gap-4">
                <div className="font-bold text-surface-800 shrink-0">{i + 1}.</div>
                <div className="flex-1 space-y-4">
                  <div className="text-surface-900 leading-relaxed font-medium">{q.question}</div>
                  
                  {/* Image or Emoji */}
                  {q.image_url && (
                    <div className="my-4 flex items-center justify-center p-4 border border-surface-200 rounded-lg min-h-[120px]">
                      {q.image_url.startsWith('http') || q.image_url.startsWith('data:') ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img 
                          src={q.image_url} 
                          alt="Pertanyaan visual" 
                          className="max-h-[250px] object-contain"
                        />
                      ) : (
                        <div className="text-7xl">
                          {q.image_url}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Options for multiple choice */}
                  {q.type === 'multiple_choice' && Array.isArray(q.options) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                      {q.options.map((opt, optIdx) => {
                        const letter = String.fromCharCode(65 + optIdx);
                        const isCorrectAnswer = showAnswers && q.answer === opt;
                        
                        return (
                          <div 
                            key={optIdx} 
                            className={`flex gap-3 p-3 rounded-lg border ${
                              isCorrectAnswer 
                                ? 'border-primary-500 bg-primary-50 text-primary-900' 
                                : 'border-surface-200'
                            }`}
                          >
                            <span className={`font-semibold ${isCorrectAnswer ? 'text-primary-700' : 'text-surface-500'}`}>
                              {letter}.
                            </span>
                            <span>{String(opt)}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Matching Pairs */}
                  {(q.type === 'matching' || q.type === 'image_matching') && Array.isArray(q.options) && (
                    <div className="mt-6 flex justify-between px-8">
                      <div className="space-y-6 flex-1 text-left">
                        {q.options.map((pair: any, optIdx) => (
                          <div key={`left-${optIdx}`} className="p-3 border-2 border-surface-300 rounded-lg bg-surface-50 inline-block font-medium min-w-[150px] text-center">
                            {pair.left}
                          </div>
                        ))}
                      </div>
                      
                      {/* Randomize the right side for the printable if not showing answers */}
                      <div className="space-y-6 flex-1 text-right flex flex-col items-end">
                        {(showAnswers ? q.options : [...q.options].sort(() => Math.random() - 0.5)).map((pair: any, optIdx) => (
                          <div key={`right-${optIdx}`} className="p-3 border-2 border-surface-300 rounded-lg bg-surface-50 inline-block font-medium min-w-[150px] text-center">
                            {pair.right}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Empty space for writing answers */}
                  {(q.type === 'short_answer' || q.type === 'guess_image' || q.type === 'essay') && !showAnswers && (
                    <div className="mt-4 space-y-6">
                      <div className="border-b border-surface-300 border-dashed w-full"></div>
                      <div className="border-b border-surface-300 border-dashed w-full"></div>
                      {q.type === 'essay' && (
                        <>
                          <div className="border-b border-surface-300 border-dashed w-full"></div>
                          <div className="border-b border-surface-300 border-dashed w-full"></div>
                        </>
                      )}
                    </div>
                  )}

                  {/* Answer Key */}
                  {showAnswers && (
                    <div className="mt-4 p-4 bg-primary-50 border border-primary-100 rounded-lg">
                      <div className="font-semibold text-primary-800 mb-1">Kunci Jawaban:</div>
                      <div className="text-primary-900 mb-3">{q.answer}</div>
                      
                      {q.explanation && (
                        <>
                          <div className="font-semibold text-primary-800 mb-1">Pembahasan:</div>
                          <div className="text-primary-900 text-sm">{q.explanation}</div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
);

WorksheetPrintable.displayName = 'WorksheetPrintable';
