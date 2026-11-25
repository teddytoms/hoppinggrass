// The story, as comic pages. Each comic is a list of pages; js/comic.js draws a page.
// To change the words, edit `caption`, `say.text` and `sfx` below. Keep sentences short
// (about eight simple words). {name} becomes the chef's name and {moon} the moon monster's name
// (both typed by the player; "Chef" and "Moony" when they are empty).
//
// A panel: { size: 'wide' | 'half' | 'third', bg, caption?, actors: [{ who, mood?, x?, y?, scale?, flip? }],
//            say?: { who, text, x?, y? }, sfx?, prop? }
// who:  chef (mood 'spoon' | 'basket' | 'cheer' | 'oops'), victoria, ella, bella, twinkle, fife, ghuy, gege, moon
//       (moods idle, happy, love, yuck, shocked), m (peek, idle, reveal, window, paper, rowboat, and
//       notebook, which is M after the reveal), critic (idle, happy)
// bg:   park, garden, kitchen, cafe, train, boat, moon, sky, sea, night, space, burst, pink, purple, mint,
//       yellow, blue, cream, orange
// prop: letter, review (with text), notebook (with text), tbc, cart, balloon, train, boat, rocket, plate,
//       plate-gold, golden-spoon, any food id,
//       any upgrade id, or any small picture id from js/art.js. A prop is an id or { id, x?, y?, scale?, text? },
//       or a list of those.
// The speech bubble sits beside the speaker, so put the speaker near one side and keep
// the caption short when the speaker is on the left.

export const COMICS = {
  cover: [{
    title: 'AROUND THE WORLD IN 80 PLATES',
    panels: [
      {
        size: 'wide', bg: 'sky', caption: 'Food Make: The Big Adventure. Book 1!',
        prop: { id: 'balloon', x: 0.5, y: 0.54, scale: 1.2 },
        actors: [{ who: 'ella', mood: 'happy', x: 0.12 }, { who: 'chef', x: 0.29 }, { who: 'victoria', x: 0.71 }, { who: 'bella', mood: 'happy', x: 0.88, flip: true }],
      },
      {
        size: 'half', bg: 'yellow', caption: 'A comic by Chef {name}',
        actors: [{ who: 'chef', x: 0.2 }],
        prop: [{ id: 'plate-gold', x: 0.58, y: 0.7, scale: 1.1 }, { id: 'plate', x: 0.82, y: 0.74, scale: 0.9 }],
        say: { who: 'chef', text: 'Can I cook 80 happy plates?' },
      },
      {
        size: 'half', bg: 'purple', caption: 'And who is M?',
        actors: [{ who: 'm', mood: 'peek', x: 0.72 }],
        say: { who: 'm', text: 'Not telling!' },
      },
    ],
  }],

  'ch1-open': [{
    title: 'CHAPTER 1: THE BET',
    panels: [
      {
        size: 'half', bg: 'park', caption: 'One sunny day...',
        prop: { id: 'cart', x: 0.72, y: 0.66, scale: 0.9 },
        actors: [{ who: 'chef', x: 0.2 }],
        say: { who: 'chef', text: 'Juice! Fresh juice!' },
      },
      { size: 'half', bg: 'burst', caption: 'A letter arrives!', prop: { id: 'letter', y: 0.56 }, actors: [] },
      {
        size: 'half', bg: 'purple',
        actors: [{ who: 'ella', mood: 'shocked', x: 0.24 }],
        say: { who: 'ella', text: '80 plates?! Is M for moustache?' },
        sfx: { word: 'GASP!', x: 0.7, y: 0.9 },
      },
      {
        size: 'half', bg: 'mint', caption: 'Somebody watches...',
        actors: [{ who: 'victoria', x: 0.13, scale: 0.86 }, { who: 'chef', x: 0.37, scale: 0.86 }, { who: 'm', mood: 'peek', x: 0.85, scale: 0.8 }],
        say: { who: 'chef', text: 'It is a bet! Off we go!' },
      },
    ],
  }],

  'ch1-end': [{
    title: 'UP, UP AND AWAY!',
    panels: [
      {
        size: 'half', bg: 'park', caption: 'Six plates!',
        actors: [{ who: 'bella', mood: 'happy', x: 0.2 }, { who: 'chef', x: 0.84, scale: 0.8 }],
        prop: { id: 'plate-gold', x: 0.56, y: 0.74 },
        say: { who: 'bella', text: 'Go, Chef {name}! Go!' },
      },
      {
        size: 'half', bg: 'yellow', caption: 'The critic writes...',
        actors: [{ who: 'critic', mood: 'happy', x: 0.2 }],
        prop: { id: 'review', x: 0.68, y: 0.56, text: 'The juice was very, very juicy.' },
      },
      {
        size: 'half', bg: 'sky', caption: 'Next stop: Italy!',
        prop: { id: 'balloon', x: 0.26, y: 0.58, scale: 1.05 },
        actors: [{ who: 'victoria', x: 0.84, scale: 0.86 }],
        say: { who: 'victoria', text: 'All in the basket!' },
        sfx: { word: 'WHOOSH!', x: 0.6, y: 0.93, size: 50 },
      },
      {
        size: 'half', bg: 'blue', caption: 'But somebody follows...',
        actors: [{ who: 'm', x: 0.26 }],
        say: { who: 'm', text: 'Six plates. Hmm. Not bad!' },
      },
    ],
  }],

  'ch2-open': [{
    title: 'CHAPTER 2: PIZZA IN THE PIAZZA',
    panels: [
      {
        size: 'half', bg: 'sky', caption: 'Italy!',
        prop: { id: 'balloon', x: 0.28, y: 0.6, scale: 1 },
        actors: [{ who: 'chef', x: 0.84, scale: 0.86 }],
        say: { who: 'chef', text: 'Ciao, Italy!' },
        sfx: { word: 'BUMP!', x: 0.56, y: 0.94 },
      },
      {
        size: 'half', bg: 'cafe', caption: 'New friends!',
        actors: [{ who: 'fife', mood: 'happy', x: 0.2 }, { who: 'twinkle', x: 0.82, scale: 0.8, flip: true }],
        say: { who: 'fife', text: 'I am Fife. I am hungry!' },
      },
      {
        size: 'half', bg: 'cafe',
        actors: [{ who: 'twinkle', mood: 'love', x: 0.22 }],
        prop: { id: 'pizza', x: 0.72, y: 0.66, scale: 1.4 },
        say: { who: 'twinkle', text: 'Pizza as big as me, please!' },
      },
      {
        size: 'half', bg: 'orange',
        actors: [{ who: 'victoria', x: 0.18 }, { who: 'm', mood: 'window', x: 0.8, y: 0.96, scale: 0.86 }],
        say: { who: 'victoria', text: 'That window has a moustache!' },
      },
    ],
  }],

  'ch2-end': [{
    title: 'ALL ABOARD!',
    panels: [
      {
        size: 'half', bg: 'cafe', caption: '18 plates!',
        actors: [{ who: 'twinkle', mood: 'love', x: 0.2 }, { who: 'chef', x: 0.84, scale: 0.8 }],
        prop: { id: 'pizza', x: 0.56, y: 0.76 },
        say: { who: 'twinkle', text: 'Mamma mia! So yummy!' },
      },
      {
        size: 'half', bg: 'yellow', caption: 'The critic writes...',
        actors: [{ who: 'critic', mood: 'happy', x: 0.2 }],
        prop: { id: 'review', x: 0.68, y: 0.56, text: 'The pizza was round. I like round.' },
      },
      {
        size: 'half', bg: 'park', caption: 'Next: India!',
        prop: { id: 'train', x: 0.68, y: 0.68, scale: 0.9 },
        actors: [{ who: 'victoria', x: 0.16 }],
        say: { who: 'victoria', text: 'Chuk chuk! All aboard!' },
        sfx: { word: 'TOOT!', x: 0.5, y: 0.6, size: 44 },
      },
      {
        size: 'half', bg: 'mint', caption: 'Somebody runs for the train.',
        actors: [{ who: 'm', x: 0.26 }],
        say: { who: 'm', text: 'Wait for me! I mean... nothing!' },
      },
    ],
  }],

  'ch3-open': [{
    title: 'CHAPTER 3: THE CHUK CHUK KITCHEN',
    panels: [
      {
        size: 'half', bg: 'train', caption: 'On the train!',
        actors: [{ who: 'chef', x: 0.18 }, { who: 'victoria', x: 0.84, scale: 0.8 }],
        say: { who: 'chef', text: 'My kitchen is moving!' },
        sfx: { word: 'CHUK CHUK!', x: 0.56, y: 0.95, size: 42 },
      },
      {
        size: 'half', bg: 'train', caption: 'Meet Ghuy!',
        actors: [{ who: 'ghuy', mood: 'happy', x: 0.22 }],
        prop: { id: 'tea', x: 0.72, y: 0.7, scale: 1.3 },
        say: { who: 'ghuy', text: 'Namaste! Tea, please!' },
      },
      {
        size: 'half', bg: 'train', caption: 'Who is that?',
        actors: [{ who: 'ella', x: 0.2 }, { who: 'm', mood: 'paper', x: 0.8, scale: 0.86 }],
        say: { who: 'ella', text: 'Your news is upside down!' },
      },
      {
        size: 'half', bg: 'burst',
        actors: [{ who: 'chef', x: 0.2 }],
        prop: [{ id: 'mango-lassi', x: 0.6, y: 0.7, scale: 1.2 }, { id: 'tea', x: 0.84, y: 0.74, scale: 1.1 }],
        say: { who: 'chef', text: 'Next: 34 plates. Let us cook!' },
      },
    ],
  }],

  'ch3-end': [{
    title: 'THE END OF THE LINE',
    panels: [
      {
        size: 'half', bg: 'train', caption: '34 plates!',
        actors: [{ who: 'ghuy', mood: 'love', x: 0.2 }, { who: 'chef', mood: 'cheer', x: 0.84, scale: 0.8 }],
        say: { who: 'ghuy', text: 'Best tea on any train!' },
      },
      {
        size: 'half', bg: 'yellow', caption: 'The critic writes...',
        actors: [{ who: 'critic', mood: 'happy', x: 0.2 }],
        prop: { id: 'review', x: 0.68, y: 0.56, text: 'The lassi gave me a moustache. Lovely!' },
      },
      {
        size: 'third', bg: 'train', caption: 'Somebody slips away...',
        actors: [{ who: 'm', mood: 'paper', x: 0.5, scale: 0.8 }],
        sfx: { word: 'TIPTOE!', x: 0.5, y: 0.96, size: 36 },
      },
      {
        size: 'third', bg: 'sea', caption: 'The sea!',
        prop: { id: 'boat', x: 0.5, y: 0.6, scale: 0.86 },
        actors: [],
        sfx: { word: 'SPLASH!', x: 0.5, y: 0.96, size: 40 },
      },
      {
        size: 'third', bg: 'blue',
        actors: [{ who: 'victoria', x: 0.5, scale: 0.8 }],
        say: { who: 'victoria', text: 'Our boat is waiting, Chef {name}!' },
      },
    ],
  }],

  'ch4-open': [{
    title: 'CHAPTER 4: THE FLOATING FEAST',
    panels: [
      {
        size: 'half', bg: 'boat', caption: 'All aboard!',
        actors: [{ who: 'chef', x: 0.18 }, { who: 'victoria', x: 0.84, scale: 0.8 }],
        say: { who: 'chef', text: 'Now my kitchen floats!' },
      },
      {
        size: 'half', bg: 'boat', caption: 'Meet Gege!',
        actors: [{ who: 'gege', mood: 'happy', x: 0.22 }],
        say: { who: 'gege', text: 'I swam here. I am hungry!' },
        sfx: { word: 'SPLASH!', x: 0.7, y: 0.94, size: 46 },
      },
      {
        size: 'half', bg: 'sea', caption: 'Who is rowing?',
        actors: [{ who: 'm', mood: 'rowboat', x: 0.26, y: 0.99 }],
        say: { who: 'm', text: 'Do not look. I am a wave!' },
      },
      {
        size: 'half', bg: 'burst',
        actors: [{ who: 'chef', x: 0.2 }],
        prop: [{ id: 'salmon', x: 0.6, y: 0.7, scale: 1.2 }, { id: 'boba', x: 0.84, y: 0.72, scale: 1.1 }],
        say: { who: 'chef', text: 'Next: 56 plates. Let us cook!' },
      },
    ],
  }],

  'ch4-end': [{
    title: 'TO THE MOON!',
    panels: [
      {
        size: 'half', bg: 'boat', caption: '56 plates!',
        actors: [{ who: 'gege', mood: 'love', x: 0.2 }, { who: 'chef', mood: 'cheer', x: 0.84, scale: 0.8 }],
        say: { who: 'gege', text: 'Yummy in my watermelon tummy!' },
      },
      {
        size: 'half', bg: 'yellow', caption: 'The critic writes...',
        actors: [{ who: 'critic', mood: 'happy', x: 0.2 }],
        prop: { id: 'review', x: 0.68, y: 0.56, text: 'I ate boba. Now I am bouncy!' },
      },
      {
        size: 'third', bg: 'boat', caption: 'On the dock...',
        prop: { id: 'rocket', x: 0.5, y: 0.56, scale: 0.9 },
        actors: [],
      },
      {
        size: 'third', bg: 'blue',
        actors: [{ who: 'victoria', x: 0.5, scale: 0.8 }],
        say: { who: 'victoria', text: 'A rocket! Next stop: the moon!' },
      },
      {
        size: 'third', bg: 'night',
        actors: [{ who: 'm', x: 0.5, scale: 0.8 }],
        say: { who: 'm', text: 'The moon? But I get space sick!' },
      },
    ],
  }],

  'ch5-open': [{
    title: 'CHAPTER 5: THE MOON DINER',
    panels: [
      {
        size: 'half', bg: 'space', caption: 'Three, two, one...',
        prop: { id: 'rocket', x: 0.5, y: 0.52, scale: 1 },
        actors: [],
        sfx: { word: 'ZOOM!', x: 0.76, y: 0.9, size: 56 },
      },
      {
        size: 'half', bg: 'moon', caption: 'The moon!',
        actors: [{ who: 'chef', x: 0.18 }, { who: 'victoria', x: 0.84, scale: 0.8 }],
        say: { who: 'chef', text: 'Hello, moon! Anybody home?' },
      },
      {
        size: 'third', bg: 'moon',
        actors: [{ who: 'moon', mood: 'happy', x: 0.34, scale: 0.72 }],
        prop: { id: 'moon-toast', x: 0.78, y: 0.72, scale: 1.1 },
        say: { who: 'moon', text: 'A gift! My toast recipe!', x: 0.5 },
      },
      {
        size: 'third', bg: 'purple',
        actors: [{ who: 'moon', mood: 'shocked', x: 0.5, scale: 0.8 }],
        say: { who: 'moon', text: 'Oh no. What is my name?' },
      },
      {
        size: 'third', bg: 'mint',
        actors: [{ who: 'chef', x: 0.5, scale: 0.8 }],
        say: { who: 'chef', text: 'Hmm. Is it {moon}?' },
      },
    ],
  }],

  // The ending, in order: home again; M takes off the hat and moustache; M's notebook says 79;
  // Victoria finds the plate M ate in disguise; 80; the Golden Spoon; everybody cheers; to be continued.
  ending: [{
    title: 'HOME AGAIN!',
    panels: [
      {
        size: 'half', bg: 'park', caption: 'Home again!',
        prop: { id: 'rocket', x: 0.72, y: 0.52, scale: 0.9 },
        actors: [{ who: 'chef', x: 0.18 }],
        say: { who: 'chef', text: 'We cooked around the world!' },
      },
      {
        size: 'half', bg: 'purple', caption: 'M is waiting.',
        actors: [{ who: 'm', x: 0.24 }],
        say: { who: 'm', text: 'Chef {name}! Now, my big secret...' },
      },
      {
        size: 'half', bg: 'burst',
        actors: [{ who: 'm', mood: 'reveal', x: 0.24 }],
        say: { who: 'm', text: 'I am a food critic! The best one!' },
        sfx: { word: 'TA-DA!', x: 0.72, y: 0.92 },
      },
      {
        size: 'half', bg: 'mint',
        actors: [{ who: 'ella', mood: 'shocked', x: 0.22 }, { who: 'bella', mood: 'shocked', x: 0.8, scale: 0.8, flip: true }],
        say: { who: 'ella', text: 'So M is for MUNCH!' },
      },
    ],
  }, {
    title: 'THE LAST PLATE',
    panels: [
      {
        size: 'half', bg: 'yellow',
        actors: [{ who: 'm', mood: 'notebook', x: 0.2 }],
        prop: { id: 'notebook', x: 0.74, y: 0.65, scale: 0.86, text: '79' },
        say: { who: 'm', text: 'Only 79 plates. So close!' },
      },
      {
        size: 'half', bg: 'blue',
        actors: [{ who: 'victoria', x: 0.2 }],
        prop: { id: 'plate', x: 0.7, y: 0.66, scale: 1.5 },
        say: { who: 'victoria', text: 'Wait! One more plate!' },
      },
      {
        size: 'half', bg: 'orange', caption: 'The plate M ate in a hat!',
        actors: [{ who: 'm', mood: 'notebook', x: 0.24 }],
        prop: { id: 'plate', x: 0.72, y: 0.72, scale: 1.2 },
        say: { who: 'm', text: 'Oh! I forgot my own lunch!' },
      },
      {
        size: 'half', bg: 'burst', caption: 'That makes...',
        actors: [{ who: 'chef', mood: 'cheer', x: 0.2 }],
        prop: { id: 'plate-gold', x: 0.52, y: 0.74, scale: 1.1 },
        sfx: { word: '80!', x: 0.76, y: 0.62, size: 110 },
      },
    ],
  }, {
    title: 'THE GOLDEN SPOON',
    panels: [
      {
        size: 'half', bg: 'yellow',
        actors: [{ who: 'm', mood: 'notebook', x: 0.22 }],
        prop: { id: 'golden-spoon', x: 0.7, y: 0.64, scale: 1.9 },
        say: { who: 'm', text: 'I lost! Hooray! You win the Golden Spoon!' },
      },
      {
        size: 'half', bg: 'burst',
        actors: [{ who: 'chef', mood: 'cheer', x: 0.22 }, { who: 'victoria', x: 0.8, scale: 0.86 }],
        say: { who: 'chef', text: 'We did it, Victoria!' },
        sfx: { word: 'HOORAY!', x: 0.52, y: 0.95, size: 44 },
      },
      {
        size: 'half', bg: 'pink', caption: '{moon} cheers the loudest!',
        actors: [
          { who: 'ella', mood: 'happy', x: 0.13, y: 0.67, scale: 0.68 }, { who: 'fife', mood: 'happy', x: 0.38, y: 0.67, scale: 0.68 },
          { who: 'ghuy', mood: 'happy', x: 0.62, y: 0.67, scale: 0.68 }, { who: 'twinkle', mood: 'happy', x: 0.87, y: 0.67, scale: 0.68, flip: true },
          { who: 'bella', mood: 'love', x: 0.25, y: 0.99, scale: 0.68 }, { who: 'moon', mood: 'love', x: 0.5, y: 0.99, scale: 0.72 },
          { who: 'gege', mood: 'love', x: 0.75, y: 0.99, scale: 0.68, flip: true },
        ],
      },
      { size: 'half', bg: 'night', prop: [{ id: 'tbc', y: 0.4 }, { id: 'golden-spoon', x: 0.5, y: 0.8, scale: 0.9 }], actors: [] },
    ],
  }],
};
