import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QuestionContent, TYPE_LABELS } from './question-content';
import type { GeneratedQuestion } from '@/lib/learning/contracts';
export function QuestionPreview({
  question,
  index,
  showAnswer = false,
}: {
  question: GeneratedQuestion;
  index: number;
  showAnswer?: boolean;
}) {
  return (
    <Card padding="md">
      <div className="flex gap-3">
        <b>{index + 1}.</b>
        <div className="flex-1 min-w-0">
          <Badge variant="outline" className="mb-3">
            {TYPE_LABELS[question.type]}
          </Badge>
          <QuestionContent question={question} showAnswer={showAnswer} />
        </div>
      </div>
    </Card>
  );
}
