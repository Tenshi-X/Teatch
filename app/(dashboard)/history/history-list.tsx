'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { formatDate, formatDuration } from '@/lib/utils';
import {
  FileText,
  Clock,
  Trophy,
  PlayCircle,
  History,
} from 'lucide-react';
import Link from 'next/link';
import type { Worksheet, Attempt, Child } from '@/types';

interface HistoryListProps {
  worksheets: (Worksheet & {
    subjects: { name: string; icon: string; color: string } | null;
    children: { name: string } | null;
  })[];
  attempts: Attempt[];
  childrenData: Child[];
}

export function HistoryList({ worksheets, attempts, childrenData }: HistoryListProps) {
  const [activeChildId, setActiveChildId] = useState<string>(childrenData[0]?.id || '');

  const attemptsByWorksheet = attempts.reduce(
    (acc, a) => {
      if (!acc[a.worksheet_id]) acc[a.worksheet_id] = [];
      acc[a.worksheet_id].push(a);
      return acc;
    },
    {} as Record<string, Attempt[]>
  );

  const filteredWorksheets = worksheets.filter((ws) => ws.child_id === activeChildId);

  const worksheetsBySubject = filteredWorksheets.reduce((acc, ws) => {
    const subjectName = ws.subjects?.name || 'Lainnya';
    if (!acc[subjectName]) acc[subjectName] = [];
    acc[subjectName].push(ws);
    return acc;
  }, {} as Record<string, typeof filteredWorksheets>);

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <h1 className="text-2xl font-bold mb-6">Soal Saya</h1>

      {childrenData.length > 0 && (
        <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-6 pb-2">
          {childrenData.map((child) => (
            <button
              key={child.id}
              onClick={() => setActiveChildId(child.id)}
              className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all ${
                activeChildId === child.id
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700'
              }`}
            >
              {child.name}
            </button>
          ))}
        </div>
      )}

      {filteredWorksheets.length === 0 ? (
        <EmptyState
          icon={<FileText size={48} />}
          title="Belum ada soal"
          description="Belum ada latihan yang dibuat untuk anak ini."
          action={
            <Link href="/worksheets/new">
              <Button>Buat Latihan Pertama</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-10 stagger-children">
          {Object.entries(worksheetsBySubject).map(([subjectName, wss]) => {
            const firstWsWithSubject = wss.find(ws => ws.subjects?.icon);
            const icon = firstWsWithSubject?.subjects?.icon || '📚';
            
            return (
              <div key={subjectName} className="animate-fade-in-up">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-xl shadow-sm border border-[var(--card-border)]">
                    {icon}
                  </div>
                  <h2 className="text-xl font-bold">{subjectName}</h2>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {wss.map((ws) => {
                    const wsAttempts = attemptsByWorksheet[ws.id] || [];
                    const bestAttempt = wsAttempts.sort((a, b) => (b.score || 0) - (a.score || 0))[0];

                    return (
                      <Card key={ws.id} padding="md" hover className="flex flex-col h-full border-2 border-transparent hover:border-primary-500/30 transition-colors">
                        <Link href={`/worksheets/${ws.id}`} className="flex flex-col h-full gap-3">
                          <div className="flex justify-between items-start">
                            <Badge
                              variant={ws.difficulty === 'mudah' ? 'secondary' : ws.difficulty === 'sedang' ? 'warning' : 'danger'}
                              size="sm"
                            >
                              {ws.difficulty}
                            </Badge>
                            {bestAttempt ? (
                              <div className="flex items-center gap-1 font-bold text-sm">
                                <Trophy size={14} className={bestAttempt.score && bestAttempt.score >= 80 ? 'text-secondary-500' : bestAttempt.score && bestAttempt.score >= 60 ? 'text-warning-500' : 'text-danger-500'} />
                                <span>{bestAttempt.score}%</span>
                              </div>
                            ) : (
                              <Badge variant="outline" size="sm" className="bg-surface-50 dark:bg-surface-800/50 text-[10px]">
                                Belum dikerjakan
                              </Badge>
                            )}
                          </div>
                          
                          <h3 className="font-semibold text-base leading-snug flex-1">
                            {ws.title}
                          </h3>

                          <div className="flex items-center justify-between text-xs text-surface-400 mt-2 pt-3 border-t border-[var(--card-border)]">
                            <span className="flex items-center gap-1">
                              <FileText size={12} /> {ws.question_count} soal
                            </span>
                            <span>{formatDate(ws.created_at)}</span>
                          </div>
                        </Link>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
