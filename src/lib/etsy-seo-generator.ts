/**
 * Etsy SEO & Listing Metadata Generator
 * Generates high-converting, keyword-dense English Titles (max 140 chars),
 * 13 Etsy Tags (under 20 chars each), and complete formatted English Descriptions
 * for Etsy Sticker Bundles, Single Stickers, and POD Apparel.
 */

export interface EtsySeoData {
  title: string;
  charCount: number;
  tags: string[];
  description: string;
}

// English Category Names & Keywords Dictionary
const CATEGORY_SEO_DICT: Record<string, {
  name: string;
  bundleKeywords: string[];
  singleKeywords: string[];
  descriptionHighlights: string[];
}> = {
  halloween: {
    name: 'Halloween Spooky Cute',
    bundleKeywords: [
      'Cute Halloween Stickers PNG Bundle',
      'Spooky Kawaii Clipart',
      'Ghost Pumpkin Cauldron Potion Die Cut',
      'Commercial Use Printable Cricut'
    ],
    singleKeywords: ['Cute Halloween Sticker PNG', 'Spooky Kawaii Clipart', 'Die Cut Digital Download', 'Printable Cricut'],
    descriptionHighlights: [
      '🎃 Spooky cute Halloween illustrations (Ghosts, Pumpkins, Witch Cauldrons, Magic Potions, Black Cats & Bats)',
      '✨ Pastel goth & kawaii aesthetic suitable for all ages',
      '🍬 Perfect for Halloween party favors, treat bags, planner spreads, and trick-or-treat crafts'
    ]
  },
  terrarium: {
    name: 'Succulent Terrarium Plants',
    bundleKeywords: [
      'Cute Succulent Terrarium Stickers PNG Bundle',
      'Kawaii Glass Jar Cactus Clipart',
      'Aesthetic Botanical Plants Die Cut',
      'Commercial Use Printable Cricut'
    ],
    singleKeywords: ['Cute Succulent Terrarium Sticker PNG', 'Kawaii Plant Clipart', 'Die Cut Digital Download', 'Printable Cricut'],
    descriptionHighlights: [
      '🌱 Cozy botanical terrariums, miniature glass jars, and teacup succulent gardens',
      '🌿 Lush indoor greenery, pastel pots, and relaxing cottagecore vibes',
      '💚 Ideal for plant moms, gardening planners, water bottle decals, and laptop skins'
    ]
  },
  vivarium: {
    name: 'Vivarium Reptile & Amphibian Friends',
    bundleKeywords: [
      'Cute Vivarium Friends Stickers PNG Bundle',
      'Kawaii Tree Frog Gecko Chameleon Clipart',
      'Terrarium Pet Habitat Die Cut',
      'Commercial Use Printable Cricut'
    ],
    singleKeywords: ['Cute Vivarium Friend Sticker PNG', 'Kawaii Reptile Clipart', 'Die Cut Digital Download', 'Printable Cricut'],
    descriptionHighlights: [
      '🦎 Charming vivarium pets (Baby Geckos, Chameleons, Tiny Tree Frogs, and Salamanders)',
      '🌿 Natural mossy logs, jungle foliage, and healthy above-water habitats',
      '🐸 Perfect for reptile enthusiasts, biology notebooks, nature journals, and vivarium tanks'
    ]
  },
  saltaquarium: {
    name: 'Saltwater Reef Aquarium',
    bundleKeywords: [
      'Cute Saltwater Aquarium Stickers PNG Bundle',
      'Kawaii Clownfish Coral Reef Clipart',
      'Ocean Marine Animals Die Cut',
      'Commercial Use Printable Cricut'
    ],
    singleKeywords: ['Cute Reef Aquarium Sticker PNG', 'Kawaii Saltwater Fish Clipart', 'Die Cut Digital Download', 'Printable Cricut'],
    descriptionHighlights: [
      '🐠 Vibrant saltwater reef tanks (Clownfish, Blue Tang, Sea Anemones, Seahorses & Sea Turtles)',
      '🌊 Bright marine ecosystems with glowing corals and aquatic flora',
      '🤿 Great for ocean lovers, marine biology students, beach planners, and scuba scrapbooks'
    ]
  },
  freshaquarium: {
    name: 'Freshwater Planted Aquarium',
    bundleKeywords: [
      'Cute Freshwater Aquarium Stickers PNG Bundle',
      'Kawaii Betta Guppy Fish Clipart',
      'Planted Tank Aquatic Die Cut',
      'Commercial Use Printable Cricut'
    ],
    singleKeywords: ['Cute Freshwater Aquarium Sticker PNG', 'Kawaii Betta Fish Clipart', 'Die Cut Digital Download', 'Printable Cricut'],
    descriptionHighlights: [
      '🐟 Peaceful freshwater tanks (Betta Splendens, Guppies, Neon Tetras, Apple Snails & Shrimps)',
      '🌿 Lush aquascapes with driftwood, water lilies, and crystal-clear bubbling water',
      '🫧 Perfect for fishkeeping hobbyists, aquarists, hydro flasks, and digital journals'
    ]
  },
  christmas: {
    name: 'Cozy Christmas Holiday',
    bundleKeywords: [
      'Cute Christmas Holiday Stickers PNG Bundle',
      'Cozy Kawaii Winter Snowglobe Clipart',
      'Santa Gingerbread Die Cut',
      'Commercial Use Printable Cricut'
    ],
    singleKeywords: ['Cute Christmas Sticker PNG', 'Cozy Holiday Kawaii Clipart', 'Die Cut Digital Download', 'Printable Cricut'],
    descriptionHighlights: [
      '🎄 Whimsical holiday designs (Snowglobes, Gingerbread Men, Santa, Reindeer & Hot Cocoa)',
      '❄️ Warm winter aesthetic with festive sparkles and pastel holiday charm',
      '🎁 Ideal for holiday gift tags, Christmas card making, advent calendars, and seasonal packaging'
    ]
  },
  thanksgiving: {
    name: 'Autumn Harvest Thanksgiving',
    bundleKeywords: [
      'Cute Autumn Thanksgiving Stickers PNG Bundle',
      'Cozy Fall Harvest Pumpkin Spice Clipart',
      'Turkey Leaves Die Cut',
      'Commercial Use Printable Cricut'
    ],
    singleKeywords: ['Cute Fall Harvest Sticker PNG', 'Autumn Thanksgiving Clipart', 'Die Cut Digital Download', 'Printable Cricut'],
    descriptionHighlights: [
      '🍂 Warm autumn vibes (Pumpkin Spice, Turkey, Acorns, Golden Fall Leaves & Warm Sweaters)',
      '🥧 Cozy harvest aesthetic celebrating gratitude, family gatherings, and cozy November days',
      '🍁 Perfect for gratitude journals, thanksgiving menus, recipe cards, and fall planners'
    ]
  },
  valentines: {
    name: 'Valentines Sweet Hearts',
    bundleKeywords: [
      'Cute Valentines Day Stickers PNG Bundle',
      'Kawaii Heart Pastel Love Clipart',
      'Cupid Sweets Die Cut',
      'Commercial Use Printable Cricut'
    ],
    singleKeywords: ['Cute Valentines Sticker PNG', 'Pastel Love Clipart', 'Die Cut Digital Download', 'Printable Cricut'],
    descriptionHighlights: [
      '💖 Romantic pastel hearts, love letters, chocolate boxes, and adorable animal sweethearts',
      '💌 Sweet Valentine aesthetics for scrapbooking, couples gifts, and Galentines celebrations'
    ]
  },
  easter: {
    name: 'Spring Easter Bunny',
    bundleKeywords: [
      'Cute Easter Bunny Stickers PNG Bundle',
      'Kawaii Spring Pastel Egg Clipart',
      'Floral Chick Die Cut',
      'Commercial Use Printable Cricut'
    ],
    singleKeywords: ['Cute Easter Bunny Sticker PNG', 'Spring Pastel Egg Clipart', 'Die Cut Digital Download', 'Printable Cricut'],
    descriptionHighlights: [
      '🐰 Fluffy baby bunnies, pastel decorated eggs, yellow chicks, and fresh spring wildflowers'
    ]
  },
  stpatrick: {
    name: 'St Patricks Lucky Shamrocks',
    bundleKeywords: [
      'Cute St Patricks Day Stickers PNG Bundle',
      'Kawaii Lucky Clover Pot of Gold Clipart',
      'Irish Green Die Cut',
      'Commercial Use Printable Cricut'
    ],
    singleKeywords: ['Cute St Patricks Sticker PNG', 'Lucky Shamrock Clipart', 'Die Cut Digital Download', 'Printable Cricut'],
    descriptionHighlights: [
      '🍀 Four-leaf clovers, glittering pots of gold, cute rainbows, and lucky charms'
    ]
  }
};

// Korean keyword to English keyword translation dictionary for individual stickers
const KO_EN_TRANSLATE: [RegExp, string][] = [
  [/물약|플라스크/i, 'Magic Potion Flask'],
  [/호박|잭오랜턴|펌킨/i, 'Pumpkin Jack O Lantern'],
  [/유령|고스트/i, 'Cute Ghost'],
  [/가마솥/i, 'Witch Cauldron'],
  [/마녀.*모자/i, 'Witch Hat'],
  [/빗자루/i, 'Magic Broomstick'],
  [/흑고양이|검은.*고양이/i, 'Black Cat'],
  [/고양이/i, 'Cute Kitten Cat'],
  [/박쥐/i, 'Baby Bat Wings'],
  [/해골|스컬/i, 'Skeleton Skull'],
  [/거미|거미줄/i, 'Spider Web'],
  [/사탕|캔디/i, 'Halloween Candy'],
  [/롤리팝/i, 'Lollipop Sweets'],
  [/미라/i, 'Cute Mummy'],
  [/늑대인간/i, 'Baby Werewolf'],
  [/다육|선인장/i, 'Succulent Cactus'],
  [/테라리움/i, 'Terrarium Glass Jar'],
  [/비바리움/i, 'Vivarium Habitat'],
  [/개구리/i, 'Tiny Tree Frog'],
  [/도마뱀|게코/i, 'Gecko Lizard'],
  [/카멜레온/i, 'Cute Chameleon'],
  [/스노우볼/i, 'Winter Snowglobe'],
  [/크리스마스/i, 'Christmas Holiday'],
  [/추수감사절/i, 'Thanksgiving Harvest'],
  [/어항|열대어/i, 'Aquarium Fish Tank'],
  [/해수어/i, 'Reef Clownfish'],
  [/베타/i, 'Betta Splendens Fish'],
  [/구피/i, 'Guppy Fish'],
  [/달팽이|스네일/i, 'Apple Snail'],
  [/새우/i, 'Cherry Shrimp'],
  [/강아지/i, 'Cute Puppy Dog'],
  [/토끼/i, 'Baby Bunny Rabbit'],
  [/레서판다/i, 'Red Panda'],
  [/햄스터/i, 'Cute Hamster'],
  [/수달/i, 'Sea Otter Pup']
];

function translateKoItemToEnglish(koreanText: string): string {
  if (!koreanText) return 'Cute Artwork';
  
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

  return 'Cute Illustration';
}

function truncateToEtsyLimit(title: string, maxLen = 138): string {
  if (title.length <= maxLen) return title;
  const parts = title.split(', ');
  let result = '';
  for (const part of parts) {
    const candidate = result ? `${result}, ${part}` : part;
    if (candidate.length <= maxLen) {
      result = candidate;
    } else {
      break;
    }
  }
  return result || title.slice(0, maxLen).trim();
}

/**
 * Generate Etsy SEO Title, Description, and Tags
 */
export function generateEtsySeo(design: any, packCount?: number): EtsySeoData {
  if (!design) {
    return {
      title: 'Cute Digital Stickers PNG Bundle, Kawaii Clipart Die Cut Download',
      charCount: 68,
      tags: ['digital stickers', 'kawaii clipart', 'cricut cut file', 'png download'],
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
    bundleKeywords: ['Cute Stickers PNG Bundle', 'Kawaii Clipart Set', 'Aesthetic Die Cut Digital Download', 'Commercial Use Cricut'],
    singleKeywords: ['Cute Sticker PNG', 'Kawaii Clipart', 'Die Cut Digital Download', 'Printable Cricut'],
    descriptionHighlights: ['✨ Cute and aesthetic digital illustrations crafted with vibrant colors and crisp details.']
  };

  // Determine item count (e.g. 40 or 20)
  let count = packCount || (titleRaw.includes('40') || topicRaw.includes('40') ? 40 : 20);

  let finalTitle = '';
  let finalTags: string[] = [];

  if (isPod) {
    // 1. POD T-Shirt Apparel Mode
    let cleanTopic = translateKoItemToEnglish(titleRaw || topicRaw)
      .replace(/^(vintage|cute|aesthetic)\s+/i, '')
      .replace(/\s+(t-shirt|tshirt|shirt|tee)\b/ig, '')
      .trim();
    if (!cleanTopic) cleanTopic = 'Graphic Art';

    finalTitle = truncateToEtsyLimit(
      `Vintage Cute ${cleanTopic} T-Shirt Design PNG, Aesthetic Retro Graphic Tee Clipart, Commercial Use DTG Sublimation Apparel Digital Download`
    );
    finalTags = [
      'graphic tee png', 'sublimation design', 'dtg t shirt art', 'vintage apparel',
      'cute animal shirt', 'retro aesthetic', 'clipart download', 'commercial use',
      'aesthetic t shirt', 'trending graphic', 'cottagecore tee', 'digital download', 'merch design'
    ];
  } else if (isBundle) {
    // 2. Sticker Pack / Bundle Mode (e.g. 20-Pack or 40-Pack)
    const keywords = [...themeInfo.bundleKeywords];
    keywords[0] = `${count} ${keywords[0].replace(/^\d+\s*/, '')}`; // Ensure accurate count
    const joined = keywords.join(', ');
    finalTitle = truncateToEtsyLimit(joined);

    finalTags = [
      `${subKey} stickers`.slice(0, 20),
      'digital sticker pack'.slice(0, 20),
      'cricut stickers png'.slice(0, 20),
      'kawaii clipart bundle'.slice(0, 20),
      'printable sticker a4'.slice(0, 20),
      'commercial use png'.slice(0, 20),
      'die cut sticker set'.slice(0, 20),
      'planner stickers png'.slice(0, 20),
      'goodnotes sticker'.slice(0, 20),
      'scrapbooking clipart'.slice(0, 20),
      'hydroflask decal'.slice(0, 20),
      '300 dpi transparent'.slice(0, 20),
      `${count} sticker bundle`.slice(0, 20)
    ];
  } else {
    // 3. Single Standalone Sticker Mode
    let enItemName = translateKoItemToEnglish(titleRaw || topicRaw)
      .replace(/^(cute|kawaii)\s+/i, '')
      .replace(/\s+sticker\b/i, '')
      .trim();
    if (!enItemName) enItemName = 'Artwork';

    finalTitle = truncateToEtsyLimit(
      `Cute ${enItemName} Sticker PNG, ${themeInfo.name} Kawaii Clipart, Die Cut Digital Download, Commercial Use Printable Cricut`
    );
    finalTags = [
      `${enItemName.toLowerCase().slice(0, 16)} sticker`,
      `${subKey} sticker`.slice(0, 20),
      'kawaii clipart png',
      'cricut cut file',
      'die cut sticker',
      'printable sticker',
      'planner sticker png',
      'goodnotes sticker',
      'commercial use png',
      'digital download',
      'hydroflask decal',
      'aesthetic clipart',
      '300 dpi transparent'
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
• ${numSheets} Printable A4 Sticker Sheet${numSheets > 1 ? 's' : ''} (Transparent PNG for Cricut & Silhouette Print-Then-Cut)
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
These high-quality PNG files work seamlessly with:
• Cricut Design Space
• Silhouette Studio (Basic, Designer & Business Editions)
• GoodNotes, Notability & iPad Digital Planners
• Procreate, Photoshop, Illustrator, CorelDraw, Inkscape & Canva
• Brother ScanNCut & laser craft cutters
• Standard Home Inkjet / Laser Printers

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 PERFECT FOR:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Die-cut stickers, planner stickers, bullet journals & scrapbooking
• Water bottle, laptop, phone case, tumbler & Kindle decals
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
    tags: finalTags,
    description
  };
}
