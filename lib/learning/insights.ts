export interface AnswerEvidence {
  childId: string;
  subjectId: string;
  subject: string;
  topic: string;
  objectiveId: string | null;
  correct: boolean;
  attemptId: string;
  score: number;
  date: string;
  difficulty: string;
}
export function buildInsights(evidence: AnswerEvidence[]) {
  const groups = new Map<string, AnswerEvidence[]>();
  for (const row of evidence) {
    const key = JSON.stringify([
      row.subjectId,
      row.objectiveId || row.topic,
      row.difficulty,
    ]);
    const group = groups.get(key);
    if (group) group.push(row);
    else groups.set(key, [row]);
  }
  return [...groups.values()]
    .map((rows) => {
      const first = rows[0];
      const correct = rows.filter((r) => r.correct).length;
      const accuracy = Math.round((correct * 100) / rows.length);
      const attempts = [
        ...new Map(
          [...rows]
            .sort(
              (a, b) =>
                b.date.localeCompare(a.date) ||
                b.attemptId.localeCompare(a.attemptId)
            )
            .map((r) => [r.attemptId, r])
        ).values(),
      ];
      const avg = (list: AnswerEvidence[]) =>
        list.reduce((n, r) => n + r.score, 0) / list.length;
      const trend =
        attempts.length >= 10
          ? Math.round(avg(attempts.slice(0, 5)) - avg(attempts.slice(5, 10)))
          : null;
      return {
        subjectId: first.subjectId,
        subject: first.subject,
        topic: first.topic,
        difficulty: first.difficulty,
        objectiveId: first.objectiveId,
        total: rows.length,
        correct,
        accuracy,
        trend,
        attempts: attempts.length,
        status:
          rows.length < 5
            ? 'insufficient'
            : accuracy >= 80
              ? 'mastered'
              : accuracy < 60
                ? 'practice'
                : 'developing',
      } as const;
    })
    .sort((a, b) => a.accuracy - b.accuracy);
}
