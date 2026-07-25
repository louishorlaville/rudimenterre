import {Link, useLocation} from 'react-router';
import type {FooterQuery, HeaderQuery} from 'storefrontapi.generated';
import {pagePath} from '~/lib/editorial-content';
import {localeFromPathname} from '~/lib/i18n';

export function Footer(_props: {
  footer: Promise<FooterQuery | null>;
  header: HeaderQuery;
  publicStoreDomain: string;
}) {
  const locale = localeFromPathname(useLocation().pathname);
  const fr = locale === 'fr';

  return (
    <footer className="site-footer">
      <div className="footer-brand">
        <p>Rudimenterre</p>
      </div>

      <nav className="site-footer__nav" aria-label={fr ? 'Plan du site' : 'Sitemap'}>
        <div className="footer-column">
          <Link to={pagePath(locale, 'project')}>{fr ? 'Le projet' : 'The project'}</Link>
          <Link to={pagePath(locale, 'adopt')}>{fr ? 'Pour adoptez' : 'To adopt'}</Link>
          <Link to={`/${locale}/pages/revendeurs`}>{fr ? 'Revendeurs' : 'Retailers'}</Link>
          <Link to={pagePath(locale, 'steam')}>{fr ? 'En cuisine' : 'In the kitchen'}</Link>
        </div>

        <div className="footer-column">
          <Link to={`/${locale}/pages/ateliers-cuissons-rudimenterre`}>
            {fr ? 'Les ateliers' : 'Workshops'}
          </Link>
          <Link to={`/${locale}/pages/service-decouverte-pro`}>
            {fr ? 'Service pour les chefs' : 'Service for chefs'}
          </Link>
          <Link to={pagePath(locale, 'making')}>
            {fr ? 'Fabrication et entretien' : 'Making and care'}
          </Link>
          <Link to={`/${locale}/pages/partenaires`}>{fr ? 'Partenaires' : 'Partners'}</Link>
        </div>

        <div className="footer-column footer-column--contact">
          <p>{fr ? 'Nous contacter' : 'Contact us'}</p>
          <Link to={`/${locale}/pages/contacts`}>Contacts</Link>
          <Link to={`/${locale}/pages/presse-medias`}>
            {fr ? 'Presse médias' : 'Press and media'}
          </Link>
          <Link to={`/${locale}/pages/espace-professionnel`}>
            {fr ? 'Espace professionnel' : 'Professional area'}
          </Link>
        </div>
      </nav>

      <Link className="button button--orange site-footer__cta" to={pagePath(locale, 'adopt')}>
        {fr ? 'Adoptez' : 'Adopt'}
      </Link>

      <div className="footer-meta">
        <span>© {new Date().getFullYear()} Rudimenterre</span>
        <Link to={`/${locale}/policies/privacy-policy`}>
          {fr ? 'Confidentialité' : 'Privacy'}
        </Link>
        <Link to={`/${locale}/policies/terms-of-service`}>
          {fr ? 'Conditions' : 'Terms'}
        </Link>
      </div>
    </footer>
  );
}
