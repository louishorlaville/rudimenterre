import type {SyntheticEvent} from 'react';
import {Link, NavLink, useLocation} from 'react-router';
import {Brand} from './Brand';
import type {FooterQuery, HeaderQuery} from 'storefrontapi.generated';
import {pagePath} from '~/lib/editorial-content';
import {localeFromPathname} from '~/lib/i18n';

function markFooterCtaInteracted(event: SyntheticEvent<HTMLAnchorElement>) {
  event.currentTarget.classList.add('button--interacted');
}

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
        <Brand locale={locale} />
      </div>

      <nav className="site-footer__nav" aria-label={fr ? 'Plan du site' : 'Sitemap'}>
        <div className="footer-column">
          <p>{fr ? 'Découvrir' : 'Discover'}</p>
          <Link to={`/${locale}/adoptez`}>{fr ? 'Le Cuicui' : 'Cuicui'}</Link>
          <Link to={pagePath(locale, 'steam')}>{fr ? 'Comment ça marche' : 'How it works'}</Link>
          <Link to={pagePath(locale, 'vadrouille')}>{fr ? 'Le Cuicui en vadrouille' : 'Cuicui on the road'}</Link>
          <Link to={pagePath(locale, 'project')}>{fr ? 'Le projet' : 'The project'}</Link>
          <Link to={pagePath(locale, 'making')}>{fr ? 'Fabrication et entretien' : 'Making and care'}</Link>
        </div>

        <div className="footer-column">
          <p>{fr ? 'En cuisine' : 'In the kitchen'}</p>
          <a href="https://www.instagram.com/rudimenterre/reels/">{fr ? 'Suivez-nous en cuisine' : 'Follow us into the kitchen'}</a>
          <a href="https://www.blurb.ca/b/13059325-carnet-de-recettes-rudimenterre">{fr ? 'Le carnet de recettes Rudimenterre' : 'The Rudimenterre recipe book'}</a>
          <Link to={pagePath(locale, 'creator')}>{fr ? 'La recette' : 'The recipe'}</Link>
          <Link to={pagePath(locale, 'garden')}>{fr ? 'Le Potager' : 'Kitchen garden'}</Link>
        </div>

        <div className="footer-column footer-column--contact">
          <p>{fr ? 'Aide et contact' : 'Help and contact'}</p>
          <Link to={`/${locale}/pages/contacts`}>{fr ? 'Contacts' : 'Contact'}</Link>
          <Link to={pagePath(locale, 'shipping')}>{fr ? 'Tarifs, livraison et garanties' : 'Pricing, shipping and warranty'}</Link>
          <Link to={`/${locale}/pages/presse-medias`}>{fr ? 'Presse médias' : 'Press and media'}</Link>
          <Link to={`/${locale}#home-professional-services`}>{fr ? 'Pour les chefs du futur' : 'For the chefs of the future'}</Link>
        </div>
      </nav>

      <NavLink
        className="button button--orange header-cta site-footer__cta"
        onPointerEnter={markFooterCtaInteracted}
        onFocus={markFooterCtaInteracted}
        to={pagePath(locale, 'adopt')}
        prefetch="intent"
      >
        <span>{fr ? 'Adoptez' : 'Adopt'}</span>
      </NavLink>

      <nav className="footer-social" aria-label={fr ? 'Réseaux sociaux' : 'Social media'}>
        {[
          {label: 'Instagram', href: 'https://www.instagram.com/rudimenterre/reels/'},
          {label: 'YouTube', href: 'https://www.youtube.com/@rudimenterre'},
        ].map(({label, href}) => (
          <a key={label} href={href} target="_blank" rel="noreferrer">
            {label}
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M4 12 12 4M4 4h8v8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        ))}
      </nav>

      <div className="footer-meta">
        <span>© {new Date().getFullYear()} Rudimenterre</span>
        <Link to={`/${locale}/policies`}>
          {fr ? 'Politiques légales' : 'Legal policies'}
        </Link>
        <Link to={`/${locale}/policies/privacy-policy`}>
          {fr ? 'Politique de confidentialité' : 'Privacy policy'}
        </Link>
        <Link to={`/${locale}/policies/terms-of-service`}>
          {fr ? 'Conditions' : 'Terms'}
        </Link>
      </div>
    </footer>
  );
}
