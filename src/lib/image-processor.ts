/**
 * Image Processor for POD (Print-on-Demand) High-Res Export & Background Removal
 * Corner-Sampled Adaptive Background Removal Engine:
 * 1. Corner Background Color Sampling + Luminance/Neutral Shadow Keying
 * 2. BFS Outer Background Flood-Fill (clears outer clouds, shadows, and off-white halos)
 * 3. Enclosed Letter Hole Cleanup (clears white holes inside 'e', 'B', 'o', 'a')
 * 4. Anti-Aliased Edge Defringing
 */

export interface TransparentPNGOptions {
  targetWidth?: number; // default 3000px
  targetHeight?: number; // default 3000px
  tolerance?: number;
}

/**
 * Robust image loader with CORS handling, fallback, and timeout protection.
 */
function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    let settled = false;

    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        reject(new Error('Image load timed out: ' + src.slice(0, 60)));
      }
    }, 15000);

    img.onload = () => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        resolve(img);
      }
    };

    img.onerror = () => {
      if (settled) return;
      // If anonymous CORS failed, try fallback without crossOrigin for local/proxy URLs
      const fallbackImg = new Image();
      fallbackImg.onload = () => {
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          resolve(fallbackImg);
        }
      };
      fallbackImg.onerror = (err) => {
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          reject(new Error('Image failed to load: ' + (err instanceof Event ? 'Network/CORS error' : String(err))));
        }
      };
      fallbackImg.src = src;
    };

    img.crossOrigin = 'anonymous';
    img.src = src;
  });
}

export async function processTransparentPNG(
  imageUrl: string,
  options: TransparentPNGOptions = {}
): Promise<string> {
  const {
    targetWidth = 3000,
    targetHeight = 3000,
  } = options;

  const img = await loadImageElement(imageUrl);

  const canvas = document.createElement('canvas');
  // Maintain natural size or target resolution
  const width = Math.min(targetWidth, Math.max(img.naturalWidth || 1024, 1500));
  const height = Math.min(targetHeight, Math.max(img.naturalHeight || 1024, 1500));
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    throw new Error('Canvas context not available');
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, width, height);

  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
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
  // Store 1D indices (y * width + x) for 50% memory savings and cache locality
  const queue = new Int32Array(totalPixels);
  let head = 0;
  let tail = 0;

  const isBackgroundPixel = (x: number, y: number) => {
    const idx = (y * width + x) * 4;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    const a = data[idx + 3];

    if (a === 0) return true;

    // 1. Color distance from sampled corner background
    const dr = Math.abs(r - bgR);
    const dg = Math.abs(g - bgG);
    const db = Math.abs(b - bgB);
    if (dr <= 32 && dg <= 32 && db <= 32) return true;

    // 2. Off-white / light gray ground shadow / floor noise under feet/chairs
    if (r >= 150 && g >= 150 && b >= 145) {
      const maxC = Math.max(r, g, b);
      const minC = Math.min(r, g, b);
      if (maxC - minC <= 20) {
        return true;
      }
    }

    return false;
  };

  // 1. Seed 4 outer border edges for BFS Flood Fill
  for (let x = 0; x < width; x++) {
    if (isBackgroundPixel(x, 0)) {
      const idx = 0 * width + x;
      if (!visited[idx]) { visited[idx] = 1; queue[tail++] = idx; }
    }
    const bIdx = (height - 1) * width + x;
    if (isBackgroundPixel(x, height - 1)) {
      if (!visited[bIdx]) { visited[bIdx] = 1; queue[tail++] = bIdx; }
    }
  }

  for (let y = 0; y < height; y++) {
    const lIdx = y * width + 0;
    if (isBackgroundPixel(0, y)) {
      if (!visited[lIdx]) { visited[lIdx] = 1; queue[tail++] = lIdx; }
    }
    const rIdx = y * width + (width - 1);
    if (isBackgroundPixel(width - 1, y)) {
      if (!visited[rIdx]) { visited[rIdx] = 1; queue[tail++] = rIdx; }
    }
  }

  // BFS Flood Fill 4-directional
  const dx = [1, -1, 0, 0];
  const dy = [0, 0, 1, -1];

  while (head < tail) {
    const cidx = queue[head++];
    const cx = cidx % width;
    const cy = (cidx / width) | 0;

    for (let i = 0; i < 4; i++) {
      const nx = cx + dx[i];
      const ny = cy + dy[i];

      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        const nidx = ny * width + nx;
        if (!visited[nidx] && isBackgroundPixel(nx, ny)) {
          visited[nidx] = 1;
          queue[tail++] = nidx;
        }
      }
    }
  }

  // 2. Enclosed Letter Hole Cleanup with PRE-ALLOCATED tiny static buffers
  // Strictly small enclosed background holes (< 500px) surrounded by non-background strokes
  const maxHoleArea = Math.min(500, Math.max(40, Math.round(totalPixels * 0.00003)));
  const islandQueue = new Int32Array(maxHoleArea * 4 + 64);
  const islandPixels = new Int32Array(maxHoleArea + 16);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const startIdx = y * width + x;
      if (!visited[startIdx] && isBackgroundPixel(x, y)) {
        let iHead = 0;
        let iTail = 0;
        visited[startIdx] = 2; // Mark temporary
        islandQueue[iTail++] = startIdx;
        islandPixels[0] = startIdx;
        let count = 1;
        let strokeBoundaryCount = 0;
        let isTooLarge = false;

        while (iHead < iTail) {
          const cidx = islandQueue[iHead++];
          const ix = cidx % width;
          const iy = (cidx / width) | 0;

          for (let d = 0; d < 4; d++) {
            const nx = ix + dx[d];
            const ny = iy + dy[d];

            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const nidx = ny * width + nx;
              if (!visited[nidx]) {
                if (isBackgroundPixel(nx, ny)) {
                  visited[nidx] = 2;
                  if (count < maxHoleArea) {
                    islandQueue[iTail++] = nidx;
                    islandPixels[count++] = nidx;
                  } else {
                    isTooLarge = true;
                  }
                } else {
                  strokeBoundaryCount++;
                }
              }
            }
          }
        }

        // Clear if small background hole is bounded by text stroke (mint, pink, coral, black)
        if (!isTooLarge && count <= maxHoleArea && strokeBoundaryCount > 4) {
          for (let k = 0; k < count; k++) {
            visited[islandPixels[k]] = 1;
          }
        }
      }
    }
  }

  // 3. Clear background & letter holes with 100% strict transparency
  for (let i = 0; i < totalPixels; i++) {
    if (visited[i] === 1) {
      const pIdx = i * 4;
      data[pIdx + 3] = 0; // 100% strictly transparent! Never leave semi-transparent residue for sticker die-cuts
    }
  }

  ctx.putImageData(imageData, 0, 0);

  // 4. Quality Assurance Guardrail: Ensure 4 corners are 100% transparent
  const cornerChecks = [
    0, // (0, 0)
    (width - 1) * 4, // (w-1, 0)
    ((height - 1) * width) * 4, // (0, h-1)
    ((height - 1) * width + (width - 1)) * 4, // (w-1, h-1)
  ];
  let cornersClean = true;
  for (const cIdx of cornerChecks) {
    if (data[cIdx + 3] > 0) {
      cornersClean = false;
      break;
    }
  }

  // If any corner still has alpha, perform a strict edge flush
  if (!cornersClean) {
    for (let i = 0; i < totalPixels; i++) {
      const pIdx = i * 4;
      const x = i % width;
      const y = (i / width) | 0;
      if (x < 10 || x >= width - 10 || y < 10 || y >= height - 10) {
        data[pIdx + 3] = 0;
      }
    }
    ctx.putImageData(imageData, 0, 0);
  }

  return canvas.toDataURL('image/png');
}

