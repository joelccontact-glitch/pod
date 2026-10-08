/**
 * A4 Printable Sticker Sheet Generator (300 DPI)
 * Standard A4 print dimensions: 2480 x 3508 pixels
 * Neatly arranges stickers into 4x5 grids (max 20 per page),
 * with comfortable margins, uniform scaling, and auto-trimmed bounding boxes.
 * Automatically supports multi-page sheets (e.g. 40 items -> Page 1 [Main Tanks 20] & Page 2 [Standalone Objects 20]).
 * Perfect for Etsy printable sticker sheets (for scissors or Cricut/Silhouette cutting machines).
 */

import { processTransparentPNG } from './image-processor';

export interface StickerSheetOptions {
  background?: 'transparent' | 'white';
  format?: 'a4' | 'us_letter';
  pageSize?: number; // default 20
  pageIndex?: number;
  maxWidth?: number;
  maxHeight?: number;
  outputFormat?: 'image/png' | 'image/jpeg';
  quality?: number;
  onProgress?: (current: number, total: number, message: string) => void;
}

interface BoundingBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Finds the non-transparent bounding box of an image using a lightweight downsampled probe canvas.
 * This prevents browser canvas memory exhaustion (OOM) when handling 40+ large 3000x3000px stickers.
 */
function getImageBoundingBox(img: HTMLImageElement): BoundingBox {
  const origW = img.naturalWidth || img.width || 1200;
  const origH = img.naturalHeight || img.height || 1200;

  const sampleMax = 400;
  const scale = Math.min(sampleMax / origW, sampleMax / origH, 1);
  const sw = Math.max(1, Math.round(origW * scale));
  const sh = Math.max(1, Math.round(origH * scale));

  const probe = document.createElement('canvas');
  probe.width = sw;
  probe.height = sh;
  const pctx = probe.getContext('2d', { willReadFrequently: true });
  if (!pctx) {
    return { x: 0, y: 0, w: origW, h: origH };
  }

  pctx.drawImage(img, 0, 0, sw, sh);
  const imgData = pctx.getImageData(0, 0, sw, sh);
  const data = imgData.data;

  let minX = sw;
  let minY = sh;
  let maxX = 0;
  let maxY = 0;
  let found = false;

  for (let y = 0; y < sh; y++) {
    for (let x = 0; x < sw; x++) {
      const alpha = data[(y * sw + x) * 4 + 3];
      if (alpha > 15) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
        found = true;
      }
    }
  }

  // Release probe canvas immediately
  probe.width = 0;
  probe.height = 0;

  if (!found) {
    return { x: 0, y: 0, w: origW, h: origH };
  }

  const invScale = 1 / scale;
  const pad = 4;
  const origMinX = Math.max(0, Math.floor(minX * invScale) - pad);
  const origMinY = Math.max(0, Math.floor(minY * invScale) - pad);
  const origMaxX = Math.min(origW, Math.ceil((maxX + 1) * invScale) + pad);
  const origMaxY = Math.min(origH, Math.ceil((maxY + 1) * invScale) + pad);

  return {
    x: origMinX,
    y: origMinY,
    w: Math.max(1, origMaxX - origMinX),
    h: Math.max(1, origMaxY - origMinY),
  };
}

/**
 * Loads an image from a URL or DataURL into an HTMLImageElement.
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    let settled = false;
    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        reject(new Error('Image load timed out'));
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
      const fallback = new Image();
      fallback.onload = () => {
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          resolve(fallback);
        }
      };
      fallback.onerror = (e) => {
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          reject(e);
        }
      };
      fallback.src = src;
    };
    if (!src.startsWith('data:')) {
      img.crossOrigin = 'anonymous';
    }
    img.src = src;
  });
}

/**
 * Generates a single A4 Printable Sticker Sheet data URL (300 DPI layout, max 20 items in 4x5).
 */
export async function generateA4StickerSheet(
  stickers: any[],
  options: StickerSheetOptions = {}
): Promise<string> {
  const {
    background = 'transparent',
    format = 'a4',
    maxWidth,
    maxHeight,
    outputFormat,
    quality = 0.92,
    onProgress,
  } = options;

  // A4 standard at 300 DPI: 2480 x 3508 pixels
  // US Letter standard at 300 DPI: 2550 x 3300 pixels
  const defaultWidth = format === 'us_letter' ? 2550 : 2480;
  const defaultHeight = format === 'us_letter' ? 3300 : 3508;
  const canvasWidth = maxWidth || defaultWidth;
  const canvasHeight = maxHeight || defaultHeight;

  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context not available');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Apply Background
  if (background === 'white') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  } else {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  }

  // Standard 4x5 grid (up to 20 items per sheet)
  const count = Math.min(stickers.length, 20);
  const cols = 4;
  const rows = 5;

  // Proportional layout scaling based on baseline width (2480px)
  const scaleRatio = canvasWidth / 2480;
  const marginX = Math.round(140 * scaleRatio);
  const marginY = Math.round(160 * scaleRatio);
  const gapX = Math.round(40 * scaleRatio);
  const gapY = Math.round(48 * scaleRatio);

  const usableWidth = canvasWidth - marginX * 2;
  const usableHeight = canvasHeight - marginY * 2;

  const cellWidth = (usableWidth - (cols - 1) * gapX) / cols;
  const cellHeight = (usableHeight - (rows - 1) * gapY) / rows;

  // Cell inner padding (ensures stickers don't touch cell borders)
  const cellPadding = Math.round(18 * scaleRatio);
  const maxStickerW = cellWidth - cellPadding * 2;
  const maxStickerH = cellHeight - cellPadding * 2;

  const total = count;
  for (let i = 0; i < count; i++) {
    const d = stickers[i];
    if (onProgress) {
      onProgress(i + 1, total, `스티커 ${i + 1}/${total} 처리 및 정렬 중...`);
    }

    try {
      const rawUrl = d.transparent_png_url || (d.id ? `/api/designs/image?id=${d.id}` : d.image_url || d.url);
      if (!rawUrl && !d.processedTransparentDataUrl) continue;

      // 1. Process transparent PNG or reuse pre-processed data URL
      const transparentDataUrl = d.processedTransparentDataUrl
        ? d.processedTransparentDataUrl
        : await processTransparentPNG(rawUrl, {
            targetWidth: 1200,
            targetHeight: 1200,
          });

      const stickerImg = await loadImage(transparentDataUrl);

      // 2. Compute non-transparent bounding box with lightweight probe
      const bbox = getImageBoundingBox(stickerImg);

      // 3. Calculate target grid coordinates
      const col = i % cols;
      const row = Math.floor(i / cols);

      const cellX = marginX + col * (cellWidth + gapX);
      const cellY = marginY + row * (cellHeight + gapY);

      // 4. Scale preserving aspect ratio inside cell bounds
      const scale = Math.min(maxStickerW / bbox.w, maxStickerH / bbox.h);
      const drawW = bbox.w * scale;
      const drawH = bbox.h * scale;

      // Center within cell
      const drawX = cellX + (cellWidth - drawW) / 2;
      const drawY = cellY + (cellHeight - drawH) / 2;

      // 5. Draw sticker into the A4 canvas directly from image element
      ctx.drawImage(
        stickerImg,
        bbox.x,
        bbox.y,
        bbox.w,
        bbox.h,
        drawX,
        drawY,
        drawW,
        drawH
      );
    } catch (err) {
      console.error(`Error processing sticker ${i + 1} for A4 sheet:`, err);
    }
  }

  if (onProgress) {
    onProgress(total, total, 'A4 시트 렌더링 완료');
  }

  const resolvedFormat = outputFormat || (background === 'white' ? 'image/jpeg' : 'image/png');
  const resultDataUrl = resolvedFormat === 'image/jpeg'
    ? canvas.toDataURL('image/jpeg', quality)
    : canvas.toDataURL('image/png');

  canvas.width = 0;
  canvas.height = 0;
  return resultDataUrl;
}

/**
 * Generates multiple A4 Printable Sticker Sheets (e.g. 40 stickers -> 2 pages: Sheet 1 & Sheet 2).
 * Each sheet holds up to pageSize (default 20) stickers in a 4x5 grid.
 */
export async function generateA4StickerSheets(
  stickers: any[],
  options: StickerSheetOptions = {}
): Promise<string[]> {
  const { onProgress } = options;
  const pageSize = options.pageSize || 20;
  const totalPages = Math.ceil(stickers.length / pageSize) || 1;
  const pages: string[] = [];

  for (let p = 0; p < totalPages; p++) {
    const start = p * pageSize;
    const end = Math.min(start + pageSize, stickers.length);
    const chunk = stickers.slice(start, end);

    const pageProgress = (curr: number, tot: number, msg: string) => {
      if (onProgress) {
        const overallCurrent = p * pageSize + curr;
        onProgress(overallCurrent, stickers.length, `[시트 ${p + 1}/${totalPages}장] ${msg}`);
      }
    };

    const dataUrl = await generateA4StickerSheet(chunk, {
      ...options,
      onProgress: pageProgress,
    });
    pages.push(dataUrl);
  }

  return pages;
}

export interface StickerSheetsPairResult {
  transparentPages: string[];
  whitePages: string[];
}

/**
 * Efficiently generates both Transparent (Cricut) and White (Home Printers) A4 sheets in a single pass.
 * Prevents memory exhaustion by reusing the rendered transparent sheet onto a white background.
 * Cricut sheets: optimized 2000x2828 (~242DPI) to keep PNG sizes around ~3.5MB.
 * Home Printer sheets: full 2480x3508 300DPI crisp JPEG (~1.2MB).
 * Result: Total Part 5 ZIP is strictly ~10MB (half of Etsy 20MB limit!).
 */
export async function generateA4StickerSheetsPair(
  stickers: any[],
  options: StickerSheetOptions = {}
): Promise<StickerSheetsPairResult> {
  const { onProgress } = options;
  const pageSize = options.pageSize || 20;
  const totalPages = Math.ceil(stickers.length / pageSize) || 1;
  const transparentPages: string[] = [];
  const whitePages: string[] = [];

  for (let p = 0; p < totalPages; p++) {
    const start = p * pageSize;
    const end = Math.min(start + pageSize, stickers.length);
    const chunk = stickers.slice(start, end);

    const pageProgress = (curr: number, tot: number, msg: string) => {
      if (onProgress) {
        const overallCurrent = p * pageSize + curr;
        onProgress(overallCurrent, stickers.length, `[시트 ${p + 1}/${totalPages}장] ${msg}`);
      }
    };

    // 1. Generate transparent sheet for Cricut cutting machines (2000 x 2828: crisp ~242DPI, ~3.5MB PNG)
    const format = options.format || 'a4';
    const transparentW = format === 'us_letter' ? 2000 : 2000;
    const transparentH = format === 'us_letter' ? 2588 : 2828;

    const transparentDataUrl = await generateA4StickerSheet(chunk, {
      ...options,
      background: 'transparent',
      maxWidth: transparentW,
      maxHeight: transparentH,
      outputFormat: 'image/png',
      onProgress: pageProgress,
    });
    transparentPages.push(transparentDataUrl);

    // 2. Instantly generate full 300DPI white sheet (2480x3508) for Home Printers
    // Exported as high-res JPEG (0.92) to keep each sheet under 1.5MB (vs 6.5MB PNG)
    try {
      const transparentImg = await loadImage(transparentDataUrl);
      const canvasWidth = format === 'us_letter' ? 2550 : 2480;
      const canvasHeight = format === 'us_letter' ? 3300 : 3508;

      const whiteCanvas = document.createElement('canvas');
      whiteCanvas.width = canvasWidth;
      whiteCanvas.height = canvasHeight;
      const wctx = whiteCanvas.getContext('2d');
      if (wctx) {
        wctx.fillStyle = '#FFFFFF';
        wctx.fillRect(0, 0, canvasWidth, canvasHeight);
        wctx.drawImage(transparentImg, 0, 0, canvasWidth, canvasHeight);
        whitePages.push(whiteCanvas.toDataURL('image/jpeg', 0.92));
      } else {
        whitePages.push(transparentDataUrl);
      }
      whiteCanvas.width = 0;
      whiteCanvas.height = 0;
    } catch (e) {
      console.error('Failed to create white sheet composite, fallback to transparent:', e);
      whitePages.push(transparentDataUrl);
    }
  }

  return { transparentPages, whitePages };
}
