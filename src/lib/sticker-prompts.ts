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
  }
];

export const TERRARIUM_20_SERIES: StickerPreset[] = Array.from({ length: 20 }, (_, i) => {
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
  };
});

export const VIVARIUM_20_SERIES: StickerPreset[] = Array.from({ length: 20 }, (_, i) => {
  const num = i + 1;
  const items = [
    { name: '미니 카멜레온 수조 비바리움', desc: '가로 수조 유목 위 나른하게 쉰 미니 카멜레온', detail: 'wide horizontal glass vivarium tank with curved driftwood, moss, climbing vines, and a tiny cute baby green chameleon resting on a branch' },
    { name: '나뭇잎 청개구리 수조 비바리움', desc: '몬스테라 잎 위 아기 청개구리가 앉은 비바리움', detail: 'horizontal glass vivarium tank featuring a tiny cute green tree frog perched on a monstera leaf' },
    { name: '속눈썹 게코 도마뱀 비바리움', desc: '유목 뿌리 속 눈부신 크레스티드 게코 도마뱀', detail: 'wide vivarium tank with natural driftwood root, ferns, and a tiny adorable crested gecko' },
    { name: '무당개구리 이끼 비바리움', desc: '작은 바위 위 알록달록 무당개구리가 있는 수조', detail: 'horizontal vivarium tank with smooth river stones, moss, and a tiny colorful oriental fire-bellied toad' },
    { name: '피그미 도롱뇽 비바리움', desc: '촉촉한 이끼 침대 위 아기 점박이 도롱뇽', detail: 'wide vivarium tank with moist moss terrain, bark, and a tiny cute spotted salamander' },
    { name: '열대 넝쿨 카멜레온 비바리움', desc: '화려한 수생 넝쿨과 미니 파스텔 카멜레온', detail: 'panoramic vivarium tank filled with lush tropical climbing vines and a tiny cute chameleon' },
    { name: '유목 뿌리 아기 게코 비바리움', desc: '대형 꼬인 유목 뿌리와 아기 레오파드 게코', detail: 'horizontal vivarium tank with a large twisted driftwood root and a tiny baby leopard gecko' },
    { name: '우림 고사리 청개구리 비바리움', desc: '우림 고사리 잎 아래 비를 피하는 미니 개구리', detail: 'wide vivarium tank with dense rainforest fern leaves and a tiny cute tree frog sheltering under a leaf' },
    { name: '자연 바위 도롱뇽 비바리움', desc: '자연 암석 지층 사이의 미니 도롱뇽 비바리움', detail: 'horizontal glass tank featuring layered natural rock slate, moss, and a tiny cute baby salamander' },
    { name: '몬스테라 넝쿨 게코 비바리움', desc: '싱그러운 몬스테라 줄기 타는 미니 게코', detail: 'wide glass vivarium tank with climbing monstera vines and a tiny cute gecko climbing up' },
    { name: '화산석 테인 카멜레온 비바리움', desc: '검은 화산석 바위와 카멜레온이 조화로운 수조', detail: 'horizontal vivarium tank with black volcanic rocks, moss mound, and a tiny green chameleon' },
    { name: '미니 달팽이 이끼 비바리움', desc: '이끼 언덕 위 귀여운 미니 나뭇잎 달팽이', detail: 'wide vivarium tank with plush cushion moss and a tiny cute garden snail with a spiral shell' },
    { name: '밀림 정글 유목 비바리움', desc: '울창한 정글 수초 유목 생태계 완성 수조', detail: 'panoramic vivarium tank featuring dense jungle foliage, curved driftwood, and smooth stones' },
    { name: '수생 식물 카멜레온 비바리움', desc: '수생 식물 사이로 삐쭉 고개 내민 미니 카멜레온', detail: 'wide glass tank filled with lush aquatic jungle plants and a tiny baby chameleon peeking out' },
    { name: '이끼 바위 개구리 비바리움', desc: '이끼 덮인 바위 위 아기 청개구리의 비바리움', detail: 'horizontal vivarium tank with moss-covered boulders and a tiny cute green frog sitting happily' },
    { name: '유목 아치 도롱뇽 비바리움', desc: '유목 아치 다리 아래 쉬는 미니 도롱뇽 수조', detail: 'wide glass tank with an arched driftwood branch, ferns, and a tiny sleeping salamander' },
    { name: '트로피컬 고사리 게코 비바리움', desc: '열대 고사리 장식 수조 속 귀여운 아기 게코', detail: 'horizontal vivarium tank featuring lush tropical fern fronds and a tiny cute baby gecko' },
    { name: '자갈 시냇물 비바리움', desc: '자갈 얕은 수분 물길이 지나는 비바리움 지형', detail: 'wide glass tank with a miniature gravel creekbed, moss banks, and a tiny baby frog' },
    { name: '바위 동굴 게코 비바리움', desc: '바위 동굴 속에서 고개를 빼끔 내민 미니 게코', detail: 'horizontal vivarium tank with a tiny stone cave shelter and a cute gecko peeking out' },
    { name: '파노라마 마스터 비바리움', desc: '유목, 고사리, 이끼, 청개구리가 완벽 어우러진 비바리움', detail: 'wide panoramic vivarium glass tank with lush mixed greenery, driftwood root, and a cute tree frog' }
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
    prompt: `A cute die-cut sticker design featuring a clean, wide horizontal panoramic rectangular glass vivarium tank. Inside is a lush ${items.detail}. NO glass glare strips. Crisp white border. ${STICKER_RULES_PROMPT_SUFFIX_NO_TEXT}`
  };
});

export const SALT_AQUARIUM_20_SERIES: StickerPreset[] = Array.from({ length: 20 }, (_, i) => {
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
    { name: '아기 해달 & 해초 해수어항', desc: '배영하는 아기 해달과 해초 산호 어항', detail: 'glass marine tank featuring a cute baby sea otter floating on its back near kelp' },
    { name: '쏠배감펭(라이언피쉬) 해수어항', desc: '화려한 지느러미의 귀여운 라이언피쉬 어항', detail: 'glass saltwater tank with a cute lionfish with elaborate fins near purple coral rocks' },
    { name: '가리비 조개 & 진주 해수어항', desc: '입 벌린 가리비 조개와 진주 보석 해수어항', detail: 'glass marine tank featuring an open scallop shell with a shiny pearl on sea sand' },
    { name: '청소 새우 & 산호 해수어항', desc: '빨간 줄무늬 청소 새우와 산호초 어항', detail: 'glass saltwater tank with a cute red-striped cleaner shrimp on live rock' },
    { name: '산호 숲 & 아기 물고기 해수어항', desc: '형광 산호가 숲처럼 우거진 해수어항', detail: 'glass marine tank filled with a dense forest of colorful corals and tiny blue fish' },
    { name: '아기 펭귄 & 바다 모래 해수어항', desc: '헤엄치는 아기 펭귄이 연출된 해수 수조', detail: 'glass saltwater tank with a tiny cute baby penguin swimming underwater near coral' },
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
    prompt: `A cute die-cut sticker design featuring a clean glass saltwater marine aquarium tank. Inside is a vibrant ${items.detail}. NO glass glare strips. Crisp white border. ${STICKER_RULES_PROMPT_SUFFIX_NO_TEXT}`
  };
});

export const FRESH_AQUARIUM_20_SERIES: StickerPreset[] = Array.from({ length: 20 }, (_, i) => {
  const num = i + 1;
  const items = [
    { name: '화려한 드레스 베타 열대어항', desc: '붉은 드레스 지느러미 베타와 나나 수초 어항', detail: 'glass freshwater aquarium tank with a gorgeous red veil-tail betta fish swimming among green aquatic plants' },
    { name: '네온 테트라 무리 열대어항', desc: '반짝이는 파란 네온 테트라들이 헤엄치는 수초 어항', detail: 'glass freshwater tank with a swarm of glowing blue neon tetra fish swimming near driftwood' },
    { name: '화려한 네온 구피 열대어항', desc: '화려한 꼬리의 파스텔 구피 두 마리와 수초 어항', detail: 'glass aquarium tank featuring a pair of colorful fancy guppy fish with flowing tails' },
    { name: '엔젤피쉬 & 수초 유목 어항', desc: '우아한 줄무늬 엔젤피쉬와 유목 수초 어항', detail: 'glass freshwater aquarium tank with a cute striped freshwater angelfish near tall green water plants' },
    { name: '알비노 코리도라스 열대어항', desc: '바닥을 훑는 귀여운 핑크 코리도라스 어항', detail: 'glass freshwater tank featuring a cute chubby corydoras catfish sitting on river gravel' },
    { name: '블랙 마블 베타 열대어항', desc: '검은색과 파란빛이 조화로운 마블 베타 어항', detail: 'glass aquarium tank with a stunning black and blue marble betta fish among green ferns' },
    { name: '옐로우 드레스 구피 열대어항', desc: '선명한 노란 드레스 꼬리 구피 어항', detail: 'glass freshwater tank with a shiny yellow fancy guppy swimming near moss stones' },
    { name: '체리 새우 & 이끼 유목 어항', desc: '빨간 체리 새우들이 유목 이끼 위 노는 어항', detail: 'glass aquarium tank featuring cute tiny red cherry shrimps grazing on mossy driftwood' },
    { name: '디스커스(원반 물고기) 열대어항', desc: '원반 모양 화려한 주황 디스커스 열대어항', detail: 'glass freshwater tank with a majestic colorful discus fish swimming near Amazon sword plants' },
    { name: '골든 알지이더 & 자갈 어항', desc: '귀여운 노란 이끼먹는 물고기와 수초 어항', detail: 'glass aquarium tank with a cute golden algae eater fish near smooth river pebbles' },
    { name: '파스텔 핑크 베타 열대어항', desc: '분홍빛 드레스 지느러미 아기 베타 어항', detail: 'glass freshwater tank with a cute pastel pink halfmoon betta fish near green water plants' },
    { name: '카디날 테트라 수초 어항', desc: '붉고 푸른 카디날 테트라와 수초 어항', detail: 'glass aquarium tank with vibrant cardinal tetras swimming near green moss' },
    { name: '드워프 구라미 열대어항', desc: '알록달록 드워프 구라미와 나나 수초 어항', detail: 'glass freshwater tank featuring a colorful cute dwarf gourami fish swimming near rocks' },
    { name: '화려한 삼색 구피 열대어항', desc: '삼색 화려한 지느러미의 프리미엄 구피 어항', detail: 'glass aquarium tank with a fancy tri-color guppy fish gliding over gravel' },
    { name: '애플 스네일 달팽이 열대어항', desc: '노란 동글동글 애플 스네일 달팽이 수초 어항', detail: 'glass freshwater tank featuring a cute yellow mystery apple snail crawling on water leaves' },
    { name: '오토싱(이끼 물고기) 열대어항', desc: '유리 벽면에 찰싹 붙은 미니 오토싱 어항', detail: 'glass freshwater aquarium tank with a tiny cute otocinclus catfish resting on a plant leaf' },
    { name: '수초 숲 & 자갈 바닥 어항', desc: '푸른 수초가 숲처럼 우거진 힐링 수초 어항', detail: 'glass aquarium tank filled with lush green aquatic moss, stem plants, and pebbles' },
    { name: '유목 아치 & 구피 무리 어항', desc: '유목 아치 다리 아래 헤엄치는 구피 어항', detail: 'glass freshwater tank with a curved wooden driftwood arch and swimming tiny colorful fish' },
    { name: '화이트 다이아몬드 베타 어항', desc: '순백색 우아한 다이아몬드 베타 어항', detail: 'glass freshwater tank with a pristine white veil-tail betta fish swimming among lush green plants' },
    { name: '파노라마 열대어 마스터 수초 어항', desc: '베타, 구피, 테트라, 수초가 어우러진 완성 어항', detail: 'panoramic glass freshwater aquarium tank filled with betta fish, guppies, lush water plants, and driftwood' }
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
    prompt: `A cute die-cut sticker design featuring a clean glass freshwater aquarium tank. Inside is a beautiful ${items.detail}. NO glass glare strips. Crisp white border. ${STICKER_RULES_PROMPT_SUFFIX_NO_TEXT}`
  };
});

export function buildStickerPrompt(
  animalName: string,
  affinityObject: string,
  phrase: string = '',
  extraStyleDetails: string = ''
): string {
  const textPart = phrase ? `Curved text at the top reads "${phrase}" in an elegant, cute, hand-drawn script font.` : '';
  
  return `A cute die-cut sticker design featuring an adorable ${animalName} associated with ${affinityObject}. ${extraStyleDetails} ${textPart} ${STICKER_RULES_PROMPT_SUFFIX}`;
}
