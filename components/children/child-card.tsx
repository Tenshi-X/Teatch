import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { calculateAge, getLevelColor } from '@/lib/utils';
import { Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import type { Child } from '@/types';

interface ChildCardProps {
  child: Child;
  onDelete?: (id: string) => void;
}

export function ChildCard({ child, onDelete }: ChildCardProps) {
  const age = calculateAge(child.birth_date);
  const levelColor = getLevelColor(child.level);

  return (
    <Card hover padding="md" className="relative group">
      {/* Actions */}
      <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Link
          href={`/children/${child.id}/edit`}
          className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
        >
          <Edit size={16} className="text-surface-500" />
        </Link>
        {onDelete && (
          <button
            onClick={() => onDelete(child.id)}
            className="p-2 rounded-lg hover:bg-danger-50 dark:hover:bg-danger-500/10 transition-colors cursor-pointer"
          >
            <Trash2 size={16} className="text-danger-500" />
          </button>
        )}
      </div>

      <Link href={`/children/${child.id}`} className="block">
        <div className="flex items-start gap-4">
          <Avatar src={child.photo_url} name={child.name} size="lg" />
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold mb-1">{child.name}</h3>
            <div className="flex flex-wrap gap-2 mb-3">
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

            {child.interests && child.interests.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {child.interests.slice(0, 3).map((interest) => (
                  <span
                    key={interest}
                    className="text-xs px-2 py-0.5 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
                  >
                    {interest}
                  </span>
                ))}
                {child.interests.length > 3 && (
                  <span className="text-xs text-surface-400">
                    +{child.interests.length - 3} lainnya
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </Link>
    </Card>
  );
}
