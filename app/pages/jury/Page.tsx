import type {EditorialPageContent} from '~/lib/editorial-content';
import type {StorefrontLocale} from '~/lib/i18n';

const image = (name: string) => `/images/rudimenterre/${name}`;
const catalogueUrl = 'https://issuu.com/agencepid/docs/int_92_bilingue';
const awardUrl = 'https://int.design/fr/projets/le-cuicui/';

export function JuryPage({content, locale, heroImage}: {
  content: EditorialPageContent;
  locale: StorefrontLocale;
  heroImage?: {url: string; altText?: string | null} | null;
}) {
  const fr = locale === 'fr';

  return <article className="jury-page">
    <header className="jury-hero">
      <img src={heroImage?.url || content.heroImage} alt="" className="jury-hero__image" />
      <div className="jury-hero__copy">
        <h1>{content.title}</h1>
        <svg className="jury-hero__crown" viewBox="0 0 64 54" aria-hidden="true"><path d="M5 17 18 30 31 6 45 30 59 17 55 47H9Z" fill="#df8a35" stroke="#151515" strokeWidth="2.5" strokeLinejoin="round"/><circle cx="5" cy="15" r="3" fill="#df8a35" stroke="#151515" strokeWidth="2"/><circle cx="31" cy="5" r="3" fill="#df8a35" stroke="#151515" strokeWidth="2"/><circle cx="59" cy="15" r="3" fill="#df8a35" stroke="#151515" strokeWidth="2"/></svg>
        <p>{fr ? <>17e Grand Prix International du Design - 2024<br />Lauréat Platine, Prix International<br />catégorie produit et conception durable</> : <>17th International Grand Prix du Design - 2024<br />Platinum winner, International Award<br />product and sustainable design category</>}</p>
      </div>
    </header>

    <h2 className="jury-banner">{fr ? 'MENTION DU JURY' : 'JURY MENTION'}</h2>

    <div className="jury-main">
      <div className="jury-main__inner">
        <div className="jury-story">
          <img className="jury-story__award" src={image('jury-award-logo.png')} alt={fr ? 'Lauréat Platine 2024, Grands Prix du Design' : '2024 Platinum winner, Grands Prix du Design'} />
          <img className="jury-story__excerpt" src={image('jury-excerpt.jpeg')} alt={fr ? 'Extrait de la mention officielle du jury' : 'Excerpt from the jury’s official mention'} loading="lazy" />
          <div className="jury-story__quote">
            <h3>{fr ? 'LE JURY A CONCLU' : 'THE JURY CONCLUDED'}</h3>
            <blockquote>{fr ? '« On revient à l’essence-même de l’art de cuisiner avec cet outil culinaire dessiné avec ingéniosité et la vision d’un avenir soutenable, solidaire et désirable. Un plat de cuisson domestique, modulable et polyvalent, fait de terre cuite, pouvant cuire tout type d’aliment. Bravo ! »' : '“This ingenious culinary tool returns to the very essence of cooking with a vision of a sustainable, cooperative and desirable future. A versatile terracotta cooking vessel for the home, able to cook every kind of food. Bravo!”'}</blockquote>
          </div>
          <div className="jury-story__photos">
            <img src={image('jury-portrait.jpeg')} alt={fr ? 'Carole Briet avec le prix du Cuicui' : 'Carole Briet holding the Cuicui award'} loading="lazy" />
            <img src={image('jury-trophy.jpeg')} alt={fr ? 'Trophée des Grands Prix du Design 2024' : '2024 Grands Prix du Design trophy'} loading="lazy" />
          </div>
        </div>

        <div className="jury-catalogue">
          <div className="jury-catalogue__cover">
            <img src={image('jury-catalogue.jpeg')} alt={fr ? 'Couverture du catalogue INT Design, 17e édition' : 'INT Design catalogue cover, 17th edition'} loading="lazy" />
            <div className="jury-catalogue__link">
              <p>{fr ? <>Catalogue INT Design, 17e édition, 2024<br />Retrouvez le Cuicui page 106</> : <>INT Design catalogue, 17th edition, 2024<br />Find Cuicui on page 106</>}</p>
              <a href={catalogueUrl} target="_blank" rel="noopener noreferrer">{fr ? 'Voir le catalogue' : 'View the catalogue'} <span aria-hidden="true">↗</span></a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="jury-bottom">
      <div className="jury-bottom__inner">
        <p>{fr ? 'Retrouver le Cuicui :' : 'Explore Cuicui:'}</p>
        <a href={awardUrl} target="_blank" rel="noopener noreferrer">{fr ? 'Voir le projet primé' : 'View the award-winning project'} <span aria-hidden="true">↗</span></a>
      </div>
    </div>
  </article>;
}
