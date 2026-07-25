import type {LoaderFunctionArgs} from 'react-router';

export async function loader({params, context}: LoaderFunctionArgs) {
  const {language, country} = context.storefront.i18n;

  if (!params.locale) return null;

  if (!['fr', 'en'].includes(params.locale.toLowerCase())) {
    throw new Response(null, {status: 404});
  }

  const expectedLanguage = params.locale.toLowerCase() === 'fr' ? 'FR' : 'EN';
  if (language !== expectedLanguage || !['CA', 'FR'].includes(country)) {
    throw new Response(null, {status: 404});
  }

  return null;
}
