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
1. Must have a crisp, thick, smooth white die-cut sticker border outlining the ENTIRE sticker design.
2. Must have a PURE SOLID WHITE BACKGROUND (#FFFFFF). Absolutely NO background colors, scenery, or gradients outside the sticker border.
3. Any brand or catchphrase text MUST be drawn in an elegant, cute, hand-drawn script font with colors matching the design palette.
4. Vector sticker aesthetic, high contrast, vibrant cute kawaii illustration.`;

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

export const STICKER_RULES_PROMPT_SUFFIX_NO_TEXT = `CRITICAL STICKER RULES:
1. Must have a crisp, thick, smooth white die-cut sticker border outlining the ENTIRE sticker design.
2. Must have a PURE SOLID WHITE BACKGROUND (#FFFFFF). Absolutely NO background colors, scenery, or gradients outside the sticker border.
3. STRICT TEXT RULE: Absolutely NO text, NO words, NO letters, NO phrases, NO typography, NO signatures, NO labels anywhere in the image. Pure graphic illustration art only.
4. STRICT NON-REFLECTIVE GLASS RULE: Absolutely NO glass reflections, NO white glare streaks, NO diagonal shine strips across the glass container. The glass tank/jar must be completely clear and transparent without any white reflection lines so stickers can be layered seamlessly inside.
5. Vector sticker aesthetic, high contrast, vibrant cute kawaii illustration.`;

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
    prompt: `A cute die-cut sticker design featuring a wide horizontal panoramic rectangular glass vivarium tank. Inside the clear glass tank is a lush real-life vivarium ecosystem with natural curved driftwood, green moss layers, climbing vines, river stones, a tiny cute baby green chameleon resting on a branch, and a tiny leaf tree frog. NO glass glare or reflection lines. ${STICKER_RULES_PROMPT_SUFFIX_NO_TEXT}`
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
    prompt: `A cute die-cut sticker design featuring a clean, wide horizontal rectangular glass vivarium tank frame, completely empty inside with a subtle thin gravel layer at the bottom. The glass walls MUST be 100% clear with NO white diagonal glare strips or glass reflection lines, allowing seamless sticker layering. ${STICKER_RULES_PROMPT_SUFFIX_NO_TEXT}`
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
    prompt: `A cute die-cut sticker design featuring a wide horizontal panorama mound of natural curved driftwood root, smooth river pebbles, and lush green moss bed, perfectly proportioned to fit horizontally inside a vivarium tank. ${STICKER_RULES_PROMPT_SUFFIX_NO_TEXT}`
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
    prompt: `A cute die-cut sticker design featuring vibrant green climbing tropical vines and miniature fern branches, small proportion designed to fit inside a vivarium tank. ${STICKER_RULES_PROMPT_SUFFIX_NO_TEXT}`
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
    prompt: `A cute die-cut sticker design featuring a tiny cute baby green chameleon sitting lazily on a vine branch next to a small adorable green tree frog, small scale proportion designed for a vivarium ecosystem. ${STICKER_RULES_PROMPT_SUFFIX_NO_TEXT}`
  },

  // --- 2. TERRARIUM SERIES (Glass Jars, Soil, Plants & Miniature Ornaments - NO ANIMALS) ---
  {
    id: 'terrarium-jar-complete-guide',
    name: '🫙✨ [테라리움 풀세트] 완성본 썸네일',
    animal: 'Terrarium Complete Showcase',
    animalValue: '',
    affinityObject: 'Glass Jar, Soil, Moss, Succulents & Mini Fairy House',
    theme: 'Complete Terrarium Guide',
    phrase: '',
    description: '유리병 속에 흙, 이끼, 미니 다육식물, 그리고 귀여운 미니 요정 집 피규어가 장식된 100% 순수 식물 테라리움 풀세트 완성본',
    prompt: `A cute die-cut sticker design featuring a complete transparent glass mason jar terrarium filled with drainage soil layers, plush green moss, 3 mini potted succulents, and a tiny cute fairy cottage miniature house ornament inside. NO animals, NO mammals, NO living creatures. NO glass glare lines. ${STICKER_RULES_PROMPT_SUFFIX_NO_TEXT}`
  },
  {
    id: 'terrarium-jar-base',
    name: '🫙 [테라리움] 빈티지 메이슨 저 유리병',
    animal: 'Terrarium Container',
    animalValue: '',
    affinityObject: 'Vintage Mason Jar Container',
    theme: 'Cozy Terrarium Base',
    phrase: '',
    description: '식물과 이끼 스티커를 안쪽에 깔끔하게 채워 넣을 수 있는 무반사 메이슨 저 유리병 스티커',
    prompt: `A cute die-cut sticker design featuring a clean, transparent vintage glass mason jar container, completely empty inside. The glass surface MUST be completely clear without any white diagonal reflection glare lines. ${STICKER_RULES_PROMPT_SUFFIX_NO_TEXT}`
  },
  {
    id: 'terrarium-soil-layer',
    name: '🌱 [테라리움] 배수층 흙 & 조약돌 지층 베이스',
    animal: 'Soil & Gravel Layer',
    animalValue: '',
    affinityObject: 'Drainage Soil & Pebbles',
    theme: 'Terrarium Soil Layer',
    phrase: '',
    description: '유리병 바닥에 깔아주는 흙, 활성탄, 조약돌 배수층 스티커',
    prompt: `A cute die-cut sticker design featuring a neat horizontal layered mound of dark gardening soil and smooth river pebbles, proportioned to fit inside the bottom of a glass jar. ${STICKER_RULES_PROMPT_SUFFIX_NO_TEXT}`
  },
  {
    id: 'terrarium-moss-mound',
    name: '🍃 [테라리움] 몽글몽글 푸른 이끼 언덕 베이스',
    animal: 'Green Moss Mound',
    animalValue: '',
    affinityObject: 'Plush Green Cushion Moss',
    theme: 'Terrarium Moss',
    phrase: '',
    description: '흙 위에 올리는 포근하고 소복한 수분 이끼 덩어리 스티커',
    prompt: `A cute die-cut sticker design featuring a soft, plush green cushion moss mound, proportioned to sit nicely inside a glass jar terrarium. ${STICKER_RULES_PROMPT_SUFFIX_NO_TEXT}`
  },
  {
    id: 'terrarium-mini-succulents',
    name: '🌵 [테라리움] 미니 다육식물 3종 세트',
    animal: 'Mini Succulents Pack',
    animalValue: '',
    affinityObject: '3 Small Potted Succulents',
    theme: 'Succulents Pack',
    phrase: '',
    description: '뭉치지 않고 아기자기한 미니 다육식물 3개 팟 세트 스티커 (부착 용이)',
    prompt: `A cute die-cut sticker design featuring a neat, uncrowded set of 3 tiny individual potted succulents (echeveria, haworthia, and jade plant). Clean separate arrangement, NOT crowded. ${STICKER_RULES_PROMPT_SUFFIX_NO_TEXT}`
  },
  {
    id: 'terrarium-mushroom-cluster',
    name: '🍄 [테라리움] 미니 빨간 버섯 2종',
    animal: 'Mini Mushrooms',
    animalValue: '',
    affinityObject: '2 Tiny Red Mushrooms',
    theme: 'Terrarium Mushrooms',
    phrase: '',
    description: '이끼 사이에 포인트로 꽂을 수 있는 앙증맞은 2개의 미니 빨간 버섯 스티커',
    prompt: `A cute die-cut sticker design featuring a small pair of 2 cute tiny red toadstool mushrooms with white spots, standing side by side. ${STICKER_RULES_PROMPT_SUFFIX_NO_TEXT}`
  },
  {
    id: 'terrarium-fairy-cottage',
    name: '🏡 [테라리움] 미니 요정 오두막 집 피규어',
    animal: 'Mini Fairy House',
    animalValue: '',
    affinityObject: 'Miniature Ceramic Cottage Toy',
    theme: 'Terrarium House Ornament',
    phrase: '',
    description: '이끼 언덕 위에 올려 연출하는 귀여운 미니 요정 오두막 집 도자기 피규어 스티커',
    prompt: `A cute die-cut sticker design featuring a tiny cute ceramic miniature fairy cottage house ornament with a red roof, designed as a terrarium pot decoration. ${STICKER_RULES_PROMPT_SUFFIX_NO_TEXT}`
  },
  {
    id: 'terrarium-garden-sign',
    name: '🪵 [테라리움] 미니 목재 팻말 & 가드닝 도구',
    animal: 'Mini Wooden Sign & Tools',
    animalValue: '',
    affinityObject: 'Miniature Wooden Garden Sign & Tiny Trowel',
    theme: 'Terrarium Sign Ornament',
    phrase: '',
    description: '테라리움 흙에 꽂아주는 미니 나무 팻말과 아담한 모종삽 피규어 스티커',
    prompt: `A cute die-cut sticker design featuring a tiny cute rustic wooden garden sign post and a miniature trowel shovel, styled as garden planter decor. ${STICKER_RULES_PROMPT_SUFFIX_NO_TEXT}`
  }
];


export function buildStickerPrompt(
  animalName: string,
  affinityObject: string,
  phrase: string = '',
  extraStyleDetails: string = ''
): string {
  const textPart = phrase ? `Curved text at the top reads "${phrase}" in an elegant, cute, hand-drawn script font.` : '';
  
  return `A cute die-cut sticker design featuring a lovable baby ${animalName} sitting happily. Accompanying harmonious biological affinity item: ${affinityObject}. ${extraStyleDetails} ${textPart} ${STICKER_RULES_PROMPT_SUFFIX}`;
}
