/**
 * Real 10-Sticker Representative Composite Master Cover Builder
 * Renders 10 large, representative generated stickers around a central title emblem
 * with organic tilting, die-cut white borders, and soft drop shadows.
 * Matches top-selling Etsy sticker bundle listings (Snoopy style: full canvas, dense & vibrant).
 */

export interface MasterCoverBuilderOptions {
  title?: string;
  subType?: string; // 'terrarium' | 'vivarium' | 'saltaquarium' | 'freshaquarium'
  targetWidth?: number; // default 3000
  targetHeight?: number; // default 3000
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
  let primaryColor = '#E11D48'; // Bright Rose/Pink
  let secondaryColor = '#0D9488'; // Teal
  let borderColor = '#F472B6'; // Soft Pink

  if (subType === 'vivarium') {
    seriesTitle = 'VIVARIUM';
    primaryColor = '#059669'; // Emerald Green
    secondaryColor = '#D97706'; // Amber
    borderColor = '#34D399'; // Mint Green
  } else if (subType === 'saltaquarium') {
    seriesTitle = 'SALTWATER AQUARIUM';
    primaryColor = '#0284C7'; // Cyan/Blue
    secondaryColor = '#E11D48'; // Coral
    borderColor = '#38BDF8'; // Sky Blue
  } else if (subType === 'freshaquarium') {
    seriesTitle = 'FRESHWATER AQUARIUM';
    primaryColor = '#2563EB'; // Royal Blue
    secondaryColor = '#0D9488'; // Teal
    borderColor = '#60A5FA'; // Soft Blue
  }

  // 10 Representative Anchor Slots around center badge for full canvas Snoopy style
  // Canvas size: 3000 x 3000
  const ANCHOR_SLOTS = [
    // TOP ROW (4 large stickers)
    { x: 500,  y: 480,  tilt: -9, scale: 1.05 },
    { x: 1150, y: 380,  tilt: 5,  scale: 1.0 },
    { x: 1850, y: 380,  tilt: -6, scale: 1.0 },
    { x: 2500, y: 480,  tilt: 8,  scale: 1.05 },

    // MIDDLE FLANKS (2 large stickers left/right)
    { x: 420,  y: 1500, tilt: 7,  scale: 1.08 },
    { x: 2580, y: 1500, tilt: -8, scale: 1.08 },

    // BOTTOM ROW (4 large stickers)
    { x: 500,  y: 2500, tilt: -7, scale: 1.05 },
    { x: 1150, y: 2620, tilt: 6,  scale: 1.0 },
    { x: 1850, y: 2620, tilt: -5, scale: 1.0 },
    { x: 2500, y: 2500, tilt: 9,  scale: 1.05 },
  ];

  // Select 10 representative stickers from the stickers array
  let representativeStickers: any[] = [];
  if (stickers.length <= 10) {
    representativeStickers = [...stickers];
  } else {
    // Evenly sample 10 stickers across the full pack
    const step = stickers.length / 10;
    for (let i = 0; i < 10; i++) {
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

      // Subtle outer boundary stroke
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
      const baseMaxDim = 880; // Large 880px size for bold visual impact!

      for (let i = 0; i < loadedImages.length; i++) {
        const img = loadedImages[i];
        if (!img) continue;

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

        // Rich die-cut drop shadow around each sticker sample
        ctx.shadowColor = 'rgba(0, 0, 0, 0.20)';
        ctx.shadowBlur = 38;
        ctx.shadowOffsetX = 6;
        ctx.shadowOffsetY = 16;

        ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
        ctx.restore();
      }

      // 4. Render Central Emblem Badge in the Exact Center (1500, 1500)
      const badgeW = 1680;
      const badgeH = 1020;
      const badgeX = (targetWidth - badgeW) / 2;
      const badgeY = (targetHeight - badgeH) / 2;

      ctx.save();
      // Strong multi-layer drop shadow for 3D emblem pop effect
      ctx.shadowColor = 'rgba(0, 0, 0, 0.24)';
      ctx.shadowBlur = 56;
      ctx.shadowOffsetY = 20;

      // Badge Fill Card
      ctx.fillStyle = '#FFFDF9'; // Soft ivory cream white
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 16;

      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 64);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Inner Accent Dashed Line Border
      ctx.save();
      ctx.strokeStyle = secondaryColor;
      ctx.lineWidth = 5;
      ctx.setLineDash([18, 12]);
      ctx.beginPath();
      ctx.roundRect(badgeX + 18, badgeY + 18, badgeW - 36, badgeH - 36, 50);
      ctx.stroke();
      ctx.restore();

      // --- Central Badge Typography & Banner Decoration ---
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Top Tag Pill Badge inside Emblem ("★ 20+ UNIQUE STICKERS ★")
      const pillW = 620;
      const pillH = 72;
      const pillX = (targetWidth - pillW) / 2;
      const pillY = badgeY + 54;

      ctx.fillStyle = '#FEF08A'; // Soft yellow highlight
      ctx.beginPath();
      ctx.roundRect(pillX, pillY, pillW, pillH, 36);
      ctx.fill();

      ctx.font = `800 34px sans-serif`;
      ctx.fillStyle = '#854D0E';
      ctx.fillText(`★ 20+ UNIQUE STICKERS ★`, targetWidth / 2, pillY + 38);

      // Main Headline 1 ("20+ CUTE")
      const countY = badgeY + 220;
      ctx.save();
      ctx.font = `900 130px 'Arial Black', sans-serif`;
      ctx.fillStyle = primaryColor;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
      ctx.shadowBlur = 12;
      ctx.shadowOffsetY = 6;
      ctx.fillText(`20+ CUTE`, targetWidth / 2, countY);
      ctx.restore();

      // Main Headline 2 ("[SERIES TITLE]")
      const titleY = badgeY + 370;
      ctx.font = `900 105px 'Impact', 'Comic Sans MS', sans-serif`;
      ctx.fillStyle = '#1E293B';
      ctx.fillText(seriesTitle, targetWidth / 2, titleY);

      // Main Headline 3 ("STICKER BUNDLE")
      const bundleY = badgeY + 500;
      ctx.font = `900 95px 'Arial Black', sans-serif`;
      ctx.fillStyle = primaryColor;
      ctx.fillText(`STICKER BUNDLE`, targetWidth / 2, bundleY);

      // Ribbon Banner ("✨ PNG DIGITAL DOWNLOAD ✨")
      const ribW = 1360;
      const ribH = 96;
      const ribX = (targetWidth - ribW) / 2;
      const ribY = badgeY + 620;

      ctx.save();
      ctx.fillStyle = primaryColor;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.16)';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetY = 6;
      ctx.beginPath();
      ctx.roundRect(ribX, ribY, ribW, ribH, 48);
      ctx.fill();
      ctx.restore();

      ctx.font = `800 46px sans-serif`;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(`✨ PNG DIGITAL DOWNLOAD ✨`, targetWidth / 2, ribY + 50);

      // Sub-feature text inside emblem
      ctx.font = `800 32px sans-serif`;
      ctx.fillStyle = '#475569';
      ctx.fillText(`INSTANT DOWNLOAD • 300 DPI TRANSPARENT PNG`, targetWidth / 2, badgeY + 800);

      // 5. Bottom Footer Bar (Etsy Best-Seller Footer)
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
      ctx.fillStyle = '#334155';
      ctx.fillText(`🌸 20 UNIQUE HIGH QUALITY STICKERS  •  300 DPI TRANSPARENT PNG  •  INSTANT DOWNLOAD 🌸`, targetWidth / 2, footerY);

      // 6. Export JPEG at quality 0.85
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
