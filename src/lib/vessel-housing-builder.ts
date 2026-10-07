/**
 * Vessel Housing Builder (Solution B: Standalone Character -> Canvas Vessel Housing)
 * Places the 100% real standalone character inside a gorgeous, hand-crafted transparent
 * glass vessel (Cloche dome, vintage jar, aquarium tank, terrarium bulb) on HTML5 Canvas.
 * Guarantees 100% character identity between standalone and vessel stickers!
 */

export interface VesselHousingOptions {
  theme?: string; // 'halloween' | 'thanksgiving' | 'terrarium' | 'vivarium' | 'saltaquarium' | 'freshaquarium'
  vesselType?: 'cloche' | 'jar' | 'aquarium' | 'flask';
  targetWidth?: number; // default 3000
  targetHeight?: number; // default 3000
  characterIndex?: number;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error('Failed to load standalone image: ' + String(e)));
    img.src = src;
  });
}

/**
 * Remove outer white paper background from standalone sticker image via BFS flood fill.
 */
function makeStickerTransparent(img: HTMLImageElement): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = img.naturalWidth || img.width || 1024;
  c.height = img.naturalHeight || img.height || 1024;
  const ctx = c.getContext('2d');
  if (!ctx) return c;

  ctx.drawImage(img, 0, 0, c.width, c.height);
  const imgData = ctx.getImageData(0, 0, c.width, c.height);
  const data = imgData.data;
  const w = c.width;
  const h = c.height;
  const total = w * h;

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
    if (r >= 230 && g >= 230 && b >= 230) return true;
    const dr = Math.abs(r - bgR);
    const dg = Math.abs(g - bgG);
    const db = Math.abs(b - bgB);
    return dr <= 35 && dg <= 35 && db <= 35;
  };

  const visited = new Uint8Array(total);
  const queue = new Int32Array(total * 2);
  let head = 0, tail = 0;

  for (let x = 0; x < w; x++) {
    if (isOuterBg(x, 0)) { visited[x] = 1; queue[tail++] = x; queue[tail++] = 0; }
    if (isOuterBg(x, h - 1)) { const idx = (h - 1) * w + x; visited[idx] = 1; queue[tail++] = x; queue[tail++] = h - 1; }
  }
  for (let y = 0; y < h; y++) {
    if (isOuterBg(0, y)) { const idx = y * w; visited[idx] = 1; queue[tail++] = 0; queue[tail++] = y; }
    if (isOuterBg(w - 1, y)) { const idx = y * w + w - 1; visited[idx] = 1; queue[tail++] = w - 1; queue[tail++] = y; }
  }

  const dx = [1, -1, 0, 0];
  const dy = [0, 0, 1, -1];

  while (head < tail) {
    const cx = queue[head++];
    const cy = queue[head++];
    const cidx = (cy * w + cx) * 4;
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
  return c;
}

/**
 * Creates a complete Vessel Sticker by housing the 100% real standalone character.
 */
export async function createVesselStickerFromStandalone(
  standaloneImageUrlOrBase64: string,
  options: VesselHousingOptions = {}
): Promise<string> {
  const {
    theme = 'terrarium',
    targetWidth = 3000,
    targetHeight = 3000,
    characterIndex = 0
  } = options;

  // 1. Load standalone character image and make transparent
  const rawImg = await loadImage(standaloneImageUrlOrBase64);
  const charCanvas = makeStickerTransparent(rawImg);

  // 2. Setup 3000x3000 Master Canvas
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // CRITICAL RULE: Pure solid white background (#FFFFFF)
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, targetWidth, targetHeight);

  // Subtle outer boundary stroke
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 14;
  ctx.strokeRect(8, 8, targetWidth - 16, targetHeight - 16);

  // Determine vessel style based on index & theme
  const vesselTypes: Array<'cloche' | 'jar' | 'aquarium' | 'flask'> = ['cloche', 'jar', 'aquarium', 'flask'];
  const vesselStyle = options.vesselType || vesselTypes[characterIndex % vesselTypes.length];

  // Colors based on theme
  let baseColor = '#5C3A21'; // Warm walnut wood
  let baseColorLight = '#8B5A2B';
  let mossColor = '#4D7C0F'; // Vibrant forest moss
  let waterTint = 'rgba(224, 242, 254, 0.20)'; // Soft crystal clear water/air

  if (theme.includes('halloween') || theme.includes('할로윈')) {
    baseColor = '#271738'; // Dark spooky wood / obsidian
    baseColorLight = '#4A286D';
    mossColor = '#6B21A8'; // Spooky purple moss / succulents
    waterTint = 'rgba(238, 230, 255, 0.22)';
  } else if (theme.includes('thanksgiving') || theme.includes('fall') || theme.includes('harvest')) {
    baseColor = '#78350F'; // Rich amber wood
    baseColorLight = '#B45309';
    mossColor = '#A16207'; // Golden autumn moss
    waterTint = 'rgba(254, 243, 199, 0.20)';
  } else if (theme.includes('saltaquarium') || theme.includes('해수어')) {
    baseColor = '#0F172A'; // Modern navy acrylic base
    baseColorLight = '#1E293B';
    mossColor = '#0284C7'; // Blue reef substrate
    waterTint = 'rgba(186, 230, 253, 0.28)'; // Glowing tropical blue
  } else if (theme.includes('freshaquarium') || theme.includes('열대어')) {
    baseColor = '#1C1917'; // Dark natural stone
    baseColorLight = '#292524';
    mossColor = '#059669'; // Emerald aquatic moss
    waterTint = 'rgba(209, 250, 229, 0.24)';
  }

  // --- VESSEL GEOMETRY COORDINATES (Centered on 3000x3000) ---
  const cx = targetWidth / 2;
  const cy = targetHeight / 2 + 60; // slight offset for top finial
  const vesselW = 1850;
  const vesselH = 2200;
  const halfW = vesselW / 2;

  // 1. LAYER 1: BASE PEDESTAL & INTERIOR SUBSTRATE (Behind character)
  const baseY = cy + vesselH / 2 - 160;
  const baseW = vesselW + 180;
  const baseH = 180;

  ctx.save();
  // Outer die-cut drop shadow for whole vessel
  ctx.shadowColor = 'rgba(0, 0, 0, 0.20)';
  ctx.shadowBlur = 50;
  ctx.shadowOffsetX = 8;
  ctx.shadowOffsetY = 24;

  // Draw Wooden/Stone Base
  ctx.fillStyle = baseColor;
  ctx.beginPath();
  ctx.roundRect(cx - baseW / 2, baseY, baseW, baseH, [30, 30, 45, 45]);
  ctx.fill();

  // Upper base tier
  ctx.fillStyle = baseColorLight;
  ctx.beginPath();
  ctx.roundRect(cx - (baseW - 80) / 2, baseY - 35, baseW - 80, 45, [20, 20, 0, 0]);
  ctx.fill();

  // Base outline stroke
  ctx.strokeStyle = '#1E1B18';
  ctx.lineWidth = 10;
  ctx.stroke();

  // Interior Moss/Substrate Bed
  ctx.fillStyle = mossColor;
  ctx.beginPath();
  ctx.ellipse(cx, baseY - 30, halfW - 60, 110, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#1E1B18';
  ctx.lineWidth = 8;
  ctx.stroke();

  ctx.restore();

  // 2. LAYER 2: INTERIOR WATER/AIR BACKGROUND TINT
  ctx.save();
  ctx.beginPath();
  if (vesselStyle === 'cloche' || vesselStyle === 'flask') {
    // Dome Arch
    ctx.moveTo(cx - halfW, baseY - 30);
    ctx.lineTo(cx - halfW, cy - 250);
    ctx.bezierCurveTo(cx - halfW, cy - vesselH / 2 + 100, cx + halfW, cy - vesselH / 2 + 100, cx + halfW, cy - 250);
    ctx.lineTo(cx + halfW, baseY - 30);
  } else {
    // Jar / Aquarium Cylinder
    ctx.roundRect(cx - halfW, cy - vesselH / 2 + 200, vesselW, vesselH - 360, 40);
  }
  ctx.closePath();
  ctx.fillStyle = waterTint;
  ctx.fill();
  ctx.restore();

  // 3. LAYER 3: 100% REAL STANDALONE CHARACTER (Placed right inside)
  ctx.save();
  // Target character size inside the vessel (~1450px)
  const maxCharDim = 1450;
  const aspect = charCanvas.width / charCanvas.height;
  let charW = maxCharDim;
  let charH = maxCharDim / aspect;
  if (charH > maxCharDim) {
    charH = maxCharDim;
    charW = maxCharDim * aspect;
  }

  // Anchor character right on top of the moss bed
  const charX = cx - charW / 2;
  const charY = baseY - 80 - charH;

  // Character soft contact shadow on moss
  ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
  ctx.shadowBlur = 36;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 16;

  ctx.drawImage(charCanvas, charX, charY, charW, charH);
  ctx.restore();

  // 4. LAYER 4: GLASS VESSEL CONTOUR, RIM, AND 3D HIGHLIGHTS (In front of character)
  ctx.save();
  const strokeW = 12;
  ctx.strokeStyle = '#1E293B'; // Crisp dark outline
  ctx.lineWidth = strokeW;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  if (vesselStyle === 'cloche' || vesselStyle === 'flask') {
    // --- GLASS CLOCHE DOME ---
    const domeTopY = cy - vesselH / 2 + 120;

    // Glass finial knob on top
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(cx, domeTopY - 70, 65, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Knob neck
    ctx.beginPath();
    ctx.roundRect(cx - 30, domeTopY - 25, 60, 35, 10);
    ctx.fill();
    ctx.stroke();

    // Main Cloche Body
    ctx.beginPath();
    ctx.moveTo(cx - halfW, baseY - 30);
    ctx.lineTo(cx - halfW, cy - 250);
    ctx.bezierCurveTo(cx - halfW, domeTopY, cx + halfW, domeTopY, cx + halfW, cy - 250);
    ctx.lineTo(cx + halfW, baseY - 30);
    ctx.stroke();

    // Elegant Glass Highlights (Left curvature reflection)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.lineWidth = 26;
    ctx.beginPath();
    ctx.moveTo(cx - halfW + 65, baseY - 80);
    ctx.lineTo(cx - halfW + 65, cy - 200);
    ctx.bezierCurveTo(cx - halfW + 70, domeTopY + 120, cx - 180, domeTopY + 80, cx - 90, domeTopY + 70);
    ctx.stroke();

    // Secondary subtle highlight
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.moveTo(cx - halfW + 115, baseY - 120);
    ctx.lineTo(cx - halfW + 115, cy - 160);
    ctx.stroke();

  } else {
    // --- VINTAGE CORK JAR / AQUARIUM ---
    const jarTopY = cy - vesselH / 2 + 150;
    const neckW = vesselW - 320;

    // Cork Stopper on top
    ctx.fillStyle = '#A16207'; // Cork amber
    ctx.beginPath();
    ctx.roundRect(cx - neckW / 2 + 40, jarTopY - 110, neckW - 80, 100, [25, 25, 10, 10]);
    ctx.fill();
    ctx.stroke();

    // Glass Neck Rim
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.roundRect(cx - neckW / 2, jarTopY - 20, neckW, 50, 15);
    ctx.fill();
    ctx.stroke();

    // Main Jar Body
    ctx.beginPath();
    ctx.moveTo(cx - neckW / 2 + 30, jarTopY + 30);
    ctx.bezierCurveTo(cx - halfW, jarTopY + 90, cx - halfW, jarTopY + 180, cx - halfW, jarTopY + 280);
    ctx.lineTo(cx - halfW, baseY - 40);
    ctx.bezierCurveTo(cx - halfW, baseY, cx - halfW + 100, baseY, cx, baseY);
    ctx.bezierCurveTo(cx + halfW - 100, baseY, cx + halfW, baseY, cx + halfW, baseY - 40);
    ctx.lineTo(cx + halfW, jarTopY + 280);
    ctx.bezierCurveTo(cx + halfW, jarTopY + 180, cx + halfW, jarTopY + 90, cx + neckW / 2 - 30, jarTopY + 30);
    ctx.closePath();
    ctx.stroke();

    // Glass sheen highlights
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.70)';
    ctx.lineWidth = 24;
    ctx.beginPath();
    ctx.moveTo(cx - halfW + 65, baseY - 90);
    ctx.lineTo(cx - halfW + 65, jarTopY + 280);
    ctx.stroke();
  }

  // Tiny Cute Theme Deco Particles (Sparkles / Little Bubbles in Glass)
  const drawSparkle = (sx: number, sy: number, radius: number) => {
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(sx, sy, radius, 0, Math.PI * 2);
    ctx.fill();
  };

  drawSparkle(cx - halfW + 280, cy - 380, 14);
  drawSparkle(cx - halfW + 340, cy - 420, 8);
  drawSparkle(cx + halfW - 260, cy - 320, 12);
  drawSparkle(cx + halfW - 320, cy - 270, 7);

  ctx.restore();

  // 5. EXPORT JPEG (With strict Firestore limit < 650KB)
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

  return dataUrl;
}
