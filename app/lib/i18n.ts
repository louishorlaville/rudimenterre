import type {I18nBase} from '@shopify/hydrogen';

export interface I18nLocale extends I18nBase {
  pathPrefix: string;
}

export type StorefrontLocale = 'fr' | 'en';

export const DEFAULT_LOCALE: StorefrontLocale = 'fr';

export function isStorefrontLocale(value?: string): value is StorefrontLocale {
  return value === 'fr' || value === 'en';
}

export function localeFromPathname(pathname: string): StorefrontLocale {
  const locale = pathname.split('/')[1]?.toLowerCase();
  return isStorefrontLocale(locale) ? locale : DEFAULT_LOCALE;
}

export function getLocaleFromRequest(request: Request): I18nLocale {
  const url = new URL(request.url);
  const locale = localeFromPathname(url.pathname);
  const country = url.hostname === 'rudimenterre.fr' || url.hostname.endsWith('.rudimenterre.fr') ? 'FR' : 'CA';
  return {
    language: locale === 'fr' ? 'FR' : 'EN',
    country,
    pathPrefix: `/${locale}`,
  };
}
