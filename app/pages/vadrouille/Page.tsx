import type {EditorialPageContent} from '~/lib/editorial-content';
import type {StorefrontLocale} from '~/lib/i18n';

const pressImages = [
  [1, 'Magazine Regain, automne 2024', 'Regain magazine, Fall 2024'],
  [2, 'Reportage Regain sur le Cuicui', 'Regain feature on Cuicui'],
  [4, 'Article La Relève de La Peste', 'La Relève de La Peste article'],
  [11, 'Extrait La Relève de La Peste : les objets low-tech', 'La Relève de La Peste excerpt: low-tech objects'],
  [7, 'Article La Maison du XXIe siècle', 'La Maison du XXIe siècle article'],
  [3, 'Publication Lowtech Journal : Low-Tech et cuisson', 'Lowtech Journal post: Low-Tech and cooking'],
  [12, 'Rencontre Écotable en direct sur Radio Grenouille', 'Écotable gathering live on Radio Grenouille'],
  [5, 'Journal de Toulon : les objets ont aussi leur bibliothèque', 'Toulon newspaper: objects have their own library too'],
  [6, 'Publication Reporterre sur la Lowbjethèque', 'Reporterre post about Lowbjethèque'],
  [8, 'Couverture INT Design, Grands Prix du Design', 'INT Design cover, Grands Prix du Design'],
  [10, 'Le Cuicui : conclusion du jury des Grands Prix du Design', 'Cuicui: the Grands Prix du Design jury’s conclusion'],
  [9, 'Terre locale : reportage photographique du Cuicui', 'Terre locale: Cuicui photographic feature'],
] as const;

export function VadrouillePage({content, locale, heroImage}: {
  content: EditorialPageContent;
  locale: StorefrontLocale;
  heroImage?: {url: string; altText?: string | null} | null;
}) {
  const fr = locale === 'fr';
  return <article className="vadrouille-page">
    <header className="vadrouille-hero">
      <img src={heroImage?.url || content.heroImage} alt={heroImage?.altText || (fr ? 'Le Cuicui présenté au journal de 13 heures de France Télévisions' : 'Cuicui featured on the France Télévisions lunchtime news')} fetchPriority="high" width="2200" height="1234" />
      <h1>{content.title}</h1>
    </header>
    <section className="vadrouille-outings" aria-label={fr ? 'Sorties et rencontres' : 'Outings and gatherings'}>

        <article>
          <h2>
            {fr
              ? 'Sorties Lowbjethèque, bibliothèque d’objets à emprunter à La Garde :'
              : 'Lowbjethèque outings, La Garde’s lending library of objects:'}
          </h2>
          <p>
            <span>{fr ? 'Écolieu du Plan du Pont, Hyères, avril 2025' : 'Écolieu du Plan du Pont, Hyères, April 2025'}</span>
            <span>{fr ? 'Restaurant Le Presage, Marseille, oct 2024' : 'Restaurant Le Presage, Marseille, Oct 2024'}</span>
            <span>{fr ? 'Rencontres de l’Éco-Habitat, Cannet-de-Maures, oct 2024' : 'Rencontres de l’Éco-Habitat, Cannet-de-Maures, Oct 2024'}</span>
            <span>{fr ? 'Fiesta des Associations, Toulon, sept 2024' : 'Fiesta des Associations, Toulon, Sept 2024'}</span>
            <span>{fr ? 'Forum des Associations, La Garde, sept 2024' : 'Forum des Associations, La Garde, Sept 2024'}</span>
            <span>{fr ? 'Maison Pépin boutique, rue Saint-Paul, Vieux Montréal, 2021' : 'Maison Pépin boutique, rue Saint-Paul, Old Montreal, 2021'}</span>
          </p>
        </article>

        <article>
          <h2>{fr ? 'Sorties TV avec Lowbjethèque' : 'Television appearances with Lowbjethèque'}</h2>
          <p>
            <span>{fr ? 'JT13h France Télévisions - Une idée pour la France - mai 2026' : 'JT13h France Télévisions - Une idée pour la France - May 2026'}</span>
            <span>{fr ? '19/20 France 3 Provence Alpes Côtes d’Azur - sept 2024' : '19/20 France 3 Provence Alpes Côte d’Azur - Sept 2024'}</span>
          </p>
        </article>

        <article>
          <h2>{fr ? 'Évènement Écotable Chaud Devant' : 'Écotable Chaud Devant event'}</h2>
          <p>
            <span>{fr ? 'Thématique La cuisine sous 50C - Marseille, 2025' : 'Theme: Cooking below 50C - Marseille, 2025'}</span>
            <span>{fr ? 'Tables rondes et démonstration du Cuicui' : 'Round tables and a Cuicui demonstration'}</span>
          </p>
        </article>

        <article>
          <h2>
            {fr
              ? 'Salon Biosphère avec Un Bocal à la Mer, épicerie vrac à Plérin'
              : 'Salon Biosphère with Un Bocal à la Mer, a zero-waste shop in Plérin'}
          </h2>
          <p><span>{fr ? 'Mur de Bretagne - été 2025' : 'Mur de Bretagne - Summer 2025'}</span></p>
        </article>

        <article>
          <h2>{fr ? 'Un Bocal à la Mer, épicerie vrac' : 'Un Bocal à la Mer, zero-waste shop'}</h2>
          <p><span>{fr ? 'Plérin - 2025' : 'Plérin - 2025'}</span></p>
        </article>

        <article>
          <h2>{fr ? '17e Grand Prix du Design' : '17th Grand Prix du Design'}</h2>
          <p><span>{fr ? 'Montréal automne 2024' : 'Montreal, Fall 2024'}</span></p>
        </article>

    </section>
    <section className="vadrouille-press" aria-labelledby="vadrouille-press-title">
      <div className="vadrouille-press__intro">
        <h2 id="vadrouille-press-title">{fr ? 'Le Cuicui vu dans la presse' : 'Cuicui in the press'}</h2>
        <ul>
          <li>{fr ? 'Magazine Reporterre, avril 2026' : 'Reporterre magazine, April 2026'}</li>
          <li>{fr ? 'Magazine Regain, n° 26, automne 2024' : 'Regain magazine, no. 26, Fall 2024'}</li>
          <li>{fr ? 'Magazine La Relève de La Peste, sept. 2024' : 'La Relève de La Peste magazine, Sept. 2024'}</li>
          <li>{fr ? 'Journal de Hyères, Le Lavandou, Toulon, août 2024' : 'Journal de Hyères, Le Lavandou, Toulon, Aug. 2024'}</li>
          <li>{fr ? 'INT Design, Grands Prix du Design, n° 92, automne 2024' : 'INT Design, Grands Prix du Design, no. 92, Fall 2024'}</li>
          <li>{fr ? 'Lowtech Journal, réseaux sociaux Instagram, mai 2024' : 'Lowtech Journal, Instagram, May 2024'}</li>
          <li>{fr ? 'La Maison du XXIe siècle, juillet 2024' : 'La Maison du XXIe siècle, July 2024'}</li>
        </ul>
      </div>
      <div className="vadrouille-press__gallery">
        {pressImages.map(([number, frenchAlt, englishAlt]) => <figure key={number} className={`vadrouille-press__image vadrouille-press__image--${number}`}>
          <img src={`/images/rudimenterre/vadrouille/press-${number}.webp`} alt={fr ? frenchAlt : englishAlt} loading="lazy" />
        </figure>)}
      </div>
    </section>
  </article>;
}
