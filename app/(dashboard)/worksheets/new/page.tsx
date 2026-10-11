import { WorksheetBuilder } from '@/components/worksheets/worksheet-builder';
import {
  enabledQuestionTypes,
  generationAvailability,
} from '@/lib/server/features';
import { getParent } from '@/lib/server/ownership';
export default async function NewWorksheetPage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string; subject?: string }>;
}) {
  const query = await searchParams;
  const { profile } = await getParent();
  return (
    <WorksheetBuilder
      key={`${query.subject || ''}:${query.topic || ''}`}
      enabledTypes={enabledQuestionTypes()}
      availability={generationAvailability(profile.id)}
      initialTopic={query.topic?.slice(0, 200)}
      initialSubject={query.subject}
    />
  );
}
