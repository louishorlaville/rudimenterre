import {getPageBySlug, pagePath} from './editorial-content';
import {localeFromPathname} from './i18n';

// Explicit equivalents from the previous storefront; unrelated removed pages stay 404.
const legacyPages: Record<string, string> = {
  'pages/projet/le-projet': 'projet-rudimenterre',
  'pages/contactez-nous': 'pages/contacts',
  'pages/tarifs-livraisons-et-garanties-des-serie-limitees':
    'tarifs-livraison-garanties',
  'pages/documentation/documents': 'pages/documentations-rudimenterre',
};

export function getStorefrontRedirect(request: Request): Response | null {
  if (!['GET', 'HEAD'].includes(request.method)) return null;
  const url = new URL(request.url);
  if (url.pathname.endsWith('.data')) return null;
  const locale = localeFromPathname(url.pathname);
  const path = url.pathname
    .replace(/^\/(fr|en)(?=\/|$)/i, '')
    .replace(/^\/+|\/+$/g, '');
  const editorial = getPageBySlug(locale, path);
  let destination: string | undefined;
  if (!path) destination = `/${locale}`;
  else if (path === 'collections/all') destination = pagePath(locale, 'adopt');
  else if (legacyPages[path]) destination = `/${locale}/${legacyPages[path]}`;
  else if (/^collections\/[^/]+\/products\/[^/]+$/.test(path))
    destination = `/${locale}/products/${path.split('/').at(-1)}`;
  else if (editorial) destination = pagePath(locale, editorial.id);
  else if (/^(products|collections|pages|blogs|policies)(\/|$)/.test(path))
    destination = `/${locale}/${path}`;
  if (!destination || destination === url.pathname) return null;
  return new Response(null, {
    status: 301,
    headers: {Location: `${destination}${url.search}`},
  });
}
