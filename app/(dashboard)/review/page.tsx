import { getParent } from '@/lib/server/ownership';
import { ReviewList } from '@/components/learning/review-list';
export default async function ReviewPage() {
  const { supabase, profile } = await getParent();
  const { data: children, error: childError } = await supabase
    .from('children')
    .select('id,name')
    .eq('parent_id', profile.id);
  if (childError) throw new Error('Data tinjauan belum dapat dimuat.');
  if (!children?.length) return <ReviewList items={[]} />;
  const { data: attempts, error: attemptError } = await supabase
    .from('attempts')
    .select('id,child_id')
    .in(
      'child_id',
      children.map((c) => c.id)
    )
    .eq('status', 'pending_review')
    .eq('scoring_version', 2);
  if (attemptError) throw new Error('Data tinjauan belum dapat dimuat.');
  if (!attempts?.length) return <ReviewList items={[]} />;
  const items = [];
  for (let offset = 0; ; offset += 200) {
    const { data: answers, error } = await supabase
      .from('answers')
      .select(
        'id,user_answer,attempt_id,questions(question,answer,explanation,content)'
      )
      .in(
        'attempt_id',
        attempts.map((a) => a.id)
      )
      .eq('review_status', 'pending')
      .order('created_at')
      .range(offset, offset + 199);
    if (error) throw new Error('Data tinjauan belum dapat dimuat.');
    for (const a of answers || []) {
      const childId = attempts.find((x) => x.id === a.attempt_id)?.child_id;
      const content = a.questions?.content;
      const rubric =
        content &&
        typeof content === 'object' &&
        !Array.isArray(content) &&
        Array.isArray(content.rubric)
          ? content.rubric.filter((r): r is string => typeof r === 'string')
          : undefined;
      const story =
        content &&
        typeof content === 'object' &&
        !Array.isArray(content) &&
        typeof content.story === 'string'
          ? content.story
          : undefined;
      items.push({
        id: a.id,
        childName: children.find((c) => c.id === childId)?.name || 'Anak',
        story,
        rubric,
        question: a.questions?.question || '',
        userAnswer: a.user_answer || '',
        expected: a.questions?.answer || '',
        explanation: a.questions?.explanation || '',
      });
    }
    if (!answers || answers.length < 200) break;
  }
  return <ReviewList items={items} />;
}
