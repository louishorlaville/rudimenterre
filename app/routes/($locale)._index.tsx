import {Link, redirect, useLoaderData} from 'react-router';
import {useEffect, useRef} from 'react';
import type {Route} from './+types/($locale)._index';
import {InteractiveTowel} from '~/components/InteractiveTowel';
import {pagePath} from '~/lib/editorial-content';
import {isStorefrontLocale} from '~/lib/i18n';

export const meta: Route.MetaFunction = ({data}) => {
  const fr = data?.locale !== 'en';
  return [
    {title: fr ? 'Le Cuicui — Rudimenterre' : 'Cuicui — Rudimenterre'},
    {name:'description',content:fr ? 'Le Cuicui, relais mobile de cuissons saines et durables.' : 'Cuicui, a mobile relay for healthy, sustainable cooking.'},
    {tagName:'link',rel:'canonical',href:fr ? '/fr' : '/en'},
    {tagName:'link',rel:'alternate',hrefLang:'fr-CA',href:'/fr'},
    {tagName:'link',rel:'alternate',hrefLang:'en-CA',href:'/en'},
  ];
};

export async function loader({params, context, request}: Route.LoaderArgs) {
  if (!params.locale) throw redirect(`/fr${new URL(request.url).search}`);
  const locale = params.locale.toLowerCase();
  if (!isStorefrontLocale(locale)) throw new Response(null,{status:404});
  const response = await context.storefront.query(HOME_PRODUCT_QUERY,{cache:context.storefront.CacheShort()}).catch(() => ({products:{nodes:[]}}));
  return {locale,product:response.products.nodes[0] ?? null};
}

export default function Homepage() {
  const {locale,product} = useLoaderData<typeof loader>();
  const fr = locale === 'fr';
  const productUrl = product ? `/${locale}/products/${product.handle}` : pagePath(locale,'adopt');
  const iconBenefits = [
    fr ? 'Max 95 °C, cuisson douce' : 'Max 95 °C, gentle cooking',
    fr ? 'Multi-cuissons modulables' : 'Modular multi-cooking',
    fr ? 'Cuisson indirecte, tous feux' : 'Indirect cooking, every hob',
    fr ? 'Avec ou sans eau potable' : 'With or without drinking water',
    fr ? '72 °C après 50 minutes' : '72 °C after 50 minutes',
    fr ? 'Inclusif, un seul feu' : 'Inclusive, one heat source',
  ];
  const foodGroups = [
    {title: fr?'Légumes':'Vegetables', detail: fr?'et fruits':'and fruit'},
    {title: fr?'Légumineuses':'Legumes', detail: fr?'lentilles, haricots\npois chiches':'lentils, beans\nand chickpeas'},
    {title: fr?'Céréales':'Grains', detail: fr?'riz, semoule\nmillet, quinoa…':'rice, semolina\nmillet, quinoa…'},
    {title: fr?'Protéines végétales':'Plant proteins', detail: fr?'texturées':'textured'},
    {title: fr?'Poissons':'Fish', detail: fr?'et crustacés':'and shellfish'},
    {title: fr?'Viandes':'Meat', detail: fr?'et volailles':'and poultry'},
  ];
  const openingRef = useRef<HTMLDivElement>(null);
  const heroTrackRef = useRef<HTMLDivElement>(null);
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const opening = openingRef.current;
    const track = heroTrackRef.current;
    const banner = bannerRef.current;
    if (!opening || !track || !banner) return;

    let frame = 0;
    const updateBanner = () => {
      const header = document.querySelector<HTMLElement>('.site-header');
      const hero = track.querySelector<HTMLElement>('.home-hero');
      const callToAction = track.querySelector<HTMLElement>('.home-hero__copy .button');
      const headerHeight = header?.getBoundingClientRect().height ?? 0;
      const viewportHeight = window.innerHeight;
      const heroHeight = Math.max(0, viewportHeight - headerHeight);
      const heroTop = hero?.getBoundingClientRect().top ?? headerHeight;
      const callToActionTop = callToAction?.getBoundingClientRect().top;
      const targetBannerHeight = callToActionTop == null
        ? viewportHeight * .48
        : callToActionTop - heroTop - 24;
      const bannerHeight = Math.min(
        heroHeight,
        Math.max(160, targetBannerHeight),
      );
      const dockedVisibleRatio = .6;
      const visibleBannerHeight = bannerHeight * dockedVisibleRatio;
      const travel = Math.max(0, heroHeight - visibleBannerHeight);
      const trackTop = track.getBoundingClientRect().top + window.scrollY;
      const scrollProgress = Math.min(
        travel,
        Math.max(0, window.scrollY - (trackTop - headerHeight)),
      );
      const dockedTop = headerHeight + scrollProgress;
      const releasedTop = opening.getBoundingClientRect().bottom - visibleBannerHeight;

      track.style.setProperty('--hero-height', `${heroHeight}px`);
      track.style.setProperty('--banner-travel', `${travel}px`);
      opening.style.setProperty('--banner-visible-height', `${visibleBannerHeight}px`);
      banner.style.setProperty('--banner-height', `${bannerHeight}px`);
      banner.style.setProperty(
        '--banner-top',
        `${Math.min(dockedTop, releasedTop)}px`,
      );
    };
    const scheduleBannerUpdate = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(updateBanner);
    };

    updateBanner();
    window.addEventListener('scroll', scheduleBannerUpdate, {passive: true});
    window.addEventListener('resize', scheduleBannerUpdate);
    const resizeObserver = new ResizeObserver(scheduleBannerUpdate);
    resizeObserver.observe(banner);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', scheduleBannerUpdate);
      window.removeEventListener('resize', scheduleBannerUpdate);
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    const markButtonInteracted = (event: Event) => {
      if (!(event.target instanceof Element)) return;
      event.target.closest<HTMLElement>('.button')?.classList.add('button--interacted');
    };

    document.addEventListener('pointerover', markButtonInteracted);
    document.addEventListener('focusin', markButtonInteracted);
    return () => {
      document.removeEventListener('pointerover', markButtonInteracted);
      document.removeEventListener('focusin', markButtonInteracted);
    };
  }, []);

  return <div className="home">
    <div className="home-opening" ref={openingRef}>
      <div className="home-hero-track" ref={heroTrackRef}>
        <section className="home-hero">
          <img src="/images/rudimenterre/home-hero.webp" alt="Le Cuicui Rudimenterre entouré de légumes" />
          <div className="home-hero__copy">
            <h1>{fr?'Le Cuicui':'Cuicui'}</h1>
            <p className="home-hero__lead">{fr?'Un relais mobile de cuissons saines et durables':'A mobile relay for healthy, sustainable cooking'}</p>
            <p className="home-hero__details">{fr?'Modulable, robuste, polyvalent, distingué, déconnecté, compatible tous feux. Plus qu’une cocotte, le Cuicui est un relais de cuissons durables et nomades.':'Modular, robust, versatile, distinctive, technology-free and compatible with every hob. More than a casserole, Cuicui is a mobile relay for sustainable cooking.'}</p>
            <Link className="button button--light" to={productUrl}>{fr?'J’adopte un Cuicui':'Adopt a Cuicui'}</Link>
          </div>
          <div className="home-banner" ref={bannerRef} aria-hidden="true">
            <img src="/images/rudimenterre/home-banner.jpg" alt="" />
          </div>
        </section>
      </div>

      <section className="home-intro">
        <img src="/images/rudimenterre/home-life.webp" alt="Le Cuicui utilisé dans une cuisine" loading="lazy" />
        <div className="home-intro__copy">
          <p className="script">{fr?'Bienvenue dans la cuisine du futur':'Welcome to the kitchen of the future'}</p>
          <h2>{fr?'Une autre approche de l’organisation des cuissons en cuisine':'Another approach to organising cooking in the kitchen'}</h2>
          {fr ? <p><strong>La cuisine du quotidien</strong> n’est pas une performance du dimanche : c’est <strong>s’organiser avec bon sens.</strong> C’est l’art de <strong>relier les repas entre eux</strong> plutôt que de les isoler, en apprenant <strong>une méthode</strong> et non des recettes.<br/><strong>On n’exécute pas, on réfléchit pour nous libérer</strong> des contraintes du quotidien qui nous rendent créatifs.</p>
            : <p><strong>Everyday cooking</strong> is not a Sunday performance: it means <strong>organising with common sense.</strong> It is the art of <strong>connecting meals to one another</strong> rather than isolating them, by learning <strong>a method</strong>, not recipes.<br/><strong>We do not simply execute; we think in order to free ourselves</strong> from everyday constraints that make us creative.</p>}
        </div>
      </section>

      <section className="home-banner-feature" aria-label={fr?'Atouts du Cuicui':'Cuicui benefits'}>
        <div className="home-icon-strip">
          {iconBenefits.map((benefit, index) => <article key={benefit}>
            <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
            <p>{benefit}</p>
          </article>)}
        </div>
      </section>
    </div>

    <div className="home-section-divider" aria-hidden="true">
      <span>{fr?'Si vous souhaitez':'If you wish'}</span>
      <i />
    </div>

    <section className="benefit-grid">
      <article className="benefit-panel benefit-panel--life">
        <span className="benefit-panel__number">01</span>
        <h2>{fr?'Un Cuicui pour la vie':'A Cuicui for life'}</h2>
        <p className="benefit-lead"><span aria-hidden="true">→</span>{fr?'Bifurquer, décider, vivre':'Change course, decide, live'}</p>
        <p>{fr
          ? 'Le Cuicui n’est pas une cocotte de plus que vous remplissez et refermez pour aller plus vite ou vous remplacer. Le Cuicui n’a pas de bouton, ne se branche pas : il switch les codes high-tech de l’industrie culinaire pour vous reconnecter à l’essentiel : le vivant.'
          : 'Cuicui is not one more pot to fill and close so you can go faster or be replaced. Cuicui has no button and does not plug in: it trades the high-tech codes of the food industry for a return to what matters—the living world.'}</p>
        <p className="benefit-script">{fr
          ? 'Par la réappropriation de techniques low-tech et un ingénieux design, le Cuicui redonne sens et goût à notre alimentation.'
          : 'Through reclaimed low-tech techniques and ingenious design, Cuicui brings meaning and flavour back to our food.'}</p>
      </article>

      <article className="benefit-media benefit-media--bifurcations">
        <img src="/images/rudimenterre/home-bifurcations.jpeg" alt={fr?'Légumes frais et bocaux sur une table en bois':'Fresh vegetables and jars on a wooden table'} loading="lazy" />
        <div className="bifurcation-card bifurcation-card--one">
          <span>{fr?'Bifurcation 1':'Turning point 1'}</span>
          <h3>{fr?'Je ravive le cœur endormi de la cuisine':'I rekindle the sleeping heart of the kitchen'}</h3>
          <p>{fr
            ? 'Le Cuicui vous repositionne au cœur de la cuisine pour retrouver un espace sain, solidaire et durable d’émotion et de partage.'
            : 'Cuicui puts you back at the heart of the kitchen, restoring a healthy, supportive and lasting space for emotion and sharing.'}</p>
        </div>
        <div className="bifurcation-card bifurcation-card--two">
          <span>{fr?'Bifurcation 2':'Turning point 2'}</span>
          <h3>{fr?'Je retrouve les gestes du bon sens oublié':'I rediscover the gestures of forgotten common sense'}</h3>
          <p>{fr
            ? 'Le Cuicui est un instrument de cuissons vivantes, conçu pour vous redonner les commandes. Vous choisissez, épluchez, coupez, sentez, observez, goûtez, comprenez et partagez.'
            : 'Cuicui is an instrument for living cooking, designed to put you back in control. You choose, peel, cut, smell, observe, taste, understand and share.'}</p>
        </div>
      </article>

      <article className="benefit-media benefit-media--tomorrow">
        <img src="/images/rudimenterre/home-tomorrow.webp" alt={fr?'Des Cuicui et des préparations sur une table':'Cuicui cookers and preparations on a table'} loading="lazy" />
      </article>

      <article className="benefit-panel benefit-panel--tomorrow">
        <span className="benefit-panel__number">02</span>
        <h2>{fr?'Un Cuicui pour demain':'A Cuicui for tomorrow'}</h2>
        <div className="benefit-statements">
          <p><span aria-hidden="true">→</span>{fr?'Hier avec bon sens, on cuisinait beaucoup avec presque rien.':'Yesterday, common sense let us cook a great deal with almost nothing.'}</p>
          <p><span aria-hidden="true">→</span>{fr?'Aujourd’hui avec énormément de matériel et d’ingrédients, on ne cuisine presque plus.':'Today, despite countless tools and ingredients, we barely cook at all.'}</p>
          <p className="benefit-statements__future"><span aria-hidden="true">→</span>{fr?'Demain avec moins, retrouvons le bon sens nécessaire pour cuisiner beaucoup comme hier sous contraintes.':'Tomorrow, with less, let us recover the common sense to cook abundantly within our constraints.'}</p>
        </div>
        <p>{fr
          ? 'Inspirons-nous du passé pour réapprendre à nous organiser pour cuisiner comme hier avec moins. Je vous emmène au cœur de la cuisine du futur, entre saveurs retrouvées, sobriété et créativité, découvrir le potager médiéval revisité…'
          : 'Let the past teach us how to organise and cook with less once again. Come into the kitchen of the future—where rediscovered flavours, restraint and creativity meet a reimagined medieval kitchen garden.'}</p>
        <Link className="button benefit-panel__cta" to={pagePath(locale,'project')}>{fr?'Visite guidée':'Guided tour'}</Link>
      </article>

      <article className="benefit-panel benefit-panel--freedom">
        <span className="benefit-panel__number">03</span>
        <h2>{fr?'Un Cuicui pour vous émanciper':'A Cuicui to set you free'}</h2>
        <p className="benefit-lead"><span aria-hidden="true">→</span>{fr?'Parce que cuisiner c’est décider, c’est résister, c’est vivre autonome':'Because cooking means deciding, resisting and living autonomously'}</p>
        <div className="sovereignty-list">
          <section>
            <button type="button" aria-describedby="sovereignty-food">{fr?'Souveraineté de l’assiette':'Food sovereignty'}</button>
            <p id="sovereignty-food"><strong>{fr?'Autonome face à l’industrie agroalimentaire.':'Independent from the food industry.'}</strong> {fr
              ? 'Refuser les produits ultra-transformés et les ingrédients subis. Retrouver la liberté de choisir, d’éplucher et de goûter la justesse des produits bruts.'
              : 'Reject ultra-processed products and imposed ingredients. Rediscover the freedom to choose, peel and taste honest, unprocessed foods.'}</p>
          </section>
          <section>
            <button type="button" aria-describedby="sovereignty-technology">{fr?'Souveraineté technologique':'Technological sovereignty'}</button>
            <p id="sovereignty-technology"><strong>{fr?'Autonome face à l’obsolescence.':'Independent from obsolescence.'}</strong> {fr
              ? 'Déconnecté, sans bouton ni branchement pour switcher les codes de l’industrie et revenir à l’essentiel : le vivant. Un instrument low-tech conçu pour durer plusieurs générations.'
              : 'Disconnected, without buttons or plugs, it moves beyond industrial conventions and returns to what matters: the living world. A low-tech instrument built to last for generations.'}</p>
          </section>
          <section>
            <button type="button" aria-describedby="sovereignty-resources">{fr?'Souveraineté de ressources':'Resource sovereignty'}</button>
            <p id="sovereignty-resources"><strong>{fr?'Émancipé des réseaux d’eau et d’énergie.':'Free from water and energy networks.'}</strong> {fr
              ? 'L’architecture du Cuicui mutualise la chaleur et distille l’eau. Une optimisation thermique maximale pour créer des bouillons purs et bienfaisants sans ajout d’eau potable, grâce au cycle naturel de l’eau. Chaque goutte d’eau est préservée.'
              : 'Cuicui shares heat between levels and distils water. Its thermal efficiency creates pure, nourishing broths without added drinking water, using the natural water cycle. Every drop is preserved.'}</p>
          </section>
        </div>
      </article>

      <article className="benefit-media benefit-media--freedom">
        <img src="/images/rudimenterre/home-emancipation.jpeg" alt={fr?'Cinq Cuicui annotés empilés':'Five labelled Cuicui cookers stacked together'} loading="lazy" />
      </article>
    </section>

    <section className="home-photo-banner">
      <div className="home-photo-banner__frame">
        <img src="/images/rudimenterre/home-soup-banner-wide.png" alt={fr?'Une préparation orangée cuisant dans le Cuicui':'An orange preparation cooking in the Cuicui'} loading="lazy" />
      </div>
    </section>

    <div className="home-section-divider home-section-divider--practice">
      <span>{fr?'En pratique vous aurez pour tous les aliments et régimes':'In practice, for every food and diet'}</span>
      <i aria-hidden="true" />
    </div>

    <section className="home-icon-strip home-icon-strip--food" aria-label={fr?'Aliments adaptés au Cuicui':'Foods suited to the Cuicui'}>
      {foodGroups.map((group, index) => <article key={group.title}>
        <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
        <div>
          <h3>{group.title}</h3>
          <p>{group.detail}</p>
        </div>
      </article>)}
    </section>

    <section className="practice-grid" aria-label={fr?'Le Cuicui en pratique':'Cuicui in practice'}>
      <article className="practice-panel">
        <span className="practice-panel__number">01</span>
        <h2>{fr?'Un Cuicui pour cuisiner plus avec moins':'A Cuicui to cook more with less'}</h2>
        <div className="practice-point">
          <span aria-hidden="true">→</span>
          <div>
            <h3>{fr?'En mode low-tech, sobre et solidaire.':'Low-tech, restrained and resourceful.'}</h3>
            <p>{fr
              ? 'Avec le Cuicui, la cuisson devient une nouvelle manière de penser, plus autonome, plus solidaire, plus créative.'
              : 'With Cuicui, cooking becomes a new way of thinking: more autonomous, resourceful and creative.'}</p>
          </div>
        </div>
        <p className="practice-script">{fr?'Plus de sens\nmoins de dépendances':'More meaning\nless dependence'}</p>
        <Link className="button practice-panel__cta" to={pagePath(locale,'project')}>{fr?'Comment ça marche ?':'How does it work?'}</Link>
      </article>
      <article className="practice-media practice-media--cook-less">
        <div className="practice-benefit-stack">
          <div className="practice-benefit-stack__energy"><span>{fr?'Moins d’énergie':'Less energy'}</span><strong>{fr?'Plus de chaleur':'More heat'}</strong></div>
          <div className="practice-benefit-stack__water"><span>{fr?'Moins d’eau potable':'Less drinking water'}</span><strong>{fr?'Plus d’autonomie':'More autonomy'}</strong></div>
          <div className="practice-benefit-stack__tech"><span>{fr?'Moins de techno':'Less technology'}</span><strong>{fr?'Plus de bon sens':'More common sense'}</strong></div>
          <div className="practice-benefit-stack__flavour"><span>{fr?'Moins d’ingrédients':'Fewer ingredients'}</span><strong>{fr?'Plus de saveurs':'More flavour'}</strong></div>
        </div>
        <img src="/images/rudimenterre/home-cook-less-photo.jpeg" alt={fr?'Légumes frais disposés sur une table en bois':'Fresh vegetables arranged on a wooden table'} loading="lazy" />
      </article>

      <article className="practice-media">
        <img src="/images/rudimenterre/home-taste-health.png" alt={fr?'Bouillon dans une cuillère en bois et cuisson douce':'Broth in a wooden spoon and gentle cooking'} loading="lazy" />
      </article>
      <article className="practice-panel practice-panel--dense">
        <span className="practice-panel__number">02</span>
        <h2>{fr?'Un Cuicui pour le goût et la santé':'A Cuicui for taste and health'}</h2>
        <div className="practice-point">
          <span aria-hidden="true">→</span>
          <div>
            <h3>{fr?'4 modes de cuissons douces et indirectes':'4 gentle, indirect cooking modes'}</h3>
            <ul>
              <li>{fr?'Vapeur-étuvée':'Steam-stewing'}</li>
              <li>{fr?'Bain-marie':'Bain-marie'}</li>
              <li>{fr?'Vapeur traditionnelle':'Traditional steaming'}</li>
              <li>{fr?'Four traditionnel':'Traditional oven'}</li>
            </ul>
          </div>
        </div>
        <Link className="button practice-panel__side-cta" to={pagePath(locale,'steam')}>{fr?'La vapeur-étuvée':'Steam-stewing'}</Link>
        <div className="practice-point">
          <span aria-hidden="true">→</span>
          <div>
            <h3>{fr?'Des saveurs originelles':'Original flavours'}</h3>
            <p>{fr
              ? 'Le Cuicui préserve de façon optimale les saveurs et bienfaits de chaque aliment sans les surchauffer, en équilibrant parfaitement la chaleur. Il génère des bouillons savoureux et bienfaisants : chaque goutte d’eau est récupérée.'
              : 'Cuicui preserves each food’s flavour and benefits without overheating it, balancing heat perfectly. It creates flavourful, nourishing broths and recovers every drop of water.'}</p>
          </div>
        </div>
        <div className="practice-point">
          <span aria-hidden="true">→</span>
          <div>
            <h3>{fr?'Inclusif, pour tous les régimes !':'Inclusive, for every diet!'}</h3>
            <p>{fr
              ? 'Son format modulable permet de s’adapter aux différents régimes alimentaires des convives et de cuire tout en même temps.'
              : 'Its modular format adapts to different diets around the table and cooks everything at the same time.'}</p>
          </div>
        </div>
      </article>

      <article className="practice-panel practice-panel--dense">
        <span className="practice-panel__number">03</span>
        <h2>{fr?'Un Cuicui pour tous les jours':'A Cuicui for every day'}</h2>
        <div className="practice-point">
          <span aria-hidden="true">→</span>
          <div>
            <h3>{fr?'Plusieurs fonctions au quotidien':'Many everyday functions'}</h3>
            <p>{fr
              ? 'Le Cuicui n’est pas un instrument occasionnel qu’on sort le dimanche pour faire beau. Il cuit ou réchauffe la cuisine traditionnelle du quotidien et n’a pas le temps de sécher ! En mode vapeur-étuvée il combine en semaine : du riz, un potage, une simple purée, un ragoût accommodé de restes ou le week-end un couscous, une blanquette… et en mode four il gratine ou fait lever un gâteau ou un pain. Le Cuicui mijote, réchauffe, étuve, poche, gratine et présente !'
              : 'Cuicui is not an occasional appliance brought out for show. It cooks or reheats everyday food: rice, soup, purée, stews, couscous and more. In oven mode it gratinates or bakes cakes and bread. Cuicui simmers, reheats, steams, poaches, gratinates and serves.'}</p>
          </div>
        </div>
        <div className="practice-point">
          <span aria-hidden="true">→</span>
          <div>
            <h3>{fr?'Un format ajustable':'An adjustable format'}</h3>
            <p>{fr?'Que vous soyez 2 ou 8 personnes, vous ajustez le nombre de récipients au nombre de convives.':'Whether there are 2 or 8 of you, adjust the number of vessels to the number of guests.'}</p>
          </div>
        </div>
      </article>
      <article className="practice-media">
        <img src="/images/rudimenterre/home-everyday-use.jpeg" alt={fr?'Deux récipients Cuicui préparés pour la cuisson':'Two Cuicui vessels prepared for cooking'} loading="lazy" />
      </article>

      <article className="practice-media">
        <img src="/images/rudimenterre/home-pretty-table.jpeg" alt={fr?'Cuicui garni de légumes sur une table':'Cuicui filled with vegetables on a table'} loading="lazy" />
      </article>
      <article className="practice-panel practice-panel--dense">
        <span className="practice-panel__number">04</span>
        <h2>{fr?'Un Cuicui pour une jolie table':'A Cuicui for a beautiful table'}</h2>
        <div className="practice-point">
          <span aria-hidden="true">→</span>
          <div>
            <h3>{fr?'Un Cuicui toujours beau !':'A Cuicui that always looks beautiful!'}</h3>
            <p>{fr?'Distingué et convivial pour mettre en appétit et rassembler. Parce que chaque petite attention compte, le Cuicui vous permet une présentation vivante et originale avec son couvercle à garnir et ses récipients à partager.':'Distinctive and convivial, it whets the appetite and brings people together. Its garnishable lid and shared vessels create a lively, original presentation.'}</p>
          </div>
        </div>
        <div className="practice-point">
          <span aria-hidden="true">→</span>
          <div>
            <h3>{fr?'Un Cuicui toujours chaud !':'A Cuicui that stays warm!'}</h3>
            <p>{fr?'Pour ne pas avoir à réchauffer. L’inertie thermique de la terre cuite maintient bien au chaud tous les récipients empilés apportés à table le temps que tout le monde arrive !':'No need to reheat. The thermal inertia of terracotta keeps every stacked vessel warm at the table until everyone arrives.'}</p>
          </div>
        </div>
      </article>
    </section>

    <section className="home-video-feature" aria-labelledby="home-video-title">
      <h2 className="sr-only" id="home-video-title">{fr?'Rudimenterre en cuisine':'Rudimenterre in the kitchen'}</h2>
      <div className="home-video-feature__frame">
        <img src="/images/rudimenterre/home-video-kitchen.jpeg" alt={fr?'Carottes posées sur une table de cuisine en bois':'Carrots laid on a wooden kitchen table'} loading="lazy" />
        <a
          className="button button--light home-video-feature__cta"
          href="https://www.youtube.com/watch?si=sXF2pn_40MSpdkS_&v=xsQz-xmP88Q&feature=youtu.be"
          target="_blank"
          rel="noreferrer"
          aria-label={fr?'Voir Rudimenterre en cuisine sur YouTube (nouvel onglet)':'Watch Rudimenterre in the kitchen on YouTube (new tab)'}
        >
          {fr?'En cuisine':'In the kitchen'}
        </a>
      </div>
    </section>

    <div className="home-section-divider home-section-divider--video">
      <span>{fr?'Alors si vous souhaitez bifurquer':'If you would like to change course'}</span>
      <i aria-hidden="true" />
    </div>

    <section className="home-kitchen-follow" aria-labelledby="home-kitchen-follow-title">
      <h2 id="home-kitchen-follow-title">{fr?'Suivez-nous en cuisine !':'Follow us into the kitchen!'}</h2>
      <div className="home-kitchen-follow__gallery">
        <figure className="home-kitchen-follow__image home-kitchen-follow__image--left">
          <img src="/images/rudimenterre/home-follow-kitchen-left.jpg" alt={fr?'Artichauts et paniers dans la cuisine Rudimenterre':'Artichokes and baskets in the Rudimenterre kitchen'} loading="lazy" />
        </figure>
        <figure className="home-kitchen-follow__image home-kitchen-follow__image--center">
          <img src="/images/rudimenterre/home-follow-kitchen-center.jpg" alt={fr?'Gâteau aux pommes préparé dans le Cuicui':'Apple cake prepared in the Cuicui'} loading="lazy" />
        </figure>
        <figure className="home-kitchen-follow__image home-kitchen-follow__image--right">
          <img src="/images/rudimenterre/home-follow-kitchen-right.jpg" alt={fr?'Préparations disposées dans plusieurs récipients Cuicui':'Food arranged in several Cuicui vessels'} loading="lazy" />
        </figure>
      </div>
      <a
        className="button button--light home-kitchen-follow__cta"
        href="https://www.instagram.com/rudimenterre/reels/"
        target="_blank"
        rel="noreferrer"
        aria-label={fr?'Voir les Reels de Rudimenterre sur Instagram (nouvel onglet)':'View Rudimenterre Reels on Instagram (new tab)'}
      >
        {fr?'Regardez':'Take a look'}
      </a>
    </section>

    <section className="home-library" aria-labelledby="home-library-title">
      <header className="home-library__header">
        <h2 id="home-library-title">{fr?'Découvrez l’intelligence des flux !':'Discover the intelligence of flows!'}</h2>
      </header>
      <div className="home-library__scene">
        <div className="home-library__canvas">
          <img className="home-library__layer" src="/images/rudimenterre/home-library-left.png" alt="" loading="lazy" />
          <img className="home-library__layer" src="/images/rudimenterre/home-library-right.png" alt="" loading="lazy" />

          <Link
            className="home-library__book home-library__book--recipes"
            to={pagePath(locale,'creator')}
            aria-label={fr?'Découvrir les recettes Rudimenterre':'Discover Rudimenterre recipes'}
          >
            <img src="/images/rudimenterre/home-library-book-recipes.png" alt="" />
          </Link>
          <Link
            className="home-library__book home-library__book--distillation"
            to={pagePath(locale,'distillation')}
            aria-label={fr?'Découvrir les expériences de distillation':'Discover the distillation experiments'}
          >
            <img src="/images/rudimenterre/home-library-book-distillation.png" alt="" />
          </Link>
          <Link
            className="home-library__book home-library__book--thermal"
            to={pagePath(locale,'thermal')}
            aria-label={fr?'Découvrir les expériences thermiques':'Discover the thermal experiments'}
          >
            <img src="/images/rudimenterre/home-library-book-thermal.png" alt="" />
          </Link>

          <img className="home-library__layer home-library__stool" src="/images/rudimenterre/home-library-stool.png" alt="" loading="lazy" />
        </div>
      </div>
    </section>

    <section className="home-adopt-gallery" aria-labelledby="home-adopt-gallery-title">
      <header className="home-adopt-gallery__intro">
        <h2 id="home-adopt-gallery-title">
          {fr?'Empilez - Distillez - Savourez !':'Stack - Distill - Savour!'}
        </h2>
        <Link className="button button--orange" to={productUrl}>
          {fr?'Adoptez':'Adopt'}
        </Link>
      </header>
      <div className="home-adopt-gallery__images">
        <figure>
          <img
            src="/images/rudimenterre/home-adopt-stack.jpeg"
            alt={fr?'Cinq récipients Cuicui empilés et annotés':'Five stacked and labelled Cuicui vessels'}
            loading="lazy"
          />
        </figure>
        <figure>
          <img
            src="/images/rudimenterre/home-adopt-overhead.jpeg"
            alt={fr?'Riz, légumes et pommes de terre cuisinés dans le Cuicui':'Rice, vegetables and potatoes cooked in the Cuicui'}
            loading="lazy"
          />
        </figure>
        <figure>
          <img
            src="/images/rudimenterre/home-adopt-still-life.jpeg"
            alt={fr?'Cuicui entouré de légumes frais':'Cuicui surrounded by fresh vegetables'}
            loading="lazy"
          />
        </figure>
      </div>
    </section>

    <section className="home-kitchen-compare" aria-labelledby="home-kitchen-compare-title">
      <header className="home-kitchen-compare__divider">
        <h2 id="home-kitchen-compare-title">
          {fr?'Et libérez votre cuisine !':'And free your kitchen!'}
        </h2>
      </header>
      <div className="home-kitchen-compare__scene">
        <div className="home-kitchen-compare__heading home-kitchen-compare__heading--with">
          <h3>{fr?'Une cuisine avec un Cuicui':'A kitchen with a Cuicui'}</h3>
        </div>
        <div className="home-kitchen-compare__heading home-kitchen-compare__heading--without">
          <h3>{fr?'Une cuisine sans Cuicui':'A kitchen without a Cuicui'}</h3>
        </div>

        <div className="home-kitchen-compare__art" aria-hidden="true">
          <div className="home-kitchen-compare__art-side home-kitchen-compare__art-side--with">
            <img className="home-kitchen-compare__shelf" src="/images/rudimenterre/home-kitchen-compare-shelf.png" alt="" loading="lazy" />
            <div className="home-kitchen-compare__left-plate-row">
              <img className="home-kitchen-compare__plate home-kitchen-compare__plate--casserole" src="/images/rudimenterre/home-kitchen-plate-casserole.png" alt="" loading="lazy" />
              <img className="home-kitchen-compare__plate home-kitchen-compare__plate--cuicui" src="/images/rudimenterre/home-kitchen-plate-cuicui.png" alt="" loading="lazy" />
              <span className="home-kitchen-compare__plant-pot">
                <img className="home-kitchen-compare__plant-pot-image" src="/images/rudimenterre/home-kitchen-compare-vase.png" alt="" loading="lazy" />
              </span>
            </div>
            <InteractiveTowel />
          </div>
          <div className="home-kitchen-compare__art-side home-kitchen-compare__art-side--without">
            <img className="home-kitchen-compare__cabinet" src="/images/rudimenterre/home-kitchen-compare-cabinet.png" alt="" loading="lazy" />
            <div className="home-kitchen-compare__plate-row home-kitchen-compare__plate-row--one">
              <img className="home-kitchen-compare__plate home-kitchen-compare__plate--cocotte-top" src="/images/rudimenterre/home-kitchen-plate-cocotte.png" alt="" loading="lazy" />
              <img className="home-kitchen-compare__plate home-kitchen-compare__plate--steamer" src="/images/rudimenterre/home-kitchen-plate-cocotte.png" alt="" loading="lazy" />
              <img className="home-kitchen-compare__plate home-kitchen-compare__plate--tajine" src="/images/rudimenterre/home-kitchen-plate-tajine.png" alt="" loading="lazy" />
            </div>
            <div className="home-kitchen-compare__plate-row home-kitchen-compare__plate-row--two">
              <img className="home-kitchen-compare__plate home-kitchen-compare__plate--presentation" src="/images/rudimenterre/home-kitchen-plate-presentation.png" alt="" loading="lazy" />
              <img className="home-kitchen-compare__plate home-kitchen-compare__plate--pressure" src="/images/rudimenterre/home-kitchen-plate-pressure-cooker.png" alt="" loading="lazy" />
            </div>
            <div className="home-kitchen-compare__plate-row home-kitchen-compare__plate-row--three">
              <img className="home-kitchen-compare__plate home-kitchen-compare__plate--bain-marie" src="/images/rudimenterre/home-kitchen-plate-bain-marie.png" alt="" loading="lazy" />
              <img className="home-kitchen-compare__plate home-kitchen-compare__plate--rice-cooker" src="/images/rudimenterre/home-kitchen-plate-rice-cooker.png" alt="" loading="lazy" />
              <img className="home-kitchen-compare__plate home-kitchen-compare__plate--cocotte-low" src="/images/rudimenterre/home-kitchen-plate-steamer.png" alt="" loading="lazy" />
            </div>
            <div className="home-kitchen-compare__plate-row home-kitchen-compare__plate-row--four">
              <img className="home-kitchen-compare__plate home-kitchen-compare__plate--romertopf" src="/images/rudimenterre/home-kitchen-plate-romertopf.png" alt="" loading="lazy" />
              <img className="home-kitchen-compare__plate home-kitchen-compare__plate--kouglof" src="/images/rudimenterre/home-kitchen-plate-kouglof.png" alt="" loading="lazy" />
              <img className="home-kitchen-compare__plate home-kitchen-compare__plate--gratin" src="/images/rudimenterre/home-kitchen-plate-gratin.png" alt="" loading="lazy" />
            </div>
          </div>
        </div>

        <ul className="home-kitchen-compare__uses home-kitchen-compare__uses--with">
          <li>{fr?'Mijoter efficacement':'Simmer efficiently'}</li>
          <li>{fr?'Cuire ou réchauffer à la vapeur étuvée':'Steam-stew or reheat'}</li>
          <li>{fr?'Cuire à la vapeur douce':'Gently steam'}</li>
          <li>{fr?'Cuire ou réchauffer au bain-marie':'Cook or reheat in a bain-marie'}</li>
          <li>{fr?'Cuire et réchauffer le riz, les céréales et légumineuses':'Cook and reheat rice, grains and pulses'}</li>
          <li>{fr?'Pocher':'Poach'}</li>
          <li>{fr?'Gratiner':'Gratinate'}</li>
          <li>{fr?'Moules à pain et gâteaux':'Bake bread and cakes'}</li>
          <li>{fr?'Présenter, servir et mettre en appétit':'Present, serve and whet the appetite'}</li>
        </ul>
        <ul className="home-kitchen-compare__uses home-kitchen-compare__uses--without">
          <li>{fr?'Mijoter lentement':'Simmer slowly'}</li>
          <li>{fr?'Présenter et servir':'Present and serve'}</li>
          <li>{fr?'Cuire à la vapeur étuvée sous pression':'Pressure steam-stew'}</li>
          <li>{fr?'Cuire au bain-marie':'Cook in a bain-marie'}</li>
          <li>{fr?'Cuire le riz':'Cook rice'}</li>
          <li>{fr?'Cuire à la vapeur douce':'Gently steam'}</li>
          <li>{fr?'Cuire à l’étouffée':'Braise'}</li>
          <li>{fr?'Moule à gâteaux':'Bake cakes'}</li>
          <li>{fr?'Gratiner':'Gratinate'}</li>
        </ul>
        <p className="sr-only">
          {fr
            ? 'Comparaison illustrée entre une cuisine organisée autour du Cuicui et une cuisine nécessitant de nombreux récipients spécialisés.'
            : 'An illustrated comparison between a kitchen organized around the Cuicui and one requiring many specialized vessels.'}
        </p>
      </div>
    </section>

    <section className="home-final"><img src="/images/rudimenterre/home-table.webp" alt="Table dressée avec le Cuicui" loading="lazy"/><div><h2>{fr?'Un Cuicui pour demain':'A Cuicui for tomorrow'}</h2><Link className="button button--orange" to={pagePath(locale,'adopt')}>{fr?'Adoptez':'Adopt'}</Link></div></section>
  </div>;
}

const HOME_PRODUCT_QUERY = `#graphql
 query HomeProduct($country: CountryCode, $language: LanguageCode) @inContext(country:$country,language:$language) {
  products(first:1,sortKey:UPDATED_AT,reverse:true) { nodes { id title handle } }
 }
` as const;
