import type {EditorialPageContent} from '~/lib/editorial-content';
import type {SyntheticEvent} from 'react';
import {Link} from 'react-router';
import type {StorefrontLocale} from '~/lib/i18n';

const images = '/images/rudimenterre';

const copy = {
  fr: {
    title: 'Pour adopter un Cuicui',
    intro: 'Un nouveau mode de cuisiner',
    tagline: 'Durable et bienfaisant',
    choices: '2 options',
    buy: 'J’achète une édition limitée',
    limitedDescription: 'Derniers exemplaires des premiers Cuicuis fabriqués artisanalement au Canada en attendant une production manufacturière européenne. Kit compatible avec une casserole de 18cm. Encore quelques kits disponibles',
    cuicuiAlt: 'Cuicui en terre cuite avec ses deux récipients superposés',
    wait: 'J’attends le prochain Kit Vital',
    upcoming: 'Futur Cuicui fabriqué en Europe. Sortie prévue courant 2027.',
    vital: 'Le Kit Vital',
    vitalTagline: 'Plus pratique, plus robuste, plus évolutif',
    vitalIntro: 'En cours de développement avec nos futurs partenaires manufacturiers européens. Pour notre prochaine production, nous simplifions l’expérience.',
    vitalAlt: 'Dessin éclaté du Kit Vital',
    composition: 'Les quatre éléments en céramique',
    pieces: 'Deux récipients, un couvercle à cheminée et un bouchon carotte. Le kit comprend aussi un bouchon de liège.',
    estimated: 'Prix public estimé',
    kitPrice: '450 à 550 €',
    differences: 'Les différences avec le kit actuel',
    comparison: [
      ['Un kit unique', 'Quatre éléments indispensables'],
      ['Des modules complémentaires', 'Disponibles séparément pour faire évoluer le kit'],
      ['Le format', 'Compatible avec les casseroles de 20 cm, un format plus courant'],
      ['La matière', 'Plus robuste pour un usage intensif, notamment en restauration'],
    ],
    modules: 'Des modules complémentaires au détail',
    vessel: 'Récipient à l’unité',
    vesselAlt: 'Dessin de récipients Cuicui empilés',
    vesselPrice: '150 à 180 €',
    lid: 'Couvercle-assiette',
    lidAlt: 'Dessin de couvercles-assiettes en ardoise',
    lidDescription: 'Couvercle en ardoise pour la conservation ou assiette de présentation.',
    lidPrice: '40 à 50 €',
    signup: 'Je m’inscris sur la liste d’adoption',
    signupStatus: 'Les inscriptions ouvriront prochainement.',
    signupDescription: 'L’inscription est sans engagement et permet d’être informé en priorité de l’évolution du projet et du calendrier des premières précommandes.',
  },
  en: {
    title: 'Adopt a Cuicui',
    intro: 'A new way to cook',
    tagline: 'Sustainable and nourishing',
    choices: '2 options',
    buy: 'Buy a limited edition',
    limitedDescription: 'The last of the original Cuicuis, handcrafted in Canada while we prepare for European production. The kit fits an 18 cm saucepan.',
    cuicuiAlt: 'Terracotta Cuicui with two stacked vessels',
    wait: 'Wait for the next Essential Kit',
    upcoming: 'The next Cuicui will be made in Europe. Expected release in 2027.',
    vital: 'The Essential Kit',
    vitalTagline: 'Easier to use, sturdier and more versatile',
    vitalIntro: 'We’re developing the next Cuicui with our future European manufacturing partners. For the next production run, we’re making it simpler to use.',
    vitalAlt: 'Exploded drawing of the Essential Kit',
    composition: 'The four ceramic pieces',
    pieces: 'Two vessels, one chimney lid and one carrot-shaped stopper. The kit also includes a cork stopper.',
    estimated: 'Estimated retail price',
    kitPrice: '€450 to €550',
    differences: 'How it compares with the current kit',
    comparison: [
      ['One standard kit', 'Four essential pieces'],
      ['Add-on modules', 'Available separately so you can expand your kit'],
      ['Size', 'Fits 20 cm saucepans, a more common size'],
      ['Material', 'Sturdier for heavy use, including in professional kitchens'],
    ],
    modules: 'Add-on modules sold separately',
    vessel: 'Individual vessel',
    vesselAlt: 'Drawing of stacked Cuicui vessels',
    vesselPrice: '€150 to €180',
    lid: 'Lid and serving plate',
    lidAlt: 'Drawing of slate lids and serving plates',
    lidDescription: 'Use the slate lid to cover food for storage or as a serving plate.',
    lidPrice: '€40 to €50',
    signup: 'Join the adoption list',
    signupStatus: 'Registration will open soon.',
    signupDescription: 'Sign up with no commitment to be among the first to hear about project updates and when pre-orders will open.',
  },
};

function markButtonInteracted(event: SyntheticEvent<HTMLAnchorElement>) {
  event.currentTarget.classList.add('button--interacted');
}

export function AdoptPage({
  content,
  locale,
  heroImage,
}: {
  content: EditorialPageContent;
  locale: StorefrontLocale;
  heroImage?: {url: string; altText?: string | null} | null;
}) {
  const labels = copy[locale];
  const hero = content.heroOverrides;

  return (
    <article className="adopt-page">
      <header className="adopt-hero">
        <img src={heroImage?.url || images + '/adopt-banner-v4.webp'} alt={heroImage?.altText || ''} fetchPriority="high" />
        <div className="adopt-hero__copy">
          <h1>{hero?.title || labels.title}</h1>
          <p>{hero?.intro || labels.intro}</p>
          <p className="adopt-hero__tagline">{labels.tagline}</p>
          <p className="adopt-hero__choice">{hero?.eyebrow || labels.choices}</p>
        </div>
      </header>

      <div className="adopt-choices">
        <div className="adopt-option adopt-option--limited">
          <span className="adopt-option__number" aria-hidden="true">1</span>
          <Link
            className="button adopt-button"
            to={`/${locale}/products/cuicui-pragmatique`}
            onPointerEnter={markButtonInteracted}
            onFocus={markButtonInteracted}
          >
            {labels.buy}
          </Link>
          <p>{labels.limitedDescription}</p>
        </div>
        <img className="adopt-choices__image" src={images + '/adopt-cuicui.webp'} alt={labels.cuicuiAlt} width={1000} height={787} />
        <div className="adopt-option adopt-option--vital">
          <span className="adopt-option__number" aria-hidden="true">2</span>
          <a
            className="button adopt-button adopt-button--orange"
            href="#adopt-vital"
            onPointerEnter={markButtonInteracted}
            onFocus={markButtonInteracted}
          >
            {labels.wait}
          </a>
          <p>{labels.upcoming}</p>
        </div>
      </div>

      <section className="adopt-vital" id="adopt-vital" tabIndex={-1} aria-labelledby="adopt-vital-title">
        <header className="adopt-vital__intro">
          <h2 id="adopt-vital-title">{labels.vital}</h2>
          <p className="adopt-vital__tagline">{labels.vitalTagline}</p>
          <p>{labels.vitalIntro}</p>
        </header>
        <div className="adopt-detail adopt-detail--kit">
          <img src={images + '/adopt-vital.webp'} alt={labels.vitalAlt} width={433} height={780} loading="lazy" />
          <div>
            <h3>{labels.composition}</h3>
            <p>{labels.pieces}</p>
            <p className="adopt-price">{labels.estimated} <strong>{labels.kitPrice}</strong></p>
          </div>
        </div>

        <section aria-labelledby="adopt-comparison-title">
          <h3 className="adopt-rule adopt-rule--accent" id="adopt-comparison-title">{labels.differences}</h3>
          <dl className="adopt-comparison">
            {labels.comparison.map(([title, description]) => (
              <div key={title}>
                <dt>{title}</dt>
                <dd>{description}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="adopt-modules" aria-labelledby="adopt-modules-title">
          <h3 className="adopt-rule" id="adopt-modules-title">{labels.modules}</h3>
          <div className="adopt-detail">
            <img src={images + '/adopt-vessel.webp'} alt={labels.vesselAlt} width={800} height={757} loading="lazy" />
            <div>
              <h4>{labels.vessel}</h4>
              <p className="adopt-price">{labels.estimated} <strong>{labels.vesselPrice}</strong></p>
            </div>
          </div>
          <div className="adopt-detail">
            <img src={images + '/adopt-lid-plate.webp'} alt={labels.lidAlt} width={700} height={366} loading="lazy" />
            <div>
              <h4>{labels.lid}</h4>
              <p>{labels.lidDescription}</p>
              <p className="adopt-price">{labels.estimated} <strong>{labels.lidPrice}</strong></p>
            </div>
          </div>
        </section>

        <div className="adopt-registration">
          <button className="adopt-button adopt-button--orange" type="button" disabled aria-describedby="adopt-registration-status">
            {labels.signup}
          </button>
          <p id="adopt-registration-status">{labels.signupStatus}</p>
          <p>{labels.signupDescription}</p>
        </div>
      </section>
    </article>
  );
}
