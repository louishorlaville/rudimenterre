import {data, type ActionFunctionArgs, type LoaderFunctionArgs} from 'react-router';
import {loadNewsletterPreferences, saveNewsletterPreferences} from '../../lib/customer-newsletter.server.js';
import {isFormOriginAllowed} from '../../lib/form-origin.server.js';

export async function profileLoader({context, params}: LoaderFunctionArgs) {
  await context.customerAccount.handleAuthStatus();
  try {
    const newsletter = await loadNewsletterPreferences(context, params.locale === 'en' ? 'en' : 'fr');
    return data({newsletter}, {headers: {'Cache-Control': 'no-store'}});
  } catch (error) {
    if (error instanceof Response) throw error;
    return data({newsletter: null}, {headers: {'Cache-Control': 'no-store'}});
  }
}

export async function newsletterAction({request, context, params}: ActionFunctionArgs) {
  const fr = params.locale !== 'en';
  const fail = (status: number, diagnostic: string) => {
    console.error('Newsletter preferences failed', {status, diagnostic});
    return data({success: false, error: (fr
    ? 'Vos préférences n’ont pas pu être enregistrées. Rechargez la page pour vérifier votre abonnement, puis réessayez.'
    : 'Your preferences could not be saved. Reload to check your subscription, then try again.')},
  {status, headers: {'Cache-Control': 'no-store'}});
  };
  if (request.method !== 'POST') return fail(405, 'method');
  if (!isFormOriginAllowed(request, import.meta.env?.DEV)) return fail(403, 'origin');
  await context.customerAccount.handleAuthStatus();
  let form: FormData;
  try {
    const body = await request.text();
    if (body.length > 8000) return fail(413, 'body-size');
    form = await new Request(request.url, {method: 'POST', headers: request.headers, body}).formData();
  } catch {
    return fail(400, 'form');
  }
  const interests = form.getAll('interests');
  const language = form.get('language');
  const subscribed = form.get('subscribed');
  if ((language !== 'fr' && language !== 'en') || (subscribed !== null && subscribed !== 'yes') ||
    interests.length > 3 || interests.some((interest) => typeof interest !== 'string' || !['recipes', 'workshops', 'news'].includes(interest))) return fail(400, 'validation');
  try {
    await saveNewsletterPreferences(context, {subscribed: subscribed === 'yes', interests: interests as string[], language});
    return data({success: true, error: null}, {headers: {'Cache-Control': 'no-store'}});
  } catch (error) {
    if (error instanceof Response) throw error;
    const known = ['Customer authentication required', 'Newsletter preferences unavailable',
      'Newsletter consent save failed', 'Newsletter preferences save failed',
      'Shopify Admin credentials missing', 'Shopify token request failed', 'Invalid Shopify domain'];
    const diagnostic = error instanceof Error && known.includes(error.message) ? error.message : 'shopify-request';
    return fail(502, diagnostic);
  }
}
