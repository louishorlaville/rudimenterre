import type {EditorialPageContent} from '~/lib/editorial-content';
import type {StorefrontLocale} from '~/lib/i18n';
import makingStyles from './Page.css?url';

export {makingStyles};

export function MakingPage({locale, heroImage}: {
  content: EditorialPageContent;
  locale: StorefrontLocale;
  heroImage?: {url: string; altText?: string | null} | null;
}) {
  const fr = locale === 'fr';

  return <article className="making-page">
    <header className="making-hero">
      <img src={heroImage?.url || '/images/rudimenterre/making.webp'} alt={heroImage?.altText || ''} />
      <div className="making-hero__shade" />
      <h1>{fr ? 'Fabrication et entretien' : 'Making and care'}</h1>
    </header>

    <section className="making-band making-band--material" aria-labelledby="making-material-title">
      <h2 id="making-material-title">{fr ? 'Matière' : 'Material'}</h2>
      {fr ? <p><em>Argile naturelle - Extérieur grès brut - Intérieur émaillé garantissant une étanchéité totale de toutes les surfaces en contact alimentaire<br />Émail de qualité alimentaire, garanti sans métaux lourds</em></p> : <p><em>Natural clay - unglazed stoneware exterior - glazed interior ensuring every food-contact surface is fully watertight<br />Food-safe glaze, guaranteed free of heavy metals</em></p>}
    </section>

    <section className="making-band making-band--manufacturing" aria-labelledby="making-manufacturing-title">
      <h2 id="making-manufacturing-title">{fr ? 'Fabrication' : 'Making'}</h2>
      {fr ? <p><em>Les premiers Cuicuis canadiens ont été fabriqués artisanalement en faïence par Carole Briet, la créatrice, dans son atelier Rudimenterre à Montréal. La production de Cuicuis français se fera à la main dans les ateliers d’une manufacture française au savoir-faire historique, pour satisfaire l’exigence qualitative du Cuicui.</em></p> : <p><em>The first Canadian Cuicuis were handmade in earthenware by creator Carole Briet in her Rudimenterre studio in Montréal. French Cuicuis will be made by hand in the workshops of a French manufacturer with a long-standing craft tradition, to meet Cuicui’s quality standards.</em></p>}
    </section>

    <section className="making-band making-band--warranty" aria-labelledby="making-warranty-title">
      <h2 id="making-warranty-title">{fr ? 'Garanties' : 'Warranty'}</h2>
      <p><em>{fr ? 'Dans le respect des consignes d’utilisation et d’entretien mentionnées ci-dessous, les Cuicuis Rudimenterre bénéficient des garanties du fabricant manufacturier.' : 'When the use and care instructions below are followed, Rudimenterre Cuicuis are covered by the manufacturer’s warranties.'}</em></p>
    </section>

    <section className="making-care" aria-labelledby="making-care-title">
      <h2 id="making-care-title">{fr ? 'Utilisation et entretien' : 'Use and care'}</h2>
      <p className="making-care__summary">{fr ? 'Lave-vaisselle · four traditionnel · cuisson indirecte sur casserole d’eau · réfrigérateur' : 'Dishwasher · conventional oven · indirect cooking over a pot of water · refrigerator'}</p>
      <div className="making-care__columns">
        <section aria-labelledby="making-use-title">
          <h3 id="making-use-title">{fr ? 'Utilisations possibles en respectant ses principes' : 'Use while following these principles'}</h3>
          <h4>{fr ? 'Pas de choc thermique' : 'Avoid thermal shock'}</h4>
          {fr ? <p>La terre cuite est sensible aux amplitudes thermiques brutales.<br />Au four traditionnel, ne préchauffez jamais votre four. Ne déposez pas votre récipient sur une casserole d’eau déjà en ébullition. Attendez que les récipients soient à température ambiante pour les mettre au froid ou les remettre à cuire. Ne mettez pas les récipients chauds sous l’eau froide et inversement.</p> : <p>Earthenware is sensitive to sudden temperature changes.<br />In a conventional oven, never preheat the oven. Do not place your vessel over a pot of water that is already boiling. Let vessels return to room temperature before chilling or cooking again. Do not put hot vessels under cold water, or the reverse.</p>}
          <h4>{fr ? 'Pas de choc mécanique' : 'Avoid mechanical impact'}</h4>
          <p>{fr ? 'Favorisez les ustensiles en bois et évitez les chocs brutaux. Les ustensiles métalliques peuvent par ailleurs laisser des traces grises, ce ne sont pas des rayures.' : 'Choose wooden utensils and avoid hard knocks. Metal utensils may leave grey marks; these are not scratches.'}</p>
        </section>
        <section aria-labelledby="making-clean-title">
          <h3 id="making-clean-title">{fr ? 'Entretien facile' : 'Easy care'}</h3>
          <h4>{fr ? 'Intérieur' : 'Interior'}</h4>
          <p>{fr ? 'Eau - savon - gratouillette sans risque de rayer. Trempage dans l’eau une nuit en cas d’accrochage extrême. Si vous avez des traces grises d’ustensiles métalliques, vous pouvez les retirer avec du vinaigre en frottant fort.' : 'Water, soap and a non-scratch scrubber. For stubborn stuck-on food, soak overnight. Grey marks left by metal utensils can be removed by scrubbing firmly with vinegar.'}</p>
          <h4>{fr ? 'Extérieur' : 'Exterior'}</h4>
          <p>{fr ? 'Brosse, eau pure - savon de Marseille pour les traces rebelles. Servez-vous des parois extérieures comme d’une ardoise : vous pouvez écrire dessus à la craie standard.' : 'Brush and clean water; use Marseille soap for stubborn marks. Treat the outside like a chalkboard: you can write on it with regular chalk.'}</p>
        </section>
      </div>
    </section>
  </article>;
}
