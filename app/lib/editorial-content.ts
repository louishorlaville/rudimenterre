import type {StorefrontLocale} from './i18n';

export type EditorialPageId =
  | 'project' | 'steam' | 'garden' | 'making' | 'thermal'
  | 'distillation' | 'creator' | 'jury' | 'adopt' | 'shipping';

export type EditorialSection = {
  title: string;
  body: string;
  tone?: 'cream' | 'green' | 'orange' | 'blue' | 'white';
  image?: string;
  imageAlt?: string;
  bullets?: string[];
};

export type EditorialPageContent = {
  id: EditorialPageId;
  eyebrow: string;
  title: string;
  intro: string;
  seoDescription: string;
  heroImage: string;
  heroPosition?: string;
  sections: EditorialSection[];
};

export const PAGE_SLUGS: Record<EditorialPageId, Record<StorefrontLocale, string>> = {
  project: {fr: 'projet-rudimenterre', en: 'rudimenterre-project'},
  steam: {fr: 'vapeur-etuvee', en: 'steam-cooking'},
  garden: {fr: 'potager', en: 'kitchen-garden'},
  making: {fr: 'fabrication-et-entretien', en: 'making-and-care'},
  thermal: {fr: 'experience-thermique', en: 'thermal-experiments'},
  distillation: {fr: 'experience-distillation', en: 'distillation-experiments'},
  creator: {fr: 'la-recette-rudimenterre', en: 'the-rudimenterre-recipe'},
  jury: {fr: 'jury', en: 'awards'},
  adopt: {fr: 'adoptez', en: 'adopt'},
  shipping: {fr: 'tarifs-livraison-garanties', en: 'pricing-shipping-warranty'},
};

const img = (name: string) => `/images/rudimenterre/${name}`;

const FR: Record<EditorialPageId, EditorialPageContent> = {
  project: {id:'project', eyebrow:'Le projet', title:'Le projet Rudimenterre', intro:'Un Cuicui made in France', seoDescription:'Le projet Rudimenterre et son relais de cuissons saines et durables.', heroImage:img('project.webp'), sections:[
    {title:'Le projet', body:'Imaginé au Canada, après 3 ans de recherche et de fabrication pour tester le marché, l’intérêt que suscite le Cuicui montre que ce nouveau Potager-là nous sourit.', tone:'white'},
    {title:'Le concept', body:'Rudimenterre incarne dans une vision futuriste et visionnaire un objet et une solution simple pour redonner sens et goût à notre alimentation : le Cuicui.', tone:'cream'},
    {title:'La créatrice', body:'Carole Briet, créatrice du Cuicui Rudimenterre, est passionnée par la céramique et les pratiques culinaires autonomes, économes et durables.', tone:'cream'},
  ]},
  steam: {id:'steam', eyebrow:'Mode de cuisson', title:'La vapeur-étuvée', intro:'À la vapeur c’est meilleur, à l’étuvée… c’est le meilleur.', seoDescription:'Découvrez la vapeur-étuvée et le cercle vertueux du Cuicui.', heroImage:img('steam-hero.webp'), sections:[
    {title:'Le cercle vertueux de la vapeur-étuvée', body:'L’architecture unique du Cuicui permet entre autres un mode de cuisson douce, à la fois savoureux et innovant : la vapeur-étuvée.', tone:'cream'},
    {title:'Comment ça fonctionne', body:'Le Cuicui est un relais de cuissons qui permet à la vapeur de circuler, de cuire doucement les aliments et de préserver leurs saveurs.', image:img('steam-rice.webp'), imageAlt:'Riz cuit dans un Cuicui', tone:'green'},
    {title:'Les avantages', body:'Une cuisson douce, rapide et savoureuse, avec moins d’eau potable et d’énergie.', bullets:['Des plats sains et savoureux','Une cuisson rapide et efficace','Une vraie autonomie'], tone:'cream'},
    {title:'Pour quels types de préparation', body:'Mijotés, ragoûts fondants, soupes, bouillons concentrés, purées, écrasés et cuissons par absorption.', image:img('steam-food.webp'), imageAlt:'Différentes préparations au Cuicui', tone:'green'},
  ]},
  garden: {id:'garden', eyebrow:'Visite guidée', title:'Le potager médiéval revisité', intro:'Connaissez-vous la signification d’un potager en cuisine ?', seoDescription:'Du potager médiéval au Cuicui, retrouvez l’intelligence des flux.', heroImage:img('garden-cards.webp'), sections:[
    {title:'Bienvenue dans la cuisine du futur', body:'Le Cuicui permet, comme un potager médiéval, de redéployer des techniques de cuissons solidaires. Plus pratique et mobile, il réduit les dépendances énergétiques et hydriques.', tone:'cream'},
    {title:'Un seul feu pour tout cuisiner', body:'Le Cuicui déposé sur une casserole d’eau permet de cuire plusieurs préparations sur une seule source de chaleur.', image:img('garden-hero.webp'), imageAlt:'Repas préparé avec le Cuicui', tone:'orange'},
    {title:'La fraternité des cuissons Rudimenterre', body:'L’architecture du Cuicui organise la circulation des flux thermiques et de vapeur entre chaque récipient superposé.', image:img('garden-food.webp'), imageAlt:'Cuicui, pain et plat cuisiné', tone:'orange'},
  ]},
  making: {id:'making', eyebrow:'Matière', title:'Fabrication et entretien', intro:'Une fabrication attentive pour un objet appelé à durer.', seoDescription:'Matière, fabrication, garanties et entretien du Cuicui.', heroImage:img('making.webp'), sections:[
    {title:'Matière', body:'Argile naturelle, intérieur grès brut, extérieur émaillé garantissant une étanchéité totale de toutes les surfaces en contact alimentaire.', tone:'white'},
    {title:'Fabrication', body:'Les premiers Cuicuis canadiens ont été fabriqués artisanalement dans l’atelier Rudimenterre à Montréal. La production française sera réalisée à la main dans une manufacture au savoir-faire historique.', tone:'cream'},
    {title:'Utilisation et entretien', body:'Lave-vaisselle, four traditionnel, cuisson indirecte sur casserole d’eau et frigidaire. Éviter les chocs thermiques et utiliser de préférence des ustensiles en bois.', tone:'blue'},
  ]},
  thermal: {id:'thermal', eyebrow:'Moins d’énergie, plus d’autonomie', title:'Expériences thermiques', intro:'Et si demain la cuisson des aliments demandait moins d’énergie ?', seoDescription:'Les expériences thermiques du Cuicui et la cuisson à feu éteint.', heroImage:img('thermal-hero.webp'), sections:[
    {title:'Le principe', body:'Mutualiser les cuissons et utiliser l’inertie thermique de la terre cuite. La température plafonne à 95°C en cuisson douce et continue à cuire feu éteint.', image:img('thermal-diagram.webp'), imageAlt:'Schéma thermique du Cuicui', tone:'cream'},
    {title:'Je planifie et je mutualise', body:'Je compose mes menus de la semaine, j’organise mes cuissons pour penser à les mutualiser et je cuis plusieurs préparations en même temps sur un seul feu.', tone:'cream'},
    {title:'Je finis la cuisson feu éteint', body:'L’inertie thermique de la terre cuite me permet de finir la cuisson feu éteint comme une marmite norvégienne.', tone:'orange'},
    {title:'Je ne préchauffe pas', body:'J’allume tout juste. Le récipient monte en température progressivement et commence à cuire dès le début.', tone:'cream'},
  ]},
  distillation: {id:'distillation', eyebrow:'Moins d’eau potable, plus d’autonomie', title:'Expériences distillation', intro:'Et si demain l’eau ne coulait plus par magie du robinet ?', seoDescription:'Le principe et les expériences de distillation d’eau avec le Cuicui.', heroImage:img('distillation-hero.webp'), sections:[
    {title:'Le principe : distiller l’eau pour cuire et purifier', body:'L’architecture du Cuicui utilise un principe physique simple : la distillation par évaporation et condensation.', image:img('distillation-diagram.webp'), imageAlt:'Schéma de distillation du Cuicui', tone:'white'},
    {title:'Autonomie totale', body:'Eau non filtrée, eau non potable : le Cuicui permet de cuisiner en circuit fermé et de récupérer une eau distillée.', tone:'blue'},
    {title:'Les résultats en une heure de cuisson', body:'Chaque goutte d’eau pure est précieuse. Ces tests documentent la quantité distillée et le comportement des récipients.', tone:'green'},
    {title:'Les expériences Rudimenterre', body:'Ce n’est pas de la magie, c’est de la physique.', image:img('distillation-experiments.webp'), imageAlt:'Tableau des expériences de distillation', tone:'blue'},
  ]},
  creator: {id:'creator', eyebrow:'L’attention, l’observation, le partage', title:'La recette Rudimenterre', intro:'La créatrice du Cuicui, Carole Briet, vous parle…', seoDescription:'Carole Briet raconte la recette et l’histoire du Cuicui.', heroImage:img('recipe-hero.webp'), sections:[
    {title:'Pour ma famille puis pour vous', body:'Tout a commencé simplement dans une cuisine. Une recherche patiente autour de la terre cuite, de la chaleur, des gestes et de la transmission.', image:img('recipe-carole.webp'), imageAlt:'Carole Briet en cuisine', tone:'cream'},
    {title:'Une recherche par l’usage', body:'À chaque étape, il a fallu observer, mesurer, recommencer et partager. Le Cuicui est né de cette méthode attentive et collective.', image:img('recipe-cuicui.webp'), imageAlt:'Carole Briet présentant le Cuicui', tone:'cream'},
    {title:'Le carnet de recettes', body:'Rudimenterre propose un carnet de recettes pour découvrir la méthode économe du Cuicui.', image:img('recipe-book.webp'), imageAlt:'Carnet de recettes Rudimenterre', tone:'white'},
  ]},
  jury: {id:'jury', eyebrow:'Mention du jury', title:'Le Cuicui récompensé', intro:'17e Grand Prix International du Design — 2024', seoDescription:'Le Cuicui, lauréat Platine aux Grands Prix du Design.', heroImage:img('jury-hero.webp'), sections:[
    {title:'Lauréat Platine', body:'Grands Prix du Design 2024 — catégorie design de produit, appareil de cuisine.', image:img('jury-feature.webp'), imageAlt:'Présentation du prix du Cuicui', tone:'cream'},
    {title:'Le jury a conclu', body:'On revient à l’essence-même de l’art de cuisiner avec cet outil culinaire dessiné avec ingéniosité et vision d’un avenir soutenable, solidaire et désirable.', tone:'cream'},
  ]},
  adopt: {id:'adopt', eyebrow:'Vous avez le choix', title:'Adoptez', intro:'Un Cuicui, un nouveau mode de cuisiner savoureux et bienfaisant.', seoDescription:'Adoptez le Cuicui et choisissez votre kit.', heroImage:img('adopt-hero.webp'), sections:[
    {title:'Une édition limitée', body:'Un objet de céramique Cuicui fabriqué artisanalement en faïence au Canada en attendant la production française.', image:img('adopt-options.webp'), imageAlt:'Les options de Cuicui', tone:'cream'},
    {title:'Du kit vital aux modules complémentaires', body:'Faites Cuicui français. Le kit vital réunit les éléments indispensables; les modules complémentaires enrichissent les usages.', image:img('adopt-kit.webp'), imageAlt:'Le kit vital du Cuicui', tone:'green'},
  ]},
  shipping: {id:'shipping', eyebrow:'Des séries limitées', title:'Tarifs livraisons garanties', intro:'Expéditions prochaines séries fabriquées en France.', seoDescription:'Informations sur les emballages, livraisons, retours et garanties Rudimenterre.', heroImage:img('shipping.webp'), sections:[
    {title:'Emballage Rudimenterre', body:'Un emballage recyclable et protecteur est essentiel à la livraison de pièces en céramique. Chaque élément est soigneusement calé.', tone:'cream'},
    {title:'Expéditions', body:'Les frais, taxes et délais dépendent de la destination. Les montants définitifs sont confirmés avant la commande.', tone:'white'},
    {title:'Retours', body:'Contactez Rudimenterre avant tout retour afin de recevoir les informations nécessaires.', tone:'cream'},
    {title:'Garanties', body:'Les poteries présentant un défaut de fabrication sont remplacées. La céramique reste un matériau fragile et doit être manipulée avec soin.', tone:'blue'},
  ]},
};

const EN_OVERRIDES: Record<EditorialPageId, Pick<EditorialPageContent,'eyebrow'|'title'|'intro'|'seoDescription'>> = {
  project:{eyebrow:'The project',title:'The Rudimenterre project',intro:'A Cuicui made in France',seoDescription:'The Rudimenterre project and its healthy, sustainable cooking relay.'},
  steam:{eyebrow:'Cooking method',title:'Steam cooking',intro:'Gentle steam, flavour and intelligent water use.',seoDescription:'Discover the Cuicui steam-cooking cycle.'},
  garden:{eyebrow:'Guided visit',title:'The medieval kitchen garden revisited',intro:'What did a kitchen garden once mean?',seoDescription:'From the medieval kitchen garden to Cuicui.'},
  making:{eyebrow:'Material',title:'Making and care',intro:'Thoughtful making for an object designed to last.',seoDescription:'Material, making, warranty and care for Cuicui.'},
  thermal:{eyebrow:'Less energy, more autonomy',title:'Thermal experiments',intro:'What if cooking required less energy tomorrow?',seoDescription:'Cuicui thermal experiments and retained-heat cooking.'},
  distillation:{eyebrow:'Less drinking water, more autonomy',title:'Distillation experiments',intro:'What if water no longer flowed magically from the tap?',seoDescription:'Water distillation principles and Cuicui experiments.'},
  creator:{eyebrow:'Attention, observation, sharing',title:'The Rudimenterre recipe',intro:'Cuicui creator Carole Briet tells the story.',seoDescription:'Carole Briet tells the story behind Cuicui.'},
  jury:{eyebrow:'Jury mention',title:'Award-winning Cuicui',intro:'17th International Grand Prix du Design — 2024',seoDescription:'Cuicui, Platinum winner at the Grands Prix du Design.'},
  adopt:{eyebrow:'The choice is yours',title:'Adopt',intro:'A Cuicui, a new, flavourful and beneficial way of cooking.',seoDescription:'Adopt Cuicui and choose your kit.'},
  shipping:{eyebrow:'Limited series',title:'Pricing, shipping and warranty',intro:'Upcoming series made in France.',seoDescription:'Rudimenterre packaging, shipping, returns and warranty.'},
};

const EN_SECTIONS: Record<EditorialPageId, Array<{title:string;body:string;bullets?:string[]}>> = {
  project:[
    {title:'The project',body:'Imagined in Canada after three years of research and prototyping, Cuicui is now preparing for a new chapter made in France.'},
    {title:'The concept',body:'Rudimenterre offers a simple, forward-looking way to bring meaning and pleasure back to everyday food.'},
    {title:'The creator',body:'Carole Briet explores ceramics and autonomous, economical and sustainable cooking practices.'},
  ],
  steam:[
    {title:'The virtuous steam cycle',body:'Cuicui’s unique architecture enables a gentle cooking method that is both flavourful and inventive.'},
    {title:'How it works',body:'Steam circulates through the stacked vessels, gently cooking food while preserving flavour.'},
    {title:'The benefits',body:'Gentle, fast and flavourful cooking with less drinking water and energy.',bullets:['Healthy, flavourful dishes','Fast, efficient cooking','Real autonomy']},
    {title:'What can it prepare?',body:'Stews, concentrated soups and broths, purées, mash and absorption cooking.'},
  ],
  garden:[
    {title:'Welcome to the kitchen of the future',body:'Like a medieval kitchen garden, Cuicui brings cooperative cooking techniques back into a practical, mobile format.'},
    {title:'One heat source for everything',body:'Placed over one pot of water, Cuicui cooks several preparations with a single heat source.'},
    {title:'Rudimenterre’s cooperative cooking',body:'Its architecture organises the movement of heat and steam between each stacked vessel.'},
  ],
  making:[
    {title:'Material',body:'Natural clay, raw stoneware interior and a glazed exterior make every food-contact surface watertight.'},
    {title:'Making',body:'The first Canadian Cuicuis were handmade in Montréal. French production will continue by hand with a historic manufacturer.'},
    {title:'Use and care',body:'Dishwasher, conventional oven, indirect cooking over water and refrigerator. Avoid thermal shock and favour wooden utensils.'},
  ],
  thermal:[
    {title:'The principle',body:'Combine cooking tasks and use clay’s thermal inertia. Gentle cooking peaks around 95°C and continues after the heat is switched off.'},
    {title:'Plan and combine',body:'Plan meals and cook several preparations together over a single heat source.'},
    {title:'Finish with the heat off',body:'Clay retains heat and allows cooking to continue like a retained-heat cooker.'},
    {title:'No preheating',body:'The vessel warms progressively and starts cooking from the beginning.'},
  ],
  distillation:[
    {title:'Distil water to cook and purify',body:'Cuicui uses a simple physical principle: distillation through evaporation and condensation.'},
    {title:'Total autonomy',body:'Unfiltered or non-potable water can be used in a closed loop while distilled water is recovered.'},
    {title:'Results after one hour',body:'Every drop matters. These tests document distilled volume and vessel behaviour.'},
    {title:'Rudimenterre experiments',body:'It is not magic. It is physics.'},
  ],
  creator:[
    {title:'For my family, then for you',body:'It began simply in a kitchen, with patient research into clay, heat, gestures and knowledge sharing.'},
    {title:'Research through use',body:'Each step required observation, measurement, repetition and sharing. Cuicui grew from this attentive, collective method.'},
    {title:'The recipe book',body:'Rudimenterre offers a recipe book for discovering Cuicui’s economical cooking method.'},
  ],
  jury:[
    {title:'Platinum winner',body:'2024 Grands Prix du Design — product design, kitchen appliance category.'},
    {title:'The jury concluded',body:'This ingenious culinary tool returns to the essence of cooking while imagining a sustainable, cooperative and desirable future.'},
  ],
  adopt:[
    {title:'A limited edition',body:'A ceramic Cuicui handmade in Canada while French production is being prepared.'},
    {title:'From the vital kit to extra modules',body:'The vital kit contains the essentials; complementary modules extend the range of uses.'},
  ],
  shipping:[
    {title:'Rudimenterre packaging',body:'Protective, recyclable packaging is essential for shipping ceramics. Every piece is carefully secured.'},
    {title:'Shipping',body:'Costs, taxes and delivery times depend on destination and are confirmed before ordering.'},
    {title:'Returns',body:'Contact Rudimenterre before returning anything so the team can provide the required instructions.'},
    {title:'Warranty',body:'Manufacturing defects are covered. Ceramic remains fragile and must be handled with care.'},
  ],
};

export function getContent(id: EditorialPageId, locale: StorefrontLocale) {
  if (locale === 'fr') return FR[id];
  const base = FR[id];
  return {...base, ...EN_OVERRIDES[id], sections: base.sections.map((section,index) => ({...section,...EN_SECTIONS[id][index]}))};
}

export function getPageBySlug(locale: StorefrontLocale, slug: string) {
  const id = (Object.keys(PAGE_SLUGS) as EditorialPageId[]).find((key) => PAGE_SLUGS[key][locale] === slug);
  return id ? getContent(id, locale) : null;
}
export const pagePath = (locale: StorefrontLocale, id: EditorialPageId) => `/${locale}/${PAGE_SLUGS[id][locale]}`;
export const alternatePagePath = (locale: StorefrontLocale, id: EditorialPageId) => pagePath(locale === 'fr' ? 'en' : 'fr', id);
export function localizedPath(pathname: string, target: StorefrontLocale) {
  const parts = pathname.split('/').filter(Boolean);
  const current: StorefrontLocale = parts[0] === 'en' ? 'en' : 'fr';
  const page = parts[1] ? getPageBySlug(current, parts[1]) : null;
  if (page) return pagePath(target, page.id);
  return parts.length <= 1 ? `/${target}` : `/${target}/${parts.slice(1).join('/')}`;
}
export const UI_COPY = {
  fr:{menu:'Menu',close:'Fermer',account:'Compte',signIn:'Connexion',cart:'Panier',home:'Accueil',adopt:'Adoptez',project:'Le projet',explore:'En cuisine',skip:'Aller au contenu',newsletter:'Rester en contact',privacy:'Confidentialité'},
  en:{menu:'Menu',close:'Close',account:'Account',signIn:'Sign in',cart:'Cart',home:'Home',adopt:'Adopt',project:'The project',explore:'In the kitchen',skip:'Skip to content',newsletter:'Stay in touch',privacy:'Privacy'},
} as const;
