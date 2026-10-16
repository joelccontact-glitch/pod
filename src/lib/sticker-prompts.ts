/**
 * Sticker Generator & Pygmy Hippo & Friends Series Presets
 * Strictly enforces AGENTS.md rules:
 * 1. Pure White (#FFFFFF) solid background (No background scenery)
 * 2. Elegant, cute, hand-drawn script font for text
 * 3. Anthropomorphic OR natural cute animal with harmonious biological affinity objects
 * 4. Crisp thick die-cut white sticker border
 */

export interface StickerPreset {
  id: string;
  name: string;
  animal: string;
  animalValue: string;
  affinityObject: string;
  theme: string;
  phrase: string;
  description: string;
  prompt: string;
}

export const STICKER_RULES_PROMPT_SUFFIX = `CRITICAL STICKER RULES:
1. STRICT SINGLE SUBJECT MANDATE: MUST feature EXACTLY ONE single centered subject/character. Absolutely NO multiple characters, NO duplicate side-by-side copies, NO trios, NO repeated pattern, NO sticker sheet collage. EXACTLY ONE single isolated sticker in the center.
2. Must have a crisp, thick, smooth white die-cut sticker border outlining the ENTIRE sticker design.
3. Must have a PURE SOLID WHITE BACKGROUND (#FFFFFF). Absolutely NO background colors, scenery, or gradients outside the sticker border.
4. Any brand or catchphrase text MUST be drawn in an elegant, cute, hand-drawn script font with colors matching the design palette.
5. Vector sticker aesthetic, high contrast, vibrant cute kawaii illustration, square 1:1 ratio.`;

/**
 * Formats a master cover title so that the count (e.g. 20종, 40종) dynamically reflects
 * the actual number of stickers generated in the pack.
 */
export function formatCoverTitleWithCount(title: string, count: number): string {
  if (!title || !count || count <= 0) return title || '';
  
  // If title has "20종" or any "N종", replace it with "${count}종"
  if (/(\d+)\s*종/.test(title)) {
    return title.replace(/(\d+)\s*종/g, `${count}종`);
  }
  
  // If title has "20-pack" or "40-pack", replace it
  if (/(\d+)-pack/i.test(title)) {
    return title.replace(/(\d+)-pack/gi, `${count}-pack`);
  }

  // If title contains "스티커 팩", insert count
  if (title.includes('스티커 팩')) {
    return title.replace(/스티커\s*팩/g, `${count}종 스티커 팩`);
  }

  return `${title} (${count}종)`;
}

/**
 * Formats a master cover prompt so that the headline typography number (e.g. "20+ CUTE", "40+ CUTE")
 * dynamically reflects the actual number of stickers generated in the pack.
 */
export function formatCoverPromptWithCount(prompt: string, count: number): string {
  if (!prompt || !count || count <= 0) return prompt || '';

  let updated = prompt;

  // Replace typography instruction: reading "20+ CUTE ..." -> reading "${count}+ CUTE ..."
  updated = updated.replace(/reading\s*(["'])\s*(\d+)\+?\s*/gi, `reading $1${count}+ `);

  // Replace any "20+ CUTE", "20+ SALTWATER", "20+ FRESHWATER", "20+ UNIQUE", etc.
  updated = updated.replace(/\b(\d+)\+\s*([A-Za-z]+)/g, `${count}+ $2`);

  // Replace any standalone "20+" or "20 stickers"
  updated = updated.replace(/\b(\d+)\+\b/g, `${count}+`);
  updated = updated.replace(/\b(\d+)\s+cute stickers\b/gi, `${count} cute stickers`);
  updated = updated.replace(/\b(\d+)\s+stickers\b/gi, `${count} stickers`);

  return updated;
}

export const PYGMY_PUMPKIN_SERIES: StickerPreset[] = [
  {
    id: 'pygmy-hippo-latte',
    name: '🦛 피그미하마 + 수련 & 펌킨 라떼',
    animal: 'Pygmy Hippo',
    animalValue: 'pygmy hippo',
    affinityObject: 'Water Lily Lotus Flowers & Leaves',
    theme: 'Cozy Halloween Latte',
    phrase: 'Pygmy Pumpkin Pal',
    description: '수련 잎 위에서 따뜻한 펌킨 라떼를 마시는 피그미 하마와 유령/흑고양이 스티커',
    prompt: `A cute die-cut sticker design featuring a chubby baby pygmy hippo sitting cozy, holding a warm pumpkin spice latte mug with whipped cream, wearing a cute ribbon around its neck. Surrounding elements include green water lily lotus leaves and pink lotus blossoms on the ground, two playful mini ghosts with bat wings, a black cat pillow, a witch hat, and candy corn. Curved text at the top reads "Pygmy Pumpkin Pal" in an elegant cute hand-drawn script font matching the warm brown palette. ${STICKER_RULES_PROMPT_SUFFIX}`
  },
  {
    id: 'red-panda-boba',
    name: '🦝 레서판다 + 대나무 버블티',
    animal: 'Red Panda',
    animalValue: 'baby red panda',
    affinityObject: 'Green Bamboo Stems & Leaves',
    theme: 'Bamboo Boba Witch',
    phrase: 'Spooky Bamboo Boba',
    description: '대나무 버블티를 마시는 귀여운 후드티 레서판다 스티커',
    prompt: `A cute die-cut sticker design featuring a fluffy baby red panda wearing a cozy oversized sweater and witch hat, sipping a green bamboo boba tea with a straw. Surrounding elements include fresh green bamboo branches, floating cute mini ghosts, candy corn, and autumn leaves. Curved text at the top reads "Spooky Bamboo Boba" in an elegant cute script font. ${STICKER_RULES_PROMPT_SUFFIX}`
  },
  {
    id: 'sea-otter-shell',
    name: '🦦 아기 해달 + 조개껍데기 사탕',
    animal: 'Sea Otter Pup',
    animalValue: 'sea otter pup',
    affinityObject: 'Seashells & Kelp Leaves',
    theme: 'Sweet Sea Spook',
    phrase: 'Sweetest Sea Spook',
    description: '조개껍데기 캔디와 메밀풀을 안고 있는 뽀송한 해달 스티커',
    prompt: `A cute die-cut sticker design featuring a fluffy baby sea otter pup floating happily on its back, hugging a shiny Halloween seashell candy and sea kelp ribbon. Surrounding elements include tiny starfish, floating lotus water bubbles, candy corn, and a mini ghost with a witch hat. Curved text reads "Sweetest Sea Spook" in an elegant cute script font. ${STICKER_RULES_PROMPT_SUFFIX}`
  },
  {
    id: 'hamster-sunflower',
    name: '🐹 햄스터 + 해바라기씨 캔디',
    animal: 'Hamster',
    animalValue: 'hamster',
    affinityObject: 'Giant Sunflower Seeds & Peanuts',
    theme: 'Pumpkin Seed Monster',
    phrase: 'Little Pumpkin Nibbler',
    description: '거대 해바라기씨를 꼭 껴안은 아기 햄스터 스티커',
    prompt: `A cute die-cut sticker design featuring a chubby baby hamster with puffy cheeks, wearing a cute beanie hat, hugging a giant carved pumpkin sunflower seed. Surrounding elements include peanuts, candy corn, a tiny black cat, and a floating ghost. Curved text reads "Little Pumpkin Nibbler" in an elegant hand-drawn script font. ${STICKER_RULES_PROMPT_SUFFIX}`
  },
  {
    id: 'sloth-tropic-leaf',
    name: '🦥 나무늘보 + 나뭇잎 & 마법책',
    animal: 'Baby Sloth',
    animalValue: 'baby sloth',
    affinityObject: 'Tropical Leaves & Cherry Blossom Branch',
    theme: 'Lazy Spellcaster',
    phrase: 'Too Cozy to Spook',
    description: '나뭇가지에 거꾸로 매달려 마법책을 읽는 나무늘보 스티커',
    prompt: `A cute die-cut sticker design featuring a sweet baby sloth hanging lazily from a tropical leafy branch, wearing round glasses and holding a small golden spellbook. Surrounding elements include floating glowing stars, a miniature witch hat, candy corn, and a cozy cup of tea. Curved text reads "Too Cozy to Spook" in an elegant cute script font. ${STICKER_RULES_PROMPT_SUFFIX}`
  },
  {
    id: 'bunny-carrot-cake',
    name: '🐰 토끼 + 당근 컵케이크 & 산딸기',
    animal: 'Bunny',
    animalValue: 'bunny',
    affinityObject: 'Carrots, Raspberries & Wildflowers',
    theme: 'Sweet Carrot Witch',
    phrase: 'Carrot & Magic',
    description: '당근 컵케이크를 든 귀여운 포근한 토끼 스티커',
    prompt: `A cute die-cut sticker design featuring a fluffy baby bunny with floppy ears, wearing a cozy knit sweater and witch hat, holding a delicious carrot cupcake with orange frosting. Surrounding elements include wild carrots, ripe raspberries, wildflowers, and a smiling ghost. Curved text reads "Carrot & Magic" in an elegant hand-drawn script font. ${STICKER_RULES_PROMPT_SUFFIX}`
  },
  {
    id: 'kitten-catnip-fish',
    name: '🐱 아기 고양이 + 캣닙 & 생선 사탕',
    animal: 'Kitten',
    animalValue: 'kitten',
    affinityObject: 'Catnip Flowers & Milk Bowl',
    theme: 'Midnight Spooky Kitty',
    phrase: 'Purrfectly Spooky',
    description: '호박 잔에 우유를 마시는 아기 고양이 스티커',
    prompt: `A cute die-cut sticker design featuring a chubby fluffy kitten curled up inside a soft pumpkin bowl, sipping milk with a pink cat paw, surrounded by catnip blossoms, yarn ball, candy corn, and a bat ghost. Curved text reads "Purrfectly Spooky" in an elegant script font. ${STICKER_RULES_PROMPT_SUFFIX}`
  },
  {
    id: 'puppy-toy-bone',
    name: '🐶 아기 강아지 + 테니스공 & 뼈다귀',
    animal: 'Puppy',
    animalValue: 'puppy',
    affinityObject: 'Toy Bones & Paw Prints',
    theme: 'Ghost Hound Pup',
    phrase: 'Bark at the Moon',
    description: '유령 망토를 쓰고 호박 장난감을 문 아기 강아지 스티커',
    prompt: `A cute die-cut sticker design featuring a fluffy golden retriever puppy wearing a white ghost bedsheet costume with eye cutouts, holding a pumpkin dog bone toy in its mouth. Surrounding elements include tennis balls, paw print candies, and a mini witch hat. Curved text reads "Bark at the Moon" in a cute script font. ${STICKER_RULES_PROMPT_SUFFIX}`
  },
  {
    id: 'pygmy-hippo-gamer',
    name: '🎮 피그미하마 + 게임 컨트롤러',
    animal: 'Pygmy Hippo',
    animalValue: 'pygmy hippo',
    affinityObject: 'Water Lily & Gamer Headset',
    theme: 'Halloween Gamer Hippo',
    phrase: 'Level Up Spooky',
    description: '헤드셋을 끼고 수련 잎 위에서 게임하는 피그미 하마 스티커',
    prompt: `A cute die-cut sticker design featuring a cute baby pygmy hippo wearing glowing pink cat-ear headphones, holding a game controller while sitting on a water lily leaf. Surrounding elements include pixel ghosts, pumpkin energy drinks, candy corn, and witch hats. Curved text reads "Level Up Spooky" in a retro gaming cute script font. ${STICKER_RULES_PROMPT_SUFFIX}`
  },
  {
    id: 'red-panda-coder',
    name: '💻 레서판다 + 노트북 디버깅',
    animal: 'Red Panda',
    animalValue: 'baby red panda',
    affinityObject: 'Bamboo & Laptop',
    theme: 'Halloween Programmer Panda',
    phrase: 'Debugging Till Halloween',
    description: '노트북을 켜두고 대나무 커피를 마시는 개발자 레서판다 스티커',
    prompt: `A cute die-cut sticker design featuring a cute baby red panda wearing glasses and a hoodie, sitting behind a mini laptop with a ghost sticker on the lid, sipping bamboo coffee. Surrounding elements include code syntax ghosts, green bamboo shoots, and candy corn. Curved text reads "Debugging Till Halloween" in an elegant script font. ${STICKER_RULES_PROMPT_SUFFIX}`
  }
];

export const AQUARIUM_RULES_PROMPT_SUFFIX_NO_TEXT = `CRITICAL STICKER RULES:
1. Must have a crisp, thick, smooth white die-cut sticker border outlining the ENTIRE sticker design.
2. Must have a PURE SOLID WHITE BACKGROUND (#FFFFFF). Absolutely NO background colors, scenery, or gradients outside the sticker border.
3. STRICT TEXT RULE: Absolutely NO text, NO words, NO letters, NO phrases, NO typography, NO signatures, NO labels anywhere in the image. Pure graphic illustration art only.
4. STRICT NON-REFLECTIVE GLASS RULE: Absolutely NO glass reflections, NO white glare streaks, NO diagonal shine strips across the glass container. The glass tank/jar must be completely clear and transparent without any white reflection lines so stickers can be layered seamlessly inside.
5. STRICT NO MAMMALS/BIRDS IN AQUARIUM RULE: Absolutely NO sea otters, NO penguins, NO mammals, NO birds, NO land/aerial animals inside or trapped in any aquarium tank or glass container. ONLY real marine/freshwater fish, seahorses, jellyfish, sea anemones, corals, aquatic snails, shrimps, and water plants.
6. STRICT WATER-FILLED AQUARIUM RULE: Every aquarium tank MUST be visibly filled with translucent blue aquatic water, featuring a clear rippling water surface line near the top rim.
7. STRICT BUBBLE POSITION RULE: All water bubbles MUST stay 100% INSIDE the aquatic water inside the aquarium tank. Absolutely NO floating water bubbles outside the glass tank or floating in the air above the rim.
8. Vector sticker aesthetic, high contrast, vibrant cute kawaii illustration.`;

export const STICKER_RULES_PROMPT_SUFFIX_NO_TEXT = AQUARIUM_RULES_PROMPT_SUFFIX_NO_TEXT;

export const VIVARIUM_RULES_PROMPT_SUFFIX_NO_TEXT = `CRITICAL STICKER RULES:
1. Must have a crisp, thick, smooth white die-cut sticker border outlining the ENTIRE sticker design.
2. Must have a PURE SOLID WHITE BACKGROUND (#FFFFFF). Absolutely NO background colors, scenery, or gradients outside the sticker border.
3. STRICT TEXT RULE: Absolutely NO text, NO words, NO letters, NO phrases, NO typography, NO signatures, NO labels anywhere in the image. Pure graphic illustration art only.
4. STRICT NON-REFLECTIVE GLASS RULE: Absolutely NO glass reflections, NO white glare streaks, NO diagonal shine strips across the glass container. The glass tank/jar must be completely clear and transparent without any white reflection lines so stickers can be layered seamlessly inside.
5. STRICT BIOLOGICAL SURVIVAL & OPEN-AIR RULE FOR VIVARIUM: This is a DRY OR PALUDARIUM TERRESTRIAL LAND VIVARIUM (NOT an underwater fish tank). Air-breathing amphibians and reptiles (frogs, chameleons, geckos, salamanders) MUST be sitting/perched on land, moss, driftwood, or leaves in OPEN AIR ABOVE the water level. Absolutely NEVER submerge air-breathing animals underwater. Water level must be 0% or low bottom stream level (max 10-15%).
6. Vector sticker aesthetic, high contrast, vibrant cute kawaii illustration.`;

export const HANGUL_STICKER_RULES_PROMPT_SUFFIX_NO_TEXT = `CRITICAL STICKER RULES:
1. Must have a crisp, thick, smooth white die-cut sticker border outlining the ENTIRE sticker design.
2. Must have a PURE SOLID WHITE BACKGROUND (#FFFFFF). Absolutely NO background colors, scenery, or gradients outside the sticker border.
3. STRICT NO TEXT RULE: Absolutely NO text, NO letters, NO words, NO typography, NO Hangul syllables, NO Korean characters, NO English words, NO signatures, NO labels anywhere in the image. Pure graphic cute character illustration art ONLY. All typography is composited via high-res vector typography in post-processing.
4. Vector sticker aesthetic, high contrast, vibrant cute kawaii Korean aesthetic style.`;

export const TERRARIUM_SERIES: StickerPreset[] = [
  // --- 1. VIVARIUM SERIES (Reptiles, Amphibians & Ecosystem Tanks) ---
  {
    id: 'vivarium-panorama-complete-guide',
    name: '🖼️✨ [비바리움 풀세트] 완성본 썸네일',
    animal: 'Panoramic Vivarium Showcase',
    animalValue: '',
    affinityObject: 'Horizontal Glass Tank, Driftwood, Moss, Vines & Baby Chameleon',
    theme: 'Wide Panoramic Vivarium Guide',
    phrase: '',
    description: '가로형 와이드 수조 속에 유목, 이끼, 넝쿨, 미니 카멜레온과 청개구리가 생태적으로 어우러진 비바리움 풀세트 완성본',
    prompt: `A cute die-cut sticker design featuring a wide horizontal panoramic rectangular glass vivarium tank. Inside the clear glass tank is a dry terrestrial or paludarium vivarium ecosystem (NOT submerged underwater) with natural curved driftwood, green moss layers, climbing vines, river stones, a tiny cute baby green chameleon resting on a branch in open air, and a tiny leaf tree frog sitting above water level on a leaf. NO glass glare or reflection lines. ${VIVARIUM_RULES_PROMPT_SUFFIX_NO_TEXT}`
  },
  {
    id: 'vivarium-wide-tank-frame',
    name: '🖼️ [비바리움] 가로 와이드 무반사 유리 수조 틀',
    animal: 'Panoramic Tank Frame',
    animalValue: '',
    affinityObject: 'Wide Horizontal Glass Vivarium Tank Outline',
    theme: 'Wide Tank Frame',
    phrase: '',
    description: '스티커를 안쪽에 자유롭게 채워 넣을 수 있는 가로 파노라마 직사각형 유리 수조 틀 (100% 무반사 투명 유리)',
    prompt: `A cute die-cut sticker design featuring a clean, wide horizontal rectangular glass vivarium tank frame, completely empty inside with a subtle thin gravel layer at the bottom. The glass walls MUST be 100% clear with NO white diagonal glare strips or glass reflection lines, allowing seamless sticker layering. ${VIVARIUM_RULES_PROMPT_SUFFIX_NO_TEXT}`
  },
  {
    id: 'vivarium-wide-driftwood-moss',
    name: '🪵 [비바리움] 와이드 유목 뿌리 & 이끼 바닥재',
    animal: 'Vivarium Driftwood & Moss',
    animalValue: '',
    affinityObject: 'Wide Horizontal Driftwood Root & Moss Terrain',
    theme: 'Horizontal Terrain Pack',
    phrase: '',
    description: '가로 수조 바닥 비율에 딱 맞춰 깔아주는 자연 유목 뿌리와 이끼 & 조약돌 지형 스티커',
    prompt: `A cute die-cut sticker design featuring a wide horizontal panorama mound of natural curved driftwood root, smooth river pebbles, and lush green moss bed, perfectly proportioned to fit horizontally inside a vivarium tank. ${VIVARIUM_RULES_PROMPT_SUFFIX_NO_TEXT}`
  },
  {
    id: 'vivarium-vine-flora',
    name: '🌿 [비바리움] 수생 넝쿨 식물 & 고사리 팩',
    animal: 'Climbing Vines',
    animalValue: '',
    affinityObject: 'Aquatic Climbing Vines & Ferns',
    theme: 'Vivarium Flora',
    phrase: '',
    description: '수조 유목이나 유리 벽면에 자라나는 넝쿨 식물과 고사리 세트 스티커',
    prompt: `A cute die-cut sticker design featuring vibrant green climbing tropical vines and miniature fern branches, small proportion designed to fit inside a vivarium tank. ${VIVARIUM_RULES_PROMPT_SUFFIX_NO_TEXT}`
  },
  {
    id: 'vivarium-chameleon-frog',
    name: '🦎 [비바리움] 미니 카멜레온 & 나뭇잎 청개구리',
    animal: 'Baby Chameleon & Frog',
    animalValue: '',
    affinityObject: 'Reptile & Amphibian Species',
    theme: 'Vivarium Live Creatures',
    phrase: '',
    description: '수조 유목 생태계와 어울리는 앙증맞은 파충류/양서류 (미니 카멜레온 & 작은 나뭇잎 청개구리) 스티커',
    prompt: `A cute die-cut sticker design featuring a tiny cute baby green chameleon sitting lazily on a vine branch next to a small adorable green tree frog perched in open air above ground/water, small scale proportion designed for a vivarium ecosystem. ${VIVARIUM_RULES_PROMPT_SUFFIX_NO_TEXT}`
  }
];

export const TERRARIUM_20_SERIES: StickerPreset[] = [
  {
    id: 'terrarium-20-pack-cover',
    name: '🖼️ [마스터 썸네일] 테라리움 20종 스티커 팩 대표 커버 표지',
    animal: 'Terrarium Master Cover',
    animalValue: '',
    affinityObject: 'Terrarium Master Cover',
    theme: 'Terrarium 20 Pack Cover',
    phrase: '',
    description: 'Etsy 판매용 20종 테라리움 스티커 팩 마스터 대표 썸네일 커버 표지 그래픽',
    prompt: `A professional Etsy digital sticker bundle master cover graphic illustration on a pure solid white background (#FFFFFF).
CENTERED TITLE (MUST REMAIN CLEAR & UNOBSTRUCTED): Centered cute bold pink script typography reading "20+ CUTE TERRARIUM STICKER BUNDLE". Below title reads "PNG DIGITAL DOWNLOAD" in a stylish teal ribbon banner. CRITICAL: The central title and banner MUST remain completely unobstructed, open, and clearly legible with an ample margin around it—NO stickers encroaching, touching, or overlapping the text.
STICKER ARRANGEMENT (DENSE YET NEATLY SEPARATED): A richly packed collage of 18-20 unique standalone die-cut sticker samples (mix of miniature glass jar terrariums and botanical accent stickers) filling the perimeter of the canvas around the center title with minimal empty white gaps. CRITICAL NO OVERLAPPING: Individual stickers MUST NOT overlap, collide, or clip one another. Each sticker is completely isolated and neatly placed side-by-side with its own distinct thick crisp white die-cut border. STRICT NO DUPLICATES: Every single sticker is 100% unique in terrarium jar shape, botanical contents, and ornaments with zero repetition.
FEATURED UNIQUE STICKERS: mason jar succulent terrarium, fairy cottage house terrarium, Japanese stone lantern terrarium, hanging glass globe airplant terrarium, wooden sign & toadstool terrarium, geometric prism purple succulent terrarium, red mushroom cluster terrarium, desert sand cactus terrarium, vintage teacup terrarium, lightbulb-shaped succulent terrarium, white picket fence moss terrarium, park bench miniature terrarium, amethyst crystal terrarium, red mailbox moss terrarium, stepping stone pathway terrarium, fern forest terrarium, pinecone terrarium, standalone potted rosette succulent, standalone red toadstools, and standalone amethyst cluster.
STRICT NO MAMMALS/BIRDS RULE: Absolutely NO land animals, NO foxes, NO birds, NO cats, NO dogs, NO rodents inside or around the terrarium glass jars. Pure botanical green moss, potted succulents, fairy cottages, stone lanterns, mushrooms, and plant terrariums ONLY. CRITICAL: The image MUST have a pure solid white background (#FFFFFF). NEVER generate any background colors, gradients, or scenery. Etsy bestseller listing thumbnail aesthetic. High resolution.`
  },
  ...Array.from({ length: 20 }, (_, i) => {
    const num = i + 1;
  const items = [
    { name: '메이슨 저 다육이 테라리움', desc: '빈티지 메이슨 저 안의 몽글몽글 다육식물 3종과 이끼', detail: 'transparent mason jar terrarium filled with 3 mini potted succulents, plush green moss, and river pebbles' },
    { name: '요정 오두막 집 테라리움', desc: '이끼 언덕 위 빨간 지붕 미니 요정 오두막 집 피규어', detail: 'glass jar terrarium featuring a tiny ceramic red-roof fairy cottage house figurine resting on plush moss' },
    { name: '일본식 석등 정원 테라리움', desc: '미니 회색 석등과 이끼 언덕이 정갈한 테라리움', detail: 'glass jar terrarium with a miniature grey Japanese stone lantern (toro) on a lush green moss mound' },
    { name: '에어플랜트 유리 구 테라리움', desc: '매달린 공 모양 유리 구 속 틸란드시아 에어플랜트', detail: 'spherical hanging glass globe terrarium with a cute tillandsia air plant and pink quartz pebbles' },
    { name: '미니 목재 팻말 테라리움', desc: 'Welcome 목재 팻말과 버섯이 조화를 이룬 테라리움', detail: 'glass jar terrarium with a rustic miniature wooden sign, tiny red toadstool mushrooms, and lush soil layers' },
    { name: '다육이 로제트 화분 테라리움', desc: '장미 모양 다육식물이 가득한 기하학 유리 테라리움', detail: 'geometric glass prism terrarium filled with vibrant purple rosette succulents and white decorative stones' },
    { name: '빨간 버섯 숲 테라리움', desc: '이끼 밭 사이 앙증맞은 빨간 아기 버섯 3형제', detail: 'glass jar terrarium with a charming cluster of 3 tiny red toadstool mushrooms sprouting from soft green moss' },
    { name: '선인장 사막 테라리움', desc: '모래 지층 위 앙증맞은 미니 귀여운 선인장 2종', detail: 'glass jar terrarium with layered yellow desert sand and two miniature happy potted cacti' },
    { name: '빈티지 찻잔 미니 테라리움', desc: '파스텔 찻잔 속의 미니 수초와 이끼 정원', detail: 'vintage floral teacup filled with miniature succulents, soft moss, and tiny gravel layers' },
    { name: '전구 형태 미니 테라리움', desc: '전구 모양 유리병 안의 귀여운 에어플랜트와 자갈', detail: 'lightbulb-shaped glass terrarium containing a mini succulent and white decorative pebbles' },
    { name: '울타리 미니 정원 테라리움', desc: '흰 미니 울타리와 들꽃 이끼가 어우러진 유리병', detail: 'glass jar terrarium with a tiny white picket fence ornament set inside a green moss garden' },
    { name: '미니 벤치 공원 테라리움', desc: '작은 미니 공원 벤치 피규어가 놓인 감성 테라리움', detail: 'glass jar terrarium featuring a tiny miniature park bench figure on soft green moss' },
    { name: '크리스탈 미네랄 테라리움', desc: '보라색 자수정 원석과 이끼가 정돈된 테라리움', detail: 'glass jar terrarium with a shiny purple amethyst crystal cluster embedded in green moss' },
    { name: '미니 우체통 테라리움', desc: '빨간 미니 우체통 피규어가 있는 동화 속 테라리움', detail: 'glass jar terrarium with a tiny red mail box figurine standing in a plush moss bed' },
    { name: '조약돌 징검다리 테라리움', desc: '이끼 밭 위 조약돌 징검다리가 놓인 미니 테라리움', detail: 'glass jar terrarium with a tiny stepping stone pathway laid across lush green moss' },
    { name: '고사리 숲 테라리움', desc: '파릇파릇 미니 고사리 잎이 울창한 유리병 테라리움', detail: 'glass jar terrarium with delicate miniature fern leaves and moist dark soil layers' },
    { name: '피톤치드 침엽수 테라리움', desc: '미니 솔방울과 이끼 언덕이 피톤치드를 풍기는 유리병', detail: 'glass jar terrarium containing a tiny pinecone and lush evergreen moss bed' },
    { name: '원목 뚜껑 마개 테라리움', desc: '원목 코르크 마개 유리병 속 화사한 다육식물', detail: 'cork-topped glass jar terrarium with colorful mini succulents and white gravel' },
    { name: '미니 풍차 피규어 테라리움', desc: '유럽 풍 네덜란드 미니 풍차가 꽂힌 테라리움', detail: 'glass jar terrarium featuring a tiny cute Dutch windmill figurine on green moss' },
    { name: '황동 프레임 정십면체 테라리움', desc: '황동 금속 테두리 속 화려한 다육식물 팩', detail: 'brass geometric glass terrarium prism filled with multi-colored mini succulents' }
  ][i];

  return {
    id: `terrarium-20-pack-${num}`,
    name: `🫙 [테라리움 ${num}/20] ${items.name}`,
    animal: 'Terrarium 20 Pack',
    animalValue: '',
    affinityObject: items.name,
    theme: 'Terrarium 20 Pack',
    phrase: '',
    description: items.desc,
    prompt: `A cute die-cut sticker design featuring a complete, fully decorated ${items.detail}. NO animals, NO mammals, NO living creatures. NO glass reflection glare lines. Crisp white border. ${STICKER_RULES_PROMPT_SUFFIX_NO_TEXT}`
  }
}) as unknown as StickerPreset[]];

export const VIVARIUM_20_SERIES: StickerPreset[] = [
  {
    id: 'vivarium-20-pack-cover',
    name: '🖼️ [마스터 썸네일] 비바리움 20종 스티커 팩 대표 커버 표지',
    animal: 'Vivarium Master Cover',
    animalValue: '',
    affinityObject: 'Vivarium Master Cover',
    theme: 'Vivarium 20 Pack Cover',
    phrase: '',
    description: 'Etsy 판매용 20종 비바리움 스티커 팩 마스터 대표 썸네일 커버 표지 그래픽',
    prompt: `A professional Etsy digital sticker bundle master cover graphic illustration on a pure solid white background (#FFFFFF).
CENTERED TITLE (MUST REMAIN CLEAR & UNOBSTRUCTED): Centered cute bold pink script typography reading "20+ CUTE VIVARIUM STICKER BUNDLE". Below title reads "PNG DIGITAL DOWNLOAD" in a stylish teal ribbon banner. CRITICAL: The central title and banner MUST remain completely unobstructed, open, and clearly legible with an ample margin around it—NO stickers encroaching, touching, or overlapping the text.
STICKER ARRANGEMENT (DENSE YET NEATLY SEPARATED): A richly packed collage of 18-20 unique standalone die-cut sticker samples (mix of horizontal glass vivarium tanks and reptile/amphibian accent stickers) filling the perimeter of the canvas around the center title with minimal empty white gaps. CRITICAL NO OVERLAPPING: Individual stickers MUST NOT overlap, collide, or clip one another. Each sticker is completely isolated and neatly placed side-by-side with its own distinct thick crisp white die-cut border. STRICT NO DUPLICATES: Every single sticker is 100% unique in animal species, tank landscape, and pose with zero repetition.
FEATURED UNIQUE STICKERS: mini chameleon on driftwood tank, tree frog on monstera tank, crested gecko root tank, fire-bellied toad moss rock tank, spotted salamander tank, tropical vine chameleon tank, baby leopard gecko root tank, rainforest fern frog tank, natural slate rock salamander tank, monstera vine gecko tank, volcanic rock chameleon tank, cute garden snail moss tank, dense jungle driftwood tank, terrestrial plant chameleon tank, mossy boulder frog tank, driftwood arch salamander tank, tropical fern gecko tank, shallow creekbed frog tank, stone cave gecko tank, and standalone baby chameleon on leaf.
STRICT NO SUBMERGED ANIMALS & NO LAND MAMMALS/BIRDS RULE: Absolutely NO submerged lung-breathing animals underwater, NO land mammals, NO foxes, NO birds, NO cats, NO dogs inside or around the vivarium tanks. ONLY reptiles and amphibians perched in open air above ground/water, driftwood, moss, and tropical plants. CRITICAL: The image MUST have a pure solid white background (#FFFFFF). NEVER generate any background colors, gradients, or scenery. Etsy bestseller listing thumbnail aesthetic. High resolution.`
  },
  ...Array.from({ length: 20 }, (_, i) => {
    const num = i + 1;
  const items = [
    { name: '미니 카멜레온 수조 비바리움', desc: '가로 수조 유목 위 나른하게 쉰 미니 카멜레온', detail: 'wide horizontal glass vivarium tank with curved driftwood, moss, climbing vines, and a tiny cute baby green chameleon resting on a branch in open air' },
    { name: '나뭇잎 청개구리 수조 비바리움', desc: '몬스테라 잎 위 아기 청개구리가 앉은 비바리움', detail: 'horizontal glass vivarium tank featuring a tiny cute green tree frog perched on a monstera leaf in open air' },
    { name: '속눈썹 게코 도마뱀 비바리움', desc: '유목 뿌리 속 눈부신 크레스티드 게코 도마뱀', detail: 'wide vivarium tank with natural driftwood root, ferns, and a tiny adorable crested gecko perched on driftwood in open air' },
    { name: '무당개구리 이끼 비바리움', desc: '작은 바위 위 알록달록 무당개구리가 있는 수조', detail: 'horizontal vivarium tank with smooth river stones, moss, and a tiny colorful oriental fire-bellied toad perched on a dry mossy rock in open air' },
    { name: '피그미 도롱뇽 비바리움', desc: '촉촉한 이끼 침대 위 아기 점박이 도롱뇽', detail: 'wide vivarium tank with moist moss terrain, bark, and a tiny cute spotted salamander resting on dry moss in open air' },
    { name: '열대 넝쿨 카멜레온 비바리움', desc: '화려한 수생 넝쿨과 미니 파스텔 카멜레온', detail: 'panoramic vivarium tank filled with lush tropical climbing vines and a tiny cute chameleon sitting on a vine branch in open air' },
    { name: '유목 뿌리 아기 게코 비바리움', desc: '대형 꼬인 유목 뿌리와 아기 레오파드 게코', detail: 'horizontal vivarium tank with a large twisted driftwood root and a tiny baby leopard gecko perched on top in open air' },
    { name: '우림 고사리 청개구리 비바리움', desc: '우림 고사리 잎 아래 비를 피하는 미니 개구리', detail: 'wide vivarium tank with dense rainforest fern leaves and a tiny cute tree frog sheltering under a leaf on land in open air' },
    { name: '자연 바위 도롱뇽 비바리움', desc: '자연 암석 지층 사이의 미니 도롱뇽 비바리움', detail: 'horizontal glass tank featuring layered natural rock slate, moss, and a tiny cute baby salamander sitting on a rock in open air' },
    { name: '몬스테라 넝쿨 게코 비바리움', desc: '싱그러운 몬스테라 줄기 타는 미니 게코', detail: 'wide glass vivarium tank with climbing monstera vines and a tiny cute gecko climbing up in open air' },
    { name: '화산석 테인 카멜레온 비바리움', desc: '검은 화산석 바위와 카멜레온이 조화로운 수조', detail: 'horizontal vivarium tank with black volcanic rocks, moss mound, and a tiny green chameleon perched on a rock in open air' },
    { name: '미니 달팽이 이끼 비바리움', desc: '이끼 언덕 위 귀여운 미니 나뭇잎 달팽이', detail: 'wide vivarium tank with plush cushion moss and a tiny cute garden snail with a spiral shell crawling on moss in open air' },
    { name: '밀림 정글 유목 비바리움', desc: '울창한 정글 수초 유목 생태계 완성 수조', detail: 'panoramic vivarium tank featuring dense jungle foliage, curved driftwood, and smooth stones in a dry terrestrial setup' },
    { name: '수생 식물 카멜레온 비바리움', desc: '수생 식물 사이로 삐쭉 고개 내민 미니 카멜레온', detail: 'wide glass tank filled with lush terrestrial jungle plants and a tiny baby chameleon peeking out from leaves in open air' },
    { name: '이끼 바위 개구리 비바리움', desc: '이끼 덮인 바위 위 아기 청개구리의 비바리움', detail: 'horizontal vivarium tank with moss-covered boulders and a tiny cute green frog sitting happily on a dry mossy rock in open air' },
    { name: '유목 아치 도롱뇽 비바리움', desc: '유목 아치 다리 아래 쉬는 미니 도롱뇽 수조', detail: 'wide glass tank with an arched driftwood branch, ferns, and a tiny sleeping salamander resting on dry ground in open air' },
    { name: '트로피컬 고사리 게코 비바리움', desc: '열대 고사리 장식 수조 속 귀여운 아기 게코', detail: 'horizontal vivarium tank featuring lush tropical fern fronds and a tiny cute baby gecko perched on a fern in open air' },
    { name: '자갈 시냇물 비바리움', desc: '자갈 얕은 수분 물길이 지나는 비바리움 지형', detail: 'wide glass tank with a miniature gravel shallow creekbed at bottom, moss banks, and a tiny baby frog perched on a dry mossy bank in open air' },
    { name: '바위 동굴 게코 비바리움', desc: '바위 동굴 속에서 고개를 빼끔 내민 미니 게코', detail: 'horizontal vivarium tank with a tiny stone cave shelter and a cute gecko peeking out on dry ground in open air' },
    { name: '파노라마 마스터 비바리움', desc: '유목, 고사리, 이끼, 청개구리가 완벽 어우러진 비바리움', detail: 'wide panoramic vivarium glass tank with lush mixed greenery, driftwood root, and a cute tree frog perched high on a branch in open air' }
  ][i];

  return {
    id: `vivarium-20-pack-${num}`,
    name: `🦎 [비바리움 ${num}/20] ${items.name}`,
    animal: 'Vivarium 20 Pack',
    animalValue: '',
    affinityObject: items.name,
    theme: 'Vivarium 20 Pack',
    phrase: '',
    description: items.desc,
    prompt: `A cute die-cut sticker design featuring a clean, wide horizontal panoramic rectangular glass vivarium tank (dry land or low paludarium tank, NOT an underwater fish tank). Inside is a lush ${items.detail}. NO glass glare strips. Crisp white border. ${VIVARIUM_RULES_PROMPT_SUFFIX_NO_TEXT}`
  }
}) as unknown as StickerPreset[]];

export const SALT_AQUARIUM_20_SERIES: StickerPreset[] = [
  {
    id: 'salt-aquarium-20-pack-cover',
    name: '🖼️ [마스터 썸네일] 해수어항 20종 스티커 팩 대표 커버 표지',
    animal: 'Saltwater Aquarium Master Cover',
    animalValue: '',
    affinityObject: 'Saltwater Aquarium Master Cover',
    theme: 'Saltwater Aquarium 20 Pack Cover',
    phrase: '',
    description: 'Etsy 판매용 20종 해수어항 스티커 팩 마스터 대표 썸네일 커버 표지 그래픽',
    prompt: `A professional Etsy digital sticker bundle master cover graphic illustration on a pure solid white background (#FFFFFF).
CENTERED TITLE (MUST REMAIN CLEAR & UNOBSTRUCTED): Centered cute bold pink script typography reading "20+ SALTWATER AQUARIUM STICKER BUNDLE". Below title reads "PNG DIGITAL DOWNLOAD" in a stylish teal ribbon banner. CRITICAL: The central title and banner MUST remain completely unobstructed, open, and clearly legible with an ample margin around it—NO stickers encroaching, touching, or overlapping the text.
STICKER ARRANGEMENT (DENSE YET NEATLY SEPARATED): A richly packed collage of 18-20 unique standalone die-cut sticker samples (mix of marine glass aquarium tanks and ocean creature accent stickers) filling the perimeter of the canvas around the center title with minimal empty white gaps. CRITICAL NO OVERLAPPING: Individual stickers MUST NOT overlap, collide, or clip one another. Each sticker is completely isolated and neatly placed side-by-side with its own distinct thick crisp white die-cut border. STRICT NO DUPLICATES: Every single sticker is 100% unique in marine fish species, coral setup, and pose with zero repetition.
FEATURED UNIQUE STICKERS: clownfish & sea anemone tank, blue tang & vibrant coral reef tank, yellow seahorse & kelp tank, baby stingray & white sand tank, yellow pufferfish tank, yellow butterflyfish pair tank, baby clownfish pair tank, psychedelic mandarin fish tank, pink octopus in pearl seashell tank, clownfish & blue tang duo tank, orange starfish sand tank, glowing pink jellyfish tank, emperor angelfish tank, rainbow parrotfish tube coral tank, cute lionfish coral tank, open scallop pearl tank, red-striped cleaner shrimp tank, dense coral forest baby fish tank, queen angelfish tank, and standalone yellow seahorse.
STRICT NO LAND ANIMALS/MAMMALS/BIRDS RULE: Absolutely NO land animals, NO mammals, NO foxes, NO birds, NO cats, NO dogs inside or around the marine tanks. ONLY marine sea life, clownfish, blue tang, seahorses, coral reefs, and sea anemones. CRITICAL: The image MUST have a pure solid white background (#FFFFFF). NEVER generate any background colors, gradients, or scenery. Etsy bestseller listing thumbnail aesthetic. High resolution.`
  },
  ...Array.from({ length: 20 }, (_, i) => {
    const num = i + 1;
  const items = [
    { name: '크라운피쉬 & 말미잘 해수어항', desc: '주황색 크라운피쉬(니모)와 핑크 말미잘 어항', detail: 'glass saltwater aquarium tank with a cute orange clownfish swimming near a soft pink sea anemone and live rock' },
    { name: '블루탱 & 산호초 해수어항', desc: '파란색 블루탱(도리)과 형광 산호초 어항', detail: 'glass marine aquarium tank featuring a cute blue tang fish swimming amidst vibrant glowing coral reef' },
    { name: '해마 & 해조류 해수어항', desc: '노란 아기 해마가 나뭇가지 해조류에 감긴 어항', detail: 'glass saltwater aquarium tank with a cute yellow seahorse clinging gracefully to green sea kelp' },
    { name: '아기 가오리 & 산호 해수어항', desc: '웃는 얼굴 아기 가오리와 하얀 산호 어항', detail: 'glass marine tank with a smiling baby stingray gliding over colorful coral reefs and white sand' },
    { name: '아기 복어 해수어항', desc: '동글동글 귀여운 아기 노란 가시복어 어항', detail: 'glass saltwater tank with a round cute yellow pufferfish swimming near purple sea fans' },
    { name: '나비고기 & 산호초 해수어항', desc: '노란 나비고기 두 마리와 형광 산호초 어항', detail: 'glass marine tank with a pair of cute yellow butterflyfish around vibrant brain coral' },
    { name: '크라운피쉬 가족 해수어항', desc: '아기 크라운피쉬 두 마리가 짝지어 헤엄치는 어항', detail: 'glass saltwater tank featuring two baby clownfish swimming together near a sea anemone' },
    { name: '만다린 가비 해수어항', desc: '화려한 무늬의 만다린 피쉬와 해수어항', detail: 'glass marine tank with a colorful patterned mandarin fish among live rocks and coral' },
    { name: '아기 문어 & 조개 해수어항', desc: '분홍 아기 문어가 조개껍데기에서 노는 어항', detail: 'glass saltwater tank featuring a tiny cute pink octopus sitting inside a pearl seashell' },
    { name: '블루탱 & 크라운피쉬 해수어항', desc: '니모와 도리가 함께 헤엄치는 형광 산호 어항', detail: 'glass marine aquarium tank with both a cute clownfish and blue tang swimming around corals' },
    { name: '불가사리 & 흰 모래 해수어항', desc: '주황 불가사리와 맑은 바다 모래 해수어항', detail: 'glass saltwater tank with a friendly orange starfish resting on white coral sand' },
    { name: '해파리 & 야광 산호 해수어항', desc: '몽환적 핑크 해파리가 반짝이는 어항', detail: 'glass marine tank with a glowing pastel pink jellyfish floating gracefully near coral reef' },
    { name: '엔젤피쉬(관상어) 해수어항', desc: '줄무늬 해수 엔젤피쉬와 산호초 어항', detail: 'glass saltwater tank with a cute striped emperor angelfish among glowing sea anemones' },
    { name: '패럿피쉬 & 튜브 산호 해수어항', desc: '파스텔 무지개 빛 패럿피쉬와 튜브 산호 어항', detail: 'glass marine tank featuring a cute colorful pastel parrotfish swimming near pink tube corals' },
    { name: '쏠배감펭(라이언피쉬) 해수어항', desc: '화려한 지느러미의 귀여운 라이언피쉬 어항', detail: 'glass saltwater tank with a cute lionfish with elaborate fins near purple coral rocks' },
    { name: '가리비 조개 & 진주 해수어항', desc: '입 벌린 가리비 조개와 진주 보석 해수어항', detail: 'glass marine tank featuring an open scallop shell with a shiny pearl on sea sand' },
    { name: '청소 새우 & 산호 해수어항', desc: '빨간 줄무늬 청소 새우와 산호초 어항', detail: 'glass saltwater tank with a cute red-striped cleaner shrimp on live rock' },
    { name: '산호 숲 & 아기 물고기 해수어항', desc: '형광 산호가 숲처럼 우거진 해수어항', detail: 'glass marine tank filled with a dense forest of colorful corals and tiny blue fish' },
    { name: '퀸 엔젤피쉬 & 야광 해면 해수어항', desc: '우아한 퀸 엔젤피쉬와 야광 해면 산호 어항', detail: 'glass saltwater tank with a majestic baby queen angelfish swimming near glowing sea sponges' },
    { name: '파노라마 해수 마스터 어항', desc: '크라운피쉬, 산호초, 해마가 조화로운 해수어항', detail: 'panoramic glass saltwater tank filled with clownfish, corals, seahorse, and white sand' }
  ][i];

  return {
    id: `salt-aquarium-20-pack-${num}`,
    name: `🪸 [해수어항 ${num}/20] ${items.name}`,
    animal: 'Saltwater Aquarium 20 Pack',
    animalValue: '',
    affinityObject: items.name,
    theme: 'Saltwater Aquarium 20 Pack',
    phrase: '',
    description: items.desc,
    prompt: `A cute die-cut sticker design featuring a clean glass saltwater marine aquarium tank completely filled with clear aquatic water, with a visible water surface line near the top rim and tiny water bubbles strictly inside the water. Inside is a vibrant ${items.detail}. NO glass glare strips. Crisp white border. ${STICKER_RULES_PROMPT_SUFFIX_NO_TEXT}`
  }
}) as unknown as StickerPreset[]];

export const FRESH_AQUARIUM_20_SERIES: StickerPreset[] = [
  {
    id: 'fresh-aquarium-20-pack-cover',
    name: '🖼️ [마스터 썸네일] 열대어어항 20종 스티커 팩 대표 커버 표지',
    animal: 'Freshwater Aquarium Master Cover',
    animalValue: '',
    affinityObject: 'Freshwater Aquarium Master Cover',
    theme: 'Freshwater Aquarium 20 Pack Cover',
    phrase: '',
    description: 'Etsy 판매용 20종 열대어어항 스티커 팩 마스터 대표 썸네일 커버 표지 그래픽',
    prompt: `A professional Etsy digital sticker bundle master cover graphic illustration on a pure solid white background (#FFFFFF).
CENTERED TITLE (MUST REMAIN CLEAR & UNOBSTRUCTED): Centered cute bold pink script typography reading "20+ FRESHWATER AQUARIUM STICKER BUNDLE". Below title reads "PNG DIGITAL DOWNLOAD" in a stylish teal ribbon banner. CRITICAL: The central title and banner MUST remain completely unobstructed, open, and clearly legible with an ample margin around it—NO stickers encroaching, touching, or overlapping the text.
STICKER ARRANGEMENT (DENSE YET NEATLY SEPARATED): A richly packed collage of 18-20 unique standalone die-cut sticker samples (mix of freshwater glass aquarium tanks and fish accent stickers) filling the perimeter of the canvas around the center title with minimal empty white gaps. CRITICAL NO OVERLAPPING: Individual stickers MUST NOT overlap, collide, or clip one another. Each sticker is completely isolated and neatly placed side-by-side with its own distinct thick crisp white die-cut border. STRICT NO DUPLICATES: Every single sticker is 100% unique in freshwater fish species, aquatic plants, and pose with zero repetition.
FEATURED UNIQUE STICKERS: red veil-tail betta fish tank, glowing blue neon tetra swarm tank, fancy guppy pair tank, striped angelfish driftwood tank, albino corydoras gravel tank, black & blue marble betta tank, yellow dress guppy moss stone tank, red cherry shrimp driftwood tank, orange discus fish tank, golden algae eater pebble tank, pastel pink betta plant tank, vibrant cardinal tetra tank, ram cichlid tank, glass catfish tank, dwarf gourami rainbow tank, zebra danio tank, yellow apple snail tank, harlequin rasbora tank, pleco catfish tank, and standalone red veil-tail betta fish.
STRICT NO LAND ANIMALS/MAMMALS/BIRDS RULE: Absolutely NO land animals, NO mammals, NO foxes, NO birds, NO cats, NO dogs inside or around the freshwater tanks. ONLY freshwater aquatic fish, betta fish, guppies, aquatic green plants, and driftwood. CRITICAL: The image MUST have a pure solid white background (#FFFFFF). NEVER generate any background colors, gradients, or scenery. Etsy bestseller listing thumbnail aesthetic. High resolution.`
  },
  ...Array.from({ length: 20 }, (_, i) => {
    const num = i + 1;
  const items = [
    { name: '화려한 드레스 베타 열대어항', desc: '붉은 드레스 지느러미 베타와 나나 수초 어항', detail: 'freshwater aquarium tank with a gorgeous red veil-tail betta fish swimming among green aquatic plants' },
    { name: '네온 테트라 무리 열대어항', desc: '반짝이는 파란 네온 테트라들이 헤엄치는 수초 어항', detail: 'freshwater tank with a swarm of glowing blue neon tetra fish swimming near driftwood' },
    { name: '화려한 네온 구피 열대어항', desc: '화려한 꼬리의 파스텔 구피 두 마리와 수초 어항', detail: 'aquarium tank featuring a pair of colorful fancy guppy fish with flowing tails' },
    { name: '엔젤피쉬 & 수초 유목 어항', desc: '우아한 줄무늬 엔젤피쉬와 유목 수초 어항', detail: 'freshwater aquarium tank with a cute striped freshwater angelfish near tall green water plants' },
    { name: '알비노 코리도라스 열대어항', desc: '바닥을 훑는 귀여운 핑크 코리도라스 어항', detail: 'freshwater tank featuring a cute chubby corydoras catfish sitting on river gravel' },
    { name: '블랙 마블 베타 열대어항', desc: '검은색과 파란빛이 조화로운 마블 베타 어항', detail: 'aquarium tank with a stunning black and blue marble betta fish among green ferns' },
    { name: '옐로우 드레스 구피 열대어항', desc: '선명한 노란 드레스 꼬리 구피 어항', detail: 'freshwater tank with a shiny yellow fancy guppy swimming near moss stones' },
    { name: '체리 새우 & 이끼 유목 어항', desc: '빨간 체리 새우들이 유목 이끼 위 노는 어항', detail: 'aquarium tank featuring cute tiny red cherry shrimps grazing on mossy driftwood' },
    { name: '디스커스(원반 물고기) 열대어항', desc: '원반 모양 화려한 주황 디스커스 열대어항', detail: 'freshwater tank with a majestic colorful discus fish swimming near Amazon sword plants' },
    { name: '골든 알지이더 & 자갈 어항', desc: '귀여운 노란 이끼먹는 물고기와 수초 어항', detail: 'aquarium tank with a cute golden algae eater fish near smooth river pebbles' },
    { name: '파스텔 핑크 베타 열대어항', desc: '분홍빛 드레스 지느러미 아기 베타 어항', detail: 'freshwater tank with a cute pastel pink halfmoon betta fish near green water plants' },
    { name: '카디날 테트라 수초 어항', desc: '붉고 푸른 카디날 테트라와 수초 어항', detail: 'aquarium tank with vibrant cardinal tetras swimming near green moss' },
    { name: '드워프 구라미 열대어항', desc: '알록달록 드워프 구라미와 나나 수초 어항', detail: 'freshwater tank featuring a colorful cute dwarf gourami fish swimming near rocks' },
    { name: '화려한 삼색 구피 열대어항', desc: '삼색 화려한 지느러미의 프리미엄 구피 어항', detail: 'aquarium tank with a fancy tri-color guppy fish gliding over gravel' },
    { name: '애플 스네일 달팽이 열대어항', desc: '노란 동글동글 애플 스네일 달팽이 수초 어항', detail: 'freshwater tank featuring a cute yellow mystery apple snail crawling on water leaves' },
    { name: '오토싱(이끼 물고기) 열대어항', desc: '유리 벽면에 찰싹 붙은 미니 오토싱 어항', detail: 'freshwater aquarium tank with a tiny cute otocinclus catfish resting on a plant leaf' },
    { name: '수초 숲 & 자갈 바닥 어항', desc: '푸른 수초가 숲처럼 우거진 힐링 수초 어항', detail: 'aquarium tank filled with lush green aquatic moss, stem plants, and pebbles' },
    { name: '유목 아치 & 구피 무리 어항', desc: '유목 아치 다리 아래 헤엄치는 구피 어항', detail: 'freshwater tank with a curved wooden driftwood arch and swimming tiny colorful fish' },
    { name: '화이트 다이아몬드 베타 어항', desc: '순백색 우아한 다이아몬드 베타 어항', detail: 'freshwater tank with a pristine white veil-tail betta fish swimming among lush green plants' },
    { name: '파노라마 종합 열대어 수초 어항', desc: '베타, 구피, 테트라, 수초가 어우러진 완성 어항', detail: 'panoramic glass freshwater aquarium tank filled with betta fish, guppies, lush water plants, and driftwood' }
  ][i];

  return {
    id: `fresh-aquarium-20-pack-${num}`,
    name: `🐠 [열대어어항 ${num}/20] ${items.name}`,
    animal: 'Freshwater Aquarium 20 Pack',
    animalValue: '',
    affinityObject: items.name,
    theme: 'Freshwater Aquarium 20 Pack',
    phrase: '',
    description: items.desc,
    prompt: `A cute die-cut sticker design featuring a clean glass freshwater aquarium tank completely filled with translucent blue aquatic water, with a visible water surface line near the top rim and tiny water bubbles strictly inside the water. Inside is a beautiful ${items.detail}. NO glass glare strips. Crisp white border. ${STICKER_RULES_PROMPT_SUFFIX_NO_TEXT}`
  }
}) as unknown as StickerPreset[]];

export const TERRARIUM_STANDALONE_20_SERIES: StickerPreset[] = [
  {
    id: 'terrarium-standalone-20-pack-cover',
    name: '🖼️ [마스터 썸네일] 테라리움 단일 식물 20종 스티커 팩 대표 커버 표지',
    animal: 'Terrarium Standalone Cover',
    animalValue: '',
    affinityObject: 'Terrarium Standalone Cover',
    theme: 'Terrarium Standalone 20 Pack Cover',
    phrase: '',
    description: 'Etsy 판매용 20종 테라리움 단일 식물/오브제 스티커 팩 마스터 대표 썸네일 커버 표지 그래픽',
    prompt: `A professional Etsy digital sticker bundle master cover graphic illustration on a pure solid white background (#FFFFFF).
CENTERED TITLE (MUST REMAIN CLEAR & UNOBSTRUCTED): Centered cute bold pink script typography reading "20+ CUTE BOTANICAL STICKER BUNDLE". Below title reads "PNG DIGITAL DOWNLOAD" in a stylish teal ribbon banner. CRITICAL: The central title and banner MUST remain completely unobstructed, open, and clearly legible with an ample margin around it—NO stickers encroaching, touching, or overlapping the text.
STICKER ARRANGEMENT (DENSE YET NEATLY SEPARATED): A richly packed collage of 18-20 unique standalone die-cut sticker samples filling the perimeter of the canvas around the center title with minimal empty white gaps. CRITICAL NO OVERLAPPING: Individual stickers MUST NOT overlap, collide, or clip one another. Each sticker is completely isolated and neatly placed side-by-side with its own distinct thick crisp white die-cut border. STRICT NO DUPLICATES: Every single botanical sticker is 100% unique in plant variety, pot, and ornament with zero repetition.
FEATURED UNIQUE STICKERS: potted rosette succulents in terracotta pot, red-roof fairy cottage house figurine, grey Japanese stone lantern (toro) on moss, tillandsia airplant on pink quartz, rustic wooden Welcome sign with toadstools, purple succulent rosette in white ceramic, cluster of 3 red toadstool mushrooms, pair of happy potted cacti in yellow pot, pastel floral teacup succulent garden, mini potted succulent with white pebbles, white picket fence in moss garden, miniature park bench on moss, purple amethyst crystal cluster, tiny red mailbox with wildflowers, stepping stone pathway on moss, miniature fern frond, pinecone on evergreen moss, pastel mixed succulent bowl, miniature windmill figurine on moss, and multi-colored succulent dish.
STRICT NO GLASS TANKS OR JARS: Absolutely NO glass jars, NO glass globes, NO containers, NO land mammals, NO birds. Pure standalone botanical potted plants, succulents, mushrooms, crystal clusters, and fairy ornaments ONLY. CRITICAL: The image MUST have a pure solid white background (#FFFFFF). NEVER generate any background colors, gradients, or scenery. Etsy bestseller listing thumbnail aesthetic. High resolution.`
  },
  ...Array.from({ length: 20 }, (_, i) => {
    const num = i + 1;
    const items = [
      { name: '다육식물 로제트 화분 단일 스티커', desc: '화분 속 몽글몽글 다육식물 3종과 이끼 낱개 스티커', detail: 'standalone potted mini rosette succulents in a small terracotta pot with plush green moss' },
      { name: '요정 오두막 집 피규어 단일 스티커', desc: '이끼 언덕 위 빨간 지붕 요정 오두막 집 피규어 낱개 스티커', detail: 'standalone tiny ceramic red-roof fairy cottage house figurine resting on a lush green moss mound' },
      { name: '일본식 석등(토로) 피규어 단일 스티커', desc: '이끼 밭 위 정갈한 회색 일본식 석등 낱개 스티커', detail: 'standalone miniature grey Japanese stone lantern (toro) resting on a soft green moss bed' },
      { name: '틸란드시아 에어플랜트 단일 스티커', desc: '분홍 수정 자갈 위 에어플랜트 낱개 스티커', detail: 'standalone cute tillandsia air plant resting on smooth pink quartz pebbles' },
      { name: 'Welcome 목재 팻말 & 버섯 단일 스티커', desc: 'Welcome 팻말과 빨간 아기 버섯 낱개 스티커', detail: 'standalone rustic miniature wooden Welcome sign with tiny red toadstool mushrooms sprouting at base' },
      { name: '보라 다육이 로제트 화분 단일 스티커', desc: '화사한 보라빛 다육식물 로제트 화분 낱개 스티커', detail: 'standalone vibrant purple and green rosette succulent plant in a small white ceramic pot' },
      { name: '빨간 아기 버섯 3형제 단일 스티커', desc: '이끼 위 앙증맞은 빨간 아기 버섯 3형제 낱개 스티커', detail: 'standalone charming cluster of 3 tiny red toadstool mushrooms sprouting from green moss' },
      { name: '미니 선인장 화분 단일 스티커', desc: '노란 화분 속 귀여운 쌍둥이 선인장 낱개 스티커', detail: 'standalone pair of miniature happy potted cacti in a cute yellow ceramic pot' },
      { name: '빈티지 찻잔 다육이 정원 단일 스티커', desc: '파스텔 찻잔 속 미니 다육이 정원 낱개 스티커', detail: 'standalone pastel floral teacup filled with miniature succulents and soft green moss' },
      { name: '미니 다육식물 화분 단일 스티커', desc: '흰 자갈이 깔린 앙증맞은 미니 다육 화분 낱개 스티커', detail: 'standalone miniature potted succulent with white decorative pebbles' },
      { name: '흰 미니 울타리 & 이끼 정원 단일 스티커', desc: '흰 울타리와 파릇파릇 이끼 정원 낱개 스티커', detail: 'standalone tiny white picket fence ornament set inside a green moss garden patch' },
      { name: '미니 공원 벤치 피규어 단일 스티커', desc: '이끼 위 작고 아기자기한 공원 벤치 낱개 스티커', detail: 'standalone tiny miniature park bench figure resting on a soft green moss bed' },
      { name: '보라 자수정 원석 클러스터 단일 스티커', desc: '이끼 위 반짝이는 보라 자수정 원석 낱개 스티커', detail: 'standalone shiny purple amethyst crystal cluster embedded in green moss' },
      { name: '빨간 미니 우체통 피규어 단일 스티커', desc: '이끼 밭 위 미니 우체통 피규어 낱개 스티커', detail: 'standalone tiny red mailbox figurine standing in a plush moss bed with tiny wildflowers' },
      { name: '조약돌 징검다리 이끼 패치 단일 스티커', desc: '녹색 이끼 위 디딤돌 징검다리 낱개 스티커', detail: 'standalone tiny stepping stone pathway laid across lush green moss' },
      { name: '미니 고사리 줄기 단일 스티커', desc: '파릇파릇 미니 고사리 잎 줄기 낱개 스티커', detail: 'standalone delicate miniature fern frond branch with moist green moss' },
      { name: '솔방울 & 침엽 이끼 단일 스티커', desc: '앙증맞은 솔방울과 녹색 이끼 낱개 스티커', detail: 'standalone tiny pinecone resting on a lush evergreen moss bed' },
      { name: '파스텔 미니 다육식물 모듬 단일 스티커', desc: '알록달록 미니 다육식물 모듬 낱개 스티커', detail: 'standalone colorful mini succulents cluster with white decorative gravel' },
      { name: '네덜란드 미니 풍차 피규어 단일 스티커', desc: '이끼 위 미니 풍차 피규어 낱개 스티커', detail: 'standalone tiny cute Dutch windmill figurine on green moss patch' },
      { name: '무지개 미니 다육이 접시 단일 스티커', desc: '화사한 무지개빛 미니 다육식물 접시 낱개 스티커', detail: 'standalone multi-colored mini succulents cluster arranged in a small terracotta dish' }
    ][i];

    return {
      id: `terrarium-standalone-20-pack-${num}`,
      name: `🪴 [테라리움 단일 ${num}/20] ${items.name}`,
      animal: 'Terrarium Standalone 20 Pack',
      animalValue: '',
      affinityObject: items.name,
      theme: 'Terrarium Standalone 20 Pack',
      phrase: '',
      description: items.desc,
      prompt: `A cute die-cut sticker design featuring a standalone single botanical object: ${items.detail}. STRICT NO GLASS TANKS OR JARS RULE: NO glass jar, NO glass container, NO background scenery. Crisp white border. ${STICKER_RULES_PROMPT_SUFFIX_NO_TEXT}`
    };
  }) as unknown as StickerPreset[]
];

export const VIVARIUM_STANDALONE_20_SERIES: StickerPreset[] = [
  {
    id: 'vivarium-standalone-20-pack-cover',
    name: '🖼️ [마스터 썸네일] 비바리움 단일 동물 20종 스티커 팩 대표 커버 표지',
    animal: 'Vivarium Standalone Cover',
    animalValue: '',
    affinityObject: 'Vivarium Standalone Cover',
    theme: 'Vivarium Standalone 20 Pack Cover',
    phrase: '',
    description: 'Etsy 판매용 20종 비바리움 단일 동물 스티커 팩 마스터 대표 썸네일 커버 표지 그래픽',
    prompt: `A professional Etsy digital sticker bundle master cover graphic illustration on a pure solid white background (#FFFFFF).
CENTERED TITLE (MUST REMAIN CLEAR & UNOBSTRUCTED): Centered cute bold pink script typography reading "20+ CUTE REPTILE & AMPHIBIAN STICKER BUNDLE". Below title reads "PNG DIGITAL DOWNLOAD" in a stylish teal ribbon banner. CRITICAL: The central title and banner MUST remain completely unobstructed, open, and clearly legible with an ample margin around it—NO stickers encroaching, touching, or overlapping the text.
STICKER ARRANGEMENT (DENSE YET NEATLY SEPARATED): A richly packed collage of 18-20 unique standalone die-cut sticker samples filling the perimeter of the canvas around the center title with minimal empty white gaps. CRITICAL NO OVERLAPPING: Individual stickers MUST NOT overlap, collide, or clip one another. Each sticker is completely isolated and neatly placed side-by-side with its own distinct thick crisp white die-cut border. STRICT NO DUPLICATES: Every single reptile and amphibian sticker is 100% unique in species, branch, and pose with zero repetition.
FEATURED UNIQUE STICKERS: baby green chameleon on curved driftwood, cute green tree frog on monstera leaf, eyelash crested gecko on mossy root, colorful oriental fire-bellied toad on dry rock, baby spotted salamander on cushion moss, pastel green chameleon clinging to tropical vine, baby leopard gecko on bark, rain frog under a broad leaf frond, baby tiger salamander on dry slate rock, climbing gecko on vine, veiled chameleon on volcanic stone, garden snail with spiral shell on moss, horned frog on pebble ground, baby day gecko on bamboo stem, smiling tree frog on moss boulder, sleeping salamander on wood bark, baby fat-tail gecko on fern leaf, poison dart frog on dry river pebble, cave gecko peeking from rock, and chameleon on flowering tropical branch.
STRICT NO GLASS TANKS: Absolutely NO glass tanks, NO containers, NO submerged animals underwater, NO land mammals, NO birds. ONLY reptiles and amphibians perched in open air on driftwood, moss, or leaves. CRITICAL: The image MUST have a pure solid white background (#FFFFFF). NEVER generate any background colors, gradients, or scenery. Etsy bestseller listing thumbnail aesthetic. High resolution.`
  },
  ...Array.from({ length: 20 }, (_, i) => {
    const num = i + 1;
    const items = [
      { name: '미니 초록 카멜레온 단일 스티커', desc: '유목 가지 위 나른하게 쉰 미니 카멜레온 낱개 스티커', detail: 'standalone tiny cute baby green chameleon sitting lazily on a natural curved driftwood branch in open air' },
      { name: '몬스테라 잎 아기 청개구리 단일 스티커', desc: '몬스테라 잎 위 앉은 아기 청개구리 낱개 스티커', detail: 'standalone tiny cute green tree frog perched happily on a monstera leaf in open air' },
      { name: '속눈썹 게코(크레스티드) 단일 스티커', desc: '유목 뿌리 위 크레스티드 게코 낱개 스티커', detail: 'standalone tiny adorable crested gecko perched gracefully on a mossy driftwood root in open air' },
      { name: '알록달록 무당개구리 단일 스티커', desc: '바위 위 알록달록 무당개구리 낱개 스티커', detail: 'standalone tiny colorful oriental fire-bellied toad perched on a dry mossy rock in open air' },
      { name: '아기 점박이 도롱뇽 단일 스티커', desc: '이끼 침대 위 아기 점박이 도롱뇽 낱개 스티커', detail: 'standalone tiny cute spotted salamander resting comfortably on dry green moss in open air' },
      { name: '열대 넝쿨 카멜레온 단일 스티커', desc: '넝쿨 가지를 매달린 파스텔 카멜레온 낱개 스티커', detail: 'standalone tiny cute pastel green chameleon clinging to a tropical vine branch in open air' },
      { name: '레오파드 게코 도마뱀 단일 스티커', desc: '꼬인 유목 뿌리 위 아기 레오파드 게코 낱개 스티커', detail: 'standalone tiny baby leopard gecko perched on top of a twisted driftwood root in open air' },
      { name: '우림 고사리 청개구리 단일 스티커', desc: '고사리 잎 아래 앙증맞은 청개구리 낱개 스티커', detail: 'standalone tiny cute tree frog sheltering under a rainforest fern frond on dry land in open air' },
      { name: '자연 암석 아기 도롱뇽 단일 스티커', desc: '바위 위 고개 내민 미니 도롱뇽 낱개 스티커', detail: 'standalone tiny cute baby salamander sitting on a natural rock slate in open air' },
      { name: '몬스테라 넝쿨 미니 게코 단일 스티커', desc: '몬스테라 줄기 타는 미니 게코 낱개 스티커', detail: 'standalone tiny cute gecko climbing up a leafy monstera vine in open air' },
      { name: '화산석 초록 카멜레온 단일 스티커', desc: '검은 화산석 위 앉은 미니 카멜레온 낱개 스티커', detail: 'standalone tiny green chameleon perched on a black volcanic rock in open air' },
      { name: '미니 나뭇잎 달팽이 단일 스티커', desc: '나뭇잎 위 기어가는 귀여운 정원 달팽이 낱개 스티커', detail: 'standalone tiny cute garden snail with a spiral shell crawling on a green leaf in open air' },
      { name: '밀림 정글 아기 도마뱀 단일 스티커', desc: '나무 껍질 위 정글 도마뱀 낱개 스티커', detail: 'standalone tiny cute jungle lizard resting on a mossy tree bark in open air' },
      { name: '열대 잎 아기 카멜레온 단일 스티커', desc: '나뭇잎 사이로 빼끔 얼굴 낸 카멜레온 낱개 스티커', detail: 'standalone tiny baby chameleon peeking out from green tropical leaves in open air' },
      { name: '이끼 바위 행복한 청개구리 단일 스티커', desc: '이끼 바위 위 행복한 청개구리 낱개 스티커', detail: 'standalone tiny cute green frog sitting happily on a dry moss-covered boulder in open air' },
      { name: '유목 아치 쉬는 도롱뇽 단일 스티커', desc: '유목 아치 아래 쉬는 미니 도롱뇽 낱개 스티커', detail: 'standalone tiny sleeping salamander resting under a small arched driftwood branch in open air' },
      { name: '트로피컬 고사리 미니 게코 단일 스티커', desc: '고사리 잎 위 귀여운 아기 게코 낱개 스티커', detail: 'standalone tiny cute baby gecko perched on a bright green fern in open air' },
      { name: '이끼 둑 아기 청개구리 단일 스티커', desc: '이끼 둑 위 아기 청개구리 낱개 스티커', detail: 'standalone tiny baby frog perched on a dry mossy pebble bank in open air' },
      { name: '자연 조약돌 위 미니 게코 단일 스티커', desc: '이끼 조약돌 위 엎드린 아기 게코 낱개 스티커', detail: 'standalone tiny cute gecko resting peacefully on a small single mossy pebble stone in open air' },
      { name: '나뭇가지 위 아기 청개구리 단일 스티커', desc: '나뭇가지 위 앙증맞은 청개구리 낱개 스티커', detail: 'standalone tiny cute tree frog perched high on a natural wooden branch with leaves in open air' }
    ][i];

    return {
      id: `vivarium-standalone-20-pack-${num}`,
      name: `🦎 [비바리움 단일 ${num}/20] ${items.name}`,
      animal: 'Vivarium Standalone 20 Pack',
      animalValue: '',
      affinityObject: items.name,
      theme: 'Vivarium Standalone 20 Pack',
      phrase: '',
      description: items.desc,
      prompt: `A cute die-cut sticker design featuring an isolated standalone single animal: ${items.detail}. STRICT BIOLOGICAL SURVIVAL RULE: NO glass tank, NO container, NO underwater submergence. Animal MUST be in open air on dry land/driftwood/leaf, head exposed above water. Crisp white die-cut border. PURE SOLID WHITE BACKGROUND (#FFFFFF). Absolutely NO background rock walls, NO full scenery. ${VIVARIUM_RULES_PROMPT_SUFFIX_NO_TEXT}`
    };
  }) as unknown as StickerPreset[]
];

export const SALT_AQUARIUM_STANDALONE_20_SERIES: StickerPreset[] = [
  {
    id: 'salt-aquarium-standalone-20-pack-cover',
    name: '🖼️ [마스터 썸네일] 해수어항 단일 해수어 20종 스티커 팩 대표 커버 표지',
    animal: 'Saltwater Aquarium Standalone Cover',
    animalValue: '',
    affinityObject: 'Saltwater Aquarium Standalone Cover',
    theme: 'Saltwater Aquarium Standalone 20 Pack Cover',
    phrase: '',
    description: 'Etsy 판매용 20종 해수어항 단일 해수어 스티커 팩 마스터 대표 썸네일 커버 표지 그래픽',
    prompt: `A professional Etsy digital sticker bundle master cover graphic illustration on a pure solid white background (#FFFFFF).
CENTERED TITLE (MUST REMAIN CLEAR & UNOBSTRUCTED): Centered cute bold pink script typography reading "20+ CUTE MARINE FISH STICKER BUNDLE". Below title reads "PNG DIGITAL DOWNLOAD" in a stylish teal ribbon banner. CRITICAL: The central title and banner MUST remain completely unobstructed, open, and clearly legible with an ample margin around it—NO stickers encroaching, touching, or overlapping the text.
STICKER ARRANGEMENT (DENSE YET NEATLY SEPARATED): A richly packed collage of 18-20 unique standalone die-cut sticker samples filling the perimeter of the canvas around the center title with minimal empty white gaps. CRITICAL NO OVERLAPPING: Individual stickers MUST NOT overlap, collide, or clip one another. Each sticker is completely isolated and neatly placed side-by-side with its own distinct thick crisp white die-cut border. STRICT NO DUPLICATES: Every single marine sea creature sticker is 100% unique in species, color, and pose with zero repetition.
FEATURED UNIQUE STICKERS: orange clownfish with white stripes, vibrant blue tang fish, yellow seahorse clinging to sea kelp, smiling baby stingray, round yellow spiny pufferfish, yellow butterflyfish pair, mandarin dragonet fish with psychedelic swirls, tiny pastel pink octopus in seashell, friendly orange starfish, glowing pink moon jellyfish, emperor angelfish with royal stripes, rainbow pastel parrotfish, cute lionfish with fan fins, scallop shell with shiny pearl, red-striped cleaner shrimp, glowing brain coral branch, baby queen angelfish, hermit crab in painted shell, spotted sea turtle hatchling, and blue damselfish with coral.
STRICT NO GLASS TANKS: Absolutely NO glass tanks, NO containers, NO land mammals, NO birds. Pure standalone vibrant marine ocean fish, seahorses, starfish, and corals ONLY. CRITICAL: The image MUST have a pure solid white background (#FFFFFF). NEVER generate any background colors, gradients, or scenery. Etsy bestseller listing thumbnail aesthetic. High resolution.`
  },
  ...Array.from({ length: 20 }, (_, i) => {
    const num = i + 1;
    const items = [
      { name: '주황 크라운피쉬(니모) 단일 스티커', desc: '주황색 니모 물고기와 분홍 말미잘 낱개 스티커', detail: 'standalone cute orange clownfish swimming near a soft pink sea anemone' },
      { name: '파란 블루탱(도리) 단일 스티커', desc: '파란색 블루탱(도리) 해수어 낱개 스티커', detail: 'standalone cute vibrant blue tang fish with yellow tail fin' },
      { name: '노란 아기 해마 단일 스티커', desc: '노란 아기 해마 낱개 스티커', detail: 'standalone cute yellow baby seahorse holding a small sea kelp' },
      { name: '웃는 아기 가오리 단일 스티커', desc: '웃는 얼굴 귀여운 아기 가오리 낱개 스티커', detail: 'standalone smiling baby stingray with cute big eyes gliding gracefully' },
      { name: '노란 아기 가시복어 단일 스티커', desc: '동글동글 귀여운 아기 노란 복어 낱개 스티커', detail: 'standalone round chubby cute yellow porcupine pufferfish with tiny fins' },
      { name: '쌍둥이 노란 나비고기 단일 스티커', desc: '줄무늬 노란 나비고기 듀오 낱개 스티커', detail: 'standalone pair of cute yellow butterflyfish with black stripes' },
      { name: '아기 크라운피쉬 듀오 단일 스티커', desc: '아기 니모 두 마리 콤보 낱개 스티커', detail: 'standalone two cute baby clownfish swimming together happily' },
      { name: '화려한 만다린 피쉬 단일 스티커', desc: '무지개빛 만다린 해수어 낱개 스티커', detail: 'standalone vibrant blue and orange patterned mandarin fish' },
      { name: '분홍 아기 문어 단일 스티커', desc: '파스텔 핑크 아기 문어 낱개 스티커', detail: 'standalone tiny cute pastel pink baby octopus waving tiny tentacles' },
      { name: '니모 & 도리 콤보 단일 스티커', desc: '크라운피쉬와 블루탱 조화 낱개 스티커', detail: 'standalone cute clownfish and blue tang swimming side by side' },
      { name: '주황 불가사리 단일 스티커', desc: '웃는 얼굴 주황 불가사리 낱개 스티커', detail: 'standalone friendly chubby orange starfish with happy face' },
      { name: '몽환 핑크 해파리 단일 스티커', desc: '파스텔 핑크 투명 해파리 낱개 스티커', detail: 'standalone glowing translucent pastel pink jellyfish floating gracefully' },
      { name: '줄무늬 엔젤피쉬 단일 스티커', desc: '우아한 줄무늬 해수 엔젤피쉬 낱개 스티커', detail: 'standalone cute striped emperor angelfish with flowing fins' },
      { name: '무지개 패럿피쉬 단일 스티커', desc: '파스텔 무지개 빛 패럿피쉬 낱개 스티커', detail: 'standalone cute colorful rainbow pastel parrotfish' },
      { name: '화려한 라이언피쉬 단일 스티커', desc: '화려한 지느러미의 미니 라이언피쉬 낱개 스티커', detail: 'standalone cute lionfish with elaborate decorative fan fins' },
      { name: '가리비 조개 & 진주 단일 스티커', desc: '입 벌린 조개 속 하얀 진주 낱개 스티커', detail: 'standalone open scallop seashell holding a shiny white pearl' },
      { name: '빨간 줄무늬 청소 새우 단일 스티커', desc: '빨간 줄무늬 청소 새우 낱개 스티커', detail: 'standalone cute red-and-white striped cleaner shrimp' },
      { name: '형광 산호초 가지 단일 스티커', desc: '반짝이는 핑크/티얼 형광 산호초 낱개 스티커', detail: 'standalone vibrant glowing pink and teal coral reef branch' },
      { name: '우아한 퀸 엔젤피쉬 단일 스티커', desc: '푸른빛 우아한 퀸 엔젤피쉬 낱개 스티커', detail: 'standalone majestic baby queen angelfish with blue and gold scales' },
      { name: '파스텔 무지개 해마 단일 스티커', desc: '파스텔 무지개빛 아기 해마 낱개 스티커', detail: 'standalone pastel rainbow colored baby seahorse' }
    ][i];

    return {
      id: `salt-aquarium-standalone-20-pack-${num}`,
      name: `🪸 [해수어 단일 ${num}/20] ${items.name}`,
      animal: 'Saltwater Aquarium Standalone 20 Pack',
      animalValue: '',
      affinityObject: items.name,
      theme: 'Saltwater Aquarium Standalone 20 Pack',
      phrase: '',
      description: items.desc,
      prompt: `A cute die-cut sticker design featuring a standalone single marine fish: ${items.detail}. STRICT NO GLASS TANK RULE: NO glass tank, NO container, NO background scenery. Crisp white border. ${AQUARIUM_RULES_PROMPT_SUFFIX_NO_TEXT}`
    };
  }) as unknown as StickerPreset[]
];

export const FRESH_AQUARIUM_STANDALONE_20_SERIES: StickerPreset[] = [
  {
    id: 'fresh-aquarium-standalone-20-pack-cover',
    name: '🖼️ [마스터 썸네일] 열대어어항 단일 열대어 20종 스티커 팩 대표 커버 표지',
    animal: 'Freshwater Aquarium Standalone Cover',
    animalValue: '',
    affinityObject: 'Freshwater Aquarium Standalone Cover',
    theme: 'Freshwater Aquarium Standalone 20 Pack Cover',
    phrase: '',
    description: 'Etsy 판매용 20종 열대어어항 단일 열대어 스티커 팩 마스터 대표 썸네일 커버 표지 그래픽',
    prompt: `A professional Etsy digital sticker bundle master cover graphic illustration on a pure solid white background (#FFFFFF).
CENTERED TITLE (MUST REMAIN CLEAR & UNOBSTRUCTED): Centered cute bold pink script typography reading "20+ CUTE TROPICAL FISH STICKER BUNDLE". Below title reads "PNG DIGITAL DOWNLOAD" in a stylish teal ribbon banner. CRITICAL: The central title and banner MUST remain completely unobstructed, open, and clearly legible with an ample margin around it—NO stickers encroaching, touching, or overlapping the text.
STICKER ARRANGEMENT (DENSE YET NEATLY SEPARATED): A richly packed collage of 18-20 unique standalone die-cut sticker samples filling the perimeter of the canvas around the center title with minimal empty white gaps. CRITICAL NO OVERLAPPING: Individual stickers MUST NOT overlap, collide, or clip one another. Each sticker is completely isolated and neatly placed side-by-side with its own distinct thick crisp white die-cut border. STRICT NO DUPLICATES: Every single freshwater tropical fish sticker is 100% unique in species, fin shape, and color with zero repetition.
FEATURED UNIQUE STICKERS: red veil-tail betta fish, swarm of glowing blue neon tetras, fancy pastel guppy fish pair, striped freshwater angelfish, albino pink corydoras catfish, black & blue marble betta, yellow fancy dress guppy, cute red cherry shrimp on moss, round orange discus fish, golden algae eater, pastel pink halfmoon betta, vibrant cardinal tetras, ram cichlid with shimmering colors, glass catfish, dwarf gourami with rainbow stripes, zebra danio, yellow mystery apple snail, harlequin rasbora, pleco catfish with sucker mouth, and green marimo moss ball.
STRICT NO GLASS TANKS: Absolutely NO glass tanks, NO containers, NO land mammals, NO birds. Pure standalone freshwater tropical fish, bettas, guppies, snails, and aquatic plants ONLY. CRITICAL: The image MUST have a pure solid white background (#FFFFFF). NEVER generate any background colors, gradients, or scenery. Etsy bestseller listing thumbnail aesthetic. High resolution.`
  },
  ...Array.from({ length: 20 }, (_, i) => {
    const num = i + 1;
    const items = [
      { name: '붉은 드레스 베일테일 베타 단일 스티커', desc: '붉은 드레스 지느러미 베타 열대어 낱개 스티커', detail: 'standalone gorgeous red veil-tail betta fish with flowing silk fins' },
      { name: '네온 테트라 삼총사 단일 스티커', desc: '반짝이는 파란 네온 테트라 3마리 낱개 스티커', detail: 'standalone trio of glowing blue and red neon tetra fish swimming together' },
      { name: '팬시 구피 듀오 단일 스티커', desc: '화려한 꼬리의 팬시 구피 2마리 낱개 스티커', detail: 'standalone pair of colorful fancy guppy fish with vibrant fan tails' },
      { name: '민물 줄무늬 엔젤피쉬 단일 스티커', desc: '우아한 민물 엔젤피쉬 낱개 스티커', detail: 'standalone cute silver and black striped freshwater angelfish' },
      { name: '알비노 코리도라스 메기 단일 스티커', desc: '핑크빛 귀여운 코리도라스 낱개 스티커', detail: 'standalone cute chubby pink albino corydoras catfish with tiny whiskers' },
      { name: '블랙 마블 베타 단일 스티커', desc: '검은색과 사파이어 블루 마블 베타 낱개 스티커', detail: 'standalone stunning black and sapphire blue marble betta fish' },
      { name: '노란 드레스 꼬리 구피 단일 스티커', desc: '선명한 노란 드레스 구피 낱개 스티커', detail: 'standalone shiny yellow fan-tail fancy guppy fish' },
      { name: '체리 새우 삼총사 단일 스티커', desc: '앙증맞은 빨간 체리 새우 3마리 낱개 스티커', detail: 'standalone trio of cute tiny bright red cherry shrimps' },
      { name: '원반 주황 디스커스 단일 스티커', desc: '화려한 원반 모양 주황 디스커스 낱개 스티커', detail: 'standalone majestic round bright orange and blue discus fish' },
      { name: '노란 골든 알지이더 단일 스티커', desc: '귀여운 노란 이끼먹는 물고기 낱개 스티커', detail: 'standalone cute golden algae eater fish' },
      { name: '파스텔 핑크 하프문 베타 단일 스티커', desc: '분홍빛 반달 지느러미 하프문 베타 낱개 스티커', detail: 'standalone cute pastel pink halfmoon betta fish with large rounded tail' },
      { name: '카디날 테트라 단일 스티커', desc: '붉고 푸른 선명한 카디날 테트라 낱개 스티커', detail: 'standalone vibrant cardinal tetras with brilliant red and blue stripes' },
      { name: '드워프 구라미 단일 스티커', desc: '알록달록 드워프 구라미 낱개 스티커', detail: 'standalone colorful blue and orange striped dwarf gourami fish' },
      { name: '삼색 팬시 구피 단일 스티커', desc: '파스텔 삼색 화려한 구피 낱개 스티커', detail: 'standalone fancy tri-color pastel guppy fish' },
      { name: '애플 스네일 달팽이 단일 스티커', desc: '동글동글 노란 애플 스네일 달팽이 낱개 스티커', detail: 'standalone cute yellow mystery apple snail with round shell and cute tentacles' },
      { name: '미니 오토싱 메기 단일 스티커', desc: '앙증맞은 미니 오토싱 메기 낱개 스티커', detail: 'standalone tiny cute otocinclus catfish' },
      { name: '푸른 수초 줄기 단일 스티커', desc: '싱그러운 수초 잎 줄기 낱개 스티커', detail: 'standalone lush vibrant green aquatic stem plant with leaves' },
      { name: '유목 이끼 아치 단일 스티커', desc: '녹색 이끼가 낀 자연 유목 낱개 스티커', detail: 'standalone small piece of natural driftwood with green aquatic moss' },
      { name: '화이트 다이아몬드 베타 단일 스티커', desc: '순백색 진주 빛 다이아몬드 베타 낱개 스티커', detail: 'standalone pristine pearl white veil-tail betta fish with glowing fins' },
      { name: '알록달록 미니 열대어 듀오 단일 스티커', desc: '귀여운 미니 열대어 2마리 낱개 스티커', detail: 'standalone pair of colorful cute mini tropical fish' }
    ][i];

    return {
      id: `fresh-aquarium-standalone-20-pack-${num}`,
      name: `🐠 [열대어 단일 ${num}/20] ${items.name}`,
      animal: 'Freshwater Aquarium Standalone 20 Pack',
      animalValue: '',
      affinityObject: items.name,
      theme: 'Freshwater Aquarium Standalone 20 Pack',
      phrase: '',
      description: items.desc,
      prompt: `A cute die-cut sticker design featuring a standalone single freshwater fish: ${items.detail}. STRICT NO GLASS TANK RULE: NO glass tank, NO container, NO background scenery. Crisp white border. ${AQUARIUM_RULES_PROMPT_SUFFIX_NO_TEXT}`
    };
  }) as unknown as StickerPreset[]
];

export const BOOKTOK_20_SERIES: StickerPreset[] = [
  {
    id: 'booktok-20-pack-cover',
    name: '🖼️ [마스터 썸네일] 북톡 & 코지 리딩 20종 스티커 팩 대표 커버 표지',
    animal: 'Cozy Book Club Cover',
    animalValue: '',
    affinityObject: 'Cozy Book Club Cover',
    theme: 'BookTok Reading 20 Pack Cover',
    phrase: '',
    description: 'Etsy 판매용 20종 북톡 & 코지 리딩 스티커 팩 마스터 대표 썸네일 커버 표지 그래픽',
    prompt: `A professional Etsy digital sticker bundle master cover graphic illustration on a pure solid white background (#FFFFFF).
CENTERED TITLE (MUST REMAIN CLEAR & UNOBSTRUCTED): Centered cute bold pink script typography reading "20+ CUTE COZY READING & BOOK CLUB STICKER BUNDLE". Below title reads "PNG DIGITAL DOWNLOAD" in a stylish teal ribbon banner. CRITICAL: The central title and banner MUST remain completely unobstructed, open, and clearly legible with an ample margin around it—NO stickers encroaching, touching, or overlapping the text.
STICKER ARRANGEMENT (DENSE YET NEATLY SEPARATED): A richly packed collage of 18-20 unique standalone die-cut sticker samples filling the perimeter of the canvas around the center title with minimal empty white gaps. CRITICAL NO OVERLAPPING: Individual stickers MUST NOT overlap, collide, or clip one another. Each sticker is completely isolated and neatly placed side-by-side with its own distinct thick crisp white die-cut border. STRICT NO DUPLICATES: Every single sticker is 100% unique in animal character, bookish item, and pose with zero repetition.
FEATURED UNIQUE STICKERS: glasses reading calico kitten, pastel e-reader baby bear, aesthetic pastel hardcover book stack with hot cocoa mug, satin ribbon bookmark bunny, late-night desk lamp reading red panda, latte art open book flatlay, 5-star review book club hamster, reading journal TBR jar puppy, floral teacup bookworm sloth, library card with cat stamps, audiobook headphones duckling, cozy book nook piglet, vintage typewriter pygmy hippo, magical glowing fantasy book fox, candlelit reading otter, bookmark pile hedgehog, book cart fawn, bookish tote bag penguin, book lover quote badge, and sleepy reading panda.
STRICT NO GLASS TANKS: Absolutely NO fish tanks, NO terrarium jars. Pure standalone adorable bookworm animals, novels, e-reader devices, and cozy reading accessories ONLY. CRITICAL: The image MUST have a pure solid white background (#FFFFFF). NEVER generate any background colors, gradients, or scenery. Etsy bestseller listing thumbnail aesthetic. High resolution.`
  },
  ...Array.from({ length: 20 }, (_, i) => {
    const num = i + 1;
    const items = [
      {
        name: '안경 쓴 독서광 아기 고양이',
        desc: '포근한 스웨터와 금테 안경을 쓰고 책에 빠져든 아기 고양이 스티커',
        phrase: 'Just One More Chapter',
        detail: 'standalone cute fluffy baby calico kitten wearing a chunky knitted sweater and tiny round gold reading glasses, curling up cozily and reading a thick open hardcover book. Floating warm yellow sparkle accents'
      },
      {
        name: '파스텔 e-리더기 & 아기 곰',
        desc: '라벤더 e-리더기를 꼭 쥐고 침대에 엎드려 독서하는 아기 곰 스티커',
        phrase: 'In My Reading Era',
        detail: 'standalone cute chubby baby brown bear lying happily on its tummy, holding a pastel lavender e-reader tablet with tiny heart stickers on the back'
      },
      {
        name: '감성 책탑과 핫초코 머그잔',
        desc: '파스텔톤 양장본 책 5권과 마시멜로 핫초코 머그잔 스티커',
        phrase: 'Cozy Reader',
        detail: 'standalone aesthetic stack of five pastel colored hardcover novels with floral embossed spines, topped with a cozy steaming hot chocolate mug with mini marshmallows'
      },
      {
        name: '리본 북마크 토끼',
        desc: '거대한 새틴 리본 책갈피를 안고 있는 아기 토끼 스티커',
        phrase: 'Lost in Pages',
        detail: 'standalone adorable baby bunny with floppy ears, wearing a soft pastel knit cardigan, hugging a giant satin ribbon bookmark with tiny dried flower charms'
      },
      {
        name: '밤샘 독서 레서판다',
        desc: '스탠드 조명 아래서 밤샘 독서하는 후드티 레서판다 스티커',
        phrase: 'Late Night Book Club',
        detail: 'standalone cute baby red panda wearing an oversized hoodie, sitting cozy under a warm vintage reading desk lamp, eagerly turning pages of an open book with glowing curiosity'
      },
      {
        name: '커피 & 오픈 북 플랫레이',
        desc: '라떼아트 커피잔과 압화 꽃잎이 어우러진 오픈 북 스티커',
        phrase: 'Coffee & Chapters',
        detail: 'standalone flat lay aesthetic illustration of an open vintage novel with deckled paper edges, beside a ceramic coffee cup with heart latte art, dried pressed wildflowers, and a fountain pen'
      },
      {
        name: '별점 5점 뱃지 리딩 트래커',
        desc: '빛나는 황금 별 5개와 월계수 리딩 저널 뱃지 스티커',
        phrase: '5-Star Read',
        detail: 'standalone glowing golden 5-star rating book review badge with five sparkling yellow stars, a feather quill, and delicate laurel leaf wreath'
      },
      {
        name: '체크 담요 덮은 아기 강아지',
        desc: '타탄체크 담요를 덮고 책 베개를 벤 아기 골든리트리버 스티커',
        phrase: 'Bookworm Puppy',
        detail: 'standalone fluffy golden retriever puppy curled up cozily under a soft tartan plaid fleece blanket, resting its head on a stack of books like a pillow'
      },
      {
        name: '독서 중 방해금지 팻말',
        desc: '데이지 꽃과 담쟁이 넝쿨이 감긴 독서 팻말 스티커',
        phrase: "Do Not Disturb, I'm Reading",
        detail: 'standalone charming rustic pastel wooden signpost surrounded by daisies and ivy vines with cute decorative ribbon'
      },
      {
        name: '창가 빗소리 햄스터',
        desc: '비 내리는 창가에서 미니 책을 읽는 아기 햄스터 스티커',
        phrase: 'Rainy Day Read',
        detail: 'standalone tiny chubby baby hamster sitting on a rainy cottage windowsill with soft raindrops on glass, wrapped in a mini scarf, nibbling a sunflower seed cookie while reading a tiny miniature book'
      },
      {
        name: 'TBR 읽을 책 유리병',
        desc: '읽고 싶은 책 목록 쪽지가 가득 찬 감성 메이슨 자 스티커',
        phrase: 'My TBR Jar',
        detail: 'standalone cute vintage glass mason jar tied with a rustic twine bow, filled with colorful pastel folded paper scrolls labeled with book titles'
      },
      {
        name: '슬로우 리딩 나무늘보',
        desc: '나뭇가지에 거꾸로 매달려 여유롭게 책 읽는 나무늘보 스티커',
        phrase: 'Reading at My Own Pace',
        detail: 'standalone sweet baby sloth wearing round spectacles, hanging lazily upside down from a leafy tree branch, holding an open paperback and reading in peace'
      },
      {
        name: '판타지 소설 요정 펭귄',
        desc: '마법 고서적과 별빛을 뿜는 아기 황제펭귄 스티커',
        phrase: 'Living in a Fantasy',
        detail: 'standalone cute baby emperor penguin chick wearing a tiny starry wizard hat, holding a glowing magical fantasy spellbook with floating sparkles and stars'
      },
      {
        name: '빈티지 파스텔 북 카트',
        desc: '책과 몬스테라 화분이 실린 3단 이동식 책 수레 스티커',
        phrase: 'TBR Cart',
        detail: 'standalone vintage pastel pink 3-tier rolling utility book cart neatly packed with colorful romance and fantasy books, cascading trailing pothos plant, and a scented candle'
      },
      {
        name: '책 냄새 맡는 아기 사슴',
        desc: '새 책을 펼쳐 들고 향기를 음미하는 아기 꽃사슴 스티커',
        phrase: 'The Smell of Books',
        detail: 'standalone gentle baby fawn with white spots, wearing a soft floral collar, holding an open vintage book close and closing eyes peacefully to smell the paper pages'
      },
      {
        name: '독서 친구 고양이와 티팟',
        desc: '플로럴 티팟과 찻잔 옆에 웅크리고 잠든 아기 치즈 고양이 스티커',
        phrase: 'Tea & Paperbacks',
        detail: 'standalone sleeping ginger tabby kitten curled up happily next to a vintage English floral porcelain teapot and matching teacup on a saucer with chamomile blossoms'
      },
      {
        name: '북클럽 걸 하트 폰그립',
        desc: '파스텔 e-리더기와 하트 그립을 쥔 손 스티커',
        phrase: 'Bookish Girlie',
        detail: 'standalone aesthetic hand with pastel manicure holding a sage green e-reader tablet with a heart-shaped phone grip and cute bookish deco stickers'
      },
      {
        name: '책에 파묻힌 아기 고슴도치',
        desc: '동화책 속에서 고개를 쏙 내민 털모자 아기 고슴도치 스티커',
        phrase: 'Cozy Little Reader',
        detail: 'standalone tiny baby hedgehog wearing a cozy knitted beanie, peeking out playfully from inside an open oversized fairy tale book surrounded by autumn leaves and acorns'
      },
      {
        name: '로맨스 소설 하트 오픈 북',
        desc: '책장이 하트 모양으로 접힌 감성 오픈 북 스티커',
        phrase: 'Hopeless Book Romantic',
        detail: 'standalone romantic open paperback book with the inner pages folded neatly into a 3D heart shape, surrounded by floating pink rose petals and tiny sparkles'
      },
      {
        name: '북클럽 공식 멤버십 뱃지',
        desc: '로즈골드 왁스 실링 메달 북클럽 뱃지 스티커',
        phrase: 'Official Book Club Member',
        detail: 'standalone vintage round wax seal medal badge in pastel rose gold, featuring an embossed open book and laurel leaves with ribbon tails'
      }
    ][i];

    return {
      id: `booktok-20-pack-${num}`,
      name: `📚 [북톡 독서 ${num}/20] ${items.name}`,
      animal: 'BookTok Reading 20 Pack',
      animalValue: '',
      affinityObject: items.name,
      theme: 'BookTok Reading 20 Pack',
      phrase: items.phrase,
      description: items.desc,
      prompt: `A cute die-cut sticker design featuring: ${items.detail}. Curved text reads "${items.phrase}" in an elegant cute hand-drawn script font. ${STICKER_RULES_PROMPT_SUFFIX}`
    };
  }) as unknown as StickerPreset[]
];

export const DESSERT_20_SERIES: StickerPreset[] = [
  {
    id: 'dessert-20-pack-cover',
    name: '🖼️ [마스터 썸네일] 디저트 & 베이커리 20종 스티커 팩 대표 커버 표지',
    animal: 'Sweet Dessert Bakery Cover',
    animalValue: '',
    affinityObject: 'Sweet Dessert Bakery Cover',
    theme: 'Dessert Bakery 20 Pack Cover',
    phrase: '',
    description: 'Etsy 판매용 20종 달콤한 디저트 & 베이커리 카페 스티커 팩 마스터 대표 썸네일 커버 표지 그래픽',
    prompt: `A professional Etsy digital sticker bundle master cover graphic illustration on a pure solid white background (#FFFFFF).
CENTERED TITLE (MUST REMAIN CLEAR & UNOBSTRUCTED): Centered cute bold pink script typography reading "20+ CUTE SWEET DESSERT & CAFE STICKER BUNDLE". Below title reads "PNG DIGITAL DOWNLOAD" in a stylish teal ribbon banner. CRITICAL: The central title and banner MUST remain completely unobstructed, open, and clearly legible with an ample margin around it—NO stickers encroaching, touching, or overlapping the text.
STICKER ARRANGEMENT (DENSE YET NEATLY SEPARATED): A richly packed collage of 18-20 unique standalone die-cut sticker samples filling the perimeter of the canvas around the center title with minimal empty white gaps. CRITICAL NO OVERLAPPING: Individual stickers MUST NOT overlap, collide, or clip one another. Each sticker is completely isolated and neatly placed side-by-side with its own distinct thick crisp white die-cut border. STRICT NO DUPLICATES: Every single sticker is 100% unique in animal character, dessert item, and pose with zero repetition.
FEATURED UNIQUE STICKERS: soufflé pancake baby bear, sleeping croissant kitten, iced matcha boba red panda, strawberry shortcake bunny, crookie croissant hamster, mochi donut sea otter, cinnamon roll puppy, vintage cherry pie black bear, pastel macaron stack chipmunk, Belgian waffle pygmy hippo, cherry cupcake piglet, iced matcha latte fawn, peach parfait duckling, chocolate fondue hedgehog, mint gelato penguin, powdered mochi sloth, vanilla cream puff baby otter, blueberry tart red fox, bouncy custard pudding panda, and baker chef cat.
STRICT NO GLASS TANKS: Pure standalone adorable bakery dessert animals, pastries, cakes, and sweet treats ONLY. CRITICAL: The image MUST have a pure solid white background (#FFFFFF). NEVER generate any background colors, gradients, or scenery. Etsy bestseller listing thumbnail aesthetic. High resolution.`
  },
  ...Array.from({ length: 20 }, (_, i) => {
    const num = i + 1;
    const items = [
      {
        name: '수플레 팬케이크 & 아기 곰',
        desc: '도톰한 3단 팬케이크 위에 앉아 딸기를 든 아기 곰 스티커',
        phrase: 'Sweetest Treat',
        detail: 'standalone adorable chubby baby brown bear sitting happily on top of a giant fluffy soufflé pancake stack with melting butter, dripping golden maple syrup, and fresh strawberries'
      },
      {
        name: '크루아상 침대 속 아기 고양이',
        desc: '갓 구운 황금빛 크루아상 속에서 낮잠 자는 아기 고양이 스티커',
        phrase: 'Freshly Baked',
        detail: 'standalone adorable fluffy baby kitten curled up sleeping cozily inside a giant warm golden flaky French croissant, dusted with powdered sugar and mini pastel heart sprinkles'
      },
      {
        name: '대나무 말차 버블티 레서판다',
        desc: '말차 버블티를 빨대로 마시는 후드티 레서판다 스티커',
        phrase: 'Boba & Chill',
        detail: 'standalone cute baby red panda wearing a cozy oversized knit hoodie, sipping a layered iced matcha bamboo boba bubble tea with tapioca pearls through a straw'
      },
      {
        name: '딸기 쇼트케이크 토끼',
        desc: '생크림 딸기 쇼트케이크를 안고 있는 아기 토끼 스티커',
        phrase: 'Berry Sweet',
        detail: 'standalone sweet baby bunny with floppy ears holding a slice of fluffy Japanese strawberry shortcake topped with fresh whipped cream and ripe red strawberries'
      },
      {
        name: '크루키(Crookie) 든 아기 햄스터',
        desc: '초코칩 쿠키가 박힌 크루키를 든 볼빵빵 햄스터 스티커',
        phrase: 'Cookie Crunch',
        detail: 'standalone chubby baby hamster with stuffed cheeks holding a warm chocolate chip cookie croissant (Crookie) with gooey melted chocolate chips'
      },
      {
        name: '모찌 도넛 해달',
        desc: '파스텔 딸기 모찌 도넛을 안고 둥둥 뜬 아기 해달 스티커',
        phrase: 'Donut Worry',
        detail: 'standalone cute baby sea otter pup floating on its back, hugging a pastel pink frosted ring mochi pon-de-ring donut with rainbow sprinkles'
      },
      {
        name: '시나몬 롤 아기 강아지',
        desc: '달콤한 바닐라 글레이즈 시나몬 롤을 안은 골든리트리버 스티커',
        phrase: 'Sweet Cinnamon Roll',
        detail: 'standalone fluffy golden retriever puppy curled up happily beside a warm freshly baked cinnamon roll swirling with vanilla cream cheese glaze'
      },
      {
        name: '빈티지 체리 파이 흑곰',
        desc: '격자무늬 체리 파이 한 조각을 든 아기 흑곰 스티커',
        phrase: 'Slice of Joy',
        detail: 'standalone cute chubby baby black bear wearing a gingham apron, holding a fork and a generous slice of lattice crust ruby red cherry pie with a scoop of vanilla ice cream'
      },
      {
        name: '마카롱 탑 아기 다람쥐',
        desc: '파스텔 마카롱 4단 탑을 안고 있는 아기 다람쥐 스티커',
        phrase: 'Macaron Magic',
        detail: 'standalone adorable baby chipmunk with a bushy tail balancing a colorful stack of pastel macarons (pistachio, strawberry, lavender, lemon)'
      },
      {
        name: '와플 아이스크림 피그미하마',
        desc: '벨기에 와플과 딸기 아이스크림을 든 피그미하마 스티커',
        phrase: 'Waffle Pal',
        detail: 'standalone chubby baby pygmy hippo holding a golden Belgian waffle topped with a scoop of strawberry gelato and chocolate drizzle'
      },
      {
        name: '체리 컵케이크 아기 돼지',
        desc: '핑크 생크림 컵케이크를 꼭 쥔 아기 돼지 스티커',
        phrase: 'Sweet Tooth',
        detail: 'standalone cute baby piglet wearing a chef hat, happily holding a pastel pink buttercream swirl cupcake with a shiny red cherry on top'
      },
      {
        name: '아이스 말차 라떼 아기 사슴',
        desc: '말차 라떼 컵을 두 손으로 쥔 아기 꽃사슴 스티커',
        phrase: 'Matcha Love',
        detail: 'standalone gentle baby fawn with white spots wearing a floral neck bandana, sipping a tall iced matcha latte with cloud cold foam'
      },
      {
        name: '복숭아 파르페 아기 오리',
        desc: '복숭아 과육 파르페 옆 아기 오리 스티커',
        phrase: 'Peachy Keen',
        detail: 'standalone cute fluffy yellow duckling wearing a tiny flower crown standing next to an elaborate tall glass of peach soft-serve parfait'
      },
      {
        name: '초코 퐁듀 아기 고슴도치',
        desc: '딸기를 초코 퐁듀에 찍은 아기 고슴도치 스티커',
        phrase: 'Choco Dipped',
        detail: 'standalone tiny baby hedgehog wearing a baker apron holding a fondue fork with a strawberry dipped in rich dark melted chocolate'
      },
      {
        name: '민트 초코 젤라또 펭귄',
        desc: '와플 콘 민트초코 젤라또를 든 아기 펭귄 스티커',
        phrase: 'Minty Cool',
        detail: 'standalone adorable baby penguin chick wearing a winter scarf, holding a waffle cone piled high with mint chocolate chip gelato'
      },
      {
        name: '생딸기 찹쌀떡 나무늘보',
        desc: '말랑한 딸기 찹쌀떡을 꼭 껴안은 아기 나무늘보 스티커',
        phrase: 'Sweet & Slow',
        detail: 'standalone sweet baby sloth holding a squishy powdered strawberry mochi daifuku with sweet red bean and a fresh whole strawberry inside'
      },
      {
        name: '바닐라 슈크림 아기 수달',
        desc: '슈크림이 듬뿍 든 크림퍼프를 든 아기 수달 스티커',
        phrase: 'Cream Puff',
        detail: 'standalone playful baby otter pup holding a giant French choux cream puff overflowing with rich speckled vanilla bean pastry cream'
      },
      {
        name: '블루베리 타르트 아기 여우',
        desc: '반짝이는 블루베리 타르트를 안은 아기 붉은 여우 스티커',
        phrase: 'Berry Tart',
        detail: 'standalone cute baby red fox curled around a buttery crisp pastry tart loaded with shiny fresh blueberries and mint leaves'
      },
      {
        name: '캐러멜 푸딩 아기 판다',
        desc: '탱글탱글한 커스터드 푸딩 옆 아기 판다 스티커',
        phrase: 'Pudding Dreams',
        detail: 'standalone chubby baby giant panda tapping a bouncy Japanese custard purin pudding crowned with amber caramel syrup and a cherry'
      },
      {
        name: '베이커리 쉐프 고양이',
        desc: '밀대를 든 꼬마 파티시에 아기 고양이 스티커',
        phrase: 'Master Baker',
        detail: 'standalone proud baby calico kitten wearing a tall white chef toque hat, holding a wooden rolling pin with cute flour dusted on its nose'
      }
    ][i];

    return {
      id: `dessert-20-pack-${num}`,
      name: `🥞 [디저트 ${num}/20] ${items.name}`,
      animal: 'Dessert Bakery 20 Pack',
      animalValue: '',
      affinityObject: items.name,
      theme: 'Dessert Bakery 20 Pack',
      phrase: items.phrase,
      description: items.desc,
      prompt: `A cute die-cut sticker design featuring: ${items.detail}. Curved text reads "${items.phrase}" in an elegant cute hand-drawn script font. ${STICKER_RULES_PROMPT_SUFFIX}`
    };
  }) as unknown as StickerPreset[]
];

export const SOCIAL_BATTERY_20_SERIES: StickerPreset[] = [
  {
    id: 'social-battery-20-pack-cover',
    name: '🖼️ [마스터 썸네일] 사회적 배터리 & 내향인 20종 스티커 팩 대표 커버 표지',
    animal: 'Social Battery Introvert Cover',
    animalValue: '',
    affinityObject: 'Social Battery Introvert Cover',
    theme: 'Social Battery 20 Pack Cover',
    phrase: '',
    description: 'Etsy 판매용 20종 사회적 배터리 & 내향인 힐링 스티커 팩 마스터 대표 썸네일 커버 표지 그래픽',
    prompt: `A professional Etsy digital sticker bundle master cover graphic illustration on a pure solid white background (#FFFFFF).
CENTERED TITLE (MUST REMAIN CLEAR & UNOBSTRUCTED): Centered cute bold violet script typography reading "20+ CUTE INTROVERT & SOCIAL BATTERY STICKER BUNDLE". Below title reads "PNG DIGITAL DOWNLOAD" in a stylish lilac ribbon banner. CRITICAL: The central title and banner MUST remain completely unobstructed, open, and clearly legible with an ample margin around it—NO stickers encroaching, touching, or overlapping the text.
STICKER ARRANGEMENT (DENSE YET NEATLY SEPARATED): A richly packed collage of 18-20 unique standalone die-cut sticker samples filling the perimeter of the canvas around the center title with minimal empty white gaps. CRITICAL NO OVERLAPPING: Individual stickers MUST NOT overlap, collide, or clip one another. Each sticker is completely isolated and neatly placed side-by-side with its own distinct thick crisp white die-cut border. STRICT NO DUPLICATES: Every single sticker is 100% unique in animal character, humorous meme badge, and pose with zero repetition.
FEATURED UNIQUE STICKERS: burrito blanket sloth holding 1% red battery, overstimulated hoodie hamster with iced coffee, need to recharge blanket cat, oversized noise-canceling headphones bear, cancelled plans puppy, introvert power battery gauge, please do not perceive me frog, homebody pajama duckling, offline mode retro sign, silent phone screen otter, antisocial butterfly piglet, bed sanctuary sleeping panda, do not disturb door hanger bunny, social meter red warning badge, cozy corner tea fox, ghosting text bubble hedgehog, introvert comfort food fawn, low battery charging cable penguin, solitary walk hippo, and peace & quiet seal.
STRICT NO GLASS TANKS: Absolutely NO fish tanks, NO terrarium jars. Pure standalone humorous introvert animals, relatable mood badges, low battery meters, and cozy meme stickers ONLY. CRITICAL: The image MUST have a pure solid white background (#FFFFFF). NEVER generate any background colors, gradients, or scenery. Etsy bestseller listing thumbnail aesthetic. High resolution.`
  },
  ...Array.from({ length: 20 }, (_, i) => {
    const num = i + 1;
    const items = [
      {
        name: '담요 김밥 1% 배터리 나무늘보',
        desc: '포근한 담요에 싸여 1% 배터리를 쥔 나무늘보 스티커',
        phrase: 'Social Battery 1%',
        detail: 'standalone exhausted baby sloth wrapped cozy inside a soft knit blanket like a burrito, lying on its belly and holding a glowing smartphone battery icon showing 1% red battery'
      },
      {
        name: '후드티 아이스커피 햄스터',
        desc: '보라색 후드티를 푹 눌러쓰고 아이스커피를 쥔 햄스터 스티커',
        phrase: 'Overstimulated',
        detail: 'standalone chubby baby hamster sitting down with an oversized pastel purple hoodie pulled down over its round eyes, hugging a tall iced coffee cup with two paws'
      },
      {
        name: '이불 밖은 위험해 아기 고양이',
        desc: '침대 이불 속에서 코만 내민 채 충전 중인 고양이 스티커',
        phrase: 'Need to Recharge',
        detail: 'standalone sleepy baby kitten tucked under a fluffy cloud duvet with only its little face and pink paws showing, next to a glowing battery recharge plug'
      },
      {
        name: '노룩 헤드폰 아기 곰',
        desc: '노이즈 캔슬링 헤드폰을 끼고 눈 감은 아기 곰 스티커',
        phrase: 'Do Not Perceive Me',
        detail: 'standalone chubby baby brown bear wearing giant oversized pastel headphones, eyes blissfully closed, floating with tiny musical notes'
      },
      {
        name: '아이스커피와 불안 아기 토끼',
        desc: '커다란 아이스 라떼를 안고 눈치보는 아기 토끼 스티커',
        phrase: 'Living on Iced Coffee & Anxiety',
        detail: 'standalone sweet baby bunny with wide nervous eyes clutching an oversized mason jar of iced caramel macchiato'
      },
      {
        name: '조용한 퇴장 레서판다',
        desc: '말없이 파티를 빠져나가는 닌자 망토 레서판다 스티커',
        phrase: 'Irish Exit Specialist',
        detail: 'standalone cute baby red panda wearing a little stealth cape, sneaking away on tiptoes with a sly peace sign gesture and vanishing sparkle smoke'
      },
      {
        name: '약속 취소 만세 강아지',
        desc: '약속 취소 문자를 받고 침대에서 환호하는 아기 강아지 스티커',
        phrase: 'Plans Got Cancelled!',
        detail: 'standalone joyful golden retriever puppy rolling on its back in bed with paws in the air celebrating seeing a "let us reschedule" text message'
      },
      {
        name: '완전 방전 0% 아기 해달',
        desc: '바닥에 대자로 뻗어버린 0% 배터리 아기 해달 스티커',
        phrase: 'Battery Depleted 0%',
        detail: 'standalone baby sea otter pup flat on its belly melted like a puddle, holding an empty flashing 0% battery icon'
      },
      {
        name: '말걸지 마세요 고슴도치',
        desc: '조용히 해주세요 팻말 뒤에 숨은 아기 고슴도치 스티커',
        phrase: 'Quiet Mode Activated',
        detail: 'standalone tiny shy baby hedgehog peeking from behind a wooden sign that has a shushing finger icon and "Quiet Mode"'
      },
      {
        name: '내 고양이가 내 테라피스트',
        desc: '고양이를 껴안고 눈물 훔치는 아기 동물 듀오 스티커',
        phrase: 'My Cat is My Therapist',
        detail: 'standalone cute emotional fluffy kitten being gently cuddled with heart sparkles and a tiny doctor stethoscope'
      },
      {
        name: '외출 5분 후 귀가 희망 사슴',
        desc: '밖으로 나오자마자 집 가고 싶어하는 아기 사슴 스티커',
        phrase: 'I Want to Go Home',
        detail: 'standalone timid baby fawn standing awkwardly outside, checking a tiny pocket watch with a homesick expression'
      },
      {
        name: '사회화 한도 초과 펭귄',
        desc: '사회적 할당량을 다 채우고 얼음집으로 뛰어가는 펭귄 스티커',
        phrase: 'Social Quota Met',
        detail: 'standalone cute baby penguin chick waving a tiny white flag, sliding on its belly towards a warm glowing cozy igloo'
      },
      {
        name: '투명인간 모드 피그미하마',
        desc: '박스를 뒤집어쓰고 눈구멍만 뚫어놓은 피그미하마 스티커',
        phrase: 'Incognito Mode',
        detail: 'standalone chubby baby pygmy hippo wearing a cardboard box like a disguise with two cute eye cutouts'
      },
      {
        name: '고속 충전 중 다람쥐',
        desc: '충전 케이블을 꼬리에 감고 도토리 먹는 다람쥐 스티커',
        phrase: 'Fast Charging',
        detail: 'standalone cute baby squirrel curled in a charging dock station with a glowing 100% green thunderbolt icon'
      },
      {
        name: '사람 너무 많아 아기 오리',
        desc: '혼잡한 인파 속에서 어지러운 아기 오리 스티커',
        phrase: 'Too Many Humans',
        detail: 'standalone tiny baby yellow duckling with dizzy spiral eyes holding a small chamomile tea cup'
      },
      {
        name: '비행기 모드 가동 나무늘보',
        desc: '비행기 모드 아이콘을 머리에 띄운 나무늘보 스티커',
        phrase: 'Airplane Mode On',
        detail: 'standalone peaceful baby sloth sleeping soundly on a pillow with a floating airplane silhouette symbol'
      },
      {
        name: '새벽 감성 혼자만의 시간 흑곰',
        desc: '달빛 아래서 혼자 따뜻한 차를 마시는 아기 흑곰 스티커',
        phrase: 'My Midnight Peace',
        detail: 'standalone cozy baby black bear sitting in a moonlit armchair wrapped in a quilt with a steaming mug and reading book'
      },
      {
        name: '나만의 안전지대 텐트 여우',
        desc: '실내 인디언 텐트 속에서 쿠션을 껴안은 아기 여우 스티커',
        phrase: 'My Safe Space',
        detail: 'standalone sweet baby fox peeking out from a fairy-lit cozy indoor pillow blanket fort'
      },
      {
        name: '집순이 클럽 회장 판다',
        desc: '수면바지 입고 팝콘 먹으며 TV 보는 아기 판다 스티커',
        phrase: 'Homebody Club President',
        detail: 'standalone chubby baby panda wearing polka-dot pajama pants, hugging a bowl of popcorn and a remote control'
      },
      {
        name: '방전 주의 경고등 햄스터',
        desc: '머리 위에 빨간 사이렌 경고등이 켜진 아기 햄스터 스티커',
        phrase: 'Low Energy Warning',
        detail: 'standalone cute tired baby hamster with a soft glowing yellow hazard warning triangle and battery meter'
      }
    ][i];

    return {
      id: `social-battery-20-pack-${num}`,
      name: `🔋 [배터리 ${num}/20] ${items.name}`,
      animal: 'Social Battery 20 Pack',
      animalValue: '',
      affinityObject: items.name,
      theme: 'Social Battery 20 Pack',
      phrase: items.phrase,
      description: items.desc,
      prompt: `A cute die-cut sticker design featuring: ${items.detail}. Curved text reads "${items.phrase}" in an elegant cute hand-drawn script font. ${STICKER_RULES_PROMPT_SUFFIX}`
    };
  }) as unknown as StickerPreset[]
];

export const HANGUL_20_SERIES: StickerPreset[] = [
  {
    id: 'hangul-20-pack-cover',
    name: '🖼️ [마스터 썸네일] K-감성 한글 & 동물 20종 스티커 팩 대표 커버 표지',
    animal: 'Korean Hangul Aesthetic Cover',
    animalValue: '',
    affinityObject: 'Korean Hangul Aesthetic Cover',
    theme: 'Korean Hangul 20 Pack Cover',
    phrase: '',
    description: 'Etsy 판매용 20종 K-감성 한글 & 아기 동물 스티커 팩 마스터 대표 썸네일 커버 표지 그래픽',
    prompt: `A professional Etsy digital sticker bundle master cover graphic illustration on a pure solid white background (#FFFFFF).
CENTERED TITLE (MUST REMAIN CLEAR & UNOBSTRUCTED): Centered cute bold colorful script typography reading "20+ CUTE KOREAN HANGUL & BABY ANIMAL STICKER BUNDLE". Below title reads "PNG DIGITAL DOWNLOAD" in a stylish pastel ribbon banner. CRITICAL: The central title and banner MUST remain completely unobstructed, open, and clearly legible with an ample margin around it—NO stickers encroaching, touching, or overlapping the text.
STICKER ARRANGEMENT (DENSE YET NEATLY SEPARATED): A richly packed collage of 18-20 unique standalone die-cut sticker samples filling the perimeter of the canvas around the center title with minimal empty white gaps. CRITICAL NO OVERLAPPING: Individual stickers MUST NOT overlap, collide, or clip one another. Each sticker is completely isolated and neatly placed side-by-side with its own distinct thick crisp white die-cut border. STRICT NO DUPLICATES: Every single sticker is 100% unique in animal character, Hangul typography phrase, and pose with zero repetition.
FEATURED UNIQUE STICKERS: Gwenchana (괜찮아) healing bunny with heart, Daebak (대박) confetti red panda, Sparkle Bling (반짝반짝) star kitten, Bungeoppang (붕어빵 냠냠) snack bear, Fighting (파이팅) cheerleader hamster, Saranghae (사랑해) plush heart otter, Kkul-kkul (쿨쿨) sleeping cloud sloth, Kongdak (콩닥콩닥) blushing fawn, Bbojjak (뽀짝) golden puppy with pink pawprints, Aigoo (아이고) sighing pygmy hippo, Haengbok (행복해) clover piglet, Bungeoppang Hat (붕어빵 모자) penguin chick, Sim-kung (심쿵) heart-clutching chipmunk, Meong (멍~) spaced-out duckling, Healing (힐링) hot-spring hedgehog, Chaltteok (찰떡궁합) tteokbokki and tempura duo, Todak-todak (토닥토닥) comforting black bear, Kkuljam (꿀잠) sleep mask fox, Eussya-eussya (으쌰으쌰) workout red panda, and Choego-ya (최고야) thumbs-up puppy.
STRICT NO GLASS TANKS: Pure standalone adorable Korean Hangul aesthetic stickers with cute baby animals ONLY. CRITICAL: The image MUST have a pure solid white background (#FFFFFF). NEVER generate any background colors, gradients, or scenery. Etsy bestseller listing thumbnail aesthetic. High resolution.`
  },
  ...Array.from({ length: 20 }, (_, i) => {
    const num = i + 1;
    const items = [
      {
        name: '괜찮아 아기 토끼',
        desc: '귀에 반창고를 붙이고 하트를 안은 힐링 아기 토끼 스티커',
        phrase: '괜찮아',
        sub: "It's Okay",
        detail: 'adorable baby bunny with a cute band-aid on its floppy ear, smiling gently and hugging a glowing pink heart'
      },
      {
        name: '대박 환호 레서판다',
        desc: '별가루를 뿌리며 환호하는 아기 레서판다 스티커',
        phrase: '대박',
        sub: 'Daebak!',
        detail: 'excited cute baby red panda with sparkling big happy eyes, raising its paws and throwing colorful star confetti into the air'
      },
      {
        name: '반짝반짝 별가루 고양이',
        desc: '황금 별가루를 뿜어내는 아기 삼색 고양이 스티커',
        phrase: '반짝반짝',
        sub: 'Sparkle Bling',
        detail: 'cute fluffy kitten reaching up playfully towards floating glowing yellow and pink twinkling stars'
      },
      {
        name: '냠냠 붕어빵 아기 곰',
        desc: '따끈따끈한 붕어빵을 베어 무는 아기 곰 스티커',
        phrase: '냠냠',
        sub: 'Yummy!',
        detail: 'chubby baby brown bear holding a golden brown fish-shaped Korean bungeoppang pastry with sweet red bean steam'
      },
      {
        name: '파이팅 응원 햄스터',
        desc: '주먹을 불끈 쥐고 머리띠를 두른 응원 햄스터 스티커',
        phrase: '파이팅',
        sub: 'You Got This!',
        detail: 'determined baby hamster wearing a cute white cheer headband, pumping a tiny clenched fist in the air with encouragement sparkles'
      },
      {
        name: '사랑해 하트 아기 해달',
        desc: '커다란 핑크 하트를 껴안고 둥둥 뜬 해달 스티커',
        phrase: '사랑해',
        sub: 'I Love You',
        detail: 'fluffy baby sea otter floating on its back, hugging an oversized puffy pink plush heart with sweet blushing cheeks'
      },
      {
        name: '쿨쿨 낮잠 나무늘보',
        desc: '폭신한 구름 베개 위에서 평화롭게 자는 나무늘보 스티커',
        phrase: '쿨쿨',
        sub: 'Sleepy Zzz',
        detail: 'sweet baby sloth sleeping deeply on a fluffy cloud pillow with peaceful resting expression and floating tiny golden sleep sparkles'
      },
      {
        name: '콩닥콩닥 수줍은 사슴',
        desc: '두 뺨이 발그레해져 가슴을 쥔 아기 꽃사슴 스티커',
        phrase: '콩닥콩닥',
        sub: 'Heart Flutter',
        detail: 'gentle baby fawn with blushing pink cheeks, placing two front hooves over its chest with fluttering mini red hearts'
      },
      {
        name: '뽀짝 아기 강아지 발자국',
        desc: '아장아장 걸어오는 아기 골든리트리버와 분홍 젤리 발자국',
        phrase: '뽀짝',
        sub: 'Tiny Steps',
        detail: 'tiny golden retriever puppy waddling forward cheerfully, leaving a trail of cute pink paw print stamps behind'
      },
      {
        name: '아이고 머리짚는 피그미하마',
        desc: '손으로 이마를 짚으며 억울해하는 피그미하마 스티커',
        phrase: '아이고',
        sub: 'Aigoo! (Oh Dear!)',
        detail: 'chubby baby pygmy hippo with a comical overdramatic sigh, resting its tiny palm on its forehead'
      },
      {
        name: '행복해 미소 아기 돼지',
        desc: '클로버 꽃밭에서 눈웃음 짓는 아기 돼지 스티커',
        phrase: '행복해',
        sub: 'So Happy',
        detail: 'smiling cute baby piglet wearing a flower necklace, beaming with pure radiant joy in a sunny clover patch'
      },
      {
        name: '붕어빵 모자 쓴 펭귄',
        desc: '붕어빵 모양 털모자를 쓴 아기 펭귄 스티커',
        phrase: '붕어빵',
        sub: 'Bungeoppang Pal',
        detail: 'baby emperor penguin chick wearing a funny warm knitted bungeoppang fish hat on its head'
      },
      {
        name: '심쿵 심장잡은 다람쥐',
        desc: '너무 귀여워서 심장을 부여잡은 아기 다람쥐 스티커',
        phrase: '심쿵',
        sub: 'Heart Attack!',
        detail: 'cute baby chipmunk clutching its heart with round shocked anime eyes and sparkling exclamation marks'
      },
      {
        name: '멍~ 멍때리는 아기 오리',
        desc: '눈을 끔벅이며 멍때리는 귀여운 오리 스티커',
        phrase: '멍~',
        sub: 'Spaced Out',
        detail: 'fluffy baby yellow duckling staring blankly into space with round curious kawaii eyes'
      },
      {
        name: '힐링 온천 목욕 고슴도치',
        desc: '머리에 수건을 얹고 나무 대야에 몸을 담근 고슴도치 스티커',
        phrase: '힐링',
        sub: 'Healing Time',
        detail: 'tiny baby hedgehog soaking in a warm wooden hot spring bath tub with a folded mini towel on its head'
      },
      {
        name: '찰떡궁합 떡볶이와 튀김 듀오',
        desc: '귀여운 떡볶이 떡과 바삭한 김말이 캐릭터 듀오 스티커',
        phrase: '찰떡궁합',
        sub: 'Perfect Match',
        detail: 'two smiling kawaii characters: a cheerful red tteokbokki rice cake and a golden crispy fried tempura holding hands'
      },
      {
        name: '토닥토닥 위로하는 흑곰',
        desc: '작은 친구를 따뜻하게 안아주는 아기 흑곰 스티커',
        phrase: '토닥토닥',
        sub: 'There There',
        detail: 'gentle baby black bear gently patting the back of a little bird with warm comforting smiles'
      },
      {
        name: '꿀잠 수면안대 아기 여우',
        desc: '당근 모양 수면 안대를 쓰고 웅크린 아기 여우 스티커',
        phrase: '꿀잠',
        sub: 'Sweet Sleep',
        detail: 'cozy baby red fox curled into a fluffy ball wearing a silk sleep mask, dreaming of starry skies'
      },
      {
        name: '으쌰으쌰 힘내는 레서판다',
        desc: '작은 덤벨을 들고 운동하는 씩씩한 레서판다 스티커',
        phrase: '으쌰으쌰',
        sub: 'Power Up!',
        detail: 'energetic baby red panda wearing athletic wristbands, lifting a tiny barbell with cheerful sweat drop'
      },
      {
        name: '최고야 엄지척 아기 강아지',
        desc: '엄지손가락(발가락)을 치켜세우고 윙크하는 강아지 스티커',
        phrase: '최고야',
        sub: 'You Are The Best',
        detail: 'winking fluffy puppy dog giving a big enthusiastic thumbs-up paw with sparkling golden confetti'
      }
    ][i];

    return {
      id: `hangul-20-pack-${num}`,
      name: `🇰🇷 [한글 ${num}/20] ${items.name}`,
      animal: 'Korean Hangul 20 Pack',
      animalValue: '',
      affinityObject: items.name,
      theme: 'Korean Hangul 20 Pack',
      phrase: `${items.phrase} (${items.sub})`,
      description: items.desc,
      prompt: `A cute die-cut sticker design featuring an adorable standalone Korean aesthetic character: ${items.detail}. Pure cute character illustration with a thick crisp white die-cut border. STRICT NO TEXT RULE: Absolutely NO text, NO Hangul syllables, NO letters, NO words anywhere in the image. Pure graphic illustration art only. ${HANGUL_STICKER_RULES_PROMPT_SUFFIX_NO_TEXT}`
    };
  }) as unknown as StickerPreset[]
];

export function buildStickerPrompt(
  animalName: string,
  affinityObject: string,
  phrase: string = '',
  extraStyleDetails: string = ''
): string {
  const textPart = phrase ? `Curved text at the top reads "${phrase}" in an elegant, cute, hand-drawn script font.` : '';
  
  return `A cute die-cut sticker design featuring an adorable ${animalName} associated with ${affinityObject}. ${extraStyleDetails} ${textPart} ${STICKER_RULES_PROMPT_SUFFIX}`;
}

export * from './seasonal-sticker-prompts';


