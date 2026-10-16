/**
 * Hangul 20-Pack Typography Synthesis Engine (한글 20종 스티커 정밀 타이포 합성 엔진)
 * 
 * Replaces garbled AI-diffusion text (e.g. '뵤작' -> '뽀짝', broken Korean syllables)
 * with authentic, 100% typo-free vector Korean fonts ('Jua' & 'Fredoka')
 * rendered with thick die-cut white borders, layered outlines, and drop shadows.
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
    themeColor: '#F59E0B', // Warm playful puppy amber (절대 '뵤작' 아님)
    secondaryColor: '#FEF3C7',
    description: '아장아장 걸어오는 아기 골든리트리버와 분홍 젤리 발자국'
  },
  {
    num: 10,
    id: 'hangul-20-pack-10',
    name: '아이고 머리짚는 피그미하마',
    phrase: '아이고',
    sub: 'Aigo!',
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
    description: '머리 위에 물음표를 띄우고 멍때리는 오리'
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

export function findHangulPresetData(identifier: string | number): HangulItemMetadata | null {
  if (typeof identifier === 'number') {
    return HANGUL_20_DATA.find(d => d.num === identifier) || null;
  }

  const s = String(identifier).toLowerCase();
  
  // Try exact id match (e.g. 'hangul-20-pack-9')
  const byId = HANGUL_20_DATA.find(d => d.id === s || s.includes(d.id));
  if (byId) return byId;

  // Try number extracted from string (e.g. 'hangul 9', '09. 뽀짝', '한글 9/20')
  const numMatch = s.match(/(?:hangul[-_\s]*|한글[-_\s]*|\[한글\s*)(\d+)/i) || s.match(/^(\d{1,2})[\.\s]/);
  if (numMatch) {
    const num = parseInt(numMatch[1], 10);
    const byNum = HANGUL_20_DATA.find(d => d.num === num);
    if (byNum) return byNum;
  }

  // Try phrase match
  const byPhrase = HANGUL_20_DATA.find(d => s.includes(d.phrase.toLowerCase()));
  if (byPhrase) return byPhrase;

  return null;
}

export interface HangulCompositeOptions {
  hangulText?: string;
  englishSub?: string;
  themeColor?: string;
  position?: 'bottom-center' | 'bottom-right' | 'bottom-left' | 'top-center' | 'top-right';
  badgeStyle?: 'diecut' | 'pill';
  scale?: number; // default 1.0
  customX?: number; // percentage (0..100) or pixel
  customY?: number; // percentage (0..100) or pixel
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
 * Composites 100% typo-free, professional Korean Hangul calligraphy & subtitle
 * onto a clean baby animal illustration canvas with a thick white die-cut border.
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

        const hangul = (options.hangulText || '괜찮아').trim();
        const sub = (options.englishSub || "It's Okay").trim();
        const themeColor = options.themeColor || '#E11D48';
        const position = options.position || 'bottom-center';
        const userScale = options.scale || 1.0;

        // 2. Scan subject bounding box to intelligently position typography
        // Probe bottom bounds of the illustration
        let subjectBottomY = Math.round(h * 0.88);
        let subjectCenterX = Math.round(w * 0.5);

        try {
          const sampleData = ctx.getImageData(0, 0, w, h).data;
          let maxY = 0;
          let minX = w, maxX = 0;

          // Scan in steps of 4 pixels for high performance
          for (let y = Math.round(h * 0.3); y < h; y += 4) {
            for (let x = 0; x < w; x += 4) {
              const idx = (y * w + x) * 4;
              const a = sampleData[idx + 3];
              const r = sampleData[idx];
              const g = sampleData[idx + 1];
              const b = sampleData[idx + 2];
              
              // Non-white, non-transparent pixel
              const isNotWhite = !(r >= 250 && g >= 250 && b >= 250);
              if (a > 20 && isNotWhite) {
                if (y > maxY) maxY = y;
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
              }
            }
          }

          if (maxY > h * 0.4 && maxX > minX) {
            subjectBottomY = maxY;
            subjectCenterX = Math.round((minX + maxX) / 2);
          }
        } catch {
          // Fallback to default proportions
        }

        // 3. Compute typography scale relative to canvas size
        const baseFontSize = Math.round(w * 0.125 * userScale); // ~128px for 1024x1024
        const subFontSize = Math.max(20, Math.round(baseFontSize * 0.38));

        // Determine X, Y based on position
        let targetX = subjectCenterX;
        let targetY = Math.min(h - Math.round(baseFontSize * 0.7), subjectBottomY + Math.round(baseFontSize * 0.15));

        if (position === 'bottom-left') {
          targetX = Math.round(w * 0.28);
        } else if (position === 'bottom-right') {
          targetX = Math.round(w * 0.72);
        } else if (position === 'top-center') {
          targetY = Math.round(h * 0.16);
        } else if (position === 'top-right') {
          targetX = Math.round(w * 0.75);
          targetY = Math.round(h * 0.18);
        }

        // Apply custom percentage coordinates if provided
        if (options.customX !== undefined) {
          targetX = options.customX <= 100 ? (options.customX / 100) * w : options.customX;
        }
        if (options.customY !== undefined) {
          targetY = options.customY <= 100 ? (options.customY / 100) * h : options.customY;
        }

        // 4. Render Hangul Typography with Multi-Pass Die-Cut White Outline & Shadow
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Font configuration
        ctx.font = `900 ${baseFontSize}px 'Jua', 'Gaegu', cursive, sans-serif`;

        const hangulWidth = ctx.measureText(hangul).width;
        const totalBadgeW = Math.max(hangulWidth * 1.35, baseFontSize * 2.8);
        const hangulY = targetY - Math.round(subFontSize * 0.55);
        const subY = targetY + Math.round(baseFontSize * 0.42);

        // --- Pass 1: Die-Cut Outer Drop Shadow ---
        ctx.shadowColor = 'rgba(0, 0, 0, 0.26)';
        ctx.shadowBlur = Math.round(baseFontSize * 0.18);
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = Math.max(4, Math.round(baseFontSize * 0.08));

        // Thick die-cut pure white border surrounding the Hangul text
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = Math.round(baseFontSize * 0.36); // Thick die-cut sticker edge
        ctx.strokeText(hangul, targetX, hangulY);

        // --- Pass 2: Clean pure white stroke without shadow to prevent interior halo ---
        ctx.shadowColor = 'transparent';
        ctx.lineWidth = Math.round(baseFontSize * 0.34);
        ctx.strokeText(hangul, targetX, hangulY);

        // --- Pass 3: Subtle contrasting inner border (2-3px) for pop ---
        ctx.lineWidth = Math.round(baseFontSize * 0.06);
        ctx.strokeStyle = '#FFFFFF';
        ctx.strokeText(hangul, targetX, hangulY);

        // --- Pass 4: Main Hangul Color Fill ---
        ctx.fillStyle = themeColor;
        ctx.fillText(hangul, targetX, hangulY);

        // 5. Render English Subtitle Badge (Clean Pill or die-cut label)
        if (sub && sub.length > 0) {
          ctx.font = `800 ${subFontSize}px 'Fredoka', 'Comic Neue', sans-serif`;
          const subMetrics = ctx.measureText(sub);
          const pillPadX = Math.round(subFontSize * 0.65);
          const pillPadY = Math.round(subFontSize * 0.28);
          const pillW = subMetrics.width + pillPadX * 2;
          const pillH = subFontSize + pillPadY * 2;
          const pillX = targetX - pillW / 2;
          const pillY = subY - pillH / 2;
          const pillRadius = Math.round(pillH / 2);

          // Draw pill background with white die-cut border
          ctx.save();
          // Drop shadow for subtitle pill
          ctx.shadowColor = 'rgba(0, 0, 0, 0.18)';
          ctx.shadowBlur = Math.round(subFontSize * 0.25);
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 2;

          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.roundRect(pillX, pillY, pillW, pillH, pillRadius);
          ctx.fill();
          ctx.restore();

          // Delicate theme-colored border for the pill
          ctx.strokeStyle = themeColor;
          ctx.lineWidth = Math.max(2, Math.round(subFontSize * 0.1));
          ctx.beginPath();
          ctx.roundRect(pillX, pillY, pillW, pillH, pillRadius);
          ctx.stroke();

          // Subtitle text in theme color
          ctx.fillStyle = themeColor;
          ctx.fillText(sub, targetX, subY);
        }

        ctx.restore();

        // 6. Output as high-quality PNG data URL
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
      img.onerror = (e) => reject(new Error('Failed to load image for typography composite'));
      img.src = imageSource;
    } else {
      processImage(imageSource);
    }
  });
}
