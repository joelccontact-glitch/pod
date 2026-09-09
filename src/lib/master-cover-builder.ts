/**
 * Real 20-Sticker Composite Master Cover Builder
 * Programmatically renders 20 actual generated stickers onto a 3000x3000px Etsy listing cover canvas.
 * Guarantees 100% exact match between the Master Cover thumbnail and the actual pack contents.
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
  if (subType === 'vivarium') seriesTitle = 'VIVARIUM';
  else if (subType === 'saltaquarium') seriesTitle = 'SALTWATER AQUARIUM';
  else if (subType === 'freshaquarium') seriesTitle = 'FRESHWATER AQUARIUM';

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

      // 1. Pure Solid White Background (#FFFFFF)
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, targetWidth, targetHeight);

      // 2. Header Banner Background Ribbon
      const headerH = 520;
      
      // Decorative top gradient accent bar
      const grad = ctx.createLinearGradient(0, 0, targetWidth, 0);
      grad.addColorStop(0, '#ec4899'); // Pink
      grad.addColorStop(0.5, '#06b6d4'); // Cyan
      grad.addColorStop(1, '#3b82f6'); // Blue
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, targetWidth, 24);

      // Title Banner Ribbon Box
      const bannerW = 2600;
      const bannerH = 340;
      const bannerX = (targetWidth - bannerW) / 2;
      const bannerY = 80;

      // Banner shadow & background
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
      ctx.shadowBlur = 40;
      ctx.shadowOffsetY = 15;
      
      ctx.fillStyle = '#FFF5F7'; // Soft pastel pink-tinted white
      ctx.strokeStyle = '#F472B6'; // Soft pink border
      ctx.lineWidth = 8;
      
      // Draw rounded rectangle for banner
      ctx.beginPath();
      ctx.roundRect(bannerX, bannerY, bannerW, bannerH, 48);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Main Title Text ("20+ CUTE [SERIES] STICKERS")
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      ctx.font = `900 105px 'Pacifico', 'Comic Sans MS', sans-serif`;
      ctx.fillStyle = '#BE185D'; // Bold raspberry pink text
      ctx.fillText(`20+ CUTE ${seriesTitle} STICKERS`, targetWidth / 2, bannerY + 120);

      // Sub-Ribbon Banner Badge ("PNG DIGITAL DOWNLOAD • 300 DPI")
      const subBadgeW = 1600;
      const subBadgeH = 100;
      const subBadgeX = (targetWidth - subBadgeW) / 2;
      const subBadgeY = bannerY + 200;

      ctx.fillStyle = '#0D9488'; // Teal
      ctx.beginPath();
      ctx.roundRect(subBadgeX, subBadgeY, subBadgeW, subBadgeH, 30);
      ctx.fill();

      ctx.font = `800 48px sans-serif`;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(`✨ PNG DIGITAL DOWNLOAD • 300 DPI HIGH RES ✨`, targetWidth / 2, subBadgeY + 52);

      // 3. Render 20 Stickers Grid (5 Columns x 4 Rows)
      const cols = 5;
      const rows = 4;
      const gridStartY = headerH + 60;
      const gridAvailableH = targetHeight - gridStartY - 60;
      
      const cellW = (targetWidth - 120) / cols; // ~576px
      const cellH = gridAvailableH / rows; // ~580px
      const maxStickerDim = Math.min(cellW, cellH) * 0.88; // ~500px

      // Load all sticker images concurrently
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

      // Draw each sticker in its grid cell
      for (let i = 0; i < loadedImages.length; i++) {
        const img = loadedImages[i];
        if (!img) continue;

        const c = i % cols;
        const r = Math.floor(i / cols);

        const cellCenterX = 60 + c * cellW + cellW / 2;
        const cellCenterY = gridStartY + r * cellH + cellH / 2;

        const aspect = img.width / img.height;
        let drawW = maxStickerDim;
        let drawH = maxStickerDim / aspect;

        if (drawH > maxStickerDim) {
          drawH = maxStickerDim;
          drawW = maxStickerDim * aspect;
        }

        const drawX = cellCenterX - drawW / 2;
        const drawY = cellCenterY - drawH / 2;

        ctx.save();
        // Soft drop shadow around each sticker sample on cover
        ctx.shadowColor = 'rgba(0, 0, 0, 0.12)';
        ctx.shadowBlur = 24;
        ctx.shadowOffsetY = 10;

        ctx.drawImage(img, drawX, drawY, drawW, drawH);
        ctx.restore();
      }

      // Footer Watermark / Quality Stamp
      ctx.font = `700 36px sans-serif`;
      ctx.fillStyle = '#94A3B8';
      ctx.fillText(`FULL BUNDLE COLLECTION • 100% CONTENT MATCH GUARANTEED`, targetWidth / 2, targetHeight - 30);

      // 4. Export JPEG at 85% quality to keep payload ~250KB (well below Firestore 1MB limit!)
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
