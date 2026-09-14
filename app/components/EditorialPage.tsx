import {Link} from 'react-router';
import type {EditorialPageContent} from '~/lib/editorial-content';
import type {StorefrontLocale} from '~/lib/i18n';

export function EditorialPage({content, locale, heroImage}: {
  content: EditorialPageContent;
  locale: StorefrontLocale;
  heroImage?: {url: string; altText?: string | null} | null;
}) {
  if (content.id === 'project') {
    return <ProjectPage content={content} locale={locale} heroImage={heroImage} />;
  }

  return <article className="editorial-page">
    <header className="editorial-hero">
      <img className="editorial-hero__image" src={heroImage?.url || content.heroImage} alt={heroImage?.altText || ''} style={{objectPosition: content.heroPosition || 'center'}} />
      <div className="editorial-hero__shade" />
      <div className="editorial-hero__copy">
        <p className="eyebrow">{content.eyebrow}</p>
        <h1>{content.title}</h1>
        <p className="editorial-intro">{content.intro}</p>
      </div>
    </header>
    <div className="editorial-sections">
      {content.sections.map((section, index) => <section className="editorial-section" data-tone={section.tone || 'cream'} key={section.title}>
        <p className="editorial-section__number">{String(index + 1).padStart(2, '0')}</p>
        <div className="editorial-section__copy">
          <h2>{section.title}</h2>
          <p>{section.body}</p>
          {section.bullets && <ul>{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>}
        </div>
        {section.image && <img className="editorial-section__image" src={section.image} alt={section.imageAlt || ''} loading="lazy" />}
      </section>)}
    </div>
    <footer className="editorial-next">
      <p>{locale === 'fr' ? 'Empilez · distillez · savourez' : 'Stack · distil · savour'}</p>
      <Link to={`/${locale}/collections/all`} className="button button--orange">{locale === 'fr' ? 'Adoptez' : 'Adopt'}</Link>
    </footer>
  </article>;
}

function ProjectPage({content, locale, heroImage}: {
  content: EditorialPageContent;
  locale: StorefrontLocale;
  heroImage?: {url: string; altText?: string | null} | null;
}) {
  const fr = locale === 'fr';

  return (
    <article className="project-page">
      <header className="project-hero">
        <img
          className="project-hero__image"
          src={heroImage?.url || content.heroImage}
          alt={heroImage?.altText || ''}
        />
        <h1>{fr ? 'LE PROJET RUDIMENTERRE' : 'THE RUDIMENTERRE PROJECT'}</h1>
      </header>

      <section className="project-intro" aria-labelledby="project-intro-title">
        <div className="project-heading">
          <img src="/images/rudimenterre/project-flag.png" alt="" aria-hidden="true" />
          <div>
            <h2 id="project-intro-title">{fr ? 'LE PROJET' : 'THE PROJECT'}</h2>
            <p>{fr ? 'UN CUICUI MADE IN FRANCE' : 'A CUICUI MADE IN FRANCE'}</p>
          </div>
          <img className="project-heading__flag--right" src="/images/rudimenterre/project-flag.png" alt="" aria-hidden="true" />
        </div>
        {fr ? (
          <p className="project-copy project-copy--intro">
            <em>Imaginé au Canada, après 3 ans de R&amp;D et une fabrication à petite échelle pour tester le marché, l’intérêt que suscite le Cuicui ne fait que se renforcer.</em>{' '}
            Aujourd’hui, nous souhaitons <strong>pouvoir offrir un Cuicui fabriqué en France</strong>, là où nous en avons le plus de demandes. Actuellement en processus de recherche de partenaire de fabrication, nous espérons <strong>proposer un Cuicui 100% français</strong> très bientôt.
          </p>
        ) : (
          <p className="project-copy project-copy--intro">
            <em>Imagined in Canada after three years of R&amp;D and small-scale production to test the market, the interest in Cuicui continues to grow.</em>{' '}
            Today, we want to <strong>offer a Cuicui made in France</strong>, where demand is strongest. We are currently looking for a manufacturing partner and hope to <strong>offer a 100% French Cuicui</strong> very soon.
          </p>
        )}
      </section>

      <section className="project-section project-section--cream" aria-labelledby="project-concept-title">
        <div className="project-section__inner">
          <h2 id="project-concept-title">{fr ? 'LE CONCEPT' : 'THE CONCEPT'}</h2>
          <h3>{fr ? 'LE CUICUI, RELAIS DE CUISSONS SAINES ET DURABLES' : 'CUICUI, A RELAY FOR HEALTHY AND SUSTAINABLE COOKING'}</h3>
          {fr ? (
            <div className="project-copy">
              <p><em>Rudimenterre s’incarne dans une vision futuriste et réparatrice en offrant une solution simple pour <strong>redonner sens et goût à notre alimentation</strong> : le Cuicui.</em></p>
              <p>Un relais de cuissons modulable et polyvalent en terre cuite <strong>pour la cuisine du futur : saine, durable, fraternelle et économe.</strong> La marque s’intéresse particulièrement aux connexions naturelles entre les aliments et les matériaux des plats ainsi qu’à l’usage et à l’expérience de l’usager. Le Cuicui permet de préparer en même temps plusieurs repas sains, inclusifs et économiques.</p>
              <p><em>L’idée innovante du Cuicui est d’allier une architecture astucieuse à la sensibilité de la terre cuite pour <strong>cuisiner plus avec moins.</strong></em></p>
              <p><strong>Moins d’eau potable, moins d’énergie, moins de cochonneries.</strong><br /><strong>Plus de goûts, plus de sens, plus d’autonomie, plus de gens et de convivialité.</strong></p>
            </div>
          ) : (
            <div className="project-copy">
              <p><em>Rudimenterre takes shape through a forward-looking, restorative vision, offering a simple way to <strong>bring meaning and pleasure back to everyday food</strong>: Cuicui.</em></p>
              <p>A versatile terracotta cooking relay <strong>for a healthy, sustainable, cooperative and economical kitchen of the future.</strong> Cuicui explores the natural connections between food and cookware, as well as the way people use and experience their kitchen.</p>
              <p><em>Cuicui’s innovation combines clever architecture with the sensitivity of terracotta to <strong>cook more with less.</strong></em></p>
              <p><strong>Less drinking water, less energy, less waste.<br />More flavour, meaning, autonomy, people and togetherness.</strong></p>
            </div>
          )}
        </div>
      </section>

      <section className="project-section project-section--creator" aria-labelledby="project-creator-title">
        <div className="project-section__inner">
          <h2 id="project-creator-title">{fr ? 'LA CRÉATRICE' : 'THE CREATOR'}</h2>
          <h3>{fr ? 'C’EST MEILLEUR QUAND C’EST BEAU' : 'IT IS BETTER WHEN IT IS BEAUTIFUL'}</h3>
          {fr ? (
            <div className="project-copy">
              <p><em>Recréer du lien, du sens, du goût, c’est l’objectif de Carole Briet,</em> créatrice du Cuicui Rudimenterre. Passionnée par le patrimoine historique et artistique, Carole devient designer spécialisée en <strong>rénovation du bâti ancien en France.</strong> Sensible à l’environnement, elle s’intéresse aux <strong>matériaux naturels et à l’écoconstruction</strong> pendant plus de 15 ans. Les matériaux biosourcés la fascinent et particulièrement l’argile et les échanges thermodynamiques qu’elle génère et fait une analogie avec nos anciennes cocottes en terre. Elle y voit une <strong>alternative aux matériaux culinaires modernes pas toujours sains</strong> et retourne aux études dans un nouveau pays d’adoption, le Canada, pour réinventer des plats de cuissons saines et adaptés à notre époque.</p>
              <p>Après un diplôme de céramiste et 3 ans de R&amp;D pour la mise au point de l’esthétique et la fabrication du Cuicui, Carole développe aujourd’hui tout le <strong>potentiel culinaire du Cuicui.</strong> Elle édite une méthode de <strong>recettes économes et zéro déchet</strong> et travaille sur la mise en place d’<strong>ateliers de cuissons solidaires.</strong></p>
            </div>
          ) : (
            <div className="project-copy">
              <p><em>Rebuilding connection, meaning and flavour is Carole Briet’s goal,</em> as the creator of Rudimenterre’s Cuicui. Passionate about historical and artistic heritage, Carole became a designer specialising in <strong>the renovation of old buildings in France.</strong> Her interest in <strong>natural materials and ecological construction</strong> led her to clay and its thermodynamic exchanges.</p>
              <p>After training as a ceramicist and three years of R&amp;D to refine Cuicui’s design and making, Carole now develops its full <strong>culinary potential</strong>, shares <strong>economical, zero-waste recipes</strong> and builds <strong>cooperative cooking workshops.</strong></p>
            </div>
          )}
        </div>
      </section>
    </article>
  );
}
