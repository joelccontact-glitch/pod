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
 */
function drawClassicRibbonBanner(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  text: string,
  ribbonFill: string,
  ribbonFold: string,
  outlineColor: string = '#261208'
) {
  ctx.save();

  const bannerW = 980;
  const bannerH = 110;
  const arch = 20; // gentle upward curvature
  const strokeW = 8;

  const halfW = bannerW / 2;
  const leftX = cx - halfW;
  const rightX = cx + halfW;
  const topY = cy - bannerH / 2;
  const botY = cy + bannerH / 2;

  const tailW = 210;
  const tailDrop = 36; // tails drop down slightly
  const notchDepth = 48; // swallowtail V-notch depth

  ctx.lineWidth = strokeW;
  ctx.strokeStyle = outlineColor;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  // --- 1. LEFT TAIL (Behind) ---
  const ltLeft = leftX - tailW;
  const ltRight = leftX + 10;
  const ltTop = topY + tailDrop;
  const ltBot = botY + tailDrop;

  ctx.beginPath();
  ctx.moveTo(ltRight, ltTop);
  ctx.lineTo(ltLeft, ltTop + 8);
  ctx.lineTo(ltLeft + notchDepth, (ltTop + ltBot) / 2 + 4); // V-notch center
  ctx.lineTo(ltLeft, ltBot);
  ctx.lineTo(ltRight, ltBot - 8);
  ctx.closePath();
  ctx.fillStyle = ribbonFill;
  ctx.fill();
  ctx.stroke();

  // --- 2. RIGHT TAIL (Behind) ---
  const rtRight = rightX + tailW;
  const rtLeft = rightX - 10;
  const rtTop = topY + tailDrop;
  const rtBot = botY + tailDrop;

  ctx.beginPath();
  ctx.moveTo(rtLeft, rtTop);
  ctx.lineTo(rtRight, rtTop + 8);
  ctx.lineTo(rtRight - notchDepth, (rtTop + rtBot) / 2 + 4); // V-notch center
  ctx.lineTo(rtRight, rtBot);
  ctx.lineTo(rtLeft, rtBot - 8);
  ctx.closePath();
  ctx.fillStyle = ribbonFill;
  ctx.fill();
  ctx.stroke();

  // --- 3. FOLD TRIANGLES (3D Underneath center banner) ---
  // Left fold triangle
  ctx.beginPath();
  ctx.moveTo(leftX, botY + 10);
  ctx.lineTo(leftX, ltBot - 8);
  ctx.lineTo(leftX - 40, ltBot - 8);
  ctx.closePath();
  ctx.fillStyle = ribbonFold;
  ctx.fill();
  ctx.stroke();

  // Right fold triangle
  ctx.beginPath();
  ctx.moveTo(rightX, botY + 10);
  ctx.lineTo(rightX, rtBot - 8);
  ctx.lineTo(rightX + 40, rtBot - 8);
  ctx.closePath();
  ctx.fillStyle = ribbonFold;
  ctx.fill();
  ctx.stroke();

  // --- 4. MAIN CENTER BANNER (In Front) ---
  ctx.beginPath();
  // Top arched edge
  ctx.moveTo(leftX, topY + 10);
  ctx.quadraticCurveTo(cx, topY - arch, rightX, topY + 10);
  // Right edge
  ctx.lineTo(rightX, botY + 10);
  // Bottom arched edge
  ctx.quadraticCurveTo(cx, botY - arch, leftX, botY + 10);
  ctx.closePath();

  ctx.fillStyle = ribbonFill;
  ctx.fill();
  ctx.stroke();

  // --- 5. RIBBON TEXT ("PNG DIGITAL DOWNLOAD") ---
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `800 46px 'Lilita One', 'Fredoka', 'Arial Rounded MT Bold', sans-serif`;
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
  let ribbonColor = '#A84D1D'; // Warm pumpkin terracotta (matching target image)
  let ribbonFold = '#5C1D07';
  let ribbonOutline = '#261208';

  if (subType === 'halloween' || optTitle.includes('halloween') || optTitle.includes('할로윈') || optTitle.includes('spooky')) {
    seriesTitle = 'HALLOWEEN';
    ribbonColor = '#A84D1D';
    ribbonFold = '#5C1D07';
    ribbonOutline = '#261208';
  } else if (optTitle.includes('harvest') || optTitle.includes('fall') || optTitle.includes('autumn')) {
    seriesTitle = 'FALL HARVEST';
    ribbonColor = '#A84D1D';
    ribbonFold = '#5C1D07';
    ribbonOutline = '#261208';
  } else if (subType === 'thanksgiving' || optTitle.includes('thanksgiving') || optTitle.includes('추수감사절')) {
    seriesTitle = 'THANKSGIVING';
    ribbonColor = '#9A3412';
    ribbonFold = '#431407';
    ribbonOutline = '#261208';
  } else if (subType === 'christmas' || optTitle.includes('christmas') || optTitle.includes('크리스마스')) {
    seriesTitle = 'CHRISTMAS';
    ribbonColor = '#15803D';
    ribbonFold = '#052E16';
    ribbonOutline = '#0F172A';
  } else if (subType === 'vivarium' || optTitle.includes('vivarium') || optTitle.includes('비바리움')) {
    seriesTitle = 'VIVARIUM';
    ribbonColor = '#0F766E';
    ribbonFold = '#042F2E';
    ribbonOutline = '#0A1E1C';
  } else if (subType === 'saltaquarium' || optTitle.includes('saltaquarium') || optTitle.includes('해수어')) {
    seriesTitle = 'SALTWATER AQUARIUM';
    ribbonColor = '#0284C7';
    ribbonFold = '#082F49';
    ribbonOutline = '#081C2E';
  } else if (subType === 'freshaquarium' || optTitle.includes('freshaquarium') || optTitle.includes('열대어')) {
    seriesTitle = 'FRESHWATER AQUARIUM';
    ribbonColor = '#059669';
    ribbonFold = '#064E3B';
    ribbonOutline = '#062820';
  } else if (subType === 'terrarium' || optTitle.includes('terrarium') || optTitle.includes('테라리움')) {
    seriesTitle = 'TERRARIUM';
    ribbonColor = '#0F766E';
    ribbonFold = '#042F2E';
    ribbonOutline = '#0A1E1C';
  } else {
    if (options.title) {
      const cleanT = options.title.replace(/[0-9+]+|(cute|stickers?|bundle|png|digital|download)/gi, '').trim();
      if (cleanT.length > 0) {
        seriesTitle = cleanT.toUpperCase();
      }
    }
    ribbonColor = '#A84D1D';
    ribbonFold = '#5C1D07';
    ribbonOutline = '#261208';
  }

  // Ensure Google Fonts are active in Canvas
  if (typeof document !== 'undefined' && document.fonts) {
    try {
      await Promise.all([
        document.fonts.load("900 140px 'Lilita One'"),
        document.fonts.load("800 140px 'Fredoka'"),
        document.fonts.load("800 46px 'Lilita One'")
      ]);
    } catch {
      // Fallback seamlessly to system rounded fonts
    }
  }

  // 20 LARGE OVERLAPPING ANCHOR SLOTS FOR MAIN STICKERS (Base size: 920px - 980px)
  const ANCHOR_SLOTS = [
    // ROW 1: TOP ROW (5 stickers across top edge)
    { x: 320,  y: 380,  tilt: -12, scale: 0.95 },
    { x: 920,  y: 320,  tilt: 8,   scale: 0.92 },
    { x: 1500, y: 280,  tilt: -5,  scale: 0.92 },
    { x: 2080, y: 320,  tilt: 9,   scale: 0.92 },
    { x: 2680, y: 380,  tilt: -11, scale: 0.95 },

    // ROW 2: UPPER MID FLANKS (4 stickers framing title top corners)
    { x: 300,  y: 980,  tilt: 10,  scale: 0.95 },
    { x: 750,  y: 880,  tilt: -8,  scale: 0.88 },
    { x: 2250, y: 880,  tilt: 8,   scale: 0.88 },
    { x: 2700, y: 980,  tilt: -10, scale: 0.95 },

    // ROW 3: LOWER MID FLANKS (4 stickers framing title bottom corners)
    { x: 300,  y: 1620, tilt: -11, scale: 0.95 },
    { x: 750,  y: 1720, tilt: 7,   scale: 0.88 },
    { x: 2250, y: 1720, tilt: -8,  scale: 0.88 },
    { x: 2700, y: 1620, tilt: 10,  scale: 0.95 },

    // ROW 4: BOTTOM MID ROW (4 stickers across lower canvas)
    { x: 420,  y: 2280, tilt: -8,  scale: 0.95 },
    { x: 1020, y: 2200, tilt: 9,   scale: 0.92 },
    { x: 1980, y: 2200, tilt: -7,  scale: 0.92 },
    { x: 2580, y: 2280, tilt: 8,   scale: 0.95 },

    // ROW 5: BOTTOM ROW (3 stickers across bottom edge)
    { x: 680,  y: 2720, tilt: 8,   scale: 0.95 },
    { x: 1500, y: 2780, tilt: -6,  scale: 0.98 },
    { x: 2320, y: 2720, tilt: 9,   scale: 0.95 },
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

      // NOTE: Weird artificial geometric filler shapes (drawStandaloneThemeSticker) COMPLETELY REMOVED!
      // Only genuine, real sticker assets are rendered on canvas!

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

      // 4. Render ALL 20 Main Stickers with LARGE 920px Scale & Die-Cut Shadows
      const baseMaxDim = 920;

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
        ctx.shadowColor = 'rgba(0, 0, 0, 0.24)';
        ctx.shadowBlur = 42;
        ctx.shadowOffsetX = 6;
        ctx.shadowOffsetY = 16;

        ctx.drawImage(transparentStickerCanvas, -drawW / 2, -drawH / 2, drawW, drawH);
        ctx.restore();
      }

      // --- 5. Central Title & Ribbon Banner Typography (Etsy Bestseller Exact Match) ---
      const centerX = targetWidth / 2;

      // Draw clean, crisp, cute bold typography in signature Etsy raspberry pink (#E11D48)
      const drawTitleLine = (text: string, x: number, y: number, initialSize: number = 140) => {
        ctx.save();
        let size = initialSize;
        ctx.font = `900 ${size}px 'Lilita One', 'Fredoka', 'Arial Rounded MT Bold', sans-serif`;
        const w = ctx.measureText(text).width;
        if (w > 1280) {
          size = Math.floor(size * (1280 / w));
          ctx.font = `900 ${size}px 'Lilita One', 'Fredoka', 'Arial Rounded MT Bold', sans-serif`;
        }
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#E11D48'; // Exact signature Etsy bestseller rose/berry pink
        ctx.fillText(text, x, y);
        ctx.restore();
      };

      // Line 1: [COUNT]+ CUTE (e.g. 20+ CUTE or 40+ CUTE)
      drawTitleLine(`${count}+ CUTE`, centerX, 1190, 140);

      // Line 2: [SERIES TITLE] (e.g. HALLOWEEN, FALL HARVEST, TERRARIUM)
      drawTitleLine(seriesTitle, centerX, 1330, 145);

      // Line 3: STICKER BUNDLE
      drawTitleLine('STICKER BUNDLE', centerX, 1465, 135);

      // 4. Swallowtail 3D Ribbon Banner: PNG DIGITAL DOWNLOAD
      drawClassicRibbonBanner(
        ctx,
        centerX,
        1605,
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
