import {Link, useLoaderData, useLocation} from 'react-router';
import type {Route} from '../../routes/+types/($locale).policies.$handle';
import {localeFromPathname} from '~/lib/i18n';
import {policyTitle} from '~/lib/policy-titles';

const POLICY_FIELDS = {
  'privacy-policy': 'privacyPolicy',
  'shipping-policy': 'shippingPolicy',
  'terms-of-service': 'termsOfService',
  'refund-policy': 'refundPolicy',
  'subscription-policy': 'subscriptionPolicy',
} as const;

export const meta: Route.MetaFunction = ({data}) => {
  return [{title: `${data?.policy.title ?? ''} | Rudimenterre`}];
};

export async function loader({params, context, request}: Route.LoaderArgs) {
  if (!params.handle) {
    throw new Response('No handle was passed in', {status: 404});
  }

  if (!Object.hasOwn(POLICY_FIELDS, params.handle))
    throw new Response('Unknown policy', {status: 404});
  const policyName = POLICY_FIELDS[params.handle as keyof typeof POLICY_FIELDS];

  const data = await context.storefront.query(POLICY_CONTENT_QUERY, {
    variables: {
      privacyPolicy: false,
      shippingPolicy: false,
      termsOfService: false,
      refundPolicy: false,
      subscriptionPolicy: false,
      [policyName]: true,
      language: context.storefront.i18n?.language,
    },
  });

  const policy = data.shop?.[policyName];

  if (!policy) {
    throw new Response('Could not find the policy', {status: 404});
  }

  const locale = localeFromPathname(new URL(request.url).pathname);
  return {
    policy: {
      ...policy,
      title: policyTitle(policy.handle, locale, policy.title),
    },
  };
}

export default function Policy() {
  const {policy} = useLoaderData<typeof loader>();
  const {pathname} = useLocation();
  const locale = localeFromPathname(pathname);
  const fr = locale === 'fr';

  return (
    <article className="policy" aria-labelledby="policy-title">
      <header className="policy__header">
        <Link className="policy__back" to={`/${locale}/policies`}>
          <span aria-hidden="true">←</span>
          {fr ? 'Toutes les politiques' : 'All policies'}
        </Link>
        <p className="eyebrow">
          Rudimenterre · {fr ? 'Informations légales' : 'Legal information'}
        </p>
        <h1 id="policy-title">{policy.title}</h1>
      </header>
      <div
        className="policy__body"
        dangerouslySetInnerHTML={{__html: policy.body}}
      />
    </article>
  );
}

// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/Shop
const POLICY_CONTENT_QUERY = `#graphql
  fragment Policy on ShopPolicy {
    body
    handle
    id
    title
    url
  }
  query Policy(
    $country: CountryCode
    $language: LanguageCode
    $privacyPolicy: Boolean!
    $refundPolicy: Boolean!
    $shippingPolicy: Boolean!
    $termsOfService: Boolean!
    $subscriptionPolicy: Boolean!
  ) @inContext(language: $language, country: $country) {
    shop {
      privacyPolicy @include(if: $privacyPolicy) {
        ...Policy
      }
      shippingPolicy @include(if: $shippingPolicy) {
        ...Policy
      }
      termsOfService @include(if: $termsOfService) {
        ...Policy
      }
      refundPolicy @include(if: $refundPolicy) {
        ...Policy
      }
      subscriptionPolicy @include(if: $subscriptionPolicy) {
        body
        handle
        id
        title
        url
      }
    }
  }
` as const;
