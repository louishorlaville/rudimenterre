import {Suspense} from 'react';
import {Await, useLocation} from 'react-router';
import type {CartApiQueryFragment, FooterQuery, HeaderQuery} from 'storefrontapi.generated';
import {Aside} from './Aside';
import {CartMain} from './CartMain';
import {Footer} from './Footer';
import {Header, HeaderMenu} from './Header';
import {localeFromPathname} from '~/lib/i18n';

interface PageLayoutProps {
  cart: Promise<CartApiQueryFragment | null>;
  footer: Promise<FooterQuery | null>;
  header: HeaderQuery;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
  children?: React.ReactNode;
}

export function PageLayout({cart, children = null, footer, header, isLoggedIn, publicStoreDomain}: PageLayoutProps) {
  const locale = localeFromPathname(useLocation().pathname);
  return (
    <Aside.Provider>
      <a className="skip-link" href="#main-content">{locale === 'fr' ? 'Aller au contenu' : 'Skip to content'}</a>
      <Aside type="cart" heading={locale === 'fr' ? 'PANIER' : 'CART'} closeLabel={locale === 'fr' ? 'Fermer le panier' : 'Close cart'}>
        <Suspense fallback={<p>{locale === 'fr' ? 'Chargement…' : 'Loading…'}</p>}>
          <Await resolve={cart}>{(resolvedCart) => <CartMain cart={resolvedCart} layout="aside" />}</Await>
        </Suspense>
      </Aside>
      <Aside type="mobile" heading="MENU"><HeaderMenu viewport="mobile" /></Aside>
      <Header header={header} cart={cart} isLoggedIn={isLoggedIn} publicStoreDomain={publicStoreDomain} />
      <main id="main-content">{children}</main>
      <Footer footer={footer} header={header} publicStoreDomain={publicStoreDomain} />
    </Aside.Provider>
  );
}
