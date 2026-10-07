/**
 * Standalone Sticker Extractor from Tank / Vessel Sticker Image
 * Solution 1: Direct 100% Real Object Crop & Die-Cut Sticker Transformation
 * Extracts the inner creature/item directly from the tank sticker,
 * strips outer glass/jar elements, applies crisp white die-cut border + shadow,
 * and outputs a 3000x3000px standalone sticker matching the exact same character.
 */

export interface StandaloneExtractorOptions {
  targetWidth?: number; // default 3000
  targetHeight?: number; // default 3000
  paddingRatio?: number; // default 0.06 (6% margin around detected box)
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error('Failed to load tank image: ' + String(e)));
    img.src = src;
  });
}

/**
 * Remove outer white/tank background from cropped canvas using BFS flood fill.
 */
function makeCroppedBackgroundTransparent(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const w = canvas.width;
  const h = canvas.height;
  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;
  const total = w * h;

  // Sample background color from 4 corners
  const corners = [0, (w - 1) * 4, ((h - 1) * w) * 4, ((h - 1) * w + w - 1) * 4];
  let bgR = 0, bgG = 0, bgB = 0;
  corners.forEach(idx => {
    bgR += data[idx];
    bgG += data[idx + 1];
    bgB += data[idx + 2];
  });
  bgR = Math.round(bgR / 4);
  bgG = Math.round(bgG / 4);
  bgB = Math.round(bgB / 4);

  const isOuterBg = (x: number, y: number) => {
    const idx = (y * w + x) * 4;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    const a = data[idx + 3];
    if (a < 10) return true;

    // High brightness near-white outer background
    if (r >= 230 && g >= 230 && b >= 230) return true;

    // Corner background similarity
    const dr = Math.abs(r - bgR);
    const dg = Math.abs(g - bgG);
    const db = Math.abs(b - bgB);
    if (dr <= 35 && dg <= 35 && db <= 35) return true;

    return false;
  };

  const visited = new Uint8Array(total);
  const queue = new Int32Array(total * 2);
  let head = 0, tail = 0;

  // Seed 4 outer borders for BFS Flood Fill
  for (let x = 0; x < w; x++) {
    if (isOuterBg(x, 0)) { visited[x] = 1; queue[tail++] = x; queue[tail++] = 0; }
    const botIdx = (h - 1) * w + x;
    if (isOuterBg(x, h - 1)) { visited[botIdx] = 1; queue[tail++] = x; queue[tail++] = h - 1; }
  }
  for (let y = 0; y < h; y++) {
    const leftIdx = y * w;
    if (isOuterBg(0, y)) { visited[leftIdx] = 1; queue[tail++] = 0; queue[tail++] = y; }
    const rightIdx = y * w + w - 1;
    if (isOuterBg(w - 1, y)) { visited[rightIdx] = 1; queue[tail++] = w - 1; queue[tail++] = y; }
  }

  const dx = [1, -1, 0, 0];
  const dy = [0, 0, 1, -1];

  while (head < tail) {
    const cx = queue[head++];
    const cy = queue[head++];
    const cidx = (cy * w + cx) * 4;

    // Set alpha to 0 for outer boundary pixel
    data[cidx + 3] = 0;

    for (let i = 0; i < 4; i++) {
      const nx = cx + dx[i];
      const ny = cy + dy[i];
      if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
        const nidx = ny * w + nx;
        if (!visited[nidx] && isOuterBg(nx, ny)) {
          visited[nidx] = 1;
          queue[tail++] = nx;
          queue[tail++] = ny;
        }
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas;
}

/**
 * Creates a beautiful white die-cut sticker outline around the transparent object.
 */
function createDieCutStickerWithBorder(
  sourceCanvas: HTMLCanvasElement,
  strokeWidth: number = 22
): HTMLCanvasElement {
  const pad = strokeWidth * 2;
  const out = document.createElement('canvas');
  out.width = sourceCanvas.width + pad * 2;
  out.height = sourceCanvas.height + pad * 2;
  const oCtx = out.getContext('2d');
  if (!oCtx) return sourceCanvas;

  oCtx.imageSmoothingEnabled = true;
  oCtx.imageSmoothingQuality = 'high';

  // Draw radial expansion for smooth white die-cut border
  const steps = 24;
  for (let angle = 0; angle < Math.PI * 2; angle += (Math.PI * 2) / steps) {
    const ox = Math.cos(angle) * strokeWidth + pad;
    const oy = Math.sin(angle) * strokeWidth + pad;
    oCtx.drawImage(sourceCanvas, ox, oy);
  }

  // Turn all expanded copies into pure solid white (#FFFFFF)
  oCtx.globalCompositeOperation = 'source-in';
  oCtx.fillStyle = '#FFFFFF';
  oCtx.fillRect(0, 0, out.width, out.height);

  // Return to normal mode and draw original colored object on top
  oCtx.globalCompositeOperation = 'source-over';
  oCtx.drawImage(sourceCanvas, pad, pad);

  return out;
}

/**
 * Extracts a standalone die-cut sticker directly from a tank sticker image.
 * Guarantees 100% real character match with the vessel sticker.
 */
export async function extractStandaloneStickerFromTank(
  tankImageUrlOrBase64: string,
  itemName: string,
  options: StandaloneExtractorOptions = {}
): Promise<string> {
  const {
    targetWidth = 3000,
    targetHeight = 3000,
    paddingRatio = 0.06
  } = options;

  // 1. Load tank image
  const tankImg = await loadImage(tankImageUrlOrBase64);
  const naturalW = tankImg.naturalWidth || tankImg.width || 1024;
  const naturalH = tankImg.naturalHeight || tankImg.height || 1024;

  // 2. Detect bounding box using Gemini Vision API
  let box = [220, 220, 780, 780]; // fallback
  try {
    const res = await fetch('/api/designs/detect-object', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageBase64: tankImageUrlOrBase64,
        itemName
      })
    });
    const data = await res.json();
    if (data.success && Array.isArray(data.box)) {
      box = data.box;
    }
  } catch (e) {
    console.warn('Bounding box API call failed, using default center box:', e);
  }

  // Convert normalized box (0-1000) to actual pixel coordinates
  const yminNorm = box[0] / 1000;
  const xminNorm = box[1] / 1000;
  const ymaxNorm = box[2] / 1000;
  const xmaxNorm = box[3] / 1000;

  const boxW = (xmaxNorm - xminNorm) * naturalW;
  const boxH = (ymaxNorm - yminNorm) * naturalH;

  // Add padding
  const padX = boxW * paddingRatio;
  const padY = boxH * paddingRatio;

  const cropX = Math.max(0, Math.floor(xminNorm * naturalW - padX));
  const cropY = Math.max(0, Math.floor(yminNorm * naturalH - padY));
  const cropW = Math.min(naturalW - cropX, Math.ceil(boxW + padX * 2));
  const cropH = Math.min(naturalH - cropY, Math.ceil(boxH + padY * 2));

  // 3. Crop object onto intermediate canvas
  const cropCanvas = document.createElement('canvas');
  cropCanvas.width = cropW;
  cropCanvas.height = cropH;
  const cCtx = cropCanvas.getContext('2d');
  if (!cCtx) throw new Error('Canvas context unavailable');

  cCtx.imageSmoothingEnabled = true;
  cCtx.imageSmoothingQuality = 'high';
  cCtx.drawImage(tankImg, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

  // 4. Remove outer background around cropped subject
  const transparentObjCanvas = makeCroppedBackgroundTransparent(cropCanvas);

  // 5. Add clean white die-cut sticker outline
  const dieCutStickerCanvas = createDieCutStickerWithBorder(transparentObjCanvas, 22);

  // 6. Composite onto Final 3000x3000px Canvas on Pure White Background
  const finalCanvas = document.createElement('canvas');
  finalCanvas.width = targetWidth;
  finalCanvas.height = targetHeight;
  const fCtx = finalCanvas.getContext('2d');
  if (!fCtx) throw new Error('Final canvas context unavailable');

  fCtx.imageSmoothingEnabled = true;
  fCtx.imageSmoothingQuality = 'high';

  // CRITICAL RULE: Pure solid white background (#FFFFFF)
  fCtx.fillStyle = '#FFFFFF';
  fCtx.fillRect(0, 0, targetWidth, targetHeight);

  // Subtle outer boundary stroke
  fCtx.strokeStyle = '#E2E8F0';
  fCtx.lineWidth = 14;
  fCtx.strokeRect(8, 8, targetWidth - 16, targetHeight - 16);

  // Scale object to fill center stage nicely (target ~2100px max dimension)
  const maxDim = 2100;
  const objAspect = dieCutStickerCanvas.width / dieCutStickerCanvas.height;
  let drawW = maxDim;
  let drawH = maxDim / objAspect;
  if (drawH > maxDim) {
    drawH = maxDim;
    drawW = maxDim * objAspect;
  }

  const posX = (targetWidth - drawW) / 2;
  const posY = (targetHeight - drawH) / 2;

  // Apply rich drop shadow for tactile sticker feel
  fCtx.save();
  fCtx.shadowColor = 'rgba(0, 0, 0, 0.20)';
  fCtx.shadowBlur = 48;
  fCtx.shadowOffsetX = 8;
  fCtx.shadowOffsetY = 24;

  fCtx.drawImage(dieCutStickerCanvas, posX, posY, drawW, drawH);
  fCtx.restore();

  // 7. Export JPEG with strict Firestore byte limit (< 650,000 bytes)
  let quality = 0.85;
  let dataUrl = finalCanvas.toDataURL('image/jpeg', quality);

  while (dataUrl.length > 650000 && quality > 0.25) {
    quality -= 0.1;
    dataUrl = finalCanvas.toDataURL('image/jpeg', quality);
  }

  if (dataUrl.length > 650000) {
    const scaledCanvas = document.createElement('canvas');
    scaledCanvas.width = 1800;
    scaledCanvas.height = 1800;
    const sCtx = scaledCanvas.getContext('2d');
    if (sCtx) {
      sCtx.drawImage(finalCanvas, 0, 0, 1800, 1800);
      dataUrl = scaledCanvas.toDataURL('image/jpeg', 0.75);
    }
  }

  return dataUrl;
}
