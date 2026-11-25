// All the numbers and names in the game. Change them here.

export const KINDS = ['body', 'wings', 'engines', 'nose', 'top', 'paint'];

export const KIND_NAMES = { body: 'Body', wings: 'Wings', engines: 'Engines', nose: 'Nose', top: 'Top', paint: 'Paint' };

const piece = (kind, name, own, build, gives = {}) => ({ kind, name, own, build, fast: 0, pretty: 0, comfy: 0, seats: 0, ...gives });

// own:   what it costs in the piece shop, once (0 = you start with it).
// build: what it costs every time it is used in a plane.
export const PIECES = {
  'little':          piece('body', 'Little body', 0, 10, { seats: 4 }),
  'long':            piece('body', 'Long body', 60, 25, { seats: 8, comfy: 1 }),
  'jumbo':           piece('body', 'Jumbo body', 160, 45, { seats: 12, comfy: 2 }),
  'paper':           piece('wings', 'Paper wings', 0, 5, { fast: 1 }),
  'swoosh':          piece('wings', 'Swoosh wings', 40, 15, { fast: 2, pretty: 1 }),
  'rainbow-wings':   piece('wings', 'Rainbow wings', 110, 30, { fast: 2, pretty: 3 }),
  'chuk':            piece('engines', 'Chuk-chuk engines', 0, 5, { fast: 1 }),
  'turbo':           piece('engines', 'Pink turbo engines', 45, 20, { fast: 3 }),
  'star-rockets':    piece('engines', 'Star rockets', 140, 40, { fast: 5 }),
  'round':           piece('nose', 'Round nose', 0, 5),
  'pointy':          piece('nose', 'Pointy nose', 30, 10, { fast: 1 }),
  'glitter-nose':    piece('nose', 'Glitter nose', 80, 20, { fast: 1, pretty: 2 }),
  'none':            piece('top', 'No top', 0, 0),
  'soft-seats':      piece('top', 'Soft seats', 35, 15, { comfy: 2 }),
  'snack-bar':       piece('top', 'Snack bar', 70, 25, { comfy: 3 }),
  'popup':           piece('top', 'Pop-up level', 130, 40, { comfy: 3, pretty: 1, seats: 4 }),
  'plain':           piece('paint', 'Plain silver', 0, 0),
  'two-colours':     piece('paint', 'Two colours', 25, 5, { pretty: 1 }),
  'rainbow':         piece('paint', 'Rainbow stripes', 60, 15, { pretty: 3 }),
  'glitter-rainbow': piece('paint', 'Glitter rainbow', 150, 30, { pretty: 5 }),
};

export const STARTER = Object.freeze({ body: 'little', wings: 'paper', engines: 'chuk', nose: 'round', top: 'none', paint: 'plain', stickers: Object.freeze([]) });

export const STICKER_IDS = ['heart', 'star', 'strawberry', 'lightning'];
export const MAX_STICKERS = 6;

// The three Investor Bosses. Each loves one thing and pays for its stars.
export const BOSS_ORDER = ['teddy', 'ching', 'ityul'];
export const BOSSES = {
  teddy: { name: 'Teddy', loves: 'fast', floor: 25, tickle: 'Hee hee! You tickled a leech off!', lines: ["I'm covered in mud and leeches!", 'I zoomed here so fast I fell in a puddle.', 'Is that a leech on my hat? Never mind!'] },
  ching: { name: 'Ching Ching', loves: 'pretty', floor: 0, tickle: 'Careful, my glitter!', lines: ['Ooh, let me see the colours!', 'I brought my own glitter, just in case.', 'Sparkles make everything better.'] },
  ityul: { name: 'Ityul', loves: 'comfy', floor: 0, tickle: 'Zzz... oh! Hello!', lines: ['Yawn... is there somewhere soft to sit?', 'I never go anywhere without my pillow.', 'A good plane is a cosy plane.'] },
};
export const LOVE_HINTS = { fast: 'I love FAST! Show me big engines!', pretty: 'I love PRETTY! Show me colours!', comfy: 'I love COMFY! Show me soft seats!' };
export const STAR_PAY = 8;    // dollars a boss gives for each star they love
export const STAR_CAP = 6;    // stars counted at most
export const WISH_BONUS = 10; // extra when a boss's wish is on the plane

// Places to fly to, nearest first. `fast` is how many Fast stars the trip needs.
export const PLACES = [
  { id: 'hills', name: 'Strawberry Hills', fast: 0, ticket: 2, sky: 'day' },
  { id: 'cloud', name: 'Purple Cloud City', fast: 3, ticket: 3, sky: 'day' },
  { id: 'heart', name: 'Heart Island', fast: 4, ticket: 4, sky: 'sunset' },
  { id: 'zigzag', name: 'Zig-Zag Meadows', fast: 5, ticket: 5, sky: 'sunset' },
  { id: 'falls', name: 'Glitter Falls', fast: 7, ticket: 6, sky: 'night' },
  { id: 'lagoon', name: 'Moon Jelly Lagoon', fast: 8, ticket: 8, sky: 'night' },
  { id: 'city', name: 'Flying Jellyfish City', fast: 0, ticket: 10, sky: 'night', needsCity: true },
];

export const CITY_PRICE = 1000;
export const STARS_PER_FLIGHT = 10;
export const DRAGON_TIP = 5;   // customers tip more when a baby dragon rides along
export const RAINBOW_LUCK = 3; // a little extra on a lucky rainbow day
