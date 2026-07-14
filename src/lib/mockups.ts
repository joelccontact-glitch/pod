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
    // Using the mockup image we generated and copied to public folder
    imageUrl: '/mockup_1.png',
    overlay: {
      x: 320, // These values will need to be calibrated to the specific image
      y: 280,
      width: 360,
      height: 360,
      blendMode: 'multiply'
    }
  },
  {
    id: 'totebag',
    name: '캔버스 에코백',
    // Using a reliable Unsplash placeholder for an eco bag
    imageUrl: 'https://images.unsplash.com/photo-1597423244037-519742d0a9f0?q=80&w=800&auto=format&fit=crop',
    overlay: {
      x: 200,
      y: 350,
      width: 400,
      height: 400,
      blendMode: 'multiply'
    }
  },
  {
    id: 'mug',
    name: '흰색 머그컵',
    // Using a reliable Unsplash placeholder for a mug
    imageUrl: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?q=80&w=800&auto=format&fit=crop',
    overlay: {
      x: 240,
      y: 200,
      width: 350,
      height: 350,
      blendMode: 'multiply'
    }
  }
];
