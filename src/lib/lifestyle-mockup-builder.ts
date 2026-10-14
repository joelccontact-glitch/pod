/**
 * Lifestyle Mockup Generator for Etsy Digital Stickers & Pinterest Pins
 * Benchmark: Etsy Top 1% Best-Selling Digital Sticker Shops
 * 
 * 100% Top-Down 90-Degree Flat-Lay Perspective (Zero 3D perspective distortion!)
 * 1. 📱 iPad GoodNotes Digital Planner Spread (Top-Down Flat-Lay on aesthetic oak desk)
 * 2. 🖨️ A4 Label Sheet Print & DIY Scissors Craft Mockup (Printed sheet + Hand-cut stickers on journal)
 * 3. 📱 Clear Phone Case & Daily Lined Journal Deco Mockup (iPhone transparent case + Desk journal)
 *
 * Output: 2048x2048 Ultra High-Res JPEG (0.95 quality) ready for Etsy listing photos #2, #3, #4
 * and high-converting Pinterest visual search pins.
 */

import { processTransparentPNG } from './image-processor';

export interface LifestyleMockupResult {
  id: 'ipad_planner' | 'print_craft' | 'phone_journal';
  title: string;
  filename: string;
  dataUrl: string;
  description: string;
  recommendedUse: string;
}

interface StickerPlacementSlot {
  xPct: number;     // 0.0 ~ 1.0 (X center ratio)
  yPct: number;     // 0.0 ~ 1.0 (Y center ratio)
  sizePct: number;  // 0.0 ~ 1.0 (Width/Height ratio relative to canvas size)
  tiltDeg: number;  // Rotation in degrees
  shadowBlur: number;
  shadowAlpha: number;
  shadowOffsetY?: number;
}

interface MockupTemplateConfig {
  id: 'ipad_planner' | 'print_craft' | 'phone_journal';
  title: string;
  bgUrl: string;
  description: string;
  recommendedUse: string;
  slots: StickerPlacementSlot[];
}

const MOCKUP_CONFIGS: MockupTemplateConfig[] = [
  {
    id: 'ipad_planner',
    title: '📱 iPad 굿노트 디지털 플래너 다꾸 목업',
    bgUrl: '/mockup_ipad_planner.jpg',
    description: 'Etsy 1위 표준! 아이패드 위클리 플래너 서식에 스티커를 실제로 붙여 활용한 정면 컷',
    recommendedUse: 'Etsy 2번 사진 (In-Action Spread) & Pinterest 다꾸 핀',
    slots: [
      // 1. Right side "Notes" box on iPad screen (Main hero sticker)
      { xPct: 0.580, yPct: 0.510, sizePct: 0.145, tiltDeg: 0, shadowBlur: 6, shadowAlpha: 0.18, shadowOffsetY: 3 },
      // 2. Left side MON/TUE planner grid cell (Cleanly below Weekly Plan header)
      { xPct: 0.420, yPct: 0.435, sizePct: 0.115, tiltDeg: -3, shadowBlur: 5, shadowAlpha: 0.16, shadowOffsetY: 2 },
      // 3. Left side WED/THU planner grid cell
      { xPct: 0.410, yPct: 0.585, sizePct: 0.120, tiltDeg: 4, shadowBlur: 6, shadowAlpha: 0.18, shadowOffsetY: 3 },
      // 4. Right side To-Do / Checklist bottom space
      { xPct: 0.585, yPct: 0.770, sizePct: 0.120, tiltDeg: 2, shadowBlur: 6, shadowAlpha: 0.18, shadowOffsetY: 3 },
    ],
  },
  {
    id: 'print_craft',
    title: '🖨️ A4 라벨 인쇄 & DIY 가위 컷팅 목업',
    bgUrl: '/mockup_print_craft.jpg',
    description: '실물 인쇄 시트(우측)와 가위로 직접 오려 저널에 붙인(좌측) 생생한 핸드메이드 컷',
    recommendedUse: 'Etsy 3번 사진 (Print & Cut Showcase) & Pinterest 인쇄 핀',
    slots: [
      // Right Side: A4 White Printed Sticker Sheet (2x2 Neat Grid)
      { xPct: 0.630, yPct: 0.410, sizePct: 0.130, tiltDeg: 0, shadowBlur: 3, shadowAlpha: 0.12, shadowOffsetY: 1 },
      { xPct: 0.760, yPct: 0.410, sizePct: 0.130, tiltDeg: 0, shadowBlur: 3, shadowAlpha: 0.12, shadowOffsetY: 1 },
      { xPct: 0.630, yPct: 0.580, sizePct: 0.130, tiltDeg: 0, shadowBlur: 3, shadowAlpha: 0.12, shadowOffsetY: 1 },
      { xPct: 0.760, yPct: 0.580, sizePct: 0.130, tiltDeg: 0, shadowBlur: 3, shadowAlpha: 0.12, shadowOffsetY: 1 },
      // Left Side: Cream Journal Notebook (Cut and pasted stickers)
      { xPct: 0.380, yPct: 0.440, sizePct: 0.180, tiltDeg: -6, shadowBlur: 9, shadowAlpha: 0.22, shadowOffsetY: 5 },
      { xPct: 0.390, yPct: 0.630, sizePct: 0.160, tiltDeg: 5, shadowBlur: 9, shadowAlpha: 0.22, shadowOffsetY: 5 },
    ],
  },
  {
    id: 'phone_journal',
    title: '📱 투명 폰케이스 & 감성 줄노트 다꾸 목업',
    bgUrl: '/mockup_phone_journal.jpg',
    description: '아이폰 투명 케이스 뒷면과 책상 위 줄노트에 일상 소품으로 스티커를 부착한 컷',
    recommendedUse: 'Etsy 4번 사진 (Everyday Lifestyle) & Pinterest 라이프스타일 핀',
    slots: [
      // 1. Center back of iPhone inside transparent case (Main Hero Placement)
      { xPct: 0.630, yPct: 0.580, sizePct: 0.145, tiltDeg: 0, shadowBlur: 8, shadowAlpha: 0.24, shadowOffsetY: 3 },
      // 2. Open lined notebook - Left page (Upper area)
      { xPct: 0.180, yPct: 0.610, sizePct: 0.145, tiltDeg: -6, shadowBlur: 7, shadowAlpha: 0.18, shadowOffsetY: 3 },
      // 3. Open lined notebook - Left page (Lower area)
      { xPct: 0.170, yPct: 0.810, sizePct: 0.140, tiltDeg: 5, shadowBlur: 7, shadowAlpha: 0.18, shadowOffsetY: 3 },
      // 4. Open lined notebook - Right page (Clean placement, safe from gold pen)
      { xPct: 0.410, yPct: 0.740, sizePct: 0.150, tiltDeg: -4, shadowBlur: 7, shadowAlpha: 0.18, shadowOffsetY: 3 },
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
 * Trims transparent bounds from canvas to eliminate empty padding
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
      const shadowY = slot.shadowOffsetY ?? (slot.shadowBlur / 2 + 2);
      ctx.shadowColor = `rgba(0, 0, 0, ${slot.shadowAlpha})`;
      ctx.shadowBlur = slot.shadowBlur * 1.8;
      ctx.shadowOffsetX = Math.sin((slot.tiltDeg * Math.PI) / 180) * 3 + 2;
      ctx.shadowOffsetY = shadowY;

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
    recommendedUse: config.recommendedUse,
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
  onProgress?.(1, 4, '스티커 배경 투명화 및 정밀 다이컷 최적화 중...');
  const stickerCanvases = await prepareStickerCanvases(stickers, 6);

  const results: LifestyleMockupResult[] = [];
  const total = MOCKUP_CONFIGS.length;

  for (let i = 0; i < total; i++) {
    const config = MOCKUP_CONFIGS[i];
    onProgress?.(i + 2, total + 1, `${config.title} 정밀 렌더링 중...`);
    const result = await renderSingleLifestyleMockup(config, stickerCanvases, themeName);
    results.push(result);
  }

  onProgress?.(total + 1, total + 1, 'Etsy 벤치마크 목업 3종 완성!');
  return results;
}
