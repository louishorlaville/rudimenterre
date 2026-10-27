import {type I18nConfig as I18nBase} from '@shopify/hydrogen';

export interface I18nLocale extends I18nBase {
  pathPrefix: string;
}

export type StorefrontLocale = 'fr' | 'en';

export const DEFAULT_LOCALE: StorefrontLocale = 'fr';

export function isStorefrontLocale(value?: string): value is StorefrontLocale {
  return value === 'fr' || value === 'en';
}

export function localeFromPathname(pathname: string): StorefrontLocale {
  // React Router requests /en.data when navigating to the English homepage.
  const locale = pathname
    .replace(/\.data$/, '')
    .split('/')[1]
    ?.toLowerCase();
  return isStorefrontLocale(locale) ? locale : DEFAULT_LOCALE;
}

export function getLocaleFromRequest(request: Request): I18nLocale {
  const url = new URL(request.url);
  let locale = localeFromPathname(url.pathname);
  // SDK endpoints have no /fr or /en prefix. Preserve the page's language
  // for cart mutations and native account links without trusting another origin.
  if (
    url.pathname === '/api/cart' ||
    url.pathname === '/cart' ||
    /^\/account\/(login|authorize|refresh|logout)$/.test(url.pathname)
  ) {
    const explicit = url.searchParams.get('locale') ?? undefined;
    if (isStorefrontLocale(explicit)) locale = explicit;
    else {
      try {
        const referrer = new URL(request.headers.get('Referer') ?? '');
        if (referrer.origin === url.origin)
          locale = localeFromPathname(referrer.pathname);
      } catch {
        /* Missing or malformed referrers retain the French default. */
      }
    }
  }
  const country =
    url.hostname === 'rudimenterre.fr' ||
    url.hostname.endsWith('.rudimenterre.fr')
      ? 'FR'
      : 'CA';
  return {
    language: locale === 'fr' ? 'FR' : 'EN',
    country,
    pathPrefix: `/${locale}`,
  };
}
