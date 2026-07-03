'use client';

import { useState } from 'react';
import { QuestionPreview } from '@/components/worksheets/question-preview';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import {
  Eye,
  EyeOff,
  PlayCircle,
  FileDown,
  ArrowLeft,
  Clock,
} from 'lucide-react';
import Link from 'next/link';
import { WorksheetPrintable } from '@/components/worksheets/worksheet-printable';
import { useReactToPrint } from 'react-to-print';
import { useRef } from 'react';
import type { Worksheet, Question, AIGeneratedQuestion } from '@/types';

interface WorksheetDetailProps {
  worksheet: Worksheet & { subjects: { name: string; icon: string; color: string } | null };
  questions: Question[];
}

export function WorksheetDetail({ worksheet, questions }: WorksheetDetailProps) {
  const [showAnswers, setShowAnswers] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const printRefWithAnswers = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `${worksheet.title} - Soal`,
  });

  const handlePrintWithAnswers = useReactToPrint({
    contentRef: printRefWithAnswers,
    documentTitle: `${worksheet.title} - Kunci Jawaban`,
  });

  const difficultyColors: Record<string, string> = {
    mudah: 'secondary',
    sedang: 'warning',
    sulit: 'danger',
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Back link */}
      <Link
        href="/history"
        className="inline-flex items-center gap-1 text-sm text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors"
      >
        <ArrowLeft size={16} />
        Kembali ke Riwayat
      </Link>

      {/* Header */}
      <Card padding="lg">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold mb-2">{worksheet.title}</h1>
            <div className="flex flex-wrap gap-2 mb-3">
              {worksheet.subjects && (
                <Badge variant="primary" size="md">
                  {worksheet.subjects.icon} {worksheet.subjects.name}
                </Badge>
              )}
              <Badge
                variant={difficultyColors[worksheet.difficulty] as 'secondary' | 'warning' | 'danger'}
                size="md"
              >
                {worksheet.difficulty.charAt(0).toUpperCase() + worksheet.difficulty.slice(1)}
              </Badge>
              <Badge variant="outline" size="md">
                {questions.length} soal
              </Badge>
            </div>
            <div className="flex items-center gap-1 text-sm text-surface-400">
              <Clock size={14} />
              <span>{formatDate(worksheet.created_at)}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePrint()}
            >
              <FileDown size={16} />
              PDF Soal
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePrintWithAnswers()}
            >
              <FileDown size={16} />
              PDF + Kunci
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAnswers(!showAnswers)}
            >
              {showAnswers ? <EyeOff size={16} /> : <Eye size={16} />}
              {showAnswers ? 'Sembunyikan' : 'Jawaban'}
            </Button>
            <Link href={`/worksheets/${worksheet.id}/attempt`}>
              <Button size="sm">
                <PlayCircle size={16} />
                Kerjakan
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Questions */}
      <div className="space-y-3 stagger-children">
        {questions.map((q, i) => {
          const previewQ: AIGeneratedQuestion = {
            type: q.type,
            question: q.question,
            options: Array.isArray(q.options) ? (q.options as string[]) : [],
            answer: q.answer || '',
            explanation: q.explanation || '',
          };

          return (
            <QuestionPreview
              key={q.id}
              question={previewQ}
              index={i}
              showAnswer={showAnswers}
            />
          );
        })}
      </div>

      {/* Hidden Printables */}
      <div className="hidden">
        <WorksheetPrintable
          ref={printRef}
          worksheet={worksheet}
          questions={questions}
          showAnswers={false}
        />
        <WorksheetPrintable
          ref={printRefWithAnswers}
          worksheet={worksheet}
          questions={questions}
          showAnswers={true}
        />
      </div>
    </div>
  );
}
