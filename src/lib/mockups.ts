export interface MockupOverlay {
  x: number;
  y: number;
  width: number;
  height: number;
  blendMode: string;
}

export interface MockupTemplate {
  id: string;
  name: string;
  imageUrl: string;
  overlay: MockupOverlay;
  category?: 'pod' | 'sticker' | 'all';
}

export const MOCKUP_TEMPLATES: MockupTemplate[] = [
  // --- 👕 POD Commercial Apparel & Goods Mockups ---
  {
    id: 'white-tshirt',
    name: '흰색 코튼 티셔츠',
    imageUrl: '/mockup_1.png',
    category: 'pod',
    overlay: {
      x: 320, 
      y: 280,
      width: 360,
      height: 360,
      blendMode: 'multiply'
    }
  },
  {
    id: 'cream-tshirt',
    name: '크림/베이지 티셔츠',
    imageUrl: '/mockup_cream.jpg',
    category: 'pod',
    overlay: {
      x: 322,
      y: 300,
      width: 380,
      height: 380,
      blendMode: 'multiply'
    }
  },
  {
    id: 'black-tshirt',
    name: '검정 코튼 티셔츠',
    imageUrl: '/mockup_black.jpg',
    category: 'pod',
    overlay: {
      x: 322,
      y: 300,
      width: 380,
      height: 380,
      blendMode: 'source-over'
    }
  },
  {
    id: 'navy-tshirt',
    name: '네이비 티셔츠',
    imageUrl: '/mockup_navy.jpg',
    category: 'pod',
    overlay: {
      x: 322,
      y: 300,
      width: 380,
      height: 380,
      blendMode: 'source-over'
    }
  },
  {
    id: 'folded-tee',
    name: '접힌 티셔츠 (디스플레이)',
    imageUrl: '/mockup_folded.png',
    category: 'pod',
    overlay: {
      x: 350,
      y: 400,
      width: 300,
      height: 300,
      blendMode: 'multiply'
    }
  },
  {
    id: 'model-adult-female',
    name: '성인 여성 피팅 착샷',
    imageUrl: '/mockup_adult_female_smiling_1786343996457.jpg',
    category: 'pod',
    overlay: {
      x: 402,
      y: 425,
      width: 220,
      height: 220,
      blendMode: 'multiply'
    }
  },
  {
    id: 'model-boy',
    name: '키즈 남아 피팅 착샷',
    imageUrl: '/mockup_boy_smiling_1786343963751.jpg',
    category: 'pod',
    overlay: {
      x: 412,
      y: 580,
      width: 200,
      height: 200,
      blendMode: 'multiply'
    }
  },
  {
    id: 'model-girl',
    name: '키즈 여아 피팅 착샷',
    imageUrl: '/mockup_girl_smiling_v2_1786347441131.jpg',
    category: 'pod',
    overlay: {
      x: 412,
      y: 460,
      width: 200,
      height: 200,
      blendMode: 'multiply'
    }
  },
  {
    id: 'totebag',
    name: '캔버스 에코백 목업',
    imageUrl: '/mockup_totebag.png',
    category: 'pod',
    overlay: {
      x: 360, 
      y: 460,
      width: 300,
      height: 300,
      blendMode: 'multiply'
    }
  },
  {
    id: 'mug',
    name: '도자기 머그컵 목업',
    imageUrl: '/mockup_mug.png',
    category: 'pod',
    overlay: {
      x: 380,
      y: 380,
      width: 240,
      height: 240,
      blendMode: 'multiply'
    }
  },
  // --- 📦 Etsy Digital PNG Sticker Pack Mockups ---
  {
    id: 'laptop-sticker',
    name: '💻 맥북/노트북 상판 스티커 목업',
    imageUrl: '/mockup_laptop.jpg',
    category: 'sticker',
    overlay: {
      x: 390,
      y: 430,
      width: 320,
      height: 320,
      blendMode: 'source-over'
    }
  },
  {
    id: 'journal-sticker',
    name: '📖 다이어리/굿노트 플래너 스티커 목업',
    imageUrl: '/mockup_journal.jpg',
    category: 'sticker',
    overlay: {
      x: 500,
      y: 350,
      width: 280,
      height: 280,
      blendMode: 'source-over'
    }
  },
  {
    id: 'tumbler-sticker',
    name: '🥤 텀블러/보틀 다이컷 스티커 목업',
    imageUrl: '/mockup_tumbler.jpg',
    category: 'sticker',
    overlay: {
      x: 410,
      y: 450,
      width: 200,
      height: 250,
      blendMode: 'source-over'
    }
  },
  {
    id: 'phone-sticker',
    name: '📱 투명 폰케이스/아이패드 스티커 목업',
    imageUrl: '/mockup_laptop.jpg',
    category: 'sticker',
    overlay: {
      x: 430,
      y: 400,
      width: 240,
      height: 240,
      blendMode: 'source-over'
    }
  }
];

export function getMockupsForMode(isStickerMode: boolean): MockupTemplate[] {
  if (isStickerMode) {
    return MOCKUP_TEMPLATES.filter((m) => m.category === 'sticker' || m.category === 'all');
  }
  return MOCKUP_TEMPLATES.filter((m) => m.category === 'pod' || m.category === 'all');
}
