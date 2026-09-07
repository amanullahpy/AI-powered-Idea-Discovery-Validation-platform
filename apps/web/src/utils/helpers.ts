import { DEV_PORT } from '@/constants';
import urlJoin from 'url-join';

export const getURL = (): string => {
  let url =
    process.env.NEXT_PUBLIC_SITE_URL ?? // Set this to your site URL in production env.
    process.env.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel.
    `http://localhost:${DEV_PORT}/`;
  // Make sure to include `https://` when not localhost.
  url = url.startsWith('http') ? url : `https://${url}`;
  // Make sure to include a trailing `/`.
  url = url.endsWith('/') ? url : `${url}/`;
  return url;
};

export const toSiteURL = (path: string): string => {
  const url = getURL();
  return urlJoin(url, path);
};

/**
 * Validates and safely resolves redirect URLs to prevent Open Redirect attacks.
 * Only allows relative paths that do not start with double slashes or backslashes.
 */
export const getSafeRedirectUrl = (
  target: string | null | undefined,
  origin: string,
  defaultPath: string = '/dashboard'
): URL => {
  const fallback = new URL(defaultPath, origin);
  if (!target) return fallback;

  try {
    const decoded = decodeURIComponent(target).trim();
    // Must be a valid relative path, not protocol-relative (//) or backslash-tricked (/\)
    if (decoded.startsWith('/') && !decoded.startsWith('//') && !decoded.startsWith('/\\')) {
      const resolved = new URL(decoded, origin);
      // Ensure origin matches to prevent external redirect attempts
      if (resolved.origin === origin) {
        return resolved;
      }
    }
  } catch {
    // If decoding or URL resolution fails, return safe fallback
  }

  return fallback;
};
