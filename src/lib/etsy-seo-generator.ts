/**
 * Etsy SEO & Listing Metadata Generator
 * Generates high-converting, keyword-dense English Titles (max 140 chars),
 * 13 Etsy Tags (under 20 chars each), and complete formatted English Descriptions
 * for Etsy Sticker Bundles, Single Stickers, and POD Apparel.
 */

export interface EtsySeoData {
  title: string;
  charCount: number;
  wordCount: number;
  tags: string[];
  description: string;
}

// English Category Names & Keywords Dictionary (Optimized with Golden SEO Formula)
const CATEGORY_SEO_DICT: Record<string, {
  name: string;
  goldenBundleTitle?: string;
  themeTags: string[];
  bundleKeywords: string[];
  singleKeywords: string[];
  descriptionHighlights: string[];
}> = {
  axolotlemote: {
    name: 'Baby Axolotl Emotes & Reactions',
    goldenBundleTitle: 'Axolotl Twitch Emotes PNG, Cute Baby Axolotl Discord Emotes, Kawaii GoodNotes Planner Stickers, Streamer Graphics Pack, Instant Download',
    themeTags: [
      'axolotl emotes',
      'twitch emotes pack',
      'discord emotes cute',
      'streamer graphics',
      'kawaii axolotl art',
      'goodnotes stickers',
      'reaction stickers'
    ],
    bundleKeywords: [
      'Cute Axolotl Twitch Emotes Bundle',
      'Discord Streamer Reaction Clipart',
      'Baby Axolotl Die Cut Stickers'
    ],
    singleKeywords: ['Axolotl Twitch Emote PNG', 'Discord Reaction Clipart', 'Baby Axolotl Sticker Cut'],
    descriptionHighlights: [
      '🌸 20 Adorable Baby Pink Axolotl emotes & reaction poses (Hi, Love, Boba Sip, GG Gamer, Hype, Cry, Pout, Zzz Sleep, Coffee & Blanket Burrito)',
      '🎮 Perfect for Twitch streamers, Discord community servers, GoodNotes digital planners, and iMessage',
      '✨ Includes 300 DPI high-res transparent PNGs ready for immediate use'
    ]
  },
  axolotl: {
    name: 'Cute Axolotl & Aquatic Friends',
    goldenBundleTitle: 'Digital Stickers PNG, Cute Axolotl GoodNotes Stickers, Pastel Aquatic Sea Creature Clipart, Planner Decal Bundle, Instant Download',
    themeTags: [
      'axolotl stickers',
      'cute sea creatures',
      'boba axolotl clipart',
      'aquatic animal decals',
      'pastel ocean sticker',
      'goodnotes stickers',
      'kawaii marine life'
    ],
    bundleKeywords: [
      'Axolotl Stickers PNG Bundle',
      'Pastel Marine Animal Clipart',
      'Cute Axolotl Die Cut'
    ],
    singleKeywords: ['Cute Axolotl Sticker PNG', 'Pastel Marine Clipart', 'Axolotl Die Cut'],
    descriptionHighlights: [
      '🌸 Adorable baby pink axolotls paired with cozy items (Boba tea, Marimo moss, Strawberry milk, Water lily)',
      '🌊 Soft pastel kawaii aquatic aesthetic for planners, journals, and Cricut decals',
      '✨ High-resolution 300 DPI transparent PNG files'
    ]
  },
  deepsea: {
    name: 'Bioluminescent Deep Sea Creatures',
    goldenBundleTitle: 'Deep Sea Digital Stickers PNG, Glowing Jellyfish GoodNotes Stickers, Bioluminescent Ocean Creature Clipart, Planner Decal Bundle, Instant Download',
    themeTags: [
      'deep sea stickers',
      'glowing jellyfish',
      'bioluminescent art',
      'dumbo octopus decal',
      'anglerfish clipart',
      'neon ocean stickers',
      'marine biology cut'
    ],
    bundleKeywords: [
      'Deep Sea Stickers PNG Bundle',
      'Bioluminescent Creature Clipart',
      'Neon Ocean Animal Die Cut'
    ],
    singleKeywords: ['Deep Sea Sticker PNG', 'Bioluminescent Clipart', 'Glowing Marine Die Cut'],
    descriptionHighlights: [
      '🌊 Mysterious glowing bioluminescent deep sea creatures (Dumbo octopus, Crystal jellyfish, Baby anglerfish, Sea bunny)',
      '✨ Vibrant neon cyan, emerald & magenta glow effects on clean white backgrounds',
      '🤿 Perfect for ocean enthusiasts, science journals, laptop skins, and GoodNotes planners'
    ]
  },
  halloween: {
    name: 'Halloween Spooky Cute',
    goldenBundleTitle: 'Cute Animal Digital Stickers, Spooky Halloween GoodNotes Stickers, Ghost Pumpkin Clipart, Printable Die Cut Decal Bundle, Instant Download PNG',
    themeTags: [
      'halloween stickers',
      'spooky cute sticker',
      'ghost pumpkin clipart',
      'witch cauldron decal',
      'autumn party favors',
      'black cat stickers',
      'trick or treat cut'
    ],
    bundleKeywords: [
      'Halloween Stickers PNG Bundle',
      'Ghost Pumpkin Cauldron Clipart',
      'Autumn Party Die Cut'
    ],
    singleKeywords: ['Halloween Sticker PNG', 'Ghost Pumpkin Clipart', 'Autumn Holiday Die Cut'],
    descriptionHighlights: [
      '🎃 Spooky cute Halloween illustrations (Ghosts, Pumpkins, Witch Cauldrons, Magic Potions, Black Cats & Bats)',
      '✨ Pastel goth & kawaii aesthetic suitable for all ages',
      '🍬 Perfect for Halloween party favors, treat bags, planner spreads, and trick-or-treat crafts'
    ]
  },
  terrarium: {
    name: 'Succulent Terrarium Plants',
    goldenBundleTitle: 'Digital Stickers PNG, Cute Succulent Terrarium GoodNotes Stickers, Botanical Plant Clipart, Printable Planner Decal Bundle, Instant Download',
    themeTags: [
      'terrarium stickers',
      'succulent plants cut',
      'cactus jar clipart',
      'botanical stickers',
      'plant lover gift',
      'teacup garden decal',
      'greenery planner'
    ],
    bundleKeywords: [
      'Succulent Terrarium Stickers PNG Bundle',
      'Glass Jar Cactus Clipart',
      'Botanical Plants Die Cut'
    ],
    singleKeywords: ['Succulent Terrarium Sticker PNG', 'Glass Jar Cactus Clipart', 'Botanical Plant Die Cut'],
    descriptionHighlights: [
      '🌱 Cozy botanical terrariums, miniature glass jars, and teacup succulent gardens',
      '🌿 Lush indoor greenery, pastel pots, and relaxing cottagecore vibes',
      '💚 Ideal for plant moms, gardening planners, water bottle decals, and laptop skins'
    ]
  },
  vivarium: {
    name: 'Vivarium Reptile & Amphibian Friends',
    goldenBundleTitle: 'Digital Stickers PNG, Cute Moss Vivarium GoodNotes Stickers, Frog & Gecko Reptile Clipart, Botanical Terrarium Decal Pack, Instant Download',
    themeTags: [
      'vivarium stickers',
      'tree frog stickers',
      'gecko lizard clipart',
      'reptile pet decals',
      'amphibian stickers',
      'moss habitat clipart',
      'terrarium animals'
    ],
    bundleKeywords: [
      'Vivarium Habitat Stickers PNG Bundle',
      'Tree Frog Gecko Chameleon Clipart',
      'Reptile Pet Die Cut'
    ],
    singleKeywords: ['Vivarium Habitat Sticker PNG', 'Tree Frog Gecko Clipart', 'Reptile Pet Die Cut'],
    descriptionHighlights: [
      '🦎 Charming vivarium pets (Baby Geckos, Chameleons, Tiny Tree Frogs, and Salamanders)',
      '🌿 Natural mossy logs, jungle foliage, and healthy above-water habitats',
      '🐸 Perfect for reptile enthusiasts, biology notebooks, nature journals, and vivarium tanks'
    ]
  },
  saltaquarium: {
    name: 'Saltwater Reef Aquarium',
    goldenBundleTitle: 'Digital Stickers PNG, Cute Ocean Aquarium GoodNotes Stickers, Saltwater Coral Reef Fish Clipart, Printable Sea Life Decal, Instant Download',
    themeTags: [
      'saltwater aquarium',
      'coral reef clipart',
      'clownfish stickers',
      'ocean animal decals',
      'marine life clipart',
      'sea turtle stickers',
      'tropical fish tank'
    ],
    bundleKeywords: [
      'Saltwater Aquarium Stickers PNG Bundle',
      'Clownfish Coral Reef Clipart',
      'Marine Animals Die Cut'
    ],
    singleKeywords: ['Saltwater Aquarium Sticker PNG', 'Coral Reef Clipart', 'Ocean Animal Die Cut'],
    descriptionHighlights: [
      '🐠 Vibrant saltwater reef tanks (Clownfish, Blue Tang, Sea Anemones, Seahorses & Sea Turtles)',
      '🌊 Bright marine ecosystems with glowing corals and aquatic flora',
      '🤿 Great for ocean lovers, marine biology students, beach planners, and scuba scrapbooks'
    ]
  },
  freshaquarium: {
    name: 'Freshwater Planted Aquarium',
    goldenBundleTitle: 'Digital Stickers PNG, Cute Freshwater Aquarium GoodNotes Stickers, Betta Fish & Aquatic Plants Clipart, Printable Decal Pack, Instant Download',
    themeTags: [
      'freshwater aquarium',
      'betta fish stickers',
      'planted tank clipart',
      'aquascaping decals',
      'guppy snail aquatic',
      'water lily stickers',
      'fish lover gift'
    ],
    bundleKeywords: [
      'Freshwater Aquarium Stickers PNG Bundle',
      'Betta Guppy Fish Clipart',
      'Planted Tank Die Cut'
    ],
    singleKeywords: ['Freshwater Aquarium Sticker PNG', 'Betta Fish Clipart', 'Planted Tank Die Cut'],
    descriptionHighlights: [
      '🐟 Peaceful freshwater tanks (Betta Splendens, Guppies, Neon Tetras, Apple Snails & Shrimps)',
      '🌿 Lush aquascapes with driftwood, water lilies, and crystal-clear bubbling water',
      '🫧 Perfect for fishkeeping hobbyists, aquarists, water bottles, and digital journals'
    ]
  },
  booktok: {
    name: 'Cozy Book Club & Reading',
    goldenBundleTitle: 'Bookish Digital Stickers, Cute Booktok GoodNotes Stickers, Cozy Reading Animal Clipart, Reader Gift Printable Decal Bundle, Instant Download PNG',
    themeTags: [
      'booktok stickers',
      'bookish girlie decal',
      'reading club clipart',
      'cozy bookworm gift',
      'ereader case sticker',
      'book tracker deco',
      'fantasy reader'
    ],
    bundleKeywords: [
      'Book Club Stickers PNG Bundle',
      'Bookish Girlie Reading Clipart',
      'Cozy Bookworm Die Cut'
    ],
    singleKeywords: ['Book Club Sticker PNG', 'Bookish Reading Clipart', 'Cozy Bookworm Die Cut'],
    descriptionHighlights: [
      '📚 Cozy book lovers & bookish aesthetic (Cute Reading Animals, Pastels, E-Readers & Reading Nooks)',
      '☕ Perfect for e-reader clear cases, digital reading journals, book trackers & planners',
      '✨ Warm, aesthetic hand-drawn illustrations for hopeless romantics, bookworms & fantasy readers'
    ]
  },
  dessert: {
    name: 'Sweet Dessert Bakery Cafe',
    goldenBundleTitle: 'Cute Food Digital Stickers, Sweet Bakery GoodNotes Sticker Pack, Pastel Dessert Clipart, Printable Cafe Planner Decal, Instant Download PNG',
    themeTags: [
      'dessert stickers',
      'bakery clipart',
      'cute food stickers',
      'pastry planner decal',
      'boba cafe stickers',
      'sweet treats clipart',
      'cupcake stickers'
    ],
    bundleKeywords: [
      'Dessert Stickers PNG Bundle',
      'Sweet Bakery Clipart Cute',
      'Cafe Pastry Die Cut'
    ],
    singleKeywords: ['Sweet Dessert Sticker PNG', 'Bakery Pastry Clipart', 'Cute Cafe Die Cut'],
    descriptionHighlights: [
      '🥞 Mouthwatering sweet desserts & pastries (Soufflé Pancakes, Croissants, Boba, Shortcake & Mochi Donuts)',
      '🍓 Kawaii aesthetic bakery treats paired with adorable cozy animal companions',
      '🧁 Ideal for bullet journals, recipe scrapbooks, digital planners, and water bottle decals'
    ]
  },
  socialbattery: {
    name: 'Introvert & Social Battery Humor',
    goldenBundleTitle: 'Introvert Digital Stickers, Low Social Battery GoodNotes Stickers, Funny Mood Badge Clipart, Sarcastic Meme Decal Pack, Instant Download PNG',
    themeTags: [
      'social battery meme',
      'introvert stickers',
      'funny mood badge',
      'low energy decals',
      'relatable sloth cut',
      'overstimulated art',
      'burnout humor deco'
    ],
    bundleKeywords: [
      'Social Battery Stickers PNG Bundle',
      'Introvert Meme Clipart Cute',
      'Low Energy Die Cut'
    ],
    singleKeywords: ['Social Battery Sticker PNG', 'Introvert Humor Clipart', 'Low Battery Die Cut'],
    descriptionHighlights: [
      '🔋 Relatable introvert & mental health humor (1% Battery Sloth, Overstimulated Hamster & Blanket Burritos)',
      '☕ Perfect self-care and burnout normalization stickers for laptops, insulated tumblers, and iPads',
      '💜 Funny, empathetic designs for homebodies, students, and exhausted professionals'
    ]
  },
  hangul: {
    name: 'Korean Hangul & K-Vibe Animals',
    goldenBundleTitle: 'Korean Digital Stickers, Cute Hangul GoodNotes Sticker Pack, KDrama Polco Deco Clipart, Printable Journal Decal Bundle, Instant Download PNG',
    themeTags: [
      'korean stickers',
      'hangul sticker pack',
      'kdrama polco deco',
      'kpop photocard cut',
      'korean calligraphy',
      'korea journal deco',
      'cute hangul clipart'
    ],
    bundleKeywords: [
      'Korean Hangul Stickers PNG Bundle',
      'Cute K-Drama Clipart Set',
      'Polco Deco Die Cut'
    ],
    singleKeywords: ['Korean Hangul Sticker PNG', 'Cute K-Drama Clipart', 'Polco Deco Die Cut'],
    descriptionHighlights: [
      '🇰🇷 Cute Korean Hangul calligraphy paired with English subtitles & endearing baby animals',
      '💖 Iconic Korean emotional words & phrases (Gwenchana, Daebak, Bungeoppang, Saranghae & Healing)',
      '✨ Essential for K-pop photocard decorating (Polco), Korean study journals, and travel scrapbooks'
    ]
  },
  christmas: {
    name: 'Cozy Christmas Holiday',
    goldenBundleTitle: 'Winter Digital Stickers PNG, Cute Snowglobe GoodNotes Stickers, New Year Holiday Clipart, Cozy Christmas Planner Decal, Instant Download',
    themeTags: [
      'christmas stickers',
      'snowglobe clipart',
      'winter holiday decal',
      'gingerbread santa',
      'holiday gift tags',
      'cozy christmas art',
      'xmas planner deco'
    ],
    bundleKeywords: [
      'Christmas Holiday Stickers PNG Bundle',
      'Winter Snowglobe Clipart',
      'Santa Gingerbread Die Cut'
    ],
    singleKeywords: ['Christmas Holiday Sticker PNG', 'Winter Snowglobe Clipart', 'Santa Holiday Die Cut'],
    descriptionHighlights: [
      '🎄 Whimsical holiday designs (Snowglobes, Gingerbread Men, Santa, Reindeer & Hot Cocoa)',
      '❄️ Warm winter aesthetic with festive sparkles and pastel holiday charm',
      '🎁 Ideal for holiday gift tags, Christmas card making, advent calendars, and seasonal packaging'
    ]
  },
  thanksgiving: {
    name: 'Autumn Harvest Thanksgiving',
    goldenBundleTitle: 'Autumn Digital Stickers, Cute Thanksgiving Fall GoodNotes Stickers, Harvest Pumpkin Clipart, Printable Die Cut Decal, Instant Download PNG',
    themeTags: [
      'thanksgiving sticker',
      'fall harvest clipart',
      'pumpkin spice decal',
      'autumn leaves craft',
      'turkey day stickers',
      'gratitude journal',
      'cozy november art'
    ],
    bundleKeywords: [
      'Thanksgiving Fall Stickers PNG Bundle',
      'Harvest Pumpkin Spice Clipart',
      'Turkey Leaves Die Cut'
    ],
    singleKeywords: ['Thanksgiving Fall Sticker PNG', 'Harvest Pumpkin Clipart', 'Autumn Leaves Die Cut'],
    descriptionHighlights: [
      '🍂 Warm autumn vibes (Pumpkin Spice, Turkey, Acorns, Golden Fall Leaves & Warm Sweaters)',
      '🥧 Cozy harvest aesthetic celebrating gratitude, family gatherings, and cozy November days',
      '🍁 Perfect for gratitude journals, thanksgiving menus, recipe cards, and fall planners'
    ]
  },
  valentines: {
    name: 'Valentines Sweet Hearts',
    goldenBundleTitle: 'Cute Valentines Digital Stickers, Romantic Heart GoodNotes Sticker Pack, Pastel Love Clipart, Printable Planner Decal, Instant Download PNG',
    themeTags: [
      'valentines stickers',
      'romantic heart deco',
      'pastel love clipart',
      'sweetheart stickers',
      'cupid love potion',
      'couples gift decals',
      'february planner'
    ],
    bundleKeywords: [
      'Valentines Day Stickers PNG Bundle',
      'Heart Love Potion Clipart',
      'Cupid Sweets Die Cut'
    ],
    singleKeywords: ['Valentines Day Sticker PNG', 'Heart Love Clipart', 'Romantic Sweets Die Cut'],
    descriptionHighlights: [
      '💖 Romantic pastel hearts, love letters, chocolate boxes, and adorable animal sweethearts',
      '💌 Sweet Valentine aesthetics for scrapbooking, couples gifts, and Galentines celebrations'
    ]
  },
  easter: {
    name: 'Spring Easter Bunny',
    goldenBundleTitle: 'Cute Easter Digital Stickers, Spring Bunny GoodNotes Sticker Pack, Pastel Floral Egg Clipart, Printable Planner Decal, Instant Download PNG',
    themeTags: [
      'easter bunny sticker',
      'spring floral eggs',
      'pastel chick clipart',
      'easter basket decals',
      'spring wildflower',
      'easter planner deco',
      'cute rabbit clipart'
    ],
    bundleKeywords: [
      'Easter Bunny Stickers PNG Bundle',
      'Spring Floral Egg Clipart',
      'Pastel Chick Die Cut'
    ],
    singleKeywords: ['Easter Bunny Sticker PNG', 'Spring Floral Egg Clipart', 'Pastel Chick Die Cut'],
    descriptionHighlights: [
      '🐰 Fluffy baby bunnies, pastel decorated eggs, yellow chicks, and fresh spring wildflowers'
    ]
  },
  stpatrick: {
    name: 'St Patricks Lucky Shamrocks',
    goldenBundleTitle: 'Lucky Digital Stickers PNG, Cute St Patricks GoodNotes Stickers, Shamrock Clover Clipart, Planner Decal Bundle, Instant Download',
    themeTags: [
      'st patricks sticker',
      'lucky clover decal',
      'shamrock gold coin',
      'irish festival art',
      'green lucky charm',
      'march planner deco',
      'rainbow pot of gold'
    ],
    bundleKeywords: [
      'St Patricks Day Stickers PNG Bundle',
      'Lucky Clover Gold Clipart',
      'Irish Festival Die Cut'
    ],
    singleKeywords: ['St Patricks Day Sticker PNG', 'Lucky Clover Clipart', 'Irish Festival Die Cut'],
    descriptionHighlights: [
      '🍀 Four-leaf clovers, glittering pots of gold, cute rainbows, and lucky charms'
    ]
  },
  mothersday: {
    name: 'Mothers Day Floral Gifts',
    goldenBundleTitle: 'Floral Digital Stickers PNG, Cute Mothers Day GoodNotes Stickers, Teacup Rose Clipart, Printable Planner Decal Bundle, Instant Download',
    themeTags: [
      'mothers day sticker',
      'floral teacup rose',
      'mom gift clipart',
      'peony bloom decals',
      'carnation bouquet',
      'spring flower art',
      'mother day planner'
    ],
    bundleKeywords: [
      'Mothers Day Stickers PNG Bundle',
      'Floral Teacup Rose Clipart',
      'Greeting Card Die Cut'
    ],
    singleKeywords: ['Mothers Day Sticker PNG', 'Floral Teacup Rose Clipart', 'Greeting Card Die Cut'],
    descriptionHighlights: [
      '💐 Vintage floral teacups, carnation mason jars, peony blooms, and mother-baby animal warmth'
    ]
  }
};

// Korean keyword to English keyword translation dictionary for individual stickers
const KO_EN_TRANSLATE: [RegExp, string][] = [
  [/물약|플라스크/i, 'Magic Potion Flask'],
  [/호박|잭오랜턴|펌킨/i, 'Pumpkin Jack O Lantern'],
  [/유령|고스트/i, 'Spooky Ghost'],
  [/가마솥/i, 'Witch Cauldron'],
  [/마녀.*모자/i, 'Witch Hat'],
  [/빗자루/i, 'Magic Broomstick'],
  [/흑고양이|검은.*고양이/i, 'Black Cat'],
  [/고양이/i, 'Kitten Cat'],
  [/박쥐/i, 'Baby Bat Wings'],
  [/해골|스컬/i, 'Skeleton Skull'],
  [/거미|거미줄/i, 'Spider Web'],
  [/사탕|캔디/i, 'Halloween Candy'],
  [/롤리팝/i, 'Lollipop Sweets'],
  [/미라/i, 'Spooky Mummy'],
  [/늑대인간/i, 'Baby Werewolf'],
  [/다육|선인장/i, 'Succulent Cactus'],
  [/테라리움/i, 'Terrarium Glass Jar'],
  [/비바리움/i, 'Vivarium Habitat'],
  [/개구리/i, 'Tree Frog'],
  [/도마뱀|게코/i, 'Gecko Lizard'],
  [/카멜레온/i, 'Chameleon Lizard'],
  [/스노우볼/i, 'Winter Snowglobe'],
  [/크리스마스/i, 'Christmas Holiday'],
  [/추수감사절/i, 'Thanksgiving Harvest'],
  [/어항|열대어/i, 'Aquarium Fish Tank'],
  [/해수어/i, 'Reef Clownfish'],
  [/베타/i, 'Betta Splendens Fish'],
  [/구피/i, 'Guppy Fish'],
  [/달팽이|스네일/i, 'Apple Snail'],
  [/새우/i, 'Cherry Shrimp'],
  [/강아지/i, 'Puppy Dog'],
  [/토끼/i, 'Bunny Rabbit'],
  [/레서판다/i, 'Red Panda'],
  [/햄스터/i, 'Hamster Pet'],
  [/수달/i, 'Sea Otter Pup'],
  [/북톡|독서|책/i, 'Book Club Reading'],
  [/킨들/i, 'E-Reader Tablet'],
  [/책탑/i, 'Book Stack'],
  [/책갈피/i, 'Bookmark Ribbon'],
  [/북\s*카트/i, 'Book Cart'],
  [/뱃지/i, 'Bookish Badge'],
  [/팬케이크|와플/i, 'Pancakes Dessert'],
  [/크루아상|크루키/i, 'Croissant Bakery'],
  [/버블티|보바/i, 'Boba Tea Drink'],
  [/도넛|마카롱|타르트/i, 'Pastry Treat'],
  [/배터리|방전/i, 'Social Battery 1%'],
  [/과부하|오버/i, 'Overstimulated Humor'],
  [/내향인|집순이/i, 'Introvert Homebody'],
  [/괜찮아/i, 'Gwenchana It is OK'],
  [/대박/i, 'Daebak Awesome'],
  [/반짝반짝/i, 'Sparkle Bling'],
  [/붕어빵/i, 'Bungeoppang Pastry'],
  [/파이팅/i, 'Fighting Cheer Up'],
  [/사랑해/i, 'Saranghae Love'],
  [/한글/i, 'Korean Hangul']
];

function translateKoItemToEnglish(koreanText: string): string {
  if (!koreanText) return 'Artwork';
  
  // Clean brackets and prefixes
  const clean = koreanText
    .replace(/\[.*?\]/g, '')
    .replace(/[🖼️🎃🎄🦎🐠🐟🐾🌱]/g, '')
    .trim();

  for (const [pattern, enWord] of KO_EN_TRANSLATE) {
    if (pattern.test(clean)) {
      return enWord;
    }
  }

  // Fallback: If clean contains English words, extract them
  const engWords = clean.replace(/[^a-zA-Z0-9\s]/g, '').trim();
  if (engWords.length > 3) return engWords;

  return 'Illustration';
}

/**
 * Enforces Etsy's strict title guidelines:
 * 1. Strictly 14 words or less (Etsy tip: "Consider using 14 words or less")
 * 2. Strictly removes subjective words (Etsy tip: "Try moving subjective words to the description: 'cute'")
 *    Subjective words filtered out: cute, kawaii, lovely, beautiful, pretty, sweet, aesthetic, adorable
 * 3. Keeps length under 140 chars while maintaining high-value search intent.
 */
/**
 * Enforces Etsy's strict title guidelines:
 * 1. Ensures highest-value search keywords (e.g. Digital Stickers PNG, GoodNotes Stickers) are at the front.
 * 2. Keeps total length strictly under 140 characters.
 */
export function sanitizeAndEnforceEtsyTitle(rawTitle: string, maxWords = 20, maxChars = 138): string {
  // 1. Clean excessive spaces, double commas and trims
  const cleaned = rawTitle
    .replace(/\s+/g, ' ')
    .replace(/,\s*,/g, ',')
    .replace(/^[\s,]+|[\s,]+$/g, '')
    .trim();

  // 2. Ensure character limit under 140 chars
  if (cleaned.length <= maxChars) {
    return cleaned;
  }

  // Truncate at comma boundary to keep clean keywords
  const parts = cleaned.split(/,\s*/);
  const selectedParts: string[] = [];
  let currentLen = 0;

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const additionalLen = selectedParts.length > 0 ? trimmed.length + 2 : trimmed.length;
    if (currentLen + additionalLen <= maxChars) {
      selectedParts.push(trimmed);
      currentLen += additionalLen;
    } else {
      break;
    }
  }

  let result = selectedParts.join(', ');
  if (!result || result.length < 20) {
    result = cleaned.slice(0, maxChars).trim().replace(/,$/, '');
  }

  return result;
}

/**
 * Enforces Pinterest's strict 100-character title limit:
 * Truncates gracefully at comma boundaries so no words are awkwardly cut off,
 * keeping the highest-volume keywords intact (under 100 chars).
 */
export function formatPinterestTitle(rawTitle: string, maxChars = 100): string {
  if (!rawTitle) return '';
  const cleaned = rawTitle.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= maxChars) return cleaned;

  const parts = cleaned.split(/,\s*/);
  const selected: string[] = [];
  let currentLen = 0;

  for (const part of parts) {
    const p = part.trim();
    if (!p) continue;
    const addedLen = selected.length > 0 ? p.length + 2 : p.length;
    if (currentLen + addedLen <= maxChars) {
      selected.push(p);
      currentLen += addedLen;
    } else {
      break;
    }
  }

  let result = selected.join(', ');
  if (!result || result.length < 15) {
    result = cleaned.slice(0, maxChars).trim().replace(/[, -]+$/, '');
  }
  return result;
}

/**
 * Generate Etsy SEO Title, Description, and Tags
 */
export function generateEtsySeo(design: any, packCount?: number): EtsySeoData {
  if (!design) {
    const fallbackTitle = 'Digital Stickers PNG, Cute GoodNotes Stickers Clipart, Printable Planner Decal Bundle, Instant Download';
    return {
      title: fallbackTitle,
      charCount: fallbackTitle.length,
      wordCount: fallbackTitle.split(/\s+/).filter(Boolean).length,
      tags: ['digital stickers', 'goodnotes stickers', 'printable stickers', 'planner clipart', 'instant download'],
      description: 'High-quality digital download.'
    };
  }

  const titleRaw = (design.title || '').trim();
  const topicRaw = (design.topic || '').trim();
  const subKey = (design.sticker_sub || 'other').toLowerCase();
  const isPod = design.design_type === 'pod';
  const isCover = (
    titleRaw.includes('마스터') ||
    titleRaw.includes('대표 커버') ||
    titleRaw.includes('대표 표지') ||
    titleRaw.includes('Master Cover') ||
    titleRaw.includes('Bundle Cover')
  );

  const isExplicitSingle = (
    packCount === 1 ||
    titleRaw.includes('단일') ||
    titleRaw.includes('단독') ||
    titleRaw.includes('single') ||
    (/\d+\/20/.test(titleRaw) && !isCover)
  );

  const isBundle = !isPod && !isExplicitSingle && (
    isCover ||
    (packCount !== undefined && packCount > 1) ||
    titleRaw.includes('40종') ||
    titleRaw.includes('20종') ||
    titleRaw.includes('팩') ||
    titleRaw.includes('번들') ||
    titleRaw.includes('bundle')
  );

  let matchedSubKey = subKey;
  if (!CATEGORY_SEO_DICT[matchedSubKey]) {
    const t = `${titleRaw} ${topicRaw}`.toLowerCase();
    if (t.includes('이모트') || t.includes('emote')) matchedSubKey = 'axolotlemote';
    else if (t.includes('우파루파') || t.includes('axolotl')) matchedSubKey = 'axolotl';
    else if (t.includes('심해') || t.includes('deepsea') || t.includes('deep sea')) matchedSubKey = 'deepsea';
  }

  const themeInfo = CATEGORY_SEO_DICT[matchedSubKey] || {
    name: 'Cute Kawaii',
    goldenBundleTitle: 'Digital Stickers PNG, Cute Kawaii GoodNotes Stickers, Aesthetic Clipart Decal Bundle, Instant Download',
    themeTags: ['kawaii stickers', 'cute animal clipart', 'aesthetic decals', 'pastel stickers', 'journal clipart', 'korean deco stickers', 'cute character art'],
    bundleKeywords: ['Digital Stickers PNG Bundle', 'Cute Kawaii Clipart Set', 'Aesthetic Die Cut Digital Download', 'GoodNotes Planner Decal'],
    singleKeywords: ['Digital Sticker PNG', 'Cute Kawaii Clipart', 'Die Cut Digital Download', 'Printable Cut File'],
    descriptionHighlights: ['✨ Cute and aesthetic digital illustrations crafted with vibrant colors and crisp details.']
  };

  // Determine item count (e.g. 40 or 20)
  let count = packCount || (titleRaw.includes('40') || topicRaw.includes('40') ? 40 : 20);

  let finalTitle = '';
  let finalTags: string[] = [];

  if (isPod) {
    // 1. POD T-Shirt Apparel Mode
    let cleanTopic = translateKoItemToEnglish(titleRaw || topicRaw)
      .replace(/^(vintage|cute|aesthetic|kawaii)\s+/i, '')
      .replace(/\s+(t-shirt|tshirt|shirt|tee)\b/ig, '')
      .trim();
    if (!cleanTopic) cleanTopic = 'Graphic Art';

    finalTitle = sanitizeAndEnforceEtsyTitle(
      `${cleanTopic} T-Shirt Design PNG, Retro Graphic Tee Clipart, DTG Sublimation Apparel Digital Download`,
      20,
      138
    );
    finalTags = [
      'graphic tee png', 'sublimation design', 'dtg t shirt art', 'vintage apparel',
      'animal shirt png', 'retro graphic tee', 'clipart download', 'commercial use',
      't shirt design', 'trending graphic', 'digital download', 'merch design', 'dtg printing'
    ];
  } else if (isBundle) {
    // 2. Sticker Pack / Bundle Mode (Golden SEO Formula 100% Enforced)
    if (themeInfo.goldenBundleTitle) {
      finalTitle = sanitizeAndEnforceEtsyTitle(themeInfo.goldenBundleTitle, 20, 138);
    } else {
      finalTitle = sanitizeAndEnforceEtsyTitle(
        `Digital Stickers PNG, Cute ${themeInfo.name} GoodNotes Stickers, Printable Clipart Decal Bundle, Instant Download`,
        20,
        138
      );
    }

    const commonBundleTags = [
      'digital stickers png',
      'goodnotes stickers',
      'planner stickers',
      'printable stickers',
      'cricut cut file',
      'instant download'
    ];

    const specificThemeTags = themeInfo.themeTags && themeInfo.themeTags.length > 0
      ? themeInfo.themeTags
      : [`${subKey} stickers`, 'cute clipart bundle', 'die cut decals', 'aesthetic stickers', 'scrapbook clipart', 'commercial use', 'transparent png'];

    // Combine: Theme Specific (7) + High-Volume Common (6) = Exactly 13 Perfect Tags
    finalTags = [
      ...specificThemeTags.slice(0, 7),
      ...commonBundleTags
    ];
  } else {
    // 3. Single Standalone Sticker Mode (Golden SEO Formula 100% Enforced)
    let enItemName = translateKoItemToEnglish(titleRaw || topicRaw)
      .replace(/^(cute|kawaii|sweet|pretty)\s+/i, '')
      .replace(/\s+sticker\b/i, '')
      .trim();
    if (!enItemName) enItemName = 'Artwork';

    finalTitle = sanitizeAndEnforceEtsyTitle(
      `Digital Sticker PNG, Cute ${enItemName} GoodNotes Clipart, Printable Die Cut Decal, Instant Download`,
      20,
      138
    );

    const specificSingleTags = themeInfo.themeTags && themeInfo.themeTags.length > 0
      ? themeInfo.themeTags.slice(0, 4)
      : [`${subKey} sticker`, 'cute clipart'];

    finalTags = [
      `${enItemName.toLowerCase().slice(0, 16)} sticker`.slice(0, 20),
      `${enItemName.toLowerCase().slice(0, 12)} clipart`.slice(0, 20),
      ...specificSingleTags,
      'digital sticker png',
      'goodnotes sticker',
      'printable sticker',
      'die cut decal',
      'cricut cut file',
      'planner decal',
      'instant download'
    ];
  }

  // Ensure exactly 13 tags under 20 chars
  finalTags = Array.from(new Set(finalTags.map(t => t.trim().slice(0, 20)).filter(Boolean))).slice(0, 13);

  // Generate Complete Structured Description
  const numSheets = count > 20 ? 2 : 1;
  const description = `✨ Welcome to our Shop! ✨

Looking for charming, ultra-high-resolution designs for your creative projects?
This instant digital download bundle includes premium, professionally crafted transparent PNG files ready for printing, cutting, and digital crafting!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 WHAT IS INCLUDED IN THIS DOWNLOAD:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${isPod ? `• 1 High-Resolution Transparent PNG File (300 DPI, 4500x5400px print-ready at native POD scale)
• Perfect for Direct-to-Garment (DTG), Sublimation, Screen Printing, Posters & Mugs
• Commercial Use Included` : (isBundle ? `• ${count} Individual High-Resolution Transparent PNG Files (300 DPI, 2000px+ with crisp die-cut white outline)
• ${numSheets} Printable A4 Sticker Sheet${numSheets > 1 ? 's' : ''} (Transparent PNG for craft cutting machines & Print-Then-Cut)
• ${numSheets} Printable A4 Sticker Sheet${numSheets > 1 ? 's' : ''} (Solid White Background for easy hand scissors cutting)
• 1 Master Collection Cover Artwork (300 DPI high-resolution)` : `• 1 Individual High-Resolution Transparent PNG File (300 DPI, 2000px+ with crisp die-cut white outline)
• Commercial Use & Personal Crafting Use Included`)}
• 100% Crisp 300 DPI – Ultra-sharp, vibrant printing with ZERO pixelation
• Clean, transparent backgrounds (no messy edges or unwanted boxes)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎨 THEME & ARTWORK HIGHLIGHTS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${themeInfo.descriptionHighlights.join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✂️ COMPATIBILITY & SOFTWARE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
These high-quality PNG files work seamlessly with popular crafting software:
• Electronic craft cutting software & vinyl cutters (Print-Then-Cut compatible)
• Digital note-taking & digital planner apps for tablets
• Graphic design editors (Photoshop, Illustrator, Procreate, Canva & Inkscape)
• Standard Home Inkjet & Laser Printers

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 PERFECT FOR:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Die-cut stickers, planner stickers, bullet journals & scrapbooking
• Water bottle, laptop, phone case, tumbler & e-reader decals
• Greeting cards, party favors, invitations & gift tags
• POD merchandise: T-shirts, tote bags, hoodies, mugs, and pillows
• DIY vinyl projects, embroidery mockups, and resin crafts

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📥 HOW TO DOWNLOAD YOUR FILES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Click "Add to Cart" and complete your purchase.
2. Once payment is confirmed, your files will be available for instant download.
3. Access your downloads anytime via:
   👉 Etsy Website: Go to "Your Account" > "Purchases and Reviews" > click "Download Files".
4. Unzip the downloaded folder on your PC or Mac and enjoy creating!
*(Please note: The Etsy mobile app does not currently support file downloads; please use a web browser on mobile or PC.)*

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚖️ COMMERCIAL LICENSE & TERMS OF USE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ PERSONAL USE: Unlimited personal projects.
✅ COMMERCIAL USE: Small businesses can sell up to 500 physical products per design (e.g. physical stickers, printed t-shirts, mugs, decals).
❌ DIGITAL RESALE: You may NOT resell, share, redistribute, re-license, or give away these digital files in any format.
❌ POD AUTOMATION: You may NOT upload these raw files to automated public mass-market POD platforms without modifying them into unique physical merchandise.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ CREATIVE PROCESS & TRANSPARENCY:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
In accordance with Etsy's Creativity Standards:
This original digital collection is conceptually created, styled, and curated by our studio using creative generative AI assistance, then individually inspected, professionally hand-edited, isolated for pure transparent backgrounds, and upscaled to crisp 300 DPI print-ready quality.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💌 NEED HELP?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
If you have any questions, encounter any issues downloading, or need advice on printing, feel free to reach out via Etsy message. We are always happy to help!

Thank you for visiting and supporting independent digital creators! Happy crafting! ⭐⭐⭐⭐⭐`;

  return {
    title: finalTitle,
    charCount: finalTitle.length,
    wordCount: finalTitle.split(/\s+/).filter(Boolean).length,
    tags: finalTags,
    description
  };
}
