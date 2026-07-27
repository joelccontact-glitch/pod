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
    name: '흰색 반팔 티셔츠',
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
    id: 'model-adult-male',
    name: '성인 남성 티셔츠',
    imageUrl: '/mockup_adult_male_1784883404035.jpg',
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
    imageUrl: '/mockup_adult_female_1784883500734.jpg',
    overlay: {
      x: 350,
      y: 400,
      width: 300,
      height: 300,
      blendMode: 'multiply'
    }
  },
  {
    id: 'model-boy',
    name: '남자 아이 티셔츠',
    imageUrl: '/mockup_boy_1784883510419.jpg',
    overlay: {
      x: 350,
      y: 400,
      width: 300,
      height: 300,
      blendMode: 'multiply'
    }
  },
  {
    id: 'model-girl',
    name: '여자 아이 티셔츠',
    imageUrl: '/mockup_girl_1784883520813.jpg',
    overlay: {
      x: 350,
      y: 400,
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
      x: 250, 
      y: 300,
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
      x: 380, // Calibrated for generated mug
      y: 380,
      width: 240,
      height: 240,
      blendMode: 'multiply'
    }
  }
];

// force rebuild
