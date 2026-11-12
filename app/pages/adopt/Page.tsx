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
    upcoming: 'Futur Cuicui fabriqué en Europe. Sortie prévue courant 2027',
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
      {title: '1 kit unique', emphasis: ['4 éléments indispensables'], details: ['2 récipients, 2 couvercles,', '2 bouchons']},
      {title: 'Des modules complémentaires', emphasis: ['au détail'], details: ['plus évolutif']},
      {title: 'Le format', emphasis: ['compatibilité universelle', 'casserole 20 cm'], details: ['plus commune']},
      {title: 'La matière', emphasis: ['plus robuste'], details: ['pour usage intensif', 'chefs, restauration']},
    ],
    modules: 'Des modules complémentaires au détail',
    vessel: 'Récipient à l’unité',
    vesselAlt: 'Dessin de récipients Cuicui empilés',
    vesselPrice: '150 à 180 €',
    lid: 'Couvercle - assiette',
    lidAlt: 'Dessin de couvercles-assiettes en ardoise',
    lidDescription: ['Couvercle-ardoise de conservation', 'ou assiette de présentation'],
    lidEstimated: 'prix public estimé :',
    lidPrice: 'entre 40 et 50 €',
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
    upcoming: 'The next Cuicui will be made in Europe. Expected release in 2027',
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
      {title: '1 standard kit', emphasis: ['4 essential pieces'], details: ['2 vessels, 2 lids,', '2 stoppers']},
      {title: 'Add-on modules', emphasis: ['sold separately'], details: ['more room to expand']},
      {title: 'Size', emphasis: ['universal compatibility', '20 cm saucepan'], details: ['a more common size']},
      {title: 'Material', emphasis: ['sturdier'], details: ['for heavy use', 'chefs, food service']},
    ],
    modules: 'Add-on modules sold separately',
    vessel: 'Individual vessel',
    vesselAlt: 'Drawing of stacked Cuicui vessels',
    vesselPrice: '€150 to €180',
    lid: 'Lid - serving plate',
    lidAlt: 'Drawing of slate lids and serving plates',
    lidDescription: ['Slate lid for food storage', 'or serving plate'],
    lidEstimated: 'estimated retail price:',
    lidPrice: 'between €40 and €50',
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
            {labels.comparison.map(({title, emphasis, details}) => (
              <div key={title}>
                <dt>{title}</dt>
                <dd>
                  {emphasis.map((line) => <strong key={line}>{line}</strong>)}
                  {details.map((line) => <span key={line}>{line}</span>)}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="adopt-modules" aria-labelledby="adopt-modules-title">
          <h3 className="adopt-rule" id="adopt-modules-title">{labels.modules}</h3>
          <div className="adopt-detail adopt-detail--vessel">
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
              <p><em>{labels.lidDescription[0]}<br />{labels.lidDescription[1]}</em></p>
              <p className="adopt-price"><strong>{labels.lidEstimated}<br />{labels.lidPrice}</strong></p>
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
