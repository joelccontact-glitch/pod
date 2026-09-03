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
  {
    id: 'terrarium-panorama-complete-guide',
    name: '🖼️✨ [파노라마 가이드] 가로 수조 비바리움 풀세트',
    animal: 'Panoramic Vivarium Showcase',
    animalValue: '',
    affinityObject: 'Horizontal Glass Tank, Driftwood, Moss, Vines & Baby Chameleon',
    theme: 'Wide Panoramic Vivarium Guide',
    phrase: '',
    description: '가로형 와이드 수조 속에 유목, 이끼, 넝쿨, 미니 카멜레온이 배치된 가로 파노라마 완성본 스티커 가이드',
    prompt: `A cute die-cut sticker design featuring a wide horizontal panoramic rectangular glass vivarium tank. Inside the clear glass tank is a lush micro ecosystem with natural curved driftwood, green moss layers, aquatic climbing vines, smooth river stones, and a tiny cute baby green chameleon resting peacefully on a wooden branch. ${STICKER_RULES_PROMPT_SUFFIX_NO_TEXT}`
  },
  {
    id: 'terrarium-wide-tank-frame',
    name: '🖼️ [파노라마 핏] 가로 와이드 유리 수조 틀',
    animal: 'Panoramic Tank Frame',
    animalValue: '',
    affinityObject: 'Wide Horizontal Glass Vivarium Tank Outline',
    theme: 'Wide Tank Frame',
    phrase: '',
    description: '스티커를 안쪽에 채워 넣을 수 있는 가로 파노라마 직사각형 유리 수조 외곽 틀 스티커 (빛반사선 없음)',
    prompt: `A cute die-cut sticker design featuring a clean, wide horizontal rectangular glass vivarium tank frame, completely empty inside with a subtle thin gravel layer at the bottom. The glass walls MUST be 100% clear with NO white diagonal glare strips or glass reflection lines, allowing seamless sticker layering. ${STICKER_RULES_PROMPT_SUFFIX_NO_TEXT}`
  },
  {
    id: 'terrarium-wide-driftwood-moss',
    name: '🪵 [파노라마 핏] 와이드 유목 & 이끼 지형',
    animal: 'Vivarium Driftwood & Moss',
    animalValue: '',
    affinityObject: 'Wide Horizontal Driftwood Root & Moss Terrain',
    theme: 'Horizontal Terrain Pack',
    phrase: '',
    description: '가로 수조 바닥에 딱 맞춰 붙이는 와이드 자연 유목 뿌리와 이끼 & 조약돌 지형 스티커',
    prompt: `A cute die-cut sticker design featuring a wide horizontal panorama mound of natural curved driftwood root, smooth river pebbles, and lush green moss bed, perfectly proportioned to fit horizontally inside a vivarium tank. ${STICKER_RULES_PROMPT_SUFFIX_NO_TEXT}`
  },
  {
    id: 'terrarium-vine-chameleon',
    name: '🦎 [파노라마 핏] 넝쿨 & 미니 카멜레온',
    animal: 'Baby Chameleon',
    animalValue: '',
    affinityObject: 'Climbing Vines & Tiny Baby Chameleon',
    theme: 'Mini Vivarium Creature',
    phrase: '',
    description: '수조 안에 쏙 들어가는 비율의 넝쿨 가지와 귀여운 미니 카멜레온 스티커',
    prompt: `A cute die-cut sticker design featuring a tiny cute baby green chameleon sitting lazily on a delicate climbing vine branch with green tropical leaves, small proportion designed to fit inside a terrarium vivarium tank. ${STICKER_RULES_PROMPT_SUFFIX_NO_TEXT}`
  },
  {
    id: 'terrarium-complete-guide',
    name: '🫙✨ [유리병 가이드] 테라리움 풀세트 완성본',
    animal: 'Terrarium Complete Showcase',
    animalValue: '',
    affinityObject: 'Glass Jar, Moss, Ferns, Mushrooms & Cute Baby Hedgehog Inside',
    theme: 'Complete Terrarium Guide',
    phrase: '',
    description: '스티커 가이드용! 유리병 속에 이끼, 자갈, 다육식물, 아기 고슴도치까지 모두 조합된 완성본 스티커',
    prompt: `A cute die-cut sticker design featuring a complete, fully decorated transparent vintage glass mason jar terrarium. Inside the jar is a lush mini ecosystem filled with soft green moss, smooth river pebbles, mini succulents, tiny red mushrooms, and an adorable fluffy baby hedgehog resting happily inside. ${STICKER_RULES_PROMPT_SUFFIX_NO_TEXT}`
  },
  {
    id: 'terrarium-jar-base',
    name: '🫙 [유리병 핏] 빈티지 유리병 & 이끼 베이스',
    animal: 'Terrarium Container',
    animalValue: '',
    affinityObject: 'Vintage Mason Jar, Moss Bed, Pebbles & Red Mushrooms',
    theme: 'Cozy Terrarium Base',
    phrase: '',
    description: '스티커를 조합해 꾸밀 수 있는 순수 빈티지 메이슨 저 유리병과 이끼 베이스 스티커 (빛반사선 없음)',
    prompt: `A cute die-cut sticker design featuring a transparent vintage glass mason jar filled with layers of soft green moss, smooth river pebbles, and tiny red mushrooms inside. The glass surface MUST be completely clear without any white diagonal reflection glare lines. ${STICKER_RULES_PROMPT_SUFFIX_NO_TEXT}`
  },
  {
    id: 'terrarium-hedgehog-acorn',
    name: '🦔 이끼 침대 위 아기 고슴도치 & 도토리',
    animal: 'Baby Hedgehog',
    animalValue: 'baby hedgehog',
    affinityObject: 'Autumn Oak Leaves, Acorns & Green Moss Bed',
    theme: 'Forest Moss Nap',
    phrase: '',
    description: '몽글몽글 이끼 위에서 도토리를 안고 쉬는 뽀송한 순수 아기 고슴도치 스티커 (텍스트 없음)',
    prompt: `A cute die-cut sticker design featuring a fluffy, adorable baby hedgehog resting gently on a soft green moss mound, holding a shiny brown acorn with oak leaves nearby. ${STICKER_RULES_PROMPT_SUFFIX_NO_TEXT}`
  },
  {
    id: 'terrarium-bunny-gardener',
    name: '🐰 가드너 아기 토끼 + 분무기 & 고사리',
    animal: 'Bunny',
    animalValue: 'bunny',
    affinityObject: 'Plant Spray Bottle, Fern Leaves & Mini Carrots',
    theme: 'Cozy Terrarium Gardener',
    phrase: '',
    description: '파스텔 후드티를 입고 테라리움 식물에 물을 주는 순수 아기 토끼 스티커 (텍스트 없음)',
    prompt: `A cute die-cut sticker design featuring a lovable baby bunny wearing a cozy oversized pastel green hoodie, holding a tiny water spray bottle for terrarium plants, surrounded by miniature fern leaves and tiny carrots. ${STICKER_RULES_PROMPT_SUFFIX_NO_TEXT}`
  },
  {
    id: 'terrarium-sloth-nap',
    name: '🦥 나뭇가지 낮잠 아기 나무늘보',
    animal: 'Baby Sloth',
    animalValue: 'baby sloth',
    affinityObject: 'Tropical Green Leaves & Wild Blossom Branch',
    theme: 'Lazy Terrarium Champ',
    phrase: '',
    description: '테라리움 나뭇가지에 귀엽게 매달려 낮잠 자는 순수 나무늘보 스티커 (텍스트 없음)',
    prompt: `A cute die-cut sticker design featuring a fluffy baby sloth hanging lazily from a leafy tropical tree branch inside a terrarium, wearing cozy pajamas. Surrounding elements include lush green monstera leaves and pink blossoms. ${STICKER_RULES_PROMPT_SUFFIX_NO_TEXT}`
  },
  {
    id: 'terrarium-flora-pack',
    name: '🌵 테라리움 식물 팩 (다육식물 & 버섯 & 이끼)',
    animal: 'Terrarium Flora',
    animalValue: '',
    affinityObject: 'Mini Succulents, Ferns, Fungi & Pebbles',
    theme: 'Botanical Decor Pack',
    phrase: '',
    description: '어디든 붙여 테라리움을 채울 수 있는 순수 식물 세트 스티커 (텍스트 없음)',
    prompt: `A cute die-cut sticker design featuring a charming arrangement of mini succulents, fern branches, tiny red mushrooms, and smooth river stones. ${STICKER_RULES_PROMPT_SUFFIX_NO_TEXT}`
  },
  {
    id: 'terrarium-fawn-wildflower',
    name: '🦌 들꽃 안은 아기 사슴',
    animal: 'Fawn',
    animalValue: 'fawn',
    affinityObject: 'Forest Wildflowers, Acorns & Berries',
    theme: 'Cottagecore Forest Fawn',
    phrase: '',
    description: '들꽃 왕관을 쓰고 도토리를 내려다보는 순수 아기 사슴 스티커 (텍스트 없음)',
    prompt: `A cute die-cut sticker design featuring a sweet baby fawn with white spots, wearing a delicate forest wildflower crown, sitting peacefully near green moss and acorns. ${STICKER_RULES_PROMPT_SUFFIX_NO_TEXT}`
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
