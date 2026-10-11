/** Only local app paths are accepted after authentication. */
export function safeRedirectPath(value: string | null): string {
  if (!value?.startsWith('/') || value.startsWith('//')) return '/dashboard';
  try {
    const origin = 'https://redirect.invalid';
    const url = new URL(value, origin);
    return url.origin === origin && !url.pathname.startsWith('//')
      ? `${url.pathname}${url.search}${url.hash}`
      : '/dashboard';
  } catch {
    return '/dashboard';
  }
}
