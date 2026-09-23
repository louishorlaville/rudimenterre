import {useLoaderData} from 'react-router';
import type {Route} from '../../routes/+types/($locale).$page';
import editorialStyles from './Page.css?url';
import projectStyles from '~/pages/project/Page.css?url';
import distillationStyles from '~/pages/distillation/Page.css?url';
import adoptStyles from '~/pages/adopt/Page.css?url';
import creatorStyles from '~/pages/creator/Page.css?url';
import steamStyles from '~/pages/steam/Page.css?url';
import {EditorialPage} from './Renderer';
import {
  alternatePagePath,
  getPageBySlug,
  pagePath,
} from '~/lib/editorial-content';
import {isStorefrontLocale} from '~/lib/i18n';

export const meta: Route.MetaFunction = ({data}) => {
  if (!data) return [];
  const specialStyles: Partial<Record<typeof data.content.id, string>> = {
    project: projectStyles,
    distillation: data.locale === 'fr' ? distillationStyles : editorialStyles,
    adopt: adoptStyles,
    creator: creatorStyles,
    steam: steamStyles,
  };
  return [
    {tagName: 'link', rel: 'stylesheet', href: specialStyles[data.content.id] || editorialStyles},
    {title: `${data.content.title} — Rudimenterre`},
    {name: 'description', content: data.content.seoDescription},
    {tagName: 'link', rel: 'canonical', href: data.canonicalPath},
    {tagName: 'link', rel: 'alternate', hrefLang: 'fr-CA', href: data.frPath},
    {tagName: 'link', rel: 'alternate', hrefLang: 'en-CA', href: data.enPath},
  ];
};

export async function loader({params, context}: Route.LoaderArgs) {
  const locale = (params.locale?.toLowerCase() || 'fr') as string;
  if (!isStorefrontLocale(locale) || !params.page) {
    throw new Response(null, {status: 404});
  }
  const fallback = getPageBySlug(locale, params.page);
  if (!fallback) throw new Response(null, {status: 404});

  const response = await context.storefront
    .query(EDITORIAL_PAGE_QUERY, {
      cache: context.storefront.CacheLong(),
      variables: {handle: fallback.id},
    })
    .catch(() => null);

  const fields = (response?.metaobject?.fields ?? []) as Array<{
    key: string;
    value?: string | null;
    reference?: {
      __typename?: string;
      image?: {url: string; altText?: string | null} | null;
    } | null;
  }>;
  const field = (key: string) => fields.find((item) => item.key === key);
  const content = {
    ...fallback,
    eyebrow: field('eyebrow')?.value || fallback.eyebrow,
    title: field('title')?.value || fallback.title,
    intro: field('intro')?.value || fallback.intro,
    seoDescription:
      field('seo_description')?.value || fallback.seoDescription,
  };
  const media = field('hero_media')?.reference;
  const heroImage =
    media?.__typename === 'MediaImage' && media.image
      ? {url: media.image.url, altText: media.image.altText}
      : null;

  return {
    locale,
    content,
    heroImage,
    canonicalPath: pagePath(locale, fallback.id),
    frPath: locale === 'fr' ? pagePath('fr', fallback.id) : alternatePagePath(locale, fallback.id),
    enPath: locale === 'en' ? pagePath('en', fallback.id) : alternatePagePath(locale, fallback.id),
  };
}

export default function EditorialRoute() {
  const data = useLoaderData<typeof loader>();
  return (
    <EditorialPage
      content={data.content}
      locale={data.locale}
      heroImage={data.heroImage}
    />
  );
}

const EDITORIAL_PAGE_QUERY = `#graphql
  query EditorialPage($handle: String!, $country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    metaobject(handle: {type: "editorial_page", handle: $handle}) {
      fields {
        key
        value
        reference {
          __typename
          ... on MediaImage {
            image { url altText width height }
          }
        }
      }
    }
  }
` as const;
