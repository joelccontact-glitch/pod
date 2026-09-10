/**
 * Real 10-Sticker Representative Composite Master Cover Builder
 * Renders 10 large, representative generated stickers around a central title emblem
 * with organic tilting, die-cut white borders, and soft drop shadows.
 * Removes all outer square paper tile frames (종이 틀 제거) and renders pure sticker subjects.
 * Matches top-selling Etsy sticker bundle listings (Snoopy style: full canvas, dense & vibrant).
 */

export interface MasterCoverBuilderOptions {
  title?: string;
  subType?: string; // 'terrarium' | 'vivarium' | 'saltaquarium' | 'freshaquarium'
  targetWidth?: number; // default 3000
  targetHeight?: number; // default 3000
}

function makeBackgroundTransparent(img: HTMLImageElement): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = img.naturalWidth || img.width || 800;
  c.height = img.naturalHeight || img.height || 800;
  const ctx = c.getContext('2d');
  if (!ctx) return c;

  ctx.drawImage(img, 0, 0, c.width, c.height);
  const imgData = ctx.getImageData(0, 0, c.width, c.height);
  const data = imgData.data;
  const w = c.width;
  const h = c.height;
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

  // Helper to test if a pixel is outer paper background tile
  const isBg = (x: number, y: number) => {
    const idx = (y * w + x) * 4;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    const a = data[idx + 3];
    if (a < 10) return true;

    // Check distance from sampled corner background
    const dr = Math.abs(r - bgR);
    const dg = Math.abs(g - bgG);
    const db = Math.abs(b - bgB);
    if (dr <= 30 && dg <= 30 && db <= 30) return true;

    // High brightness near-white paper/shadow (r >= 225, g >= 225, b >= 225)
    if (r >= 225 && g >= 225 && b >= 225) return true;

    return false;
  };

  const visited = new Uint8Array(total);
  const queue = new Int32Array(total * 2);
  let head = 0, tail = 0;

  // Seed 4 outer edges for BFS Flood Fill
  for (let x = 0; x < w; x++) {
    if (isBg(x, 0)) { const idx = x; visited[idx] = 1; queue[tail++] = x; queue[tail++] = 0; }
    if (isBg(x, h - 1)) { const idx = (h - 1) * w + x; visited[idx] = 1; queue[tail++] = x; queue[tail++] = h - 1; }
  }
  for (let y = 0; y < h; y++) {
    if (isBg(0, y)) { const idx = y * w; visited[idx] = 1; queue[tail++] = 0; queue[tail++] = y; }
    if (isBg(w - 1, y)) { const idx = y * w + w - 1; visited[idx] = 1; queue[tail++] = w - 1; queue[tail++] = y; }
  }

  // BFS flood-fill to clear outer paper background tile
  const dx = [1, -1, 0, 0];
  const dy = [0, 0, 1, -1];

  while (head < tail) {
    const cx = queue[head++];
    const cy = queue[head++];
    const cidx = (cy * w + cx) * 4;

    // Set alpha to 0 for outer paper background pixel
    data[cidx + 3] = 0;

    for (let i = 0; i < 4; i++) {
      const nx = cx + dx[i];
      const ny = cy + dy[i];
      if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
        const nidx = ny * w + nx;
        if (!visited[nidx] && isBg(nx, ny)) {
          visited[nidx] = 1;
          queue[tail++] = nx;
          queue[tail++] = ny;
        }
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return c;
}

function drawOutlinedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  font: string,
  fillColor: string,
  strokeColor: string = '#FFFFFF',
  strokeWidth: number = 28
) {
  ctx.save();
  ctx.font = font;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Heavy white die-cut outline
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = strokeWidth;
  ctx.lineJoin = 'round';
  ctx.miterLimit = 2;
  ctx.strokeText(text, x, y);

  // Soft drop shadow under filled text
  ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 6;

  // Primary text fill
  ctx.fillStyle = fillColor;
  ctx.fillText(text, x, y);
  ctx.restore();
}

export async function createCompositeMasterCover(
  stickers: any[],
  options: MasterCoverBuilderOptions = {}
): Promise<string> {
  const {
    subType = 'terrarium',
    targetWidth = 3000,
    targetHeight = 3000
  } = options;

  let seriesTitle = 'TERRARIUM';
  let primaryColor = '#E11D48'; // Vibrant Rose Pink
  let secondaryColor = '#BE185D'; // Deep Magenta Pink
  let ribbonColor = '#0F766E'; // Dark Teal Ribbon
  let subColor = '#0284C7'; // Cyan

  if (subType === 'vivarium') {
    seriesTitle = 'VIVARIUM';
    primaryColor = '#E11D48'; // Pink
    secondaryColor = '#9D174D'; 
    ribbonColor = '#0F766E'; // Dark Teal Ribbon
    subColor = '#0284C7';
  } else if (subType === 'saltaquarium') {
    seriesTitle = 'SALTWATER AQUARIUM';
    primaryColor = '#0284C7'; // Cyan
    secondaryColor = '#1E40AF'; // Deep Blue
    ribbonColor = '#E11D48'; // Coral Ribbon
    subColor = '#0D9488';
  } else if (subType === 'freshaquarium') {
    seriesTitle = 'FRESHWATER AQUARIUM';
    primaryColor = '#2563EB'; // Royal Blue
    secondaryColor = '#1D4ED8';
    ribbonColor = '#059669'; // Emerald Ribbon
    subColor = '#D97706';
  }

  // 14 Representative Anchor Slots around center typography to fill all blank spaces (Canvas size: 3000 x 3000)
  const ANCHOR_SLOTS = [
    // TOP ROW (4 stickers)
    { x: 380,  y: 420,  tilt: -9, scale: 1.02 },
    { x: 1120, y: 350,  tilt: 6,  scale: 0.98 },
    { x: 1880, y: 350,  tilt: -6, scale: 0.98 },
    { x: 2620, y: 420,  tilt: 8,  scale: 1.02 },

    // UPPER MIDDLE FLANKS (2 stickers covering middle-top flanks)
    { x: 420,  y: 1040, tilt: 10, scale: 1.0 },
    { x: 2580, y: 1040, tilt: -10,scale: 1.0 },

    // LOWER MIDDLE FLANKS (2 stickers covering middle-bottom flanks)
    { x: 380,  y: 1720, tilt: -7, scale: 1.04 },
    { x: 2620, y: 1720, tilt: 8,  scale: 1.04 },

    // INNER FLANKS / CORNER GAP FILLERS (2 stickers filling empty spaces near center banner)
    { x: 820,  y: 2060, tilt: 11, scale: 0.95 },
    { x: 2180, y: 2060, tilt: -9, scale: 0.95 },

    // BOTTOM ROW (4 stickers)
    { x: 380,  y: 2580, tilt: -8, scale: 1.02 },
    { x: 1120, y: 2650, tilt: 5,  scale: 0.98 },
    { x: 1880, y: 2650, tilt: -5, scale: 0.98 },
    { x: 2620, y: 2580, tilt: 9,  scale: 1.02 },
  ];

  // Select 14 representative stickers from the stickers array
  let representativeStickers: any[] = [];
  if (stickers.length <= 14) {
    representativeStickers = [...stickers];
  } else {
    // Evenly sample 14 stickers across the full pack
    const step = stickers.length / 14;
    for (let i = 0; i < 14; i++) {
      const idx = Math.min(Math.floor(i * step), stickers.length - 1);
      representativeStickers.push(stickers[idx]);
    }
  }

  return new Promise(async (resolve, reject) => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Canvas context unavailable'));
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // 1. Pure Solid White Canvas Background (#FFFFFF)
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, targetWidth, targetHeight);

      // Subtle outer boundary stroke frame
      ctx.strokeStyle = '#F1F5F9';
      ctx.lineWidth = 16;
      ctx.strokeRect(8, 8, targetWidth - 16, targetHeight - 16);

      // 2. Load the 10 representative sticker images concurrently
      const loadPromises = representativeStickers.map((s) => {
        return new Promise<HTMLImageElement | null>((res) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = s.image_url || s.url;
          img.onload = () => res(img);
          img.onerror = () => res(null);
        });
      });

      const loadedImages = await Promise.all(loadPromises);

      // 3. Render 10 Large Stickers filling the perimeter around the center emblem
      const baseMaxDim = 980; // Large 980px size for dense, full-canvas impact

      for (let i = 0; i < loadedImages.length; i++) {
        const img = loadedImages[i];
        if (!img) continue;

        // Process image to remove any outer white paper card frame (종이 틀 제거)
        const transparentStickerCanvas = makeBackgroundTransparent(img);

        const slot = ANCHOR_SLOTS[i % ANCHOR_SLOTS.length];
        const targetDim = baseMaxDim * slot.scale;

        const aspect = img.width / img.height;
        let drawW = targetDim;
        let drawH = targetDim / aspect;

        if (drawH > targetDim) {
          drawH = targetDim;
          drawW = targetDim * aspect;
        }

        ctx.save();
        ctx.translate(slot.x, slot.y);
        ctx.rotate((slot.tilt * Math.PI) / 180);

        // Rich die-cut drop shadow around pure sticker object
        ctx.shadowColor = 'rgba(0, 0, 0, 0.22)';
        ctx.shadowBlur = 40;
        ctx.shadowOffsetX = 6;
        ctx.shadowOffsetY = 16;

        ctx.drawImage(transparentStickerCanvas, -drawW / 2, -drawH / 2, drawW, drawH);
        ctx.restore();
      }

      // 4. Render Central Typography Stack with Thick White Die-Cut Outlines (NO BOXED CARD!)
      const centerX = targetWidth / 2;

      // Line 1: "20+ CUTE"
      drawOutlinedText(
        ctx,
        '20+ CUTE',
        centerX,
        1100,
        `900 155px 'Arial Black', 'Impact', sans-serif`,
        primaryColor,
        '#FFFFFF',
        36
      );

      // Line 2: "20+ CUTE [SERIES]" or "[SERIES]"
      drawOutlinedText(
        ctx,
        `20+ CUTE ${seriesTitle}`,
        centerX,
        1270,
        `900 125px 'Impact', 'Comic Sans MS', sans-serif`,
        secondaryColor,
        '#FFFFFF',
        32
      );

      // Line 3: "STICKER BUNDLE"
      drawOutlinedText(
        ctx,
        'STICKER BUNDLE',
        centerX,
        1430,
        `900 135px 'Arial Black', 'Impact', sans-serif`,
        primaryColor,
        '#FFFFFF',
        32
      );

      // Line 4: Dark Ribbon Banner ("PNG DIGITAL DOWNLOAD")
      const ribW = 1460;
      const ribH = 116;
      const ribX = centerX - ribW / 2;
      const ribY = 1570;

      ctx.save();
      // Multi-layer drop shadow for ribbon banner
      ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
      ctx.shadowBlur = 24;
      ctx.shadowOffsetY = 10;

      // Thick white outline behind ribbon
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.roundRect(ribX - 12, ribY - 12, ribW + 24, ribH + 24, 32);
      ctx.fill();

      // Filled ribbon banner shape
      ctx.fillStyle = ribbonColor;
      ctx.beginPath();
      ctx.roundRect(ribX, ribY, ribW, ribH, 24);
      ctx.fill();
      ctx.restore();

      // Text inside ribbon banner
      ctx.save();
      ctx.font = `900 56px 'Arial Black', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText('PNG DIGITAL DOWNLOAD', centerX, ribY + ribH / 2 + 2);
      ctx.restore();

      // Line 5: "INSTANT DOWNLOAD"
      drawOutlinedText(
        ctx,
        'INSTANT DOWNLOAD',
        centerX,
        1780,
        `900 76px 'Arial Black', sans-serif`,
        subColor,
        '#FFFFFF',
        22
      );

      // 5. Bottom Ribbon Bar (Etsy Best-Seller Footer)
      const footerY = 2925;
      const footerW = 2300;
      const footerH = 68;
      const footerX = (targetWidth - footerW) / 2;

      ctx.save();
      ctx.fillStyle = '#F8FAFC';
      ctx.strokeStyle = '#CBD5E1';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(footerX, footerY - 34, footerW, footerH, 34);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      ctx.font = `700 28px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#334155';
      ctx.fillText(`🌸 20 UNIQUE HIGH QUALITY STICKERS  •  300 DPI TRANSPARENT PNG  •  INSTANT DOWNLOAD 🌸`, centerX, footerY);

      // 6. Export JPEG at high quality
      let quality = 0.85;
      let dataUrl = canvas.toDataURL('image/jpeg', quality);

      while (dataUrl.length > 800000 && quality > 0.4) {
        quality -= 0.1;
        dataUrl = canvas.toDataURL('image/jpeg', quality);
      }

      resolve(dataUrl);
    } catch (e) {
      reject(e);
    }
  });
}
