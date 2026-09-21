/**
 * 365-Day Dynamic Seasonal Trend Sticker Presets & Lead-Time Radar Engine
 * Covers all 11 major Etsy shopping seasons across the entire year!
 * Each seasonal theme includes:
 * 1. 20-Pack Themed Vessels/Globes/Jars/Cups (Sheet 1)
 * 2. 20-Pack Standalone Cute Deco Objects (Sheet 2)
 * Total 40 stickers per seasonal pack!
 */

import { StickerPreset } from './sticker-prompts';
import { getAllUpcomingSeasons, SeasonalHoliday } from './seasonal-trends';

export const SEASONAL_RULES_NO_TEXT = `CRITICAL STICKER RULES:
1. Must have a crisp, thick, smooth white die-cut sticker border outlining the ENTIRE sticker design.
2. Must have a PURE SOLID WHITE BACKGROUND (#FFFFFF). Absolutely NO background colors, scenery, or gradients outside the sticker border.
3. STRICT TEXT RULE: Absolutely NO text, NO words, NO letters, NO phrases, NO typography, NO signatures anywhere in the image. Pure graphic illustration art only.
4. Vector sticker aesthetic, vibrant kawaii illustration, high contrast, clean contours.`;

// Helper function to build 20 vessel stickers + 1 master cover
function createSeasonalVesselSeries(
  seasonId: string,
  seasonNameKo: string,
  bundleTitle: string,
  coverDesc: string,
  coverPrompt: string,
  items: Array<{ name: string; desc: string; detail: string }>
): StickerPreset[] {
  const coverPreset: StickerPreset = {
    id: `${seasonId}-20-pack-cover`,
    name: `🖼️ [마스터 썸네일] ${seasonNameKo} 20종 스티커 팩 대표 커버 표지`,
    animal: `${bundleTitle} Cover`,
    animalValue: '',
    affinityObject: bundleTitle,
    theme: `${bundleTitle} 20 Pack Cover`,
    phrase: '',
    description: coverDesc,
    prompt: coverPrompt
  };

  const itemPresets: StickerPreset[] = items.map((item, idx) => {
    const num = idx + 1;
    return {
      id: `${seasonId}-20-pack-${num}`,
      name: `✨ [${seasonNameKo} ${num}/20] ${item.name}`,
      animal: `${seasonNameKo} 20 Pack`,
      animalValue: '',
      affinityObject: item.name,
      theme: `${seasonNameKo} 20 Pack`,
      phrase: '',
      description: item.desc,
      prompt: `A cute die-cut sticker design featuring: ${item.detail}. Clear transparent glass container, vibrant festive aesthetic, thick white die-cut sticker outline. ${SEASONAL_RULES_NO_TEXT}`
    };
  });

  return [coverPreset, ...itemPresets];
}

// Helper function to build 20 standalone deco objects + 1 master cover
function createSeasonalStandaloneSeries(
  seasonId: string,
  seasonNameKo: string,
  bundleTitle: string,
  coverDesc: string,
  coverPrompt: string,
  items: Array<{ name: string; desc: string; detail: string }>
): StickerPreset[] {
  const coverPreset: StickerPreset = {
    id: `${seasonId}-standalone-20-pack-cover`,
    name: `🖼️ [마스터 썸네일] ${seasonNameKo} 단독 오브젝트 20종 스티커 팩 대표 커버 표지`,
    animal: `${bundleTitle} Standalone Cover`,
    animalValue: '',
    affinityObject: `${bundleTitle} Clipart`,
    theme: `${bundleTitle} Standalone 20 Pack Cover`,
    phrase: '',
    description: coverDesc,
    prompt: coverPrompt
  };

  const itemPresets: StickerPreset[] = items.map((item, idx) => {
    const num = idx + 1;
    return {
      id: `${seasonId}-standalone-20-pack-${num}`,
      name: `✨ [${seasonNameKo} 단독 ${num}/20] ${item.name}`,
      animal: `${seasonNameKo} Standalone 20 Pack`,
      animalValue: '',
      affinityObject: item.name,
      theme: `${seasonNameKo} Standalone 20 Pack`,
      phrase: '',
      description: item.desc,
      prompt: `A cute die-cut sticker design featuring: ${item.detail}. STRICT NO GLASS JARS OR CONTAINERS: Pure standalone die-cut aesthetic object only. Thick white die-cut sticker outline. ${SEASONAL_RULES_NO_TEXT}`
    };
  });

  return [coverPreset, ...itemPresets];
}

// ==========================================
// Existing Handcrafted Fall & Winter Series (Christmas, Halloween, Thanksgiving)
// ==========================================
// 1. 🎄 CHRISTMAS & WINTER WONDERLAND SERIES
// ==========================================
export const CHRISTMAS_20_SERIES: StickerPreset[] = [
  {
    id: 'christmas-20-pack-cover',
    name: '🖼️ [마스터 썸네일] 크리스마스 윈터 스노우볼 20종 스티커 팩 대표 커버 표지',
    animal: 'Christmas Snowglobe Cover',
    animalValue: '',
    affinityObject: 'Christmas Snowglobes & Festive Baubles',
    theme: 'Christmas Snowglobe 20 Pack Cover',
    phrase: '',
    description: 'Etsy 판매용 20종 크리스마스 윈터 스노우볼 스티커 팩 마스터 대표 썸네일 커버 표지 그래픽',
    prompt: `A professional Etsy digital sticker bundle master cover graphic illustration on a pure solid white background (#FFFFFF). Centered cute bold pink script typography reading "20+ CUTE CHRISTMAS STICKER BUNDLE". Below title reads "PNG DIGITAL DOWNLOAD" in a stylish blue ribbon banner. Surrounding the text are large cute die-cut sticker samples of glass snowglobes with Christmas trees, gingerbread cottages, cute penguins on icebergs, and festive baubles along with standalone gingerbread men, candy canes, hot cocoa mugs, and holly leaves arranged artistically across the white background. CRITICAL: The image MUST have a pure solid white background (#FFFFFF). NEVER generate any background colors, gradients, or scenery. Etsy bestseller listing thumbnail aesthetic. High resolution.`
  },
  ...Array.from({ length: 20 }, (_, i) => {
    const num = i + 1;
    const items = [
      { name: '스노우볼 속 클래식 크리스마스 트리', desc: '눈 펑펑 내리는 유리 스노우볼 속 장식 트리', detail: 'spherical glass snowglobe containing a decorated Christmas tree with glowing golden stars, colorful baubles, and falling snow' },
      { name: '진저브레드 쿠키 하우스 유리 돔', desc: '눈 덮인 진저브레드 하우스가 든 벨자 유리 돔', detail: 'clear glass bell jar dome containing a frosted gingerbread house with candy gumdrops and powdered sugar snow' },
      { name: '펭귄과 얼음 이글루 메이슨 저', desc: '빨간 목도리 꼬마 펭귄과 이글루가 든 메이슨 저', detail: 'vintage mason jar filled with a cute baby penguin wearing a red knitted scarf standing next to an ice igloo' },
      { name: '별빛 전구 오너먼트 속 아기 사슴', desc: '요정 전구가 감긴 유리 오너먼트 속 아기 사슴', detail: 'glass bauble ornament enclosing an adorable baby fawn curled up on fresh snow surrounded by warm fairy lights' },
      { name: '호두까기 인형과 선물 상자 유리병', desc: '클래식 호두까기 인형과 선물 상자가 든 유리병', detail: 'antique apothecary glass bottle containing a miniature nutcracker soldier and colorful wrapped present boxes' },
      { name: '북극곰과 오로라 스노우볼', desc: '에메랄드빛 오로라 아래 아기 북극곰 스노우볼', detail: 'glass snowglobe with a fluffy baby polar bear sitting on a blue ice floe under a glowing aurora sky' },
      { name: '산타의 썰매와 밤하늘 유리 돔', desc: '눈 덮인 소나무 숲 위 산타 썰매 유리 돔', detail: 'glass cloche dome featuring a miniature red sleigh with gifts resting in a pine tree forest' },
      { name: '핫초코 퐁듀 모락모락 테라리움', desc: '마시멜로와 시나몬이 든 디저트 유리잔 테라리움', detail: 'wide glass bowl terrarium with miniature marshmallow snowmen and cinnamon stick logs in a holiday setting' },
      { name: '눈사람 가족 미니 스노우볼', desc: '당근 코 눈사람 가족이 있는 클래식 스노우볼', detail: 'glass snowglobe featuring a happy snowman family wearing knitted beanies and cozy scarves' },
      { name: '크리스마스 화환과 촛불 메이슨 저', desc: '반짝이는 크리스마스 리스와 촛불이 든 메이슨 저', detail: 'clear mason jar containing a holly berry pine wreath with a warm flickering golden candle at center' },
      { name: '빨간 픽업트럭과 트리 유리 돔', desc: '트리를 싣고 달리는 빈티지 빨간 픽업트럭 돔', detail: 'glass display dome featuring a miniature vintage red pickup truck carrying a pine Christmas tree in back' },
      { name: '얼음 스케이트 링크 스노우볼', desc: '동물 친구들이 스케이트 타는 얼음 연못 스노우볼', detail: 'glass snowglobe with a frozen ice-skating pond, snowy pine trees, and sparkling silver glitter snow' },
      { name: '루돌프와 산타 모자 미니 유리병', desc: '빨간 코 루돌프 피규어가 든 미니 코르크 유리병', detail: 'cork-stopped glass bottle containing an adorable red-nosed reindeer figurine resting on soft white snow' },
      { name: '크리스마스 빌리지 기차역 돔', desc: '장난감 증기 기차가 지나가는 기차역 유리 돔', detail: 'glass dome featuring a festive miniature train station with a tiny red holiday steam engine' },
      { name: '솔방울과 목화꽃 윈터 테라리움', desc: '하얀 목화꽃과 솔방울이 어우러진 감성 유리병', detail: 'cylindrical glass vase containing snowy pinecones, white cotton flower pods, and eucalyptus leaves' },
      { name: '크리스마스 종과 리본 스노우볼', desc: '황금빛 크리스마스 종과 빨간 리본 스노우볼', detail: 'glass snowglobe with shining golden Christmas bells tied with an elegant red velvet ribbon' },
      { name: '선물 배달 아기 고양이 유리병', desc: '산타 양말 속에 쏙 들어간 아기 고양이 유리병', detail: 'clear glass jar with a cute fluffy kitten peeking out from a red holiday stocking on white snow' },
      { name: '눈 덮인 등대 해안 스노우볼', desc: '눈보라 치는 바닷가 등대가 선 스노우볼', detail: 'glass snowglobe featuring a cozy red-and-white coastal lighthouse amidst snowy rocks and seafoam' },
      { name: '크리스마스 캐롤 하모니 유리 돔', desc: '찬송가 악보와 작은 천사 피규어가 든 유리 돔', detail: 'bell jar containing a miniature golden angel figurine with holiday carol songbook sheets' },
      { name: '황금 별 윈터 원더랜드 스노우볼', desc: '찬란한 별빛과 눈꽃이 휘날리는 스노우볼', detail: 'premium crystal snowglobe filled with swirling holographic snowflakes and floating golden stars' }
    ][i];

    return {
      id: `christmas-20-pack-${num}`,
      name: `🎄 [크리스마스 ${num}/20] ${items.name}`,
      animal: 'Christmas 20 Pack',
      animalValue: '',
      affinityObject: items.name,
      theme: 'Christmas 20 Pack',
      phrase: '',
      description: items.desc,
      prompt: `A cute die-cut sticker design featuring: ${items.detail}. Clear transparent glass container, festive holiday winter color palette, thick white die-cut sticker outline. ${SEASONAL_RULES_NO_TEXT}`
    };
  }) as unknown as StickerPreset[]
];

export const CHRISTMAS_STANDALONE_20_SERIES: StickerPreset[] = [
  {
    id: 'christmas-standalone-20-pack-cover',
    name: '🖼️ [마스터 썸네일] 크리스마스 단독 오브젝트 20종 스티커 팩 대표 커버 표지',
    animal: 'Christmas Standalone Cover',
    animalValue: '',
    affinityObject: 'Christmas Clipart Objects',
    theme: 'Christmas Standalone 20 Pack Cover',
    phrase: '',
    description: 'Etsy 판매용 20종 크리스마스 단독 데코 오브젝트 스티커 팩 마스터 대표 썸네일 커버 표지 그래픽',
    prompt: `A professional Etsy digital sticker bundle master cover graphic illustration on a pure solid white background (#FFFFFF). Centered cute bold pink script typography reading "20+ CUTE CHRISTMAS CLIPART BUNDLE". Below title reads "PNG DIGITAL DOWNLOAD" in a stylish blue ribbon banner. Surrounding the text are large individual standalone die-cut sticker samples of decorated Christmas trees, smiling gingerbread men, hot chocolate mugs with marshmallows, candy canes, Christmas wreaths, wrapped present stacks, and snowflakes arranged artistically across the white background. STRICT NO GLASS TANKS: Pure standalone die-cut festive objects only. CRITICAL: Pure solid white background (#FFFFFF). High resolution.`
  },
  ...Array.from({ length: 20 }, (_, i) => {
    const num = i + 1;
    const items = [
      { name: '장식된 미니 크리스마스 트리', desc: '별과 오너먼트가 달린 미니 소나무 트리', detail: 'standalone cute decorated mini Christmas pine tree with twinkling star topper and colorful baubles' },
      { name: '스마일 진저브레드맨 쿠키', desc: '빨간 나비넥타이를 맨 진저브레드맨 쿠키', detail: 'standalone cute smiling gingerbread man cookie with white icing swirls and a red bow tie' },
      { name: '마시멜로 동동 핫초코 머그잔', desc: '마시멜로와 초콜릿 드리즐이 얹힌 빨간 머그잔', detail: 'standalone red ceramic holiday mug filled with steaming hot chocolate and fluffy marshmallows' },
      { name: '빨간 리본 크리스마스 리스', desc: '솔방울과 호랑가시나무 열매가 장식된 리스', detail: 'standalone vibrant green pine Christmas wreath decorated with red berries and a large velvet bow' },
      { name: '줄무늬 지팡이 사탕(캔디케인) 듀오', desc: '리본으로 묶인 빨간 줄무늬 캔디케인 2개', detail: 'standalone pair of crossed red and white peppermint candy canes tied with a green ribbon' },
      { name: '알록달록 선물 상자 피라미드', desc: '예쁜 리본으로 포장된 선물 상자 3개 묶음', detail: 'standalone festive stack of 3 colorful wrapped holiday present boxes with shiny satin ribbons' },
      { name: '솔방울과 호랑가시나무 잎가지', desc: '싱그러운 크리스마스 솔방울과 빨간 열매', detail: 'standalone winter pinecone nestled with evergreen pine needles and bright red holly berries' },
      { name: '포근한 산타 털모자', desc: '하얀 털방울이 달린 클래식 빨간 산타 모자', detail: 'standalone plush red velvet Santa hat with a fluffy white faux-fur trim and pom-pom' },
      { name: '황금 크리스마스 벨과 리본', desc: '맑은 소리가 날 것 같은 반짝이는 황금 종', detail: 'standalone pair of shiny golden Christmas jingle bells tied with an emerald green ribbon' },
      { name: '반짝이는 눈꽃 결정(스노우플레이크)', desc: '섬세하고 영롱한 하늘색 눈꽃 송이', detail: 'standalone intricate pastel ice-blue and silver sparkling snowflake crystal ornament' },
      { name: '빨간 산타 부츠와 지팡이 사탕', desc: '선물이 가득 꽂힌 귀여운 빨간 산타 장화', detail: 'standalone red Santa boot stuffed with candy canes, holly sprigs, and small wrapped treats' },
      { name: '크리스마스 스트라이프 양말', desc: '벽난로에 걸리는 귀여운 털실 선물 양말', detail: 'standalone cozy knit holiday stocking with red and white Nordic patterns' },
      { name: '빨간 코 아기 루돌프 얼굴', desc: '사랑스러운 미소를 짓는 아기 순록 캐릭터', detail: 'standalone cute chibi baby reindeer face with sparkling red nose and small antlers' },
      { name: '눈사람 얼굴 피규어', desc: '당근 코와 검은 모자를 쓴 귀여운 눈사람', detail: 'standalone smiling snowman head wearing a black top hat and cozy plaid earmuffs' },
      { name: '포근한 노르딕 크리스마스 스웨터', desc: '순록 무늬가 짜인 따뜻한 겨울 털스웨터', detail: 'standalone cute cozy knit holiday sweater featuring fair-isle snowflake patterns' },
      { name: '크리스마스 촛불 캔들 홀더', desc: '솔가지 위에 놓인 따스한 크리스마스 캔들', detail: 'standalone glowing pillar candle resting in a festive pine sprig and red ribbon holder' },
      { name: '초콜릿 퐁듀 딸기 오너먼트', desc: '눈송이 초콜릿이 코팅된 크리스마스 딸기', detail: 'standalone delicious strawberry dipped in white and dark chocolate with festive sprinkles' },
      { name: '빈티지 빨간 스케이트화', desc: '나뭇가지에 걸린 앙증맞은 미니 아이스 스케이트', detail: 'standalone pair of vintage white and red ice skates tied together with silver laces' },
      { name: '크리스마스 유리볼 오너먼트 3종', desc: '반짝이는 글리터 무늬 유리 오너먼트 세트', detail: 'standalone cluster of 3 hanging holiday glass ornaments with gold and red glitter' },
      { name: '슈가 글레이즈드 도넛', desc: '눈꽃과 스프링클이 뿌려진 크리스마스 도넛', detail: 'standalone cute holiday donut with white sugar glaze and red and green sprinkles' }
    ][i];

    return {
      id: `christmas-standalone-20-pack-${num}`,
      name: `🎄 [크리스마스 단일 ${num}/20] ${items.name}`,
      animal: 'Christmas Standalone 20 Pack',
      animalValue: '',
      affinityObject: items.name,
      theme: 'Christmas Standalone 20 Pack',
      phrase: '',
      description: items.desc,
      prompt: `A cute die-cut sticker design featuring a standalone festive item: ${items.detail}. STRICT NO GLASS CONTAINER RULE: Pure standalone die-cut object, crisp white border. ${SEASONAL_RULES_NO_TEXT}`
    };
  }) as unknown as StickerPreset[]
];

// ==========================================
// 2. 🎃 HALLOWEEN & SPOOKY CUTE SERIES
// ==========================================
export const HALLOWEEN_20_SERIES: StickerPreset[] = [
  {
    id: 'halloween-20-pack-cover',
    name: '🖼️ [마스터 썸네일] 할로윈 스푸키 큐트 20종 스티커 팩 대표 커버 표지',
    animal: 'Halloween Spooky Cute Cover',
    animalValue: '',
    affinityObject: 'Halloween Pumpkin Terrariums & Potion Jars',
    theme: 'Halloween 20 Pack Cover',
    phrase: '',
    description: 'Etsy 판매용 20종 할로윈 스푸키 큐트 스티커 팩 마스터 대표 썸네일 커버 표지 그래픽',
    prompt: `A professional Etsy digital sticker bundle master cover graphic illustration on a pure solid white background (#FFFFFF). Centered cute bold pink script typography reading "20+ CUTE HALLOWEEN STICKER BUNDLE". Below title reads "PNG DIGITAL DOWNLOAD" in a stylish purple ribbon banner. Surrounding the text are cute die-cut sticker samples of glass pumpkin jars with cute ghosts, witch cauldron domes, and potion terrariums along with standalone iced PSL ghosts, mini jack-o-lanterns, witch hats, and candy corn arranged artistically across the white background. Pastel spooky kawaii aesthetic. CRITICAL: Pure solid white background (#FFFFFF). High resolution.`
  },
  ...Array.from({ length: 20 }, (_, i) => {
    const num = i + 1;
    const items = [
      { name: '호박 단지 속 꼬마 유령과 캔디콘', desc: '유리 잭오랜턴 단지 안 꼬마 유령 테라리움', detail: 'translucent glass jack-o-lantern jar terrarium containing a cute floating white baby ghost and candy corn' },
      { name: '마녀 모자 쓴 다육이 유리병', desc: '뾰족한 마녀 모자를 쓴 빈티지 유리병 속 보라 다육이', detail: 'vintage apothecary jar wearing a mini purple witch hat, filled with dark purple rosette succulents and spiderwebs' },
      { name: '묘지 잔디 위 아기 박쥐 유리 돔', desc: '묘비와 초승달 아래 자고 있는 아기 박쥐 돔', detail: 'glass bell jar dome containing a plush green graveyard moss bed with a tiny cute sleeping bat and a friendly tombstone' },
      { name: '흑고양이와 보라색 마법약 테라리움', desc: '신비한 마법 물약 거품과 아기 흑고양이 유리병', detail: 'clear glass potion bottle terrarium featuring a cute chubby black cat kitten sitting among glowing purple bubbles' },
      { name: '촛불 켜진 유령 오두막 스노우볼', desc: '보라색 안개와 깜찍한 유령 오두막 스노우볼', detail: 'glass snowglobe with an eerie cute miniature witch cottage with glowing yellow windows and floating ghost glitter' },
      { name: '캔디 바구니 품은 해골 메이슨 저', desc: '알록달록 사탕이 가득 찬 귀여운 해골 메이슨 저', detail: 'mason jar terrarium with a friendly pastel pink skull surrounded by wrapped Halloween candies' },
      { name: '마녀의 가마솥 보글보글 테라리움', desc: '에메랄드빛 마법 물약이 끓는 마녀 가마솥 유리 돔', detail: 'glass cloche dome enclosing a miniature black cauldron bubbling with bright green glitter potion' },
      { name: '아기 거미와 거미줄 이끼 유리구', desc: '분홍 리본을 단 앙증맞은 꼬마 거미 테라리움', detail: 'hanging glass globe terrarium with a cute round smiling baby spider in a silken web with pink moss' },
      { name: '호박 패치와 검은 고양이 유리병', desc: '미니 주황 호박 밭 위 아기 검은 고양이', detail: 'clear glass jar with a miniature pumpkin patch and a cute black kitten wearing a pumpkin collar' },
      { name: '마법 빗자루와 별빛 병 테라리움', desc: '별가루가 날리는 미니 마녀 빗자루 유리병', detail: 'cork-topped glass flask with a miniature straw witch broomstick floating in glowing yellow stardust' },
      { name: '유령 티파티 찻잔 테라리움', desc: '할로윈 찻잔 속에서 마카롱을 먹는 유령', detail: 'vintage black teacup terrarium with two tiny cute ghosts enjoying Halloween macarons and tea' },
      { name: '보라빛 달밤 부엉이 메이슨 저', desc: '나뭇가지 위 노란 눈동자 아기 부엉이 메이슨 저', detail: 'mason jar with an adorable fluffy baby owl perched on a branch in front of a glowing harvest moon' },
      { name: '할로윈 사탕 자판기 유리 돔', desc: '캔디콘과 호박 사탕이 든 빈티지 캔디머신 돔', detail: 'glass dome featuring a retro candy dispenser filled with colorful pastel Halloween sweets' },
      { name: '독버섯 숲 마녀 테라리움', desc: '보라색과 빨간 반점 독버섯이 자란 신비한 숲', detail: 'glass prism terrarium with glowing purple mushrooms and soft moss under eerie green light' },
      { name: '달빛 아래 춤추는 아기 미라 유리병', desc: '붕대를 칭칭 감은 귀여운 꼬마 미라 유리병', detail: 'clear glass jar terrarium with a chibi baby mummy wrapped in pastel bandages dancing happily' },
      { name: '크리스탈 볼과 점성술 테라리움', desc: '반짝이는 자수정과 타로카드가 놓인 신비한 병', detail: 'glass jar with a glowing crystal orb, tiny tarot cards, and sparkling star dust on velvet moss' },
      { name: '할로윈 랜턴 속 아기 늑대인간', desc: '보름달을 보며 아우- 우는 아기 늑대 테라리움', detail: 'vintage glass lantern terrarium containing a super cute fluffy chibi werewolf pup howling cutely' },
      { name: '마법 서재 책장 유리 돔', desc: '마법서와 촛불이 꽂힌 작은 서재 유리 돔', detail: 'glass cloche dome featuring miniature antique spellbooks, a quill pen, and dripping candle' },
      { name: '유령선 돛단배 병 속의 바다', desc: '야광 바다를 항해하는 꼬마 유령 해적선', detail: 'glass ship-in-a-bottle featuring a tiny cute ghost pirate ship sailing on phosphorescent sea waves' },
      { name: '할로윈 사탕 하우스 테라리움', desc: '초콜릿 벽돌과 젤리 창문이 달린 동화 속 집', detail: 'glass terrarium with a miniature haunted candy house made of chocolate bars and candy corn' }
    ][i];

    return {
      id: `halloween-20-pack-${num}`,
      name: `🎃 [할로윈 ${num}/20] ${items.name}`,
      animal: 'Halloween 20 Pack',
      animalValue: '',
      affinityObject: items.name,
      theme: 'Halloween 20 Pack',
      phrase: '',
      description: items.desc,
      prompt: `A cute die-cut sticker design featuring: ${items.detail}. Pastel spooky kawaii Halloween color palette (soft orange, lavender purple, mint green, blush pink). Clear glass container, thick white die-cut border. ${SEASONAL_RULES_NO_TEXT}`
    };
  }) as unknown as StickerPreset[]
];

export const HALLOWEEN_STANDALONE_20_SERIES: StickerPreset[] = [
  {
    id: 'halloween-standalone-20-pack-cover',
    name: '🖼️ [마스터 썸네일] 할로윈 단독 오브젝트 20종 스티커 팩 대표 커버 표지',
    animal: 'Halloween Standalone Cover',
    animalValue: '',
    affinityObject: 'Halloween Clipart Objects',
    theme: 'Halloween Standalone 20 Pack Cover',
    phrase: '',
    description: 'Etsy 판매용 20종 할로윈 단독 데코 오브젝트 스티커 팩 마스터 대표 썸네일 커버 표지 그래픽',
    prompt: `A professional Etsy digital sticker bundle master cover graphic illustration on a pure solid white background (#FFFFFF). Centered cute bold pink script typography reading "20+ CUTE HALLOWEEN CLIPART BUNDLE". Below title reads "PNG DIGITAL DOWNLOAD" in a stylish purple ribbon banner. Surrounding the text are large individual standalone die-cut sticker samples of cute ghosts sipping iced pumpkin spice lattes, smiling jack-o-lantern pumpkins, witch hats, candy corn, pastel pink skulls, and black kittens arranged artistically across the white background. Pastel spooky kawaii style. CRITICAL: Pure solid white background (#FFFFFF). High resolution.`
  },
  ...Array.from({ length: 20 }, (_, i) => {
    const num = i + 1;
    const items = [
      { name: '아이스 펌킨라떼를 든 꼬마 유령', desc: '버블티 빨대를 물고 있는 초인기 꼬마 유령', detail: 'standalone cute white ghost holding an iced pumpkin spice latte cup with a green straw and whipped cream' },
      { name: '미니 잭오랜턴 삼형제', desc: '웃고 있는 주황색, 분홍색, 크림색 미니 호박들', detail: 'standalone trio of cute smiling mini pumpkins in orange, pastel pink, and creamy white colors' },
      { name: '별무늬 마녀 모자와 보라색 리본', desc: '우아하고 깜찍한 마녀의 뾰족한 삼각 모자', detail: 'standalone cute purple witch hat adorned with yellow stars and an oversized pink bow' },
      { name: '삼색 캔디콘(Candy Corn) 묶음', desc: '노랑, 주황, 하양 달콤한 할로윈 대표 사탕', detail: 'standalone cute trio of classic Halloween candy corn pieces with smiling happy faces' },
      { name: '파스텔 핑크 해골과 꽃 장식', desc: '장미꽃을 머리에 꽂은 사랑스러운 핑크 해골', detail: 'standalone cute pastel blush pink human skull adorned with blooming mint and pink roses' },
      { name: '마녀의 리본 빗자루', desc: '분홍 리본이 묶인 귀여운 짚 빗자루', detail: 'standalone cute flying witch broomstick tied with a flowing pastel ribbon and gold star sparkles' },
      { name: '호박 모자 쓴 아기 검은 고양이', desc: '머리에 미니 호박 껍질을 얹은 아기 흑고양이', detail: 'standalone adorable chubby black kitten wearing a carved pumpkin cap and smiling cutely' },
      { name: '보라색 마법 물약 플라스크', desc: '하트 모양 거품이 피어오르는 신비한 물약병', detail: 'standalone glowing purple magic potion bottle with heart-shaped sparkles floating out' },
      { name: '날개 달린 아기 박쥐', desc: '커다란 눈망울의 보라색 털뭉치 아기 박쥐', detail: 'standalone cute fluffy baby bat with wide cute eyes and spread leathery purple wings' },
      { name: '할로윈 롤리팝 사탕 듀오', desc: '소용돌이 무늬 주황색과 보라색 막대사탕', detail: 'standalone pair of swirled orange and purple Halloween lollipop candies tied with black bows' },
      { name: '호박 사탕 바구니', desc: '사탕이 흘러넘치는 주황색 호박 플라스틱 통', detail: 'standalone classic orange pumpkin trick-or-treat bucket overflowing with wrapped candies' },
      { name: '핑크 리본 거미줄', desc: '가운데 앙증맞은 핑크 리본이 달린 은빛 거미줄', detail: 'standalone delicate silver spiderweb centered with a cute pink bow and dewdrops' },
      { name: '깜찍한 붕대 미라', desc: '눈만 빼꼼 내민 앙증맞은 아기 미라 캐릭터', detail: 'standalone cute chibi baby mummy wrapped in cream bandages giving a happy thumbs up' },
      { name: '할로윈 컵케이크', desc: '유령 모양 머랭이 얹힌 보라색 컵케이크', detail: 'standalone delicious chocolate Halloween cupcake topped with a swirled ghost meringue' },
      { name: '초승달과 박쥐 실루엣', desc: '노란 초승달 주위를 맴도는 귀여운 미니 박쥐들', detail: 'standalone bright yellow crescent moon with cute tiny bats fluttering around it' },
      { name: '마법서(Grimoire)와 깃펜', desc: '황금 잠금쇠가 달린 두꺼운 마법 주문서', detail: 'standalone vintage leather-bound magic spell book with golden moon engraving and a feather quill' },
      { name: '으스스한 눈알 사탕 젤리', desc: '귀엽게 윙크하는 팝한 컬러의 눈알 젤리 2개', detail: 'standalone pair of playful cute eyeball candies with pastel iris colors' },
      { name: '호박 파이 조각과 유령 크림', desc: '유령 모양 휘핑크림이 얹힌 따끈한 호박 파이', detail: 'standalone slice of spiced pumpkin pie topped with whipped cream shaped like a mini ghost' },
      { name: '할로윈 박쥐 날개 머리띠', desc: '파티용 귀여운 보라색 박쥐 날개 헤어밴드', detail: 'standalone cute wearable Halloween headband with bouncy purple bat wings' },
      { name: '해골 뼈다귀 크로스', desc: '파스텔 핑크 리본으로 묶인 귀여운 뼈다귀 2개', detail: 'standalone crossed cartoon skeleton bones tied together with a cute pastel ribbon' }
    ][i];

    return {
      id: `halloween-standalone-20-pack-${num}`,
      name: `🎃 [할로윈 단일 ${num}/20] ${items.name}`,
      animal: 'Halloween Standalone 20 Pack',
      animalValue: '',
      affinityObject: items.name,
      theme: 'Halloween Standalone 20 Pack',
      phrase: '',
      description: items.desc,
      prompt: `A cute die-cut sticker design featuring a standalone Halloween item: ${items.detail}. Pastel spooky kawaii aesthetic (orange, lavender, mint, blush). STRICT NO GLASS CONTAINER RULE: Pure standalone die-cut object, crisp white border. ${SEASONAL_RULES_NO_TEXT}`
    };
  }) as unknown as StickerPreset[]
];

// ==========================================
// 3. 🦃 THANKSGIVING & COZY AUTUMN SERIES
// ==========================================
export const THANKSGIVING_20_SERIES: StickerPreset[] = [
  {
    id: 'thanksgiving-20-pack-cover',
    name: '🖼️ [마스터 썸네일] 추수감사절 코지 어텀 20종 스티커 팩 대표 커버 표지',
    animal: 'Thanksgiving Cozy Fall Cover',
    animalValue: '',
    affinityObject: 'Thanksgiving Autumn Terrariums',
    theme: 'Thanksgiving 20 Pack Cover',
    phrase: '',
    description: 'Etsy 판매용 20종 추수감사절 코지 어텀 스티커 팩 마스터 대표 썸네일 커버 표지 그래픽',
    prompt: `A professional Etsy digital sticker bundle master cover graphic illustration on a pure solid white background (#FFFFFF). Centered cute bold pink script typography reading "20+ CUTE FALL HARVEST STICKER BUNDLE". Below title reads "PNG DIGITAL DOWNLOAD" in a stylish warm terracotta ribbon banner. Surrounding the text are cute die-cut sticker samples of wooden base glass jars with autumn leaves, pumpkin cloches, and cozy forest terrariums along with standalone pumpkin spice latte mugs, pecan pies, maple leaves, and acorns arranged artistically across the white background. Cozy warm aesthetic. CRITICAL: Pure solid white background (#FFFFFF). High resolution.`
  },
  ...Array.from({ length: 20 }, (_, i) => {
    const num = i + 1;
    const items = [
      { name: '단풍잎과 솔방울 우드 베이스 유리병', desc: '붉은 단풍과 솔방울이 가득 담긴 우드 뚜껑 유리병', detail: 'clear glass cylinder vase on a rustic wood base, filled with vibrant golden maple leaves, acorns, and pinecones' },
      { name: '호박과 담요 오두막 유리 돔', desc: '체크무늬 니트 담요와 호박이 든 미니 오두막 돔', detail: 'glass bell jar dome enclosing a miniature wooden log cabin with a knit blanket draped on porch and mini pumpkins' },
      { name: '허수아비와 가을 밭 테라리움', desc: '황금빛 벼 이삭과 귀여운 아기 허수아비 테라리움', detail: 'wide glass bowl terrarium with a miniature friendly scarecrow standing amidst wheat stalks and autumn moss' },
      { name: '빨간 사과 바구니 메이슨 저', desc: '수확한 사과와 시나몬 스틱이 든 메이슨 저', detail: 'vintage mason jar filled with a miniature woven basket of red apples, cinnamon sticks, and dried orange slices' },
      { name: '단풍 숲속 다람쥐 피규어 테라리움', desc: '도토리를 꼭 쥔 다람쥐가 사는 가을 숲 테라리움', detail: 'glass jar terrarium featuring a cute chubby baby squirrel holding a shiny acorn on orange autumn leaves' },
      { name: '화이트 펌킨 & 유칼립투스 돔', desc: '고급스러운 화이트 호박과 유칼립투스 잎 유리 돔', detail: 'glass cloche dome containing an elegant trio of white heirloom pumpkins with sage green eucalyptus leaves' },
      { name: '가을 피크닉 바구니 메이슨 저', desc: '따뜻한 보온병과 샌드위치가 든 가을 나들이 병', detail: 'clear mason jar terrarium with a miniature plaid picnic blanket and tiny thermos in a fall park' },
      { name: '모닥불과 마시멜로 캠핑 테라리움', desc: '타오르는 모닥불과 통나무 의자가 놓인 테라리움', detail: 'geometric glass terrarium featuring a cozy miniature campfire with glowing embers and wooden log seats' },
      { name: '호박 파이 베이킹 키친 돔', desc: '밀가루 반죽과 갓 구운 파이가 놓인 주방 돔', detail: 'glass display dome featuring a miniature rustic kitchen counter with a freshly baked pumpkin pie' },
      { name: '가을 들꽃과 벼 이삭 화병 테라리움', desc: '코스모스와 억새 풀이 가득한 유리 화병', detail: 'clear glass vase filled with miniature dried autumn grasses, pampas, and orange wildflowers' },
      { name: '아기 고슴도치와 낙엽 침대 유리병', desc: '낙엽 속에 폭 파묻힌 귀여운 아기 고슴도치', detail: 'glass bowl terrarium with an adorable tiny hedgehog nestled in a bed of red and gold oak leaves' },
      { name: '가을 우체통과 편지 메이슨 저', desc: '낙엽 흩날리는 우체통에 꽂힌 감사 편지 병', detail: 'mason jar containing a rustic miniature postal mailbox surrounded by falling leaves and cozy acorns' },
      { name: '빈티지 북스택과 안경 윈터 가을 돔', desc: '두꺼운 고서와 커피잔이 놓인 가을 독서 돔', detail: 'glass bell jar dome with a miniature stack of leather books, reading glasses, and a steaming coffee mug' },
      { name: '수확의 풍요 옥수수 메이슨 저', desc: '알록달록 인디언 콘과 해바라기가 든 메이슨 저', detail: 'vintage glass jar filled with miniature colorful flint corn cobs and bright yellow sunflowers' },
      { name: '가을 숲 버섯 균사 테라리움', desc: '이끼 언덕 위 갈색 갓 버섯들이 옹기종기 모인 병', detail: 'clear glass jar terrarium with realistic brown woodland mushrooms sprouting from moist forest moss' },
      { name: '따뜻한 랜턴 속 가을 산책로', desc: '가로등 불빛 아래 낙엽 징검다리 테라리움', detail: 'black vintage lantern terrarium with a tiny lit streetlamp standing over a stone autumn leaf pathway' },
      { name: '칠면조 가족 피규어 유리 돔', desc: '화려한 깃털을 뽐내는 친근한 아기 칠면조 돔', detail: 'glass cloche dome featuring a friendly cartoon baby turkey with colorful plumage on green moss' },
      { name: '가을 사과 과수원 사다리 테라리움', desc: '미니 목재 사다리와 사과 상자가 든 유리병', detail: 'glass jar terrarium with a miniature orchard wooden ladder resting against an apple-laden branch' },
      { name: '따뜻한 모헤어 털실 바구니 병', desc: '겨울을 준비하는 따스한 털실 뭉치 테라리움', detail: 'cork-topped glass jar filled with cozy earthy-toned yarn balls and miniature wooden knitting needles' },
      { name: '황금빛 노을 들판 스노우볼', desc: '황금빛 글리터가 흩날리는 추수감사절 스노우볼', detail: 'crystal snowglobe filled with floating golden glitter flakes over a warm sunset autumn field' }
    ][i];

    return {
      id: `thanksgiving-20-pack-${num}`,
      name: `🦃 [추수감사절 ${num}/20] ${items.name}`,
      animal: 'Thanksgiving 20 Pack',
      animalValue: '',
      affinityObject: items.name,
      theme: 'Thanksgiving 20 Pack',
      phrase: '',
      description: items.desc,
      prompt: `A cute die-cut sticker design featuring: ${items.detail}. Cozy autumn harvest color palette (warm mustard yellow, burnt orange, terracotta, rustic brown, sage green). Clear glass container, thick white die-cut border. ${SEASONAL_RULES_NO_TEXT}`
    };
  }) as unknown as StickerPreset[]
];

export const THANKSGIVING_STANDALONE_20_SERIES: StickerPreset[] = [
  {
    id: 'thanksgiving-standalone-20-pack-cover',
    name: '🖼️ [마스터 썸네일] 추수감사절 단독 오브젝트 20종 스티커 팩 대표 커버 표지',
    animal: 'Thanksgiving Standalone Cover',
    animalValue: '',
    affinityObject: 'Thanksgiving Clipart Objects',
    theme: 'Thanksgiving Standalone 20 Pack Cover',
    phrase: '',
    description: 'Etsy 판매용 20종 추수감사절 단독 데코 오브젝트 스티커 팩 마스터 대표 썸네일 커버 표지 그래픽',
    prompt: `A professional Etsy digital sticker bundle master cover graphic illustration on a pure solid white background (#FFFFFF). Centered cute bold pink script typography reading "20+ CUTE FALL HARVEST CLIPART BUNDLE". Below title reads "PNG DIGITAL DOWNLOAD" in a stylish warm terracotta ribbon banner. Surrounding the text are large individual standalone die-cut sticker samples of pumpkin spice latte mugs with cinnamon, baked pecan pie slices, colorful maple leaves, acorns, cozy knit sweaters, white pumpkins, and baby turkeys arranged artistically across the white background. Warm cozy aesthetic. CRITICAL: Pure solid white background (#FFFFFF). High resolution.`
  },
  ...Array.from({ length: 20 }, (_, i) => {
    const num = i + 1;
    const items = [
      { name: '펌킨 스파이스 라떼(PSL)와 시나몬', desc: '휘핑크림과 시나몬 가루가 듬뿍 올라간 가을 라떼', detail: 'standalone cozy ceramic mug filled with pumpkin spice latte, tall whipped cream, cinnamon dust, and cinnamon stick' },
      { name: '따끈따끈 호박 파이 한 조각', desc: '바삭한 크러스트와 부드러운 호박 필링 파이', detail: 'standalone delicious slice of classic spiced pumpkin pie with a dollop of fresh white whipped cream' },
      { name: '고소한 피칸 파이 한 조각', desc: '통 피칸이 듬뿍 올라간 달콤한 추수감사절 파이', detail: 'standalone mouth-watering slice of southern pecan pie with glossy glazed whole pecans' },
      { name: '알록달록 단풍잎(메이플 리프) 묶음', desc: '붉은색, 주황색, 노란색 가을 단풍잎 다발', detail: 'standalone vibrant trio of crisp autumn maple leaves in rich red, golden yellow, and burnt orange' },
      { name: '도토리(Acorn)와 참나무 잎 듀오', desc: '광택 나는 귀여운 도토리 2개와 오크 리프', detail: 'standalone pair of shiny brown acorns with textured caps and golden oak leaves' },
      { name: '포근한 오버사이즈 털실 스웨터', desc: '가을 감성 머스터드 옐로우 니트 스웨터', detail: 'standalone cute cozy oversized cable-knit sweater in warm mustard yellow color' },
      { name: '화이트 헤어룸 펌킨', desc: '우아한 아이보리 화이트 품종의 미니 호박', detail: 'standalone elegant ivory white fairytale pumpkin with a curly natural stem' },
      { name: '클래식 주황 줄무늬 호박', desc: '통통하고 복스러운 가을 수확 호박', detail: 'standalone plump round bright orange harvest pumpkin with a rustic brown stem' },
      { name: '귀여운 아기 칠면조(Turkey) 캐릭터', desc: '단풍잎 날개를 펼친 사랑스러운 아기 칠면조', detail: 'standalone cute smiling chibi baby turkey with colorful autumn leaf plumage' },
      { name: '따뜻한 체크무늬 가을 머플러', desc: '타탄 체크무늬의 따뜻한 숄 머플러', detail: 'standalone folded warm plaid tartan scarf in red, orange, and navy tones' },
      { name: '수확한 붉은 사과 바구니', desc: '싱싱한 빨간 가을 사과가 담긴 버들 바구니', detail: 'standalone rustic woven basket brimming with ripe shiny red gala apples' },
      { name: '구운 옥수수와 버터 조각', desc: '노릇노릇 구워진 옥수수와 녹아내리는 버터', detail: 'standalone grilled golden sweet corn on the cob with a melting square of butter' },
      { name: '가을 해바라기 꽃송이', desc: '만개한 풍성한 가을 해바라기 한 송이', detail: 'standalone vibrant blooming golden sunflower with dark seeds and green leaves' },
      { name: '숲속 솔방울(Pinecone) 듀오', desc: '자연의 결이 살아있는 포근한 솔방울 2개', detail: 'standalone pair of natural brown pinecones with delicate autumn pine needle accents' },
      { name: '따뜻한 모락모락 사과 사이다(Cider)', desc: '사과 슬라이스가 띄워진 따뜻한 머그잔', detail: 'standalone clear glass mug of warm spiced apple cider with an orange slice and star anise' },
      { name: '체크무늬 보온병과 머그', desc: '가을 나들이용 빈티지 보온병 세트', detail: 'standalone vintage plaid thermos bottle with a small matching steaming cup' },
      { name: '가을 숲 야생 버섯 듀오', desc: '이끼 위 귀여운 갈색 숲속 버섯 2송이', detail: 'standalone pair of cute woodland brown mushrooms growing from a small clump of moss' },
      { name: '밀짚모자 쓴 가을 허수아비 얼굴', desc: '해바라기가 꽂힌 친절한 미소의 허수아비', detail: 'standalone smiling scarecrow head wearing a burlap straw hat with a sunflower' },
      { name: '가을 낙엽 담은 빨간 고무장화', desc: '낙엽이 꽂혀 있는 감성적인 웰링턴 부츠', detail: 'standalone pair of cute red rain boots filled with a bouquet of colorful autumn leaves' },
      { name: '추수감사절 감사 칠면조 깃털 펜', desc: '빈티지 잉크병과 단풍 무늬 깃털 펜', detail: 'standalone antique brown ink bottle with an elegant spotted turkey quill pen' }
    ][i];

    return {
      id: `thanksgiving-standalone-20-pack-${num}`,
      name: `🦃 [추수감사절 단일 ${num}/20] ${items.name}`,
      animal: 'Thanksgiving Standalone 20 Pack',
      animalValue: '',
      affinityObject: items.name,
      theme: 'Thanksgiving Standalone 20 Pack',
      phrase: '',
      description: items.desc,
      prompt: `A cute die-cut sticker design featuring a standalone autumn item: ${items.detail}. Warm cozy fall harvest aesthetic (terracotta, mustard, rustic brown, olive). STRICT NO GLASS CONTAINER RULE: Pure standalone die-cut object, crisp white border. ${SEASONAL_RULES_NO_TEXT}`
    };
  }) as unknown as StickerPreset[]
];


// ==========================================
// 4. 💖 VALENTINE'S DAY & PINK LOVE SERIES (Feb 14)
// ==========================================
export const VALENTINES_20_SERIES: StickerPreset[] = createSeasonalVesselSeries(
  'valentines',
  '발렌타인',
  'Valentine Pink Love Jars',
  'Etsy 판매용 20종 발렌타인데이 핑크 하트 유리병 스티커 팩 마스터 대표 썸네일 커버',
  'A professional Etsy digital sticker bundle master cover graphic illustration on a pure solid white background (#FFFFFF). Centered cute bold pink script typography reading "20+ CUTE VALENTINE STICKER BUNDLE". Below title reads "PNG DIGITAL DOWNLOAD" in a stylish blue ribbon banner. Surrounding text are large cute die-cut sticker samples of glass heart jars, pink potion bottles, rose bell jars with baby kittens, chocolate fondue glasses, and strawberries arranged artistically across white background. CRITICAL: Pure solid white background (#FFFFFF). High resolution.',
  [
    { name: '하트 솜사탕 메이슨저 속 아기 고양이', desc: '분홍빛 솜사탕 구름과 아기 고양이가 든 하트 메이슨저', detail: 'spherical glass jar filled with pastel pink cotton candy clouds and an adorable fluffy baby kitten wearing a pink heart collar' },
    { name: '핑크 러브 포션 마법 물약병', desc: '영롱한 핑크빛 액체와 장미 꽃잎이 든 빈티지 물약병', detail: 'vintage apothecary potion glass bottle filled with shimmering pastel pink potion, floating rose petals, and a cork stopper' },
    { name: '붉은 장미 벨자 속 아기 토끼', desc: '활짝 핀 핑크 장미 덤불 아래 웅크린 아기 토끼', detail: 'clear glass bell jar dome enclosing a miniature blooming pink rose bush with a baby bunny snuggled under soft petals' },
    { name: '딸기 보바 밀크티 유리잔 속 햄스터', desc: '딸기 보바와 핑크 빨대를 잡고 있는 햄스터', detail: 'tall glass tumbler filled with strawberry boba milk tea, tapioca pearls, and a tiny dwarf hamster holding a striped straw' },
    { name: '큐피드 날개 벨자 속 아기 사슴', desc: '작은 황금 날개를 달고 구름 위에 앉은 아기 사슴', detail: 'curved glass cloche containing a baby fawn with miniature golden cupid wings resting on fluffy white cloud bedding' },
    { name: '러브레터 실링 미니 보틀', desc: '빨간 리본으로 묶인 작은 사랑의 편지가 든 유리병', detail: 'corked apothecary bottle containing miniature rolled love notes tied with delicate red ribbon and gold wax seal' },
    { name: '초콜릿 퐁듀 잔 속 아기 펭귄', desc: '달콤한 초콜릿 퐁듀 잔에 딸기를 찍는 아기 펭귄', detail: 'stemmed glass bowl filled with rich melted milk chocolate fondue and a baby penguin dipping a fresh strawberry' },
    { name: '하트 크리스탈 스노우볼', desc: '하트 글리터와 별빛이 소용돌이치는 스노우볼', detail: 'faceted crystal snowglobe with swirling holographic pink heart confetti and glowing golden sparkles' },
    { name: '핑크 튤립 화병 속 아기 오리', desc: '생화 튤립 꽃송이 모자를 쓴 아기 오리 화병', detail: 'clear bulbous glass vase with fresh blooming pink tulips and an adorable baby duckling wearing a tulip petal hat' },
    { name: '벚꽃 테라리움 속 레서판다', desc: '연분홍 벚꽃 가지를 안고 있는 아기 레서판다', detail: 'wide glass bowl terrarium with miniature cherry blossom branches and baby red panda holding a pink heart macaron' },
    { name: '하트 롤리팝 사탕 단지', desc: '알록달록 파스텔 하트 막대사탕이 가득 찬 사탕병', detail: 'vintage glass candy jar stacked with swirled pastel pink, red, and white heart lollipops' },
    { name: '핑크 글리터 메이슨저 속 골든 강아지', desc: '폭신한 빨간 하트 쿠션을 안고 있는 강아지', detail: 'sparkling glass mason jar with a baby golden retriever puppy hugging a plush red velvet heart pillow' },
    { name: '딸기 쇼트케이크 디저트 돔', desc: '생크림과 딸기가 얹힌 미니 조각 케이크 돔', detail: 'cake stand glass dome enclosing a cute miniature slice of strawberry shortcake with whipped cream and cherries' },
    { name: '로맨틱 캔들 램프 저', desc: '장미꽃잎과 함께 따뜻한 촛불이 켜진 캔들 홀더', detail: 'decorative glass lantern jar with a soft glowing pink votive candle surrounded by dried rosebuds and lavender' },
    { name: '하트 자물쇠와 열쇠 앤틱병', desc: '황금빛 빈티지 하트 자물쇠가 보관된 앤틱 유리병', detail: 'antique apothecary glass bottle enclosing a vintage ornate brass heart padlock and delicate matching key' },
    { name: '핑크 오로라 스노우볼 속 북극곰', desc: '핑크빛 오로라 하늘 아래 아기 북극곰 스노우볼', detail: 'crystal snowglobe featuring a baby polar bear looking up at a shimmering pastel pink and violet aurora sky' },
    { name: '마카롱 타워 디스플레이 돔', desc: '파스텔톤 마카롱이 층층이 쌓인 미니 디저트 돔', detail: 'glass display dome containing a miniature pastel rainbow macaron tower decorated with edible sugar pearls' },
    { name: '장미꽃잎 온천 볼 속 카피바라', desc: '따뜻한 장미 꽃잎 물에 몸을 담근 카피바라', detail: 'shallow glass bowl terrarium with warm rosewater bath and a relaxed baby capybara with a pink rose on its head' },
    { name: '큐피드 하프와 음표 보틀', desc: '황금 하프와 핑크빛 음표가 둥둥 떠 있는 유리병', detail: 'slender glass bottle with a miniature golden harp and floating pink glowing musical notes' },
    { name: '꿀단지 속 아기 흑곰', desc: '하트 모양 벌집 꿀을 맛있게 안고 있는 아기 곰', detail: 'clear glass honey pot filled with golden sweet honey and a fluffy baby bear holding a heart-shaped honeycomb' }
  ]
);

export const VALENTINES_STANDALONE_20_SERIES: StickerPreset[] = createSeasonalStandaloneSeries(
  'valentines',
  '발렌타인',
  'Valentine Clipart Objects',
  'Etsy 판매용 20종 발렌타인데이 단독 데코 오브젝트 스티커 팩 마스터 대표 썸네일 커버',
  'A professional Etsy digital sticker bundle master cover graphic illustration on a pure solid white background (#FFFFFF). Centered cute bold pink script typography reading "20+ CUTE VALENTINE CLIPART BUNDLE". Below title reads "PNG DIGITAL DOWNLOAD" in a stylish blue ribbon banner. Surrounding text are large standalone die-cut sticker samples of pink heart balloons, chocolate gift boxes, cupid bows, dipped strawberries, love letters, and rose bouquets arranged artistically. STRICT NO GLASS TANKS: Pure standalone die-cut festive objects only. CRITICAL: Pure solid white background (#FFFFFF). High resolution.',
  [
    { name: '핑크 하트 풍선 다발', desc: '반짝이는 유광 핑크와 레드 하트 풍선 묶음', detail: 'bundle of glossy metallic pastel pink and crimson heart-shaped balloons tied with curled silk ribbons' },
    { name: '리본 묶인 하트 상자 초콜릿', desc: '고급스러운 초콜릿 트러플이 담긴 하트 선물 상자', detail: 'luxury heart-shaped red velvet chocolate gift box filled with assorted truffles and tied with a gold satin bow' },
    { name: '큐피드의 황금 활과 하트 화살', desc: '핑크 보석 촉이 달린 큐피드의 황금빛 활과 화살', detail: 'ornate golden cupid bow and arrow with a glowing pink crystal heart tip' },
    { name: '초콜릿 퐁듀 딸기 꼬치', desc: '다크 초콜릿에 퐁당 담근 싱싱한 딸기 꼬치', detail: 'fresh juicy red strawberry half-dipped in rich dark chocolate with white chocolate drizzle on a skewer' },
    { name: '실링 왁스 빈티지 러브레터', desc: '빨간 하트 왁스로 봉인된 빈티지 연애 편지 봉투', detail: 'vintage cream envelope sealed with a red wax stamp imprinted with a romantic heart symbol' },
    { name: '사랑스러운 핑크 실크 리본', desc: '부드럽게 늘어뜨려진 파스텔 핑크 실크 리본 보우', detail: 'large elegant pastel pink silk ribbon bow with flowing curly ribbon tails' },
    { name: '황금 하트 자물쇠와 열쇠', desc: '사랑을 맹세하는 클래식 빈티지 하트 자물쇠', detail: 'antique golden heart-shaped padlock with an ornate vintage matching skeleton key' },
    { name: '딸기 크림 컵케이크와 하트 픽', desc: '딸기 프로스팅과 하트 사탕이 꽂힌 컵케이크', detail: 'fluffy vanilla cupcake with a swirl of pink strawberry frosting and a red sugar heart topper' },
    { name: '핑크 튤립 꽃다발', desc: '크래프트 종이에 감싸인 싱그러운 분홍 튤립 다발', detail: 'fresh bouquet of blooming soft pink and white tulips wrapped in brown kraft paper with twine bow' },
    { name: '하트 라떼 아트 머그잔', desc: '핑크 머그잔 위 사랑스러운 하트 우유 거품 아트', detail: 'pastel pink ceramic mug viewed from top with delicate heart-shaped latte foam art' },
    { name: '스위트하트 파스텔 캔디 세트', desc: '달콤한 사랑 문구가 새겨진 캔디 하트 삼총사', detail: 'trio of pastel pink, mint, and yellow candy conversation hearts stamped with sweet lettering' },
    { name: '딸기 프렌치 마카롱 듀오', desc: '딸기 버터크림이 샌드된 바삭한 마카롱 두 개', detail: 'pair of French pastel pink macarons filled with luscious strawberry cream and edible gold flakes' },
    { name: '붉은 장미 한 송이와 이슬방울', desc: '벨벳 질감의 붉은 장미 꽃송이와 영롱한 물방울', detail: 'single velvety red rose blossom with green leaves and delicate sparkling dew drops on petals' },
    { name: '하트 와플과 휘핑크림', desc: '딸기와 블루베리가 곁들여진 하트 모양 와플', detail: 'crispy golden heart-shaped waffle topped with whipped cream, fresh raspberries, and maple drizzle' },
    { name: '사랑의 묘약 핑크 향수병', desc: '하트 펜던트가 달린 클래식 앤틱 향수 분무기', detail: 'vintage ornate glass perfume atomizer bottle with pink squeeze bulb and heart pendant' },
    { name: '날개 달린 하트 크리스탈', desc: '하얀 천사 날개가 달린 투명한 핑크 하트 보석', detail: 'faceted pastel pink gemstone heart with delicate feathered white angel wings' },
    { name: '딸기 글레이즈 도넛', desc: '달콤한 딸기 아이싱과 무지개 스프링클 도넛', detail: 'soft baked donut dipped in shiny strawberry pink glaze with colorful rainbow sprinkles' },
    { name: '하트 솜사탕 콘', desc: '사랑스러운 하트 모양으로 빚어진 솜사탕', detail: 'fluffy cloud of pastel pink and blue spun sugar cotton candy shaped like a heart on a striped paper cone' },
    { name: '핑크 진주 조개 목걸이', desc: '입을 벌린 조개 속 영롱한 핑크 진주와 하트 참', detail: 'open pastel sea shell revealing a luminous pink pearl and tiny gold heart charm' },
    { name: '큐피드 별빛 요술봉', desc: '핑크 하트 보석과 리본이 묶인 마법 요술봉', detail: 'magical golden wand topped with a glowing pink crystal heart and sparkling star ribbons' }
  ]
);

// ==========================================
// 5. ☘️ ST. PATRICK'S DAY & LUCKY CLOVER SERIES (Mar 17)
// ==========================================
export const STPATRICK_20_SERIES: StickerPreset[] = createSeasonalVesselSeries(
  'stpatrick',
  '성패트릭',
  'St. Patrick Lucky Clover Jars',
  'Etsy 판매용 20종 성 패트릭의 날 에메랄드 클로버 테라리움 스티커 팩 마스터 대표 썸네일 커버',
  'A professional Etsy digital sticker bundle master cover graphic illustration on a pure solid white background (#FFFFFF). Centered cute bold emerald script typography reading "20+ CUTE ST. PATRICK STICKER BUNDLE". Below title reads "PNG DIGITAL DOWNLOAD" in a stylish blue ribbon banner. Surrounding text are large cute die-cut sticker samples of clover terrariums, leprechaun cauldrons of gold, corgis in moss domes, rainbow bottles, and emerald fairies arranged artistically. CRITICAL: Pure solid white background (#FFFFFF). High resolution.',
  [
    { name: '황금 가마솥 속 레프러콘 고양이', desc: '황금 동전이 넘쳐흐르는 솥 속 모자 쓴 고양이', detail: 'black cast iron cauldron overflowing with shiny golden coins and a cute ginger kitten wearing an emerald green leprechaun hat' },
    { name: '네잎클로버 메이슨저 속 아기 오리', desc: '싱싱한 클로버와 초록 리본을 맨 아기 오리', detail: 'vintage mason jar packed with fresh four-leaf clovers and a baby duckling wearing an emerald green bow tie' },
    { name: '에메랄드 이끼 벨자 속 웰시코기', desc: '초록빛 요정 숲 이끼 돔 속 귀여운 웰시코기', detail: 'clear glass bell jar dome containing lush Irish emerald moss and a happy corgi puppy holding a sparkling shamrock' },
    { name: '무지개 끝 황금 보틀', desc: '병 속으로 무지개가 이어지는 마법의 황금 보틀', detail: 'corked apothecary glass bottle with a miniature vibrant rainbow arching down into a pile of golden nuggets' },
    { name: '아일랜드 요정 연못 테라리움', desc: '돌다리와 작은 수련이 있는 숲속 요정 테라리움', detail: 'wide glass bowl terrarium with emerald moss, tiny stone bridge, gentle stream, and a lucky four-leaf clover patch' },
    { name: '클로버 화환 속 아기 토끼 유리 돔', desc: '클로버 꽃목걸이를 두른 뽀송한 흰 토끼', detail: 'glass display dome enclosing a sweet white baby bunny wearing a braided clover and daisy flower wreath' },
    { name: '초록 요정 날개 메이슨저', desc: '빛나는 초록 요정과 반딧불이가 든 마법 유리병', detail: 'mason jar containing a tiny glowing green woodland fairy with translucent wings surrounded by fireflies' },
    { name: '황금 말굽과 클로버 유리 화병', desc: '행운의 황금 말굽과 네잎클로버가 꽂힌 화병', detail: 'clear cylindrical glass vase featuring an antique golden lucky horseshoe nestled in four-leaf clovers' },
    { name: '에메랄드 크리스탈 스노우볼', desc: '반짝이는 에메랄드 보석 눈꽃이 날리는 스노우볼', detail: 'crystal snowglobe with a miniature Irish thatched cottage surrounded by swirling green and gold glitter' },
    { name: '초록 모자 화분 속 다육이 테라리움', desc: '레프러콘 모자 모양 화분에 심긴 통통한 다육식물', detail: 'green top-hat-shaped glass planter terrarium filled with plump succulent rosettes and gold coins' },
    { name: '아일랜드 하프 미니 벨자', desc: '황금 하프와 음악 요정이 든 섬세한 유리 돔', detail: 'small bell jar enclosing an ornate miniature golden Irish Celtic harp resting on soft clover velvet' },
    { name: '기네스잔 거품 속 햄스터', desc: '포근한 크림 거품 잔 위에 올라앉은 꼬마 햄스터', detail: 'stout glass goblet with creamy frothy foam and a tiny hamster peeking out holding a four-leaf clover' },
    { name: '초록 리본 묶인 보물상자 유리병', desc: '금화와 에메랄드가 가득 찬 미니 보물상자 병', detail: 'wide corked jar containing an open miniature treasure chest filled with gold coins and sparkling emeralds' },
    { name: '레인보우 드롭스 메이슨저', desc: '무지개 빛깔 사탕과 클로버 젤리가 든 캔디저', detail: 'vintage glass jar packed with rainbow swirled rock candy drops and clover-shaped sugar jellies' },
    { name: '초록 버섯 숲 테라리움 속 개구리', desc: '이끼 낀 바위 위에서 쉬고 있는 아기 청개구리', detail: 'spherical glass terrarium with miniature emerald toadstools, mossy bark, and a cute green tree frog on a leaf' },
    { name: '행운의 동전 분수 스노우볼', desc: '금빛 분수가 솟아오르는 신비로운 스노우볼', detail: 'snowglobe featuring a miniature stone wishing well with golden coins tossing up in shimmering green water' },
    { name: '성 패트릭 깃발 픽업트럭 돔', desc: '클로버 화분을 가득 실은 초록 빈티지 트럭 돔', detail: 'glass dome display with a miniature vintage emerald green pickup truck carrying pots of four-leaf clovers' },
    { name: '클로버 차 티포트 속 아기 쥐', desc: '향긋한 허브티 주전자 뚜껑을 빼꼼 연 꼬마 쥐', detail: 'transparent glass teapot filled with green mint tea and an adorable baby mouse sitting on the lid' },
    { name: '초록 맥주잔과 프레첼 테라리움', desc: '축제 분위기의 맥주잔과 미니어처 프레첼 테라리움', detail: 'glass beer stein terrarium featuring miniature salted pretzels and festive green holiday streamers' },
    { name: '황금 무지개 성 스노우볼', desc: '구름 위 황금 성과 찬란한 무지개가 뜬 스노우볼', detail: 'crystal snowglobe with a glowing fairytale castle on clouds crowned by a brilliant rainbow arc' }
  ]
);

export const STPATRICK_STANDALONE_20_SERIES: StickerPreset[] = createSeasonalStandaloneSeries(
  'stpatrick',
  '성패트릭',
  'St. Patrick Clipart Objects',
  'Etsy 판매용 20종 성 패트릭의 날 단독 데코 오브젝트 스티커 팩 마스터 대표 썸네일 커버',
  'A professional Etsy digital sticker bundle master cover graphic illustration on a pure solid white background (#FFFFFF). Centered cute bold emerald script typography reading "20+ CUTE ST. PATRICK CLIPART BUNDLE". Below title reads "PNG DIGITAL DOWNLOAD" in a stylish blue ribbon banner. Surrounding text are large standalone die-cut sticker samples of four-leaf clovers, pots of gold coins, leprechaun hats with buckles, rainbow clouds, lucky horseshoes, and Celtic harps. STRICT NO GLASS TANKS: Pure standalone die-cut festive objects only. CRITICAL: Pure solid white background (#FFFFFF). High resolution.',
  [
    { name: '반짝이는 네잎클로버 가지', desc: '이슬 맺힌 싱그러운 에메랄드 네잎클로버', detail: 'standalone fresh emerald green four-leaf clover stem with delicate dew drops and golden sparkles' },
    { name: '황금 가마솥과 금화 더미', desc: '금화가 가득 흘러넘치는 주물 가마솥', detail: 'standalone black iron leprechaun cauldron overflowing with sparkling minted golden coins' },
    { name: '레프러콘 초록 신사 모자', desc: '황금 버클과 검은 띠가 둘러진 초록 모자', detail: 'standalone vibrant green Irish top hat with a black leather band and shining gold buckle' },
    { name: '무지개와 몽실몽실 구름', desc: '양 끝에 보드라운 구름이 달린 알록달록 무지개', detail: 'standalone bright curved rainbow arch with fluffy white clouds on both ends' },
    { name: '행운의 황금 말굽과 리본', desc: '네잎클로버와 초록 리본이 장식된 황금 말굽', detail: 'standalone lucky shiny golden horseshoe decorated with green clover sprigs and satin ribbon' },
    { name: '아일랜드 황금 하프', desc: '우아한 켈틱 문양이 새겨진 황금빛 아일랜드 하프', detail: 'standalone ornate golden Celtic harp with delicate musical strings and shamrock engravings' },
    { name: '클로버 무늬 초록 맥주잔', desc: '부드러운 하얀 거품이 오른 시원한 초록 맥주잔', detail: 'standalone glass beer mug filled with green holiday ale and thick creamy white foam' },
    { name: '초록 나비넥타이', desc: '클로버 패턴이 들어간 단정한 초록 리본 타이', detail: 'standalone dapper emerald green bowtie patterned with tiny golden four-leaf clovers' },
    { name: '행운의 황금 주화 코인', desc: '양면에 클로버가 양각된 반짝이는 금화', detail: 'standalone gleaming gold coin embossed with a raised four-leaf clover crest' },
    { name: '성 패트릭 컵케이크', desc: '초록색 크림과 금가루가 뿌려진 디저트 컵케이크', detail: 'standalone cupcake with swirled mint green frosting, edible gold glitter, and a shamrock candy pick' },
    { name: '초록 레프러콘 구두와 버클', desc: '앞코가 뾰족하게 올라간 클래식 가죽 구두', detail: 'standalone pair of vintage green leprechaun boots with large golden square buckles' },
    { name: '무지개 롤리팝 사탕', desc: '빙글빙글 무지개 색상이 회오리치는 막대사탕', detail: 'standalone large swirled rainbow lollipop on a wooden stick with a green ribbon bow' },
    { name: '초록 네잎클로버 도넛', desc: '초록 글레이즈와 클로버 스프링클이 뿌려진 도넛', detail: 'standalone baked donut coated in glossy matcha green glaze and gold sugar sprinkles' },
    { name: '아일랜드 국기 하트 배지', desc: '초록-하양-주황 3색으로 채워진 하트 배지', detail: 'standalone cute heart-shaped flag badge with green, white, and orange tricolor stripes' },
    { name: '초록 앤틱 파이프 담뱃대', desc: '클로버 연기가 피어오르는 할아버지 파이프', detail: 'standalone whimsical carved briar pipe puffing out a tiny smoke cloud shaped like a clover' },
    { name: '클로버 화환 머리띠', desc: '싱그러운 풀잎과 꽃으로 엮은 봄맞이 머리띠', detail: 'standalone braided flower crown made of fresh shamrocks, white daisies, and green leaves' },
    { name: '황금 요정 마법 지팡이', desc: '별 모양 클로버가 달린 반짝이는 마법봉', detail: 'standalone magical gold wand topped with a glowing emerald four-leaf clover and floating stars' },
    { name: '에메랄드 보석 반지', desc: '하트 컷팅된 영롱한 초록빛 에메랄드 반지', detail: 'standalone sparkling heart-cut green emerald gemstone set in an ornate golden ring band' },
    { name: '갓 구운 프레첼과 치즈 소스', desc: '노릇노릇 바삭하게 구워진 하트 모양 프레첼', detail: 'standalone warm salted pretzel twisted into a heart shape served with mustard dipping sauce' },
    { name: '행운의 부적 깃발 배너', desc: 'Lucky 문구가 적힌 축제 삼각 깃발 가랜드', detail: 'standalone festive green pennant bunting banner strung with tiny golden bells' }
  ]
);

// ==========================================
// 6. 🌸 EASTER & SPRING BLOSSOM SERIES (Mid-April)
// ==========================================
export const EASTER_20_SERIES: StickerPreset[] = createSeasonalVesselSeries(
  'easter',
  '부활절',
  'Easter Pastel Spring Terrariums',
  'Etsy 판매용 20종 부활절 & 파스텔 스프링 테라리움 스티커 팩 마스터 대표 썸네일 커버',
  'A professional Etsy digital sticker bundle master cover graphic illustration on a pure solid white background (#FFFFFF). Centered cute bold pastel lavender script typography reading "20+ CUTE EASTER STICKER BUNDLE". Below title reads "PNG DIGITAL DOWNLOAD" in a stylish blue ribbon banner. Surrounding text are large cute die-cut sticker samples of pastel egg terrariums, glass greenhouses with bunnies, lavender jars with lambs, chick flowerpots, and spring tulips. CRITICAL: Pure solid white background (#FFFFFF). High resolution.',
  [
    { name: '달걀 모양 테라리움 속 아기 토끼', desc: '투명한 유리 달걀 속 봄 데이지와 아기 토끼', detail: 'egg-shaped clear glass terrarium with pastel moss, blooming daisies, and a fluffy baby bunny curled up asleep' },
    { name: '스프링 온실 속 노란 병아리와 튤립', desc: '작은 온실 속에 활짝 핀 튤립과 아기 병아리', detail: 'miniature glass greenhouse with pink and yellow blooming tulips and a cute fluffy yellow baby chick' },
    { name: '라벤더 메이슨저 속 아기 양', desc: '향긋한 보랏빛 라벤더 꽃밭 속 뽀송한 아기 양', detail: 'vintage mason jar filled with aromatic purple lavender sprigs and a cuddly baby lamb with a floral wreath' },
    { name: '파스텔 에그 바구니 벨자 돔', desc: '무늬 달걀과 꽃이 담긴 봄 소풍 바구니 돔', detail: 'glass display dome enclosing a woven pastel wicker basket overflowing with painted Easter eggs and spring flowers' },
    { name: '당근 텃밭 테라리움 속 다람쥐', desc: '주황빛 미니 당근을 쏙 뽑아든 아기 다람쥐', detail: 'spherical glass bowl terrarium with rich potting soil, tiny sprouting carrots, and a baby squirrel with a carrot' },
    { name: '체리 블라썸 스노우볼 속 아기 사슴', desc: '봄바람에 벚꽃잎이 흩날리는 핑크 스노우볼', detail: 'crystal snowglobe with swirling pink cherry blossom petals around a sweet baby fawn resting on spring grass' },
    { name: '나비 정원 유리 돔 속 아기 고양이', desc: '파스텔 나비를 호기심 가득 바라보는 고양이', detail: 'bell jar dome containing a mini wildflower meadow with fluttering pastel butterflies and an inquisitive kitten' },
    { name: '수선화와 물조리개 테라리움', desc: '노란 수선화와 파스텔 민트색 물조리개', detail: 'wide glass jar terrarium with blooming yellow daffodils and a miniature vintage mint-green watering can' },
    { name: '핑크 제라늄 화병 속 아기 햄스터', desc: '생화 화병 가장자리에 매달린 귀여운 햄스터', detail: 'clear glass vase filled with blooming pink geraniums and a round dwarf hamster peeking over the rim' },
    { name: '버드나무 가지와 새둥지 유리병', desc: '파란 알 세 개가 든 따뜻한 새둥지 유리병', detail: 'tall corked glass bottle containing pussy willow branches and a cozy twig nest with three pastel blue eggs' },
    { name: '프리지아 꽃다발 메이슨저', desc: '향기로운 노란 프리지아가 풍성한 유리병', detail: 'vintage mason jar filled with fresh vibrant yellow freesia blossoms tied with a yellow gingham ribbon' },
    { name: '봄비와 무지개 테라리움', desc: '유리벽에 물방울이 맺히고 무지개가 뜬 테라리움', detail: 'glass bowl terrarium with soft mist droplets on glass, lush green moss, and a tiny rainbow arched over an egg' },
    { name: '달콤한 젤리빈 캔디 머신 돔', desc: '파스텔톤 젤리빈이 가득 찬 미니 캔디 자', detail: 'retro glass candy jar filled with pastel pink, lemon, and lavender jellybeans topped with bunny ears' },
    { name: '아기 오리와 연꽃잎 유리수반', desc: '얕은 물가 연꽃잎 위에서 발장구치는 아기 오리', detail: 'shallow glass bowl with clear water, floating pink lotus blossoms, and a cheerful fluffy duckling' },
    { name: '초콜릿 에그 래핑 디스플레이 돔', desc: '반짝이는 금박으로 감싼 초콜릿 달걀 돔', detail: 'glass cloche dome showcasing an elegant chocolate Easter egg wrapped in pastel foil with silk ribbons' },
    { name: '팬지꽃 화분 테라리움 속 고슴도치', desc: '알록달록 팬지 꽃밭 속 아기 고슴도치', detail: 'spherical glass terrarium filled with purple pansies, tiny mossy rocks, and a smiling baby hedgehog' },
    { name: '딸기 모종 온실 속 흰둥이 강아지', desc: '새빨간 딸기 열매를 바라보는 흰 강아지', detail: 'glass garden dome with a miniature fruiting strawberry plant and a happy white puppy wearing a flower band' },
    { name: '봄 소풍 티파티 찻잔 속 아기 쥐', desc: '꽃잎 찻잔 속에 딸기 케이크를 둔 작은 생쥐', detail: 'fine porcelain teacup under glass with strawberry herbal tea, mini cupcake, and a cute field mouse' },
    { name: '민들레 홀씨 스노우볼', desc: '하얀 민들레 홀씨가 둥실둥실 떠오르는 스노우볼', detail: 'glass snowglobe with a blooming yellow dandelion and floating ethereal white seed parachutes in breeze' },
    { name: '스프링 버니 빌리지 테라리움', desc: '버섯 집과 나무 그네가 있는 토끼 마을 테라리움', detail: 'wide cylindrical glass terrarium featuring miniature mushroom houses, wooden tire swing, and mossy paths' }
  ]
);

export const EASTER_STANDALONE_20_SERIES: StickerPreset[] = createSeasonalStandaloneSeries(
  'easter',
  '부활절',
  'Easter Clipart Objects',
  'Etsy 판매용 20종 부활절 & 봄맞이 단독 데코 오브젝트 스티커 팩 마스터 대표 썸네일 커버',
  'A professional Etsy digital sticker bundle master cover graphic illustration on a pure solid white background (#FFFFFF). Centered cute bold pastel script typography reading "20+ CUTE EASTER CLIPART BUNDLE". Below title reads "PNG DIGITAL DOWNLOAD" in a stylish blue ribbon banner. Surrounding text are large standalone die-cut sticker samples of decorated pastel eggs, bunny ear headbands, fluffy yellow chicks, spring tulips, carrot bunches, and flower baskets. STRICT NO GLASS TANKS: Pure standalone die-cut festive objects only. CRITICAL: Pure solid white background (#FFFFFF). High resolution.',
  [
    { name: '파스텔 스트라이프 부활절 달걀', desc: '분홍, 하늘색 줄무늬와 금박이 칠해진 달걀', detail: 'standalone decorated Easter egg with pastel pink, mint, and lilac stripes with delicate gold leaf stars' },
    { name: '토끼 귀 벨벳 머리띠', desc: '분홍빛 귓속이 사랑스러운 뽀송한 토끼 귀 머리띠', detail: 'standalone cute white fluffy plush bunny ear headband with soft pink inner ears and a daisy accent' },
    { name: '노란 아기 병아리와 꽃모자', desc: '데이지 꽃을 머리에 얹은 포근한 털병아리', detail: 'standalone fluffy yellow baby chick wearing a tiny white daisy flower crown on its head' },
    { name: '스프링 핑크 튤립 꽃송이', desc: '이슬 맺힌 우아한 연분홍 튤립 한 송이', detail: 'standalone single elegant blooming pastel pink tulip blossom with slender green leaves' },
    { name: '리본 묶인 주황 당근 다발', desc: '초록 잎이 싱싱한 달콤한 미니 당근 묶음', detail: 'standalone bunch of 3 sweet bright orange carrots with feathery green tops tied with a jute twine bow' },
    { name: '꽃과 달걀이 담긴 피크닉 바구니', desc: '파스텔 달걀과 들꽃이 풍성한 라탄 바구니', detail: 'standalone woven wicker basket overflowing with colorful painted Easter eggs and wild spring flowers' },
    { name: '초콜릿 토끼 피규어와 리본', desc: '빨간 리본을 맨 밀크 초콜릿 이스터 버니', detail: 'standalone hollow milk chocolate Easter bunny figurine wearing a red silk ribbon with gold bell' },
    { name: '스프링 버터플라이(나비) 페어', desc: '영롱한 파스텔 날개를 펄럭이는 나비 한 쌍', detail: 'standalone pair of fluttering pastel watercolor butterflies in shades of soft peach and sky blue' },
    { name: '부활절 당근 컵케이크', desc: '크림치즈 프로스팅과 미니 설탕 당근 컵케이크', detail: 'standalone spiced carrot cupcake topped with cream cheese frosting swirl and an edible orange sugar carrot' },
    { name: '노란 수선화 꽃송이', desc: '봄을 알리는 화사하고 밝은 노란 수선화', detail: 'standalone cheerful bright yellow daffodil bloom with delicate ruffled trumpet center and green stem' },
    { name: '젤리빈 캔디 더미', desc: '알록달록 파스텔 빛깔의 콩 모양 젤리빈들', detail: 'standalone cheerful scattered pile of glossy pastel rainbow jellybean candies' },
    { name: '토끼 엉덩이 폼폼 꼬리', desc: '뒤돌아 앉은 토끼의 복슬복슬 하얀 꼬리와 발바닥', detail: 'standalone cute fluffy white bunny bum with pink paw pads and round pom-pom cotton tail' },
    { name: '파스텔 민트색 물조리개와 꽃', desc: '꽃가지가 꽂힌 빈티지 미니 철제 물조리개', detail: 'standalone vintage mint green metal watering can stuffed with fresh pink cherry blossoms' },
    { name: '봄맞이 꽃 리스 화환', desc: '데이지와 라벤더, 작은 달걀이 엮인 화관', detail: 'standalone circular spring wreath woven with white daisies, lavender sprigs, and miniature pastel eggs' },
    { name: '스프링 프레시 허니 팟', desc: '꿀봉에서 꿀이 뚝뚝 떨어지는 귀여운 꿀단지', detail: 'standalone ceramic honey pot with wooden dipper drizzling golden honey and a flying bumblebee' },
    { name: '부활절 설탕 쿠키 세트', desc: '토끼와 당근 모양으로 아이싱된 버터 쿠키', detail: 'standalone duo of sugar cookies iced like a cute bunny face and an orange carrot with green top' },
    { name: '데이지 꽃송이 트리오', desc: '하얀 꽃잎과 노란 꽃술이 싱그러운 데이지 세 송이', detail: 'standalone cluster of 3 cheerful white daisy blossoms with sunny yellow centers' },
    { name: '파스텔 버니 도넛', desc: '토끼 귀 초콜릿이 꽂힌 딸기 도넛', detail: 'standalone baked ring donut with strawberry glaze, rainbow pearls, and white chocolate bunny ears' },
    { name: '달걀 껍질 속 아기 새', desc: '알을 깨고 고개를 쏙 내민 솜털 보송한 아기 새', detail: 'standalone hatched pastel blue eggshell with an adorable baby songbird peeking out curiously' },
    { name: '봄바람 풍차 핀휠', desc: '파스텔 무지개 빛깔의 바람개비', detail: 'standalone colorful pastel pinwheel windmill toy on a striped stick with a yellow ribbon' }
  ]
);

// ==========================================
// 7. 💐 MOTHER'S DAY & FLORAL TEACUPS (May)
// ==========================================
export const MOTHERSDAY_20_SERIES: StickerPreset[] = createSeasonalVesselSeries(
  'mothersday',
  '마더스데이',
  'Mother Floral Teacup Jars',
  'Etsy 판매용 20종 마더스데이 플로럴 티컵 & 글라스 스티커 팩 마스터 대표 썸네일 커버',
  'A professional Etsy digital sticker bundle master cover graphic illustration on a pure solid white background (#FFFFFF). Centered cute bold rose gold script typography reading "20+ CUTE MOTHER DAY STICKER BUNDLE". Below title reads "PNG DIGITAL DOWNLOAD" in a stylish blue ribbon banner. Surrounding text are large cute die-cut sticker samples of vintage floral teacups with mama and baby bears, carnation glass jars, peony bell jars, and teapots. CRITICAL: Pure solid white background (#FFFFFF). High resolution.',
  [
    { name: '장미 티컵 속 아기 곰과 엄마 곰', desc: '앤틱 포슬린 티컵 속 서로 꼭 껴안은 곰 모자', detail: 'vintage porcelain teacup with pink rose gilding, containing warm floral tea and mama bear hugging her baby cub' },
    { name: '분홍 카네이션 메이슨저 속 아기 고양이', desc: '카네이션 꽃다발 사이로 미소 짓는 아기 고양이', detail: 'clear mason jar brimming with soft pink and cream carnations and an adorable kitten with a satin bow' },
    { name: '작약 꽃봉오리 벨자 속 아기 사슴', desc: '활짝 핀 분홍 작약 잎사귀 속 곤히 잠든 아기 사슴', detail: 'glass bell jar cloche containing large blooming pink peonies and a sweet spotted baby fawn asleep on moss' },
    { name: '허브 티포트 속 호기심 많은 햄스터', desc: '투명 유리 티포트 주구로 고개를 내민 햄스터', detail: 'clear glass teapot filled with pale rose tea, mint leaves, and a tiny hamster peeking curiously from the lid' },
    { name: '라벤더 보석함 유리병 속 파랑새', desc: '보랏빛 라벤더와 반짝이는 보석이 든 앤틱병', detail: 'ornate faceted glass bottle filled with dried French lavender, crystals, and a miniature singing bluebird' },
    { name: '딸기 쇼트케이크 돔 속 아기 토끼', desc: '달콤한 케이크 옆에서 포크를 든 아기 토끼', detail: 'pedestal cake stand glass dome with a slice of fresh berry shortcake and a fluffy baby bunny' },
    { name: '카모마일 꿀물 잔 속 아기 오리', desc: '달콤한 꿀과 카모마일 꽃잎이 뜬 유리잔 속 오리', detail: 'stemmed glass goblet with golden chamomile tea, floating daisy-like blooms, and a cheerful duckling' },
    { name: '튤립 부케 화병 속 강아지', desc: '파스텔 튤립 화병에 기댄 사랑스러운 푸들 강아지', detail: 'bulbous fluted glass vase filled with pastel peach tulips and an adorable fluffy toy poodle puppy' },
    { name: '엄마 펭귄과 아기 펭귄 스노우볼', desc: '따뜻한 눈꽃 아래 서로의 날개를 맞댄 펭귄 가족', detail: 'crystal snowglobe with gentle floating golden sparkles enclosing a mama penguin shielding her fluffy baby' },
    { name: '빈티지 향수병 테라리움 속 나비', desc: '장미 정원과 레이스 리본이 감긴 향수병 테라리움', detail: 'antique glass perfume atomizer bottle transformed into a miniature terrarium with pink climbing roses' },
    { name: '유칼립투스 미니 저 속 아기 코알라', desc: '상쾌한 유칼립투스 가지를 꼭 쥔 아기 코알라', detail: 'clear cylinder glass jar filled with silver dollar eucalyptus stems and an adorable baby koala' },
    { name: '수국 플라워 볼 테라리움', desc: '파스텔 블루와 핑크 수국 꽃잎이 가득 찬 유리구', detail: 'spherical glass globe terrarium packed with fluffy pastel hydrangea petals and a tiny hummingbird' },
    { name: '하트 찻잔 속 카푸치노 고양이', desc: '하트 모양 찻잔 위 폭신한 거품을 얹은 고양이', detail: 'heart-shaped ceramic and glass cup with cinnamon latte foam and a sleeping calico kitten' },
    { name: '장미꽃 잼 단지 속 다람쥐', desc: '향긋한 장미 잼 단지 뚜껑을 열고 기뻐하는 다람쥐', detail: 'vintage canning glass jar filled with glistening pink rose petal jam and an excited baby squirrel' },
    { name: '마더스데이 선물 상자 벨자', desc: '리본 선물과 보석 브로치가 보관된 유리 돔', detail: 'bell jar display enclosing miniature pastel gift boxes tied with ribbons and a sparkling pearl brooch' },
    { name: '들꽃 메이슨저 속 아기 고슴도치', desc: '노란 버터컵과 들꽃 숲속에 누운 아기 고슴도치', detail: 'rustic mason jar with a wild meadow bouquet of buttercups and daisies with a smiling baby hedgehog' },
    { name: '모녀 백조 호수 스노우볼', desc: '우아한 엄마 백조와 솜털 아기 백조 스노우볼', detail: 'snowglobe featuring a serene mirror lake with an elegant mama swan swimming alongside her cygnet' },
    { name: '핑크 마카롱 돔 속 레서판다', desc: '딸기 마카롱을 두 손으로 꼬옥 쥔 아기 레서판다', detail: 'glass dome on wooden base with a miniature pink macaron stack and an adorable baby red panda' },
    { name: '엄마 품속 아기 수달 유리수반', desc: '배영하는 엄마 수달 배 위에 폭 안긴 아기 수달', detail: 'shallow crystal water bowl with calm ripples and a mama otter floating on back holding her pup' },
    { name: '감사의 편지 롤 보틀', desc: '사랑의 손편지와 장미꽃 한 송이가 담긴 유리병', detail: 'slender glass bottle containing a rolled thank-you parchment tied with satin cord and a single pink rose' }
  ]
);

export const MOTHERSDAY_STANDALONE_20_SERIES: StickerPreset[] = createSeasonalStandaloneSeries(
  'mothersday',
  '마더스데이',
  'Mother Clipart Objects',
  'Etsy 판매용 20종 마더스데이 단독 데코 오브젝트 스티커 팩 마스터 대표 썸네일 커버',
  'A professional Etsy digital sticker bundle master cover graphic illustration on a pure solid white background (#FFFFFF). Centered cute bold script typography reading "20+ CUTE MOTHER DAY CLIPART BUNDLE". Below title reads "PNG DIGITAL DOWNLOAD" in a stylish blue ribbon banner. Surrounding text are large standalone die-cut sticker samples of carnation bouquets, peony blossoms, floral teacups with saucers, gift boxes with ribbons, and love pendants. STRICT NO GLASS TANKS: Pure standalone die-cut festive objects only. CRITICAL: Pure solid white background (#FFFFFF). High resolution.',
  [
    { name: '분홍 카네이션 꽃다발', desc: '크래프트 종이에 감싸인 부드러운 핑크 카네이션 다발', detail: 'standalone bouquet of soft pink ruffled carnation flowers wrapped in rustic kraft paper with silk ribbon' },
    { name: '활짝 핀 핑크 작약 꽃송이', desc: '풍성하고 우아한 겹겹의 연분홍 작약 꽃송이', detail: 'standalone single large blooming blush pink peony blossom with delicate velvety layered petals' },
    { name: '앤틱 로즈 포슬린 찻잔과 받침', desc: '장미 문양과 금장 테두리가 우아한 찻잔 세트', detail: 'standalone vintage porcelain teacup and saucer set with floral rose motifs and gilded gold rim' },
    { name: '리본 묶인 마더스데이 선물 상자', desc: '연보라색 포장지와 분홍 리본으로 장식된 상자', detail: 'standalone luxury gift box wrapped in pastel lavender paper with a large lush pink satin bow' },
    { name: '엄마 사랑 하트 로켓 펜던트', desc: '섬세한 장미 조각이 들어간 황금 하트 목걸이', detail: 'standalone vintage engraved golden heart locket necklace charm suspended from a delicate chain' },
    { name: '핑크 장미 부케 꽃다발', desc: '이슬 맺힌 탐스러운 핑크빛 장미 꽃다발', detail: 'standalone romantic bouquet of fresh pink roses tied with trailing cream lace ribbon' },
    { name: '티백이 담긴 티포트', desc: '향긋한 허브티가 우러나는 파스텔 세라믹 주전자', detail: 'standalone pastel pink ceramic teapot with floral illustrations and a hanging tea tag' },
    { name: '진주 장미 브로치', desc: '은은한 천연 진주와 핑크 에나멜 장미 핀', detail: 'standalone elegant vintage pearl and pink enamel rose brooch pin with gold leaf accents' },
    { name: '하트 모양 라떼 아트 컵', desc: '사랑을 담은 카푸치노 하트 라떼 아트', detail: 'standalone ceramic coffee cup viewed from top with creamy heart-shaped milk foam latte art' },
    { name: '딸기 생크림 조각 케이크', desc: '신선한 딸기와 부드러운 생크림이 겹쳐진 케이크', detail: 'standalone delicious slice of layered strawberry vanilla shortcake with a glazed berry on top' },
    { name: '플로럴 에이프런(앞치마)', desc: '화사한 꽃무늬가 프린팅된 사랑스러운 앞치마', detail: 'standalone cute cottagecore kitchen apron patterned with vintage botanical floral blooms' },
    { name: '스위트 피(Sweet Pea) 꽃가지', desc: '나비처럼 하늘거리는 파스텔 스위트피 꽃송이', detail: 'standalone delicate sprig of blooming pastel lilac and pink sweet pea blossoms' },
    { name: '장미 향수 스프레이 보틀', desc: '핑크빛 유리와 로즈골드 캡이 달린 고급 향수병', detail: 'standalone faceted glass perfume bottle with rose gold cap and pink ribbon accent' },
    { name: '하트 모양 초콜릿 박스', desc: '달콤한 딸기 트러플이 든 하트 초콜릿 상자', detail: 'standalone open heart-shaped box displaying a neat arrangement of pink strawberry truffles' },
    { name: '엄마 최고(Best Mom) 트로피 배지', desc: '월계수 잎과 하트가 새겨진 귀여운 리본 배지', detail: 'standalone cute pastel ribbon rosette award badge embossed with a shining golden heart' },
    { name: '프렌치 마카롱 탑 3개', desc: '바닐라, 로즈, 피스타치오 마카롱 스택', detail: 'standalone neat vertical stack of 3 French macarons in shades of pastel pink, cream, and mint' },
    { name: '레이스 손수건과 꽃자수', desc: '가장자리에 장미꽃 자수가 놓인 하얀 면 손수건', detail: 'standalone folded white linen handkerchief with delicate lace scalloped edges and embroidered rose' },
    { name: '플로럴 슬리퍼 룸슈즈', desc: '포근하고 따뜻한 분홍빛 털실 슬리퍼', detail: 'standalone pair of cozy plush pink bedroom slippers with soft fleece lining and bow accents' },
    { name: '향기로운 라벤더 캔들', desc: '말린 꽃잎이 얹힌 소이 왁스 글라스 캔들', detail: 'standalone warm glowing scented soy candle in a clear glass tumbler with dried botanical petals' },
    { name: '감사 축하 카드와 봉투', desc: '꽃봉오리 스티커가 붙은 편지 봉투와 카드', detail: 'standalone elegant pastel greeting card slipping out of an envelope with floral wax seal' }
  ]
);

// Helper function to pick pack presets
export function getSeasonalPackPresets(seasonId: string): { vesselSeries: StickerPreset[]; standaloneSeries: StickerPreset[] } {
  switch (seasonId) {
    case 'christmas':
      return { vesselSeries: CHRISTMAS_20_SERIES, standaloneSeries: CHRISTMAS_STANDALONE_20_SERIES };
    case 'halloween':
      return { vesselSeries: HALLOWEEN_20_SERIES, standaloneSeries: HALLOWEEN_STANDALONE_20_SERIES };
    case 'thanksgiving':
      return { vesselSeries: THANKSGIVING_20_SERIES, standaloneSeries: THANKSGIVING_STANDALONE_20_SERIES };
    case 'valentines':
      return { vesselSeries: VALENTINES_20_SERIES, standaloneSeries: VALENTINES_STANDALONE_20_SERIES };
    case 'stpatrick':
      return { vesselSeries: STPATRICK_20_SERIES, standaloneSeries: STPATRICK_STANDALONE_20_SERIES };
    case 'easter':
      return { vesselSeries: EASTER_20_SERIES, standaloneSeries: EASTER_STANDALONE_20_SERIES };
    case 'mothersday':
      return { vesselSeries: MOTHERSDAY_20_SERIES, standaloneSeries: MOTHERSDAY_STANDALONE_20_SERIES };
    default:
      // Fallback to Christmas or Thanksgiving
      return { vesselSeries: CHRISTMAS_20_SERIES, standaloneSeries: CHRISTMAS_STANDALONE_20_SERIES };
  }
}

export interface PricingStrategy {
  suggestedPrice: string; // e.g. "$3.80"
  originalPrice: string;  // e.g. "$7.60 (50% 런칭 세일 권장)"
  bundleOffer: string;    // e.g. "홀리데이 3팩 묶음 $9.90"
  targetAudience: string; // 타겟 구매자 틈새
  salesTactics: string[]; // Etsy 실전 판매 전략 3가지
  etsyTags: string[];     // 검색 상위 노출용 추천 13태그
  highlightTip: string;  // 골든타임 마케팅 핵심 팁
}

export interface SeasonalRecommendation {
  seasonId: string;
  title: string;
  subtitle: string;
  icon: string;
  badge: string;
  badgeColor: string;
  timingText: string;
  keySearchTerms: string[];
  bestSellerReason: string;
  pricingStrategy: PricingStrategy;
  vesselSeries: StickerPreset[];
  standaloneSeries: StickerPreset[];
}

/**
 * Get tailored pricing, marketing tactics, and SEO tags for each seasonal sticker holiday.
 */
export function getSeasonalPricingStrategy(holidayId: string, koreanName: string): PricingStrategy {
  switch (holidayId) {
    case 'christmas':
      return {
        suggestedPrice: '$3.80',
        originalPrice: '$7.60 (50% 런칭 세일 권장)',
        bundleOffer: '홀리데이 3팩 묶음 $9.90',
        targetAudience: '연말 다이어리 꾸미기, 크리스마스 선물 라벨, 크리컷 컷팅 유저',
        salesTactics: [
          '정가 $7.60에 50% 세일($3.80)을 적용해 Etsy 검색 결과에서 "Sale" 빨간 뱃지를 획득하세요.',
          '마스터 표지 외에 [iPad 굿노트 서식 적용샷]과 [A4 인쇄 실물 다이컷 컷팅 사진] 목업을 반드시 썸네일에 포함하세요.',
          '크리스마스 2~3주 전에는 "Instant Download / Last Minute Gift" 키워드를 제목 앞에 배치하세요.'
        ],
        etsyTags: [
          'Christmas Stickers', 'Winter Snowglobe', 'Digital Planner PNG', 'Printable Sticker Sheet',
          'Cricut Cut Files', 'Holiday Clipart', 'Cozy Christmas', 'GoodNotes Stickers',
          'Gift Tag Printable', 'Spooky Free Christmas', 'Xmas Scrapbooking', 'A4 Sticker Sheet', 'Cute Xmas Decals'
        ],
        highlightTip: '10~11월에 등록하여 조기 리뷰를 쌓아두면 12월 1~2주 차 연말 폭풍 구매 기간에 일매출 1위를 달성합니다.'
      };
    case 'thanksgiving':
      return {
        suggestedPrice: '$3.40',
        originalPrice: '$6.80 (50% 런칭 세일 권장)',
        bundleOffer: '어텀 하베스트 2팩 묶음 $5.90',
        targetAudience: '가을 코지 다꾸러, 추수감사절 디너 메뉴판 및 파티 라벨러',
        salesTactics: [
          '정가 $6.80에 50% 할인($3.40) 세팅으로 가을 신규 리스팅 전환율 상승.',
          '펌킨 스파이스 라떼, 빈티지 다이어리, 낙엽과 함께 따뜻한 브라운 톤의 플랫레이(Flatlay) 목업 연출 필수.',
          '감사 일기(Gratitude Journal) 작성자를 타겟팅하여 "Gratitude Planner" 태그 조합.'
        ],
        etsyTags: [
          'Thanksgiving Stickers', 'Fall Harvest Clipart', 'Cozy Autumn Planner', 'Printable Sticker Sheet',
          'Pumpkin Clipart', 'Gratitude Journal', 'Autumn Scrapbook', 'Cricut Fall Stickers',
          'Digital Planner PNG', 'Cozy Season Decals', 'Harvest Jar PNG', 'GoodNotes Autumn', 'Cute Turkey Clipart'
        ],
        highlightTip: '미국인들의 라이프스타일 키워드인 "Cozy Autumn"을 제목과 태그 첫머리에 배치하면 노출이 200% 증가합니다.'
      };
    case 'halloween':
      return {
        suggestedPrice: '$3.50',
        originalPrice: '$7.00 (50% 런칭 세일 권장)',
        bundleOffer: '스푸키 파스텔 3팩 묶음 $8.90',
        targetAudience: '미국 10~30대 여성 다꾸러, 할로윈 캔디 백 및 구디백 포장 라벨러',
        salesTactics: [
          '무서운 고어풍 대신 Etsy 대세인 "Spooky Cute(귀여운 유령/파스텔 호박)" 룩앤필 강조.',
          '어린이집/학교 캔디 구디백(Goodie Bag) 원형 라벨 스티커 실물 부착 목업 필수.',
          '10월 첫째 주부터 가격을 유지하면서 "2개 구매 시 추가 20% 할인" 쿠폰 발행.'
        ],
        etsyTags: [
          'Pastel Halloween', 'Spooky Cute Stickers', 'Ghost Clipart PNG', 'Halloween Printable',
          'Goodie Bag Labels', 'Digital Planner PNG', 'Cricut Halloween', 'Cute Pumpkin Decals',
          'Trick or Treat', 'Kawaii Spooky', 'GoodNotes Stickers', 'A4 Halloween Sheet', 'Boba Ghost Sticker'
        ],
        highlightTip: '9월 중순부터 10월 첫째 주까지 학교 및 홈파티 구디백 라벨용 대량 인쇄 수요가 최고조에 달합니다.'
      };
    case 'valentines':
      return {
        suggestedPrice: '$3.60',
        originalPrice: '$7.20 (50% 런칭 세일 권장)',
        bundleOffer: '발렌타인 러브 3팩 묶음 $8.90',
        targetAudience: '커플 다이어리 꾸미기, 발렌타인데이 초콜릿/쿠키 선물 포장 라벨러',
        salesTactics: [
          '정가 $7.20에 50% 세일($3.60)로 연인/친구 선물 준비 시즌 조기 선점.',
          '핑크빛 선물 상자, 리본, 초콜릿 패키지와 함께 찍힌 실물 스티커 라벨 목업 연출.',
          '친구끼리 교환하는 Galentine 트렌드를 겨냥해 "Galentines Gift" 키워드 포함.'
        ],
        etsyTags: [
          'Valentine Stickers', 'Cute Couple Clipart', 'Love Potion PNG', 'Valentine Printable',
          'Pink Aesthetic Decal', 'Galentines Gift', 'Cricut Valentine', 'Digital Planner PNG',
          'Heart Clipart', 'GoodNotes Stickers', 'Romantic Scrapbook', 'A4 Valentine Sheet', 'Sweetheart Stickers'
        ],
        highlightTip: '1월 둘째 주부터 초콜릿/쿠키 베이킹 선물 라벨 및 굿노트 다이어리 데코용으로 검색량이 급증합니다.'
      };
    case 'stpatrick':
      return {
        suggestedPrice: '$3.20',
        originalPrice: '$6.40 (50% 런칭 세일 권장)',
        bundleOffer: '럭키 그린 2팩 묶음 $5.50',
        targetAudience: '초등학교/유치원 교실 활동지 꾸미기 교사, 녹색 축제 다꾸러',
        salesTactics: [
          '미국 학교 교사들을 타겟으로 "Teacher Reward / Classroom Stickers" 어필.',
          '초록색 모자와 황금 동전 단지 실물 인쇄 컷팅 다이컷 목업 구성.',
          '단기 시즌이므로 2월 중순 즉시 런칭 후 반짝 집중 할인 진행.'
        ],
        etsyTags: [
          'St Patricks Day', 'Lucky Clover PNG', 'Irish Festival Decal', 'Printable Sticker Sheet',
          'Pot of Gold Clipart', 'Teacher Stickers', 'Classroom Rewards', 'GoodNotes St Patrick',
          'Cricut Lucky Cut', 'Green Aesthetic', 'March Planner PNG', 'A4 Irish Sheet', 'Leprechaun Stickers'
        ],
        highlightTip: '미국 학교 교사들의 교실 행사 스티커 수요가 높으므로 "Classroom Printable" 키워드를 공략하세요.'
      };
    case 'easter':
      return {
        suggestedPrice: '$3.50',
        originalPrice: '$7.00 (50% 런칭 세일 권장)',
        bundleOffer: '부활절 & 스프링 파스텔 3팩 묶음 $8.90',
        targetAudience: '부활절 에그 헌팅 바구니 라벨링, 키즈 워크시트, 봄맞이 플래너 유저',
        salesTactics: [
          '파스텔 옐로우/핑크/민트 컬러의 화사한 봄 분위기 플랫레이 목업 연출.',
          '부활절 달걀 바구니(Easter Basket Tag) 라벨 부착 사진을 썸네일 2번에 배치.',
          '봄 신학기 다이어리용 파스텔 테마 번들로 확장 판매 유도.'
        ],
        etsyTags: [
          'Easter Stickers', 'Spring Bunny Clipart', 'Easter Basket Tag', 'Pastel Easter Eggs',
          'Printable Sticker Sheet', 'Digital Planner PNG', 'Spring Garden Decals', 'Cricut Easter Cut',
          'GoodNotes Easter', 'Cute Bunny Stickers', 'Floral Terrarium', 'A4 Easter Sheet', 'Kids Easter Printable'
        ],
        highlightTip: '부활절 바구니 선물 태그 및 유아 놀이용 스티커로 인쇄 수요가 매우 높아 A4 시트 강조가 핵심입니다.'
      };
    case 'mothersday':
      return {
        suggestedPrice: '$3.60',
        originalPrice: '$7.20 (50% 런칭 세일 권장)',
        bundleOffer: '마더스데이 & 감사 선물 2팩 묶음 $6.20',
        targetAudience: '어머니 감사 카드 제작자, 꽃다발 및 홈베이킹 선물 패키징 크리에이터',
        salesTactics: [
          '빈티지 플로럴 찻잔과 장미의 우아함을 부각한 고급스러운 썸네일 구성.',
          '수제 감사 카드(Greeting Card) 및 카네이션 꽃다발 포장 리본에 부착된 실물 컷팅 목업 필수.',
          '"Gift for Mom", "Mothers Day Craft" 롱테일 키워드로 공략.'
        ],
        etsyTags: [
          'Mothers Day Stickers', 'Floral Teacup PNG', 'Gift Tag Printable', 'Mom Card Clipart',
          'Vintage Rose Decal', 'Handmade Card Decor', 'Printable Sticker Sheet', 'Digital Planner PNG',
          'Cricut Floral Cut', 'GoodNotes Mothers Day', 'Elegant Floral PNG', 'A4 Flower Sheet', 'Thank You Mom Tag'
        ],
        highlightTip: '5월 첫째 주 선물 준비 직전인 4월 중순에 감사 카드 제작용 다운로드가 폭발하므로 3월 말 등록 권장.'
      };
    default:
      return {
        suggestedPrice: '$3.50',
        originalPrice: '$7.00 (50% 런칭 세일 권장)',
        bundleOffer: '3팩 번들 $8.90 업셀링',
        targetAudience: `${koreanName} 시즌 선물 포장 및 굿노트/다이어리 꾸미기 유저`,
        salesTactics: [
          '정가 $7.00에 런칭 기념 50% 세일($3.50)로 Etsy 노출 알고리즘 우대 획득.',
          'A4 인쇄용 시트 2장과 굿노트 디지털 플래너 적용 컷을 썸네일 2~3번에 필수 배치.',
          '시즌 개막 4~6주 전 등록하여 사전 인덱싱 및 구매자 찜(Favorite) 확보.'
        ],
        etsyTags: [
          `${koreanName} Stickers`, 'Digital Planner PNG', 'Printable Sticker Sheet', 'Cricut Cut Files',
          'GoodNotes Stickers', 'Cute Clipart Pack', 'A4 Printable Sheet', 'Seasonal Decals',
          'Aesthetic Planner', 'Scrapbooking PNG', 'Instant Download', 'Sticker Bundle', 'Planner Accessories'
        ],
        highlightTip: `${koreanName} 시즌 검색 트렌드가 시작되기 전 미리 리스팅하여 리뷰를 축적하세요.`
      };
  }
}

/**
 * 365-Day Dynamic Seasonal Sticker Radar Engine
 * Calculates exact D-Days for upcoming shopping holidays from referenceDate.
 * Selects the top 3 best lead-time seasons (D-20 to D-110).
 */
export function getDynamicSeasonalStickerRecommendations(referenceDate: Date = new Date()): SeasonalRecommendation[] {
  const allUpcoming = getAllUpcomingSeasons(referenceDate);

  // Filter for seasons within the optimal Etsy pre-season window (15 to 115 days)
  // If fewer than 3, take the earliest upcoming ones
  let eligible = allUpcoming.filter(s => s.daysRemaining >= 15 && s.daysRemaining <= 115);
  if (eligible.length < 3) {
    eligible = allUpcoming.filter(s => s.daysRemaining >= 10).slice(0, 3);
  } else {
    eligible = eligible.slice(0, 3);
  }

  const recommendations: SeasonalRecommendation[] = eligible.map((seasonInfo) => {
    const id = seasonInfo.holiday.id;
    const days = seasonInfo.daysRemaining;
    const currentMonth = referenceDate.getMonth() + 1;
    const targetMonth = seasonInfo.holiday.month;

    let badge = `D-${days} 선점 골든타임`;
    let badgeColor = 'bg-rose-600 text-white';

    if (days <= 35) {
      badge = `D-${days} 최종 긴급 선점!`;
      badgeColor = 'bg-purple-600 text-white animate-pulse';
    } else if (days <= 70) {
      badge = `D-${days} 본격 검색 상승기`;
      badgeColor = 'bg-amber-600 text-white';
    } else {
      badge = `D-${days} 2~3개월 선점 타임`;
      badgeColor = 'bg-rose-600 text-white';
    }

    const { vesselSeries, standaloneSeries } = getSeasonalPackPresets(id);
    const pricingStrategy = getSeasonalPricingStrategy(id, seasonInfo.holiday.koreanName);

    // Contextual timing text
    const timingText = `Etsy 알고리즘 인덱싱(4~6주)에 맞춰 ${currentMonth}월인 지금 등록해야 ${targetMonth}월 ${seasonInfo.holiday.koreanName} 시즌에 검색 1위를 선점합니다.`;

    // Titles & reasons tailored per holiday
    let title = `${seasonInfo.holiday.icon} ${seasonInfo.holiday.koreanName} 40종 스티커 팩`;
    let subtitle = `${seasonInfo.holiday.name} 시즌 틈새 40종 팩 (완성 20종 + 단일 20종 + A4 2장 시트)`;
    let bestSellerReason = `${seasonInfo.holiday.koreanName} 시즌에 다이어리, 선물 라벨, 크리컷 인쇄용으로 검색량이 폭발하는 테마`;

    if (id === 'christmas') {
      title = '🎄 크리스마스 & 윈터 스노우볼 40종 팩';
      subtitle = '연중 최대 성수기! 지금 등록하면 11월~12월 검색 1위 독점';
      bestSellerReason = '연말 다이어리 꾸미기, 크리스마스 선물 포장 라벨, 크리컷 인쇄용으로 전 세계에서 가장 많이 팔리는 1위 테마';
    } else if (id === 'thanksgiving') {
      title = '🦃 추수감사절 & 코지 어텀 하베스트 40종 팩';
      subtitle = '가을 시즌 최대 명절! 펌킨 스파이스 & 포근한 가을 감성';
      bestSellerReason = '미국인들이 가장 사랑하는 "Cozy Autumn" 라이프스타일과 결합되어 가을 내내 높은 전환율을 기록하는 테마';
    } else if (id === 'halloween') {
      title = '🎃 스푸키 큐트 고스트 & 할로윈 40종 팩';
      subtitle = '파스텔톤 귀여운 유령 & 호박 테라리움! 지금 최종 막차 탑승';
      bestSellerReason = '미국 20~30대 여성 다꾸러들이 가장 열광하는 "아이스 라떼 든 아기 유령"과 파스텔톤 호박의 압도적 검색량';
    } else if (id === 'valentines') {
      title = '💖 발렌타인데이 핑크 러브 40종 팩';
      subtitle = '상반기 최대 선물 시즌! 핑크 하트 유리병 & 귀여운 동물 커플';
      bestSellerReason = '연인과 친구를 위한 다이어리 스티커, 선물 포장 스티커로 1~2월 폭발적 매출을 기록하는 테마';
    } else if (id === 'stpatrick') {
      title = '☘️ 성 패트릭의 날 럭키 클로버 40종 팩';
      subtitle = '행운의 네잎클로버 & 황금 단지! 3월 미국 전역 축제 테마';
      bestSellerReason = '초록색 굿즈를 입지 않으면 안 되는 아일랜드 축제 문화로 인해 교실/다이어리 스티커 수요 급증';
    } else if (id === 'easter') {
      title = '🌸 부활절 & 파스텔 스프링 가든 40종 팩';
      subtitle = '봄 시즌 최대 쇼핑 대목! 파스텔 달걀 테라리움 & 아기 토끼';
      bestSellerReason = '부활절 달걀 찾기 행사, 봄맞이 다이어리 꾸미기용으로 파스텔 일러스트의 전 세계적 베스트셀러';
    } else if (id === 'mothersday') {
      title = '💐 마더스데이 플로럴 티컵 40종 팩';
      subtitle = '어버이날 감사 선물! 빈티지 장미 찻잔 & 카네이션 꽃다발';
      bestSellerReason = '엄마를 향한 감사 카드, 선물 패키징 라벨로 4~5월 Etsy 검색어 상위권을 휩쓰는 감성 테마';
    }

    return {
      seasonId: id,
      title,
      subtitle,
      icon: seasonInfo.holiday.icon,
      badge,
      badgeColor,
      timingText,
      keySearchTerms: seasonInfo.holiday.trendingMotifs.slice(0, 5),
      bestSellerReason,
      pricingStrategy,
      vesselSeries,
      standaloneSeries
    };
  });

  return recommendations;
}

// Backward-compatible static export
export const SEASONAL_RECOMMENDATIONS: SeasonalRecommendation[] = getDynamicSeasonalStickerRecommendations();
