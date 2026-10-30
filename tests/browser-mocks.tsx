import type { ComponentProps } from 'react';
import { getObjectives } from '@/lib/learning/objectives';
export const owner = '11111111-1111-4111-8111-111111111111';
export const worksheetId = '33333333-3333-4333-8333-333333333333';
export const subjects = [
  {
    id: '44444444-4444-4444-8444-444444444444',
    name: 'Matematika',
    level: 'SD',
  },
  {
    id: '55555555-5555-4555-8555-555555555555',
    name: 'Bahasa Indonesia',
    level: 'SD',
  },
];
export const objective = getObjectives('Matematika', 'SD', 'Kelas 2')[0];
export function createClient() {
  return {
    from: () => ({
      select: () => ({
        eq: () => ({ order: async () => ({ data: subjects, error: null }) }),
      }),
    }),
  };
}
function navigate(path: string) {
  history.pushState({}, '', path);
  window.dispatchEvent(new Event('qa-route'));
}
const router = { push: navigate, refresh: () => undefined };
export function useRouter() {
  return router;
}
export function usePathname() {
  return location.pathname;
}
export function Link({ href, onClick, ...props }: ComponentProps<'a'>) {
  return (
    <a
      {...props}
      href={href}
      onClick={(e) => {
        onClick?.(e);
        if (href?.startsWith('/')) {
          e.preventDefault();
          navigate(href);
        }
      }}
    />
  );
}
export default Link;
export async function recordProductEvent() {
  return { accepted: true };
}
export async function submitFeedback() {
  return { success: true };
}
export async function submitAttempt(input: {
  answers: Record<string, string>;
  duration: number;
}) {
  return {
    id: worksheetId,
    score: 100,
    correct_answers: Object.keys(input.answers).length,
    total_questions: 3,
    duration: input.duration,
    status: 'completed' as const,
  };
}
export async function signOut() {
  navigate('/worksheets/new');
}
