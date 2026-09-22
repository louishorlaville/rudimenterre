export type HomeReview = {
  id: string;
  quote: {
    fr: string;
    en: string;
  };
  author: string;
};

/*
 * AJOUTER OU RETIRER UN AVIS
 * - Pour ajouter un avis, dupliquez un bloc entre accolades et changez son id.
 * - Pour retirer un avis, supprimez simplement son bloc.
 * Le carrousel s'active automatiquement à partir du quatrième avis.
 */
export const HOME_REVIEWS: HomeReview[] = [
  {
    id: 'helene-poissy',
    quote: {
      fr: 'J’ai découvert le Cuicui grâce au magazine Bobine et j’ai eu envie de connaître aussi Carole, sa créatrice. Nous avons fait une visio et j’ai aimé cette rencontre incroyable. Quand on aime cuisiner de bons produits, le Cuicui permet de savourer des saveurs encore plus subtiles et c’est aussi un bel objet. Il me serait aujourd’hui difficile de faire marche arrière et d’utiliser autre chose pour cuisiner. Belle continuation.',
      en: 'I discovered Cuicui through Bobine magazine and wanted to meet Carole, its creator, too. We had a video call and I loved this wonderful encounter. When you enjoy cooking good ingredients, Cuicui brings out even subtler flavours and is also a beautiful object. Today, I would find it difficult to go back to cooking with anything else. Wishing you every success.',
    },
    author: 'Hélène, Poissy, France',
  },
  {
    id: 'robin-concarneau',
    quote: {
      fr: 'Nous avons expérimenté le far du Kig Ha Farz avec le Cuicui et ça marche très bien.',
      en: 'We tried making Kig Ha Farz with Cuicui, and it works very well.',
    },
    author: 'Robin, Concarneau, France',
  },
  {
    id: 'timothee-montreal',
    quote: {
      fr: 'Après les fêtes passées en famille et bien trop copieuses, je suis ravie de retrouver mon Cuicui pour tester de nouvelles recettes. Les carnets sont fabuleux, merci pour ce partage.',
      en: 'After the holidays spent with family and far too much food, I am delighted to be reunited with my Cuicui and try new recipes. The notebooks are fabulous; thank you for sharing them.',
    },
    author: 'Timothée G., Montréal, Canada',
  },
  {
    id: 'barbara-saint-denis',
    quote: {
      fr: 'Je m’éclate avec mon Cuicui, je l’adore ! Depuis longtemps je cherchais un moyen d’allier cuisson saine (vapeur, basse température, matériau naturel) et écologique / économique. Avec le Cuicui j’ai trouvé. En plus il est super pratique, car il conserve les restes qui peuvent être réchauffés ou servir de base pour une autre recette. Son esthétique épurée en fait un très joli plat de service sur ma table.',
      en: 'I have so much fun with my Cuicui - I love it! For a long time, I had been looking for a way to combine healthy cooking (steam, low temperature and natural materials) with an ecological and economical approach. I found it with Cuicui. It is also very practical: leftovers keep well and can be reheated or become the base of another recipe. Its clean design makes it a beautiful serving dish on my table.',
    },
    author: 'Barbara, Saint-Denis, France',
  },
  {
    id: 'cloe-montreal',
    quote: {
      fr: 'Ce soir j’ai fait le riz et je m’imaginais empiler un Cuicui de plus pour faire mon curry dedans ! Je m’y mets avec beaucoup enthousiasme. Bravo pour ton travail !',
      en: 'Tonight I made rice and found myself imagining stacking another Cuicui on top to make my curry in it! I am getting into it with so much enthusiasm. Congratulations on your work!',
    },
    author: 'Cloe, Montréal, Canada',
  },
  {
    id: 'patrick-sherbrooke',
    quote: {
      fr: 'Le Cuicui a intégré mon quotidien en cuisine. Sa modularité et son design pratique me permettent de trouver de nouvelles manières de cuisiner sainement et simplement. En empilant les récipients, je peux par exemple cuire à la fois mon riz et mon potage de légumes ! J’y gagne du temps, et des saveurs !',
      en: 'Cuicui has become part of my everyday cooking. Its modular design and practicality help me find new ways to cook healthy food simply. By stacking the dishes, I can cook my rice and vegetable soup at the same time, for example. I save time and gain flavour!',
    },
    author: 'Patrick, Sherbrooke, Canada',
  },
  {
    id: 'philippe-montreal',
    quote: {
      fr: 'J’aime la simplicité d’utilisation, on peut préparer des repas complets en n’utilisant qu’un seul point de chauffe. Les plats sont beaux et peuvent être amenés directement de la cuisine à la table à manger, et les accessoires comme le couvercle plat « zéro déchet » permettent un stockage au frigo en optimisant l’espace.',
      en: 'I love how simple it is to use: you can prepare complete meals using a single heat source. The dishes are beautiful and can be brought straight from the kitchen to the dining table, while accessories such as the “zero-waste” flat lid make the most of fridge space for storage.',
    },
    author: 'Philippe, Montréal, Canada',
  },
];
