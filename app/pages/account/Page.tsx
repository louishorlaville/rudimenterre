import {
  data as remixData,
  Form,
  NavLink,
  Outlet,
  useLoaderData,
  useLocation,
} from 'react-router';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type SyntheticEvent,
} from 'react';
import type {ShouldRevalidateFunctionArgs} from 'react-router';
import type {Route} from '../../routes/+types/($locale).account';
import {CUSTOMER_DETAILS_QUERY} from '~/graphql/customer-account/CustomerDetailsQuery';
import {accountLocale, accountPath, type AccountContext} from './context';
import accountStyles from './Page.css?url';

export function links() {
  return [{rel: 'stylesheet', href: accountStyles}];
}

export function shouldRevalidate({
  defaultShouldRevalidate,
}: ShouldRevalidateFunctionArgs) {
  return defaultShouldRevalidate;
}

export async function loader({context, params}: Route.LoaderArgs) {
  const {customerAccount} = context;
  const {data, errors} = await customerAccount.query(CUSTOMER_DETAILS_QUERY, {
    variables: {language: customerAccount.i18n.language},
  });

  if (errors?.length || !data?.customer) throw new Error('Customer not found');

  return remixData(
    {customer: data.customer, locale: accountLocale(params.locale)},
    {headers: {'Cache-Control': 'no-cache, no-store, must-revalidate'}},
  );
}

function markAccountButtonInteracted(event: SyntheticEvent<HTMLDivElement>) {
  if (!(event.target instanceof Element)) return;
  event.target
    .closest<HTMLElement>(
      '.account-button, .order-search-buttons button, .account-logout button',
    )
    ?.classList.add('button--interacted');
}

export default function AccountLayout() {
  const {customer, locale} = useLoaderData<typeof loader>();
  const fr = locale === 'fr';
  const heading = customer.firstName
    ? fr
      ? `Bonjour, ${customer.firstName}`
      : `Hello, ${customer.firstName}`
    : fr
      ? 'Bienvenue dans votre compte'
      : 'Welcome to your account';

  return (
    <div
      className="account"
      onPointerOver={markAccountButtonInteracted}
      onFocus={markAccountButtonInteracted}
    >
      <header className="account-heading">
        <div className="account-heading__top">
          <p className="eyebrow">
            {fr ? 'Rudimenterre · Votre espace' : 'Rudimenterre · Your space'}
          </p>
          <Logout locale={locale} />
        </div>
        <div className="account-heading__copy">
          <h1>{heading}</h1>
          <p className="account-heading__intro">
            {fr
              ? 'Retrouvez vos commandes, vos informations et vos adresses au même endroit.'
              : 'Find your orders, personal details, and addresses in one place.'}
          </p>
        </div>
      </header>
      <AccountMenu locale={locale} />
      <div className="account-content">
        <Outlet context={{customer, locale} satisfies AccountContext} />
      </div>
    </div>
  );
}

function AccountMenu({locale}: {locale: AccountContext['locale']}) {
  const fr = locale === 'fr';
  const {pathname} = useLocation();
  const navRef = useRef<HTMLElement>(null);
  const [indicator, setIndicator] = useState<{
    x: number;
    y: number;
    width: number;
  } | null>(null);

  const positionIndicator = useCallback((link: HTMLElement) => {
    const nav = navRef.current;
    if (!nav) return;

    const navRect = nav.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();
    const styles = getComputedStyle(link);
    const paddingLeft = parseFloat(styles.paddingLeft) || 0;
    const paddingRight = parseFloat(styles.paddingRight) || 0;

    setIndicator({
      x: linkRect.left - navRect.left + paddingLeft,
      y: linkRect.bottom - navRect.top - 1,
      width: linkRect.width - paddingLeft - paddingRight,
    });
  }, []);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const update = () => {
      const active = nav.querySelector<HTMLElement>(
        ':scope > a[aria-current="page"]',
      );
      if (active) positionIndicator(active);
    };

    update();
    const observer =
      typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(update);
    if (observer) {
      observer.observe(nav);
      nav
        .querySelectorAll(':scope > a')
        .forEach((link) => observer.observe(link));
    }
    window.addEventListener('resize', update);

    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [pathname, locale, positionIndicator]);

  return (
    <nav
      ref={navRef}
      className="account-nav"
      aria-label={fr ? 'Navigation du compte' : 'Account navigation'}
      data-indicator-ready={indicator ? '' : undefined}
      onClick={(event) => {
        const link =
          event.target instanceof Element ? event.target.closest('a') : null;
        if (link && navRef.current?.contains(link)) positionIndicator(link);
      }}
    >
      <NavLink
        to={accountPath(locale, '/account/orders')}
        defaultShouldRevalidate={false}
        prefetch="intent"
      >
        {fr ? 'Commandes' : 'Orders'}
      </NavLink>
      <NavLink
        to={accountPath(locale, '/account/profile')}
        defaultShouldRevalidate={false}
        prefetch="intent"
      >
        {fr ? 'Mon profil' : 'My profile'}
      </NavLink>
      <NavLink
        to={accountPath(locale, '/account/addresses')}
        defaultShouldRevalidate={false}
        prefetch="intent"
      >
        {fr ? 'Adresses' : 'Addresses'}
      </NavLink>
      {indicator && (
        <span
          className="account-nav__indicator"
          aria-hidden="true"
          style={{
            width: indicator.width,
            transform: `translate3d(${indicator.x}px, ${indicator.y}px, 0)`,
          }}
        />
      )}
    </nav>
  );
}

function Logout({locale}: {locale: AccountContext['locale']}) {
  return (
    <Form
      className="account-logout"
      method="POST"
      action={accountPath(locale, '/account/logout')}
    >
      <button type="submit">
        {locale === 'fr' ? 'Déconnexion' : 'Sign out'}
      </button>
    </Form>
  );
}
