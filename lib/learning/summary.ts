import { z } from 'zod';
export const learningTopicSchema = z.object({
  childId: z.uuid(),
  subjectId: z.uuid(),
  subject: z.string(),
  topic: z.string(),
  objectiveId: z.string().nullable(),
  difficulty: z.string(),
  total: z.number().int().nonnegative(),
  correct: z.number().int().nonnegative(),
  accuracy: z.number().min(0).max(100),
  trend: z.number().nullable(),
  attempts: z.number().int().nonnegative(),
  status: z.enum(['insufficient', 'mastered', 'practice', 'developing']),
});
export type LearningTopic = z.infer<typeof learningTopicSchema>;
