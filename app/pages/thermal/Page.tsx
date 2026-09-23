import type {StorefrontLocale} from '~/lib/i18n';

const image = (name: string) => `/images/rudimenterre/thermal-${name}.webp`;

const advice = {
  fr: [
    {
      heading: <><span className="thermal-advice-card__large">JE PLANIFIE</span><span>MES REPAS</span></>,
      body: <><strong>Je compose mes menus de la semaine</strong><br />J’organise mes achats à l’avance<br /><strong>Je programme mes cuissons pour penser à les mutualiser</strong><br />(cuire une compote en même temps qu’un ragoût)</>,
      tone: 'cream',
    },
    {
      heading: <><span className="thermal-advice-card__large">JE MUTUALISE</span><span>LES CUISSONS</span></>,
      body: <><strong>En mode vapeur-étuvée, je cuis plusieurs préparations en même temps sur</strong><span className="thermal-advice-card__callout">1 seul feu</span></>,
      tone: 'white',
    },
    {
      heading: <><span>JE FINIS LA CUISSON</span><span className="thermal-advice-card__large">FEU ÉTEINT</span></>,
      body: <strong>L’inertie thermique de la terre cuite me permet de finir la cuisson feu éteint comme avec une marmite norvégienne</strong>,
      tone: 'rose',
    },
    {
      heading: <><span>JE N’AI PAS BESOIN</span><span className="thermal-advice-card__large">DE RÉCHAUFFER</span></>,
      body: <strong>Les plats en terre empilés mutualisent leur chaleur et restent chauds très longtemps, même apportés à table</strong>,
      tone: 'orange',
    },
    {
      heading: <><span>JE RÉCHAUFFE LE LENDEMAIN</span><span className="thermal-advice-card__medium">EN MÊME TEMPS</span><span className="thermal-advice-card__medium">QUE JE CUIS AUTRE CHOSE</span></>,
      body: <>Je profite d’une nouvelle cuisson en mode vapeur-étuvée <strong>pour faire réchauffer un reste de la veille</strong> en même temps sur 1 seul feu</>,
      tone: 'blue',
    },
    {
      heading: <><span>JE NE</span><span className="thermal-advice-card__large">PRÉCHAUFFE</span><span className="thermal-advice-card__large">PAS</span><span>LE FOUR TRADITIONNEL</span></>,
      body: <><strong>J’enfourne four froid. Le récipient monte en température progressivement et commence à cuire dès le début<br />Je peux finir la cuisson feu éteint</strong></>,
      tone: 'cream',
    },
  ],
  en: [
    {
      heading: <><span className="thermal-advice-card__large">I PLAN</span><span>MY MEALS</span></>,
      body: <><strong>I plan my weekly menus.</strong><br />I organise my shopping in advance and schedule cooking so I can combine dishes (cooking compote while a stew simmers).</>,
      tone: 'cream',
    },
    {
      heading: <><span className="thermal-advice-card__large">I COMBINE</span><span>COOKING</span></>,
      body: <>With steam-stewing, I cook several dishes at the same time over <strong>one heat source.</strong></>,
      tone: 'white',
    },
    {
      heading: <><span>I FINISH COOKING</span><span className="thermal-advice-card__large">WITH THE HEAT OFF</span></>,
      body: <>The thermal inertia of the clay lets me finish cooking after turning off the heat, like a retained-heat cooker.</>,
      tone: 'rose',
    },
    {
      heading: <><span>I DON’T NEED TO</span><span className="thermal-advice-card__large">REHEAT</span></>,
      body: <>Stacked earthenware vessels share their heat and stay warm for a long time, even when brought to the table.</>,
      tone: 'orange',
    },
    {
      heading: <><span>I REHEAT LEFTOVERS</span><span className="thermal-advice-card__medium">WHILE COOKING</span><span className="thermal-advice-card__medium">SOMETHING ELSE</span></>,
      body: <>I use the next steam-stewing session to reheat yesterday’s leftovers at the same time, over one heat source.</>,
      tone: 'blue',
    },
    {
      heading: <><span>I DON’T</span><span className="thermal-advice-card__large">PREHEAT</span><span>THE OVEN</span></>,
      body: <>I put the vessel into a cold oven. It warms gradually and starts cooking from the beginning. I can finish cooking with the oven off.</>,
      tone: 'cream',
    },
  ],
};

export function ThermalPage({locale}: {locale: StorefrontLocale}) {
  const fr = locale === 'fr';
  return <article className="thermal-page">
    <header className="thermal-hero">
      <img src={image('hero')} alt="Thermomètre posé sur un Cuicui" width="2400" height="983" fetchPriority="high" />
      <div className="thermal-hero__copy">
        <h1>{fr ? 'EXPÉRIENCES THERMIQUES' : 'THERMAL EXPERIMENTS'}</h1>
        <p>{fr ? 'MOINS D’ÉNERGIE, PLUS D’AUTONOMIE' : 'LESS ENERGY, MORE AUTONOMY'}</p>
      </div>
    </header>

    <section className="thermal-intro">
      <h2>{fr ? 'ET SI DEMAIN LA CUISSON DES ALIMENTS DEMANDAIT MOINS D’ÉNERGIE ?' : 'WHAT IF COOKING REQUIRED LESS ENERGY TOMORROW?'}</h2>
      <p>{fr ? <>Pourrions-nous facilement cuire des mijotés avec les moyens du bord, sans électricité ?<br />Et bien avec le Cuicui, c’est possible !</> : <>Could we still cook a stew with whatever we have to hand, without electricity?<br />With Cuicui, we can.</>}</p>
    </section>

    <section className="thermal-principle" aria-labelledby="thermal-principle-title">
      <div className="thermal-principle__diagram">
        <h2 id="thermal-principle-title">{fr ? <>LE PRINCIPE :<br />MUTUALISER LES CUISSONS –<br />UTILISER L’INERTIE THERMIQUE DE<br />LA TERRE CUITE</> : <>THE PRINCIPLE:<br />COMBINE COOKING –<br />USE THE THERMAL INERTIA<br />OF FIRED CLAY</>}</h2>
        <div className="thermal-principle__art">
          <img src={image('diagram')} alt={fr ? 'Schéma en coupe du Cuicui empilé au-dessus d’une casserole et chauffé par un feu.' : 'Cutaway illustration of stacked Cuicui vessels over a saucepan, heated by a flame.'} width="2400" height="1800" />
        </div>
      </div>
      <div className="thermal-experiments">
        <h2>{fr ? 'EXPÉRIENCES THERMIQUES' : 'THERMAL EXPERIMENTS'}</h2>
        <p className="thermal-experiments__intro">{fr ? 'Voici nos relevés de températures intérieures de deux récipients déposés sur une casserole d’eau qui bout, puis feu éteint :' : 'Here are our internal temperature readings for two vessels placed over a saucepan of boiling water, then left to cook with the heat off:'}</p>
        <div className="thermal-readings">
          <section className="thermal-reading thermal-reading--rapid">
            <img className="thermal-reading__arrow" src={image('arrow')} alt="" aria-hidden="true" loading="lazy" />
            <h3><em>{fr ? 'Cuisson' : 'Fast'} </em>{fr ? 'RAPIDE' : 'COOKING'}</h3>
            <p>{fr ? 'Quand l’eau bout, la température atteint' : 'Once the water boils, the temperature reaches'}</p>
            <strong className="thermal-reading__number">95 °C <small>{fr ? 'en 6 min' : 'in 6 min'}</small></strong>
            <span className="thermal-reading__suffix">{fr ? 'seulement' : 'only'}</span>
          </section>
          <section className="thermal-reading thermal-reading--insulating">
            <img className="thermal-reading__arrow thermal-reading__arrow--long" src={image('arrow')} alt="" aria-hidden="true" loading="lazy" />
            <h3><em>{fr ? 'Cuisson' : 'Heat-retaining'} </em>{fr ? 'ISOLANTE' : 'COOKING'}</h3>
            <p>{fr ? 'Relevés après avoir éteint le feu sous la casserole d’eau :' : 'Readings after turning off the heat under the saucepan:'}</p>
            <ul>
              <li><span>{fr ? 'après 45 min' : 'after 45 min'}</span><strong>86 °C</strong></li>
              <li><span>{fr ? 'après 1 h' : 'after 1 hour'}</span><strong>84 °C</strong></li>
              <li><span>{fr ? 'après 2 h 30' : 'after 2 hr 30'}</span><strong>67 °C*</strong></li>
            </ul>
            <img className="thermal-reading__match" src={image('match')} alt="" aria-hidden="true" loading="lazy" />
          </section>
          <section className="thermal-reading thermal-reading--gentle">
            <img className="thermal-reading__arrow" src={image('arrow')} alt="" aria-hidden="true" loading="lazy" />
            <h3><em>{fr ? 'Cuisson' : 'Gentle'} </em>{fr ? 'DOUCE INDIRECTE' : 'INDIRECT COOKING'}</h3>
            <p>{fr ? 'La température plafonne à' : 'The temperature reaches no more than'}</p>
            <strong className="thermal-reading__number">95 °C <small>max</small></strong>
          </section>
        </div>
        <p className="thermal-energy">
          <img className="thermal-energy__arrow" src={image('arrow')} alt="" aria-hidden="true" loading="lazy" />
          {fr ? <>J’utilise <strong>n’importe quelle source d’énergie**</strong> : gaz, feu, bois, électrique…</> : <>I can use <strong>any energy source**</strong>: gas, open fire, wood, electric…</>}
        </p>
      </div>
    </section>

    <section className="thermal-advice" aria-labelledby="thermal-advice-title">
      <h2 id="thermal-advice-title">{fr ? 'COMMENT UTILISER MOINS D’ÉNERGIE AVEC LE CUICUI' : 'HOW TO USE LESS ENERGY WITH CUICUI'}</h2>
      <div className="thermal-advice__grid">
        {advice[locale].map((item, index) => <section className={`thermal-advice-card thermal-advice-card--${item.tone}`} key={index}>
          <span className="thermal-advice-card__number">0{index + 1}</span>
          <h3>{item.heading}</h3>
          <p>{item.body}</p>
        </section>)}
      </div>
      <p>{fr ? 'MAINTENANT QUE VOUS AVEZ LES CARTES EN MAIN, À VOUS DE JOUER !' : 'NOW YOU HAVE THE TOOLS. IT’S YOUR TURN!'}</p>
    </section>

    <footer className="thermal-notes">
      <h2>{fr ? 'LA CHALEUR CONTINUE SON TRAVAIL' : 'HEAT KEEPS DOING THE WORK'}</h2>
      <img className="thermal-notes__flame" src={image('flame')} alt="" aria-hidden="true" loading="lazy" />
      <div className="thermal-notes__copy">
        <p><strong>67 °C*</strong><br />{fr ? <>La température interne feu éteint ne doit pas descendre sous <strong>60 °C</strong> pour être sécuritaire. Sous ce seuil, les bactéries peuvent proliférer rapidement, ce qui rend la préparation dangereuse à la consommation si le temps de maintien au chaud se prolonge.</> : <>The internal temperature after switching off the heat should not fall below <strong>60 °C</strong> to remain safe. Below this threshold, bacteria can multiply quickly, making food unsafe if it is kept warm for too long.</>}</p>
        <p><strong>{fr ? 'N’IMPORTE QUELLE SOURCE D’ÉNERGIE**' : 'ANY ENERGY SOURCE**'}</strong><br />{fr ? 'Puisque la cuisson est indirecte, c’est la matière de la casserole complémentaire qui détermine la compatibilité avec la source de chaleur en contact direct.' : 'Because cooking is indirect, the material of the saucepan determines which direct heat sources it can be used with.'}</p>
      </div>
    </footer>
  </article>;
}
