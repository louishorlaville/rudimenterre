import type {StorefrontLocale} from '~/lib/i18n';
import {recipeStoryFr} from '~/lib/recipe-story';
import '~/styles/recipe.css';

const recipeStoryEn = [
  'For my family, then for you, I learned to cook all over again.',
  'Like you, I was rather puzzled by my first Cuicui, pictured here, still warm from the workshop. I had found a Chinese soup recipe using an ancestral cooking method: steam-stewing. Intrigued, I made a vessel to try it. With my clay pot in hand, I finally made the recipe and found the cooking principle so wonderful that I wanted to cook everything with it!',
  'Patrick, one of my sons, saw this strange new bird nesting in our kitchen and soon gave it the name “Cuicui”.',
  'Following a recipe written for this cooking method was easy. Adapting our other family recipes to Cuicui was something new…',
  'I started with my stained, patched-up cookbook. Armed with a measuring cup, thermometer, fresh notebook and plenty of ingredients, I tried adapting simple recipes every day. I began with rice, a family favourite: one measure of rice with 1.5 measures of water, as in an ordinary casserole. I covered it and counted the minutes. There was far too much water. After 20 minutes, the rice was still uncooked and floating.',
  'On my second attempt, I used 1.25 measures of water. Better, but some water remained unless I extended the cooking time. After several more mistakes, I tried just one measure. Wonderful: perfect rice, no standing water, neither dry nor sticky, with the grains standing upright! I later discovered this was the sign of perfect cooking, with steam circulating between every grain. I concluded that one measure of rice needed one measure of drinking water, with the cooking time adjusted to the grain: 30 minutes for basmati.',
  'As I experimented with vegetables and stews, I measured the broth Cuicui produced by itself. I tried rice again, replacing drinking water with tasty broth saved from a previous meal. Success! A note for later: organise cooking to connect meals rather than isolate them.',
  'I began to see all the possibilities of this vessel. That was when I started developing other features to make it more versatile, effective and agile.',
  'Every idea required a new prototype, followed by kitchen experiments. Every recipe brought surprises and adjustments, especially when I began stacking the vessels!',
  'On the second level, there was more juice than expected. I repeated the stew without adding water, noting how broth depended on cooking time and the vessel’s position. Sometimes I left the lid’s chimney open, but then there was too little juice: remember to close it during cooking to retain the distilled water! Potatoes cooked alone left water in the bottom: fantastic! Even cooking a plain ingredient as on a steaming rack yielded pure distilled water to save for a sauce. Another time, a dish prepared ahead and left on the table was still hot an hour later. Precise temperature readings showed that cooking continued with the heat off. More experiments were needed to adjust cooking times for a passive finish…',
  'As my experiments progressed, my notebooks piled up and my shelves emptied! I used fewer and fewer utensils, gradually putting them away in the cupboard.',
  'After hesitant beginnings, my results steadily improved until I understood how flows circulate in this ingenious system. Although I have not yet explored Cuicui’s full potential, I offer you the results of my trials and reflections on this healthy, sustainable way of cooking that makes the most of our resources.',
  'Here is a Rudimenterre recipe book, with every recipe tried dozens of times for family approval…',
  'You will not find brand-new recipes here. You probably know these simple everyday dishes already. I have adapted them to meet a need of our time: greater independence in the kitchen.',
  'I wrote these recipes to help you understand Cuicui’s method and logic and make it your own, rather than simply follow instructions.',
  'The idea is for you to adapt your own family recipes to this new way of organising cooking, freeing us with common sense from the constraints of our time.',
  'Enjoy your meal, everyone!',
];

export function RecipePage({locale, heroImage}: {
  locale: StorefrontLocale;
  heroImage?: {url: string; altText?: string | null} | null;
}) {
  const fr = locale === 'fr';
  const story = fr ? recipeStoryFr : recipeStoryEn;
  const paragraphs = (start: number, end: number) => story.slice(start, end).map((text) => <p key={text}>{text}</p>);
  return <article className="recipe-page">
    <header className="recipe-hero">
      <img src={heroImage?.url || '/images/rudimenterre/recipe-banner.webp'} alt={heroImage?.altText || (fr ? 'Carole Briet entourée de sa famille' : 'Carole Briet with her family')} width="2000" height="898" fetchPriority="high" />
      <div className="recipe-hero__heading">
        <h1>{fr ? 'La recette Rudimenterre' : 'The Rudimenterre recipe'}</h1>
        <p>{fr ? 'L’attention, l’observation, le partage' : 'Attention, observation, sharing'}</p>
      </div>
    </header>
    <section className="recipe-story" aria-labelledby="recipe-story-title">
      <h2 id="recipe-story-title">{fr ? <>La créatrice du Cuicui<br />Carole Briet vous parle…</> : <>The creator of Cuicui<br />Carole Briet tells her story…</>}</h2>
      <div className="recipe-story__opening">
        <div className="recipe-story__copy">{paragraphs(0, 5)}</div>
        <img src="/images/rudimenterre/recipe-first.webp" alt={fr ? 'Carole dans sa cuisine avec son premier Cuicui' : 'Carole in her kitchen with her first Cuicui'} width="1093" height="1640" loading="lazy" />
      </div>
      <div className="recipe-story__continuation">
        <div>
          <div className="recipe-story__copy">{paragraphs(5, 8)}</div>
          <img className="recipe-story__stack" src="/images/rudimenterre/recipe-stack.webp" alt={fr ? 'Carole empile les récipients en terre cuite du Cuicui' : 'Carole stacks Cuicui’s terracotta vessels'} width="1200" height="1800" loading="lazy" />
        </div>
        <div className="recipe-story__copy">
          {paragraphs(8, 16)}
          <div className="recipe-signoff"><p>{story[16]}</p><img src="/images/rudimenterre/recipe-signature.png" alt={fr ? 'Signature de Carole' : 'Carole’s signature'} loading="lazy" /></div>
        </div>
      </div>
    </section>
    <section className="recipe-book" aria-label={fr ? 'Le carnet de recettes' : 'The recipe book'}>
      <div className="recipe-book__inner">
        <div className="recipe-book__copy">
          <p>{fr ? <>Le carnet de recettes Rudimenterre de plus de 50 recettes (104 pages) est fourni au format PDF avec chaque Cuicui.<br />Vous pouvez vous procurer la version papier ici :</> : <>The Rudimenterre recipe book, with over 50 recipes (104 pages), is included as a PDF with every Cuicui.<br />You can get the printed edition here:</>}</p>
          <a className="button button--orange" href="https://fr.blurb.ca/b/12260585-carnet-de-recettes-rudimenterre">{fr ? 'Je commande le carnet de recettes' : 'Order the recipe book'}</a>
          <img className="recipe-book__portrait" src="/images/rudimenterre/recipe-portrait.webp" alt={fr ? 'Carole présente son Cuicui' : 'Carole presents her Cuicui'} width="1200" height="1800" loading="lazy" />
        </div>
        <img className="recipe-book__cover" src="/images/rudimenterre/recipe-cover.webp" alt={fr ? 'Couverture du carnet de recettes Rudimenterre pour le Cuicui, par Carole Briet' : 'Rudimenterre recipes for Cuicui by Carole Briet, book cover'} width="777" height="1012" loading="lazy" />
      </div>
    </section>
  </article>;
}
