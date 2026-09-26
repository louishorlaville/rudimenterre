import type {EditorialPageContent} from '~/lib/editorial-content';
import type {StorefrontLocale} from '~/lib/i18n';

export function ShippingPage({content, locale, heroImage}: {
  content: EditorialPageContent;
  locale: StorefrontLocale;
  heroImage?: {url: string; altText?: string | null} | null;
}) {
  const fr = locale === 'fr';
  const titleId = 'shipping-title';
  return <article className="shipping-page">
    <header className="shipping-hero" aria-labelledby={titleId}>
      <img src={heroImage?.url || content.heroImage} alt={heroImage?.altText || (fr ? 'Cuicui et ses éléments en céramique et fibres naturelles' : 'Cuicui and its ceramic pieces and natural fibres')} />
      <div className="shipping-hero__shade" />
      <div className="shipping-hero__copy">
        <h1 id={titleId}>{content.title}{' '}<span>{fr ? 'des séries limitées' : 'of limited series'}</span></h1>
        <span>{fr ? <>L’expédition des prochains Cuicuis français se fera<br />depuis la France, conditions à venir.</> : <>Upcoming Cuicui pieces made in France will ship from France.<br />Shipping terms to follow.</>}</span>
      </div>
    </header>

    <div className="shipping-columns">
      <section className="shipping-panel shipping-panel--packing">
        <h2>{fr ? 'Emballage Rudimenterre' : 'Rudimenterre packaging'}</h2>
        <h3>{fr ? 'Les matériaux' : 'Materials'}</h3>
        {fr ? <>
          <p>L’emballage est une part complémentaire importante à notre travail, qui nous préoccupe beaucoup.</p>
          <p>Nous mettons la même attention à emballer nos poteries qu’à les fabriquer. En cohérence avec la terre, nous n’utilisons dans la mesure du possible que des matériaux naturels, zéro plastique.</p>
          <p>Les poteries doivent être parfaitement calées et ne doivent pas bouger dans le carton. Plutôt que d’acheter une tonne de matière première pour cette fonction, nous avons fait le choix d’investir dans une machine à matelasser les cartons. Ainsi, nous recyclons n’importe quel carton en un parfait calage, sans encombrer la planète davantage.</p>
          <p>Afin d’encourager le recyclage de carton, nous offrons ce service de matelassage en boutique. Nous contacter pour plus de renseignements.</p>
          <p>Pour sécuriser davantage le calage entre un récipient et son couvercle, nous intercalons entre eux un rond de fibres de coco qui, en plus de caler parfaitement la poterie, pourra vous servir comme paillage pour vos plantes en pot ! En plus de drainer parfaitement le sol, il semblerait que cette fibre fournisse un apport nutritionnel à la terre. Enfin, nous ficelons certains produits lorsque le format le permet pour les immobiliser davantage lors du transport.</p>
          <h3>Emballage expédition</h3>
          <p>Les commandes expédiées sont emballées méticuleusement dans 2 cartons gigognes. La boîte du produit est elle-même emballée dans un deuxième carton à double paroi.</p>
          <p>Nous intercalons des matelas de carton entre les 2 boîtes afin d’immobiliser le tout.</p>
        </> : <>
          <p>Packaging is an important part of our work. We take the same care in packing our pottery as we do in making it.</p>
          <p>In keeping with the material, we use natural, plastic-free materials wherever possible. Each piece is carefully secured so it cannot move in its box.</p>
          <p>Rather than buying new packing material, we invested in a machine that turns recycled cardboard into protective cushioning. We also offer this service in our shop; contact us to learn more.</p>
          <p>We place coconut-fibre pads between each vessel and its lid. They protect the pottery and can later be used as mulch for potted plants. Some pieces are tied together when their shape allows, to keep them secure in transit.</p>
          <h3>Shipping packaging</h3>
          <p>Orders are carefully packed in two nested boxes. The product box is itself protected by a second, double-wall cardboard box, with cushioning between them.</p>
        </>}
      </section>

      <section className="shipping-panel shipping-panel--rates">
        <h2>{fr ? 'Expéditions des séries limitées depuis le Canada' : 'Limited series shipped from Canada'}</h2>
        <p>{fr ? 'Comme mentionné précédemment, toutes nos poteries sont emballées avec la plus grande attention, dans des matériaux naturels. Les frais d’expédition comprennent l’emballage, la manutention et les frais postaux. Les frais postaux comprennent toujours un numéro de suivi et une assurance à hauteur de la valeur expédiée.' : 'As described above, all our pottery is carefully packed in natural materials. Shipping charges include packaging, handling and postage. Postage always includes tracking and insurance up to the value of the shipment.'}</p>
        <p>{fr ? 'Les éventuelles taxes de douane et d’importation sont à la charge de l’acheteur en fonction de son pays.' : 'Any customs or import duties are the buyer’s responsibility, depending on their country.'}</p>
        <h3>Canada</h3>
        <p>{fr ? 'La livraison est assurée par Canada Post. Les frais de livraison sont offerts pour toute commande supérieure à 350$. Pour les commandes inférieures à 350$, les frais de livraison sont calculés en fonction du poids, de la destination et de la vitesse. Nous vous envoyons le numéro de suivi par courriel dès que la commande a été traitée. Les taxes sont calculées automatiquement au moment de l’achat en fonction de la région.' : 'Delivery is handled by Canada Post. Shipping is free on orders over $350. For orders below $350, shipping is calculated according to weight, destination and speed. We email your tracking number once the order has been processed. Taxes are calculated automatically at checkout based on your region.'}</p>
        <h3>France</h3>
        <p>{fr ? <>Forfait expédition : <strong>100 €</strong><br />pour les articles disponibles en France métropolitaine<br />comprend les frais d’emballage, manutention et transport avec assurance et numéro de suivi via Canada Post<br />Payable à la commande, s’ajoute automatiquement à votre panier lors de l’achat.<br />Les taxes sont calculées automatiquement au moment de l’achat.</> : <>Flat shipping rate: <strong>€100</strong><br />for items available in mainland France<br />includes packaging, handling and insured transport with tracking via Canada Post<br />Payable at checkout and automatically added to your cart.<br />Taxes are calculated automatically at checkout.</>}</p>
        <p className="shipping-highlight">{fr ? 'Taxes françaises\nLes taxes françaises sont à payer à réception du colis, collectées directement par le facteur livreur.' : 'French taxes\nFrench taxes are payable when the parcel is delivered and collected by the carrier.'}</p>
        <p>{fr ? <><strong className="shipping-highlight">Les Cuicuis sont exonérés de droits de douanes dans le cadre des accords libre-échange CETA France/Canada.</strong> Les informations nécessaires pour bénéficier de cette exonération sont indiquées sur la facture apposée sur le colis, destinée au service des douanes (code tarifaire HS et pays d’origine).</> : <><strong className="shipping-highlight">Cuicui is exempt from customs duties under the CETA free-trade agreement between Canada and France.</strong> The parcel invoice includes the information customs need to apply this exemption (HS tariff code and country of origin).</>}</p>
        <p><strong>{fr ? 'Autres pays nous consulter' : 'For other countries, please contact us'}</strong></p>
      </section>
    </div>

    <div className="shipping-aftercare">
      <section className="shipping-returns">
        <div className="shipping-returns__copy">
          <h2>{fr ? 'Retours' : 'Returns'}</h2>
          {fr ? <p>En cas de bris à la livraison merci de nous contacter par courriel dans les 48 heures après la réception de la marchandise avec des photos de l’objet et du paquet : <a href="mailto:info@rudimenterre.com">info@rudimenterre.com</a>.<br />Selon votre préférence la commande sera remplacée ou remboursée. En dehors d’un bris occasionné lors du transport, se référer aux garanties (voir ci-contre).</p> : <p>If your order arrives damaged, please email us within 48 hours of delivery with photos of the item and packaging: <a href="mailto:info@rudimenterre.com">info@rudimenterre.com</a>.<br />At your preference, we will replace or refund the order. For damage unrelated to shipping, please see the warranty conditions.</p>}
        </div>
        <div className="shipping-returns__photo"><img src="/images/rudimenterre/shipping-return.jpeg" alt={fr ? 'Cuicui emballé avec ses protections en fibres naturelles' : 'Cuicui packed with its natural-fibre protective layers'} loading="lazy" /></div>
      </section>
      <section className="shipping-panel shipping-panel--warranty">
        <h2>{fr ? 'Garanties Rudimenterre' : 'Rudimenterre warranty'}</h2>
        <h3>{fr ? 'Garanties' : 'Warranty'}</h3>
        <p>{fr ? 'Avant de nous retourner un produit et pour éviter toute incompréhension, merci de bien vouloir lire les conditions suivantes :' : 'To avoid any misunderstanding, please read the following conditions before returning a product:'}</p>
        <h3>{fr ? 'Poteries neuves' : 'New pottery'}</h3>
        <p>{fr ? 'En cas de contestation sur la nature ou la quantité des produits reçus, vous devez nous contacter par courriel dans les 48h suivant la réception du colis avec en pièce jointe une photo de la marchandise reçue. N’hésitez pas à nous contacter par téléphone. Nous trouverons certainement une solution pour vous satisfaire.' : 'If you have a concern about the type or quantity of products received, contact us by email within 48 hours of delivery and attach a photo of the goods. Please feel free to call us; we will work with you to find a solution.'}</p>
        <h3>{fr ? 'Poteries utilisées' : 'Used pottery'}</h3>
        <p>{fr ? 'Les poteries présentant un défaut de fabrication seront échangées. Vous devez nous contacter par courriel pour expliquer le problème avec photos à l’appui. Sont évidemment exclues de cette garantie l’usure normale d’utilisation, le non-respect des consignes d’usage et d’entretien fournies avec la poterie, ainsi que les variations d’aspect et de finition inhérentes à une production artisanale.' : 'Pottery with a manufacturing defect will be exchanged. Please email us with a description of the problem and supporting photos. This warranty excludes normal wear, failure to follow the use and care instructions supplied with the pottery, and variations in appearance or finish inherent to handmade production.'}</p>
        <p>{fr ? 'Neuves ou utilisées, les poteries retournées après notre accord doivent obligatoirement être : propres, sèches, accompagnées d’une lettre explicative et de la facture d’achat, emballées précautionneusement si possible dans leur emballage d’origine en port payé. Tout envoi en port dû sera refusé. S’il s’agit d’une erreur imputable à Rudimenterre ou d’un défaut du produit, le port vous sera remboursé.' : 'Whether new or used, pottery returned with our approval must be clean and dry, include an explanatory note and proof of purchase, and be packed carefully, preferably in its original packaging. Returns must be sent postage paid; collect shipments will be refused. If the issue is our responsibility or a product defect, we will reimburse shipping.'}</p>
        <p>{fr ? 'En cas de bris occasionné en dehors de l’expédition : la céramique est un matériau qui se brise et ne peut être garanti. Nous ne pouvons prendre la responsabilité d’un bris ou d’un accident.' : 'For breakage that occurs outside shipping: ceramic can break and cannot be guaranteed against breakage. We cannot accept responsibility for breakage or accidents.'}</p>
        <p>{fr ? 'Le catalogue Rudimenterre n’est pas contractuel. Rudimenterre se réserve la possibilité de modifier la gamme des poteries référencées et leurs caractéristiques techniques.' : 'The Rudimenterre catalogue is not contractual. Rudimenterre reserves the right to change its pottery range and technical specifications.'}</p>
      </section>
    </div>

    <div className="shipping-outro">
      <p>{fr ? <>L’expédition des prochains Cuicuis fabriqués en France<br />se fera depuis la France, conditions à venir</> : <>Upcoming Cuicui pieces made in France will ship from France.<br />Shipping terms to follow.</>}</p>
    </div>
    <div className="shipping-material" role="img" aria-label={fr ? 'Détail de fibres naturelles tressées' : 'Close-up of woven natural fibres'} />
  </article>;
}
