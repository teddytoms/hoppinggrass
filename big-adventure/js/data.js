// All the numbers and words of the game live here. Change them freely.

export const MIN_PRICE = 1;
export const MAX_PRICE = 99;
export const START_PRICE = 10;
export const SPARKLE_CHANCE = 1 / 3;

// A day is this many monsters. It is a count, never a clock.
export const DAY_LENGTH = 5;
// On a special day, monsters pay this much more for the day's foods...
export const DAY_BONUS = 5;
// ...and this share of orders are for one of them.
export const DAY_FOOD_CHANCE = 2 / 3;
// A kind price (two thirds of the monster's top price, or less) earns this tip.
export const TIP = 2;
export const KIND_SHARE = 2 / 3;

// The kinds of day. `pic` is the picture on the sign and in the window.
export const DAYS = {
  ordinary: { name: '', foods: [], pic: 'sun' },
  hot: { name: 'Hot day', foods: ['orange-juice', 'mango-lassi', 'boba'], pic: 'sun' },
  rainy: { name: 'Rainy day', foods: ['pizza', 'spaghetti', 'tea', 'moon-toast'], pic: 'rain' },
  party: { name: 'Party day', foods: ['pie', 'cupcake', 'salmon'], pic: 'party' },
};

/* ---------- The adventure: Around the World in 80 Plates ---------- */

// The bet is this many happy plates, and this is the last chapter.
export const PLATES_TO_WIN = 80;
export const LAST_CHAPTER = 5;

// The five chapters. `goal` is a point on the running total of plates, so
// plates past a goal are never wasted. `travel` is how the chef leaves.
// The first goal is small on purpose: Italy after three or four orders.
export const CHAPTERS = [
  { id: 1, title: 'The Bet', place: 'cart', where: 'a food cart in the park', goal: 6,
    foods: ['orange-juice', 'cupcake', 'pie'], monsters: ['ella', 'bella'], upgrades: ['umbrella', 'bell'], travel: 'balloon' },
  { id: 2, title: 'Pizza in the Piazza', place: 'cafe', where: 'a cafe in Italy', goal: 18,
    foods: ['pizza', 'spaghetti', 'coffee'], monsters: ['fife', 'twinkle'], upgrades: ['chairs', 'musicbox'], travel: 'train' },
  { id: 3, title: 'The Chuk Chuk Kitchen', place: 'train', where: 'a dining car on a train across India', goal: 34,
    foods: ['mango-lassi', 'tea'], monsters: ['ghuy'], upgrades: ['window', 'spices'], travel: 'boat' },
  { id: 4, title: 'The Floating Feast', place: 'boat', where: 'a restaurant boat on the sea', goal: 56,
    foods: ['salmon', 'boba'], monsters: ['gege'], upgrades: ['net', 'bubbles'], travel: 'rocket' },
  { id: 5, title: 'The Moon Diner', place: 'moon', where: 'a diner on the moon', goal: 80,
    foods: ['moon-toast'], monsters: ['moon'], upgrades: ['lamp', 'flag'], travel: 'home' },
];

// What each upgrade does, in numbers. The rules that use them are named beside each.
export const UMBRELLA_BONUS = 3;  // umbrella: extra dollars on every sale on a rainy day (economy.js rainBonus, state.js sell)
export const CHAIRS_TIP = 4;      // comfy chairs: the tip for a kind price (economy.js react)
export const MUSIC_BONUS = 2;     // music box: every monster's top price goes up by this (economy.js topPrice)
export const MYSTERY_PAYS = 2;    // the mystery guest pays this many times the price...
export const WINDOW_PAYS = 3;     // ...or this many, with the bigger window (economy.js react)
export const SPICES_WEIGHT = 2;   // spice rack: the golden ingredient is this many times as likely (surprises.js)
export const NET_SAVES = 4;       // fishing net: salmon costs this much less to make (economy.js costOf)
export const BUBBLES_ORDER = 4;   // bubble machine: a big order is this many foods (orders.js)
export const RUSH_SECONDS = 90;   // the lunch-rush sun takes this long to set (main.js)...
export const LAMP_SLOW = 2;       // ...and this many times as long with the star lamp
// The flag makes friendship hearts fill twice as fast (friends.js feed).

// Upgrades, two per chapter, bought in either order. `line` is shown in the shop.
export const UPGRADES = {
  umbrella: { name: 'Umbrella', price: 20, chapter: 1, line: 'Rainy days: $3 more on every sale.' },
  bell: { name: 'Bell', price: 25, chapter: 1, line: 'Ding! Surprises come sooner.' },
  chairs: { name: 'Comfy chairs', price: 35, chapter: 2, line: 'A kind price gets a $4 tip.' },
  musicbox: { name: 'Music box', price: 40, chapter: 2, line: 'Every monster pays up to $2 more.' },
  window: { name: 'Bigger window', price: 55, chapter: 3, line: 'The mystery guest pays 3 times!' },
  spices: { name: 'Spice rack', price: 60, chapter: 3, line: 'Golden food grows more often.' },
  net: { name: 'Fishing net', price: 60, chapter: 4, line: 'Salmon costs $4 less to make.' },
  bubbles: { name: 'Bubble machine', price: 65, chapter: 4, line: 'A big order is 4 foods, not 3!' },
  lamp: { name: 'Star lamp', price: 70, chapter: 5, line: 'The lunch-rush sun sets slowly.' },
  flag: { name: 'Flag', price: 75, chapter: 5, line: 'Hearts fill twice as fast.' },
};

// Surprises. One comes every SURPRISE_EVERY orders (one order sooner with the
// bell), but never in the first few orders of a new game.
export const SURPRISE_EVERY = 3;
export const NO_SURPRISE_BEFORE = 2;
export const RUSH_LENGTH = 3;   // a lunch rush is this many orders in a row
export const BIG_ORDER = 3;     // a big order is this many of one food (BUBBLES_ORDER with the bubble machine)
export const CRITIC_NEAR = 3;   // the critic comes when the plates are this close to the chapter's goal...
export const CRITIC_BONUS = 3;  // ...and a happy critic is worth this many extra plates

// Every food, in chapter order.
export const FOOD_ORDER = ['orange-juice', 'cupcake', 'pie', 'pizza', 'spaghetti', 'coffee', 'mango-lassi', 'tea', 'salmon', 'boba', 'moon-toast'];

// `riddle` is how the mystery guest asks for the food, without saying its name.
// A food with `gift: true` is never sold in the shop: it is given (the moon
// monster brings moon cheese toast on arrival in chapter 5).
export const FOODS = {
  'orange-juice': {
    name: 'Orange juice',
    riddle: 'something cold and orange',
    cost: 5,
    recipePrice: 0,
    ingredients: [{ id: 'orange', name: 'oranges', count: 3 }],
    steps: [
      { label: 'Squeeze orange', drag: 'orange', onto: 'juicer' },
      { label: 'Into the glass', drag: 'juicer', onto: 'glass' },
      { label: 'Put ice', drag: 'ice', onto: 'glass' },
      { label: 'Put orange slice', drag: 'orange-slice', onto: 'glass' },
      { label: 'Finished!', tap: 'glass' },
    ],
  },
  pizza: {
    name: 'Pizza',
    riddle: 'something flat, round and cheesy',
    cost: 8,
    recipePrice: 20,
    ingredients: [
      { id: 'dough', name: 'dough', count: 1 },
      { id: 'tomato', name: 'tomato', count: 1 },
      { id: 'cheese', name: 'cheese', count: 1 },
    ],
    steps: [
      { label: 'Roll the dough', drag: 'dough', onto: 'board' },
      { label: 'Spread tomato', drag: 'tomato', onto: 'base' },
      { label: 'Sprinkle cheese', drag: 'cheese', onto: 'base' },
      { label: 'Bake', tap: 'oven' },
      { label: 'Finished!', tap: 'pizza' },
    ],
  },
  'mango-lassi': {
    name: 'Mango lassi',
    riddle: 'something yellow, cold and creamy',
    cost: 6,
    recipePrice: 35,
    ingredients: [
      { id: 'mango', name: 'mango', count: 1 },
      { id: 'milk', name: 'milk', count: 1 },
    ],
    steps: [
      { label: 'Peel the mango', tap: 'mango' },
      { label: 'Mango in', drag: 'mango', onto: 'blender' },
      { label: 'Pour milk', drag: 'milk', onto: 'blender' },
      { label: 'Blend', tap: 'blender' },
      { label: 'Finished!', tap: 'glass' },
    ],
  },
  pie: {
    name: 'Pie',
    riddle: 'something round with berries inside',
    cost: 7,
    recipePrice: 15,
    ingredients: [
      { id: 'crust', name: 'crust', count: 1 },
      { id: 'berry', name: 'berries', count: 3 },
    ],
    steps: [
      { label: 'Roll the crust', drag: 'crust', onto: 'board' },
      { label: 'Crust in the dish', drag: 'crust', onto: 'dish' },
      { label: 'Add berries', drag: 'berry', onto: 'dish' },
      { label: 'Bake', tap: 'oven' },
      { label: 'Finished!', tap: 'pie' },
    ],
  },
  tea: {
    name: 'Tea',
    riddle: 'something hot from a teapot',
    cost: 4,
    recipePrice: 30,
    ingredients: [{ id: 'tea-leaf', name: 'tea leaves', count: 2 }],
    steps: [
      { label: 'Leaves in the teapot', drag: 'tea-leaf', onto: 'teapot' },
      { label: 'Pour hot water', drag: 'kettle', onto: 'teapot' },
      { label: 'Pour the tea', drag: 'teapot', onto: 'cup' },
      { label: 'Finished!', tap: 'cup' },
    ],
  },
  spaghetti: {
    name: 'Spaghetti',
    riddle: 'something long and wiggly',
    cost: 9,
    recipePrice: 30,
    ingredients: [
      { id: 'pasta', name: 'pasta', count: 1 },
      { id: 'tomato', name: 'tomato', count: 1 },
      { id: 'cheese', name: 'cheese', count: 1 },
    ],
    steps: [
      { label: 'Boil the pasta', drag: 'pasta', onto: 'pot' },
      { label: 'Pasta on the plate', drag: 'pot', onto: 'plate' },
      { label: 'Add tomato sauce', drag: 'tomato', onto: 'plate' },
      { label: 'Sprinkle cheese', drag: 'cheese', onto: 'plate' },
      { label: 'Finished!', tap: 'plate' },
    ],
  },
  coffee: {
    name: 'Coffee',
    riddle: 'something hot, brown and milky',
    cost: 6,
    recipePrice: 25,
    ingredients: [
      { id: 'bean', name: 'coffee beans', count: 3 },
      { id: 'milk', name: 'milk', count: 1 },
    ],
    steps: [
      { label: 'Beans in the grinder', drag: 'bean', onto: 'grinder' },
      { label: 'Grind', tap: 'grinder' },
      { label: 'Coffee in the mug', drag: 'grinder', onto: 'mug' },
      { label: 'Pour milk', drag: 'milk', onto: 'mug' },
      { label: 'Finished!', tap: 'mug' },
    ],
  },
  boba: {
    name: 'Boba',
    riddle: 'something with bouncy little balls',
    cost: 8,
    recipePrice: 45,
    ingredients: [
      { id: 'boba', name: 'boba pearls', count: 3 },
      { id: 'milk', name: 'milk', count: 1 },
    ],
    steps: [
      { label: 'Pearls in the cup', drag: 'boba', onto: 'cup' },
      { label: 'Pour milk', drag: 'milk', onto: 'cup' },
      { label: 'Put ice', drag: 'ice', onto: 'cup' },
      { label: 'Put the straw', drag: 'straw', onto: 'cup' },
      { label: 'Finished!', tap: 'cup' },
    ],
  },
  cupcake: {
    name: 'Cupcake',
    riddle: 'something small and sweet with sprinkles',
    cost: 7,
    recipePrice: 10,
    ingredients: [
      { id: 'flour', name: 'flour', count: 1 },
      { id: 'sprinkles', name: 'sprinkles', count: 3 },
    ],
    steps: [
      { label: 'Batter in the case', drag: 'flour', onto: 'case' },
      { label: 'Bake', tap: 'oven' },
      { label: 'Swirl the frosting', drag: 'frosting', onto: 'cupcake' },
      { label: 'Add sprinkles', drag: 'sprinkles', onto: 'cupcake' },
      { label: 'Finished!', tap: 'cupcake' },
    ],
  },
  salmon: {
    name: 'Salmon',
    riddle: 'something pink that swims',
    cost: 12,
    recipePrice: 50,
    ingredients: [
      { id: 'fish', name: 'fish', count: 1 },
      { id: 'lemon', name: 'lemon', count: 1 },
    ],
    steps: [
      { label: 'Fish in the pan', drag: 'fish', onto: 'pan' },
      { label: 'Cook', tap: 'pan' },
      { label: 'Onto the plate', drag: 'pan', onto: 'plate' },
      { label: 'Squeeze lemon', drag: 'lemon', onto: 'plate' },
      { label: 'Finished!', tap: 'plate' },
    ],
  },
  'moon-toast': {
    name: 'Moon cheese toast',
    riddle: 'something toasty from the moon',
    cost: 6,
    recipePrice: 0,
    gift: true,
    ingredients: [
      { id: 'moon-cheese', name: 'moon cheese', count: 1 },
      { id: 'bread', name: 'bread', count: 1 },
    ],
    steps: [
      { label: 'Bread in the pan', drag: 'bread', onto: 'pan' },
      { label: 'Cheese on top', drag: 'moon-cheese', onto: 'pan' },
      { label: 'Toast', tap: 'pan' },
      { label: 'Finished!', tap: 'moon-toast' },
    ],
  },
};

// Each monster's top price for moon cheese toast is in its own table below.
export const MONSTERS = {
  ella: {
    name: 'Ella',
    favourite: 'pizza',
    sparkle: 'yuck',
    maxPrice: { 'orange-juice': 15, pizza: 25, 'mango-lassi': 14, pie: 14,
      tea: 12, spaghetti: 26, coffee: 16, boba: 20, salmon: 28, cupcake: 18, 'moon-toast': 17 },
  },
  bella: {
    name: 'Bella',
    favourite: 'pie',
    sparkle: 'love',
    maxPrice: { 'orange-juice': 12, pizza: 18, 'mango-lassi': 20, pie: 22,
      tea: 16, spaghetti: 20, coffee: 14, boba: 24, salmon: 30, cupcake: 24, 'moon-toast': 18 },
  },
  twinkle: {
    name: 'Twinkle',
    favourite: 'mango-lassi',
    sparkle: 'love',
    maxPrice: { 'orange-juice': 22, pizza: 35, 'mango-lassi': 30, pie: 28,
      tea: 24, spaghetti: 36, coffee: 26, boba: 32, salmon: 45, cupcake: 30, 'moon-toast': 30 },
  },
  fife: {
    name: 'Fife',
    favourite: 'orange-juice',
    sparkle: 'yuck',
    maxPrice: { 'orange-juice': 9, pizza: 13, 'mango-lassi': 10, pie: 11,
      tea: 8, spaghetti: 14, coffee: 9, boba: 13, salmon: 17, cupcake: 12, 'moon-toast': 12 },
  },
  ghuy: {
    name: 'Ghuy',
    favourite: 'pizza',
    sparkle: 'love',
    maxPrice: { 'orange-juice': 14, pizza: 24, 'mango-lassi': 17, pie: 18,
      tea: 12, spaghetti: 26, coffee: 20, boba: 22, salmon: 27, cupcake: 19, 'moon-toast': 19 },
  },
  // Gege, the silly watermelon monster.
  gege: {
    name: 'Gege',
    favourite: 'cupcake',
    sparkle: 'love',
    maxPrice: { 'orange-juice': 13, pizza: 21, 'mango-lassi': 16, pie: 20,
      tea: 11, spaghetti: 22, coffee: 12, boba: 23, salmon: 24, cupcake: 26, 'moon-toast': 18 },
  },
  // The moon monster. The player gives it a name; this one is used until then
  // (chapters.js monsterName).
  moon: {
    name: 'Moony',
    favourite: 'moon-toast',
    sparkle: 'love',
    maxPrice: { 'orange-juice': 16, pizza: 22, 'mango-lassi': 18, pie: 19,
      tea: 14, spaghetti: 23, coffee: 15, boba: 24, salmon: 26, cupcake: 21, 'moon-toast': 24 },
  },
};
