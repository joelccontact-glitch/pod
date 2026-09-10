/**
 * Real 20-Sticker Full Orbit Composite Master Cover Builder
 * Renders all 20 generated stickers in a dense 5-row orbit around a central Etsy-style emblem badge.
 * Leaves NO empty white gaps, framing the central badge snugly on all 4 sides.
 * Matches top-selling Etsy sticker bundle listings (Snoopy & Daily Life cute sticker sheet style).
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
  let borderColor = '#F472B6'; // Soft Pink Border

  if (subType === 'vivarium') {
    seriesTitle = 'VIVARIUM';
    primaryColor = '#059669'; // Emerald Green
    secondaryColor = '#047857'; 
    ribbonColor = '#0F766E'; // Dark Teal Ribbon
    borderColor = '#34D399'; // Mint Green Border
  } else if (subType === 'saltaquarium') {
    seriesTitle = 'SALTWATER AQUARIUM';
    primaryColor = '#0284C7'; // Cyan
    secondaryColor = '#1E40AF'; // Deep Blue
    ribbonColor = '#E11D48'; // Coral Ribbon
    borderColor = '#38BDF8'; // Sky Blue Border
  } else if (subType === 'freshaquarium') {
    seriesTitle = 'FRESHWATER AQUARIUM';
    primaryColor = '#2563EB'; // Royal Blue
    secondaryColor = '#1D4ED8';
    ribbonColor = '#059669'; // Emerald Ribbon
    borderColor = '#60A5FA'; // Soft Blue Border
  }

  // ALL 20 Anchor Slots orbiting around central emblem for dense 5-row packing (Canvas: 3000 x 3000)
  const ANCHOR_SLOTS = [
    // ROW 1: TOP EDGE (5 stickers across top edge)
    { x: 320,  y: 300,  tilt: -7, scale: 1.0 },
    { x: 860,  y: 240,  tilt: 6,  scale: 1.02 },
    { x: 1460, y: 220,  tilt: -4, scale: 0.98 },
    { x: 2060, y: 240,  tilt: 7,  scale: 1.02 },
    { x: 2600, y: 300,  tilt: -8, scale: 1.0 },

    // ROW 2: UPPER FLANKS (4 stickers surrounding upper badge)
    { x: 320,  y: 850,  tilt: 9,  scale: 1.0 },
    { x: 740,  y: 820,  tilt: -8, scale: 1.02 },
    { x: 2180, y: 820,  tilt: 7,  scale: 1.02 },
    { x: 2600, y: 850,  tilt: -10,scale: 1.0 },

    // ROW 3: LOWER FLANKS (4 stickers surrounding lower badge)
    { x: 320,  y: 1450, tilt: -8, scale: 1.04 },
    { x: 740,  y: 1450, tilt: 7,  scale: 1.02 },
    { x: 2180, y: 1450, tilt: -6, scale: 1.02 },
    { x: 2600, y: 1450, tilt: 9,  scale: 1.04 },

    // ROW 4: LOWER MID (4 stickers below badge)
    { x: 360,  y: 2060, tilt: -6, scale: 1.0 },
    { x: 940,  y: 2020, tilt: 8,  scale: 1.02 },
    { x: 1980, y: 2020, tilt: -7, scale: 1.02 },
    { x: 2560, y: 2060, tilt: 8,  scale: 1.0 },

    // ROW 5: BOTTOM EDGE (3 stickers across bottom edge)
    { x: 600,  y: 2640, tilt: 7,  scale: 1.0 },
    { x: 1460, y: 2680, tilt: -5, scale: 1.04 },
    { x: 2320, y: 2640, tilt: 8,  scale: 1.0 },
  ];

  // Take all 20 stickers (or up to 20)
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

      // 1. Pure Solid White Canvas Background (#FFFFFF)
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, targetWidth, targetHeight);

      // Subtle outer boundary stroke frame
      ctx.strokeStyle = '#F1F5F9';
      ctx.lineWidth = 16;
      ctx.strokeRect(8, 8, targetWidth - 16, targetHeight - 16);

      // 2. Load all 20 sticker images concurrently
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

      // 3. Render ALL 20 Stickers around the central badge
      const baseMaxDim = 620; // 620px size for 20 stickers to fill every inch of canvas!

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
        ctx.shadowBlur = 36;
        ctx.shadowOffsetX = 6;
        ctx.shadowOffsetY = 14;

        ctx.drawImage(transparentStickerCanvas, -drawW / 2, -drawH / 2, drawW, drawH);
        ctx.restore();
      }

      // 4. Render Central Emblem Badge in exact center (1460, 1300)
      const badgeW = 1220;
      const badgeH = 780;
      const badgeX = (targetWidth - badgeW) / 2;
      const badgeY = 910;

      ctx.save();
      // Multi-layer 3D drop shadow for emblem card
      ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
      ctx.shadowBlur = 48;
      ctx.shadowOffsetY = 16;

      // Badge Fill Card
      ctx.fillStyle = '#FFFDF8'; // Soft ivory cream white
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 14;

      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 56);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Inner Accent Dashed Line Border
      ctx.save();
      ctx.strokeStyle = secondaryColor;
      ctx.lineWidth = 4;
      ctx.setLineDash([16, 12]);
      ctx.beginPath();
      ctx.roundRect(badgeX + 16, badgeY + 16, badgeW - 32, badgeH - 32, 44);
      ctx.stroke();
      ctx.restore();

      // --- Central Badge Typography & Banner Decoration ---
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const centerX = targetWidth / 2;

      // Top Tag Pill Badge inside Emblem ("★ 20+ UNIQUE STICKERS ★")
      const pillW = 560;
      const pillH = 64;
      const pillX = (targetWidth - pillW) / 2;
      const pillY = badgeY + 44;

      ctx.fillStyle = '#FEF08A'; // Soft yellow highlight
      ctx.beginPath();
      ctx.roundRect(pillX, pillY, pillW, pillH, 32);
      ctx.fill();

      ctx.font = `800 32px sans-serif`;
      ctx.fillStyle = '#854D0E';
      ctx.fillText(`★ 20+ UNIQUE STICKERS ★`, centerX, pillY + 34);

      // Main Headline 1 ("20+ Cute")
      const countY = badgeY + 195;
      ctx.save();
      ctx.font = `900 115px 'Pacifico', 'Comic Sans MS', sans-serif`;
      ctx.fillStyle = primaryColor;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 4;
      ctx.fillText(`20+ Cute`, centerX, countY);
      ctx.restore();

      // Main Headline 2 ("[SERIES TITLE]")
      const titleY = badgeY + 325;
      ctx.font = `900 110px 'Impact', 'Arial Black', sans-serif`;
      ctx.fillStyle = '#1E293B';
      ctx.fillText(seriesTitle, centerX, titleY);

      // Main Headline 3 ("Sticker Bundle")
      const bundleY = badgeY + 445;
      ctx.font = `900 85px 'Arial Black', sans-serif`;
      ctx.fillStyle = primaryColor;
      ctx.fillText(`Sticker Bundle`, centerX, bundleY);

      // Ribbon Banner ("✨ PNG DIGITAL DOWNLOAD ✨")
      const ribW = 1060;
      const ribH = 84;
      const ribX = (targetWidth - ribW) / 2;
      const ribY = badgeY + 540;

      ctx.save();
      ctx.fillStyle = ribbonColor;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.16)';
      ctx.shadowBlur = 16;
      ctx.shadowOffsetY = 6;
      ctx.beginPath();
      ctx.roundRect(ribX, ribY, ribW, ribH, 42);
      ctx.fill();
      ctx.restore();

      ctx.font = `800 42px sans-serif`;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(`✨ PNG DIGITAL DOWNLOAD ✨`, centerX, ribY + 44);

      // Sub-feature text inside emblem
      ctx.font = `800 28px sans-serif`;
      ctx.fillStyle = '#475569';
      ctx.fillText(`INSTANT DOWNLOAD • 300 DPI TRANSPARENT PNG`, centerX, badgeY + 685);

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
