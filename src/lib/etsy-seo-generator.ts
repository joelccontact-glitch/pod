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

// English Category Names & Keywords Dictionary (Optimized for Etsy's 14-Word & Objective Keyword Rules)
const CATEGORY_SEO_DICT: Record<string, {
  name: string;
  bundleKeywords: string[];
  singleKeywords: string[];
  descriptionHighlights: string[];
}> = {
  halloween: {
    name: 'Halloween Spooky Cute',
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
export function sanitizeAndEnforceEtsyTitle(rawTitle: string, maxWords = 13, maxChars = 138): string {
  // 1. Strip subjective adjectives
  const cleaned = rawTitle
    .replace(/\b(cute|kawaii|lovely|beautiful|pretty|aesthetic|adorable|sweet|spooky cute)\b/gi, '')
    .replace(/\s+/g, ' ')
    .replace(/,\s*,/g, ',')
    .replace(/^[\s,]+|[\s,]+$/g, '')
    .trim();

  // 2. Enforce 14 words or less (target <= maxWords)
  const parts = cleaned.split(/,\s*/);
  const selectedParts: string[] = [];
  let currentWordCount = 0;

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const wordsInPart = trimmed.split(/\s+/).filter(Boolean).length;
    if (currentWordCount + wordsInPart <= maxWords) {
      selectedParts.push(trimmed);
      currentWordCount += wordsInPart;
    } else {
      break;
    }
  }

  let result = selectedParts.join(', ');

  // If result is empty or too short, truncate words directly
  if (!result || result.split(/\s+/).filter(Boolean).length < 4) {
    const words = cleaned.split(/\s+/).filter(Boolean).slice(0, maxWords);
    result = words.join(' ');
  }

  // Ensure character limit
  if (result.length > maxChars) {
    result = result.slice(0, maxChars).trim().replace(/,$/, '');
  }

  return result;
}

/**
 * Generate Etsy SEO Title, Description, and Tags
 */
export function generateEtsySeo(design: any, packCount?: number): EtsySeoData {
  if (!design) {
    const fallbackTitle = 'Digital Stickers PNG Bundle, Clipart Die Cut Download';
    return {
      title: fallbackTitle,
      charCount: fallbackTitle.length,
      wordCount: fallbackTitle.split(/\s+/).filter(Boolean).length,
      tags: ['digital stickers', 'clipart bundle', 'craft cut file', 'png download'],
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

  const themeInfo = CATEGORY_SEO_DICT[subKey] || {
    name: 'Cute Kawaii',
    bundleKeywords: ['Cute Stickers PNG Bundle', 'Kawaii Clipart Set', 'Aesthetic Die Cut Digital Download', 'Commercial Craft Cut'],
    singleKeywords: ['Cute Sticker PNG', 'Kawaii Clipart', 'Die Cut Digital Download', 'Printable Cut File'],
    descriptionHighlights: ['✨ Cute and aesthetic digital illustrations crafted with vibrant colors and crisp details.']
  };

  // Determine item count (e.g. 40 or 20)
  let count = packCount || (titleRaw.includes('40') || topicRaw.includes('40') ? 40 : 20);

  let finalTitle = '';
  let finalTags: string[] = [];

  if (isPod) {
    // 1. POD T-Shirt Apparel Mode (Target 11-13 words, NO subjective adjectives)
    let cleanTopic = translateKoItemToEnglish(titleRaw || topicRaw)
      .replace(/^(vintage|cute|aesthetic|kawaii)\s+/i, '')
      .replace(/\s+(t-shirt|tshirt|shirt|tee)\b/ig, '')
      .trim();
    if (!cleanTopic) cleanTopic = 'Graphic Art';

    finalTitle = sanitizeAndEnforceEtsyTitle(
      `${cleanTopic} T-Shirt Design PNG, Retro Graphic Tee Clipart, DTG Sublimation Apparel Digital Download`,
      13
    );
    finalTags = [
      'graphic tee png', 'sublimation design', 'dtg t shirt art', 'vintage apparel',
      'animal shirt png', 'retro graphic tee', 'clipart download', 'commercial use',
      't shirt design', 'trending graphic', 'digital download', 'merch design', 'dtg printing'
    ];
  } else if (isBundle) {
    // 2. Sticker Pack / Bundle Mode (Target 12-13 words, NO subjective words like 'cute' or 'kawaii')
    const keywords = [...themeInfo.bundleKeywords];
    keywords[0] = `${count} ${keywords[0].replace(/^\d+\s*/, '')}`; // e.g. "40 Saltwater Aquarium Stickers PNG Bundle"
    const joined = keywords.join(', ');
    finalTitle = sanitizeAndEnforceEtsyTitle(joined, 13);

    finalTags = [
      `${subKey} stickers`.slice(0, 20),
      'digital sticker pack'.slice(0, 20),
      'craft cut files png'.slice(0, 20),
      'clipart bundle set'.slice(0, 20),
      'printable sticker a4'.slice(0, 20),
      'commercial use png'.slice(0, 20),
      'die cut sticker set'.slice(0, 20),
      'planner stickers png'.slice(0, 20),
      'digital planner png'.slice(0, 20),
      'scrapbooking clipart'.slice(0, 20),
      'water bottle decal'.slice(0, 20),
      '300 dpi transparent'.slice(0, 20),
      `${count} sticker bundle`.slice(0, 20)
    ];
  } else {
    // 3. Single Standalone Sticker Mode (Target 10-12 words, NO subjective words)
    let enItemName = translateKoItemToEnglish(titleRaw || topicRaw)
      .replace(/^(cute|kawaii|sweet|pretty)\s+/i, '')
      .replace(/\s+sticker\b/i, '')
      .trim();
    if (!enItemName) enItemName = 'Artwork';

    const cleanTheme = (themeInfo.name || '').replace(/\b(cute|kawaii|spooky cute)\b/gi, '').trim();

    finalTitle = sanitizeAndEnforceEtsyTitle(
      `${enItemName} Sticker PNG, ${cleanTheme} Clipart, Printable Die Cut Digital Download`,
      12
    );
    finalTags = [
      `${enItemName.toLowerCase().slice(0, 16)} sticker`,
      `${subKey} sticker`.slice(0, 20),
      'craft cut file',
      'die cut sticker',
      'printable sticker',
      'planner sticker png',
      'digital planner png',
      'commercial use png',
      'digital download',
      'water bottle decal',
      'art clipart png',
      '300 dpi transparent',
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
