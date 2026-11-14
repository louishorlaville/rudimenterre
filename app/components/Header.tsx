import {Suspense, type SyntheticEvent} from 'react';
import {Await, NavLink, useLocation} from 'react-router';
import {useStorefrontCart} from '~/lib/cart';
import type {HeaderQuery} from 'storefrontapi.generated';
import {useAside} from './Aside';
import {Brand} from './Brand';
import {localizedPath, pagePath, UI_COPY} from '~/lib/editorial-content';
import {localeFromPathname, type StorefrontLocale} from '~/lib/i18n';

interface HeaderProps {
  header: HeaderQuery;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
}

function markHeaderCtaInteracted(event: SyntheticEvent<HTMLAnchorElement>) {
  event.currentTarget.classList.add('button--interacted');
}

export function Header({isLoggedIn}: HeaderProps) {
  const {pathname} = useLocation();
  const locale = localeFromPathname(pathname);
  const copy = UI_COPY[locale];
  const {open} = useAside();

  return (
    <header className="site-header">
      <Brand locale={locale} />
      <HeaderMenu viewport="desktop" />
      <nav
        className="header-actions"
        aria-label={locale === 'fr' ? 'Outils' : 'Utilities'}
      >
        <a
          className="locale-switch"
          href={localizedPath(pathname, locale === 'fr' ? 'en' : 'fr')}
          hrefLang={locale === 'fr' ? 'en' : 'fr'}
        >
          {locale === 'fr' ? 'EN' : 'FR'}
        </a>
        <AccountLink locale={locale} isLoggedIn={isLoggedIn} />
        <CartToggle label={copy.cart} locale={locale} />
        <button
          className="menu-toggle"
          onClick={() => open('mobile')}
          aria-label={copy.menu}
        >
          <span />
          <span />
        </button>
      </nav>
    </header>
  );
}

export function HeaderMenu({
  viewport,
}: {
  viewport: 'desktop' | 'mobile';
  menu?: HeaderQuery['menu'];
  primaryDomainUrl?: string;
  publicStoreDomain?: string;
}) {
  const {pathname} = useLocation();
  const locale = localeFromPathname(pathname);
  const copy = UI_COPY[locale];
  const {close} = useAside();
  const cuicuiLinks = [
    {
      label: locale === 'fr' ? 'Le catalogue Cuicui' : 'Cuicui catalogue',
      to: 'https://cdn.shopify.com/s/files/1/0276/4252/7833/files/Decouvrir-le-Cuicui-2026.pdf?v=1794625779',
      external: true,
    },
    {
      label: locale === 'fr' ? 'Le carnet pratique' : 'Practical guide',
      to: 'https://cdn.shopify.com/s/files/1/0276/4252/7833/files/Carnet_PRATIQUE_2024-FR-c.pdf?v=1743953253',
      external: true,
    },
  ];
  const howItWorks = [
    {
      label: locale === 'fr' ? 'Vapeur-étuvée' : 'Steam cooking',
      to: pagePath(locale, 'steam'),
    },
    {
      label: locale === 'fr' ? 'Inertie thermique' : 'Thermal cooking',
      to: pagePath(locale, 'thermal'),
    },
    {
      label: locale === 'fr' ? 'Distillation' : 'Distillation',
      to: pagePath(locale, 'distillation'),
    },
  ];
  const kitchenLinks = [
    {label: locale === 'fr' ? 'Potager' : 'Kitchen garden', to: pagePath(locale, 'garden')},
    {label: locale === 'fr' ? 'La recette' : 'The recipe', to: pagePath(locale, 'creator')},
    {label: locale === 'fr' ? 'Le Cuicui en vadrouille' : 'Cuicui on the road', to: pagePath(locale, 'vadrouille')},
  ];
  return (
    <nav
      className={`header-menu header-menu--${viewport}`}
      aria-label={copy.menu}
    >
      <HeaderSubmenu
        label={locale === 'fr' ? 'Le Cuicui' : 'Cuicui'}
        links={cuicuiLinks}
        pathname={pathname}
        onNavigate={close}
        viewport={viewport}
      />
      <HeaderSubmenu
        label={locale === 'fr' ? 'Comment ça marche' : 'How it works'}
        links={howItWorks}
        pathname={pathname}
        onNavigate={close}
        viewport={viewport}
      />
      <HeaderSubmenu
        label={locale === 'fr' ? 'En cuisine' : 'In the kitchen'}
        links={kitchenLinks}
        pathname={pathname}
        onNavigate={close}
        viewport={viewport}
      />
      <NavLink
        onClick={close}
        to={pagePath(locale, 'project')}
        prefetch="intent"
      >
        {copy.project}
      </NavLink>
      <NavLink
        className="button button--orange header-cta"
        onClick={close}
        onPointerEnter={markHeaderCtaInteracted}
        onFocus={markHeaderCtaInteracted}
        to={pagePath(locale, 'adopt')}
        prefetch="intent"
      >
        <span>{copy.adopt}</span>
      </NavLink>
    </nav>
  );
}

export function MobileMenuUtilities({isLoggedIn}: {isLoggedIn: Promise<boolean>}) {
  const locale = localeFromPathname(useLocation().pathname);
  const {close} = useAside();
  return (
    <nav
      className="mobile-menu-utilities"
      aria-label={locale === 'fr' ? 'Outils' : 'Utilities'}
    >
      <AccountLink locale={locale} isLoggedIn={isLoggedIn} onClick={close} />
      <CartToggle label={UI_COPY[locale].cart} locale={locale} showLabel />
    </nav>
  );
}

function HeaderSubmenu({
  label,
  links,
  pathname,
  onNavigate,
  viewport,
}: {
  label: string;
  links: Array<{label: string; to: string; external?: boolean}>;
  pathname: string;
  onNavigate: () => void;
  viewport: 'desktop' | 'mobile';
}) {
  function handleNavigate(event: SyntheticEvent<HTMLAnchorElement>) {
    event.currentTarget.closest('details')?.removeAttribute('open');
    onNavigate();
  }

  return (
    <details
      className="header-documentation"
      onMouseEnter={
        viewport === 'desktop'
          ? (event) => {
              event.currentTarget.open = true;
            }
          : undefined
      }
      onMouseLeave={
        viewport === 'desktop'
          ? (event) => {
              event.currentTarget.open = false;
            }
          : undefined
      }
    >
      <summary
        data-active={links.some((item) => pathname === item.to) || undefined}
      >
        {label}
        <span aria-hidden="true" />
      </summary>
      <div className="header-documentation__menu">
        {links.map((item) =>
          item.external ? (
            <a
              className="header-documentation__link"
              key={item.to}
              href={item.to}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleNavigate}
            >
              <span>{item.label}</span>
            </a>
          ) : (
            <NavLink
              className="header-documentation__link"
              key={item.to}
              onClick={handleNavigate}
              to={item.to}
              prefetch="intent"
            >
              <span>{item.label}</span>
            </NavLink>
          )
        )}
      </div>
    </details>
  );
}

function AccountLink({
  locale,
  isLoggedIn,
  onClick,
}: {
  locale: StorefrontLocale;
  isLoggedIn?: Promise<boolean>;
  onClick?: () => void;
}) {
  const copy = UI_COPY[locale];
  return (
    <a href={`/${locale}/account`} onClick={onClick}>
      <Suspense fallback={copy.signIn}>
        <Await resolve={isLoggedIn} errorElement={copy.signIn}>
          {(loggedIn) => (loggedIn ? copy.account : copy.signIn)}
        </Await>
      </Suspense>
    </a>
  );
}

function CartToggle({
  label,
  locale,
  showLabel = false,
}: {
  label: string;
  locale: string;
  showLabel?: boolean;
}) {
  const cart = useStorefrontCart();
  const {open} = useAside();
  const count = cart?.totalQuantity ?? 0;
  return (
    <a
      className="header-cart"
      aria-label={`${label} (${count})`}
      href={`/${locale}/cart`}
      onClick={(event) => {
        event.preventDefault();
        open('cart');
      }}
    >
      {showLabel ? (
        `${label} (${count})`
      ) : (
        <>
          <CartIcon />
          <span aria-hidden="true">{count}</span>
        </>
      )}
    </a>
  );
}

function CartIcon() {
  return (
    <svg
      className="header-cart__icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M4 5h2l1.6 9.2a2 2 0 0 0 2 1.7h6.8a2 2 0 0 0 1.9-1.4L20 8H7" />
      <circle cx="10" cy="19" r="1" />
      <circle cx="17" cy="19" r="1" />
    </svg>
  );
}
