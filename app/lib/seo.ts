import type {MetaDescriptor} from 'react-router';
import {getLocaleFromRequest} from './i18n';
import {getStorefrontRedirect} from './storefront-redirects';

export function getSeoOrigin(request: Request) {
  return getLocaleFromRequest(request).country === 'FR'
    ? 'https://rudimenterre.fr'
    : 'https://rudimenterre.com';
}

export function isProductionHost(hostname: string) {
  return [
    'rudimenterre.com',
    'www.rudimenterre.com',
    'rudimenterre.fr',
    'www.rudimenterre.fr',
  ].includes(hostname);
}

export function createPageSeo(
  request: Request,
  options: {
    title: string;
    description?: string | null;
    pathname?: string;
    pagination?: boolean;
    staticAlternates?: boolean;
  },
): MetaDescriptor[] {
  const source = new URL(request.url);
  const canonical = new URL(getSeoOrigin(request));
  canonical.pathname =
    options.pathname ?? source.pathname.replace(/\.data$/, '');
  const redirect = getStorefrontRedirect(new Request(canonical));
  if (redirect)
    canonical.pathname = new URL(
      redirect.headers.get('Location')!,
      canonical,
    ).pathname;
  if (options.pagination && source.searchParams.has('cursor')) {
    canonical.searchParams.set('cursor', source.searchParams.get('cursor')!);
    if (source.searchParams.get('direction') === 'previous')
      canonical.searchParams.set('direction', 'previous');
  }
  const tags: MetaDescriptor[] = [
    {title: options.title},
    {tagName: 'link', rel: 'canonical', href: canonical.href},
  ];
  if (options.description?.trim())
    tags.push({name: 'description', content: options.description});

  // Only annotate routes whose language equivalents are known, not guessed handles.
  if (options.staticAlternates && !canonical.search) {
    const suffix = canonical.pathname.replace(/^\/(fr|en)(?=\/|$)/, '');
    for (const [country, origin] of [
      ['CA', 'https://rudimenterre.com'],
      ['FR', 'https://rudimenterre.fr'],
    ]) {
      for (const language of ['fr', 'en'])
        tags.push({
          tagName: 'link',
          rel: 'alternate',
          hrefLang: `${language}-${country}`,
          href: `${origin}/${language}${suffix}`,
        });
    }
  }
  return tags;
}
