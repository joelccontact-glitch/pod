/**
 * Real 20-Sticker Full-Coverage Etsy Bestseller Composite Master Cover Builder
 * Overlaps all 20 generated stickers seamlessly across the canvas,
 * and populates empty gaps with theme-specific standalone die-cut filler items.
 * Matches top-selling Etsy cute sticker bundle listings (Left Saltwater Aquarium style).
 */

export interface MasterCoverBuilderOptions {
  title?: string;
  subType?: string; // 'terrarium' | 'vivarium' | 'saltaquarium' | 'freshaquarium'
  targetWidth?: number; // default 3000
  targetHeight?: number; // default 3000
  stickerCount?: number;
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



/**
 * Classic 3D Folded Swallowtail Ribbon Banner (Etsy Bestseller Style)
 * Hand-drawn aesthetic with bold dark outlines, 3D folded ends, and clean white rounded text.
 * Scaled up to 1520px width and 155px height to match the Etsy bestseller master cover sample.
 */
function drawClassicRibbonBanner(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  text: string,
  ribbonFill: string = '#C25E26',
  ribbonFold: string = '#6C2A0C',
  outlineColor: string = '#261208'
) {
  ctx.save();

  const bannerW = 1520; // Expanded to 1520px for massive Etsy bestseller presence
  const bannerH = 155;  // 155px height for rich volume
  const arch = 28;      // Gentle upward curvature
  const strokeW = 10;   // Distinct bold outline

  const halfW = bannerW / 2;
  const leftX = cx - halfW;
  const rightX = cx + halfW;
  const topY = cy - bannerH / 2;
  const botY = cy + bannerH / 2;

  const tailW = 280;    // Wide swallowtail wings
  const tailDrop = 48;  // Natural drop below center banner
  const notchDepth = 64;// Deep V-notch swallowtail cut

  ctx.lineWidth = strokeW;
  ctx.strokeStyle = outlineColor;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  // --- 1. LEFT TAIL (Behind) ---
  const ltLeft = leftX - tailW;
  const ltRight = leftX + 15;
  const ltTop = topY + tailDrop;
  const ltBot = botY + tailDrop;

  ctx.beginPath();
  ctx.moveTo(ltRight, ltTop);
  ctx.lineTo(ltLeft, ltTop + 10);
  ctx.lineTo(ltLeft + notchDepth, (ltTop + ltBot) / 2 + 5); // V-notch center
  ctx.lineTo(ltLeft, ltBot);
  ctx.lineTo(ltRight, ltBot - 10);
  ctx.closePath();
  ctx.fillStyle = ribbonFill;
  ctx.fill();
  ctx.stroke();

  // --- 2. RIGHT TAIL (Behind) ---
  const rtRight = rightX + tailW;
  const rtLeft = rightX - 15;
  const rtTop = topY + tailDrop;
  const rtBot = botY + tailDrop;

  ctx.beginPath();
  ctx.moveTo(rtLeft, rtTop);
  ctx.lineTo(rtRight, rtTop + 10);
  ctx.lineTo(rtRight - notchDepth, (rtTop + rtBot) / 2 + 5); // V-notch center
  ctx.lineTo(rtRight, rtBot);
  ctx.lineTo(rtLeft, rtBot - 10);
  ctx.closePath();
  ctx.fillStyle = ribbonFill;
  ctx.fill();
  ctx.stroke();

  // --- 3. FOLD TRIANGLES (3D Underneath center banner) ---
  ctx.beginPath();
  ctx.moveTo(leftX, botY + 12);
  ctx.lineTo(leftX, ltBot - 10);
  ctx.lineTo(leftX - 48, ltBot - 10);
  ctx.closePath();
  ctx.fillStyle = ribbonFold;
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(rightX, botY + 12);
  ctx.lineTo(rightX, rtBot - 10);
  ctx.lineTo(rightX + 48, rtBot - 10);
  ctx.closePath();
  ctx.fillStyle = ribbonFold;
  ctx.fill();
  ctx.stroke();

  // --- 4. MAIN CENTER BANNER (In Front) ---
  ctx.beginPath();
  // Top arched edge
  ctx.moveTo(leftX, topY + 12);
  ctx.quadraticCurveTo(cx, topY - arch, rightX, topY + 12);
  // Right edge
  ctx.lineTo(rightX, botY + 12);
  // Bottom arched edge
  ctx.quadraticCurveTo(cx, botY - arch, leftX, botY + 12);
  ctx.closePath();

  ctx.fillStyle = ribbonFill;
  ctx.fill();
  ctx.stroke();

  // --- 5. RIBBON TEXT ("PNG DIGITAL DOWNLOAD") ---
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `900 68px 'Lilita One', 'Fredoka', 'Arial Rounded MT Bold', sans-serif`;
  ctx.fillText(text, cx, cy - 2);

  ctx.restore();
}

export async function createCompositeMasterCover(
  stickers: any[],
  options: MasterCoverBuilderOptions = {}
): Promise<string> {
  const {
    subType = 'terrarium',
    targetWidth = 3000,
    targetHeight = 3000,
    stickerCount
  } = options;

  const count = stickerCount || (stickers.length > 0 ? stickers.length : 20);

  // Dynamic series title resolution from options.title or subType
  const optTitle = (options.title || '').toLowerCase();
  let seriesTitle = 'STICKER';
  let titleColor = '#B91C1C'; // Deep warm crimson bold lettering (matching target image exactly)
  let ribbonColor = '#C25E26'; // Warm pumpkin terracotta (matching target image)
  let ribbonFold = '#6C2A0C';
  let ribbonOutline = '#261208';

  if (subType === 'halloween' || optTitle.includes('halloween') || optTitle.includes('할로윈') || optTitle.includes('spooky')) {
    seriesTitle = 'HALLOWEEN';
    titleColor = '#B91C1C';
    ribbonColor = '#C25E26';
    ribbonFold = '#6C2A0C';
    ribbonOutline = '#261208';
  } else if (optTitle.includes('harvest') || optTitle.includes('fall') || optTitle.includes('autumn')) {
    seriesTitle = 'FALL HARVEST';
    titleColor = '#B91C1C';
    ribbonColor = '#C25E26';
    ribbonFold = '#6C2A0C';
    ribbonOutline = '#261208';
  } else if (subType === 'thanksgiving' || optTitle.includes('thanksgiving') || optTitle.includes('추수감사절')) {
    seriesTitle = 'THANKSGIVING';
    titleColor = '#B91C1C';
    ribbonColor = '#B45309';
    ribbonFold = '#451A03';
    ribbonOutline = '#261208';
  } else if (subType === 'christmas' || optTitle.includes('christmas') || optTitle.includes('크리스마스')) {
    seriesTitle = 'CHRISTMAS';
    titleColor = '#B91C1C';
    ribbonColor = '#15803D';
    ribbonFold = '#052E16';
    ribbonOutline = '#0F172A';
  } else if (subType === 'vivarium' || optTitle.includes('vivarium') || optTitle.includes('비바리움')) {
    seriesTitle = 'VIVARIUM';
    titleColor = '#0F766E';
    ribbonColor = '#0F766E';
    ribbonFold = '#042F2E';
    ribbonOutline = '#0A1E1C';
  } else if (subType === 'saltaquarium' || optTitle.includes('saltaquarium') || optTitle.includes('해수어')) {
    seriesTitle = 'SALTWATER AQUARIUM';
    titleColor = '#0369A1';
    ribbonColor = '#0284C7';
    ribbonFold = '#082F49';
    ribbonOutline = '#081C2E';
  } else if (subType === 'freshaquarium' || optTitle.includes('freshaquarium') || optTitle.includes('열대어')) {
    seriesTitle = 'FRESHWATER AQUARIUM';
    titleColor = '#047857';
    ribbonColor = '#059669';
    ribbonFold = '#064E3B';
    ribbonOutline = '#062820';
  } else if (subType === 'terrarium' || optTitle.includes('terrarium') || optTitle.includes('테라리움')) {
    seriesTitle = 'TERRARIUM';
    titleColor = '#0F766E';
    ribbonColor = '#0F766E';
    ribbonFold = '#042F2E';
    ribbonOutline = '#0A1E1C';
  } else {
    if (options.title) {
      const cleanT = options.title.replace(/[0-9+]+| (cute|stickers?|bundle|png|digital|download) /gi, '').trim();
      if (cleanT.length > 0) {
        seriesTitle = cleanT.toUpperCase();
      }
    }
    titleColor = '#B91C1C';
    ribbonColor = '#C25E26';
    ribbonFold = '#6C2A0C';
    ribbonOutline = '#261208';
  }

  // Ensure Google Fonts are active in Canvas
  if (typeof document !== 'undefined' && document.fonts) {
    try {
      await Promise.all([
        document.fonts.load("900 230px 'Lilita One'"),
        document.fonts.load("900 210px 'Lilita One'"),
        document.fonts.load("900 180px 'Lilita One'"),
        document.fonts.load("800 210px 'Fredoka'"),
        document.fonts.load("900 68px 'Lilita One'")
      ]);
    } catch {
      // Fallback seamlessly to system rounded fonts
    }
  }

  // 20 LARGE OVERLAPPING ANCHOR SLOTS ARRANGED IN A WREATH FRAME
  // Pushed outward to provide a massive clear central space (X: 650-2350, Y: 980-1950) for the bold title
  const ANCHOR_SLOTS = [
    // 1. TOP ARCH (5 stickers across the top perimeter)
    { x: 360,  y: 380,  tilt: -12, scale: 0.90 },
    { x: 920,  y: 300,  tilt: 7,   scale: 0.88 },
    { x: 1500, y: 270,  tilt: -4,  scale: 0.88 },
    { x: 2080, y: 300,  tilt: 8,   scale: 0.88 },
    { x: 2640, y: 380,  tilt: -10, scale: 0.90 },

    // 2. UPPER CORNERS (2 stickers framing upper diagonals)
    { x: 620,  y: 780,  tilt: -7,  scale: 0.82 },
    { x: 2380, y: 780,  tilt: 8,   scale: 0.82 },

    // 3. LEFT FLANK (3 stickers along outer left wall)
    { x: 300,  y: 960,  tilt: 10,  scale: 0.90 },
    { x: 260,  y: 1500, tilt: -8,  scale: 0.90 },
    { x: 320,  y: 2040, tilt: 9,   scale: 0.90 },

    // 4. RIGHT FLANK (3 stickers along outer right wall)
    { x: 2700, y: 960,  tilt: -9,  scale: 0.90 },
    { x: 2740, y: 1500, tilt: 8,   scale: 0.90 },
    { x: 2680, y: 2040, tilt: -10, scale: 0.90 },

    // 5. LOWER FLANK SUPPORTS (2 stickers supporting underneath the ribbon banner flanks)
    { x: 900,  y: 2080, tilt: -6,  scale: 0.80 },
    { x: 2100, y: 2080, tilt: 7,   scale: 0.80 },

    // 6. BOTTOM ARCH (5 stickers across the bottom perimeter)
    { x: 550,  y: 2580, tilt: -8,  scale: 0.88 },
    { x: 1020, y: 2680, tilt: 6,   scale: 0.88 },
    { x: 1500, y: 2720, tilt: -5,  scale: 0.90 },
    { x: 1980, y: 2680, tilt: 7,   scale: 0.88 },
    { x: 2450, y: 2580, tilt: -9,  scale: 0.88 },
  ];

  // Take actual stickers to render (up to 20 anchor slots)
  const realStickersToRender = stickers.slice(0, 20);

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

      // 1. PURE SOLID WHITE BACKGROUND (#FFFFFF) - NO TINT
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, targetWidth, targetHeight);

      // Subtle outer boundary stroke frame
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 14;
      ctx.strokeRect(8, 8, targetWidth - 16, targetHeight - 16);

      // 3. Load all 20 main sticker images concurrently
      const loadPromises = realStickersToRender.map((s) => {
        return new Promise<HTMLImageElement | null>((res) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = s.image_url || s.url;
          img.onload = () => res(img);
          img.onerror = () => res(null);
        });
      });

      const loadedImages = await Promise.all(loadPromises);

      // 4. Render ALL 20 Main Stickers with Die-Cut Shadows
      const baseMaxDim = 840; // 840px base size creates perfect overlap without encroaching center

      for (let i = 0; i < loadedImages.length; i++) {
        const img = loadedImages[i];
        if (!img) continue;

        // Transparent PNG background removal (종이 사각 틀 제거)
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

      // --- 5. Central Title & Ribbon Banner Typography (Etsy Bestseller Exact Match) ---
      const centerX = targetWidth / 2;

      // Draw massive, crisp, cute bold typography matching Etsy bestseller reference (Left Sample)
      const drawTitleLine = (text: string, x: number, y: number, initialSize: number = 210, maxW: number = 1650) => {
        ctx.save();
        let size = initialSize;
        ctx.font = `900 ${size}px 'Lilita One', 'Fredoka', 'Arial Rounded MT Bold', sans-serif`;
        const w = ctx.measureText(text).width;
        if (w > maxW) {
          size = Math.floor(size * (maxW / w));
          ctx.font = `900 ${size}px 'Lilita One', 'Fredoka', 'Arial Rounded MT Bold', sans-serif`;
        }
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = titleColor; // Signature deep crimson bold lettering (#B91C1C)
        ctx.fillText(text, x, y);
        ctx.restore();
      };

      // Line 1: [COUNT]+ CUTE (e.g. 20+ CUTE or 40+ CUTE)
      drawTitleLine(`${count}+ CUTE`, centerX, 1160, 205, 1400);

      // Line 2: [SERIES TITLE] (e.g. HALLOWEEN, FALL HARVEST, TERRARIUM)
      drawTitleLine(seriesTitle, centerX, 1345, 220, 1680);

      // Line 3: STICKER BUNDLE
      drawTitleLine('STICKER BUNDLE', centerX, 1515, 195, 1600);

      // 4. Swallowtail 3D Ribbon Banner: PNG DIGITAL DOWNLOAD
      drawClassicRibbonBanner(
        ctx,
        centerX,
        1695,
        'PNG DIGITAL DOWNLOAD',
        ribbonColor,
        ribbonFold,
        ribbonOutline
      );

      // 7. Export JPEG with strict Firestore byte limit check (< 650,000 bytes)
      let quality = 0.85;
      let dataUrl = canvas.toDataURL('image/jpeg', quality);

      while (dataUrl.length > 650000 && quality > 0.25) {
        quality -= 0.1;
        dataUrl = canvas.toDataURL('image/jpeg', quality);
      }

      if (dataUrl.length > 650000) {
        const scaledCanvas = document.createElement('canvas');
        scaledCanvas.width = 1800;
        scaledCanvas.height = 1800;
        const sCtx = scaledCanvas.getContext('2d');
        if (sCtx) {
          sCtx.drawImage(canvas, 0, 0, 1800, 1800);
          dataUrl = scaledCanvas.toDataURL('image/jpeg', 0.75);
        }
      }

      resolve(dataUrl);
    } catch (e) {
      reject(e);
    }
  });
}
