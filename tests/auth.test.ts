import { test } from 'node:test';
import assert from 'node:assert/strict';
import { NextResponse } from 'next/server';
import { copySessionResponse, isPublicPath } from '@/lib/auth-session';
import { onboardingSchema } from '@/lib/profile-validation';
import { safeRedirectPath } from '@/lib/auth-redirect';
test('authentication redirects only to local paths', () => {
  for (const value of [
    null,
    'https://outside.test',
    '@outside.test',
    '//outside.test',
    '/\\outside.test',
    '/\n/outside.test',
    '/foo/..//outside.test',
  ])
    assert.equal(safeRedirectPath(value), '/dashboard');
  assert.equal(
    safeRedirectPath('/worksheets/new?topic=Tambah#form'),
    '/worksheets/new?topic=Tambah#form'
  );
});

test('session redirects preserve refreshed cookie attributes and cache headers', () => {
  const original = NextResponse.next();
  original.cookies.set('session', 'fresh', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
  });
  original.headers.set('cache-control', 'private, no-store');
  original.headers.set('expires', '0');
  original.headers.set('pragma', 'no-cache');
  const redirect = NextResponse.redirect('https://example.test/dashboard');
  copySessionResponse(original, redirect);
  assert.equal(redirect.cookies.get('session')?.value, 'fresh');
  assert.equal(redirect.cookies.get('session')?.httpOnly, true);
  assert.equal(redirect.cookies.get('session')?.secure, true);
  for (const key of ['cache-control', 'expires', 'pragma'])
    assert.equal(redirect.headers.get(key), original.headers.get(key));
  assert.equal(isPublicPath('/privacy'), true);
  assert.equal(isPublicPath('/privacy/secret'), false);
  assert.equal(isPublicPath('/api/ai/generate'), false);
});
test('onboarding accepts no phone, validates an optional phone, and trims bounded names', () => {
  assert.equal(
    onboardingSchema.parse({ fullName: '  Orang tua  ', phoneNumber: '' })
      .fullName,
    'Orang tua'
  );
  assert.ok(
    onboardingSchema.safeParse({
      fullName: 'Orang tua',
      phoneNumber: '+62 812-3456-7890',
    }).success
  );
  assert.equal(
    onboardingSchema.safeParse({ fullName: '  ', phoneNumber: '' }).success,
    false
  );
  assert.equal(
    onboardingSchema.safeParse({
      fullName: 'Orang tua',
      phoneNumber: 'not a phone',
    }).success,
    false
  );
});
