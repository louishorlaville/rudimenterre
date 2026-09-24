import {EditorialTemplate} from '~/pages/editorial/Template';
import type {EditorialPageContent} from '~/lib/editorial-content';
import type {StorefrontLocale} from '~/lib/i18n';

const image = (name: string) => `/images/rudimenterre/garden/${name}`;

export function GardenPage(props: {
  content: EditorialPageContent;
  locale: StorefrontLocale;
  heroImage?: {url: string; altText?: string | null} | null;
}) {
  if (props.locale !== 'fr') return <EditorialTemplate {...props} />;

  return (
    <article className="garden-page">
      <header className="garden-intro">
        <h1>VISITE GUIDÉE</h1>
        <p>CONNAISSEZ-VOUS LA SIGNIFICATION D’UN POTAGER EN CUISINE&nbsp;?</p>
      </header>

      <section className="garden-history" aria-label="Du potager médiéval au Cuicui">
        <div className="garden-history__cards">
          <div className="garden-card garden-card--medieval">
            <div className="garden-card__heading">
              <h2>Le Potager médiéval</h2>
              <p>1485<br />Gravure du Potager</p>
            </div>
            <img src={image('medieval-engraving.webp')} alt="Gravure ancienne d'une cuisine équipée d'un potager" />
            <p className="garden-card__definition"><strong>Le Potager XIV - XIXe</strong><br />(n.m)&nbsp;: Ancêtre de la cuisinière. Massif de maçonnerie percé de trous (les réchauds) destinés à recevoir les braises pour conduire plusieurs cuissons longues sur un seul foyer (soupes, mijotés, bouillons, ragoûts).</p>
          </div>
          <div className="garden-card garden-card--modern">
            <div className="garden-card__heading">
              <h2>Le Potager moderne</h2>
              <p>2026<br />Un Cuicui en mode vapeur-étuvée</p>
            </div>
            <img src={image('modern-cuicui.webp')} alt="Cuicui en terre cuite empilé sur une casserole" />
            <p className="garden-card__definition"><strong>Le Cuicui XXIème -</strong><br />(n.m)&nbsp;: Relais nomade de cuissons dynamiques. Instrument en terre cuite conçu pour fraterniser les flux et recycler la vapeur pour conduire plusieurs cuissons sur un seul feu (soupes, mijotés, bouillons, ragoûts).</p>
          </div>
        </div>
        <p className="garden-history__conclusion">Le Cuicui permet <strong>comme un Potager médiéval</strong> de redéployer des techniques de <strong>cuissons solidaires.</strong><br />Plus <strong>pratique et mobile</strong>, il permet surtout d’optimiser leur efficacité thermique tout en réduisant <strong>leurs dépendances énergétiques et hydriques.</strong></p>
      </section>

      <section className="garden-future" aria-labelledby="garden-future-title">
        <h2 id="garden-future-title">BIENVENUE DANS LA CUISINE DU FUTUR AVEC LE CUICUI</h2>
        <p>LE POTAGER MÉDIÉVAL REVISITÉ<br />POUR RETROUVER L’INTELLIGENCE DES FLUX</p>
      </section>

      <section className="garden-cooking" aria-labelledby="garden-cooking-title">
        <p className="garden-cooking__manifesto"><strong>Parce que cuisiner aujourd’hui n’est plus juste choisir des ingrédients et savoir les accommoder.</strong><br />C’est maintenant savoir les accommoder dans un monde comme hier sous contraintes.<br /><strong>Le Cuicui nous réapprend à nous organiser pour cuisiner comme avant,<br />avec moins d’eau et d’énergie</strong></p>
        <img className="garden-cooking__banner" src={image('cooking-top.webp')} alt="Trois préparations dans des Cuicui en terre cuite" />
        <div className="garden-cooking__single-fire">
          <h2 id="garden-cooking-title">UN SEUL FEU POUR TOUT CUISINER</h2>
          <p>Le Cuicui déposé sur une casserole d’eau permet de cuire <strong>plusieurs préparations sur une seule source de chaleur</strong>, comme un Potager, l’ancêtre de nos cuisinières</p>
        </div>
        <div className="garden-cooking__fraternity">
          <h2>LA FRATERNITÉ DES CUISSONS RUDIMENTERRE</h2>
          <p>L’architecture du Cuicui organise la circulation des flux thermiques et de vapeur entre chaque récipient superposé sur une casserole d’eau. <strong>Il cuisine ainsi avec le cycle naturel de l’eau et optimise son efficacité thermique&nbsp;:</strong></p>
        </div>
        <div className="garden-benefits">
          <section>
            <h3>L’esprit potager <img src={image('pot-icon.png')} alt="" /></h3>
            <p>Pour mijoter soupes, bouillons, ragoûts mais plus durablement qu’un Potager. En préservant l’eau des aliments et en recyclant la vapeur d’eau, il génère un <strong>savoureux bouillon distillé</strong> qui concentre l’essence des produits</p>
          </section>
          <section>
            <h3>Le cœur des grains <img src={image('grain-icon.png')} alt="" /></h3>
            <p>Pour réussir céréales et légumineuses (riz, lentilles, semoules) <strong>par absorption douce bienfaisante et maîtrisée</strong></p>
          </section>
          <section>
            <h3>Four d’antan <img src={image('bread-icon.png')} alt="" /></h3>
            <p>Mais aussi au four traditionnel pour saisir et dorer rôtis, gratins, pains sans jamais dessécher. L’inertie thermique de la terre cuite <strong>équilibre à merveille</strong> la cuisson</p>
          </section>
        </div>
        <img className="garden-cooking__banner garden-cooking__banner--bottom" src={image('cooking-bottom.webp')} alt="Gâteau, Cuicui au four et pains cuits en terre cuite" loading="lazy" />
      </section>
    </article>
  );
}
