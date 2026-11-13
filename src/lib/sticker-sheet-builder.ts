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
  totalPages?: number;
  title?: string;
  subType?: string;
  includeCommercialBanners?: boolean; // default true when background === 'white'
  maxWidth?: number;
  maxHeight?: number;
  outputFormat?: 'image/png' | 'image/jpeg';
  quality?: number;
  onProgress?: (current: number, total: number, message: string) => void;
}

/**
 * Automatically infers a clean, professional English commercial title based on theme/category keywords.
 */
export function getThemeEnglishTitle(categoryOrTitle: string, stickerCount: number = 20): string {
  const t = (categoryOrTitle || '').toLowerCase();
  const countStr = stickerCount > 20 ? '40+' : '20+';

  if (t.includes('thanksgiving') || t.includes('추수감사절') || t.includes('autumn') || t.includes('가을') || t.includes('fall')) {
    return `${countStr} CUTE FALL THANKSGIVING STICKER PACK`;
  }
  if (t.includes('christmas') || t.includes('크리스마스') || t.includes('스노우볼') || t.includes('winter') || t.includes('겨울')) {
    return `${countStr} CUTE CHRISTMAS SNOWGLOBE STICKER PACK`;
  }
  if (t.includes('foodimal') || t.includes('푸디멀') || t.includes('음식동물')) {
    return `${countStr} CUTE KAWAII FOODIMAL STICKER PACK`;
  }
  if (t.includes('axolotlemote') || t.includes('이모트') || t.includes('emote')) {
    return `${countStr} CUTE AXOLOTL EMOTES STICKER PACK`;
  }
  if (t.includes('axolotl') || t.includes('우파루파')) {
    return `${countStr} CUTE BABY AXOLOTL STICKER PACK`;
  }
  if (t.includes('deepsea') || t.includes('심해')) {
    return `${countStr} CUTE BIOLUMINESCENT DEEP SEA STICKER PACK`;
  }
  if (t.includes('dessert') || t.includes('디저트') || t.includes('베이커리') || t.includes('cafe') || t.includes('카페')) {
    return `${countStr} CUTE SWEET DESSERT & CAFE STICKER PACK`;
  }
  if (t.includes('booktok') || t.includes('북톡') || t.includes('독서') || t.includes('reading')) {
    return `${countStr} CUTE COZY READING BOOKTOK STICKER PACK`;
  }
  if (t.includes('socialbattery') || t.includes('배터리') || t.includes('내향인') || t.includes('introvert')) {
    return `${countStr} CUTE SOCIAL BATTERY MEME STICKER PACK`;
  }
  if (t.includes('hangul') || t.includes('한글')) {
    return `${countStr} CUTE KOREAN HANGUL STICKER PACK`;
  }
  if (t.includes('terrarium') || t.includes('테라리움')) {
    return `${countStr} CUTE BOTANICAL TERRARIUM STICKER PACK`;
  }
  if (t.includes('vivarium') || t.includes('비바리움')) {
    return `${countStr} CUTE EXOTIC VIVARIUM STICKER PACK`;
  }
  if (t.includes('saltaquarium') || t.includes('해수어')) {
    return `${countStr} CUTE SALTWATER AQUARIUM STICKER PACK`;
  }
  if (t.includes('freshaquarium') || t.includes('열대어')) {
    return `${countStr} CUTE FRESHWATER AQUARIUM STICKER PACK`;
  }
  if (t.includes('newyear') || t.includes('새해') || t.includes('신년')) {
    return `${countStr} CUTE HAPPY NEW YEAR STICKER PACK`;
  }
  if (t.includes('valentine') || t.includes('발렌타인')) {
    return `${countStr} CUTE SWEET VALENTINE STICKER PACK`;
  }
  if (t.includes('stpatrick') || t.includes('패트릭')) {
    return `${countStr} CUTE ST. PATRICK LUCKY STICKER PACK`;
  }
  if (t.includes('easter') || t.includes('부활절')) {
    return `${countStr} CUTE EASTER SPRING STICKER PACK`;
  }
  if (t.includes('halloween') || t.includes('할로윈')) {
    return `${countStr} CUTE SPOOKY HALLOWEEN STICKER PACK`;
  }

  return `${countStr} CUTE DIGITAL STICKER PACK`;
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
 * Draws professional commercial Etsy/Pinterest typography banners on white printable sheets.
 * Explicitly indicates to shoppers that this is an instant digital download sticker pack.
 */
function drawCommercialBanners(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  scaleRatio: number,
  titleText: string = '20+ CUTE DIGITAL STICKER PACK',
  pageIndex: number = 0,
  totalPages: number = 1
) {
  const headerHeight = Math.round(310 * scaleRatio);
  const footerHeight = Math.round(210 * scaleRatio);

  ctx.save();

  // 1. Header Area Background (Warm elegant cream)
  ctx.fillStyle = '#FEFAF6';
  ctx.fillRect(0, 0, canvasWidth, headerHeight);

  // Header separator line
  ctx.strokeStyle = '#E2D3BE';
  ctx.lineWidth = Math.max(2, Math.round(3 * scaleRatio));
  ctx.beginPath();
  ctx.moveTo(0, headerHeight);
  ctx.lineTo(canvasWidth, headerHeight);
  ctx.stroke();

  // Top Main Title
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const mainFontSize = Math.round(72 * scaleRatio);
  ctx.font = `900 ${mainFontSize}px Arial, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
  ctx.fillStyle = '#7C2D12'; // Deep rich autumn / bold rust

  const resolvedTitle = getThemeEnglishTitle(titleText || '');
  const displayTitle = totalPages > 1 ? `${resolvedTitle} (PAGE ${pageIndex + 1}/${totalPages})` : resolvedTitle;
  ctx.fillText(displayTitle, canvasWidth / 2, Math.round(102 * scaleRatio));

  // Top Ribbon Banner for "PNG DIGITAL STICKERS • GOODNOTES & PRINTABLE"
  const ribbonW = Math.round(canvasWidth * 0.88);
  const ribbonH = Math.round(96 * scaleRatio);
  const ribbonX = (canvasWidth - ribbonW) / 2;
  const ribbonY = Math.round(168 * scaleRatio);
  const ribbonRadius = Math.round(22 * scaleRatio);

  // Ribbon fill (vibrant rose-red)
  ctx.fillStyle = '#BE123C';
  ctx.beginPath();
  if (typeof (ctx as any).roundRect === 'function') {
    (ctx as any).roundRect(ribbonX, ribbonY, ribbonW, ribbonH, ribbonRadius);
  } else {
    ctx.rect(ribbonX, ribbonY, ribbonW, ribbonH);
  }
  ctx.fill();

  // Ribbon Text
  const ribbonFontSize = Math.round(40 * scaleRatio);
  ctx.font = `bold ${ribbonFontSize}px Arial, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('★ PNG DIGITAL STICKERS • GOODNOTES & PRINTABLE ★', canvasWidth / 2, ribbonY + ribbonH / 2);

  // 2. Footer Area Background
  const footerY = canvasHeight - footerHeight;
  ctx.fillStyle = '#FEFAF6';
  ctx.fillRect(0, footerY, canvasWidth, footerHeight);

  // Footer separator line
  ctx.strokeStyle = '#E2D3BE';
  ctx.lineWidth = Math.max(2, Math.round(3 * scaleRatio));
  ctx.beginPath();
  ctx.moveTo(0, footerY);
  ctx.lineTo(canvasWidth, footerY);
  ctx.stroke();

  // Footer Line 1: 300 DPI Transparent PNG & Instant Download
  const fLine1Size = Math.round(36 * scaleRatio);
  ctx.font = `bold ${fLine1Size}px Arial, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
  ctx.fillStyle = '#9A3412';
  ctx.fillText('INSTANT DIGITAL DOWNLOAD • 300 DPI HIGH RESOLUTION • TRANSPARENT PNG', canvasWidth / 2, footerY + Math.round(70 * scaleRatio));

  // Footer Line 2: Cricut & Etsy Shop link
  const fLine2Size = Math.round(32 * scaleRatio);
  ctx.font = `bold ${fLine2Size}px "Segoe UI", Arial, sans-serif`;
  ctx.fillStyle = '#78645A';
  ctx.fillText('CRICUT & HAND CUT READY  •  Etsy Shop: littlepawsstudioshop.etsy.com', canvasWidth / 2, footerY + Math.round(140 * scaleRatio));

  ctx.restore();
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
  const marginY = Math.round(100 * scaleRatio);
  const gapX = Math.round(40 * scaleRatio);
  const gapY = Math.round(44 * scaleRatio);

  // Commercial Typography Banners for White Printables (Etsy/Pinterest Ready)
  const shouldDrawBanners = background === 'white' && options.includeCommercialBanners !== false;
  const headerHeight = shouldDrawBanners ? Math.round(310 * scaleRatio) : 0;
  const footerHeight = shouldDrawBanners ? Math.round(210 * scaleRatio) : 0;

  const usableWidth = canvasWidth - marginX * 2;
  const usableTop = marginY + headerHeight;
  const usableHeight = canvasHeight - usableTop - marginY - footerHeight;

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
      const cellY = usableTop + row * (cellHeight + gapY);

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

  // Draw Header and Footer Commercial Banners if requested
  if (shouldDrawBanners) {
    drawCommercialBanners(
      ctx,
      canvasWidth,
      canvasHeight,
      scaleRatio,
      options.title || '20+ CUTE DIGITAL STICKERS',
      options.pageIndex || 0,
      options.totalPages || 1
    );
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
      pageIndex: p,
      totalPages,
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
      pageIndex: p,
      totalPages,
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

        // Draw Commercial Typography Banners for Home Printer / Pinterest ready
        if (options.includeCommercialBanners !== false) {
          const scaleRatio = canvasWidth / 2480;
          drawCommercialBanners(
            wctx,
            canvasWidth,
            canvasHeight,
            scaleRatio,
            options.title || '20+ CUTE DIGITAL STICKERS',
            p,
            totalPages
          );
        }

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
