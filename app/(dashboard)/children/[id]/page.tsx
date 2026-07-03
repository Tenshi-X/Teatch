import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { calculateAge, formatDate, getLevelColor } from '@/lib/utils';
import { Edit, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';
import type { Child } from '@/types';

export const metadata: Metadata = {
  title: 'Detail Anak',
};

export default async function ChildDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from('children')
    .select('*')
    .eq('id', id)
    .single();

  if (!data) notFound();
  const child = data as Child;

  const age = calculateAge(child.birth_date);
  const levelColor = getLevelColor(child.level);

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <Link
        href="/children"
        className="inline-flex items-center gap-1 text-sm text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 mb-4 transition-colors"
      >
        <ArrowLeft size={16} />
        Kembali
      </Link>

      <Card padding="lg">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <Avatar src={child.photo_url} name={child.name} size="xl" />

          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold mb-2">{child.name}</h1>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge
                    size="md"
                    className="text-white"
                    style={{ backgroundColor: levelColor } as React.CSSProperties}
                  >
                    {child.level}
                  </Badge>
                  {child.grade && (
                    <Badge variant="outline" size="md">
                      {child.grade}
                    </Badge>
                  )}
                  <Badge variant="default" size="md">
                    {age} tahun
                  </Badge>
                </div>
              </div>
              <Link href={`/children/${id}/edit`}>
                <Button variant="outline" size="sm">
                  <Edit size={16} />
                  Edit
                </Button>
              </Link>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <span className="text-surface-400">Tanggal Lahir:</span>{' '}
                <span className="font-medium">{formatDate(child.birth_date)}</span>
              </div>

              {child.interests && child.interests.length > 0 && (
                <div>
                  <span className="text-surface-400 block mb-1">Minat:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {child.interests.map((interest) => (
                      <Badge key={interest} variant="primary" size="sm">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {child.favorite_subjects && child.favorite_subjects.length > 0 && (
                <div>
                  <span className="text-surface-400 block mb-1">
                    Mata Pelajaran Favorit:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {child.favorite_subjects.map((subj) => (
                      <Badge key={subj} variant="secondary" size="sm">
                        {subj}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
