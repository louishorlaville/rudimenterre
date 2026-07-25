import {Link, useLocation} from 'react-router';
import type {FooterQuery, HeaderQuery} from 'storefrontapi.generated';
import {pagePath} from '~/lib/editorial-content';
import {localeFromPathname} from '~/lib/i18n';

export function Footer(_props:{footer:Promise<FooterQuery|null>;header:HeaderQuery;publicStoreDomain:string}) {
  const locale=localeFromPathname(useLocation().pathname); const fr=locale==='fr';
  const pages = [
    ['project',fr?'Le projet':'The project'],['steam',fr?'En cuisine':'In the kitchen'],
    ['thermal',fr?'Les expériences':'Experiments'],['making',fr?'Fabrication et entretien':'Making and care'],
    ['creator',fr?'La recette':'The recipe'],['jury',fr?'Prix et jury':'Awards'],
    ['shipping',fr?'Tarifs, livraison, garanties':'Pricing, shipping, warranty'],['adopt',fr?'Adoptez':'Adopt'],
  ] as const;
  return <footer className="site-footer">
    <div className="footer-brand"><p>RUDIMENTERRE</p><h2>{fr?'Un Cuicui pour demain.':'A Cuicui for tomorrow.'}</h2></div>
    <nav aria-label={fr?'Plan du site':'Sitemap'}>{pages.map(([id,label])=><Link key={id} to={pagePath(locale,id)}>{label}</Link>)}</nav>
    <div className="footer-meta"><span>© {new Date().getFullYear()} Rudimenterre</span><Link to={`/${locale}/policies/privacy-policy`}>{fr?'Confidentialité':'Privacy'}</Link><Link to={`/${locale}/policies/terms-of-service`}>{fr?'Conditions':'Terms'}</Link></div>
  </footer>;
}
