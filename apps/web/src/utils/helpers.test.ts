import { afterEach, expect, test } from 'vitest';

import { getURL, toSiteURL, getSafeRedirectUrl } from './helpers';

const originalEnv = {
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_VERCEL_URL: process.env.NEXT_PUBLIC_VERCEL_URL,
};

function restoreEnv(key: 'NEXT_PUBLIC_SITE_URL' | 'NEXT_PUBLIC_VERCEL_URL', value: string | undefined) {
  if (value === undefined) {
    delete process.env[key];
    return;
  }

  process.env[key] = value;
}

afterEach(() => {
  restoreEnv('NEXT_PUBLIC_SITE_URL', originalEnv.NEXT_PUBLIC_SITE_URL);
  restoreEnv('NEXT_PUBLIC_VERCEL_URL', originalEnv.NEXT_PUBLIC_VERCEL_URL);
});

test('getURL normalizes a configured site URL', () => {
  process.env.NEXT_PUBLIC_SITE_URL = 'example.com';
  delete process.env.NEXT_PUBLIC_VERCEL_URL;

  expect(getURL()).toBe('https://example.com/');
});

test('getURL falls back to the local dev port', () => {
  delete process.env.NEXT_PUBLIC_SITE_URL;
  delete process.env.NEXT_PUBLIC_VERCEL_URL;

  expect(getURL()).toBe('http://localhost:3000/');
});

test('toSiteURL joins paths against the normalized base URL', () => {
  process.env.NEXT_PUBLIC_SITE_URL = 'https://example.com/app';
  delete process.env.NEXT_PUBLIC_VERCEL_URL;

  expect(toSiteURL('/auth/callback')).toBe('https://example.com/app/auth/callback');
});

test('getSafeRedirectUrl allows valid relative paths', () => {
  const origin = 'https://example.com';
  expect(getSafeRedirectUrl('/settings', origin).toString()).toBe('https://example.com/settings');
  expect(getSafeRedirectUrl('/discover?query=ai', origin).toString()).toBe('https://example.com/discover?query=ai');
});

test('getSafeRedirectUrl blocks open redirect attack vectors', () => {
  const origin = 'https://example.com';
  // External URL
  expect(getSafeRedirectUrl('https://evil.com', origin).toString()).toBe('https://example.com/dashboard');
  // Protocol-relative URL
  expect(getSafeRedirectUrl('//evil.com', origin).toString()).toBe('https://example.com/dashboard');
  // Backslash attempt
  expect(getSafeRedirectUrl('/\\evil.com', origin).toString()).toBe('https://example.com/dashboard');
  // Javascript scheme
  expect(getSafeRedirectUrl('javascript:alert(1)', origin).toString()).toBe('https://example.com/dashboard');
  // Null or empty
  expect(getSafeRedirectUrl(null, origin).toString()).toBe('https://example.com/dashboard');
});
