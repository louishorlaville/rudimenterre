import {Suspense} from 'react';
import {Await, Link, NavLink, useAsyncValue, useLocation} from 'react-router';
import {useOptimisticCart} from '@shopify/hydrogen';
import type {HeaderQuery, CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from './Aside';
import {Brand} from './Brand';
import {localizedPath, pagePath, UI_COPY} from '~/lib/editorial-content';
import {localeFromPathname} from '~/lib/i18n';

interface HeaderProps {
  header: HeaderQuery;
  cart: Promise<CartApiQueryFragment | null>;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
}

export function Header({header, isLoggedIn, cart}: HeaderProps) {
  const {pathname} = useLocation();
  const locale = localeFromPathname(pathname);
  const copy = UI_COPY[locale];
  const {open} = useAside();

  return (
    <header className="site-header">
      <Brand locale={locale} />
      <HeaderMenu viewport="desktop" />
      <nav className="header-actions" aria-label={locale === 'fr' ? 'Outils' : 'Utilities'}>
        <Link className="locale-switch" to={localizedPath(pathname, locale === 'fr' ? 'en' : 'fr')} hrefLang={locale === 'fr' ? 'en-CA' : 'fr-CA'}>{locale === 'fr' ? 'EN' : 'FR'}</Link>
        <NavLink prefetch="intent" to={`/${locale}/account`}><Suspense fallback={copy.signIn}><Await resolve={isLoggedIn} errorElement={copy.signIn}>{(loggedIn) => loggedIn ? copy.account : copy.signIn}</Await></Suspense></NavLink>
        <CartToggle cart={cart} label={copy.cart} locale={locale} />
        <button className="menu-toggle" onClick={() => open('mobile')} aria-label={copy.menu}><span /><span /></button>
      </nav>
    </header>
  );
}

export function HeaderMenu({viewport}: {viewport: 'desktop' | 'mobile'; menu?: HeaderQuery['menu']; primaryDomainUrl?: string; publicStoreDomain?: string}) {
  const {pathname} = useLocation();
  const locale = localeFromPathname(pathname);
  const copy = UI_COPY[locale];
  const {close} = useAside();
  const howItWorks = [
    {label: locale === 'fr' ? 'Vapeur-étuvée' : 'Steam cooking', to: pagePath(locale, 'steam')},
    {label: locale === 'fr' ? 'Thermique' : 'Thermal cooking', to: pagePath(locale, 'thermal')},
    {label: locale === 'fr' ? 'Distillation' : 'Distillation', to: pagePath(locale, 'distillation')},
  ];
  const kitchenLinks = [
    {label: locale === 'fr' ? 'Potager' : 'Kitchen garden', to: pagePath(locale, 'garden')},
    {label: locale === 'fr' ? 'La recette' : 'The recipe', to: pagePath(locale, 'creator')},
    {label: locale === 'fr' ? 'Le Cuicui en vadrouille' : 'Cuicui on the road', to: pagePath(locale, 'vadrouille')},
  ];
  return (
    <nav className={`header-menu header-menu--${viewport}`} aria-label={copy.menu}>
      <NavLink onClick={close} to={`/${locale}/collections/all`} prefetch="intent">{locale === 'fr' ? 'Le Cuicui' : 'Cuicui'}</NavLink>
      <HeaderSubmenu label={locale === 'fr' ? 'Comment ça marche' : 'How it works'} links={howItWorks} pathname={pathname} onNavigate={close} viewport={viewport} />
      <HeaderSubmenu label={locale === 'fr' ? 'En cuisine' : 'In the kitchen'} links={kitchenLinks} pathname={pathname} onNavigate={close} viewport={viewport} />
      <NavLink onClick={close} to={pagePath(locale, 'project')} prefetch="intent">{copy.project}</NavLink>
      <NavLink className="button button--orange header-cta" onClick={close} to={pagePath(locale, 'adopt')} prefetch="intent"><span>{copy.adopt}</span></NavLink>
    </nav>
  );
}

function HeaderSubmenu({label, links, pathname, onNavigate, viewport}: {
  label: string;
  links: Array<{label: string; to: string}>;
  pathname: string;
  onNavigate: () => void;
  viewport: 'desktop' | 'mobile';
}) {
  return (
    <details
      className="header-documentation"
      onMouseEnter={viewport === 'desktop' ? (event) => {event.currentTarget.open = true;} : undefined}
      onMouseLeave={viewport === 'desktop' ? (event) => {event.currentTarget.open = false;} : undefined}
    >
      <summary data-active={links.some((item) => pathname === item.to) || undefined}>
        {label}<span aria-hidden="true" />
      </summary>
      <div className="header-documentation__menu">
        {links.map((item) => (
          <NavLink className="header-documentation__link" key={item.to} onClick={(event) => {event.currentTarget.closest('details')?.removeAttribute('open'); onNavigate();}} to={item.to} prefetch="intent"><span>{item.label}</span></NavLink>
        ))}
      </div>
    </details>
  );
}

function CartToggle({cart, label, locale}: {cart: HeaderProps['cart']; label: string; locale: string}) {
  return <Suspense fallback={<Link className="header-cart" aria-label={label} to={`/${locale}/cart`}><CartIcon /><span aria-hidden="true">0</span></Link>}><Await resolve={cart}><CartCount label={label} locale={locale} /></Await></Suspense>;
}

function CartCount({label, locale}: {label: string; locale: string}) {
  const originalCart = useAsyncValue() as CartApiQueryFragment | null;
  const cart = useOptimisticCart(originalCart);
  const {open} = useAside();
  const count = cart?.totalQuantity ?? 0;
  return <a className="header-cart" aria-label={`${label} (${count})`} href={`/${locale}/cart`} onClick={(event) => {event.preventDefault(); open('cart');}}><CartIcon /><span aria-hidden="true">{count}</span></a>;
}

function CartIcon() {
  return (
    <svg className="header-cart__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M4 5h2l1.6 9.2a2 2 0 0 0 2 1.7h6.8a2 2 0 0 0 1.9-1.4L20 8H7" />
      <circle cx="10" cy="19" r="1" />
      <circle cx="17" cy="19" r="1" />
    </svg>
  );
}
