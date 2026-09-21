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
  onProgress?: (current: number, total: number, message: string) => void;
}

interface BoundingBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Finds the non-transparent bounding box of an image canvas
 * to eliminate unnecessary outer empty margins and maximize sticker sizing.
 */
function getTrimmedBoundingBox(ctx: CanvasRenderingContext2D, width: number, height: number): BoundingBox {
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  let found = false;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const alpha = data[(y * width + x) * 4 + 3];
      if (alpha > 15) { // non-transparent threshold
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
        found = true;
      }
    }
  }

  if (!found) {
    return { x: 0, y: 0, w: width, h: height };
  }

  // Add small 4px breathing padding around trimmed box if within bounds
  const pad = 4;
  const clampedX = Math.max(0, minX - pad);
  const clampedY = Math.max(0, minY - pad);
  const clampedW = Math.min(width - clampedX, (maxX - minX + 1) + pad * 2);
  const clampedH = Math.min(height - clampedY, (maxY - minY + 1) + pad * 2);

  return { x: clampedX, y: clampedY, w: clampedW, h: clampedH };
}

/**
 * Loads an image from a URL or DataURL into an HTMLImageElement.
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

/**
 * Generates a single A4 Printable Sticker Sheet data URL (PNG format, 300 DPI, max 20 items in 4x5).
 */
export async function generateA4StickerSheet(
  stickers: any[],
  options: StickerSheetOptions = {}
): Promise<string> {
  const {
    background = 'transparent',
    format = 'a4',
    onProgress,
  } = options;

  // A4 at 300 DPI: 2480 x 3508 pixels
  // US Letter at 300 DPI: 2550 x 3300 pixels
  const canvasWidth = format === 'us_letter' ? 2550 : 2480;
  const canvasHeight = format === 'us_letter' ? 3300 : 3508;

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

  // Layout parameters (safe margins for home printers)
  const marginX = 140; // 140px left and right margin
  const marginY = 160; // 160px top and bottom margin
  const gapX = 40;     // 40px gap between columns
  const gapY = 48;     // 48px gap between rows

  const usableWidth = canvasWidth - marginX * 2;
  const usableHeight = canvasHeight - marginY * 2;

  const cellWidth = (usableWidth - (cols - 1) * gapX) / cols;
  const cellHeight = (usableHeight - (rows - 1) * gapY) / rows;

  // Cell inner padding (ensures stickers don't touch cell borders)
  const cellPadding = 18;
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
      if (!rawUrl) continue;

      // 1. Process transparent PNG (1200x1200 high resolution for sheet cell)
      const transparentDataUrl = await processTransparentPNG(rawUrl, {
        targetWidth: 1200,
        targetHeight: 1200,
      });

      const stickerImg = await loadImage(transparentDataUrl);

      // 2. Compute non-transparent bounding box on a temporary canvas
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = stickerImg.width;
      tempCanvas.height = stickerImg.height;
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) continue;

      tempCtx.drawImage(stickerImg, 0, 0);
      const bbox = getTrimmedBoundingBox(tempCtx, tempCanvas.width, tempCanvas.height);

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

      // 5. Draw sticker into the A4 canvas
      ctx.drawImage(
        tempCanvas,
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

  return canvas.toDataURL('image/png');
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
