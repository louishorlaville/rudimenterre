import type {StorefrontLocale} from '~/lib/i18n';
import '~/styles/steam.css';

const asset = (name: string) => `/images/rudimenterre/steam-${name}.webp`;

export function SteamPage({locale, heroImage}: {
  locale: StorefrontLocale;
  heroImage?: {url: string; altText?: string | null} | null;
}) {
  const fr = locale === 'fr';
  return <article className="steam-page">
    <header className="steam-hero">
      <img src={heroImage?.url || asset('banner')} alt={heroImage?.altText || ''} width="3710" height="1248" fetchPriority="high" />
      <div><h1>{fr ? 'LA VAPEUR-ÉTUVÉE' : 'STEAM-STEWING'}</h1>
        <p>{fr ? 'À LA VAPEUR C’EST MEILLEUR, À L’ÉTUVÉE, C’EST FUTÉ !' : 'BETTER WITH STEAM, SMARTER WITH STEAM-STEWING!'}</p></div>
    </header>

    <section className="steam-band steam-band--sage steam-question">
      <h2>{fr ? 'ET SI DEMAIN CHAQUE DEGRÉ ET CHAQUE GOUTTE D’EAU COMPTAIENT ?' : 'WHAT IF EVERY DEGREE AND EVERY DROP OF WATER COUNTED TOMORROW?'}</h2>
      <p>{fr ? <><strong>Pourrions-nous encore laisser mijoter un plat pendant des heures ? Ou jeter l’eau de cuisson dans l’évier avec toutes les vitamines et minéraux ?</strong> Non, évidemment. Et bien avec le Cuicui en mode vapeur-étuvée, cuisiner à l’économie d’énergie grâce à une vapeur ultra rapide, tout en préservant l’eau à 100%, c’est possible !</> : <>Could we still simmer a dish for hours, or pour cooking water and its nutrients down the drain? Cuicui’s steam-stewing method uses fast-moving steam to cook efficiently while keeping the cooking water.</>}</p>
    </section>
    <section className="steam-band steam-cycle">
      <h2>{fr ? <>LE CERCLE VERTUEUX DE<br />LA VAPEUR-ÉTUVÉE</> : <>THE VIRTUOUS CYCLE OF<br />STEAM-STEWING</>}</h2>
      <p>{fr ? <><strong>L’architecture unique du Cuicui permet entre autres,</strong> un mode de cuisson douce, à la fois ancestral et innovant :<br /><strong>la vapeur-étuvée.</strong><br />C’est l’alliance parfaite entre une <strong>cuisson vapeur traditionnelle</strong> (reconnue pour être saine) et une <strong>cuisson à l’étuvée en vase clos</strong> (qui retient l’eau des aliments, naturellement chargée en minéraux et nutriments).</> : <>Cuicui’s unique architecture combines traditional steaming with cooking in a closed vessel, retaining the food’s own juices, minerals and nutrients.</>}</p>
    </section>
    <section aria-labelledby="steam-process-title">
      <div className="steam-band steam-band--green">
        <h2 id="steam-process-title">{fr ? 'COMMENT ÇA FONCTIONNE' : 'HOW IT WORKS'}</h2>
        <p>{fr ? 'Exemple cuisson d’un mijoté légumes protéines, accompagné de riz' : 'An example: a vegetable and protein stew, served with rice'}</p>
      </div>
      <div className="steam-thirds steam-process">
        <section className="steam-panel steam-panel--blue">
          <img className="steam-process__image" src={asset('stage-1')} alt={fr ? 'Riz et liquide en haut, légumes en bas, eau dans la casserole inférieure.' : 'Rice and liquid above, vegetables below, water in the lower saucepan.'} loading="lazy" />
          <h3>{fr ? <>CE QUE<br />VOUS UTILISEZ</> : <>WHAT<br />YOU USE</>}</h3>
          {fr ? <><p>Récipient Haut<br /><strong>1 volume de riz + 1 volume liquide potable</strong><br />(eau potable ou reste de bouillon)</p><p>Récipient bas<br /><strong>Légumes, herbes, protéine, épices</strong><br />Aucun ajout de liquide</p><p>Casserole<br /><strong>Eau impure non filtrée</strong><br />sans contact avec les aliments</p></> : <><p>Upper vessel<br /><strong>1 part rice + 1 part drinking water or leftover stock</strong></p><p>Lower vessel<br /><strong>Vegetables, herbs, protein and spices</strong><br />No added liquid</p><p>Saucepan<br /><strong>Unfiltered water</strong><br />No contact with the food</p></>}
        </section>
        <section className="steam-panel steam-panel--mint">
          <img className="steam-process__image" src={asset('stage-2')} alt={fr ? 'La vapeur monte par la cheminée centrale, se condense et retombe dans les récipients.' : 'Steam rises through the central chimney and condenses inside the vessels.'} loading="lazy" />
          <h3>{fr ? <>CE QUI<br />SE PASSE</> : <>WHAT<br />HAPPENS</>}</h3>
          {fr ? <><p><strong>Une cuisson douce</strong><br />La vapeur s’élève par la cheminée centrale pour cuire indirectement les aliments en douceur<br />&lt; 100°C</p><p><strong>Une distillation intégrale</strong><br />Issue de la casserole inférieure, la vapeur pure se condense sur les parois des récipients pour être recueillie dans chacun d’eux</p><p><strong>Une infusion nutritionnelle</strong><br />Cette eau distillée se gorge des minéraux et nutriments libérés par vos aliments et concentre les saveurs</p></> : <><p><strong>Gentle cooking</strong><br />Steam rises through the central chimney, indirectly cooking the food below 100°C.</p><p><strong>Complete distillation</strong><br />Steam from the lower saucepan condenses on the vessel walls and collects in each one.</p><p><strong>A nutritional infusion</strong><br />The distilled water gathers minerals and nutrients released by the food and concentrates its flavour.</p></>}
        </section>
        <section className="steam-panel steam-panel--yellow">
          <img className="steam-process__image" src={asset('stage-3')} alt={fr ? 'Le riz est cuit, les légumes mijotent dans leur bouillon, l’eau restante reste dans la casserole.' : 'Cooked rice above, vegetables in their broth below, residual water in the saucepan.'} loading="lazy" />
          <h3>{fr ? <>CE QUE<br />VOUS RÉCOLTEZ</> : <>WHAT<br />YOU GET</>}</h3>
          {fr ? <><p>Récipient Haut<br /><strong>Un riz parfaitement cuit</strong><br />qui ne colle pas, qui n’accroche pas, qui n’est pas sec</p><p>Récipient bas<br /><strong>Un mijoté dans un savoureux bouillon<br />pur et riche</strong> des minéraux<br />et nutriments des aliments</p><p>Casserole<br /><strong>Un reste d’eau impure non filtrée</strong></p></> : <><p>Upper vessel<br /><strong>Perfectly cooked rice</strong><br />No sticking or drying out</p><p>Lower vessel<br /><strong>A stew in a flavourful broth</strong><br />Rich with the food’s minerals and nutrients</p><p>Saucepan<br /><strong>Remaining unfiltered water</strong></p></>}
        </section>
      </div>
    </section>
    <section className="steam-band steam-band--sage steam-statement">
      <h2>{fr ? 'EN RÉSUMÉ' : 'IN SUMMARY'}</h2>
      <p>{fr ? 'LE CUICUI PERMET DE PRÉSERVER L’EAU RICHE DES ALIMENTS ET L’EAU PURE DISTILLÉE ISSUE DE LA VAPEUR DE LA CASSEROLE INFÉRIEURE' : 'CUICUI PRESERVES THE FOOD’S OWN JUICES AND THE DISTILLED WATER FROM THE SAUCEPAN BELOW'}</p>
    </section>
    <section className="steam-band steam-band--gold steam-statement">
      <h2>{fr ? 'RÉSULTAT' : 'THE RESULT'}</h2>
      <p>{fr ? 'UN BOUILLON D’UNE PURETÉ ET D’UNE RICHESSE NUTRITIONNELLE EXCEPTIONNELLE, OBTENU SANS AUCUN APPORT D’EAU POTABLE EXTÉRIEUR' : 'A RICH, PURE BROTH, WITHOUT ADDING DRINKING WATER TO THE STEW'}</p>
    </section>
    <section aria-labelledby="steam-benefits-title">
      <div className="steam-band steam-band--green steam-benefits-heading">
        <h2 id="steam-benefits-title">{fr ? 'LES AVANTAGES D’UN MODE DE CUISSON VAPEUR-ÉTUVÉE' : 'THE BENEFITS OF STEAM-STEWING'}</h2>
        <p className="steam-subheading">{fr ? <>PRÉSERVATION ET PURIFICATION<br />AVEC LE MINIMUM D’EAU POTABLE ET D’ÉNERGIE</> : <>PRESERVATION AND PURIFICATION<br />WITH LESS DRINKING WATER AND ENERGY</>}</p>
      </div>
      <div className="steam-thirds steam-benefits">
        <section className="steam-panel steam-panel--yellow"><img src={asset('benefit-flavour')} alt="" loading="lazy" /><h3>{fr ? <>DES PLATS SAINS<br />ET SAVOUREUX</> : <>HEALTHY,<br />FLAVOURFUL FOOD</>}</h3><p>{fr ? <><strong>Cuisson douce &lt; 100°C</strong><br />Un bouillon doublement vertueux :<br /><strong>les minéraux des aliments</strong> sont préservés et sublimés par <strong>l’eau pure distillée</strong></> : <>Gentle cooking below 100°C. The food’s minerals are preserved in a broth enriched with distilled water.</>}</p></section>
        <section className="steam-panel steam-panel--mint"><img src={asset('benefit-time')} alt="" loading="lazy" /><h3>{fr ? <>UNE CUISSON RAPIDE<br />EFFICACE</> : <>FAST, EFFICIENT<br />COOKING</>}</h3><p>{fr ? <>Vos plats mijotent <strong>à la vitesse de la vapeur,</strong> soit beaucoup plus vite que dans un faitout traditionnel !</> : <>Your dishes simmer at the speed of steam, faster than in a traditional cooking pot.</>}</p></section>
        <section className="steam-panel steam-panel--seafoam"><img src={asset('benefit-autonomy')} alt="" loading="lazy" /><h3>{fr ? <>UNE VRAIE<br />AUTONOMIE</> : <>REAL<br />AUTONOMY</>}</h3><p>{fr ? <><strong>Moins d’énergie</strong> consommée<br /><strong>Zéro eau potable</strong> gaspillée<br /><strong>Zéro surveillance :</strong><br />en cuisson indirecte, aucun risque d’accrocher ou de brûler</> : <>Less energy consumed.<br />No drinking water wasted.<br />Indirect cooking prevents food from sticking or burning.</>}</p></section>
      </div>
    </section>
    <img className="steam-photo" src={asset('rice-banner')} width="3662" height="1324" alt={fr ? 'Riz cuit dans le Cuicui, couvercle soulevé.' : 'Freshly cooked rice inside a Cuicui.'} loading="lazy" />
    <section aria-labelledby="steam-preparations-title">
      <div className="steam-band steam-band--forest steam-preparations-heading"><h2 id="steam-preparations-title">{fr ? 'POUR QUELS TYPES DE PRÉPARATION' : 'WHAT CAN YOU COOK?'}</h2><p className="steam-subheading">{fr ? 'POUR TOUTES LES PRÉPARATIONS HUMIDES' : 'FOR ALL MOIST DISHES'}</p></div>
      <div className="steam-halves steam-preparations">
        <section className="steam-panel steam-panel--orange"><h3>{fr ? <>LES MIJOTÉS<br />ET RAGOÛTS FONDANTS</> : <>SLOW-COOKED DISHES<br />AND TENDER STEWS</>}</h3><p>{fr ? <>Blanquettes, potées<br />sans jamais attacher, les aliments cuisent dans leur propre jus avec pour seule compagnie des herbes aux parfums fragiles et une eau bienfaisante distillée par évaporation</> : <>Stews and casseroles cook in their own juices without sticking, accompanied by delicate herbs and water distilled by evaporation.</>}</p></section>
        <section className="steam-panel steam-panel--sage"><h3>{fr ? <>LES SOUPES<br />ET BOUILLONS CONCENTRÉS</> : <>SOUPS<br />AND CONCENTRATED BROTHS</>}</h3><p>{fr ? <>Potages, veloutés, bouillons de légumes…<br />l’eau pure distillée recueille les vitamines et les minéraux libérés par les aliments en vase clos, créant une base de liquide d’une richesse exceptionnelle, sans aucune perte</> : <>Soups and vegetable broths: distilled water gathers the vitamins and minerals released by food in the closed vessel, creating a rich liquid base.</>}</p></section>
        <section className="steam-panel steam-panel--yellow"><h3>{fr ? <>LES PURÉES ET ÉCRASÉS<br />PARFAITS</> : <>PERFECT PURÉES<br />AND MASHES</>}</h3><p>{fr ? <>Purée de pomme de terre, carotte, courges… Plus besoin d’ajouter de liquide : l’eau distillée par le Cuicui suffit à obtenir une texture idéale en préservant tout le goût du légume</> : <>Potatoes, carrots, squash… Water distilled by Cuicui creates the ideal texture without added liquid, preserving the vegetable’s flavour.</>}</p></section>
        <section className="steam-panel steam-panel--blue"><h3>{fr ? <>TOUTES LES CUISSONS<br />PAR ABSORPTION</> : <>ALL ABSORPTION<br />COOKING</>}</h3><p>{fr ? <>Riz, sarrasin, quinoa, pâtes façon risotto ou avec un fond de bouillon, lentilles, protéines végétales texturées… les ingrédients secs s’imbibent d’une eau pure et d’un bouillon aromatique hautement assimilable</> : <>Rice, buckwheat, quinoa, risotto-style pasta, lentils and textured vegetable protein absorb pure water and aromatic broth.</>}</p></section>
      </div>
    </section>
    <img className="steam-photo" src={asset('soup-banner')} width="3998" height="1090" alt={fr ? 'Un velouté de légumes dans son Cuicui.' : 'A smooth vegetable soup in a Cuicui.'} loading="lazy" />
    <section aria-labelledby="steam-modes-title">
      <div className="steam-band steam-band--green steam-modes-heading"><h2 id="steam-modes-title">{fr ? 'LA MODULARITÉ RUDIMENTERRE DE LA VAPEUR-ÉTUVÉE AU CUICUI' : 'CUICUI’S MODULAR COOKING METHODS'}</h2><p className="steam-subheading">{fr ? '3 MODES DE CUISSON EN 1 SEUL INSTRUMENT' : '3 COOKING METHODS IN 1 INSTRUMENT'}</p><p>{fr ? 'Le Cuicui s’adapte à toutes vos envies culinaires en un tour de main' : 'Cuicui adapts to your culinary ideas in a moment'}</p></div>
      <div className="steam-halves steam-modes">
        <section className="steam-panel steam-panel--seafoam"><h3>{fr ? 'LA CUISSON BAIN-MARIE' : 'BAIN-MARIE COOKING'}</h3><img className="steam-mode__image" src={asset('bain-marie')} alt={fr ? 'Un bouchon ferme la cheminée du récipient supérieur pour la cuisson bain-marie.' : 'A cork closes the upper vessel’s chimney for bain-marie cooking.'} loading="lazy" />
          <h4>{fr ? 'Comment faire ?' : 'How does it work?'}</h4><p>{fr ? 'Juste boucher la cheminée centrale du récipient avec le bouchon en liège' : 'Simply close the vessel’s central chimney with the cork stopper.'}</p>
          <h4>{fr ? 'Pour faire quoi ?' : 'What can you make?'}</h4><p>{fr ? <>Réchauffer un plat en douceur pendant une nouvelle cuisson<br />Faire fondre doucement du chocolat<br />Réussir une sauce délicate sans risque de la brûler<br />…<br /><strong className="steam-emphasis">Et tout ça en profitant de l’énergie d’une autre cuisson en dessous !</strong></> : <>Gently reheat a dish while cooking another.<br />Melt chocolate or prepare a delicate sauce.<br /><strong>All using the energy of another dish cooking below!</strong></>}</p>
          <p className="steam-note">{fr ? <><strong>Important :</strong> dans le cas d’une cuisson étagée avec plusieurs récipients, placez toujours le récipient bouché tout en haut (au top) afin de ne pas obstruer la circulation de la vapeur vers les niveaux supérieurs</> : <><strong>Important:</strong> when stacking vessels, always put the stoppered vessel at the very top so it does not block steam from reaching the upper levels.</>}</p>
        </section>
        <section className="steam-panel steam-panel--blue"><h3>{fr ? <>LA CUISSON VAPEUR<br />TRADITIONNELLE<br />ZÉRO GASPI</> : <>TRADITIONAL<br />ZERO-WASTE<br />STEAMING</>}</h3><img className="steam-mode__image" src={asset('traditional')} alt={fr ? 'Incliner le Cuicui avec son couvercle pour recueillir le bouillon dans un bol.' : 'Tilt the covered Cuicui to collect the broth in a bowl.'} loading="lazy" />
          <h4>{fr ? 'Comment faire ?' : 'How does it work?'}</h4><p>{fr ? <>Placez vos aliments bruts (chou-fleur, pommes de terre…) dans le récipient. Une fois la cuisson terminée, il vous suffit de basculer le récipient avec le couvercle pour vider l’eau pure distillée chargée des minéraux et nutriments des aliments accumulée au fond.</> : <>Place raw ingredients such as cauliflower or potatoes in the vessel. After cooking, tilt it with the lid in place to pour out the distilled water and nutrients collected at the bottom.</>}</p>
          <h4>{fr ? 'Le plus zéro gaspi :' : 'The zero-waste bonus:'}</h4><p>{fr ? <>Ne jetez pas cette eau à l’évier !<br />Réservez-la précieusement : c’est une excellente base déjà chaude de bouillon propre pour une autre préparation<br />(sauce blanche…)</> : <>Keep that cooking water! It is an excellent, already-hot broth base for another recipe, such as a white sauce.</>}</p>
        </section>
      </div>
    </section>
    <div className="steam-band steam-band--forest steam-closing"><p>{fr ? <>ALORS NE LAISSEZ PLUS LA VAPEUR ET LA CHALEUR ENVAHIR VOTRE CUISINE !<br />DIRIGEZ VOTRE CUICUI POUR UNE CUISSON ZÉRO GASPI</> : <>KEEP STEAM AND HEAT WORKING FOR YOU!<br />PUT YOUR CUICUI TO WORK FOR ZERO-WASTE COOKING</>}</p></div>
    <img className="steam-photo" src={asset('bottom-banner')} width="4136" height="1280" alt={fr ? 'Un repas complet de légumes, céréales et mijotés servi dans les Cuicuis.' : 'A complete meal of vegetables, grains and stews served in Cuicui vessels.'} loading="lazy" />
  </article>;
}
