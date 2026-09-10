import {Link, redirect, useLoaderData} from 'react-router';
import {useEffect, useRef} from 'react';
import type {Route} from './+types/($locale)._index';
import {InteractiveTowel} from '~/components/InteractiveTowel';
import {HomeReviews} from '~/components/HomeReviews';
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
    {icon: '/images/rudimenterre/home-benefit-icon-1.png', title: fr ? 'max 95C doux' : 'max 95C gentle', detail: fr ? 'équilibré' : 'balanced'},
    {icon: '/images/rudimenterre/home-benefit-icon-2.png', title: fr ? 'multi cuisson modulables' : 'modular multi-cooking', detail: fr ? 'vapeur-étuvée\nbain-marie - four' : 'steam-stewing\nbain-marie - oven'},
    {icon: '/images/rudimenterre/home-benefit-icon-3.png', title: fr ? 'cuisson indirecte :\ntous feux' : 'indirect cooking:\nevery hob', detail: fr ? 'Gaz - Bois - Vitro -\nInduction' : 'Gas - Wood - Ceramic -\nInduction'},
    {icon: '/images/rudimenterre/home-benefit-icon-4.png', title: fr ? 'avec ou sans\neau potable' : 'with or without\ndrinking water', detail: fr ? 'distille l’eau non potable' : 'distils non-drinking water'},
    {icon: '/images/rudimenterre/home-benefit-icon-5.png', title: fr ? '72C\naprès 50min' : '72C\nafter 50min', detail: fr ? 'feu éteint\nfin de cuisson passive' : 'heat off\npassive cooking finish'},
    {icon: '/images/rudimenterre/home-benefit-icon-6.png', title: fr ? 'inclusif\n1 seul feu' : 'inclusive\n1 heat source', detail: fr ? 'plusieurs régimes' : 'multiple diets'},
  ];
  const foodGroups = [
    {icon: '/images/rudimenterre/home-food-icon-1.png', title: fr?'légumes':'Vegetables', detail: fr?'et fruits':'and fruit'},
    {icon: '/images/rudimenterre/home-food-icon-2.png', title: fr?'légumineuses':'Legumes', detail: fr?'lentilles, haricots\npois chiches':'lentils, beans\nand chickpeas'},
    {icon: '/images/rudimenterre/home-food-icon-3.png', title: fr?'céréales':'Grains', detail: fr?'riz, semoule\nmillet, quinoa…':'rice, semolina\nmillet, quinoa…'},
    {icon: '/images/rudimenterre/home-food-icon-4.png', title: fr?'protéines végétales':'Plant proteins', detail: fr?'texturées':'textured'},
    {icon: '/images/rudimenterre/home-food-icon-5.png', title: fr?'poissons':'Fish', detail: fr?'et crustacés':'and shellfish'},
    {icon: '/images/rudimenterre/home-food-icon-6.png', title: fr?'viandes':'Meat', detail: fr?'et volailles':'and poultry'},
  ];
  const openingRef = useRef<HTMLDivElement>(null);
  const heroTrackRef = useRef<HTMLDivElement>(null);
  const bannerRef = useRef<HTMLDivElement>(null);
  const benefitScrollRef = useRef<HTMLElement>(null);
  const benefitTrackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const opening = openingRef.current;
    const track = heroTrackRef.current;
    const banner = bannerRef.current;
    if (!opening || !track || !banner) return;

    let frame = 0;
    let layout = {
      headerHeight: 0,
      bannerHeight: 0,
      travel: 0,
      trackTop: 0,
    };

    const measureBanner = () => {
      const header = document.querySelector<HTMLElement>('.site-header');
      const hero = track.querySelector<HTMLElement>('.home-hero');
      const details = track.querySelector<HTMLElement>('.home-hero__details');
      const headerHeight = header?.getBoundingClientRect().height ?? 0;
      const viewportHeight = window.innerHeight;
      const sectionPreviewHeight = window.innerWidth <= 760
        ? 72
        : Math.min(180, viewportHeight * .2);
      const heroHeight = Math.max(
        512,
        viewportHeight - headerHeight - sectionPreviewHeight,
      );
      const heroTop = hero?.getBoundingClientRect().top ?? headerHeight;
      const detailsBottom = details?.getBoundingClientRect().bottom;
      const targetBannerHeight = detailsBottom == null
        ? viewportHeight * .62
        : detailsBottom - heroTop + 24;
      const introLift = window.innerWidth <= 760
        ? Math.max(80, Math.min(112, viewportHeight * .12))
        : Math.max(112, Math.min(168, viewportHeight * .16));
      const bannerHeight = Math.min(
        heroHeight,
        Math.max(160, targetBannerHeight, heroHeight - introLift),
      );
      const trackTop = track.getBoundingClientRect().top + window.scrollY;
      const travel = Math.max(
        0,
        viewportHeight - headerHeight - bannerHeight,
        heroHeight - introLift,
      );
      layout = {
        headerHeight,
        bannerHeight,
        travel,
        trackTop: track.getBoundingClientRect().top + window.scrollY,
      };

      track.style.setProperty('--hero-height', `${heroHeight}px`);
      track.style.setProperty('--banner-travel', `${travel}px`);
      opening.style.setProperty('--banner-travel', `${travel}px`);
      opening.style.setProperty('--banner-height', `${bannerHeight}px`);
      opening.style.setProperty('--intro-lift', `${introLift}px`);
      opening.style.setProperty('--banner-visible-height', `${bannerHeight * .6}px`);
      banner.style.setProperty('--banner-height', `${bannerHeight}px`);
      banner.style.setProperty('--banner-top', `${headerHeight}px`);
    };

    const updateBanner = () => {
      // Keep scroll updates transform-only. Changing the opening block's
      // layout during scrolling lets scroll anchoring move the next section.
      const scrollProgress = Math.max(
        0,
        window.scrollY - (layout.trackTop - layout.headerHeight),
      );
      const contentHold = Math.min(layout.travel, scrollProgress);
      banner.style.setProperty('--banner-shift', `${scrollProgress}px`);
      opening.style.setProperty('--content-hold', `${contentHold}px`);
    };
    const scheduleBannerUpdate = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(updateBanner);
    };
    const measureAndUpdate = () => {
      measureBanner();
      scheduleBannerUpdate();
    };

    measureAndUpdate();
    window.addEventListener('scroll', scheduleBannerUpdate, {passive: true});
    window.addEventListener('resize', measureAndUpdate);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', scheduleBannerUpdate);
      window.removeEventListener('resize', measureAndUpdate);
    };
  }, []);

  useEffect(() => {
    const section = benefitScrollRef.current;
    const track = benefitTrackRef.current;
    const viewport = section?.querySelector<HTMLElement>('.benefit-scroll__viewport');
    const scenes = Array.from(track?.querySelectorAll<HTMLElement>('.benefit-scene') ?? []);
    if (!section || !track || !viewport || !scenes.length) return;

    const horizontalLayout = window.matchMedia(
      '(min-width: 761px) and (min-height: 700px) and (prefers-reduced-motion: no-preference)',
    );
    let frame = 0;
    let start = 0;
    let stepDistance = 0;
    let sceneWidth = 0;
    let activeScene = -1;

    const update = () => {
      frame = 0;
      if (!horizontalLayout.matches || !stepDistance) return;
      const progress = Math.max(0, window.scrollY - start);
      const sceneIndex = Math.min(scenes.length - 1, Math.round(progress / stepDistance));
      if (sceneIndex === activeScene) return;
      activeScene = sceneIndex;
      track.style.setProperty('--benefit-shift', `${-sceneIndex * sceneWidth}px`);
    };
    const scheduleUpdate = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };
    const measure = () => {
      if (!horizontalLayout.matches) {
        section.style.removeProperty('--benefit-scroll-height');
        section.style.removeProperty('--benefit-sticky-top');
        section.style.removeProperty('--benefit-viewport-height');
        track.style.removeProperty('--benefit-shift');
        activeScene = -1;
        sceneWidth = 0;
        return;
      }

      const headerHeight = document.querySelector<HTMLElement>('.site-header')?.getBoundingClientRect().height ?? 0;
      const divider = section.querySelector<HTMLElement>('.benefit-scroll__divider');
      const dividerHeight = divider?.getBoundingClientRect().height ?? 0;

      const availableHeight = Math.max(0, window.innerHeight - headerHeight);
      const maxViewportHeight = Math.max(360, availableHeight - dividerHeight - 16);
      const contentHeight = Math.max(...scenes.map((scene) => scene.scrollHeight));
      sceneWidth = scenes[0].getBoundingClientRect().width;
      const viewportHeight = Math.min(
        Math.max(window.innerHeight * 0.68, contentHeight),
        Math.max(maxViewportHeight, contentHeight),
      );
      stepDistance = viewportHeight;

      const stageHeight = dividerHeight + viewportHeight;
      const remainingSpace = Math.max(0, availableHeight - stageHeight);
      const stickyOffset = headerHeight + Math.min(remainingSpace / 2, 20);

      start = section.getBoundingClientRect().top + window.scrollY - stickyOffset;
      section.style.setProperty('--benefit-scroll-height', `${stageHeight + stepDistance * (scenes.length - 1)}px`);
      section.style.setProperty('--benefit-sticky-top', `${stickyOffset}px`);
      section.style.setProperty('--benefit-viewport-height', `${viewportHeight}px`);
      activeScene = -1;
      scheduleUpdate();
    };
    const revealFocusedScene = (event: FocusEvent) => {
      if (!horizontalLayout.matches || !(event.target instanceof HTMLElement) || !event.target.matches(':focus-visible')) return;
      const scene = event.target.closest<HTMLElement>('.benefit-scene');
      const sceneIndex = scene ? scenes.indexOf(scene) : -1;
      if (sceneIndex < 0) return;
      window.scrollTo({top: start + sceneIndex * stepDistance, behavior: 'smooth'});
    };

    measure();
    window.addEventListener('scroll', scheduleUpdate, {passive: true});
    window.addEventListener('resize', measure);
    horizontalLayout.addEventListener('change', measure);
    track.addEventListener('focusin', revealFocusedScene);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', measure);
      horizontalLayout.removeEventListener('change', measure);
      track.removeEventListener('focusin', revealFocusedScene);
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
          <div className="home-hero__copy">
            <h1>{fr?'Le Cuicui':'Cuicui'}</h1>
            <p className="home-hero__lead">{fr ? <>un relais mobile<br />de cuissons saines et durables</> : <>a mobile relay<br />for healthy, sustainable cooking</>}</p>
            <p className="home-hero__details">{fr ? <>Modulable, robuste, polyvalent, distingué,<br />déconnecté, compatible <strong>tous feux</strong>.<br />Plus qu’une cocotte, le Cuicui est un relais<br />de cuissons durables et nomades.</> : <>Modular, robust, versatile, distinctive,<br />technology-free and compatible <strong>every hob</strong>.<br />More than a casserole, Cuicui is a mobile relay<br />for sustainable cooking.</>}</p>
          </div>
          <div className="home-banner" ref={bannerRef} aria-hidden="true">
            <img src="/images/rudimenterre/home-banner.jpg" alt="" />
          </div>
        </section>
      </div>

      <div className="home-opening__content">
        <img className="home-intro__product" src="/images/rudimenterre/home-hero.webp" alt="Le Cuicui Rudimenterre entouré de légumes" />
        <section className="home-intro">
          <div className="home-intro__media">
            <Link className="button button--light home-intro__cta" to={productUrl}>{fr?'J’adopte un Cuicui':'Adopt a Cuicui'}</Link>
            <img src="/images/rudimenterre/home-life.webp" alt="Le Cuicui utilisé dans une cuisine" loading="lazy" />
          </div>
          <div className="home-intro__copy">
            <p className="script">{fr?'Bienvenue dans la cuisine du futur':'Welcome to the kitchen of the future'}</p>
            <h2>{fr?'Une autre approche de l’organisation des cuissons en cuisine':'Another approach to organising cooking in the kitchen'}</h2>
            {fr ? <p><strong>La cuisine du quotidien</strong> n’est pas une performance du dimanche : c’est <strong>s’organiser avec bon sens.</strong> C’est l’art de <strong>relier les repas entre eux</strong> plutôt que de les isoler, en apprenant <strong>une méthode</strong> et non des recettes.<br/><strong>On n’exécute pas, on réfléchit pour nous libérer</strong> des contraintes du quotidien qui nous rendent créatifs.</p>
              : <p><strong>Everyday cooking</strong> is not a Sunday performance: it means <strong>organising with common sense.</strong> It is the art of <strong>connecting meals to one another</strong> rather than isolating them, by learning <strong>a method</strong>, not recipes.<br/><strong>We do not simply execute; we think in order to free ourselves</strong> from everyday constraints that make us creative.</p>}
          </div>
        </section>

        <section className="home-banner-feature" aria-label={fr?'Atouts du Cuicui':'Cuicui benefits'}>
          <div className="home-icon-strip home-icon-strip--benefits">
            {iconBenefits.map((benefit) => <article key={benefit.title}>
              <img src={benefit.icon} alt="" aria-hidden="true" loading="lazy" />
              <div>
                <h3>{benefit.title}</h3>
                <p>{benefit.detail}</p>
              </div>
            </article>)}
          </div>
        </section>
        <div className="home-banner-followup" aria-hidden="true">
          <img src="/images/rudimenterre/home-banner.jpg" alt="" loading="lazy" />
        </div>
      </div>
    </div>

    <section className="benefit-scroll" ref={benefitScrollRef} aria-label={fr?'Pourquoi choisir le Cuicui':'Why choose Cuicui'}>
      <div className="benefit-scroll__stage">
        <div className="home-section-divider benefit-scroll__divider" aria-hidden="true">
          <span>{fr?'Si vous souhaitez':'If you wish'}</span>
          <i />
        </div>
        <div className="benefit-scroll__viewport">
        <div className="benefit-grid" ref={benefitTrackRef}>
          <div className="benefit-scene">
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

          </div>

          <div className="benefit-scene benefit-scene--tomorrow">
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

          </div>

          <div className="benefit-scene">
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
          </div>
        </div>
      </div>
      </div>
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
      {foodGroups.map((group) => <article key={group.title}>
        <img src={group.icon} alt="" aria-hidden="true" loading="lazy" />
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

    <section className="home-award" aria-labelledby="home-award-title">
      <div className="home-award__banner">
        <div className="home-award__side-label" aria-hidden="true">
          <div>
            <span>{fr ? 'Produit' : 'Product'}</span>
          </div>
        </div>
        <img
          className="home-award__background"
          src="/images/rudimenterre/home-award-banner.jpeg"
          alt=""
          loading="lazy"
        />
        <div className="home-award__content">
          <h2 id="home-award-title">
            {fr ? 'Le Cuicui récompensé' : 'Award-winning Cuicui'}
          </h2>
          <svg
            className="home-award__crown"
            viewBox="0 0 96 64"
            aria-hidden="true"
          >
            <path d="M15 17 33 36 48 8l15 28 18-19-7 37H22Z" />
            <circle cx="15" cy="17" r="3" />
            <circle cx="48" cy="8" r="3" />
            <circle cx="81" cy="17" r="3" />
          </svg>
          <p>
            <span>{fr ? '17e Grand Prix International du Design - 2024' : '17th International Grand Prix du Design - 2024'}</span>
            <span>{fr ? 'Lauréat Platine, Prix International' : 'Platinum Laureate, International Prize'}</span>
            <span>{fr ? 'catégorie produit et conception durable' : 'product and sustainable design category'}</span>
          </p>
          <Link className="button button--orange home-award__cta" to={pagePath(locale, 'jury')}>
            {fr ? 'Mention du jury' : 'Jury mention'}
          </Link>
        </div>
      </div>
    </section>

    <section className="home-on-tour" aria-labelledby="home-on-tour-title">
      <h2 id="home-on-tour-title">
        {fr ? 'Le Cuicui en vadrouille' : 'Cuicui on the road'}
      </h2>

      <div className="home-on-tour__list">
        <article>
          <h3>
            {fr
              ? 'Sorties Lowbjethèque, bibliothèque d’objets à emprunter à La Garde :'
              : 'Lowbjethèque outings, La Garde’s lending library of objects:'}
          </h3>
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
          <h3>{fr ? 'Sorties TV avec Lowbjethèque' : 'Television appearances with Lowbjethèque'}</h3>
          <p>
            <span>{fr ? 'JT13h France Télévisions - Une idée pour la France - mai 2026' : 'JT13h France Télévisions - Une idée pour la France - May 2026'}</span>
            <span>{fr ? '19/20 France 3 Provence Alpes Côtes d’Azur - sept 2024' : '19/20 France 3 Provence Alpes Côte d’Azur - Sept 2024'}</span>
          </p>
        </article>

        <article>
          <h3>{fr ? 'Évènement Écotable Chaud Devant' : 'Écotable Chaud Devant event'}</h3>
          <p>
            <span>{fr ? 'Thématique La cuisine sous 50C - Marseille, 2025' : 'Theme: Cooking below 50C - Marseille, 2025'}</span>
            <span>{fr ? 'Tables rondes et démonstration du Cuicui' : 'Round tables and a Cuicui demonstration'}</span>
          </p>
        </article>

        <article>
          <h3>
            {fr
              ? 'Salon Biosphère avec Un Bocal à la Mer, épicerie vrac à Plérin'
              : 'Salon Biosphère with Un Bocal à la Mer, a zero-waste shop in Plérin'}
          </h3>
          <p><span>{fr ? 'Mur de Bretagne - été 2025' : 'Mur de Bretagne - Summer 2025'}</span></p>
        </article>

        <article>
          <h3>{fr ? 'Un Bocal à la Mer, épicerie vrac' : 'Un Bocal à la Mer, zero-waste shop'}</h3>
          <p><span>{fr ? 'Plérin - 2025' : 'Plérin - 2025'}</span></p>
        </article>

        <article>
          <h3>{fr ? '17e Grand Prix du Design' : '17th Grand Prix du Design'}</h3>
          <p><span>{fr ? 'Montréal automne 2024' : 'Montreal, Fall 2024'}</span></p>
        </article>

        <article>
          <h3>{fr ? 'Vu dans la Presse :' : 'In the press:'}</h3>
          <p>
            <span>{fr ? 'Magazine Reporterre, avril 2026' : 'Reporterre magazine, April 2026'}</span>
            <span>{fr ? 'Magazine Regain, n26, automne 2024' : 'Regain magazine, no. 26, Fall 2024'}</span>
            <span>{fr ? 'Magazine La Relève de La Peste, sept 2024' : 'La Relève de La Peste magazine, Sept 2024'}</span>
            <span>{fr ? 'Journal de Hyères, le Lavendou, Toulon, août 2024' : 'Journal de Hyères, Le Lavandou, Toulon, Aug 2024'}</span>
          </p>
        </article>
      </div>
    </section>

    <section className="home-project-banner" aria-labelledby="home-project-banner-title">
      <img
        src="/images/rudimenterre/project.webp"
        alt={fr ? 'Village français en noir et blanc' : 'French village in black and white'}
        loading="lazy"
      />
      <div className="home-project-banner__content">
        <h2 id="home-project-banner-title">
          {fr ? 'Le projet Rudimenterre' : 'The Rudimenterre project'}
        </h2>
        <Link
          className="button button--light home-project-banner__cta"
          to={pagePath(locale, 'project')}
        >
          {fr ? 'Un Cuicui 100% français' : 'A 100% French Cuicui'}
        </Link>
      </div>
    </section>

    <HomeReviews locale={locale} />

    <section className="home-material-banner" aria-labelledby="home-material-banner-title">
      <img
        src="/images/rudimenterre/home-material-banner.webp"
        alt={fr ? 'Cuicui et aliments disposés dans une cuisine' : 'Cuicui and ingredients arranged in a kitchen'}
        loading="lazy"
      />
      <div className="home-material-banner__content">
        <h2 id="home-material-banner-title">
          {fr ? 'Matière' : 'Material'}
        </h2>
        <Link
          className="button button--light home-material-banner__cta"
          to={pagePath(locale, 'making')}
        >
          {fr ? 'Fabrication et entretien' : 'Making and care'}
        </Link>
      </div>
    </section>

    <section className="home-workshops-banner" aria-labelledby="home-workshops-banner-title">
      <img
        src="/images/rudimenterre/home-workshops-banner.webp"
        alt={fr ? 'Cuicui entouré de légumes et de paniers' : 'Cuicui surrounded by vegetables and baskets'}
        loading="lazy"
      />
      <div className="home-workshops-banner__content">
        <h2 id="home-workshops-banner-title">
          {fr ? 'Pour apprendre la méthode' : 'To learn the method'}
        </h2>
        <Link
          className="button button--light home-workshops-banner__cta"
          to={`/${locale}/pages/ateliers-cuissons-rudimenterre`}
        >
          {fr ? 'Ateliers cuissons Rudimenterre' : 'Rudimenterre cooking workshops'}
        </Link>
      </div>
    </section>

    <section className="home-professional-banner" aria-labelledby="home-professional-banner-title">
      <img
        src="/images/rudimenterre/home-professional-banner.webp"
        alt={fr ? 'Nombreux récipients Cuicui empilés dans un atelier' : 'Many Cuicui vessels stacked in a workshop'}
        loading="lazy"
      />
      <div className="home-professional-banner__content">
        <h2 id="home-professional-banner-title">
          {fr ? 'Pour les chefs du futur' : 'For the chefs of the future'}
        </h2>
        <Link
          className="button button--light home-professional-banner__cta"
          to={`/${locale}/pages/service-decouverte-pro`}
        >
          {fr ? 'Service découverte pro' : 'Professional discovery service'}
        </Link>
      </div>
    </section>

    <div className="home-future-divider">
      <h2>{fr ? 'Un Cuicui pour demain' : 'A Cuicui for tomorrow'}</h2>
    </div>

    <section className="home-newsletter-banner" aria-labelledby="home-newsletter-banner-title">
      <img
        src="/images/rudimenterre/home-newsletter-banner.webp"
        alt={fr ? 'Table garnie de Cuicui, de pain, de légumes et de plantes' : 'Table filled with Cuicui vessels, bread, vegetables and plants'}
        loading="lazy"
      />
      <div className="home-newsletter-banner__content">
        <h2 id="home-newsletter-banner-title">
          {fr ? 'Restons en contact' : 'Let’s stay in touch'}
        </h2>
        <p>
          {fr
            ? 'Recevez des nouvelles du Cuicui selon vos goûts !'
            : 'Receive Cuicui news tailored to your interests!'}
        </p>
        <Link
          className="button button--light home-newsletter-banner__cta"
          to={`/${locale}/pages/newsletter`}
        >
          <svg
            className="home-newsletter-banner__icon"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M3.75 5.75h16.5v12.5H3.75z" />
            <path d="m4.5 6.5 7.5 6 7.5-6" />
          </svg>
          {fr ? 'Inscrivez-vous' : 'Sign up'}
        </Link>
      </div>
    </section>
  </div>;
}

const HOME_PRODUCT_QUERY = `#graphql
 query HomeProduct($country: CountryCode, $language: LanguageCode) @inContext(country:$country,language:$language) {
  products(first:1,sortKey:UPDATED_AT,reverse:true) { nodes { id title handle } }
 }
` as const;
