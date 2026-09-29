/**
 * Creative Fabrica "Designer Tags" Generator
 * Generates 35~50 high-ranking, long-tail search tags tailored for Creative Fabrica uploads.
 */

// Helper to format as Clean Title Case (e.g. "Cute Plant Stickers")
function toTitleCase(str: string): string {
  return str
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map(word => {
      if (!word) return '';
      // keep uppercase acronyms like PNG, SVG, DIY, CAD, 3D
      if (/^(PNG|SVG|DIY|CAD|3D|A4|DPI|CF|PDF)$/i.test(word)) return word.toUpperCase();
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

// Subcategory / Theme Specific Keywords Dictionary
const THEME_KEYWORD_MAP: Record<string, string[]> = {
  terrarium: [
    'Terrarium Stickers', 'Succulent Stickers', 'Cactus Stickers', 'Cute Botanical Stickers',
    'Glass Jar Plants', 'Potted Plant Stickers', 'Mini Terrarium', 'Indoor Plant Art',
    'Kawaii Succulents', 'Aesthetic Plant Clipart', 'Cozy Botany', 'Plant Lover Gifts',
    'Plant Mom Stickers', 'Botanical Clipart', 'Greenery Stickers', 'Miniature Garden',
    'Cacti Illustrations', 'Succulent Lover', 'Plant Enthusiast', 'Cute Garden Art',
    'Houseplant Stickers', 'Floral Terrarium', 'Nature Clipart', 'Fairy Garden Clipart',
    'Teacup Garden', 'Moss Terrarium', 'Kawaii Gardening', 'Desk Plant Art'
  ],
  vivarium: [
    'Vivarium Stickers', 'Cute Reptile Stickers', 'Tiny Tree Frog', 'Baby Gecko Clipart',
    'Cute Chameleon', 'Salamander Art', 'Moss Habitat', 'Amphibian Stickers',
    'Kawaii Reptiles', 'Jungle Vivarium', 'Exotic Pet Stickers', 'Lizard Clipart',
    'Rainforest Habitat', 'Cute Frog Art', 'Terrarium Pets', 'Herpetology Stickers',
    'Gecko Clipart', 'Chameleon Art', 'Miniature Ecosystem', 'Cozy Terrarium Animal',
    'Tropical Frog Art', 'Cute Amphibian', 'Nature Journal Stickers', 'Pet Lover Gift'
  ],
  saltaquarium: [
    'Reef Aquarium Stickers', 'Cute Clownfish', 'Saltwater Fish Art', 'Coral Reef Clipart',
    'Cute Blue Tang', 'Sea Anemone Stickers', 'Kawaii Marine Life', 'Ocean Aquarium',
    'Tropical Reef Fish', 'Nemo Fish Stickers', 'Dory Fish Art', 'Cute Sea Horse',
    'Underwater World', 'Aquarium Enthusiast', 'Fish Tank Stickers', 'Marine Clipart',
    'Aesthetic Ocean Art', 'Cute Sea Creature', 'Bright Coral Art', 'Saltwater Tank Clipart'
  ],
  freshaquarium: [
    'Freshwater Aquarium', 'Cute Betta Fish', 'Kawaii Guppy Fish', 'Neon Tetra Art',
    'Planted Tank Stickers', 'Aquascape Clipart', 'Cute Fish Tank', 'Tropical Fish Stickers',
    'Betta Splendens Art', 'Underwater Plants', 'Freshwater Fish Art', 'Aquarium Hobbyist',
    'Shrimp Tank Art', 'Aquascaping Clipart', 'Water Lily Aquarium', 'Cute Guppies Art',
    'Glass Aquarium Bowl', 'Aquarium Pet Stickers', 'Freshwater Clipart', 'Kawaii Fish Design'
  ],
  halloween: [
    'Halloween Stickers', 'Cute Ghost Stickers', 'Spooky Cute Clipart', 'Pastel Halloween',
    'Kawaii Pumpkin', 'Baby Ghost Art', 'Witch Cauldron Stickers', 'Cozy Autumn Halloween',
    'Cute Black Cat', 'Halloween Planner', 'Trick Or Treat Clipart', 'Cute Spooky Art',
    'Halloween Cricut', 'Pink Halloween Stickers', 'Halloween Ephemera', 'Ghost Clipart',
    'Cute Bat Stickers', 'Pumpkin Patch Art', 'Spooky Season Stickers', 'Creepy Cute Clipart'
  ],
  christmas: [
    'Christmas Stickers', 'Cozy Winter Clipart', 'Snowglobe Stickers', 'Cute Santa Art',
    'Kawaii Gingerbread', 'Christmas Tree Clipart', 'Holiday Planner Stickers', 'Winter Snowman Art',
    'Cute Reindeer Clipart', 'Holiday Gift Tags', 'Xmas Clipart Bundle', 'Festive Stickers',
    'Cozy Cocoa Mug', 'Christmas Digital Stickers', 'Cute Winter Animals', 'Holiday Scrapbooking',
    'Winter Wonderland Art', 'Christmas Eve Clipart', 'Nutcracker Art', 'Pastel Christmas'
  ],
  thanksgiving: [
    'Thanksgiving Stickers', 'Cozy Autumn Harvest', 'Pumpkin Spice Art', 'Cute Turkey Clipart',
    'Fall Leaves Stickers', 'Autumn Planner Stickers', 'Gratitude Journal Art', 'Acorn And Oak Leaf',
    'Cozy November Clipart', 'Warm Sweater Weather', 'Harvest Festival Art', 'Cute Squirrel Clipart',
    'Fall Cottagecore', 'Thanksgiving Dinner Art', 'Warm Cider Mug', 'Autumn Aesthetic Stickers'
  ],
  valentines: [
    'Valentines Day Stickers', 'Cute Heart Clipart', 'Kawaii Cupid Art', 'Love Letters Clipart',
    'Pink Aesthetic Stickers', 'Cute Animal Couple', 'Valentine Planner', 'Sweet Candy Hearts',
    'Love Envelope Clipart', 'Romantic Stickers', 'Teddy Bear Clipart', 'Valentines Day Cricut',
    'Pastel Heart Stickers', 'Chocolate Box Art', 'Galentines Day Clipart', 'Love Bird Stickers'
  ],
  stpatrick: [
    'St Patricks Day Stickers', 'Lucky Clover Clipart', 'Cute Leprechaun Art', 'Pot Of Gold Clipart',
    'Kawaii Shamrocks', 'Four Leaf Clover', 'Rainbow Clipart', 'Irish Festival Stickers',
    'Lucky Charm Art', 'Green Aesthetic Stickers', 'March Planner Stickers', 'Cute Irish Clipart'
  ],
  easter: [
    'Easter Stickers', 'Cute Easter Bunny', 'Pastel Easter Eggs', 'Spring Garden Clipart',
    'Kawaii Baby Chick', 'Floral Easter Art', 'Easter Basket Stickers', 'Springtime Clipart',
    'Egg Hunt Stickers', 'Pastel Spring Art', 'Cute Bunny Ears', 'Easter Planner Clipart'
  ],
  mothersday: [
    'Mothers Day Stickers', 'Cute Floral Teacup', 'Carnation Bouquet Art', 'Mom Love Clipart',
    'Mother And Baby Animal', 'Spring Flower Stickers', 'Best Mom Clipart', 'Thank You Mom Art',
    'Teacup Rose Clipart', 'Motherhood Stickers', 'Watercolor Floral Art', 'Mom Gift Clipart'
  ]
};

// Universal Creative Fabrica High-Intent Commercial Keywords
const UNIVERSAL_CF_SUFFIXES = [
  'Stickers', 'Sticker Pack', 'Sticker Bundle', 'Sticker Set',
  'Sticker Sheet', 'Clipart', 'Clipart Bundle', 'Digital Download',
  'Printable Stickers', 'Cricut Cut Files', 'Die Cut Stickers',
  'Planner Stickers', 'Journal Stickers', 'Goodnotes Stickers',
  'Digital Planner', 'Scrapbooking Clipart', 'Sublimation Design',
  'Cute Graphics', 'Kawaii Art', 'Aesthetic Clipart', 'Vector Clipart',
  'High Resolution PNG', 'Commercial Use Clipart', 'DIY Crafts'
];

export interface CFDesignerTagOptions {
  title?: string;
  topic?: string;
  tags?: string[];
  categoryOrSub?: string;
  maxTags?: number;
}

/**
 * Generates an array of 35~50 formatted Designer Tags ready for Creative Fabrica.
 */
export function generateCreativeFabricaTags(options: CFDesignerTagOptions): string[] {
  const { title = '', topic = '', tags = [], categoryOrSub = '', maxTags = 45 } = options;

  const resultTagSet = new Set<string>();

  // 1. Add existing SEO tags (formatted to Title Case)
  tags.forEach(t => {
    if (t && t.trim()) {
      resultTagSet.add(toTitleCase(t));
      // Also add '... Stickers' if not present
      if (!t.toLowerCase().includes('sticker') && !t.toLowerCase().includes('clipart')) {
        resultTagSet.add(toTitleCase(`${t} Stickers`));
      }
    }
  });

  // 2. Identify Category / Subcategory from input
  const normalizedSub = categoryOrSub.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  let matchedThemeKey = '';
  for (const key of Object.keys(THEME_KEYWORD_MAP)) {
    if (normalizedSub.includes(key) || title.toLowerCase().includes(key) || topic.toLowerCase().includes(key)) {
      matchedThemeKey = key;
      break;
    }
  }

  // 3. Inject Theme-Specific Keywords
  if (matchedThemeKey && THEME_KEYWORD_MAP[matchedThemeKey]) {
    THEME_KEYWORD_MAP[matchedThemeKey].forEach(item => {
      resultTagSet.add(toTitleCase(item));
    });
  }

  // 4. Extract Key Nouns / Concepts from Title and Topic
  const cleanTokens = `${title} ${topic}`
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .map(w => w.trim())
    .filter(w => w.length > 2 && !/^(the|and|for|with|this|that|from|bundle|pack|set|cute|kawaii|a4)$/i.test(w));

  const uniqueNouns = Array.from(new Set(cleanTokens)).slice(0, 8);

  uniqueNouns.forEach(noun => {
    resultTagSet.add(toTitleCase(`${noun} Stickers`));
    resultTagSet.add(toTitleCase(`Cute ${noun}`));
    resultTagSet.add(toTitleCase(`Kawaii ${noun}`));
    resultTagSet.add(toTitleCase(`${noun} Clipart`));
    resultTagSet.add(toTitleCase(`${noun} Art`));
  });

  // 5. Fill with Universal High-Volume Creative Fabrica Suffixes
  UNIVERSAL_CF_SUFFIXES.forEach(suffix => {
    if (resultTagSet.size < maxTags) {
      resultTagSet.add(toTitleCase(suffix));
    }
  });

  // 6. Final Clean & Limit to maxTags (typically 40~45)
  const finalTags = Array.from(resultTagSet)
    .filter(tag => tag && tag.length >= 3 && tag.length <= 40)
    .slice(0, maxTags);

  return finalTags;
}

/**
 * Returns a single comma-separated string suitable for direct paste into Creative Fabrica upload form.
 */
export function formatCFTagsForClipboard(tags: string[]): string {
  return tags.join(', ');
}
