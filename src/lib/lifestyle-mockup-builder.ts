/**
 * Lifestyle Mockup Generator for Etsy Digital Stickers & Pinterest Pins
 * Automatically generates 3 hyper-realistic, aesthetic real-life sticker mockups:
 * 1. 📖 Journal / Planner Deco (Cozy wooden desk, open journal, latte, dry flowers)
 * 2. 💻 Laptop Cover Deco (MacBook cover with artful sticker placement)
 * 3. 🥤 Tumbler & Desk Lifestyle (Minimalist white insulated tumbler with desk stickers)
 *
 * Output: High-Resolution 2048x2048 JPG (0.95 quality) ready for Etsy secondary photos (photos #2, #3, #4)
 * and Pinterest 1000x1500 / Square Pins.
 */

import { processTransparentPNG } from './image-processor';

export interface LifestyleMockupResult {
  id: 'journal' | 'laptop' | 'tumbler';
  title: string;
  filename: string;
  dataUrl: string;
  description: string;
}

interface StickerPlacementSlot {
  xPct: number;     // 0.0 ~ 1.0 (X center position in ratio)
  yPct: number;     // 0.0 ~ 1.0 (Y center position in ratio)
  sizePct: number;  // 0.0 ~ 1.0 (Relative size ratio compared to canvas width)
  tiltDeg: number;  // Rotation in degrees
  shadowBlur: number;
  shadowAlpha: number;
}

interface MockupTemplateConfig {
  id: 'journal' | 'laptop' | 'tumbler';
  title: string;
  bgUrl: string;
  description: string;
  slots: StickerPlacementSlot[];
}

const MOCKUP_CONFIGS: MockupTemplateConfig[] = [
  {
    id: 'journal',
    title: '📖 다이어리 / 굿노트 플래너 다꾸 목업',
    bgUrl: '/mockup_journal.jpg',
    description: '원목 책상 위 펼쳐진 감성 다이어리에 스티커를 아기자기하게 붙인 다꾸 연출 컷',
    slots: [
      // Right Page (Main focus page)
      { xPct: 0.655, yPct: 0.490, sizePct: 0.260, tiltDeg: -5, shadowBlur: 14, shadowAlpha: 0.22 },
      { xPct: 0.725, yPct: 0.335, sizePct: 0.185, tiltDeg: 8, shadowBlur: 12, shadowAlpha: 0.20 },
      { xPct: 0.605, yPct: 0.665, sizePct: 0.175, tiltDeg: 4, shadowBlur: 12, shadowAlpha: 0.20 },
      // Left Page (Complementary deco)
      { xPct: 0.315, yPct: 0.435, sizePct: 0.210, tiltDeg: -7, shadowBlur: 14, shadowAlpha: 0.20 },
    ],
  },
  {
    id: 'laptop',
    title: '💻 맥북 / 노트북 상판 스티커 데코 목업',
    bgUrl: '/mockup_laptop.jpg',
    description: '애플 맥북 실버 상판에 개성 넘치게 배치된 스트릿 & 감성 스티커 밤 연출 컷',
    slots: [
      // Near Apple logo bottom-left
      { xPct: 0.410, yPct: 0.585, sizePct: 0.210, tiltDeg: -12, shadowBlur: 12, shadowAlpha: 0.26 },
      // Top-right of Apple logo
      { xPct: 0.665, yPct: 0.430, sizePct: 0.190, tiltDeg: 14, shadowBlur: 12, shadowAlpha: 0.24 },
      // Bottom-right corner
      { xPct: 0.635, yPct: 0.645, sizePct: 0.185, tiltDeg: -6, shadowBlur: 12, shadowAlpha: 0.24 },
      // Top-left corner
      { xPct: 0.395, yPct: 0.405, sizePct: 0.165, tiltDeg: 9, shadowBlur: 10, shadowAlpha: 0.22 },
      // On wooden desk table next to laptop
      { xPct: 0.225, yPct: 0.745, sizePct: 0.175, tiltDeg: -15, shadowBlur: 16, shadowAlpha: 0.28 },
    ],
  },
  {
    id: 'tumbler',
    title: '🥤 화이트 텀블러 & 데스크 라이프스타일 목업',
    bgUrl: '/mockup_tumbler.jpg',
    description: '홈카페 원형 텀블러 본체에 붙인 스티커와 책상 위 연출 스티커 조화 컷',
    slots: [
      // Tumbler body center
      { xPct: 0.490, yPct: 0.540, sizePct: 0.205, tiltDeg: -1, shadowBlur: 14, shadowAlpha: 0.28 },
      // Tumbler body lower
      { xPct: 0.490, yPct: 0.675, sizePct: 0.130, tiltDeg: 3, shadowBlur: 10, shadowAlpha: 0.26 },
      // Left desk runner
      { xPct: 0.285, yPct: 0.730, sizePct: 0.190, tiltDeg: -14, shadowBlur: 16, shadowAlpha: 0.26 },
      // Right desk corner
      { xPct: 0.680, yPct: 0.710, sizePct: 0.170, tiltDeg: 15, shadowBlur: 16, shadowAlpha: 0.26 },
    ],
  },
];

/**
 * Robust image loader with CORS handling and fallbacks.
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    let settled = false;
    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        reject(new Error(`Timeout loading image: ${src.slice(0, 80)}`));
      }
    }, 15000);

    img.onload = () => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        resolve(img);
      }
    };

    img.onerror = () => {
      if (settled) return;
      const fb = new Image();
      fb.onload = () => {
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          resolve(fb);
        }
      };
      fb.onerror = (err) => {
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          reject(new Error(`Failed to load image: ${String(err)}`));
        }
      };
      fb.src = src;
    };

    img.crossOrigin = 'anonymous';
    img.src = src;
  });
}

/**
 * Trims transparent bounds from canvas to eliminate empty white/transparent borders
 */
function trimCanvas(sourceCanvas: HTMLCanvasElement): HTMLCanvasElement {
  const ctx = sourceCanvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return sourceCanvas;

  const w = sourceCanvas.width;
  const h = sourceCanvas.height;
  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;

  let minX = w, minY = h, maxX = 0, maxY = 0;
  let found = false;

  for (let y = 0; y < h; y += 2) {
    for (let x = 0; x < w; x += 2) {
      const alpha = data[(y * w + x) * 4 + 3];
      if (alpha > 20) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
        found = true;
      }
    }
  }

  if (!found) return sourceCanvas;

  const pad = 4;
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(w, maxX + pad);
  maxY = Math.min(h, maxY + pad);

  const trimW = Math.max(1, maxX - minX);
  const trimH = Math.max(1, maxY - minY);

  const trimmed = document.createElement('canvas');
  trimmed.width = trimW;
  trimmed.height = trimH;
  const tCtx = trimmed.getContext('2d');
  if (tCtx) {
    tCtx.drawImage(sourceCanvas, minX, minY, trimW, trimH, 0, 0, trimW, trimH);
  }
  return trimmed;
}

/**
 * Prepares transparent sticker canvases for quick compositing.
 */
async function prepareStickerCanvases(stickers: any[], maxCount: number = 8): Promise<HTMLCanvasElement[]> {
  const prepared: HTMLCanvasElement[] = [];

  // Exclude master covers
  const candidates = stickers.filter((s: any) => {
    const title = (s.title || s.topic || '').toLowerCase();
    return !title.includes('마스터') && !title.includes('master cover') && !title.includes('bundle');
  });

  const selectedStickers = (candidates.length > 0 ? candidates : stickers).slice(0, maxCount);

  for (const sticker of selectedStickers) {
    try {
      const srcUrl = sticker.transparent_png_url || sticker.image_url;
      let canvas: HTMLCanvasElement;

      if (sticker.transparent_png_url) {
        const img = await loadImage(srcUrl);
        canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || 1000;
        canvas.height = img.naturalHeight || 1000;
        const cCtx = canvas.getContext('2d');
        if (cCtx) cCtx.drawImage(img, 0, 0);
      } else {
        const transparentDataUrl = await processTransparentPNG(srcUrl, {
          targetWidth: 1200,
          targetHeight: 1200,
          tolerance: 38,
        });
        const img = await loadImage(transparentDataUrl);
        canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || 1000;
        canvas.height = img.naturalHeight || 1000;
        const cCtx = canvas.getContext('2d');
        if (cCtx) cCtx.drawImage(img, 0, 0);
      }

      const trimmed = trimCanvas(canvas);
      prepared.push(trimmed);
    } catch (e) {
      console.warn('Failed to prepare transparent sticker for mockup:', sticker.id, e);
    }
  }

  return prepared;
}

/**
 * Builds a single lifestyle mockup image on a 2048x2048 canvas.
 */
export async function renderSingleLifestyleMockup(
  config: MockupTemplateConfig,
  stickerCanvases: HTMLCanvasElement[],
  themeName: string = 'Sticker'
): Promise<LifestyleMockupResult> {
  const targetDim = 2048; // High resolution Etsy listing standard
  const canvas = document.createElement('canvas');
  canvas.width = targetDim;
  canvas.height = targetDim;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context not available');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // 1. Draw Mockup Background Photo
  const bgImg = await loadImage(config.bgUrl);
  ctx.drawImage(bgImg, 0, 0, targetDim, targetDim);

  // 2. Place Stickers into Configured Slots
  if (stickerCanvases.length > 0) {
    config.slots.forEach((slot, idx) => {
      const stickerCanvas = stickerCanvases[idx % stickerCanvases.length];
      if (!stickerCanvas) return;

      const sw = stickerCanvas.width;
      const sh = stickerCanvas.height;
      if (sw === 0 || sh === 0) return;

      const aspect = sw / sh;
      const slotBaseDim = targetDim * slot.sizePct;
      let drawW = slotBaseDim;
      let drawH = slotBaseDim / aspect;

      if (drawH > slotBaseDim) {
        drawH = slotBaseDim;
        drawW = slotBaseDim * aspect;
      }

      const posX = targetDim * slot.xPct;
      const posY = targetDim * slot.yPct;

      ctx.save();
      ctx.translate(posX, posY);
      ctx.rotate((slot.tiltDeg * Math.PI) / 180);

      // Realistic Die-Cut Drop Shadow for tactile sticker effect
      ctx.shadowColor = `rgba(0, 0, 0, ${slot.shadowAlpha})`;
      ctx.shadowBlur = slot.shadowBlur * 2;
      ctx.shadowOffsetX = Math.sin((slot.tiltDeg * Math.PI) / 180) * 4 + 4;
      ctx.shadowOffsetY = slot.shadowBlur + 6;

      ctx.drawImage(stickerCanvas, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();
    });
  }

  // 3. Export as Ultra High-Res JPEG (0.95 Quality)
  const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
  const cleanTheme = themeName.replace(/[^a-zA-Z0-9_-]/g, '_');

  return {
    id: config.id,
    title: config.title,
    filename: `02_Mockup_${config.id.toUpperCase()}_${cleanTheme}.jpg`,
    dataUrl,
    description: config.description,
  };
}

/**
 * Generates all 3 lifestyle mockups in parallel or sequential batch.
 */
export async function generateAllLifestyleMockups(
  stickers: any[],
  themeName: string = 'Sticker_Pack',
  onProgress?: (current: number, total: number, message: string) => void
): Promise<LifestyleMockupResult[]> {
  onProgress?.(1, 4, '스티커 배경 투명화 및 디테일 최적화 중...');
  const stickerCanvases = await prepareStickerCanvases(stickers, 6);

  const results: LifestyleMockupResult[] = [];
  const total = MOCKUP_CONFIGS.length;

  for (let i = 0; i < total; i++) {
    const config = MOCKUP_CONFIGS[i];
    onProgress?.(i + 2, total + 1, `${config.title} 정밀 합성 렌더링 중...`);
    const result = await renderSingleLifestyleMockup(config, stickerCanvases, themeName);
    results.push(result);
  }

  onProgress?.(total + 1, total + 1, '실물 시연 목업 3종 완성!');
  return results;
}
