import {Suspense} from 'react';
import {Await, Link, NavLink, useAsyncValue, useLocation} from 'react-router';
import {useOptimisticCart} from '@shopify/hydrogen';
import type {HeaderQuery, CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from './Aside';
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
      <Link className="brand" prefetch="intent" to={`/${locale}`}>
        <span>RUDIMENTERRE</span>
      </Link>
      <HeaderMenu viewport="desktop" />
      <nav className="header-actions" aria-label={locale === 'fr' ? 'Outils' : 'Utilities'}>
        <Link className="locale-switch" to={localizedPath(pathname, locale === 'fr' ? 'en' : 'fr')} hrefLang={locale === 'fr' ? 'en-CA' : 'fr-CA'}>{locale === 'fr' ? 'EN' : 'FR'}</Link>
        <NavLink prefetch="intent" to={`/${locale}/account`}><Suspense fallback={copy.signIn}><Await resolve={isLoggedIn} errorElement={copy.signIn}>{(loggedIn) => loggedIn ? copy.account : copy.signIn}</Await></Suspense></NavLink>
        <CartToggle cart={cart} label={copy.cart} locale={locale} />
        <Link className="button button--orange header-cta" prefetch="intent" to={pagePath(locale, 'adopt')}>{copy.adopt}</Link>
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
  const links = [
    {label: copy.project, to: pagePath(locale, 'project')},
    {label: copy.explore, to: pagePath(locale, 'steam')},
    {label: locale === 'fr' ? 'La recette' : 'The recipe', to: pagePath(locale, 'creator')},
    ...(viewport === 'mobile' ? [{label: copy.adopt, to: pagePath(locale, 'adopt')}] : []),
  ];
  return <nav className={`header-menu header-menu--${viewport}`} aria-label={copy.menu}>{links.map((item) => <NavLink key={item.to} onClick={close} to={item.to} prefetch="intent">{item.label}</NavLink>)}</nav>;
}

function CartToggle({cart, label, locale}: {cart: HeaderProps['cart']; label: string; locale: string}) {
  return <Suspense fallback={<Link to={`/${locale}/cart`}>{label} <span>0</span></Link>}><Await resolve={cart}><CartCount label={label} locale={locale} /></Await></Suspense>;
}

function CartCount({label, locale}: {label: string; locale: string}) {
  const originalCart = useAsyncValue() as CartApiQueryFragment | null;
  const cart = useOptimisticCart(originalCart);
  const {open} = useAside();
  const count = cart?.totalQuantity ?? 0;
  return <a href={`/${locale}/cart`} onClick={(event) => {event.preventDefault(); open('cart');}}>{label} <span aria-label={`${count} items`}>{count}</span></a>;
}
