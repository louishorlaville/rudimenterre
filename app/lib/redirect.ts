import {redirect} from 'react-router';
import {localeFromPathname} from './i18n';

export function getSafeReturnPath(
  request: Request,
  value: unknown,
  fallbackPath = '/',
): string {
  const source = new URL(request.url);
  const prefix = `/${localeFromPathname(source.pathname)}`;
  const localize = (path: string) =>
    /^\/(fr|en)(\/|$)/.test(path)
      ? path
      : `${prefix}${path === '/' ? '' : path}`;
  const fallback = localize(fallbackPath);
  if (typeof value !== 'string' || !value || value !== value.trim())
    return fallback;
  try {
    let candidate = value;
    // Validate decoded forms too; never emit a decoded, reinterpretable target.
    for (let depth = 0; depth < 5; depth++) {
      if (
        [...candidate].some(
          (character) =>
            character === '\\' ||
            character.charCodeAt(0) < 32 ||
            character.charCodeAt(0) === 127,
        ) ||
        candidate.startsWith('//')
      )
        return fallback;
      const target = new URL(candidate, source);
      if (
        !['http:', 'https:'].includes(target.protocol) ||
        target.origin !== source.origin ||
        target.username ||
        target.password ||
        target.pathname.startsWith('//')
      )
        return fallback;
      if (!/%[\da-f]{2}/i.test(candidate)) {
        const destination = new URL(value, source);
        return `${localize(destination.pathname)}${destination.search}${destination.hash}`;
      }
      candidate = decodeURIComponent(candidate);
    }
  } catch {
    /* Invalid URLs or encodings use the localized fallback. */
  }
  return fallback;
}

export function redirectIfHandleIsLocalized(
  request: Request,
  ...localizedResources: Array<{
    handle: string;
    data: {handle: string} & unknown;
  }>
) {
  const url = new URL(request.url);
  let shouldRedirect = false;

  localizedResources.forEach(({handle, data}) => {
    if (handle !== data.handle) {
      url.pathname = url.pathname.replace(handle, data.handle);
      shouldRedirect = true;
    }
  });

  if (shouldRedirect) {
    throw redirect(url.toString());
  }
}
