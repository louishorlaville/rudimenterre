import type {Route} from './+types/($locale).sitemap.$type.$page[.xml]';
import {getSitemap} from '~/lib/sitemap.server';

export async function loader({
  request,
  params,
  context: {storefront},
}: Route.LoaderArgs) {
  const response = await getSitemap({
    storefront,
    request,
    params,
  });

  response.headers.set('Cache-Control', `max-age=${60 * 60 * 24}`);

  return response;
}
