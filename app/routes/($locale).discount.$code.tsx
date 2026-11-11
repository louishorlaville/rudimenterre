import {redirect} from 'react-router';
import type {Route} from './+types/($locale).discount.$code';
import {getSafeReturnPath} from '~/lib/redirect';

/**
 * Automatically applies a discount found on the url
 * If a cart exists it's updated with the discount, otherwise a cart is created with the discount already applied
 *
 * @example
 * Example path applying a discount and optional redirecting (defaults to the home page)
 * ```js
 * /discount/FREESHIPPING?redirect=/products
 *
 * ```
 */
export async function loader({request, context, params}: Route.LoaderArgs) {
  const {cart} = context;
  const {code} = params;

  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);
  const redirectParam = getSafeReturnPath(
    request,
    searchParams.get('redirect') || searchParams.get('return_to'),
  );

  searchParams.delete('redirect');
  searchParams.delete('return_to');

  const destination = new URL(redirectParam, url.origin);
  searchParams.forEach((value, key) =>
    destination.searchParams.append(key, value),
  );
  const redirectUrl = `${destination.pathname}${destination.search}${destination.hash}`;

  if (!code) {
    return redirect(redirectUrl);
  }

  const result = await cart.updateDiscountCodes([code]);
  if (!result.cart || result.errors?.length)
    throw new Response('Discount unavailable', {status: 502});
  const headers = cart.setCartId(result.cart.id);

  return redirect(redirectUrl, {
    status: 303,
    headers,
  });
}
