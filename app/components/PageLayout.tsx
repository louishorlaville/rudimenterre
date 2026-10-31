import {useLocation} from 'react-router';
import type {FooterQuery, HeaderQuery} from 'storefrontapi.generated';
import {Aside} from './Aside';
import {CartMain} from './CartMain';
import {CartNotificationProvider} from './CartNotification';
import {Footer} from './Footer';
import {Header, HeaderMenu, MobileMenuUtilities} from './Header';
import {localeFromPathname} from '~/lib/i18n';

interface PageLayoutProps {
  footer: Promise<FooterQuery | null>;
  header: HeaderQuery;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
  children?: React.ReactNode;
}

export function PageLayout({
  children = null,
  footer,
  header,
  isLoggedIn,
  publicStoreDomain,
}: PageLayoutProps) {
  const locale = localeFromPathname(useLocation().pathname);
  return (
    <CartNotificationProvider>
      <Aside.Provider>
        <a className="skip-link" href="#main-content">
          {locale === 'fr' ? 'Aller au contenu' : 'Skip to content'}
        </a>
        <Aside
          type="cart"
          heading={locale === 'fr' ? 'PANIER' : 'CART'}
          closeLabel={locale === 'fr' ? 'Fermer le panier' : 'Close cart'}
        >
          <CartMain layout="aside" />
        </Aside>
        <Aside type="mobile" heading="MENU">
          <HeaderMenu viewport="mobile" />
          <MobileMenuUtilities isLoggedIn={isLoggedIn} />
        </Aside>
        <Header
          header={header}
          isLoggedIn={isLoggedIn}
          publicStoreDomain={publicStoreDomain}
        />
        <main id="main-content">{children}</main>
        <Footer
          footer={footer}
          header={header}
          publicStoreDomain={publicStoreDomain}
        />
      </Aside.Provider>
    </CartNotificationProvider>
  );
}
