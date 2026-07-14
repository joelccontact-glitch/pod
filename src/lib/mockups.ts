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
