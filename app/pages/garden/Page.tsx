import type {StorefrontLocale} from '~/lib/i18n';

const image = (name: string) => `/images/rudimenterre/garden/${name}`;

export function GardenPage({locale}: {locale: StorefrontLocale}) {
  const fr = locale === 'fr';

  return (
    <article className="garden-page">
      <header className="garden-intro">
        <h1>{fr ? 'VISITE GUIDÉE' : 'A GUIDED TOUR'}</h1>
        <p>{fr ? 'CONNAISSEZ-VOUS LA SIGNIFICATION D’UN POTAGER EN CUISINE ?' : 'DO YOU KNOW WHAT A KITCHEN GARDEN ONCE MEANT?'}</p>
      </header>

      <section className="garden-history" aria-label={fr ? 'Du potager médiéval au Cuicui' : 'From the medieval kitchen garden to Cuicui'}>
        <div className="garden-history__cards">
          <div className="garden-card garden-card--medieval">
            <div className="garden-card__heading">
              <h2>{fr ? 'Le Potager médiéval' : 'The medieval kitchen garden'}</h2>
              <p>{fr ? <>1485<br />Gravure du Potager</> : <>1485<br />Kitchen garden engraving</>}</p>
            </div>
            <img src={image('medieval-engraving.webp')} alt={fr ? "Gravure ancienne d'une cuisine équipée d'un potager" : 'Historical engraving of a kitchen with a built-in cooking range'} />
            <p className="garden-card__definition"><strong>{fr ? 'Le Potager XIVᵉ–XIXᵉ siècle' : 'The kitchen garden, 14th–19th century'}</strong><br />{fr ? '(n.m)&nbsp;: Ancêtre de la cuisinière. Massif de maçonnerie percé de trous (les réchauds) destinés à recevoir les braises pour conduire plusieurs cuissons longues sur un seul foyer (soupes, mijotés, bouillons, ragoûts).' : '(noun): A forerunner of the modern cooker. A masonry structure with openings for embers, allowing several dishes to cook slowly over one hearth: soups, stews, broths and casseroles.'}</p>
          </div>
          <div className="garden-card garden-card--modern">
            <div className="garden-card__heading">
              <h2>{fr ? 'Le Potager moderne' : 'The modern kitchen garden'}</h2>
              <p>{fr ? <>2026<br />Un Cuicui en mode vapeur-étuvée</> : <>2026<br />Cuicui steam-stewing</>}</p>
            </div>
            <img src={image('modern-cuicui.webp')} alt={fr ? 'Cuicui en terre cuite empilé sur une casserole' : 'Stacked terracotta Cuicui vessels on a saucepan'} />
            <p className="garden-card__definition"><strong>{fr ? 'Le Cuicui XXIᵉ siècle' : 'Cuicui, 21st century'}</strong><br />{fr ? '(n.m)&nbsp;: Relais nomade de cuissons dynamiques. Instrument en terre cuite conçu pour fraterniser les flux et recycler la vapeur pour conduire plusieurs cuissons sur un seul feu (soupes, mijotés, bouillons, ragoûts).' : '(noun): A portable cooking system made from terracotta. It brings heat and steam together to cook several dishes over one heat source: soups, stews, broths and casseroles.'}</p>
          </div>
        </div>
        <p className="garden-history__conclusion">{fr ? <>Le Cuicui permet <strong>comme un Potager médiéval</strong> de redéployer des techniques de <strong>cuissons solidaires.</strong><br />Plus <strong>pratique et mobile</strong>, il permet surtout d’optimiser leur efficacité thermique tout en réduisant <strong>leurs dépendances énergétiques et hydriques.</strong></> : <>Like a medieval kitchen garden, Cuicui brings <strong>cooperative cooking techniques</strong> back to the kitchen. More <strong>practical and portable</strong>, it improves thermal efficiency while reducing <strong>energy and water needs.</strong></>}</p>
      </section>

      <section className="garden-future" aria-labelledby="garden-future-title">
        <h2 id="garden-future-title">{fr ? 'BIENVENUE DANS LA CUISINE DU FUTUR AVEC LE CUICUI' : 'WELCOME TO THE KITCHEN OF THE FUTURE WITH CUICUI'}</h2>
        <p>{fr ? <>LE POTAGER MÉDIÉVAL REVISITÉ<br />POUR RETROUVER L’INTELLIGENCE DES FLUX</> : <>THE MEDIEVAL KITCHEN GARDEN, REIMAGINED<br />FOR A SMARTER FLOW OF HEAT AND STEAM</>}</p>
      </section>

      <section className="garden-cooking" aria-labelledby="garden-cooking-title">
        <p className="garden-cooking__manifesto">{fr ? <><strong>Parce que cuisiner aujourd’hui n’est plus juste choisir des ingrédients et savoir les accommoder.</strong><br />C’est maintenant savoir les accommoder dans un monde comme hier sous contraintes.<br /><strong>Le Cuicui nous réapprend à nous organiser pour cuisiner comme avant,<br />avec moins d’eau et d’énergie</strong></> : <><strong>Cooking today means more than choosing ingredients and knowing how to prepare them.</strong><br />It also means adapting the way we cook to a world with new constraints.<br /><strong>Cuicui helps us organise our cooking as people once did,<br />using less water and energy.</strong></>}</p>
        <img className="garden-cooking__banner" src={image('cooking-top.webp')} alt={fr ? 'Trois préparations dans des Cuicui en terre cuite' : 'Three dishes prepared in terracotta Cuicui vessels'} />
        <div className="garden-cooking__single-fire">
          <h2 id="garden-cooking-title">{fr ? 'UN SEUL FEU POUR TOUT CUISINER' : 'ONE HEAT SOURCE FOR EVERYTHING'}</h2>
          <p>{fr ? <>Le Cuicui déposé sur une casserole d’eau permet de cuire <strong>plusieurs préparations sur une seule source de chaleur</strong>, comme un Potager, l’ancêtre de nos cuisinières</> : <>Placed over a saucepan of water, Cuicui cooks <strong>several dishes using a single heat source</strong>, just like the kitchen garden that preceded the modern cooker.</>}</p>
        </div>
        <div className="garden-cooking__fraternity">
          <h2>{fr ? 'LA FRATERNITÉ DES CUISSONS RUDIMENTERRE' : 'RUDIMENTERRE’S COOPERATIVE COOKING'}</h2>
          <p>{fr ? <>L’architecture du Cuicui organise la circulation des flux thermiques et de vapeur entre chaque récipient superposé sur une casserole d’eau. <strong>Il cuisine ainsi avec le cycle naturel de l’eau et optimise son efficacité thermique&nbsp;:</strong></> : <>Cuicui’s design guides heat and steam between each vessel stacked over a saucepan of water. <strong>It works with the natural water cycle to make cooking more thermally efficient:</strong></>}</p>
        </div>
        <div className="garden-benefits">
          <section>
            <h3>{fr ? 'L’esprit potager' : 'The kitchen garden spirit'} <img src={image('pot-icon.png')} alt="" /></h3>
            <p>{fr ? <>Pour mijoter soupes, bouillons, ragoûts mais plus durablement qu’un Potager. En préservant l’eau des aliments et en recyclant la vapeur d’eau, il génère un <strong>savoureux bouillon distillé</strong> qui concentre l’essence des produits</> : <>For soups, broths and stews, with less waste. By preserving the food’s own moisture and recycling steam, Cuicui creates a <strong>flavourful distilled broth</strong> that concentrates each ingredient’s essence.</>}</p>
          </section>
          <section>
            <h3>{fr ? 'Le cœur des grains' : 'The heart of every grain'} <img src={image('grain-icon.png')} alt="" /></h3>
            <p>{fr ? <>Pour réussir céréales et légumineuses (riz, lentilles, semoules) <strong>par absorption douce bienfaisante et maîtrisée</strong></> : <>For grains and legumes such as rice, lentils and couscous, cooked <strong>gently and evenly by absorption.</strong></>}</p>
          </section>
          <section>
            <h3>{fr ? 'Four d’antan' : 'The old-fashioned oven'} <img src={image('bread-icon.png')} alt="" /></h3>
            <p>{fr ? <>Mais aussi au four traditionnel pour saisir et dorer rôtis, gratins, pains sans jamais dessécher. L’inertie thermique de la terre cuite <strong>équilibre à merveille</strong> la cuisson</> : <>Use it in a conventional oven to brown roasts, gratins and bread without drying them out. Terracotta’s thermal inertia <strong>keeps cooking beautifully balanced.</strong></>}</p>
          </section>
        </div>
        <img className="garden-cooking__banner garden-cooking__banner--bottom" src={image('cooking-bottom.webp')} alt={fr ? 'Gâteau, Cuicui au four et pains cuits en terre cuite' : 'Cake, Cuicui vessels and bread baked in terracotta'} loading="lazy" />
      </section>
    </article>
  );
}
