import { DEV_PORT } from '@/constants';
import urlJoin from 'url-join';
import { clientEnv } from '@/config/env';

/**
 * Resolves the canonical site base URL, falling back to localhost during local development.
 * Automatically guarantees a protocol prefix (http/https) and a trailing slash.
 * Consumes validated configuration exclusively through clientEnv (zero raw process.env).
 */
export const getURL = (customUrl?: string): string => {
  let url =
    customUrl ??
    clientEnv.NEXT_PUBLIC_SITE_URL ??
    clientEnv.NEXT_PUBLIC_VERCEL_URL ??
    `http://localhost:${DEV_PORT}/`;

  // Make sure to include `https://` when not localhost.
  url = url.startsWith('http') ? url : `https://${url}`;
  // Make sure to include a trailing `/`.
  url = url.endsWith('/') ? url : `${url}/`;
  return url;
};

/**
 * Resolves the canonical base URL of the site.
 * Semantic alias for getURL.
 */
export const getBaseUrl = (customUrl?: string): string => {
  return getURL(customUrl);
};

export const toSiteURL = (path: string): string => {
  const url = getURL();
  return urlJoin(url, path);
};

/**
 * Validates and safely resolves redirect URLs to prevent Open Redirect attacks.
 * Only allows valid relative paths that do not start with protocol-relative slashes (//)
 * and contain no backslashes (\) or control characters.
 *
 * @param target The redirect destination candidate (e.g., query param ?next=...)
 * @param origin The authoritative application origin (e.g., req.nextUrl.origin)
 * @param defaultPath Fallback path when target is invalid or hostile (default: '/dashboard')
 * @returns Safe URL instance guaranteed to match origin
 */
export const getSafeRedirectUrl = (
  target: string | null | undefined,
  origin: string,
  defaultPath: string = '/dashboard'
): URL => {
  const safeDefault = defaultPath.startsWith('/') ? defaultPath : `/${defaultPath}`;
  let fallback: URL;
  try {
    fallback = new URL(safeDefault, origin);
  } catch {
    fallback = new URL(safeDefault, `http://localhost:${DEV_PORT}`);
  }
  if (!target) return fallback;

  try {
    const decoded = decodeURIComponent(target).trim();

    // Reject control characters, newlines, or null bytes (CRLF injection prevention)
    const hasControlChar = Array.from(decoded).some((char) => {
      const code = char.charCodeAt(0);
      return (code >= 0 && code <= 31) || code === 127;
    });
    if (hasControlChar) {
      return fallback;
    }

    // Must be a valid relative path, not protocol-relative (//) and contain no backslashes (\)
    if (decoded.startsWith('/') && !decoded.startsWith('//') && !decoded.includes('\\')) {
      const resolved = new URL(decoded, fallback.origin);

      // Ensure origin and protocol match to prevent external redirect attempts
      if (
        resolved.origin === fallback.origin &&
        (resolved.protocol === 'http:' || resolved.protocol === 'https:')
      ) {
        return resolved;
      }
    }
  } catch {
    // If decoding or URL resolution fails, return safe fallback
  }

  return fallback;
};
