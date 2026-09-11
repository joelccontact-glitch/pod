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

function drawDieCutBorderPath(ctx: CanvasRenderingContext2D, drawShape: () => void) {
  ctx.save();
  // Thick smooth white die-cut border around standalone element
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 36;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.beginPath();
  drawShape();
  ctx.stroke();
  ctx.restore();
}

function drawStandaloneThemeSticker(
  ctx: CanvasRenderingContext2D,
  subType: string,
  index: number,
  x: number,
  y: number,
  scale: number = 1.0,
  tilt: number = 0
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((tilt * Math.PI) / 180);
  ctx.scale(scale, scale);

  // Sticker Drop Shadow & Thick White Die-Cut Border setup
  ctx.shadowColor = 'rgba(0, 0, 0, 0.20)';
  ctx.shadowBlur = 32;
  ctx.shadowOffsetX = 4;
  ctx.shadowOffsetY = 12;

  if (subType === 'terrarium') {
    const type = index % 6;
    if (type === 0) {
      // 1. Succulent Rosette
      drawDieCutBorderPath(ctx, () => {
        ctx.arc(0, 0, 95, 0, Math.PI * 2);
      });
      ctx.fillStyle = '#059669';
      for (let i = 0; i < 8; i++) {
        ctx.save();
        ctx.rotate((i * Math.PI) / 4);
        ctx.beginPath();
        ctx.ellipse(0, -45, 26, 42, 0, 0, Math.PI * 2);
        ctx.fillStyle = i % 2 === 0 ? '#34D399' : '#10B981';
        ctx.fill();
        ctx.strokeStyle = '#065F46';
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.fillStyle = '#F472B6';
        ctx.beginPath();
        ctx.arc(0, -78, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      ctx.fillStyle = '#F472B6';
      ctx.beginPath();
      ctx.arc(0, 0, 22, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === 1) {
      // 2. Red Toadstool Mushroom Pair
      drawDieCutBorderPath(ctx, () => {
        ctx.rect(-80, -90, 160, 170);
      });
      ctx.fillStyle = '#FEF08A';
      ctx.beginPath(); ctx.roundRect(-45, -10, 30, 80, 14); ctx.fill();
      ctx.beginPath(); ctx.roundRect(10, 10, 25, 60, 12); ctx.fill();
      ctx.fillStyle = '#EF4444';
      ctx.beginPath(); ctx.arc(-30, -20, 52, Math.PI, 0); ctx.fill();
      ctx.beginPath(); ctx.arc(22, 0, 38, Math.PI, 0); ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath(); ctx.arc(-45, -45, 10, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(-15, -55, 12, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(-30, -30, 8, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(15, -20, 8, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(32, -12, 7, 0, Math.PI * 2); ctx.fill();
    } else if (type === 2) {
      // 3. Mini Potted Cactus
      drawDieCutBorderPath(ctx, () => {
        ctx.rect(-70, -90, 140, 170);
      });
      ctx.fillStyle = '#F97316';
      ctx.beginPath(); ctx.moveTo(-50, 0); ctx.lineTo(-40, 75); ctx.lineTo(40, 75); ctx.lineTo(50, 0); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#10B981';
      ctx.beginPath(); ctx.roundRect(-35, -70, 70, 80, 32); ctx.fill();
      ctx.fillStyle = '#EC4899';
      ctx.beginPath(); ctx.arc(0, -75, 16, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#FDE047';
      ctx.beginPath(); ctx.arc(0, -75, 7, 0, Math.PI * 2); ctx.fill();
    } else if (type === 3) {
      // 4. Amethyst Crystal Cluster
      drawDieCutBorderPath(ctx, () => {
        ctx.rect(-70, -85, 140, 160);
      });
      ctx.fillStyle = '#8B5CF6';
      ctx.beginPath(); ctx.moveTo(-20, 60); ctx.lineTo(-50, -30); ctx.lineTo(-25, -75); ctx.lineTo(0, -30); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#A855F7';
      ctx.beginPath(); ctx.moveTo(0, 60); ctx.lineTo(15, -40); ctx.lineTo(40, -85); ctx.lineTo(55, -30); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(-35, -40); ctx.lineTo(-25, -65); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(25, -45); ctx.lineTo(38, -75); ctx.stroke();
    } else if (type === 4) {
      // 5. Fern / Leaf Sprig
      drawDieCutBorderPath(ctx, () => {
        ctx.rect(-70, -85, 140, 170);
      });
      ctx.fillStyle = '#059669';
      ctx.beginPath(); ctx.ellipse(0, 0, 50, 75, -0.3, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#047857'; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.moveTo(0, 75); ctx.lineTo(0, -75); ctx.stroke();
    } else {
      // 6. Airplant (Tillandsia)
      drawDieCutBorderPath(ctx, () => {
        ctx.rect(-80, -80, 160, 160);
      });
      ctx.fillStyle = '#10B981';
      for (let a = -1.2; a <= 1.2; a += 0.4) {
        ctx.save();
        ctx.rotate(a);
        ctx.beginPath(); ctx.ellipse(0, -45, 12, 50, 0, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
      ctx.fillStyle = '#F472B6';
      ctx.beginPath(); ctx.arc(-25, 45, 18, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(10, 50, 22, 0, Math.PI * 2); ctx.fill();
    }
  } else if (subType === 'saltaquarium') {
    const type = index % 5;
    if (type === 0) {
      // Clownfish (Nemo)
      drawDieCutBorderPath(ctx, () => {
        ctx.ellipse(0, 0, 85, 55, 0, 0, Math.PI * 2);
      });
      ctx.fillStyle = '#F97316';
      ctx.beginPath(); ctx.ellipse(0, 0, 70, 42, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(60, 0); ctx.lineTo(90, -30); ctx.lineTo(90, 30); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#FFFFFF'; ctx.strokeStyle = '#000000'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.roundRect(-45, -38, 20, 76, 10); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.roundRect(0, -42, 22, 84, 10); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.roundRect(45, -28, 16, 56, 8); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#000000'; ctx.beginPath(); ctx.arc(-42, -10, 8, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(-44, -12, 3, 0, Math.PI * 2); ctx.fill();
    } else if (type === 1) {
      // Blue Tang (Dory)
      drawDieCutBorderPath(ctx, () => {
        ctx.ellipse(0, 0, 85, 55, 0, 0, Math.PI * 2);
      });
      ctx.fillStyle = '#2563EB';
      ctx.beginPath(); ctx.ellipse(-10, 0, 65, 45, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#FACC15';
      ctx.beginPath(); ctx.moveTo(45, 0); ctx.lineTo(85, -32); ctx.lineTo(85, 32); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#000000'; ctx.beginPath(); ctx.arc(-50, -10, 8, 0, Math.PI * 2); ctx.fill();
    } else if (type === 2) {
      // Yellow Seahorse
      drawDieCutBorderPath(ctx, () => {
        ctx.rect(-50, -90, 100, 180);
      });
      ctx.fillStyle = '#FACC15';
      ctx.beginPath(); ctx.arc(0, -45, 32, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(-5, 10, 26, 45, 0.2, 0, Math.PI * 2); ctx.fill();
      ctx.lineWidth = 16; ctx.strokeStyle = '#FACC15'; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(15, 60, 25, 0, Math.PI); ctx.stroke();
      ctx.fillStyle = '#000000'; ctx.beginPath(); ctx.arc(-12, -50, 7, 0, Math.PI * 2); ctx.fill();
    } else if (type === 3) {
      // Coral Reef Cluster
      drawDieCutBorderPath(ctx, () => {
        ctx.rect(-80, -80, 160, 160);
      });
      ctx.fillStyle = '#EC4899';
      for (let r = -50; r <= 50; r += 25) {
        ctx.beginPath(); ctx.roundRect(r, -60, 22, 90, 12); ctx.fill();
      }
    } else {
      // Sea Kelp
      drawDieCutBorderPath(ctx, () => {
        ctx.rect(-60, -90, 120, 180);
      });
      ctx.fillStyle = '#10B981';
      ctx.lineWidth = 18; ctx.strokeStyle = '#10B981'; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-20, 80); ctx.quadraticCurveTo(30, 0, -10, -80); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(10, 80); ctx.quadraticCurveTo(-40, 10, 20, -70); ctx.stroke();
    }
  } else if (subType === 'vivarium') {
    const type = index % 4;
    if (type === 0) {
      // Green Tree Frog
      drawDieCutBorderPath(ctx, () => {
        ctx.ellipse(0, 0, 75, 55, 0, 0, Math.PI * 2);
      });
      ctx.fillStyle = '#22C55E'; ctx.beginPath(); ctx.ellipse(0, 5, 55, 40, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#EAB308'; ctx.beginPath(); ctx.arc(-30, -30, 16, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(30, -30, 16, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#000000'; ctx.beginPath(); ctx.arc(-30, -30, 8, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(30, -30, 8, 0, Math.PI * 2); ctx.fill();
    } else if (type === 1) {
      // Baby Chameleon
      drawDieCutBorderPath(ctx, () => {
        ctx.rect(-75, -75, 150, 150);
      });
      ctx.fillStyle = '#10B981'; ctx.beginPath(); ctx.arc(-10, -10, 45, 0, Math.PI * 2); ctx.fill();
      ctx.lineWidth = 14; ctx.strokeStyle = '#10B981'; ctx.beginPath(); ctx.arc(35, 20, 25, 0, Math.PI * 1.5); ctx.stroke();
      ctx.fillStyle = '#FACC15'; ctx.beginPath(); ctx.arc(-28, -22, 14, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#000000'; ctx.beginPath(); ctx.arc(-28, -22, 6, 0, Math.PI * 2); ctx.fill();
    } else if (type === 2) {
      // Monstera Leaf
      drawDieCutBorderPath(ctx, () => {
        ctx.rect(-70, -85, 140, 170);
      });
      ctx.fillStyle = '#047857'; ctx.beginPath(); ctx.ellipse(0, 0, 55, 75, 0, 0, Math.PI * 2); ctx.fill();
    } else {
      // Mossy Stone
      drawDieCutBorderPath(ctx, () => {
        ctx.rect(-75, -60, 150, 120);
      });
      ctx.fillStyle = '#64748B'; ctx.beginPath(); ctx.ellipse(0, 10, 65, 40, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#22C55E'; ctx.beginPath(); ctx.ellipse(0, -15, 55, 25, 0, 0, Math.PI * 2); ctx.fill();
    }
  } else {
    // Freshwater Aquarium
    const type = index % 4;
    if (type === 0) {
      // Red Betta Fish
      drawDieCutBorderPath(ctx, () => {
        ctx.ellipse(0, 0, 85, 55, 0, 0, Math.PI * 2);
      });
      ctx.fillStyle = '#EF4444'; ctx.beginPath(); ctx.ellipse(-20, 0, 45, 30, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(10, 0); ctx.quadraticCurveTo(80, -60, 90, 0); ctx.quadraticCurveTo(80, 60, 10, 0); ctx.fill();
    } else if (type === 1) {
      // Neon Tetra
      drawDieCutBorderPath(ctx, () => {
        ctx.ellipse(0, 0, 75, 45, 0, 0, Math.PI * 2);
      });
      ctx.fillStyle = '#06B6D4'; ctx.beginPath(); ctx.ellipse(0, 0, 60, 22, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#EF4444'; ctx.beginPath(); ctx.ellipse(15, 5, 35, 12, 0, 0, Math.PI * 2); ctx.fill();
    } else if (type === 2) {
      // Yellow Guppy
      drawDieCutBorderPath(ctx, () => {
        ctx.ellipse(0, 0, 80, 50, 0, 0, Math.PI * 2);
      });
      ctx.fillStyle = '#FACC15'; ctx.beginPath(); ctx.ellipse(-25, 0, 35, 22, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(75, -45); ctx.lineTo(75, 45); ctx.closePath(); ctx.fill();
    } else {
      // Water Plant
      drawDieCutBorderPath(ctx, () => {
        ctx.rect(-50, -85, 100, 170);
      });
      ctx.fillStyle = '#10B981'; ctx.lineWidth = 14; ctx.strokeStyle = '#10B981'; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(0, 75); ctx.lineTo(0, -75); ctx.stroke();
    }
  }

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
  let ribbonColor = '#0F766E'; // Dark Teal Ribbon
  let bgColor = '#FDF2F8'; // Soft Pinkish Pastel Tint

  if (subType === 'vivarium') {
    seriesTitle = 'VIVARIUM';
    primaryColor = '#059669'; // Emerald Green
    ribbonColor = '#0F766E'; // Dark Teal Ribbon
    bgColor = '#ECFDF5'; // Soft Mint Pastel Tint
  } else if (subType === 'saltaquarium') {
    seriesTitle = 'SALTWATER AQUARIUM';
    primaryColor = '#E11D48'; // Coral Pink
    ribbonColor = '#0F766E'; // Dark Teal Ribbon
    bgColor = '#F0F9FF'; // Soft Sky Blue Pastel Tint
  } else if (subType === 'freshaquarium') {
    seriesTitle = 'FRESHWATER AQUARIUM';
    primaryColor = '#2563EB'; // Royal Blue
    ribbonColor = '#059669'; // Emerald Ribbon
    bgColor = '#EFF6FF'; // Soft Royal Blue Pastel Tint
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

  // 14 STANDALONE FILLER SLOTS (Fills all white gaps around title & between main stickers)
  const FILLER_SLOTS = [
    { x: 610,  y: 340,  tilt: 15,  scale: 1.1 },
    { x: 1210, y: 300,  tilt: -10, scale: 1.1 },
    { x: 1790, y: 300,  tilt: 12,  scale: 1.1 },
    { x: 2390, y: 340,  tilt: -14, scale: 1.1 },

    { x: 520,  y: 720,  tilt: 18,  scale: 1.15 },
    { x: 2480, y: 720,  tilt: -16, scale: 1.15 },

    { x: 500,  y: 1300, tilt: -12, scale: 1.2 },
    { x: 2500, y: 1300, tilt: 14,  scale: 1.2 },

    { x: 520,  y: 1940, tilt: 15,  scale: 1.15 },
    { x: 2480, y: 1940, tilt: -18, scale: 1.15 },

    { x: 1080, y: 1840, tilt: -10, scale: 1.1 },
    { x: 1920, y: 1840, tilt: 12,  scale: 1.1 },

    { x: 1100, y: 2680, tilt: 14,  scale: 1.1 },
    { x: 1900, y: 2680, tilt: -12, scale: 1.1 },
  ];

  // Take all 20 stickers
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

      // 1. Soft Warm Pastel Background (#FDF2F8 / #ECFDF5 / #F0F9FF)
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, targetWidth, targetHeight);

      // Draw subtle floating decorative sparkles ✨ & hearts 💕 in background
      ctx.save();
      const accents = [
        { x: 180, y: 180, char: '✨', size: 54, color: '#F472B6' },
        { x: 2820, y: 180, char: '💕', size: 56, color: '#F472B6' },
        { x: 150, y: 1200, char: '🌸', size: 48, color: '#F472B6' },
        { x: 2850, y: 1200, char: '✨', size: 54, color: '#F472B6' },
        { x: 200, y: 2800, char: '🌸', size: 56, color: '#F472B6' },
        { x: 2800, y: 2800, char: '✨', size: 54, color: '#F472B6' },
      ];
      accents.forEach(a => {
        ctx.font = `${a.size}px sans-serif`;
        ctx.fillStyle = a.color;
        ctx.fillText(a.char, a.x, a.y);
      });
      ctx.restore();

      // Subtle outer boundary stroke frame
      ctx.strokeStyle = '#CBD5E1';
      ctx.lineWidth = 14;
      ctx.strokeRect(8, 8, targetWidth - 16, targetHeight - 16);

      // 2. Render 14 STANDALONE THEME FILLER STICKERS in gaps (Background layer)
      FILLER_SLOTS.forEach((slot, idx) => {
        drawStandaloneThemeSticker(ctx, subType, idx, slot.x, slot.y, slot.scale, slot.tilt);
      });

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

      // --- 5. Central Title & Ribbon Banner Typography (Direct on Canvas, NO Big White Box Card) ---
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const centerX = targetWidth / 2;
      const centerY = 1350;

      const drawPopText = (
        text: string,
        x: number,
        y: number,
        font: string,
        fillColor: string,
        strokeWidth: number = 24
      ) => {
        ctx.save();
        ctx.font = font;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Thick smooth white outline pop
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = strokeWidth;
        ctx.lineJoin = 'round';
        ctx.strokeText(text, x, y);

        // Soft drop shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.18)';
        ctx.shadowBlur = 18;
        ctx.shadowOffsetY = 6;

        ctx.fillStyle = fillColor;
        ctx.fillText(text, x, y);
        ctx.restore();
      };

      // 1. Top Pill Badge ("★ 20+ UNIQUE STICKERS ★")
      const pillW = 640;
      const pillH = 72;
      const pillX = (targetWidth - pillW) / 2;
      const pillY = centerY - 320;

      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.14)';
      ctx.shadowBlur = 16;
      ctx.shadowOffsetY = 4;
      ctx.fillStyle = '#FEF08A';
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.roundRect(pillX, pillY, pillW, pillH, 36);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      ctx.font = `800 36px sans-serif`;
      ctx.fillStyle = '#854D0E';
      ctx.fillText(`★ 20+ UNIQUE STICKERS ★`, centerX, pillY + 38);

      // 2. Main Headline 1 ("20+ Cute")
      drawPopText(`20+ Cute`, centerX, centerY - 180, `900 135px 'Pacifico', 'Comic Sans MS', sans-serif`, primaryColor, 26);

      // 3. Main Headline 2 ("[SERIES TITLE]")
      drawPopText(seriesTitle, centerX, centerY - 40, `900 130px 'Impact', 'Arial Black', sans-serif`, '#1E293B', 28);

      // 4. Main Headline 3 ("Sticker Bundle")
      drawPopText(`Sticker Bundle`, centerX, centerY + 90, `900 100px 'Arial Black', sans-serif`, primaryColor, 24);

      // 5. Ribbon Banner ("✨ PNG DIGITAL DOWNLOAD ✨")
      const ribW = 1240;
      const ribH = 96;
      const ribX = (targetWidth - ribW) / 2;
      const ribY = centerY + 190;

      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.22)';
      ctx.shadowBlur = 24;
      ctx.shadowOffsetY = 8;
      ctx.fillStyle = ribbonColor;
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.roundRect(ribX, ribY, ribW, ribH, 48);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      ctx.font = `800 46px sans-serif`;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(`✨ PNG DIGITAL DOWNLOAD ✨`, centerX, ribY + 50);

      // 6. Subtitle ("INSTANT DOWNLOAD • 300 DPI TRANSPARENT PNG")
      drawPopText(`INSTANT DOWNLOAD • 300 DPI TRANSPARENT PNG`, centerX, centerY + 330, `800 32px sans-serif`, '#475569', 14);

      // 6. Bottom Ribbon Bar (Etsy Best-Seller Footer)
      const footerY = 2925;
      const footerW = 2300;
      const footerH = 68;
      const footerX = (targetWidth - footerW) / 2;

      ctx.save();
      ctx.fillStyle = '#FFFFFF';
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
