export type Person = {
  id: string;
  name: string;
  age: number;
  bio: string;
  work: string;
  prompts: { q: string; a: string }[];
  interests: string[];
  /** Portrait photo URL */
  photo: string;
  /** Extra photos for profile / reveal cards */
  photos: string[];
  /** Fallback gradient if a photo fails to load */
  hue: [string, string];
  /** metres away, updates as people move around */
  distance: number;
  place: string;
};

const img = (id: string, w = 640) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&h=${w}&q=80`;

export const people: Person[] = [
  {
    id: "maya",
    name: "Maya",
    age: 27,
    bio: "Chronically early to everything. Will talk your ear off about ferments.",
    work: "Pastry chef · Ottolenghi",
    prompts: [
      { q: "We'll get along if", a: "you have strong opinions about hot sauce." },
      { q: "Sunday, 9am", a: "Flower market, then an unreasonable amount of coffee." },
    ],
    interests: ["Baking", "Vinyl", "Cold swims"],
    photo: img("photo-1534528741775-53994a69daeb"),
    photos: [
      img("photo-1534528741775-53994a69daeb"),
      img("photo-1524504388940-b1c17226555e", 800),
      img("photo-1488426862026-3ee34a7d66df", 800),
    ],
    hue: ["oklch(0.72 0.17 30)", "oklch(0.78 0.14 60)"],
    distance: 38,
    place: "Brill Place Cafe",
  },
  {
    id: "theo",
    name: "Theo",
    age: 30,
    bio: "Architect who mostly draws staircases nobody will build.",
    work: "Architect · Studio Vale",
    prompts: [
      { q: "My simple pleasure", a: "Walking a new route home from work." },
      { q: "Two truths, one lie", a: "Ex-lifeguard, can't whistle, been to Antarctica." },
    ],
    interests: ["Drawing", "Bouldering", "Jazz"],
    photo: img("photo-1506794778202-cad84cf45f1d"),
    photos: [
      img("photo-1506794778202-cad84cf45f1d"),
      img("photo-1500648767791-00dcc994a43e", 800),
      img("photo-1492562080023-ab3db95bfbce", 800),
    ],
    hue: ["oklch(0.66 0.15 250)", "oklch(0.74 0.13 200)"],
    distance: 64,
    place: "Regent's Canal path",
  },
  {
    id: "nina",
    name: "Nina",
    age: 25,
    bio: "Runs slow, reads fast. Currently 40 pages into three books.",
    work: "Editor · Lantern Press",
    prompts: [
      { q: "The way to win me over", a: "Recommend a book you actually finished." },
      { q: "I'm weirdly attracted to", a: "People who fold their laundry immediately." },
    ],
    interests: ["Books", "Running", "Ceramics"],
    photo: img("photo-1529626455594-4ff0802cfb7e"),
    photos: [
      img("photo-1529626455594-4ff0802cfb7e"),
      img("photo-1494790108377-be9c29b29330", 800),
      img("photo-1517841905240-472988babdf9", 800),
    ],
    hue: ["oklch(0.7 0.16 340)", "oklch(0.78 0.13 20)"],
    distance: 12,
    place: "Platform 4, Old Street",
  },
  {
    id: "ola",
    name: "Ola",
    age: 29,
    bio: "Sound engineer. I hear the fridge hum in every room I enter.",
    work: "Sound engineer · Freelance",
    prompts: [
      { q: "Best travel story", a: "Missed a ferry, got adopted by a fishing crew." },
      { q: "Dating me is like", a: "A very good playlist with two skippable tracks." },
    ],
    interests: ["Synths", "Film", "Cycling"],
    photo: img("photo-1531746020798-e6953c6e8e04"),
    photos: [
      img("photo-1531746020798-e6953c6e8e04"),
      img("photo-1521119983545-0d43bba6b4c9", 800),
      img("photo-1544005313-94ddf0286df2", 800),
    ],
    hue: ["oklch(0.68 0.15 150)", "oklch(0.78 0.13 110)"],
    distance: 91,
    place: "Hoxton Square",
  },
  {
    id: "ren",
    name: "Ren",
    age: 26,
    bio: "I make maps of places that don't exist yet.",
    work: "Illustrator · self-employed",
    prompts: [
      { q: "A shower thought I had", a: "Every city has one perfect bench." },
      { q: "Together we could", a: "Find that bench." },
    ],
    interests: ["Maps", "Tea", "Long walks"],
    photo: img("photo-1507003211169-0a1dd7228f2d"),
    photos: [
      img("photo-1507003211169-0a1dd7228f2d"),
      img("photo-1472099645785-5658abf4ff4e", 800),
      img("photo-1463453091185-61582044d556", 800),
    ],
    hue: ["oklch(0.66 0.14 290)", "oklch(0.75 0.14 330)"],
    distance: 150,
    place: "Barbican Highwalk",
  },
  {
    id: "sam",
    name: "Sam",
    age: 31,
    bio: "Trying to grow tomatoes on a very windy balcony.",
    work: "Physio · Northside Clinic",
    prompts: [
      { q: "My most controversial take", a: "Brunch is a scam. Breakfast at 8, lunch at 1." },
      { q: "I go crazy for", a: "A market stall with one thing on the menu." },
    ],
    interests: ["Gardening", "Football", "Cooking"],
    photo: img("photo-1438761681033-6461ffad8d80"),
    photos: [
      img("photo-1438761681033-6461ffad8d80"),
      img("photo-1548142813-c348350df52b", 800),
      img("photo-1580489944761-15a19d654956", 800),
    ],
    hue: ["oklch(0.7 0.15 80)", "oklch(0.79 0.13 120)"],
    distance: 210,
    place: "Victoria Park gate",
  },
];

export const byId = (id: string) => people.find((p) => p.id === id);

export type Match = {
  personId: string;
  metAt: string;
  where: string;
  lastMessage: string;
  unread: boolean;
};

export const matches: Match[] = [
  {
    personId: "theo",
    metAt: "Today, 08:42",
    where: "Regent's Canal path",
    lastMessage: "Wait — were you the one with the tote bag full of lemons?",
    unread: true,
  },
  {
    personId: "nina",
    metAt: "Yesterday, 18:10",
    where: "Platform 4, Old Street",
    lastMessage: "Same train two days running. The algorithm is our commute.",
    unread: false,
  },
  {
    personId: "sam",
    metAt: "Tue, 12:55",
    where: "Victoria Park gate",
    lastMessage: "Tomato update: three survived the wind.",
    unread: false,
  },
];

export type Message = { id: string; from: "me" | "them"; text: string; time: string };

export const conversations: Record<string, Message[]> = {
  theo: [
    { id: "1", from: "them", text: "Wait — were you the one with the tote bag full of lemons?", time: "08:44" },
    { id: "2", from: "me", text: "Guilty. Making limoncello, badly.", time: "08:46" },
    { id: "3", from: "them", text: "We passed each other three times before the buzz went off.", time: "08:47" },
  ],
  nina: [
    { id: "1", from: "them", text: "Same train two days running. The algorithm is our commute.", time: "18:12" },
    { id: "2", from: "me", text: "Tomorrow I'll wave instead of pretending to read.", time: "18:20" },
  ],
  sam: [
    { id: "1", from: "me", text: "How are the balcony tomatoes holding up?", time: "12:40" },
    { id: "2", from: "them", text: "Tomato update: three survived the wind.", time: "12:55" },
  ],
};

export const encounterFeed = [
  { id: "e1", label: "Crossed paths", personId: "ren", detail: "Barbican Highwalk · 2 min ago" },
  { id: "e2", label: "Near you twice", personId: "ola", detail: "Hoxton Square · 26 min ago" },
  { id: "e3", label: "Crossed paths", personId: "maya", detail: "Brill Place Cafe · 1 hr ago" },
];

export const me = {
  name: "Alex",
  age: 28,
  work: "Product designer · Kite",
  bio: "Walks everywhere. Owns two chairs, both uncomfortable.",
  photo: img("photo-1500648767791-00dcc994a43e"),
  photos: [
    img("photo-1500648767791-00dcc994a43e", 800),
    img("photo-1472099645785-5658abf4ff4e", 800),
    img("photo-1519085360753-af0119f7cbe7", 800),
  ],
  hue: ["oklch(0.68 0.18 25)", "oklch(0.78 0.15 60)"] as [string, string],
  prompts: [
    { q: "The last thing I got excited about", a: "A bakery that opens at 6am near my flat." },
    { q: "Best way to ask me out", a: "Say where you'll be. I'll probably already be walking there." },
  ],
  interests: ["Walking", "Ceramics", "Espresso", "Bad films"],
};
