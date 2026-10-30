import type { NextResponse } from 'next/server';

export function isPublicPath(path: string) {
  return [
    '/',
    '/privacy',
    '/terms',
    '/robots.txt',
    '/sitemap.xml',
    '/icon.png',
  ].includes(path);
}

export function copySessionResponse(
  source: NextResponse,
  destination: NextResponse
) {
  source.cookies.getAll().forEach((cookie) => destination.cookies.set(cookie));
  for (const name of ['cache-control', 'expires', 'pragma']) {
    const value = source.headers.get(name);
    if (value) destination.headers.set(name, value);
  }
}
