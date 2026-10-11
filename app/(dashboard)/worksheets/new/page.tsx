import { WorksheetBuilder } from '@/components/worksheets/worksheet-builder';
import { enabledQuestionTypes } from '@/lib/server/features';
export default async function NewWorksheetPage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string; subject?: string }>;
}) {
  const query = await searchParams;
  return (
    <WorksheetBuilder
      key={`${query.subject || ''}:${query.topic || ''}`}
      enabledTypes={enabledQuestionTypes()}
      initialTopic={query.topic?.slice(0, 200)}
      initialSubject={query.subject}
    />
  );
}
