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
  rainy: { name: 'Rainy day', foods: ['pizza', 'spaghetti', 'tea'], pic: 'rain' },
  party: { name: 'Party day', foods: ['pie', 'cupcake', 'salmon'], pic: 'party' },
};

// Decorations, cheapest first. Each brings one new monster to the restaurant.
// `spots` is how many places it can hang; tapping it moves it to the next.
export const DECOR_ORDER = ['balloons', 'lights', 'disco', 'bubbles'];
export const DECOR = {
  balloons: { name: 'Balloons', price: 20, brings: 'fife', spots: 3 },
  lights: { name: 'Fairy lights and flowers', price: 50, brings: 'twinkle', spots: 2 },
  disco: { name: 'Disco ball', price: 80, brings: 'ghuy', spots: 3 },
  bubbles: { name: 'Bubble machine', price: 100, brings: 'gege', spots: 2 },
};

// The sticker book, in page order. The rules for winning them are in stickers.js.
export const STICKERS = [
  { id: 'first-sale', name: 'First sale' },
  { id: 'juice-5', name: '5 orange juices' },
  { id: 'pizza-5', name: '5 pizzas' },
  { id: 'pie-5', name: '5 pies' },
  { id: 'lassi-5', name: '5 mango lassis' },
  { id: 'bella-secret', name: "Bella's secret" },
  { id: 'ella-secret', name: "Ella's secret" },
  { id: 'tips-5', name: '5 tips' },
  { id: 'hot-seller', name: 'Hot day seller' },
  { id: 'decor-1', name: 'First decoration' },
  { id: 'decor-all', name: 'All decorations' },
  { id: 'meet-all', name: 'Meet every monster' },
  { id: 'save-100', name: 'Save $100' },
  { id: 'best-day-50', name: 'Best day: keep $50' },
  { id: 'all-recipes', name: 'Every recipe' },
  { id: 'days-10', name: 'Open for 10 days' },
];

// Shop order, cheapest recipe first.
export const FOOD_ORDER = ['orange-juice', 'pizza', 'pie', 'mango-lassi', 'tea', 'spaghetti', 'coffee', 'boba', 'cupcake', 'salmon'];

// The menu bar across the top of the restaurant, in Ruhi's order.
// Foods without a recipe yet show as locked tiles.
export const MENU = [
  { id: 'orange-juice', name: 'Orange juice' },
  { id: 'pizza', name: 'Pizza' },
  { id: 'mango-lassi', name: 'Mango lassi' },
  { id: 'pie', name: 'Pie' },
  { id: 'spaghetti', name: 'Spaghetti' },
  { id: 'coffee', name: 'Coffee' },
  { id: 'tea', name: 'Tea' },
  { id: 'salmon', name: 'Salmon' },
  { id: 'boba', name: 'Boba' },
  { id: 'cupcake', name: 'Cupcake' },
];

export const FOODS = {
  'orange-juice': {
    name: 'Orange juice',
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
    cost: 8,
    recipePrice: 30,
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
    cost: 6,
    recipePrice: 60,
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
    cost: 7,
    recipePrice: 45,
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
    cost: 4,
    recipePrice: 75,
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
    cost: 9,
    recipePrice: 90,
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
    cost: 6,
    recipePrice: 105,
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
    cost: 8,
    recipePrice: 120,
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
    cost: 7,
    recipePrice: 135,
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
    cost: 12,
    recipePrice: 150,
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
};

export const MONSTERS = {
  ella: {
    name: 'Ella',
    favourite: 'pizza',
    sparkle: 'yuck',
    maxPrice: { 'orange-juice': 15, pizza: 25, 'mango-lassi': 14, pie: 14,
      tea: 12, spaghetti: 26, coffee: 16, boba: 20, salmon: 28, cupcake: 18 },
  },
  bella: {
    name: 'Bella',
    favourite: 'pie',
    sparkle: 'love',
    maxPrice: { 'orange-juice': 12, pizza: 18, 'mango-lassi': 20, pie: 22,
      tea: 16, spaghetti: 20, coffee: 14, boba: 24, salmon: 30, cupcake: 24 },
  },
  // The next three only come once their decoration (`needs`) is in the restaurant.
  twinkle: {
    name: 'Twinkle',
    favourite: 'mango-lassi',
    sparkle: 'love',
    needs: 'lights',
    maxPrice: { 'orange-juice': 22, pizza: 35, 'mango-lassi': 30, pie: 28,
      tea: 24, spaghetti: 36, coffee: 26, boba: 32, salmon: 45, cupcake: 30 },
  },
  fife: {
    name: 'Fife',
    favourite: 'orange-juice',
    sparkle: 'yuck',
    needs: 'balloons',
    maxPrice: { 'orange-juice': 9, pizza: 13, 'mango-lassi': 10, pie: 11,
      tea: 8, spaghetti: 14, coffee: 9, boba: 13, salmon: 17, cupcake: 12 },
  },
  ghuy: {
    name: 'Ghuy',
    favourite: 'pizza',
    sparkle: 'love',
    needs: 'disco',
    maxPrice: { 'orange-juice': 14, pizza: 24, 'mango-lassi': 17, pie: 18,
      tea: 12, spaghetti: 26, coffee: 20, boba: 22, salmon: 27, cupcake: 19 },
  },
  // Gege, the silly watermelon monster, comes for the bubble machine.
  gege: {
    name: 'Gege',
    favourite: 'cupcake',
    sparkle: 'love',
    needs: 'bubbles',
    maxPrice: { 'orange-juice': 13, pizza: 21, 'mango-lassi': 16, pie: 20,
      tea: 11, spaghetti: 22, coffee: 12, boba: 23, salmon: 24, cupcake: 26 },
  },
};
