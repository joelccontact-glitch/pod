/**
 * Seasonal Trend Sticker Presets (Christmas, Halloween, Thanksgiving)
 * Designed for Etsy 2-3 month lead-time surge sales.
 * Each seasonal theme includes:
 * 1. 20-Pack Themed Vessels/Globes/Jars (Sheet 1)
 * 2. 20-Pack Standalone Cute Deco Objects (Sheet 2)
 * Total 40 stickers per seasonal pack!
 */

import { StickerPreset } from './sticker-prompts';

export const SEASONAL_RULES_NO_TEXT = `CRITICAL STICKER RULES:
1. Must have a crisp, thick, smooth white die-cut sticker border outlining the ENTIRE sticker design.
2. Must have a PURE SOLID WHITE BACKGROUND (#FFFFFF). Absolutely NO background colors, scenery, or gradients outside the sticker border.
3. STRICT TEXT RULE: Absolutely NO text, NO words, NO letters, NO phrases, NO typography, NO signatures anywhere in the image. Pure graphic illustration art only.
4. Vector sticker aesthetic, vibrant kawaii illustration, high contrast, clean contours.`;

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

/**
 * Seasonal metadata and radar recommendation configs
 */
export interface SeasonalRecommendation {
  seasonId: 'christmas' | 'halloween' | 'thanksgiving';
  title: string;
  subtitle: string;
  icon: string;
  badge: string;
  badgeColor: string;
  timingText: string;
  keySearchTerms: string[];
  bestSellerReason: string;
  vesselSeries: StickerPreset[];
  standaloneSeries: StickerPreset[];
}

export const SEASONAL_RECOMMENDATIONS: SeasonalRecommendation[] = [
  {
    seasonId: 'christmas',
    title: '🎄 크리스마스 & 윈터 스노우볼 40종 팩',
    subtitle: '연중 최대 성수기! 지금 등록하면 11월~12월 검색 1위 독점',
    icon: '🎄',
    badge: 'D-95 선점 골든타임',
    badgeColor: 'bg-rose-600 text-white',
    timingText: 'Etsy 검색 알고리즘 상위 노출에 4~6주 소요되므로, 9월 말~10월 초에 올려야 12월 쇼핑 대목에 폭발적 매출이 발생합니다.',
    keySearchTerms: ['Christmas Snowglobe', 'Gingerbread House', 'Winter Cozy Clipart', 'Hot Cocoa Mug', 'Christmas Tree Stickers'],
    bestSellerReason: '연말 다이어리 꾸미기, 크리스마스 선물 포장 라벨, 크리컷 인쇄용으로 전 세계에서 가장 많이 팔리는 1위 테마',
    vesselSeries: CHRISTMAS_20_SERIES,
    standaloneSeries: CHRISTMAS_STANDALONE_20_SERIES,
  },
  {
    seasonId: 'thanksgiving',
    title: '🦃 추수감사절 & 코지 어텀 하베스트 40종 팩',
    subtitle: '가을 시즌 최대 명절! 펌킨 스파이스 & 포근한 가을 감성',
    icon: '🦃',
    badge: 'D-65 본격 상승기',
    badgeColor: 'bg-amber-600 text-white',
    timingText: '미국 11월 추수감사절은 가족 모임과 가을 감사 다이어리 수요가 집중되는 시기로, 지금이 가장 완벽한 리스팅 타이밍입니다.',
    keySearchTerms: ['Pumpkin Spice Latte', 'Fall Harvest Stickers', 'Pecan Pie Clipart', 'Cozy Sweater Weather', 'Maple Leaf Acorns'],
    bestSellerReason: '미국인들이 가장 사랑하는 "Cozy Autumn" 라이프스타일과 결합되어 가을 내내 높은 전환율을 기록하는 테마',
    vesselSeries: THANKSGIVING_20_SERIES,
    standaloneSeries: THANKSGIVING_STANDALONE_20_SERIES,
  },
  {
    seasonId: 'halloween',
    title: '🎃 스푸키 큐트 고스트 & 할로윈 40종 팩',
    subtitle: '파스텔톤 귀여운 유령 & 호박 테라리움! 지금 최종 막차 탑승',
    icon: '🎃',
    badge: 'D-40 최종 막차',
    badgeColor: 'bg-purple-600 text-white',
    timingText: '10월 할로윈 검색량이 이미 수직 상승 중입니다. 등록 즉시 가을 매출을 빠르게 흡수할 수 있는 긴급 선점 테마입니다.',
    keySearchTerms: ['Spooky Cute Ghost', 'Iced PSL Ghost', 'Pastel Halloween Clipart', 'Jack-o-lantern Jar', 'Witchy Stickers'],
    bestSellerReason: '미국 20~30대 여성 다꾸러들이 가장 열광하는 "아이스 라떼 든 아기 유령"과 파스텔톤 호박의 압도적 검색량',
    vesselSeries: HALLOWEEN_20_SERIES,
    standaloneSeries: HALLOWEEN_STANDALONE_20_SERIES,
  }
];
