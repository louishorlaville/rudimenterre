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
        <Link className="brand" to={`/${locale}`}>
          <span className="brand-word" aria-label="RUDIMENTERRE">
            {'RUDIMENTERRE'.split('').map((letter, index) => (
              <span className="brand-letter" key={`${letter}-${index}`} aria-hidden="true">{letter}</span>
            ))}
          </span>
          <sup className="brand-mark" aria-hidden="true">®</sup>
        </Link>
      </div>

      <nav className="site-footer__nav" aria-label={fr ? 'Plan du site' : 'Sitemap'}>
        <div className="footer-column">
          <p>{fr ? 'Découvrir' : 'Discover'}</p>
          <Link to={`/${locale}/collections/all`}>{fr ? 'Le Cuicui' : 'Cuicui'}</Link>
          <Link to={pagePath(locale, 'steam')}>{fr ? 'Comment ça marche' : 'How it works'}</Link>
          <Link to={pagePath(locale, 'project')}>{fr ? 'Le projet' : 'The project'}</Link>
          <Link to={pagePath(locale, 'making')}>{fr ? 'Fabrication et entretien' : 'Making and care'}</Link>
        </div>

        <div className="footer-column">
          <p>{fr ? 'En cuisine' : 'In the kitchen'}</p>
          <Link to={pagePath(locale, 'creator')}>{fr ? 'La recette' : 'The recipe'}</Link>
          <Link to={pagePath(locale, 'garden')}>{fr ? 'Potager' : 'Kitchen garden'}</Link>
          <Link to={`/${locale}/pages/ateliers-cuissons-rudimenterre`}>{fr ? 'Les ateliers' : 'Workshops'}</Link>
        </div>

        <div className="footer-column">
          <p>{fr ? 'Pour les professionnels' : 'For professionals'}</p>
          <Link to={`/${locale}/pages/service-decouverte-pro`}>{fr ? 'Service Chef' : 'Chef service'}</Link>
          <Link to={`/${locale}/pages/revendeurs`}>{fr ? 'Revendeurs' : 'Retailers'}</Link>
          <Link to={`/${locale}/pages/espace-professionnel`}>{fr ? 'Espace professionnel' : 'Professional area'}</Link>
          <Link to={`/${locale}/pages/partenaires`}>{fr ? 'Partenaires' : 'Partners'}</Link>
        </div>

        <div className="footer-column footer-column--contact">
          <p>{fr ? 'Aide et contact' : 'Help and contact'}</p>
          <Link to={`/${locale}/pages/contacts`}>{fr ? 'Contacts' : 'Contact'}</Link>
          <Link to={pagePath(locale, 'shipping')}>{fr ? 'Tarifs, livraison et garanties' : 'Pricing, shipping and warranty'}</Link>
          <Link to={`/${locale}/pages/presse-medias`}>{fr ? 'Presse médias' : 'Press and media'}</Link>
          <a href="https://www.instagram.com/rudimenterre/reels/" target="_blank" rel="noreferrer">Instagram</a>
          <a href="https://www.youtube.com/watch?si=sXF2pn_40MSpdkS_&v=xsQz-xmP88Q&feature=youtu.be" target="_blank" rel="noreferrer">YouTube</a>
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
