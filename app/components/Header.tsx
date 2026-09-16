import {Suspense, useRef, type PointerEvent as ReactPointerEvent} from 'react';
import {Await, Link, NavLink, useAsyncValue, useLocation} from 'react-router';
import {useOptimisticCart} from '@shopify/hydrogen';
import type {HeaderQuery, CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from './Aside';
import {localizedPath, pagePath, UI_COPY} from '~/lib/editorial-content';
import {localeFromPathname} from '~/lib/i18n';

const BRAND_NAME = 'RUDIMENTERRE';

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
  const brandRef = useRef<HTMLAnchorElement>(null);

  function handleBrandPointerMove(event: ReactPointerEvent<HTMLAnchorElement>) {
    if (event.pointerType === 'touch' || !brandRef.current) return;

    const brand = brandRef.current;
    const letters = brand.querySelectorAll<HTMLElement>('.brand-letter');
    const pointerX = event.clientX;
    const pointerY = event.clientY;

    brand.classList.add('brand--tracking');
    letters.forEach((letter) => {
      const rect = letter.getBoundingClientRect();
      const deltaX = pointerX - (rect.left + rect.width / 2);
      const deltaY = pointerY - (rect.top + rect.height / 2);
      const distance = Math.hypot(deltaX, deltaY);
      const influence = Math.max(0, 1 - distance / 72);
      const directionX = distance ? -deltaX / distance : 0;
      const directionY = distance ? -deltaY / distance : -1;
      const shiftX = directionX * influence * 6;
      const shiftY = directionY * influence * 4;
      const rotation = directionX * influence * 7;

      letter.style.setProperty('--brand-shift-x', `${shiftX.toFixed(2)}px`);
      letter.style.setProperty('--brand-shift-y', `${shiftY.toFixed(2)}px`);
      letter.style.setProperty('--brand-rotation', `${rotation.toFixed(2)}deg`);
    });
  }

  function resetBrandPointer() {
    const brand = brandRef.current;
    if (!brand) return;

    brand.classList.remove('brand--tracking');
    brand.querySelectorAll<HTMLElement>('.brand-letter').forEach((letter) => {
      letter.style.removeProperty('--brand-shift-x');
      letter.style.removeProperty('--brand-shift-y');
      letter.style.removeProperty('--brand-rotation');
    });
  }

  return (
    <header className="site-header">
      <Link className="brand" ref={brandRef} onPointerMove={handleBrandPointerMove} onPointerLeave={resetBrandPointer} onPointerCancel={resetBrandPointer} prefetch="intent" to={`/${locale}`}>
        <span className="brand-word" aria-label={BRAND_NAME}>
          {BRAND_NAME.split('').map((letter, index) => (
            <span className="brand-letter" key={`${letter}-${index}`} aria-hidden="true">{letter}</span>
          ))}
        </span>
        <sup className="brand-mark" aria-hidden="true">®</sup>
      </Link>
      <HeaderMenu viewport="desktop" />
      <nav className="header-actions" aria-label={locale === 'fr' ? 'Outils' : 'Utilities'}>
        <Link className="locale-switch" to={localizedPath(pathname, locale === 'fr' ? 'en' : 'fr')} hrefLang={locale === 'fr' ? 'en-CA' : 'fr-CA'}>{locale === 'fr' ? 'EN' : 'FR'}</Link>
        <NavLink prefetch="intent" to={`/${locale}/account`}><Suspense fallback={copy.signIn}><Await resolve={isLoggedIn} errorElement={copy.signIn}>{(loggedIn) => loggedIn ? copy.account : copy.signIn}</Await></Suspense></NavLink>
        <Link className="button button--orange header-cta" prefetch="intent" to={pagePath(locale, 'adopt')}>{copy.adopt}</Link>
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
  const links = [
    {label: copy.project, to: pagePath(locale, 'project')},
    {label: copy.explore, to: pagePath(locale, 'steam')},
    {label: locale === 'fr' ? 'Les ateliers' : 'Workshops', to: `/${locale}/pages/ateliers-cuissons-rudimenterre`},
    {label: locale === 'fr' ? 'Service Chef' : 'Chef service', to: `/${locale}/pages/service-decouverte-pro`},
    {label: locale === 'fr' ? 'Édition limitée' : 'Limited edition', to: pagePath(locale, 'adopt')},
    {label: locale === 'fr' ? 'La recette' : 'The recipe', to: pagePath(locale, 'creator')},
    ...(viewport === 'mobile' ? [{label: copy.adopt, to: pagePath(locale, 'adopt'), cta: true}] : []),
  ];
  return <nav className={`header-menu header-menu--${viewport}`} aria-label={copy.menu}>{links.map((item) => <NavLink className={item.cta ? 'button button--orange header-cta' : undefined} key={item.to} onClick={close} to={item.to} prefetch="intent">{item.label}</NavLink>)}</nav>;
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
