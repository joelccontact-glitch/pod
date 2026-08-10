/**
 * Image Processor for POD (Print-on-Demand) High-Res Export & Background Removal
 * 1. BFS Outer Background Flood-Fill
 * 2. Micro-Island Enclosed Letter Hole Cleanup (clears white holes inside 'e', 'B', 'o', 'a', etc.)
 * 3. Anti-Aliased Edge Defringing (removes white halos around text strokes)
 */

export interface TransparentPNGOptions {
  targetWidth?: number; // default 4000px
  targetHeight?: number; // default 4000px
  tolerance?: number; // white threshold tolerance (e.g. 200-255)
}

export async function processTransparentPNG(
  imageUrl: string,
  options: TransparentPNGOptions = {}
): Promise<string> {
  const {
    targetWidth = 4000,
    targetHeight = 4000,
    tolerance = 200,
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

      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
      const data = imageData.data;
      const width = targetWidth;
      const height = targetHeight;
      const totalPixels = width * height;

      const visited = new Uint8Array(totalPixels);
      const queue = new Int32Array(totalPixels * 2);
      let head = 0;
      let tail = 0;

      const isWhite = (x: number, y: number) => {
        const idx = (y * width + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        return r >= tolerance && g >= tolerance && b >= tolerance;
      };

      // 1. Seed 4 outer border edges for BFS Flood Fill
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

      // BFS Flood Fill 4-directional for main background
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

      // 2. Micro-Island Cleanup for Enclosed Letter Holes (e.g. inside 'e', 'B', 'o', 'a')
      // Max hole size threshold: 0.3% of total image pixels
      const maxHoleArea = Math.round(totalPixels * 0.003);

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const startIdx = y * width + x;
          if (!visited[startIdx] && isWhite(x, y)) {
            // Found an unvisited white component; measure its pixel count
            let iHead = 0;
            let iTail = 0;
            const islandQueue = new Int32Array(totalPixels * 2);
            const islandPixels = new Int32Array(totalPixels);
            
            visited[startIdx] = 2; // Mark temporary
            islandQueue[iTail++] = x;
            islandQueue[iTail++] = y;
            islandPixels[0] = startIdx;
            let count = 1;

            while (iHead < iTail) {
              const ix = islandQueue[iHead++];
              const iy = islandQueue[iHead++];

              for (let d = 0; d < 4; d++) {
                const nx = ix + dx[d];
                const ny = iy + dy[d];

                if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                  const nidx = ny * width + nx;
                  if (!visited[nidx] && isWhite(nx, ny)) {
                    visited[nidx] = 2;
                    islandQueue[iTail++] = nx;
                    islandQueue[iTail++] = ny;
                    islandPixels[count++] = nidx;
                  }
                }
              }
            }

            // If component is small (letter hole), mark as background to clear it!
            if (count < maxHoleArea) {
              for (let k = 0; k < count; k++) {
                visited[islandPixels[k]] = 1; // Mark as background
              }
            }
          }
        }
      }

      // 3. Clear outer background + letter holes with anti-aliased defringing
      for (let i = 0; i < totalPixels; i++) {
        if (visited[i] === 1) {
          const pIdx = i * 4;
          const r = data[pIdx];
          const g = data[pIdx + 1];
          const b = data[pIdx + 2];
          const minVal = Math.min(r, g, b);

          if (minVal >= 245) {
            data[pIdx + 3] = 0; // 100% transparent for background and letter holes
          } else {
            // Defringe anti-aliased edges around text strokes
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


