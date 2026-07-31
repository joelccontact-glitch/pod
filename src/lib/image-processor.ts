/**
 * Image Processor for POD (Print-on-Demand) High-Res Export & Background Removal
 */

export interface TransparentPNGOptions {
  targetWidth?: number; // default 4000px
  targetHeight?: number; // default 4000px
  tolerance?: number; // white threshold tolerance (e.g. 238-255)
}

export async function processTransparentPNG(
  imageUrl: string,
  options: TransparentPNGOptions = {}
): Promise<string> {
  const {
    targetWidth = 4000,
    targetHeight = 4000,
    tolerance = 238,
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Draw high-resolution image centered
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      // Extract pixel data for background removal
      const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
      const data = imageData.data;

      // Scan RGBA pixels
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Check if pixel is close to solid white (#FFFFFF)
        if (r >= tolerance && g >= tolerance && b >= tolerance) {
          const minVal = Math.min(r, g, b);
          if (minVal >= 250) {
            data[i + 3] = 0; // Pure transparent
          } else {
            // Smooth alpha falloff for clean vector borders
            const alphaRatio = (255 - minVal) / (255 - tolerance);
            data[i + 3] = Math.min(data[i + 3], Math.floor(alphaRatio * 255));
          }
        }
      }

      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };

    img.onerror = (err) => {
      reject(err);
    };
  });
}
