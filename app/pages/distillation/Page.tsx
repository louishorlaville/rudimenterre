/* eslint-disable jsx-a11y/no-noninteractive-tabindex -- The horizontal experiment board must remain keyboard focusable. */
import {useEffect, useRef, useState, type ReactNode} from 'react';
import {EditorialTemplate} from '~/pages/editorial/Template';
import type {EditorialPageContent} from '~/lib/editorial-content';
import type {StorefrontLocale} from '~/lib/i18n';

export function DistillationPage() {
  return (
    <article className="distillation-page">
      <header className="distillation-hero">
        <img
          src="/images/rudimenterre/distillation/hero.jpg"
          alt="Cuicui ouvert sur une table en bois"
        />
        <div className="distillation-hero__copy">
          <h1>EXPÉRIENCES DISTILLATION</h1>
          <p>MOINS D’EAU POTABLE, PLUS D’AUTONOMIE</p>
          <img
            className="distillation-hero__drop"
            src="/images/rudimenterre/distillation/drop.png"
            alt=""
            aria-hidden="true"
          />
        </div>
      </header>

      <section className="distillation-lead">
        <h2>ET SI DEMAIN L’EAU NE COULAIT PLUS PAR MAGIE DU ROBINET&nbsp;?</h2>
        <p>
          Pourrions-nous facilement cuire des pâtes&nbsp;? Faire une
          soupe&nbsp;? Cuire du riz&nbsp;? Non évidemment…
          <br />
          Et bien avec le Cuicui en mode vapeur-étuvée c’est possible&nbsp;!
        </p>
        <img
          src="/images/rudimenterre/distillation/tap.png"
          alt="Illustration d’un robinet"
        />
      </section>

      <section className="distillation-principle">
        <div className="distillation-principle__diagram">
          <h2>
            LE PRINCIPE : DISTILLER L’EAU POUR
            <br />
            CUIRE ET PURIFIER
          </h2>
          <img
            src="/images/rudimenterre/distillation/principle-cuicui.png"
            alt="Schéma de distillation du Cuicui"
          />
        </div>
        <div className="distillation-principle__copy">
          <p>
            <em>
              L’architecture du Cuicui utilise un principe physique simple :
            </em>
            <br />
            <strong>la distillation par évaporation et condensation</strong>
          </p>
          <div className="distillation-principle__copy-row">
            <img
              className="distillation-principle__arrow"
              src="/images/rudimenterre/distillation/arrow.png"
              alt=""
            />
            <p>
              <strong>Dans les récipients du Cuicui :</strong>
              <br />
              <strong>Vous récoltez de l’eau pure distillée</strong> hautement
              purifiée de ses impuretés (sels, micro-organismes, métaux lourds
              et{' '}
              <strong>la quasi totalité des polluants éternels PFAS ***</strong>
              ). Cette eau est issue de la vapeur qui en s’élevant de la
              casserole du dessous, se condense directement dans vos récipients
              de cuisson.
            </p>
          </div>
          <div className="distillation-principle__copy-row">
            <img
              className="distillation-principle__arrow"
              src="/images/rudimenterre/distillation/arrow.png"
              alt=""
            />
            <p>
              <strong>Dans la casserole sous le Cuicui :</strong>
              <br />
              <strong>Vous pouvez utiliser de l’eau non potable</strong> (eau du
              robinet non filtrée, eau de pluie ou de mer, eau chargée en
              polluants éternels PFAS). Cette eau{' '}
              <strong>
                ne touche jamais les aliments, elle sert uniquement à générer
                de la vapeur.
              </strong>
            </p>
          </div>
        </div>
      </section>

      <section className="distillation-scenarios">
        <div className="distillation-banner">
          <img
            src="/images/rudimenterre/distillation/river.png"
            alt="Cours d’eau entre des falaises"
          />
          <div>
            <h2>COMMENT UTILISER MOINS D’EAU POTABLE AVEC LE CUICUI</h2>
            <p>
              SELON VOS BESOINS ET VOS RESSOURCES
              <br />3 SCÉNARIOS POSSIBLES :
            </p>
          </div>
        </div>
        <div className="distillation-scenario-grid">
          <Scenario title="AUTONOMIE TOTALE" tone="white">
            <ul>
              <li className="distillation-scenario__lead">
                <strong>Pour vos légumes, viandes, poissons…</strong>
              </li>
              <li>
                L’eau distillée et l’eau des végétations de vos aliments
                suffisent.
              </li>
              <li>
                <strong>Zéro ajout d’eau potable</strong>, vous cuisinez en
                circuit fermé
              </li>
            </ul>
          </Scenario>
          <Scenario title="SIMPLE APPOINT" tone="blue">
            <ul>
              <li className="distillation-scenario__lead">
                <strong>Pour vos pâtes, riz, soupes…</strong>
              </li>
              <li>
                L’apport en eau distillée et de végétation ne suffit pas pour
                les cuissons par absorption, il faut compléter avec un peu de
                liquide.
              </li>
              <li>
                <strong>Vos options :</strong> un fond d’eau potable ou, encore
                mieux, votre précédent bouillon distillé
              </li>
            </ul>
          </Scenario>
          <Scenario title="FACE AUX RESTRICTIONS D’EAU" tone="cream">
            <ul>
              <li className="distillation-scenario__lead">
                <strong>
                  En cas de coupure, sécheresse ou vie hors-réseau
                </strong>{' '}
                et que l’apport en eau préservée par le Cuicui ne suffit
                pas&nbsp;:
              </li>
              <li>
                Organisez-vous pour utiliser systématiquement vos bouillons
                distillés de précédents repas.
              </li>
              <li>
                <strong>
                  Résultat : 0L d’eau neuve utilisée pour cuisiner vos repas
                </strong>
              </li>
            </ul>
          </Scenario>
        </div>
      </section>

      <section className="distillation-objective">
        <h2>OBJECTIF DE NOS EXPÉRIENCES</h2>
        <p>
          Chaque goutte d’eau pure est précieuse. Ces tests ont simplement pour
          but de vous donner <strong>des repères indicatifs.</strong> En
          observant le système, vous apprendrez à{' '}
          <strong>anticiper cet apport d’eau pure</strong> pour diminuer dans
          vos recettes l’ajout habituel d’eau potable. Les quantités varient en
          fonction de la durée de cuisson et du positionnement de vos
          récipients.
        </p>
        <p>
          <strong>Ce n’est pas de la magie, c’est de la physique.</strong>
        </p>
      </section>

      <section className="distillation-results">
        <h2>LES RÉSULTATS EN 1 HEURE DE CUISSON</h2>
        <p className="distillation-results__intro">
          À durée et quantité d’eau bouillie égales dans la casserole du bas,
          nous avons constaté 3 phénomènes majeurs :
        </p>
        <div className="distillation-results__labels">
          <span>
            <img src="/images/rudimenterre/distillation/eye.png" alt="" />
            J’OBSERVE
          </span>
          <span>
            <img src="/images/rudimenterre/distillation/diagram.png" alt="" />
            J’ADAPTE LA CUISSON
          </span>
        </div>
        <ResultRow
          tone="blue"
          title="L’EAU S’ACCUMULE PLUS EN HAUT"
          body={
            <>
              <strong>
                Avec 2 récipients, le volume d’eau pure produite est plus
                important dans le récipient supérieur
              </strong>
              <br />
              environ 70% du total récupéré
            </>
          }
          advice={
            <>
              <strong>
                Je positionne au top la préparation pour laquelle je veux le
                plus d’eau.
              </strong>{' '}
              Au besoin j’alterne les récipients à mi-cuisson pour répartir
              l’eau dans les différents récipients
            </>
          }
          icon="drop.png"
        />
        <ResultRow
          title="PLUS IL Y A D’ÉTAGES PLUS ON PRODUIT D’EAU"
          body={
            <>
              quantité d’eau pure distillée récupérée&nbsp;:
              <br />
              <strong>1 récipient</strong> en terre = <strong>200ml</strong>
              <br />
              <strong>2 récipients</strong> en terre ={' '}
              <strong>290ml au total</strong>
            </>
          }
          advice={
            <>
              <strong>
                Pour économiser plus d’eau potable, je m’organise pour
                mutualiser plusieurs cuissons étagées
              </strong>
            </>
          }
          icon="stack.png"
        />
        <ResultRow
          tone="teal"
          title="PLUS IL Y A D’ÉTAGES, MOINS L’EAU DE LA CASSEROLE S’ÉVAPORE"
          body={
            <>
              Reste d’eau dans la casserole&nbsp;:
              <br />
              <strong>Avec 1 récipient : 210ml</strong>
              <br />
              <strong>Avec 2 récipients : 500ml</strong>
            </>
          }
          advice={
            <>
              <strong>
                Je suis plus vigilante en cours de cuisson pour surveiller le
                niveau d’eau de la casserole du dessous pour une cuisson
                solitaire (la casserole ne doit jamais être vide&nbsp;!)
              </strong>
            </>
          }
          icon="pot.png"
        />
      </section>

      <ExperimentBoard />
      <section className="distillation-footnote">
        <h2>CE N’EST PAS DE LA MAGIE, C’EST DE LA PHYSIQUE !</h2>
        <p>
          Comment peut-on récupérer plus d’eau pure (290ml au lieu de 200ml)
          alors que la casserole du bas a moins évaporé&nbsp;? C’est la physique
          du Cuicui&nbsp;!
          <br />
          Le deuxième récipient agit comme un régulateur : il ralentit la fuite
          de la vapeur en bas, ce qui permet au couvercle de rester plus frais.
          Au lieu de produire de la vapeur à tout vitesse et de la laisser
          s’échapper dans la cuisine, le système prend son temps et piège la
          vapeur avec une efficacité redoutable. Moins de gaspillage en bas,
          plus d’eau pure en haut.
        </p>
      </section>
      <section className="distillation-notes">
        <p>
          <strong>PFAS***</strong>
          <br />
          <strong>
            La distillation thermique est, avec l’osmose inverse, l’une des deux
            méthodes les plus efficaces reconnues pour éliminer les PFAS.
          </strong>{' '}
          En exploitant la différence des points d’ébullition (l’eau s’évapore à
          100°C tandis que les PFAS nécessitent plus de 180°C), cette technique
          laisse les polluants éternels piégés au fond de la casserole du bas.
          Les études scientifiques menées sur les procédés de distillation
          résidentielle démontrent une efficacité supérieure à 99% sur
          l’élimination des PFOA/PFOS. Données récentes de l’Institute of
          Science Tokyo (2025/2026)&nbsp;: les recherches en génie
          environnemental confirment que l’exploitation des différences de
          points d’ébullition permet de faire chuter les taux de PFAS sous les
          limites de détection environnementales globales.
        </p>
        <p>
          <strong>Pas de pression**</strong>
          <br />
          <strong>
            Le Cuicui n’est pas sous pression pour ne jamais dépasser les 100°C
          </strong>{' '}
          et conserver le maximum de nutriments et vitamines. Il y a donc
          toujours un peu de vapeur qui s’échappe entre chaque élément.
        </p>
      </section>
    </article>
  );
}

function Scenario({
  title,
  tone,
  children,
}: {
  title: string;
  tone: string;
  children: ReactNode;
}) {
  return (
    <div className={`distillation-scenario distillation-scenario--${tone}`}>
      <h3>{title}</h3>
      <p>{children}</p>
    </div>
  );
}
function ResultRow({
  tone = '',
  title,
  body,
  advice,
  icon,
}: {
  tone?: string;
  title: string;
  body: ReactNode;
  advice: ReactNode;
  icon: string;
}) {
  return (
    <div
      className={`distillation-result-row ${tone ? `distillation-result-row--${tone}` : ''}`}
    >
      <div>
        <h3>{title}</h3>
        <p>{body}</p>
      </div>
      <img
        className="distillation-result-row__arrow"
        src="/images/rudimenterre/distillation/arrow.png"
        alt=""
      />
      <div>
        <img src={`/images/rudimenterre/distillation/${icon}`} alt="" />
        <p>{advice}</p>
      </div>
    </div>
  );
}

const distillationExperimentImages = {
  clocks: [
    'clock-0.png',
    'clock-1.png',
    'clock-2.png',
    'clock-3.png',
    'clock-4.png',
  ],
  first: [
    'exp-1-0.png',
    'exp-1-1.png',
    'exp-1-2.png',
    'exp-1-3.png',
    'exp-1-4.png',
  ],
  second: [
    'exp-2-0.png',
    'exp-2-1.png',
    'exp-2-2.png',
    'exp-2-3.png',
    'exp-2-4.png',
  ],
};

const distillationExperimentLabels = {
  first: [
    {top: '0ml', water: '2.5L'},
    {top: '60ml'},
    {top: '105ml'},
    {top: '150ml'},
    {top: '200ml', water: '210ml'},
  ],
  second: [
    {top: '0ml', middle: '0ml', r2: 'R2', r1: 'R1', water: '2.5L'},
    {top: '90ml', middle: '40ml'},
    {top: '130ml', middle: '50ml'},
    {top: '170ml', middle: '70ml'},
    {top: '210ml', middle: '80ml', water: '0.5L'},
  ],
};

function ExperimentBoard() {
  const base = '/images/rudimenterre/distillation/experiences';
  const boardRef = useRef<HTMLDivElement>(null);
  const [scrollState, setScrollState] = useState({left: false, right: false});

  useEffect(() => {
    const board = boardRef.current;
    if (!board) return;

    const updateScrollState = () => {
      const maxScrollLeft = board.scrollWidth - board.clientWidth;
      const nextState = {
        left: board.scrollLeft > 1,
        right: board.scrollLeft < maxScrollLeft - 1,
      };
      setScrollState((current) =>
        current.left === nextState.left && current.right === nextState.right
          ? current
          : nextState,
      );
    };

    updateScrollState();
    board.addEventListener('scroll', updateScrollState, {passive: true});
    const resizeObserver = new ResizeObserver(updateScrollState);
    resizeObserver.observe(board);

    return () => {
      board.removeEventListener('scroll', updateScrollState);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <section
      className="distillation-experiments"
      aria-labelledby="distillation-experiments-title"
    >
      <h2 id="distillation-experiments-title">LES EXPÉRIENCES RUDIMENTERRE</h2>
      <div className="distillation-experiment-scroll">
        <img
          className={`distillation-experiment-scroll__arrow distillation-experiment-scroll__arrow--left${scrollState.left ? '' : ' is-disabled'}`}
          src="/images/rudimenterre/distillation/arrow.png"
          alt=""
          aria-hidden="true"
        />
        <div
          ref={boardRef}
          className="distillation-experiment-board"
          role="region"
          aria-label="Tableau comparatif des expériences de distillation, défilement horizontal"
          tabIndex={0}
        >
          <div
            className="distillation-experiment-clocks"
            aria-label="Évolution de la cuisson de T0 à T4"
          >
            {distillationExperimentImages.clocks.map((image, index) => (
              <div className="distillation-experiment-clock" key={image}>
                <img src={`${base}/${image}`} alt={`Repère horaire T${index}`} />
                <strong>T{index}</strong>
              </div>
            ))}
          </div>
          <ExperimentRow
            title="Expérience 1"
            subtitle="avec 1 récipient à cheminée"
            images={distillationExperimentImages.first}
            labels={distillationExperimentLabels.first}
            base={base}
          />
          <ExperimentRow
            title="Expérience 2"
            subtitle="avec 2 récipients à cheminée"
            images={distillationExperimentImages.second}
            labels={distillationExperimentLabels.second}
            base={base}
            tinted
          />
        </div>
        <img
          className={`distillation-experiment-scroll__arrow distillation-experiment-scroll__arrow--right${scrollState.right ? '' : ' is-disabled'}`}
          src="/images/rudimenterre/distillation/arrow.png"
          alt=""
          aria-hidden="true"
        />
      </div>
    </section>
  );
}

function ExperimentRow({
  title,
  subtitle,
  images,
  labels,
  base,
  tinted = false,
}: {
  title: string;
  subtitle: string;
  images: string[];
  labels: Array<{
    top?: string;
    middle?: string;
    bottom?: string;
    lower?: string;
    r1?: string;
    r2?: string;
    water?: string;
  }>;
  base: string;
  tinted?: boolean;
}) {
  return (
    <div
      className={`distillation-experiment${tinted ? ' distillation-experiment--tinted' : ''}`}
    >
      <div className="distillation-experiment-row__label">
        <h3>{title}</h3>
        <p>{subtitle}</p>
      </div>
      <div className="distillation-experiment-row">
        {images.map((image, index) => (
          <div
            className="distillation-experiment-visual"
            key={image}
          >
            <div
            className={`distillation-experiment-artwork ${title === 'Expérience 1' ? 'distillation-experiment-artwork--first' : 'distillation-experiment-artwork--second'}`}
            data-step={index}
          >
              <img
                src={`${base}/${image}`}
                alt={`${title}, étape T${index}`}
                loading="lazy"
              />
              <span className="distillation-experiment-value distillation-experiment-value--top" aria-hidden="true">{labels[index].top}</span>
              <span className="distillation-experiment-value distillation-experiment-value--middle" aria-hidden="true">{labels[index].middle}</span>
              <span className="distillation-experiment-value distillation-experiment-value--bottom" aria-hidden="true">{labels[index].bottom}</span>
              <span className="distillation-experiment-value distillation-experiment-value--lower" aria-hidden="true">{labels[index].lower}</span>
              <span className="distillation-experiment-value distillation-experiment-value--r2" aria-hidden="true">{labels[index].r2}</span>
              <span className="distillation-experiment-value distillation-experiment-value--r1" aria-hidden="true">{labels[index].r1}</span>
              <span className="distillation-experiment-value distillation-experiment-value--water" aria-hidden="true">{labels[index].water}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}



export function DistillationFallbackPage(props: {content: EditorialPageContent; locale: StorefrontLocale; heroImage?: {url: string; altText?: string | null} | null}) {
  return <EditorialTemplate {...props} />;
}

/* eslint-enable jsx-a11y/no-noninteractive-tabindex */
