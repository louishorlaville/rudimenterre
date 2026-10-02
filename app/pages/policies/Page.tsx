import {useLoaderData, Link} from 'react-router';
import type {Route} from '../../routes/+types/($locale).policies._index';
import type {PoliciesQuery, PolicyItemFragment} from 'storefrontapi.generated';
import {localeFromPathname} from '~/lib/i18n';

export const meta: Route.MetaFunction = ({data}) => [
  {title: `${data?.locale === 'en' ? 'Policies' : 'Politiques'} | Rudimenterre`},
];

export async function loader({context, request}: Route.LoaderArgs) {
  const locale = localeFromPathname(new URL(request.url).pathname);
  const data: PoliciesQuery = await context.storefront.query(POLICIES_QUERY, {
    variables: {
      country: context.storefront.i18n.country,
      language: context.storefront.i18n.language,
    },
  });

  const shopPolicies = data.shop;
  const policies: PolicyItemFragment[] = [
    shopPolicies?.privacyPolicy,
    shopPolicies?.shippingPolicy,
    shopPolicies?.termsOfService,
    shopPolicies?.refundPolicy,
    shopPolicies?.subscriptionPolicy,
  ].filter((policy): policy is PolicyItemFragment => policy != null);

  if (!policies.length) {
    throw new Response('No policies found', {status: 404});
  }

  return {policies, locale};
}

export default function Policies() {
  const {policies, locale} = useLoaderData<typeof loader>();
  const fr = locale === 'fr';

  return (
    <section className="policies policy" aria-labelledby="policies-title">
      <header className="policy__header">
        <Link className="policy__back" to={`/${locale}`}>
          <span aria-hidden="true">←</span>
          {fr ? 'Retour à l’accueil' : 'Back to home'}
        </Link>
        <p className="eyebrow">Rudimenterre · {fr ? 'Informations légales' : 'Legal information'}</p>
        <h1 id="policies-title">{fr ? 'Politiques' : 'Policies'}</h1>
        <p className="policies__intro">
          {fr
            ? 'Retrouvez les informations qui encadrent vos achats et votre navigation sur notre site.'
            : 'Find information about your purchases and your use of our website.'}
        </p>
      </header>
      <ul className="policies__list">
        {policies.map((policy) => (
          <li key={policy.id}>
            <Link className="policies__link" to={`/${locale}/policies/${policy.handle}`}>
              <span>{policy.title}</span>
              <svg className="policies__arrow" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M4 12h16m-6-6 6 6-6 6" />
              </svg>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

const POLICIES_QUERY = `#graphql
  fragment PolicyItem on ShopPolicy {
    id
    title
    handle
  }
  query Policies ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    shop {
      privacyPolicy {
        ...PolicyItem
      }
      shippingPolicy {
        ...PolicyItem
      }
      termsOfService {
        ...PolicyItem
      }
      refundPolicy {
        ...PolicyItem
      }
      subscriptionPolicy {
        id
        title
        handle
      }
    }
  }
` as const;
