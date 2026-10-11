import { forwardRef } from 'react';
import type { Worksheet, Question } from '@/types';
import { hydrateQuestion } from '@/lib/learning/contracts';
import { QuestionContent } from './question-content';
import { MathText } from '@/components/ui/math-text';
export const WorksheetPrintable = forwardRef<
  HTMLDivElement,
  { worksheet: Worksheet; questions: Question[]; showAnswers?: boolean }
>(({ worksheet, questions, showAnswers = false }, ref) => (
  <div
    ref={ref}
    className="worksheet-paper p-5 sm:p-8 bg-white text-black"
    style={{ width: '100%', maxWidth: '190mm', margin: '0 auto' }}
  >
    <header className="border-b border-gray-300 pb-5">
      <p className="text-sm tracking-widest uppercase">
        Teatch · Lembar belajar
      </p>
      <h1 className="mt-2 text-2xl font-semibold">{worksheet.title}</h1>
      <p className="mt-2 text-sm">
        {questions.length} soal · {worksheet.difficulty}
        {showAnswers ? ' · Kunci dan pembahasan' : ''}
      </p>
    </header>
    <p className="my-5">Nama: ____________________　Tanggal: ______________</p>
    {questions.map((row, i) => {
      const q = hydrateQuestion(row);
      return (
        <div className="my-8 break-inside-avoid" key={row.id}>
          <b>{i + 1}.</b>
          {q ? (
            <QuestionContent question={q} showAnswer={showAnswers} print />
          ) : (
            <div>
              <MathText content={row.question} />
              {showAnswers && (
                <>
                  <MathText content={row.answer || ''} />
                  <MathText content={row.explanation || ''} />
                </>
              )}
            </div>
          )}
          {!showAnswers && (
            <div className="mt-4" aria-label="Ruang jawaban">
              {Array.from(
                {
                  length: q?.type === 'essay' || q?.type === 'story_qa' ? 4 : 1,
                },
                (_, line) => (
                  <div key={line} className="h-8 border-b border-gray-300" />
                )
              )}
            </div>
          )}
        </div>
      );
    })}
  </div>
));
WorksheetPrintable.displayName = 'WorksheetPrintable';
