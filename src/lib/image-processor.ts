/**
 * Image Processor for POD (Print-on-Demand) High-Res Export & Background Removal
 * Uses BFS Flood Fill from outer edges to preserve inner white artwork (bunny fur, flowers, text)
 */

export interface TransparentPNGOptions {
  targetWidth?: number; // default 4000px
  targetHeight?: number; // default 4000px
  tolerance?: number; // white threshold tolerance (e.g. 235-255)
}

export async function processTransparentPNG(
  imageUrl: string,
  options: TransparentPNGOptions = {}
): Promise<string> {
  const {
    targetWidth = 4000,
    targetHeight = 4000,
    tolerance = 235,
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
      const width = targetWidth;
      const height = targetHeight;

      const visited = new Uint8Array(width * height);
      const queue = new Int32Array(width * height * 2);
      let head = 0;
      let tail = 0;

      const isWhite = (x: number, y: number) => {
        const idx = (y * width + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        return r >= tolerance && g >= tolerance && b >= tolerance;
      };

      // Seed 4 outer border edges for BFS Flood Fill
      for (let x = 0; x < width; x++) {
        if (isWhite(x, 0)) {
          const idx = 0 * width + x;
          if (!visited[idx]) { visited[idx] = 1; queue[tail++] = x; queue[tail++] = 0; }
        }
        if (isWhite(x, height - 1)) {
          const idx = (height - 1) * width + x;
          if (!visited[idx]) { visited[idx] = 1; queue[tail++] = x; queue[tail++] = height - 1; }
        }
      }

      for (let y = 0; y < height; y++) {
        if (isWhite(0, y)) {
          const idx = y * width + 0;
          if (!visited[idx]) { visited[idx] = 1; queue[tail++] = 0; queue[tail++] = y; }
        }
        if (isWhite(width - 1, y)) {
          const idx = y * width + (width - 1);
          if (!visited[idx]) { visited[idx] = 1; queue[tail++] = width - 1; queue[tail++] = y; }
        }
      }

      // BFS Flood Fill 4-directional
      const dx = [1, -1, 0, 0];
      const dy = [0, 0, 1, -1];

      while (head < tail) {
        const cx = queue[head++];
        const cy = queue[head++];

        for (let i = 0; i < 4; i++) {
          const nx = cx + dx[i];
          const ny = cy + dy[i];

          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            const nidx = ny * width + nx;
            if (!visited[nidx] && isWhite(nx, ny)) {
              visited[nidx] = 1;
              queue[tail++] = nx;
              queue[tail++] = ny;
            }
          }
        }
      }

      // Clear ONLY visited outer background pixels (leave inner white artwork untouched)
      for (let i = 0; i < width * height; i++) {
        if (visited[i]) {
          const pIdx = i * 4;
          const r = data[pIdx];
          const g = data[pIdx + 1];
          const b = data[pIdx + 2];
          const minVal = Math.min(r, g, b);
          if (minVal >= 250) {
            data[pIdx + 3] = 0; // 100% transparent for outer white background
          } else {
            const alphaRatio = (255 - minVal) / (255 - tolerance);
            data[pIdx + 3] = Math.min(data[pIdx + 3], Math.floor(alphaRatio * 255));
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

