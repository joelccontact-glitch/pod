/**
 * Real 20-Sticker Composite Master Cover Builder
 * Renders 20 actual generated stickers dynamically around a central title emblem
 * with organic tilting, die-cut white borders, and soft drop shadows, matching
 * top-selling Etsy sticker bundle listings (Snoopy & Daily Life cute sticker style).
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
  let primaryColor = '#BE185D'; // Rose Pink
  let secondaryColor = '#0D9488'; // Teal
  let borderColor = '#F472B6'; // Soft Pink

  if (subType === 'vivarium') {
    seriesTitle = 'VIVARIUM';
    primaryColor = '#059669'; // Emerald
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

  // Anchor slots orbiting around the center emblem (Center X: 1500, Center Y: 1500)
  const ANCHOR_SLOTS = [
    // TOP ROW (5 items across top edge)
    { x: 340,  y: 320,  tilt: -9, scale: 1.0 },
    { x: 920,  y: 260,  tilt: 7,  scale: 1.04 },
    { x: 1500, y: 230,  tilt: -4, scale: 0.98 },
    { x: 2080, y: 260,  tilt: 8,  scale: 1.02 },
    { x: 2660, y: 320,  tilt: -7, scale: 1.0 },

    // UPPER FLANKS (2 items near badge top corners)
    { x: 600,  y: 740,  tilt: 11, scale: 1.0 },
    { x: 2400, y: 740,  tilt: -10,scale: 1.0 },

    // LEFT COLUMN FLANK (3 items stacked along left side)
    { x: 350,  y: 960,  tilt: -6, scale: 1.02 },
    { x: 320,  y: 1500, tilt: 8,  scale: 1.05 },
    { x: 350,  y: 2040, tilt: -11,scale: 0.98 },

    // RIGHT COLUMN FLANK (3 items stacked along right side)
    { x: 2650, y: 960,  tilt: 7,  scale: 1.0 },
    { x: 2680, y: 1500, tilt: -9, scale: 1.04 },
    { x: 2650, y: 2040, tilt: 10, scale: 0.98 },

    // LOWER FLANKS (2 items near badge bottom corners)
    { x: 600,  y: 2260, tilt: -8, scale: 1.0 },
    { x: 2400, y: 2260, tilt: 6,  scale: 1.0 },

    // BOTTOM ROW (5 items across bottom edge)
    { x: 340,  y: 2680, tilt: 9,  scale: 0.98 },
    { x: 920,  y: 2740, tilt: -5, scale: 1.04 },
    { x: 1500, y: 2770, tilt: 4,  scale: 1.0 },
    { x: 2080, y: 2740, tilt: -8, scale: 1.02 },
    { x: 2660, y: 2680, tilt: 11, scale: 0.98 },
  ];

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

      // Subtle warm border frame around the entire cover canvas
      ctx.strokeStyle = '#F1F5F9';
      ctx.lineWidth = 16;
      ctx.strokeRect(8, 8, targetWidth - 16, targetHeight - 16);

      // 2. Load 20 sticker images concurrently
      const loadPromises = stickers.slice(0, 20).map((s) => {
        return new Promise<HTMLImageElement | null>((res) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = s.image_url || s.url;
          img.onload = () => res(img);
          img.onerror = () => res(null);
        });
      });

      const loadedImages = await Promise.all(loadPromises);

      // 3. Render 20 Stickers around the perimeter ring with organic tilt & soft shadow
      for (let i = 0; i < loadedImages.length; i++) {
        const img = loadedImages[i];
        if (!img) continue;

        const slot = ANCHOR_SLOTS[i % ANCHOR_SLOTS.length];
        const baseMaxDim = 470;
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

        // Soft die-cut drop shadow around each sticker sample
        ctx.shadowColor = 'rgba(0, 0, 0, 0.14)';
        ctx.shadowBlur = 28;
        ctx.shadowOffsetX = 4;
        ctx.shadowOffsetY = 12;

        ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
        ctx.restore();
      }

      // 4. Render Central Emblem Badge in the Exact Center (1500, 1500)
      const badgeW = 1520;
      const badgeH = 820;
      const badgeX = (targetWidth - badgeW) / 2;
      const badgeY = (targetHeight - badgeH) / 2;

      ctx.save();
      // Multi-layer drop shadow for 3D pop effect
      ctx.shadowColor = 'rgba(0, 0, 0, 0.16)';
      ctx.shadowBlur = 48;
      ctx.shadowOffsetY = 18;

      // Badge Card Fill
      ctx.fillStyle = '#FFFDF9'; // Soft ivory cream white
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 14;

      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 60);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Inner Accent Dash Line
      ctx.save();
      ctx.strokeStyle = secondaryColor;
      ctx.lineWidth = 4;
      ctx.setLineDash([16, 12]);
      ctx.beginPath();
      ctx.roundRect(badgeX + 16, badgeY + 16, badgeW - 32, badgeH - 32, 48);
      ctx.stroke();
      ctx.restore();

      // --- Central Badge Typography & Decoration ---
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Top Tag Pill Badge inside Emblem ("★ 20 UNIQUE STICKERS ★")
      const pillW = 540;
      const pillH = 68;
      const pillX = (targetWidth - pillW) / 2;
      const pillY = badgeY + 60;

      ctx.fillStyle = '#FEF08A'; // Soft yellow
      ctx.beginPath();
      ctx.roundRect(pillX, pillY, pillW, pillH, 34);
      ctx.fill();

      ctx.font = `800 32px sans-serif`;
      ctx.fillStyle = '#854D0E';
      ctx.fillText(`★ 20 UNIQUE STICKERS ★`, targetWidth / 2, pillY + 36);

      // Giant Count Number ("20+")
      const countY = badgeY + 230;
      ctx.save();
      ctx.font = `900 160px 'Arial Black', sans-serif`;
      ctx.fillStyle = primaryColor;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
      ctx.shadowBlur = 12;
      ctx.shadowOffsetY = 6;
      ctx.fillText(`20+`, targetWidth / 2, countY);
      ctx.restore();

      // Main Pack Title ("CUTE [SERIES] STICKERS")
      const titleY = badgeY + 390;
      ctx.font = `900 90px 'Pacifico', 'Comic Sans MS', sans-serif`;
      ctx.fillStyle = '#1E293B';
      ctx.fillText(`CUTE ${seriesTitle}`, targetWidth / 2, titleY);

      // Ribbon Pill Banner ("✨ DAILY LIFE STICKER BUNDLE ✨")
      const ribW = 1200;
      const ribH = 88;
      const ribX = (targetWidth - ribW) / 2;
      const ribY = badgeY + 490;

      ctx.save();
      ctx.fillStyle = primaryColor;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.12)';
      ctx.shadowBlur = 16;
      ctx.shadowOffsetY = 6;
      ctx.beginPath();
      ctx.roundRect(ribX, ribY, ribW, ribH, 44);
      ctx.fill();
      ctx.restore();

      ctx.font = `800 44px sans-serif`;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(`✨ DAILY LIFE STICKER BUNDLE ✨`, targetWidth / 2, ribY + 46);

      // Sub-feature text inside emblem
      ctx.font = `700 30px sans-serif`;
      ctx.fillStyle = '#64748B';
      ctx.fillText(`super cute • high resolution • 300 DPI PNG`, targetWidth / 2, badgeY + 655);

      // 5. Bottom Ribbon Bar (Etsy Best-Seller Footer)
      const footerY = 2930;
      const footerW = 2200;
      const footerH = 64;
      const footerX = (targetWidth - footerW) / 2;

      ctx.save();
      ctx.fillStyle = '#F8FAFC';
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(footerX, footerY - 32, footerW, footerH, 32);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      ctx.font = `700 26px sans-serif`;
      ctx.fillStyle = '#475569';
      ctx.fillText(`🌸 for planners  •  GoodNotes  •  crafts  •  300 DPI transparent PNG  🌸`, targetWidth / 2, footerY);

      // 6. Export JPEG at quality 0.85 (keeping size ~250KB, well under 1MB limit)
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
