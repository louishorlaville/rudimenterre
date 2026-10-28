import type {EditorialPageContent} from '~/lib/editorial-content';
import {Link} from 'react-router';
import type {StorefrontLocale} from '~/lib/i18n';
import {formatMoney} from '@shopify/hydrogen';

export type AdoptionProduct = {
  id: string;
  handle: string;
  title: string;
  availableForSale: boolean;
  priceRange: {
    minVariantPrice: {amount: string; currencyCode: string};
    maxVariantPrice: {amount: string; currencyCode: string};
  };
};

export function AdoptPage({content, locale, heroImage, products = [], country = 'CA'}: {content: EditorialPageContent; locale: StorefrontLocale; heroImage?: {url: string; altText?: string | null} | null; products?: AdoptionProduct[]; country?: string}) {
  const fr = locale === 'fr';
  return (
    <article className="adopt-page">
      <header className="adopt-hero">
        <img src={heroImage?.url || '/images/rudimenterre/adopt-banner.jpeg'} alt={heroImage?.altText || ''} fetchPriority="high" />
        <div className="adopt-hero__copy">
          <h1>{content.heroOverrides?.title || (fr ? 'Adoptez' : 'Adopt')}</h1>
          <p>{content.heroOverrides?.intro || (fr ? 'Un Cuicui, un nouveau mode de cuisiner savoureux et bienfaisant' : 'A Cuicui, a new, flavourful and beneficial way of cooking')}</p>
          <p className="adopt-hero__choice">{content.heroOverrides?.eyebrow || (fr ? 'Vous avez le choix :' : 'The choice is yours:')}</p>
        </div>
      </header>
      <div className="adopt-choices">
        <section className="adopt-option adopt-option--limited" aria-labelledby="adopt-limited-title">
          <p className="adopt-option__number" aria-hidden="true">1</p>
          <Link className="button adopt-option__button" to="#adopt-kits">{fr ? 'J’achète' : 'Shop now'}</Link>
          <h2 id="adopt-limited-title">{fr ? 'Une édition limitée' : 'A limited edition'}</h2>
          <p className="adopt-option__description">
            {fr ? 'Fin de série des premiers Cuicuis fabriqués artisanalement en faïence au Canada en attendant la production française' : 'The last of the first Cuicuis, handcrafted in earthenware in Canada while we prepare for French production'}<br />
            {products.length > 0
              ? (fr ? `${products.length} kits au choix` : `Choose from ${products.length} kits`)
              : (fr ? 'Aucun kit disponible pour le moment.' : 'No kits available at the moment.')}
          </p>
          {/* The supplied V2 artwork is used as a sprite for its product photography only. */}
          <div className="adopt-products-art" role="img" aria-label={fr ? 'Les kits Cuicui en terre cuite' : 'Terracotta Cuicui kits'}>
            <img src="/images/rudimenterre/adopt-options.webp" alt="" loading="lazy" />
          </div>
          <div className="adopt-kits" id="adopt-kits">
            {products.map((product) => (
              <div key={product.id}>
                <h3>{product.title}</h3>
                <p>
                  {product.priceRange.minVariantPrice.amount !== product.priceRange.maxVariantPrice.amount && (fr ? 'À partir de ' : 'From ')}
                  {formatMoney(product.priceRange.minVariantPrice, {locale: `${locale}-${country}`}).localizedString}
                </p>
                {!product.availableForSale && <p>{fr ? 'Épuisé' : 'Sold out'}</p>}
                <Link className="adopt-kit__link" to={`/${locale}/products/${product.handle}`}>
                  {fr ? 'Voir le produit' : 'View product'}
                </Link>
              </div>
            ))}
          </div>
        </section>
        <section className="adopt-option adopt-option--vital" aria-labelledby="adopt-vital-title">
          <p className="adopt-option__number" aria-hidden="true">2</p>
          <button className="button adopt-option__button" type="button" disabled aria-describedby="adopt-registration-status">
            {fr ? 'Je m’inscris sur la liste d’adoption' : 'Join the adoption list'}
          </button>
          <h2 id="adopt-vital-title">{fr ? 'Du kit vital' : 'The essential kit'}</h2>
          <p className="adopt-option__description"><strong>{fr ? 'Futur Cuicui français' : 'The future French-made Cuicui'}</strong></p>
          <div className="adopt-vital-art" role="img" aria-label={fr ? 'Dessin du kit vital : deux récipients, un couvercle à cheminée et son bouchon' : 'Essential kit drawing: two vessels, a chimney lid and its stopper'}>
            <img src="/images/rudimenterre/adopt-options.webp" alt="" loading="lazy" />
          </div>
          <p id="adopt-registration-status" className="adopt-registration-status">{fr ? 'Les inscriptions ouvriront prochainement.' : 'Registration will open soon.'}</p>
        </section>
      </div>
    </article>
  );
}
