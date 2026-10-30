import { z } from 'zod';

export type ReportResult<T> =
  { status: 'ready'; data: T } | { status: 'unavailable' };

// Called on the server. Database diagnostics must not become client props.
export function parseReportResult<T>(
  report: 'learning_summary' | 'dashboard_overview',
  response: {
    data: unknown;
    error: { code: string; message: string; hint?: string } | null;
  },
  schema: z.ZodType<T>
): ReportResult<T> {
  if (response.error) {
    const { code, message, hint } = response.error;
    console.error(`[reports] ${report} failed`, { code, message, hint });
    return { status: 'unavailable' };
  }
  const parsed = schema.safeParse(response.data);
  if (!parsed.success) {
    console.error(`[reports] ${report} returned invalid data`, {
      issues: parsed.error.issues.map(({ code, path }) => ({ code, path })),
    });
    return { status: 'unavailable' };
  }
  return { status: 'ready', data: parsed.data };
}
