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
    className="p-8 bg-white text-black"
    style={{ width: '190mm', margin: '0 auto' }}
  >
    <h1 className="text-2xl font-bold">Teatch — {worksheet.title}</h1>
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
        </div>
      );
    })}
  </div>
));
WorksheetPrintable.displayName = 'WorksheetPrintable';
