/**
 * Image Processor for POD (Print-on-Demand) High-Res Export & Background Removal
 * Corner-Sampled Adaptive Background Removal Engine:
 * 1. Corner Background Color Sampling + Luminance/Neutral Shadow Keying
 * 2. BFS Outer Background Flood-Fill (clears outer clouds, shadows, and off-white halos)
 * 3. Enclosed Letter Hole Cleanup (clears white holes inside 'e', 'B', 'o', 'a')
 * 4. Anti-Aliased Edge Defringing
 */

export interface TransparentPNGOptions {
  targetWidth?: number; // default 4000px
  targetHeight?: number; // default 4000px
  tolerance?: number;
}

export async function processTransparentPNG(
  imageUrl: string,
  options: TransparentPNGOptions = {}
): Promise<string> {
  const {
    targetWidth = 4000,
    targetHeight = 4000,
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

      // Sample background color from 4 corners
      const samplePoints = [
        (0 * width + 0) * 4,
        (0 * width + (width - 1)) * 4,
        ((height - 1) * width + 0) * 4,
        ((height - 1) * width + (width - 1)) * 4,
      ];

      let bgR = 0, bgG = 0, bgB = 0;
      samplePoints.forEach(idx => {
        bgR += data[idx];
        bgG += data[idx + 1];
        bgB += data[idx + 2];
      });
      bgR = Math.round(bgR / 4);
      bgG = Math.round(bgG / 4);
      bgB = Math.round(bgB / 4);

      const visited = new Uint8Array(totalPixels);
      const queue = new Int32Array(totalPixels * 2);
      let head = 0;
      let tail = 0;

      const isBackgroundPixel = (x: number, y: number) => {
        const idx = (y * width + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];

        // 1. Color distance from sampled corner background
        const dr = Math.abs(r - bgR);
        const dg = Math.abs(g - bgG);
        const db = Math.abs(b - bgB);
        if (dr <= 28 && dg <= 28 && db <= 28) return true;

        // 2. Off-white / cream / light beige ground shadow under feet (high brightness & low saturation)
        if (r >= 195 && g >= 195 && b >= 185) {
          const maxC = Math.max(r, g, b);
          const minC = Math.min(r, g, b);
          if (maxC - minC <= 24) { // Low saturation off-white ground shadow
            return true;
          }
        }

        return false;
      };


      // 1. Seed 4 outer border edges for BFS Flood Fill
      for (let x = 0; x < width; x++) {
        if (isBackgroundPixel(x, 0)) {
          const idx = 0 * width + x;
          if (!visited[idx]) { visited[idx] = 1; queue[tail++] = x; queue[tail++] = 0; }
        }
        if (isBackgroundPixel(x, height - 1)) {
          const idx = (height - 1) * width + x;
          if (!visited[idx]) { visited[idx] = 1; queue[tail++] = x; queue[tail++] = height - 1; }
        }
      }

      for (let y = 0; y < height; y++) {
        if (isBackgroundPixel(0, y)) {
          const idx = y * width + 0;
          if (!visited[idx]) { visited[idx] = 1; queue[tail++] = 0; queue[tail++] = y; }
        }
        if (isBackgroundPixel(width - 1, y)) {
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
            if (!visited[nidx] && isBackgroundPixel(nx, ny)) {
              visited[nidx] = 1;
              queue[tail++] = nx;
              queue[tail++] = ny;
            }
          }
        }
      }

      // 2. Safe Micro-Island Cleanup for Tiny Enclosed Letter Holes ONLY (e.g. inside 'e', 'o', 'a', 'b')
      // Strictly tiny holes (< 150px on 4K) that are surrounded by dark text strokes
      const maxHoleArea = Math.min(250, Math.max(30, Math.round(totalPixels * 0.000015)));

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const startIdx = y * width + x;
          if (!visited[startIdx] && isBackgroundPixel(x, y)) {
            let iHead = 0;
            let iTail = 0;
            const islandQueue = new Int32Array(totalPixels * 2);
            const islandPixels = new Int32Array(totalPixels);

            visited[startIdx] = 2; // Mark temporary
            islandQueue[iTail++] = x;
            islandQueue[iTail++] = y;
            islandPixels[0] = startIdx;
            let count = 1;
            let darkStrokeBorderCount = 0;

            while (iHead < iTail) {
              const ix = islandQueue[iHead++];
              const iy = islandQueue[iHead++];

              for (let d = 0; d < 4; d++) {
                const nx = ix + dx[d];
                const ny = iy + dy[d];

                if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                  const nidx = ny * width + nx;
                  if (!visited[nidx]) {
                    if (isBackgroundPixel(nx, ny)) {
                      visited[nidx] = 2;
                      islandQueue[iTail++] = nx;
                      islandQueue[iTail++] = ny;
                      islandPixels[count++] = nidx;
                    } else {
                      // Check if neighbor is a dark text stroke pixel (r<120, g<120, b<120)
                      const pIdx = nidx * 4;
                      if (data[pIdx] < 140 && data[pIdx + 1] < 140 && data[pIdx + 2] < 140) {
                        darkStrokeBorderCount++;
                      }
                    }
                  }
                }
              }
            }

            // ONLY clear if island is tiny AND bounded by dark text strokes (not fur or body highlights!)
            if (count <= maxHoleArea && darkStrokeBorderCount > 4) {
              for (let k = 0; k < count; k++) {
                visited[islandPixels[k]] = 1;
              }
            }
          }
        }
      }

      // 3. Clear background & letter holes with smooth anti-aliased defringing
      for (let i = 0; i < totalPixels; i++) {
        if (visited[i] === 1) {
          const pIdx = i * 4;
          const r = data[pIdx];
          const g = data[pIdx + 1];
          const b = data[pIdx + 2];
          const minVal = Math.min(r, g, b);

          if (minVal >= 242) {
            data[pIdx + 3] = 0; // 100% transparent for background & letter holes
          } else if (minVal >= 215) {
            const alphaRatio = (255 - minVal) / 40;
            data[pIdx + 3] = Math.min(data[pIdx + 3], Math.floor((1 - alphaRatio) * 255));
          } else {
            data[pIdx + 3] = 0;
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



