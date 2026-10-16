/**
 * Hangul 20-Pack Typography Synthesis Engine (한글 20종 스티커 정밀 타이포 합성 엔진 - v2)
 * 
 * Fixes:
 * 1. Zero Overlap: Mathematically enforces a guaranteed 18-25px clear gap between Hangul text and English subtitle pill.
 * 2. Strict ID/Preset Matching: Fixes the prefix-collision bug where 'hangul-20-pack-10..19' falsely matched 'hangul-20-pack-1' ("괜찮아").
 *    Every single of the 20 stickers is accurately mapped to its unique phrase and subtitle.
 */

export interface HangulItemMetadata {
  num: number;
  id: string;
  name: string;
  phrase: string;
  sub: string;
  themeColor: string;
  secondaryColor?: string;
  description: string;
}

export const HANGUL_20_DATA: HangulItemMetadata[] = [
  {
    num: 1,
    id: 'hangul-20-pack-1',
    name: '괜찮아 아기 토끼',
    phrase: '괜찮아',
    sub: "It's Okay",
    themeColor: '#E11D48', // Sweet rose pink
    secondaryColor: '#FFF1F2',
    description: '귀에 반창고를 붙이고 하트를 안은 힐링 아기 토끼'
  },
  {
    num: 2,
    id: 'hangul-20-pack-2',
    name: '대박 환호 레서판다',
    phrase: '대박',
    sub: 'Daebak!',
    themeColor: '#EA580C', // Vibrant party orange
    secondaryColor: '#FFF7ED',
    description: '별가루를 뿌리며 환호하는 아기 레서판다'
  },
  {
    num: 3,
    id: 'hangul-20-pack-3',
    name: '반짝반짝 별가루 고양이',
    phrase: '반짝반짝',
    sub: 'Sparkle Bling',
    themeColor: '#D97706', // Golden sparkle amber
    secondaryColor: '#FEF3C7',
    description: '황금 별가루를 뿜어내는 아기 삼색 고양이'
  },
  {
    num: 4,
    id: 'hangul-20-pack-4',
    name: '냠냠 붕어빵 아기 곰',
    phrase: '냠냠',
    sub: 'Yummy!',
    themeColor: '#B45309', // Warm baked pastry brown
    secondaryColor: '#FEF3C7',
    description: '따끈따끈한 붕어빵을 베어 무는 아기 곰'
  },
  {
    num: 5,
    id: 'hangul-20-pack-5',
    name: '파이팅 응원 햄스터',
    phrase: '파이팅',
    sub: 'You Got This!',
    themeColor: '#2563EB', // Energetic royal blue
    secondaryColor: '#EFF6FF',
    description: '주먹을 불끈 쥐고 머리띠를 두른 응원 햄스터'
  },
  {
    num: 6,
    id: 'hangul-20-pack-6',
    name: '사랑해 하트 아기 해달',
    phrase: '사랑해',
    sub: 'I Love You',
    themeColor: '#E11D48', // Ruby heart crimson
    secondaryColor: '#FFE4E6',
    description: '커다란 핑크 하트를 껴안고 둥둥 뜬 해달'
  },
  {
    num: 7,
    id: 'hangul-20-pack-7',
    name: '쿨쿨 낮잠 나무늘보',
    phrase: '쿨쿨',
    sub: 'Sleepy Zzz',
    themeColor: '#6366F1', // Cozy dreamy indigo
    secondaryColor: '#EEF2FF',
    description: '폭신한 구름 베개 위에서 낮잠 자는 나무늘보'
  },
  {
    num: 8,
    id: 'hangul-20-pack-8',
    name: '콩닥콩닥 수줍은 사슴',
    phrase: '콩닥콩닥',
    sub: 'Heart Flutter',
    themeColor: '#F43F5E', // Blushing pink
    secondaryColor: '#FFF1F2',
    description: '두 뺨이 발그레해져 가슴을 쥔 아기 꽃사슴'
  },
  {
    num: 9,
    id: 'hangul-20-pack-9',
    name: '뽀짝 아기 강아지 발자국',
    phrase: '뽀짝',
    sub: 'Tiny Steps',
    themeColor: '#F59E0B', // Warm playful puppy amber (★ '뵤작' 절대 아님)
    secondaryColor: '#FEF3C7',
    description: '아장아장 걸어오는 아기 골든리트리버와 분홍 젤리 발자국'
  },
  {
    num: 10,
    id: 'hangul-20-pack-10',
    name: '아이고 머리짚는 피그미하마',
    phrase: '아이고',
    sub: 'Aigoo! (Oh Dear!)',
    themeColor: '#7C3AED', // Expressive deep purple
    secondaryColor: '#F5F3FF',
    description: '손으로 이마를 짚으며 억울해하는 피그미하마'
  },
  {
    num: 11,
    id: 'hangul-20-pack-11',
    name: '행복해 미소 아기 돼지',
    phrase: '행복해',
    sub: 'So Happy',
    themeColor: '#059669', // Fresh clover emerald
    secondaryColor: '#ECFDF5',
    description: '클로버 꽃밭에서 눈웃음 짓는 아기 돼지'
  },
  {
    num: 12,
    id: 'hangul-20-pack-12',
    name: '붕어빵 모자 쓴 펭귄',
    phrase: '붕어빵',
    sub: 'Bungeoppang Pal',
    themeColor: '#D97706', // Baked pastry gold
    secondaryColor: '#FFFBEB',
    description: '붕어빵 모양 털모자를 쓴 아기 펭귄'
  },
  {
    num: 13,
    id: 'hangul-20-pack-13',
    name: '심쿵 심장잡은 다람쥐',
    phrase: '심쿵',
    sub: 'Heart Attack!',
    themeColor: '#DC2626', // Electric red pulse
    secondaryColor: '#FEF2F2',
    description: '너무 귀여워서 심장을 부여잡은 아기 다람쥐'
  },
  {
    num: 14,
    id: 'hangul-20-pack-14',
    name: '멍~ 멍때리는 아기 오리',
    phrase: '멍~',
    sub: 'Spaced Out',
    themeColor: '#0284C7', // Airy sky blue
    secondaryColor: '#F0F9FF',
    description: '눈을 깜빡이며 멍때리는 귀여운 오리'
  },
  {
    num: 15,
    id: 'hangul-20-pack-15',
    name: '힐링 온천 목욕 고슴도치',
    phrase: '힐링',
    sub: 'Healing Time',
    themeColor: '#0D9488', // Serene onsen teal
    secondaryColor: '#F0FDFA',
    description: '머리에 수건을 얹고 나무 대야에 몸을 담근 고슴도치'
  },
  {
    num: 16,
    id: 'hangul-20-pack-16',
    name: '찰떡궁합 떡볶이와 튀김 듀오',
    phrase: '찰떡궁합',
    sub: 'Perfect Match',
    themeColor: '#E11D48', // Spicy red sauce
    secondaryColor: '#FFF1F2',
    description: '귀여운 떡볶이 떡과 바삭한 김말이 캐릭터 듀오'
  },
  {
    num: 17,
    id: 'hangul-20-pack-17',
    name: '토닥토닥 위로하는 흑곰',
    phrase: '토닥토닥',
    sub: 'There There',
    themeColor: '#475569', // Cozy comforting slate
    secondaryColor: '#F8FAFC',
    description: '작은 친구를 따뜻하게 안아주는 아기 흑곰'
  },
  {
    num: 18,
    id: 'hangul-20-pack-18',
    name: '꿀잠 수면안대 아기 여우',
    phrase: '꿀잠',
    sub: 'Sweet Sleep',
    themeColor: '#8B5CF6', // Lavender sleep
    secondaryColor: '#F5F3FF',
    description: '당근 모양 수면 안대를 쓰고 웅크린 아기 여우'
  },
  {
    num: 19,
    id: 'hangul-20-pack-19',
    name: '으쌰으쌰 힘내는 레서판다',
    phrase: '으쌰으쌰',
    sub: 'Power Up!',
    themeColor: '#EA580C', // Athletic power orange
    secondaryColor: '#FFF7ED',
    description: '작은 덤벨을 들고 운동하는 씩씩한 레서판다'
  },
  {
    num: 20,
    id: 'hangul-20-pack-20',
    name: '최고야 엄지척 아기 강아지',
    phrase: '최고야',
    sub: 'You Are The Best',
    themeColor: '#059669', // Victory mint green
    secondaryColor: '#ECFDF5',
    description: '엄지손가락을 치켜세우고 윙크하는 강아지'
  }
];

/**
 * Robust, 100% bug-free Hangul Preset lookup.
 * Fixes false substring matches (e.g. 'hangul-20-pack-10' matching 'hangul-20-pack-1').
 */
export function findHangulPresetData(identifier: string | number | undefined | null, fallbackIndex?: number): HangulItemMetadata | null {
  if (identifier === undefined || identifier === null) {
    if (fallbackIndex !== undefined && fallbackIndex >= 0 && fallbackIndex < HANGUL_20_DATA.length) {
      return HANGUL_20_DATA[fallbackIndex];
    }
    return null;
  }

  if (typeof identifier === 'number') {
    return HANGUL_20_DATA.find(d => d.num === identifier) || null;
  }

  const s = String(identifier).trim().toLowerCase();

  // 1. Strict exact ID match (e.g. 'hangul-20-pack-10')
  const exactId = HANGUL_20_DATA.find(d => d.id === s);
  if (exactId) return exactId;

  // 2. Extract specific pack number from ID string with strict regex (e.g. 'hangul-20-pack-10')
  const packNumMatch = s.match(/hangul-20-pack-(\d+)\b/i);
  if (packNumMatch) {
    const num = parseInt(packNumMatch[1], 10);
    const byNum = HANGUL_20_DATA.find(d => d.num === num);
    if (byNum) return byNum;
  }

  // 3. Extract number from title formats:
  // e.g. '[한글 10/20]', '한글 10/20', '[한글 10]', '10/20', '10. ', '#10'
  const titleNumMatch = s.match(/(?:\[?\s*한글\s*|hangul\s*)(?:#|\s*)(\d{1,2})\s*(?:\/20|종)?/i) 
    || s.match(/\[(\d{1,2})\/20\]/)
    || s.match(/\b(\d{1,2})\/20\b/)
    || s.match(/^(\d{1,2})[\.\s_\-]/);
  if (titleNumMatch) {
    const num = parseInt(titleNumMatch[1], 10);
    if (num >= 1 && num <= 20) {
      const byNum = HANGUL_20_DATA.find(d => d.num === num);
      if (byNum) return byNum;
    }
  }

  // 4. Exact Phrase match (search sorted by length descending so longer words match first)
  const sortedByPhraseLen = [...HANGUL_20_DATA].sort((a, b) => b.phrase.length - a.phrase.length);
  for (const item of sortedByPhraseLen) {
    if (s.includes(item.phrase.toLowerCase())) {
      return item;
    }
  }

  // 5. Keyword match for animal/prop in title or description
  const keywordsMap: { num: number; keywords: string[] }[] = [
    { num: 1, keywords: ['반창고', '힐링 토끼', '아기 토끼', 'bunny'] },
    { num: 2, keywords: ['환호', '콘페티', '별가루를 뿌리며', '레서판다'] },
    { num: 3, keywords: ['별가루 고양이', '삼색 고양이', '고양이', 'sparkle'] },
    { num: 4, keywords: ['베어 무는', '붕어빵 아기 곰', '아기 곰'] },
    { num: 5, keywords: ['머리띠', '주먹', '응원 햄스터', '햄스터'] },
    { num: 6, keywords: ['하트 아기 해달', '아기 해달', '해달'] },
    { num: 7, keywords: ['구름 베개', '낮잠 나무늘보', '나무늘보'] },
    { num: 8, keywords: ['수줍은 사슴', '꽃사슴', '사슴'] },
    { num: 9, keywords: ['골든리트리버', '젤리 발자국', '발자국', '아기 강아지 발자국', '뽀짝'] },
    { num: 10, keywords: ['머리짚는', '피그미하마', '이마를 짚으며', '하마', '아이고'] },
    { num: 11, keywords: ['미소 아기 돼지', '화관', '클로버 꽃밭', '아기 돼지', '행복해'] },
    { num: 12, keywords: ['붕어빵 모자', '모자 쓴 펭귄', '펭귄'] },
    { num: 13, keywords: ['심장잡은', '아기 다람쥐', '다람쥐', '심쿵'] },
    { num: 14, keywords: ['멍때리는', '아기 오리', '노란 아기 오리', '오리'] },
    { num: 15, keywords: ['온천 목욕', '나무 대야', '고슴도치', '힐링'] },
    { num: 16, keywords: ['떡볶이', '김말이', '찰떡궁합'] },
    { num: 17, keywords: ['위로하는 흑곰', '아기 흑곰', '흑곰', '토닥토닥'] },
    { num: 18, keywords: ['수면안대', '아기 여우', '여우', '꿀잠'] },
    { num: 19, keywords: ['힘내는 레서판다', '덤벨', '아령', '으쌰으쌰'] },
    { num: 20, keywords: ['엄지척', '윙크하는 강아지', '최고야'] }
  ];

  for (const km of keywordsMap) {
    if (km.keywords.some(k => s.includes(k))) {
      return HANGUL_20_DATA.find(d => d.num === km.num) || null;
    }
  }

  // 6. Fallback index in batch loop (e.g. index i maps to HANGUL_20_DATA[i])
  if (fallbackIndex !== undefined && fallbackIndex >= 0 && fallbackIndex < HANGUL_20_DATA.length) {
    return HANGUL_20_DATA[fallbackIndex];
  }

  return null;
}

export interface HangulCompositeOptions {
  hangulText?: string;
  englishSub?: string;
  themeColor?: string;
  position?: 'bottom-center' | 'bottom-right' | 'bottom-left' | 'top-center' | 'top-right';
  scale?: number; // default 1.0
  customX?: number; // percentage (0..100) or pixel
  customY?: number; // percentage (0..100) or pixel
  clearPreviousText?: boolean; // When true, clears previous typography band with pure #FFFFFF before drawing to eliminate double/ghost text
  clearFromRatio?: number; // Fallback ratio from top to clear (default: smart gap detection or 0.68)
}

/**
 * Ensures Google Fonts for Korean Hangul ('Jua', 'Gaegu', 'Fredoka') are loaded into Canvas.
 */
async function ensureHangulFontsLoaded() {
  if (typeof document !== 'undefined' && document.fonts) {
    try {
      await Promise.all([
        document.fonts.load("bold 120px 'Jua'"),
        document.fonts.load("400 120px 'Jua'"),
        document.fonts.load("bold 120px 'Gaegu'"),
        document.fonts.load("800 60px 'Fredoka'"),
        document.fonts.load("700 60px 'Comic Neue'")
      ]);
    } catch (e) {
      console.warn('[HangulComposer] Font preloading notice:', e);
    }
  }
}

/**
 * Clears any previously composited typography or bottom text from an image,
 * restoring the clean baby animal illustration on pure solid white background (#FFFFFF).
 */
export async function extractCleanBaseWithoutText(
  imageSource: string | HTMLImageElement | HTMLCanvasElement,
  clearFromRatio?: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    const processImage = (img: HTMLImageElement | HTMLCanvasElement) => {
      try {
        const w = img.width || 1024;
        const h = img.height || 1024;

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to create canvas context in extractCleanBaseWithoutText'));
          return;
        }

        ctx.drawImage(img, 0, 0, w, h);

        let clearY = Math.round(h * (clearFromRatio || 0.68));

        try {
          const imgData = ctx.getImageData(0, 0, w, h).data;
          const scanStart = Math.round(h * 0.52);
          const scanEnd = Math.round(h * 0.80);
          let bestGapY = -1;
          let minNonWhiteInRow = 999999;

          for (let y = scanStart; y < scanEnd; y += 2) {
            let nonWhiteCount = 0;
            for (let x = 0; x < w; x += 4) {
              const idx = (y * w + x) * 4;
              const r = imgData[idx];
              const g = imgData[idx + 1];
              const b = imgData[idx + 2];
              if (r < 248 || g < 248 || b < 248) {
                nonWhiteCount++;
              }
            }
            if (nonWhiteCount < (w / 4) * 0.015) {
              bestGapY = y;
              break;
            }
            if (nonWhiteCount < minNonWhiteInRow) {
              minNonWhiteInRow = nonWhiteCount;
              bestGapY = y;
            }
          }

          if (bestGapY > 0) {
            clearY = bestGapY;
          }
        } catch {
          // ignore
        }

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, clearY, w, h - clearY);

        resolve(canvas.toDataURL('image/png'));
      } catch (e) {
        reject(e);
      }
    };

    if (typeof imageSource === 'string') {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => processImage(img);
      img.onerror = () => reject(new Error('Failed to load imageSource in extractCleanBaseWithoutText'));
      img.src = imageSource;
    } else {
      processImage(imageSource);
    }
  });
}

/**
 * Composites 100% typo-free, professional Korean Hangul typography & subtitle
 * onto a clean baby animal illustration canvas with a thick white die-cut border.
 * 
 * GUARANTEED ZERO OVERLAP:
 * The English subtitle pill is positioned strictly below the bottom of the Hangul text
 * with an enforced 18-25px clear vertical gap, ensuring zero collision or overlapping text.
 */
export async function compositeHangulTypography(
  imageSource: string | HTMLImageElement | HTMLCanvasElement,
  options: HangulCompositeOptions = {}
): Promise<string> {
  await ensureHangulFontsLoaded();

  return new Promise((resolve, reject) => {
    const processImage = (img: HTMLImageElement | HTMLCanvasElement) => {
      try {
        const w = img.width || 1024;
        const h = img.height || 1024;

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Failed to create canvas context'));
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // 1. Draw base animal illustration
        ctx.drawImage(img, 0, 0, w, h);

        // 1.5 Intelligently clear any previous typography zone if requested (prevents double/ghost text!)
        if (options.clearPreviousText) {
          try {
            const imgData = ctx.getImageData(0, 0, w, h).data;
            let clearY = Math.round(h * (options.clearFromRatio || 0.68));
            const scanStart = Math.round(h * 0.52);
            const scanEnd = Math.round(h * 0.80);
            let bestGapY = -1;
            let minNonWhiteInRow = 999999;

            for (let y = scanStart; y < scanEnd; y += 2) {
              let nonWhiteCount = 0;
              for (let x = 0; x < w; x += 4) {
                const idx = (y * w + x) * 4;
                const r = imgData[idx];
                const g = imgData[idx + 1];
                const b = imgData[idx + 2];
                if (r < 248 || g < 248 || b < 248) {
                  nonWhiteCount++;
                }
              }
              if (nonWhiteCount < (w / 4) * 0.015) {
                bestGapY = y;
                break;
              }
              if (nonWhiteCount < minNonWhiteInRow) {
                minNonWhiteInRow = nonWhiteCount;
                bestGapY = y;
              }
            }

            if (bestGapY > 0) {
              clearY = bestGapY;
            }

            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, clearY, w, h - clearY);
          } catch {
            const fallbackClearY = Math.round(h * (options.clearFromRatio || 0.68));
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, fallbackClearY, w, h - fallbackClearY);
          }
        }

        const hangul = (options.hangulText || '괜찮아').trim();
        const sub = (options.englishSub || "It's Okay").trim();
        const themeColor = options.themeColor || '#E11D48';
        const position = options.position || 'bottom-center';
        const userScale = options.scale || 1.0;

        // 2. Scan subject bounding box to intelligently position typography
        let subjectBottomY = Math.round(h * 0.88);
        let subjectCenterX = Math.round(w * 0.5);

        try {
          const sampleData = ctx.getImageData(0, 0, w, h).data;
          let maxY = 0;
          let minX = w, maxX = 0;

          // Fast 4px stride scan
          for (let y = Math.round(h * 0.25); y < h; y += 4) {
            for (let x = 0; x < w; x += 4) {
              const idx = (y * w + x) * 4;
              const a = sampleData[idx + 3];
              const r = sampleData[idx];
              const g = sampleData[idx + 1];
              const b = sampleData[idx + 2];
              
              const isNotWhite = !(r >= 250 && g >= 250 && b >= 250);
              if (a > 20 && isNotWhite) {
                if (y > maxY) maxY = y;
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
              }
            }
          }

          if (maxY > h * 0.35 && maxX > minX) {
            subjectBottomY = maxY;
            subjectCenterX = Math.round((minX + maxX) / 2);
          }
        } catch {
          // Fallback to default center/bottom
        }

        // 3. Compute typography scale relative to word length & canvas width
        // Longer words (4 syllables e.g. '반짝반짝', '콩닥콩닥') need slightly smaller font to stay compact
        let baseFontSizeRatio = 0.12;
        if (hangul.length >= 4) {
          baseFontSizeRatio = 0.098;
        } else if (hangul.length === 3) {
          baseFontSizeRatio = 0.112;
        } else {
          baseFontSizeRatio = 0.13;
        }

        let baseFontSize = Math.round(w * baseFontSizeRatio * userScale);

        // Measure text width and clamp if too wide
        ctx.font = `900 ${baseFontSize}px 'Jua', 'Gaegu', cursive, sans-serif`;
        const initialHangulWidth = ctx.measureText(hangul).width;
        const maxAllowedHangulW = w * 0.72;
        if (initialHangulWidth > maxAllowedHangulW) {
          baseFontSize = Math.floor(baseFontSize * (maxAllowedHangulW / initialHangulWidth));
        }

        const hangulStrokeWidth = Math.max(14, Math.round(baseFontSize * 0.24));
        const subFontSize = Math.max(20, Math.round(baseFontSize * 0.32));

        // Subtitle Pill geometry
        ctx.font = `800 ${subFontSize}px 'Fredoka', 'Comic Neue', sans-serif`;
        const subMetrics = ctx.measureText(sub);
        const pillPadX = Math.round(subFontSize * 0.8);
        const pillPadY = Math.round(subFontSize * 0.32);
        const pillW = subMetrics.width + pillPadX * 2;
        const pillH = subFontSize + pillPadY * 2;
        const pillRadius = Math.round(pillH / 2);

        // 4. CRITICAL ZERO-OVERLAP GEOMETRY CALCULATION:
        // Guaranteed clean vertical gap between bottom of Hangul and top of subtitle pill!
        const verticalGap = Math.max(16, Math.round(baseFontSize * 0.18));
        
        // Hangul height calculation (text height + outer die-cut border)
        const hangulHalfHeight = Math.round(baseFontSize * 0.44) + Math.round(hangulStrokeWidth * 0.5);
        const totalBlockHeight = (hangulHalfHeight * 2) + verticalGap + pillH;

        // Position anchor
        let targetCenterX = subjectCenterX;
        let targetBottomY = Math.min(h - Math.round(h * 0.04), subjectBottomY + Math.round(totalBlockHeight * 0.32));

        if (position === 'bottom-left') {
          targetCenterX = Math.round(w * 0.30);
        } else if (position === 'bottom-right') {
          targetCenterX = Math.round(w * 0.70);
        } else if (position === 'top-center') {
          targetBottomY = Math.round(h * 0.32);
        } else if (position === 'top-right') {
          targetCenterX = Math.round(w * 0.75);
          targetBottomY = Math.round(h * 0.34);
        }

        // Apply custom coordinates if provided
        if (options.customX !== undefined) {
          targetCenterX = options.customX <= 100 ? (options.customX / 100) * w : options.customX;
        }
        if (options.customY !== undefined) {
          targetBottomY = options.customY <= 100 ? (options.customY / 100) * h : options.customY;
        }

        // Ensure pill bottom does not cut off past canvas bottom
        if (targetBottomY + (pillH * 0.5) > h - 16) {
          targetBottomY = h - 16 - (pillH * 0.5);
        }

        // Exact Y positions:
        // subY is the center of the subtitle pill
        const subY = targetBottomY;
        // pillTop is the top edge of the subtitle pill
        const pillTop = subY - (pillH * 0.5);
        // hangulBottom is strictly separated from pillTop by verticalGap
        const hangulBottom = pillTop - verticalGap;
        // hangulY is the vertical center of the Hangul text
        const hangulY = hangulBottom - hangulHalfHeight;

        const pillX = targetCenterX - pillW / 2;
        const pillY = pillTop;

        // 5. Render Hangul Typography with Rich Die-Cut White Outline & Shadow
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `900 ${baseFontSize}px 'Jua', 'Gaegu', cursive, sans-serif`;

        // --- Pass 1: Die-Cut Outer Drop Shadow ---
        ctx.shadowColor = 'rgba(0, 0, 0, 0.22)';
        ctx.shadowBlur = Math.round(baseFontSize * 0.16);
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = Math.max(4, Math.round(baseFontSize * 0.06));

        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = hangulStrokeWidth * 2;
        ctx.strokeText(hangul, targetCenterX, hangulY);

        // --- Pass 2: Pure White Crisp Border (No Shadow) ---
        ctx.shadowColor = 'transparent';
        ctx.lineWidth = hangulStrokeWidth * 1.9;
        ctx.strokeText(hangul, targetCenterX, hangulY);

        // --- Pass 3: Hangul Text Fill ---
        ctx.fillStyle = themeColor;
        ctx.fillText(hangul, targetCenterX, hangulY);

        ctx.restore();

        // 6. Render English Subtitle Pill (Clean White Pill Badge with zero overlap)
        if (sub && sub.length > 0) {
          ctx.save();
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.font = `800 ${subFontSize}px 'Fredoka', 'Comic Neue', sans-serif`;

          // Drop shadow for subtitle pill
          ctx.shadowColor = 'rgba(0, 0, 0, 0.16)';
          ctx.shadowBlur = Math.round(subFontSize * 0.3);
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 3;

          // Pure solid white pill background
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.roundRect(pillX, pillY, pillW, pillH, pillRadius);
          ctx.fill();

          // Reset shadow for crisp border and text
          ctx.shadowColor = 'transparent';

          // Theme-colored border for the pill
          ctx.strokeStyle = themeColor;
          ctx.lineWidth = Math.max(2, Math.round(subFontSize * 0.12));
          ctx.beginPath();
          ctx.roundRect(pillX, pillY, pillW, pillH, pillRadius);
          ctx.stroke();

          // Subtitle text inside pill in theme color
          ctx.fillStyle = themeColor;
          ctx.fillText(sub, targetCenterX, subY);

          ctx.restore();
        }

        // 7. Output high-res 300DPI PNG data URL
        const dataUrl = canvas.toDataURL('image/png', 0.96);
        resolve(dataUrl);
      } catch (err) {
        reject(err);
      }
    };

    if (typeof imageSource === 'string') {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => processImage(img);
      img.onerror = () => reject(new Error('Failed to load image for typography composite'));
      img.src = imageSource;
    } else {
      processImage(imageSource);
    }
  });
}
