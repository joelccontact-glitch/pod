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
}

export const MOCKUP_TEMPLATES: MockupTemplate[] = [
  {
    id: 'white-tshirt',
    name: '흰색 티셔츠',
    imageUrl: '/mockup_1.png',
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
    name: '크림/베이지',
    imageUrl: '/mockup_cream.jpg',
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
    name: '검정 티셔츠',
    imageUrl: '/mockup_black.jpg',
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
    name: '접힌 티셔츠 (베이지 배경)',
    imageUrl: '/mockup_folded.png',
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
    name: '성인 여성 티셔츠',
    imageUrl: '/mockup_adult_female_smiling_1786343996457.jpg',
    overlay: {
      x: 350,
      y: 400,
      width: 320,
      height: 320,
      blendMode: 'multiply'
    }
  },
  {
    id: 'model-boy',
    name: '남자 아이 티셔츠',
    imageUrl: '/mockup_boy_smiling_1786343963751.jpg',
    overlay: {
      x: 360,
      y: 380,
      width: 300,
      height: 300,
      blendMode: 'multiply'
    }
  },
  {
    id: 'model-girl',
    name: '여자 아이 티셔츠',
    imageUrl: '/mockup_girl_smiling_1786343981630.jpg',
    overlay: {
      x: 360,
      y: 380,
      width: 300,
      height: 300,
      blendMode: 'multiply'
    }
  },

  {
    id: 'totebag',
    name: '캔버스 에코백',
    imageUrl: '/mockup_totebag.png',
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
    name: '흰색 머그컵',
    imageUrl: '/mockup_mug.png',
    overlay: {
      x: 380,
      y: 380,
      width: 240,
      height: 240,
      blendMode: 'multiply'
    }
  }
];

