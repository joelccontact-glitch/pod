'use client';
import { useState, useEffect, useRef } from 'react';
import { useSession, signOut } from "next-auth/react";
import { MOCKUP_TEMPLATES } from '@/lib/mockups';
import { processTransparentPNG } from '@/lib/image-processor';
import { getActiveUpcomingSeasons, SEASONAL_HOLIDAYS, ActiveSeasonInfo } from '@/lib/seasonal-trends';
import { PYGMY_PUMPKIN_SERIES, TERRARIUM_SERIES, StickerPreset } from '@/lib/sticker-prompts';
import JSZip from 'jszip';

export default function Home() {
  const { data: session } = useSession();
  const [designs, setDesigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Sticker & Digital PNG Pack States
  const [isStickerMode, setIsStickerMode] = useState(false);
  const [selectedStickerSeriesTab, setSelectedStickerSeriesTab] = useState<'terrarium' | 'pumpkin'>('terrarium');
  const [selectedStickerPresetId, setSelectedStickerPresetId] = useState<string>('terrarium-jar-base');
  const [isExportingBundle, setIsExportingBundle] = useState(false);
  
  const [selectedDesign, setSelectedDesign] = useState<any>(null);
  const [previewDesign, setPreviewDesign] = useState<any>(null);
  const [feedback, setFeedback] = useState('');
  const [modifying, setModifying] = useState(false);
  
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [uploadImageBase64, setUploadImageBase64] = useState('');
  const [uploadPrompt, setUploadPrompt] = useState('');
  const [isGeneratingFromImage, setIsGeneratingFromImage] = useState(false);
  const [uploadPreviewDesign, setUploadPreviewDesign] = useState<any>(null);
  const [selectedAnimal, setSelectedAnimal] = useState('hamster');

  const [styles, setStyles] = useState<any[]>([]);
  const [selectedStyleId, setSelectedStyleId] = useState<string>('');
  
  const [isStyleModalOpen, setIsStyleModalOpen] = useState(false);
  const [styleImageBase64, setStyleImageBase64] = useState('');
  const [styleName, setStyleName] = useState('');
  const [isCreatingStyle, setIsCreatingStyle] = useState(false);
  const [isGeneratingTrend, setIsGeneratingTrend] = useState(false);
  const [globalCatchphrase, setGlobalCatchphrase] = useState('');
  const [autoGeneratePhrase, setAutoGeneratePhrase] = useState(true);

  const [isManageStylesModalOpen, setIsManageStylesModalOpen] = useState(false);
  const [editingStyleId, setEditingStyleId] = useState<string | null>(null);
  const [editingStyleName, setEditingStyleName] = useState('');
  const [enlargedStyleImage, setEnlargedStyleImage] = useState<string | null>(null);

  const [isAutoAgentModalOpen, setIsAutoAgentModalOpen] = useState(false);
  const [autoAgentAnimal, setAutoAgentAnimal] = useState('random');
  const [autoAgentGarmentColor, setAutoAgentGarmentColor] = useState('random');
  const [autoAgentSeason, setAutoAgentSeason] = useState('auto');
  const [activeSeasonsList, setActiveSeasonsList] = useState<ActiveSeasonInfo[]>([]);

  const [activeTab, setActiveTab] = useState<'info' | 'mockup' | 'edit'>('info');
  const [selectedMockupId, setSelectedMockupId] = useState(MOCKUP_TEMPLATES[0].id);
  const [mockupScale, setMockupScale] = useState(1.0);
  const [isProcessingPNG, setIsProcessingPNG] = useState(false);
  const [mockupOffsetX, setMockupOffsetX] = useState(0);
  const [mockupOffsetY, setMockupOffsetY] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const loadedMockupImgRef = useRef<{ id: string; img: HTMLImageElement } | null>(null);
  const loadedDesignImgRef = useRef<{ url: string; img: HTMLImageElement | HTMLCanvasElement } | null>(null);
  const drawSequenceRef = useRef<number>(0);

  const editCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(20);
  const [isSavingManual, setIsSavingManual] = useState(false);
  const [originalEditImage, setOriginalEditImage] = useState<string | null>(null);
  
  type TextElement = {
    id: string;
    text: string;
    x: number;
    y: number;
    font: string;
    size: number;
    color: string;
  };
  const [editMode, setEditMode] = useState<'eraser' | 'text'>('eraser');
  const [textElements, setTextElements] = useState<TextElement[]>([]);
  const [activeTextId, setActiveTextId] = useState<string | null>(null);
  const [isDraggingText, setIsDraggingText] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [canvasDisplayScale, setCanvasDisplayScale] = useState(1);
  const [history, setHistory] = useState<string[]>([]);
  const [cursorPos, setCursorPos] = useState({ x: -1000, y: -1000 });
  const [isHoveringCanvas, setIsHoveringCanvas] = useState(false);

  const getStyleDisplayName = (design: any) => {
    if (!design) return '기본 수채화/벡터 일러스트';
    if (design.style_name) return design.style_name;
    const textToScan = `${design.prompt || ''} ${design.topic || ''} ${design.title || ''}`.toLowerCase();
    if (textToScan.includes('cottagecore')) return '코티지코어 감성 (Cottagecore)';
    if (textToScan.includes('pixel') || textToScan.includes('y2k')) return 'Y2K 레트로 픽셀 (Y2K Pixel Art)';
    if (textToScan.includes('minimalist') || textToScan.includes('line art')) return '미니멀 라인아트 (Minimal Line Art)';
    if (textToScan.includes('watercolor')) return '포근한 수채화 (Cozy Watercolor)';
    if (textToScan.includes('vintage') || textToScan.includes('retro')) return '빈티지 레트로 (Vintage Retro)';
    if (textToScan.includes('chibi') || textToScan.includes('kawaii')) return '카와이 치비 (Kawaii Chibi)';
    return '귀여운 수채화/벡터 일러스트';
  };

  useEffect(() => {
    const updateScale = () => {
      if (editCanvasRef.current && editCanvasRef.current.width > 0) {
        const rect = editCanvasRef.current.getBoundingClientRect();
        setCanvasDisplayScale(rect.width / editCanvasRef.current.width);
      }
    };
    window.addEventListener('resize', updateScale);
    const timeoutId = setTimeout(updateScale, 100);
    return () => {
      window.removeEventListener('resize', updateScale);
      clearTimeout(timeoutId);
    };
  }, [activeTab, selectedDesign, originalEditImage]);

  useEffect(() => {
    fetchDesigns(page);
    fetchStyles();
    setActiveSeasonsList(getActiveUpcomingSeasons());
  }, [page]);

  useEffect(() => {
    if (activeTab === 'mockup' && selectedDesign) {
      drawMockup();
    }
  }, [activeTab, selectedMockupId, mockupScale, mockupOffsetX, mockupOffsetY, previewDesign, selectedDesign]);

  // Reset all modals and page state to initial home screen on header logo / upload image home click
  useEffect(() => {
    const handleGoHome = () => {
      setSelectedDesign(null);
      setPreviewDesign(null);
      setIsImageModalOpen(false);
      setUploadImageBase64('');
      setUploadPrompt('');
      setUploadPreviewDesign(null);
      setIsStyleModalOpen(false);
      setIsManageStylesModalOpen(false);
      setIsAutoAgentModalOpen(false);
      setSelectedStyleId('');
      setPage(1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('go-home-reset', handleGoHome);
    return () => {
      window.removeEventListener('go-home-reset', handleGoHome);
    };
  }, []);

  // Reset scale and offsets when mockup changes
  useEffect(() => {
    setMockupScale(1.0);
    setMockupOffsetX(0);
    setMockupOffsetY(0);
  }, [selectedMockupId]);


  // Reset text elements when a different design is opened
  useEffect(() => {
    setTextElements([]);
  }, [selectedDesign?.id]);

  const createTransparentDesignCanvas = (img: HTMLImageElement): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    const width = img.naturalWidth || img.width || 800;
    const height = img.naturalHeight || img.height || 800;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

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
    const queue = new Int32Array(totalPixels * 2);
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
      // (High brightness & low saturation neutral gray ground shadow)
      if (r >= 150 && g >= 150 && b >= 145) {
        const maxC = Math.max(r, g, b);
        const minC = Math.min(r, g, b);
        if (maxC - minC <= 20) { // Low saturation neutral ground shadow
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

    // 2. Enclosed Letter Hole Cleanup for ALL text stroke colors (mint, pink, coral, black, etc.)
    // Strictly small enclosed background holes (< 400px on 4K) surrounded by non-background strokes
    const maxHoleArea = Math.min(500, Math.max(40, Math.round(totalPixels * 0.00003)));

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
          let strokeBoundaryCount = 0;

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
                    // Neighbor is a non-background stroke pixel (mint green, pink, black, coral, etc.)
                    strokeBoundaryCount++;
                  }
                }
              }
            }
          }

          // Clear if small background hole is bounded by text stroke (mint, pink, coral, black)
          if (count <= maxHoleArea && strokeBoundaryCount > 4) {
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
    return canvas;
  };




  const getTrimmedDesignBounds = (canvas: HTMLCanvasElement | HTMLImageElement) => {
    let w = canvas.width;
    let h = canvas.height;
    let ctx: CanvasRenderingContext2D | null = null;

    if (canvas instanceof HTMLCanvasElement) {
      ctx = canvas.getContext('2d');
    } else {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = w;
      tempCanvas.height = h;
      ctx = tempCanvas.getContext('2d');
      if (ctx) ctx.drawImage(canvas, 0, 0);
    }

    if (!ctx || w === 0 || h === 0) {
      return { x: 0, y: 0, width: w, height: h };
    }

    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;

    let minX = w, minY = h, maxX = 0, maxY = 0;
    let hasPixel = false;

    // Scan with alpha > 40 threshold to ignore noise
    for (let y = 0; y < h; y += 2) {
      for (let x = 0; x < w; x += 2) {
        const alpha = data[(y * w + x) * 4 + 3];
        if (alpha > 40) {
          hasPixel = true;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    if (!hasPixel || minX >= maxX || minY >= maxY) {
      return { x: 0, y: 0, width: w, height: h };
    }

    const padX = Math.round(w * 0.005);
    const padY = Math.round(h * 0.005);

    const safeMinX = Math.max(0, minX - padX);
    const safeMinY = Math.max(0, minY - padY);
    const safeMaxX = Math.min(w - 1, maxX + padX);
    const safeMaxY = Math.min(h - 1, maxY + padY);

    return {
      x: safeMinX,
      y: safeMinY,
      width: Math.max(10, safeMaxX - safeMinX + 1),
      height: Math.max(10, safeMaxY - safeMinY + 1)
    };
  };


  const drawMockup = () => {
    if (activeTab !== 'mockup') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const template = MOCKUP_TEMPLATES.find(m => m.id === selectedMockupId);
    if (!template) return;

    const designUrl = previewDesign ? previewDesign.image_url : selectedDesign?.image_url;
    if (!designUrl) return;

    const currentDrawSeq = ++drawSequenceRef.current;

    const render = (mockupImg: HTMLImageElement, designImg: HTMLImageElement | HTMLCanvasElement) => {
      const targetW = mockupImg.width || 800;
      const targetH = mockupImg.height || 800;
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }

      ctx.globalCompositeOperation = 'source-over';
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(mockupImg, 0, 0, canvas.width, canvas.height);

      ctx.globalCompositeOperation = template.overlay.blendMode as GlobalCompositeOperation;
      
      const bounds = getTrimmedDesignBounds(designImg);
      const aspect = bounds.width / bounds.height;

      const baseBoxW = template.overlay.width * mockupScale;
      const baseBoxH = template.overlay.height * mockupScale;

      let drawW = baseBoxW;
      let drawH = baseBoxW / aspect;

      if (drawH > baseBoxH) {
        drawH = baseBoxH;
        drawW = baseBoxH * aspect;
      }

      const chestCenterX = template.overlay.x + template.overlay.width / 2;
      const chestCenterY = template.overlay.y + template.overlay.height / 2;

      const finalX = chestCenterX - drawW / 2 + mockupOffsetX;
      const finalY = chestCenterY - drawH / 2 + mockupOffsetY;

      ctx.drawImage(
        designImg,
        bounds.x, bounds.y, bounds.width, bounds.height,
        finalX, finalY, drawW, drawH
      );
      ctx.globalCompositeOperation = 'source-over';
    };

    const isMockupCached = loadedMockupImgRef.current?.id === selectedMockupId;
    const isDesignCached = loadedDesignImgRef.current?.url === designUrl;

    if (isMockupCached && isDesignCached) {
      render(loadedMockupImgRef.current!.img, loadedDesignImgRef.current!.img);
      return;
    }

    let loadedMockup: HTMLImageElement | null = isMockupCached ? loadedMockupImgRef.current!.img : null;
    let loadedDesign: HTMLImageElement | HTMLCanvasElement | null = isDesignCached ? loadedDesignImgRef.current!.img : null;

    const checkAndRender = () => {
      if (currentDrawSeq !== drawSequenceRef.current) return;
      if (loadedMockup && loadedDesign) {
        render(loadedMockup, loadedDesign);
      }
    };

    if (!loadedMockup) {
      const mImg = new Image();
      mImg.crossOrigin = 'anonymous';
      mImg.src = template.imageUrl;
      mImg.onload = () => {
        loadedMockupImgRef.current = { id: selectedMockupId, img: mImg };
        loadedMockup = mImg;
        checkAndRender();
      };
    }

    if (!loadedDesign) {
      const dImg = new Image();
      dImg.crossOrigin = 'anonymous';
      dImg.src = designUrl;
      dImg.onload = () => {
        const transparentCanvas = createTransparentDesignCanvas(dImg);
        loadedDesignImgRef.current = { url: designUrl, img: transparentCanvas };
        loadedDesign = transparentCanvas;
        checkAndRender();
      };
    }
  };

  const downloadMockup = () => {
    const template = MOCKUP_TEMPLATES.find(t => t.id === selectedMockupId);
    const designUrl = previewDesign ? previewDesign.image_url : selectedDesign?.image_url;
    if (!template || !designUrl) return;

    const targetDimension = 2500; // Etsy High-Res 2500px square
    const mockupImg = new Image();
    mockupImg.crossOrigin = 'anonymous';
    mockupImg.src = template.imageUrl;

    mockupImg.onload = () => {
      const origW = mockupImg.width || 800;
      const origH = mockupImg.height || 800;
      const scaleFactor = targetDimension / Math.max(origW, origH);

      const offCanvas = document.createElement('canvas');
      offCanvas.width = Math.round(origW * scaleFactor);
      offCanvas.height = Math.round(origH * scaleFactor);
      const offCtx = offCanvas.getContext('2d');
      if (!offCtx) return;

      offCtx.imageSmoothingEnabled = true;
      offCtx.imageSmoothingQuality = 'high';

      offCtx.globalCompositeOperation = 'source-over';
      offCtx.drawImage(mockupImg, 0, 0, offCanvas.width, offCanvas.height);

      const designImg = new Image();
      designImg.crossOrigin = 'anonymous';
      designImg.src = designUrl;

      designImg.onload = () => {
        const transparentDesignCanvas = createTransparentDesignCanvas(designImg);
        offCtx.globalCompositeOperation = template.overlay.blendMode as GlobalCompositeOperation;

        const bounds = getTrimmedDesignBounds(transparentDesignCanvas);
        const aspect = bounds.width / bounds.height;

        const baseBoxW = template.overlay.width * mockupScale * scaleFactor;
        const baseBoxH = template.overlay.height * mockupScale * scaleFactor;

        let drawW = baseBoxW;
        let drawH = baseBoxW / aspect;

        if (drawH > baseBoxH) {
          drawH = baseBoxH;
          drawW = baseBoxH * aspect;
        }

        const chestCenterX = (template.overlay.x + template.overlay.width / 2) * scaleFactor;
        const chestCenterY = (template.overlay.y + template.overlay.height / 2) * scaleFactor;

        const finalX = chestCenterX - drawW / 2 + (mockupOffsetX * scaleFactor);
        const finalY = chestCenterY - drawH / 2 + (mockupOffsetY * scaleFactor);

        offCtx.drawImage(
          transparentDesignCanvas,
          bounds.x, bounds.y, bounds.width, bounds.height,
          finalX, finalY, drawW, drawH
        );
        offCtx.globalCompositeOperation = 'source-over';

        const url = offCanvas.toDataURL('image/jpeg', 0.95);
        const a = document.createElement('a');
        a.href = url;
        a.download = `etsy_mockup_2.5K_${Date.now()}.jpg`;
        a.click();
      };
    };
  };


  const downloadPODPrintPNG = async () => {
    const designUrl = previewDesign ? previewDesign.image_url : selectedDesign?.image_url;
    if (!designUrl) return;

    try {
      setIsProcessingPNG(true);
      const transparentDataUrl = await processTransparentPNG(designUrl, {
        targetWidth: 4000,
        targetHeight: 4000,
        tolerance: 238
      });

      const a = document.createElement('a');
      a.href = transparentDataUrl;
      a.download = `pod_print_4K_300dpi_${Date.now()}.png`;
      a.click();
    } catch (err) {
      console.error('PNG processing failed', err);
      alert('PNG 생성 중 오류가 발생했습니다.');
    } finally {
      setIsProcessingPNG(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'edit' && selectedDesign) {
      initEditCanvas();
    }
  }, [activeTab, selectedDesign]);

  const initEditCanvas = () => {
    const canvas = editCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = selectedDesign.image_url;
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      setOriginalEditImage(canvas.toDataURL('image/png'));
      setHistory([]);
    };
  };

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    let clientX, clientY;
    
    if ('touches' in e) {
      clientX = (e as TouchEvent | React.TouchEvent).touches[0].clientX;
      clientY = (e as TouchEvent | React.TouchEvent).touches[0].clientY;
    } else {
      clientX = (e as MouseEvent | React.MouseEvent).clientX;
      clientY = (e as MouseEvent | React.MouseEvent).clientY;
    }
    
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (editMode !== 'eraser') return;
    const canvas = editCanvasRef.current;
    if (canvas) {
      setHistory(prev => [...prev, canvas.toDataURL('image/png')]);
    }
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    if (editMode !== 'eraser') return;
    setIsDrawing(false);
    const canvas = editCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.beginPath();
        ctx.globalCompositeOperation = 'source-over';
      }
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || editMode !== 'eraser') return;
    const canvas = editCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e, canvas);
    
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.globalCompositeOperation = 'destination-out';
    ctx.strokeStyle = 'rgba(0,0,0,1)';
    
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const resetEditCanvas = () => {
    const canvas = editCanvasRef.current;
    if (!canvas || !originalEditImage) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const img = new Image();
    img.src = originalEditImage;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    setTextElements([]);
    setHistory([]);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const canvas = editCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const previousState = history[history.length - 1];
    setHistory(prev => prev.slice(0, -1));
    
    const img = new Image();
    img.src = previousState;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
  };

  const getFinalCanvasDataUrl = () => {
    const canvas = editCanvasRef.current;
    if (!canvas) return null;
    
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const ctx = tempCanvas.getContext('2d');
    if (!ctx) return null;
    
    ctx.drawImage(canvas, 0, 0);
    
    textElements.forEach(t => {
      ctx.font = `${t.size}px '${t.font}'`;
      ctx.fillStyle = t.color;
      ctx.textBaseline = 'top';
      ctx.fillText(t.text, t.x, t.y);
    });
    
    return tempCanvas.toDataURL('image/jpeg', 0.95);
  };

  const saveManualEdit = async () => {
    const dataUrl = getFinalCanvasDataUrl();
    if (!dataUrl || !selectedDesign) return;
    
    setIsSavingManual(true);
    try {
      const res = await fetch('/api/designs/save-manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalId: selectedDesign.id,
          imageBase64: dataUrl,
          topic: selectedDesign.topic,
          originalPrompt: selectedDesign.prompt,
          tags: selectedDesign.tags
        })
      });
      const data = await res.json();
      if (data.success) {
        alert('성공적으로 저장되었습니다!');
        fetchDesigns(1);
      } else {
        alert('저장에 실패했습니다.');
      }
    } catch (e) {
      console.error(e);
      alert('오류가 발생했습니다.');
    }
    setIsSavingManual(false);
  };

  const downloadEditCanvas = () => {
    const url = getFinalCanvasDataUrl();
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = `edited_${Date.now()}.jpg`;
    a.click();
  };

  const handleAddText = () => {
    setTextElements([...textElements, {
      id: Date.now().toString(),
      text: 'Hello',
      x: 50,
      y: 50,
      font: 'Pacifico',
      size: 40,
      color: '#333333'
    }]);
    setEditMode('text');
  };

  const updateTextElement = (id: string, updates: Partial<TextElement>) => {
    setTextElements(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const handleTextMouseDown = (e: React.MouseEvent | React.TouchEvent, id: string) => {
    if (editMode !== 'text') return;
    e.stopPropagation();
    setActiveTextId(id);
    setIsDraggingText(true);
    
    const canvas = editCanvasRef.current;
    if (!canvas) return;
    const { x, y } = getCoordinates(e, canvas);
    const textEl = textElements.find(t => t.id === id);
    if (textEl) {
      setDragOffset({ x: x - textEl.x, y: y - textEl.y });
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (editMode === 'eraser') {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
      setCursorPos({ x: clientX - rect.left, y: clientY - rect.top });
      
      if (isDrawing) {
        draw(e);
      }
    }
  };

  const handleCanvasMouseLeave = () => {
    setIsHoveringCanvas(false);
    handleCanvasMouseUp();
  };

  const handleCanvasMouseUp = () => {
    if (editMode === 'eraser') {
      stopDrawing();
    }
  };

  useEffect(() => {
    if (editMode === 'text' && isDraggingText && activeTextId) {
      const handleGlobalMouseMove = (e: MouseEvent | TouchEvent) => {
        const canvas = editCanvasRef.current;
        if (!canvas) return;
        const { x, y } = getCoordinates(e, canvas);
        updateTextElement(activeTextId, { x: x - dragOffset.x, y: y - dragOffset.y });
      };
      
      const handleGlobalMouseUp = () => {
        setIsDraggingText(false);
      };
      
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
      window.addEventListener('touchmove', handleGlobalMouseMove, { passive: false });
      window.addEventListener('touchend', handleGlobalMouseUp);

      return () => {
        window.removeEventListener('mousemove', handleGlobalMouseMove);
        window.removeEventListener('mouseup', handleGlobalMouseUp);
        window.removeEventListener('touchmove', handleGlobalMouseMove);
        window.removeEventListener('touchend', handleGlobalMouseUp);
      };
    }
  }, [editMode, isDraggingText, activeTextId, dragOffset]);

  const fetchStyles = async () => {
    try {
      const res = await fetch('/api/styles/list');
      const data = await res.json();
      if (data.success) {
        setStyles(data.data);
      }
    } catch (error) {
      console.error('Error fetching styles:', error);
    }
  };

  const handleUpdateStyle = async (id: string) => {
    if (!editingStyleName.trim()) return;
    try {
      const res = await fetch('/api/styles/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name: editingStyleName })
      });
      if (res.ok) {
        setStyles(styles.map(s => s.id === id ? { ...s, name: editingStyleName } : s));
        setEditingStyleId(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleLikeDesign = async (id: string, is_liked: boolean) => {
    try {
      const res = await fetch('/api/designs/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_liked })
      });
      if (res.ok) {
        setDesigns(designs.map(d => d.id === id ? { ...d, is_liked } : d));
        if (selectedDesign?.id === id) {
          setSelectedDesign({ ...selectedDesign, is_liked });
        }
      } else {
        const data = await res.json();
        alert('좋아요 설정 실패: ' + data.error);
      }
    } catch (e) {
      console.error('Like toggle failed', e);
      alert('오류가 발생했습니다.');
    }
  };

  const handleDeleteStyle = async (id: string) => {
    if (!confirm('정말 이 화풍을 삭제하시겠습니까?')) return;
    try {
      const res = await fetch('/api/styles/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        setStyles(styles.filter(s => s.id !== id));
        if (selectedStyleId === id) setSelectedStyleId('');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleExportZIPBundle = async () => {
    if (!designs || designs.length === 0) {
      alert('다운로드할 디자인이 없습니다. 먼저 디자인을 생성해 주세요.');
      return;
    }
    try {
      setIsExportingBundle(true);
      const zip = new JSZip();
      const folder = zip.folder('Pygmy_Pumpkin_Friends_Sticker_PNG_Bundle');

      for (let i = 0; i < designs.length; i++) {
        const d = designs[i];
        const rawUrl = d.transparent_png_url || (d.id ? `/api/designs/image?id=${d.id}` : d.image_url || d.url);
        if (!rawUrl) continue;

        try {
          // Process 300DPI transparent PNG cutout
          const transparentDataUrl = await processTransparentPNG(rawUrl, {
            targetWidth: 3000,
            targetHeight: 3000,
          });

          // Convert Data URL to binary ArrayBuffer for JSZip
          const base64Data = transparentDataUrl.split(',')[1];
          const binaryString = atob(base64Data);
          const len = binaryString.length;
          const bytes = new Uint8Array(len);
          for (let b = 0; b < len; b++) {
            bytes[b] = binaryString.charCodeAt(b);
          }

          const animalName = (d.title || d.prompt || `sticker_${i + 1}`)
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '_')
            .slice(0, 30);

          const fileName = `${String(i + 1).padStart(2, '0')}_${animalName}_300dpi.png`;
          folder?.file(fileName, bytes.buffer);
        } catch (err) {
          console.error(`Error processing image index ${i} for ZIP:`, err);
        }
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = window.URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Pygmy_Pumpkin_Friends_Sticker_PNG_Bundle_${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message || 'ZIP 번들 파일 생성 중 오류가 발생했습니다.');
    } finally {
      setIsExportingBundle(false);
    }
  };

  const fetchDesigns = async (currentPage: number = 1, showSpinner: boolean = true) => {
    if (showSpinner) setLoadingInitial(true);
    try {
      const res = await fetch(`/api/designs?page=${currentPage}&limit=12`);
      const data = await res.json();
      if (data.success) {
        setDesigns(data.data);
        const newTotalPages = data.totalPages || 1;
        setTotalPages(newTotalPages);
        setTotalCount(data.total || 0);

        if (currentPage > newTotalPages && newTotalPages > 0) {
          setPage(newTotalPages);
        }
      }
    } catch (e) {
      console.error('Failed to fetch designs', e);
    }
    if (showSpinner) setLoadingInitial(false);
  };

  const runAgent = async () => {
    setLoading(true);
    setIsAutoAgentModalOpen(false);
    try {
      let url = selectedStyleId ? `/api/run-agent?styleId=${selectedStyleId}` : '/api/run-agent';
      if (autoAgentAnimal && autoAgentAnimal !== 'random') {
        url += (url.includes('?') ? '&' : '?') + `animal=${encodeURIComponent(autoAgentAnimal)}`;
      }
      if (autoAgentGarmentColor && autoAgentGarmentColor !== 'random') {
        url += (url.includes('?') ? '&' : '?') + `garmentColor=${encodeURIComponent(autoAgentGarmentColor)}`;
      }
      if (autoAgentSeason && autoAgentSeason !== 'auto') {
        url += (url.includes('?') ? '&' : '?') + `season=${encodeURIComponent(autoAgentSeason)}`;
      }
      if (autoGeneratePhrase) {
        url += (url.includes('?') ? '&' : '?') + `autoPhrase=true`;
      } else if (globalCatchphrase.trim()) {
        url += (url.includes('?') ? '&' : '?') + `catchphrase=${encodeURIComponent(globalCatchphrase.trim())}`;
      }
      const res = await fetch(url, {
        headers: {
          'Authorization': 'Bearer ' + (process.env.NEXT_PUBLIC_CRON_SECRET || 'demo-secret')
        }
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert('생성 실패: ' + (data.error || '알 수 없는 오류'));
      } else if (data.data?.recommended_mockup) {
        setSelectedMockupId(data.data.recommended_mockup);
      }
      await fetchDesigns(1);
      setPage(1);
    } catch (e: any) {
      console.error('Agent run failed', e);
      alert('네트워크 오류가 발생했습니다.');
    }
    setLoading(false);
  };

  const handlePaste = (e: any) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        const reader = new FileReader();
        reader.onload = (event) => setUploadImageBase64(event.target?.result as string);
        reader.readAsDataURL(file);
        break;
      }
    }
  };

  const handleFileChange = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => setUploadImageBase64(event.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleStylePaste = (e: any) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        const reader = new FileReader();
        reader.onload = (event) => setStyleImageBase64(event.target?.result as string);
        reader.readAsDataURL(file);
        break;
      }
    }
  };

  const handleStyleFileChange = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => setStyleImageBase64(event.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleCreateStyle = async () => {
    if (!styleImageBase64 || !styleName.trim()) return;
    setIsCreatingStyle(true);
    try {
      const res = await fetch('/api/styles/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: styleImageBase64, styleName })
      });
      const data = await res.json();
      if (data.success) {
        setIsStyleModalOpen(false);
        setStyleImageBase64('');
        setStyleName('');
        await fetchStyles();
        setSelectedStyleId(data.data.id);
      } else {
        alert('스타일 생성 실패: ' + data.error);
      }
    } catch (e) {
      console.error(e);
      alert('오류가 발생했습니다.');
    }
    setIsCreatingStyle(false);
  };

  const handleTogglePriority = async (id: string, is_priority: boolean) => {
    try {
      const res = await fetch('/api/styles/priority', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_priority })
      });
      if (res.ok) {
        await fetchStyles(); // Refresh to show new priorities
      } else {
        const data = await res.json();
        alert('우선순위 설정 실패: ' + data.error);
      }
    } catch (e) {
      console.error('Priority toggle failed', e);
      alert('오류가 발생했습니다.');
    }
  };

  const handleManualTrendSearch = async () => {
    setIsGeneratingTrend(true);
    try {
      const res = await fetch('/api/run-agent/styles');
      const data = await res.json();
      if (data.success) {
        alert('✨ 트렌드 화풍 등록 성공: ' + data.data.name);
        await fetchStyles(); // Update dropdown
        setSelectedStyleId(data.data.id);
      } else {
        alert('트렌드 검색 실패: ' + data.error);
      }
    } catch (e) {
      console.error('Trend search failed', e);
      alert('오류가 발생했습니다.');
    }
    setIsGeneratingTrend(false);
  };

  const handleGenerateFromImage = async () => {
    if (!uploadPrompt.trim()) return;
    setIsGeneratingFromImage(true);
    try {
      const isTemplatePrompt = uploadPrompt.toLowerCase().includes('die-cut sticker');
      const finalPrompt = (selectedAnimal && !isTemplatePrompt) ? `${selectedAnimal} subject, ${uploadPrompt}` : uploadPrompt;
      const res = await fetch('/api/designs/from-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          imageBase64: uploadImageBase64, 
          prompt: finalPrompt, 
          isPreview: true, 
          styleId: selectedStyleId, 
          catchphrase: autoGeneratePhrase ? '' : globalCatchphrase.trim(),
          autoPhrase: autoGeneratePhrase
        })
      });
      const data = await res.json();
      if (data.success) {
        setUploadPreviewDesign(data.data);
      } else {
        alert('생성 실패: ' + data.error);
      }
    } catch (e) {
      console.error(e);
      alert('오류가 발생했습니다.');
    }
    setIsGeneratingFromImage(false);
  };

  const handleConfirmUpload = async () => {
    if (!uploadPreviewDesign) return;
    setIsGeneratingFromImage(true);
    try {
      const res = await fetch('/api/designs/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: uploadPreviewDesign.id,
          designData: uploadPreviewDesign
        })
      });
      const data = await res.json();
      if (data.success) {
        setIsImageModalOpen(false);
        setUploadImageBase64('');
        setUploadPrompt('');
        setUploadPreviewDesign(null);
        await fetchDesigns(1);
        setPage(1);
      } else {
        alert('저장 실패: ' + data.error);
      }
    } catch (e) {
      console.error(e);
      alert('오류가 발생했습니다.');
    }
    setIsGeneratingFromImage(false);
  };

  const handleCancelUpload = () => {
    setUploadPreviewDesign(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      const res = await fetch('/api/designs/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.success) {
        setDesigns(prev => prev.filter(d => d.id !== id));
        setTotalCount(prev => Math.max(0, prev - 1));
        if (selectedDesign?.id === id) setSelectedDesign(null);
        await fetchDesigns(page, false);
      } else {
        alert(data.error || '삭제하지 못했습니다.');
      }
    } catch (e) {
      console.error('Delete failed', e);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('복사되었습니다!');
  };

  const handleModify = async () => {
    if ((!feedback.trim() && !globalCatchphrase.trim() && !autoGeneratePhrase) || !selectedDesign) return;
    setModifying(true);
    try {
      const baseDesign = previewDesign || selectedDesign;
      const res = await fetch('/api/designs/modify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalId: selectedDesign.id,
          feedback: feedback.trim(),
          topic: baseDesign.topic,
          originalPrompt: baseDesign.prompt,
          isPreview: true,
          catchphrase: autoGeneratePhrase ? '' : globalCatchphrase.trim(),
          autoPhrase: autoGeneratePhrase
        })
      });
      const data = await res.json();
      if (data.success) {
        setPreviewDesign(data.data);
        setFeedback('');
      } else {
        alert(data.error || '이미지 수정 생성에 실패했습니다.');
      }
    } catch (e: any) {
      console.error('Modify failed', e);
      alert('오류가 발생했습니다: ' + (e?.message || '알 수 없는 오류'));
    }
    setModifying(false);
  };


  const handleConfirm = async () => {
    if (!previewDesign || !selectedDesign) return;
    setModifying(true);
    try {
      const res = await fetch('/api/designs/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedDesign.id,
          updates: {
            prompt_hash: previewDesign.prompt_hash,
            prompt: previewDesign.prompt,
            title: previewDesign.title,
            tags: previewDesign.tags,
            image_url: previewDesign.image_url,
            modified_from: previewDesign.modified_from,
            feedback_applied: previewDesign.feedback_applied
          }
        })
      });
      const data = await res.json();
      if (data.success) {
        const updatedDesign = { ...selectedDesign, ...previewDesign, id: selectedDesign.id };
        setDesigns(designs.map(d => d.id === selectedDesign.id ? updatedDesign : d));
        setSelectedDesign(updatedDesign);
        setPreviewDesign(null);
        setFeedback('');
      }
    } catch (e) {
      console.error('Confirm failed', e);
    }
    setModifying(false);
  };

  const handleCancel = () => {
    setPreviewDesign(null);
    setFeedback('');
  };

  return (
    <main className="min-h-screen pt-2 sm:pt-3 md:pt-4 px-3 sm:px-4 md:px-6 pb-6 bg-gray-50 text-gray-900 font-sans">
      <div className="max-w-6xl mx-auto space-y-3.5 sm:space-y-4">
        <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center bg-white p-3 sm:p-4 rounded-2xl shadow-sm border border-gray-100 gap-2.5 xl:gap-0">
          <div className="shrink-0 w-full xl:w-auto flex justify-between items-start">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-blue-600 mb-0.5 whitespace-nowrap">Little Paws Studio Shop</h1>
              <p className="text-gray-500 text-xs sm:text-sm flex items-center gap-2">
                디자인 생성 결과
                {totalCount > 0 && <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md text-xs font-semibold border border-blue-100">총 {totalCount}개</span>}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-start xl:justify-end gap-2 sm:gap-2.5 w-full xl:w-auto mt-2 xl:mt-0">
            {session?.user && (
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100 shrink-0">
                {session.user.image && <img src={session.user.image} alt="Profile" className="w-6 h-6 rounded-full" />}
                <span className="text-xs font-medium text-gray-700">{session.user.email}</span>
                <button onClick={() => signOut()} className="text-xs text-red-500 hover:underline font-bold ml-1">로그아웃</button>
              </div>
            )}
            <div className="flex bg-gray-100 p-1 rounded-lg shrink-0">
              <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'}`} title="그리드 뷰">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
              </button>
              <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'}`} title="리스트 뷰">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
              </button>
            </div>
            <select
              value={selectedStyleId}
              onChange={(e) => setSelectedStyleId(e.target.value)}
              className="bg-white border border-gray-200 rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 max-w-[110px] sm:max-w-[130px] truncate shrink-0"
            >
              <option value="">화풍 선택 ▾</option>
              {styles.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <input 
              type="text" 
              value={globalCatchphrase}
              onChange={(e) => setGlobalCatchphrase(e.target.value)}
              placeholder="브랜드 문구 (선택)"
              className="bg-white border border-gray-200 rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 max-w-[95px] sm:max-w-[130px] shrink-0"
              title="디자인에 포함할 텍스트 (예: Little Paws)"
            />
            <button 
              onClick={() => setIsStickerMode(!isStickerMode)}
              className={`flex-1 sm:flex-none font-bold py-1.5 px-2.5 sm:py-2 sm:px-3.5 rounded-xl transition-all whitespace-nowrap text-xs sm:text-sm border shadow-sm ${
                isStickerMode 
                  ? 'bg-rose-500 hover:bg-rose-600 text-white border-rose-600 ring-2 ring-rose-300 animate-pulse' 
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700'
              }`}
            >
              {isStickerMode ? '🏷️ 스티커 모드 (ON)' : '🏷️ 스티커 & 디지털 PNG'}
            </button>
            <button 
              onClick={handleExportZIPBundle}
              disabled={isExportingBundle || designs.length === 0}
              className="flex-1 sm:flex-none bg-amber-600 hover:bg-amber-700 text-white font-semibold py-1.5 px-2.5 sm:py-2 sm:px-3.5 rounded-xl transition-colors disabled:opacity-50 whitespace-nowrap text-xs sm:text-sm shadow-sm"
              title="현재 페이지의 디자인들을 300DPI 투명 PNG ZIP 번들로 내보냅니다."
            >
              {isExportingBundle ? '📦 압축 생성중...' : '📦 디지털 PNG ZIP 다운로드'}
            </button>
            <button 
              onClick={() => setIsManageStylesModalOpen(true)}
              className="flex-1 sm:flex-none bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-1.5 px-2.5 sm:py-2 sm:px-3.5 rounded-xl transition-colors whitespace-nowrap text-xs sm:text-sm border border-gray-200"
            >
              화풍 관리
            </button>
            <button 
              onClick={() => setIsStyleModalOpen(true)}
              className="flex-1 sm:flex-none bg-orange-500 hover:bg-orange-600 text-white font-semibold py-1.5 px-2.5 sm:py-2 sm:px-3.5 rounded-xl transition-colors whitespace-nowrap text-xs sm:text-sm"
            >
              화풍 등록
            </button>
            <button 
              onClick={handleManualTrendSearch}
              disabled={isGeneratingTrend}
              className="flex-1 sm:flex-none bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-1.5 px-2.5 sm:py-2 sm:px-3.5 rounded-xl transition-colors disabled:opacity-50 whitespace-nowrap text-xs sm:text-sm"
            >
              {isGeneratingTrend ? '트렌드 분석중..' : '트렌드화풍 생성'}
            </button>
            <button 
              onClick={() => setIsImageModalOpen(true)}
              className="flex-1 sm:flex-none bg-purple-600 hover:bg-purple-700 text-white font-semibold py-1.5 px-2.5 sm:py-2 sm:px-3.5 rounded-xl transition-colors whitespace-nowrap text-xs sm:text-sm"
            >
              이미지 생성
            </button>
            <button 
              onClick={() => setIsAutoAgentModalOpen(true)}
              disabled={loading}
              className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1.5 px-2.5 sm:py-2 sm:px-3.5 rounded-xl transition-colors disabled:opacity-50 whitespace-nowrap text-xs sm:text-sm"
            >
              {loading ? '생성 중..' : '자동 생성'}
            </button>
          </div>
        </header>

        {/* Sticker Mode & Pygmy Pumpkin & Friends Banner */}
        {isStickerMode && (
          <div className="mb-4 p-4 bg-gradient-to-r from-rose-50 via-amber-50 to-orange-50 border-2 border-rose-300 rounded-2xl shadow-md space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🦛</span>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-rose-900 flex items-center gap-2">
                    <span>Pygmy Pumpkin & Friends 10종 스티커 & 디지털 PNG 스토어 모드</span>
                    <span className="bg-rose-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">HOT Niche</span>
                  </h3>
                  <p className="text-xs text-rose-800 font-medium">
                    흰색 다이컷 테두리 + 생태계 연출(수련/대나무/조개) + 300DPI 투명 PNG로 Etsy 및 스티커 POD 판매에 최적화되었습니다.
                  </p>
                </div>
              </div>

              <button
                onClick={handleExportZIPBundle}
                disabled={isExportingBundle || designs.length === 0}
                className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold py-2 px-4 rounded-xl shadow transition-colors flex items-center justify-center gap-1.5"
              >
                <span>📦</span>
                <span>{isExportingBundle ? 'ZIP 번들 패키징 중...' : '디지털 PNG 패키지(ZIP) 일괄 다운로드'}</span>
              </button>
            </div>

            <div className="pt-2 border-t border-rose-200/60">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <label className="block text-xs font-bold text-rose-900">
                  🎯 스티커 시리즈 템플릿 선택:
                </label>
                <div className="flex items-center gap-1 bg-rose-100/70 p-1 rounded-xl">
                  <button
                    onClick={() => setSelectedStickerSeriesTab('terrarium')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                      selectedStickerSeriesTab === 'terrarium'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-rose-900 hover:bg-rose-200/50'
                    }`}
                  >
                    🌿 테라리움 꾸미기 시리즈
                  </button>
                  <button
                    onClick={() => setSelectedStickerSeriesTab('pumpkin')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                      selectedStickerSeriesTab === 'pumpkin'
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'text-rose-900 hover:bg-rose-200/50'
                    }`}
                  >
                    🎃 Pygmy Pumpkin 시리즈
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {(selectedStickerSeriesTab === 'terrarium' ? TERRARIUM_SERIES : PYGMY_PUMPKIN_SERIES).map((preset) => (
                  <div
                    key={preset.id}
                    onClick={() => {
                      setSelectedStickerPresetId(preset.id);
                      setSelectedAnimal(preset.animalValue);
                      setUploadPrompt(preset.prompt);
                      setIsImageModalOpen(true);
                    }}
                    className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all hover:scale-[1.02] shadow-sm ${
                      selectedStickerPresetId === preset.id
                        ? selectedStickerSeriesTab === 'terrarium'
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold ring-2 ring-emerald-400'
                          : 'bg-rose-100 border-rose-500 text-rose-950 font-bold ring-2 ring-rose-400'
                        : 'bg-white border-rose-200 text-gray-800 hover:bg-rose-50'
                    }`}
                  >
                    <div className="font-bold flex items-center justify-between">
                      <span>{preset.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                        selectedStickerSeriesTab === 'terrarium'
                          ? 'text-emerald-700 bg-emerald-200/60'
                          : 'text-rose-700 bg-rose-200/60'
                      }`}>생성</span>
                    </div>
                    <p className="text-[11px] text-gray-600 line-clamp-1 mt-0.5">{preset.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Active Seasonal Trends (D-90 Rule) Banner */}
        {activeSeasonsList.length > 0 && (
          <div className="mb-4 p-3.5 bg-gradient-to-r from-orange-50 via-amber-50 to-rose-50 border border-amber-200/80 rounded-2xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🔥</span>
              <div>
                <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                  도래 3개월 전 유행 시즌 (D-90 트렌드 자동 집중)
                </h4>
                <p className="text-xs text-amber-800 font-medium">
                  현재 미국 POD 시장에서 집중 반영 중인 유행 시즌입니다.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {activeSeasonsList.map(s => (
                <span
                  key={s.holiday.id}
                  className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 transition-transform hover:scale-105 cursor-pointer ${
                    s.isUrgent
                      ? 'bg-rose-600 text-white border-rose-500 animate-pulse'
                      : 'bg-white text-amber-900 border-amber-300'
                  }`}
                  onClick={() => {
                    setAutoAgentSeason(s.holiday.id);
                    setIsAutoAgentModalOpen(true);
                  }}
                  title={`${s.holiday.koreanName} - D-${s.daysRemaining}일 남음 (클릭하여 이 시즌으로 생성)`}
                >
                  <span>{s.holiday.icon}</span>
                  <span>{s.holiday.koreanName}</span>
                  <span className={s.isUrgent ? 'text-amber-200' : 'text-amber-700'}>
                    D-{s.daysRemaining}
                  </span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Gallery View */}
        {loadingInitial ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-gray-500 font-medium text-sm">디자인 데이터를 불러오는 중입니다...</p>
          </div>
        ) : (
          <>
            {/* Top Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-1.5 mb-3.5">
                <button 
                  onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  disabled={page === 1 || loadingInitial}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors shadow-sm bg-white"
                >
                  이전
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      disabled={loadingInitial}
                      className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg text-xs sm:text-sm font-medium transition-colors ${page === p ? 'bg-blue-600 text-white shadow-sm' : 'border border-gray-200 text-gray-600 hover:bg-gray-50 bg-white'}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <button 
                  onClick={() => { setPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  disabled={page === totalPages || loadingInitial}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors shadow-sm bg-white"
                >
                  다음
                </button>
              </div>
            )}

            <section className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4.5" : "flex flex-col gap-3"}>

              {designs.map((design) => (
                <div 
                  key={design.id} 
                  className={`bg-white overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow group cursor-pointer relative ${viewMode === 'grid' ? 'rounded-2xl' : 'rounded-xl flex flex-row h-28 sm:h-36'}`} 
                  onClick={() => {
                    setSelectedDesign(design);
                    if (design.recommended_mockup) {
                      setSelectedMockupId(design.recommended_mockup);
                    }
                  }}
                >
                  <div className={`${viewMode === 'grid' ? 'aspect-square' : 'w-28 sm:w-36 flex-shrink-0'} bg-gray-200 relative`}>
                    <img src={design.image_url} alt={design.title} className="w-full h-full object-cover" />
                    <div className="absolute top-1.5 right-1.5 flex gap-1.5 opacity-100 transition-opacity backdrop-blur-sm">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleToggleLikeDesign(design.id, !design.is_liked); }}
                        className={`bg-white/90 hover:bg-white p-1.5 rounded-full shadow-sm border border-gray-200 transition-colors flex items-center justify-center w-7 h-7 ${design.is_liked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}
                        title={design.is_liked ? "좋아요 취소" : "좋아요"}
                      >
                        <svg className="w-4 h-4" fill={design.is_liked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(design.id); }}
                        className="bg-white/90 hover:bg-red-50 text-gray-400 hover:text-red-500 p-1.5 rounded-full shadow-sm border border-gray-200 transition-colors flex items-center justify-center w-7 h-7"
                        title="삭제"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </div>
                  </div>
                  <div className={`p-2.5 sm:p-3 flex flex-col justify-center ${viewMode === 'list' ? 'flex-1 min-w-0' : ''}`}>
                    <div className="flex items-center gap-1.5 flex-wrap mb-1">
                      <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md inline-block w-fit">
                        {design.topic}
                      </span>
                      {design.season_name && (
                        <span className="text-[10px] sm:text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md inline-flex items-center gap-1 border border-rose-100/80">
                          {design.season_name} {design.season_days_remaining !== null && design.season_days_remaining !== undefined && `(D-${design.season_days_remaining})`}
                        </span>
                      )}
                      <span className="text-[10px] sm:text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md inline-flex items-center gap-1 border border-purple-100/80" title={`바탕 화풍: ${getStyleDisplayName(design)}`}>
                        🎨 {getStyleDisplayName(design)}
                      </span>
                      {design.target_garment === 'dark' && (
                        <span className="text-[10px] font-bold text-amber-300 bg-slate-900 px-1.5 py-0.5 rounded-md inline-block">
                          🖤 어두운 티셔츠용
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-gray-800 text-xs sm:text-sm line-clamp-2 leading-snug" title={design.title}>{design.title}</h3>
                    {design.created_at && (
                      <p className="text-[10px] text-gray-400 mt-1">
                        {new Date(design.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              {designs.length === 0 && !loading && (
                <div className="col-span-full text-center py-12 text-gray-500">생성된 디자인이 없습니다.</div>
              )}

            </section>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 pt-8">
                <button 
                  onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  disabled={page === 1 || loadingInitial}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  이전
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      disabled={loadingInitial}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${page === p ? 'bg-blue-600 text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <button 
                  onClick={() => { setPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  disabled={page === totalPages || loadingInitial}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  다음
                </button>
              </div>
            )}
          </>
        )}

        {/* Detail Modal */}
        {selectedDesign && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-2xl">
              {/* Left: Image */}
              <div className="w-full md:w-1/2 bg-gray-100 flex items-center justify-center relative p-4 sm:p-6 min-h-[30vh] sm:min-h-0">
                <img src={previewDesign ? previewDesign.image_url : selectedDesign.image_url} alt={previewDesign ? previewDesign.title : selectedDesign.title} className="max-w-full max-h-full object-contain rounded-xl shadow-md" />
              </div>
              
              {/* Right: Details & Chat */}
              <div className="md:w-1/2 flex flex-col flex-1 min-h-0 bg-white relative">
                <button onClick={() => { setSelectedDesign(null); handleCancel(); setActiveTab('info'); }} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 text-xl font-bold z-10 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">×</button>
                
                <div className="flex border-b border-gray-100 px-5 sm:px-8 pt-5 sm:pt-8 gap-6">
                  <button 
                    onClick={() => setActiveTab('info')} 
                    className={`pb-3 font-semibold text-sm transition-colors border-b-2 ${activeTab === 'info' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-700'}`}
                  >
                    수정·SEO
                  </button>
                  <button 
                    onClick={() => setActiveTab('mockup')} 
                    className={`pb-3 font-semibold text-sm transition-colors border-b-2 flex items-center gap-1.5 ${activeTab === 'mockup' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-400 hover:text-gray-700'}`}
                  >
                    👕 목업
                  </button>
                  <button 
                    onClick={() => setActiveTab('edit')} 
                    className={`pb-3 font-semibold text-sm transition-colors border-b-2 flex items-center gap-1.5 ${activeTab === 'edit' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-400 hover:text-gray-700'}`}
                  >
                    🖌️ 편집
                  </button>
                </div>

                <div className="p-5 sm:p-8 overflow-y-auto flex-1 custom-scrollbar">
                  {activeTab === 'info' && (
                    <>
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{previewDesign ? previewDesign.title : selectedDesign.title}</h2>
                  <div className="flex gap-2 mb-6">
                    <button onClick={() => handleCopy(previewDesign ? previewDesign.title : selectedDesign.title)} className="text-xs sm:text-sm bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-full font-medium transition-colors">제목 복사</button>
                    <button onClick={() => handleCopy((previewDesign ? previewDesign.tags : selectedDesign.tags)?.join(', '))} className="text-xs sm:text-sm bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-full font-medium transition-colors">태그 복사</button>
                  </div>

                  <div className="space-y-6">
                      <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Topic</h4>
                        <p className="text-gray-700 bg-gray-50 px-4 py-3 rounded-xl text-sm border border-gray-100">{previewDesign ? previewDesign.topic : selectedDesign.topic}</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Art Style (바탕 화풍)</h4>
                        <p className="text-purple-700 bg-purple-50/80 px-4 py-3 rounded-xl text-sm border border-purple-100 font-semibold flex items-center gap-2">
                          <span className="text-base">🎨</span>
                          <span>{getStyleDisplayName(previewDesign || selectedDesign)}</span>
                        </p>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">SEO Tags</h4>
                        <div className="flex flex-wrap gap-2">
                          {(previewDesign ? previewDesign.tags : selectedDesign.tags)?.map((tag: string, i: number) => (
                            <span key={i} className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full border border-blue-100">{tag}</span>
                          ))}
                        </div>
                      </div>



                      <div className="pt-4 border-t border-gray-100 space-y-3">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">고해상도 다운로드 옵션</h4>
                        <div className="flex flex-col sm:flex-row gap-2.5">
                          <button 
                            onClick={downloadPODPrintPNG}
                            disabled={isProcessingPNG}
                            className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm flex items-center justify-center gap-2 whitespace-nowrap"
                          >
                            {isProcessingPNG ? (
                              <>
                                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>4K 변환 중...</span>
                              </>
                            ) : (
                              <>
                                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                <span>🖨️ 4K 투명 PNG</span>
                              </>
                            )}
                          </button>

                          <button 
                            onClick={downloadMockup}
                            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm flex items-center justify-center gap-2 whitespace-nowrap"
                          >
                            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            <span>👕 2.5K 목업</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                  )}
                  {activeTab === 'mockup' && (
                    <div className="flex flex-col items-center h-full min-h-[400px]">
                      <div className="w-full mb-4 flex flex-col gap-3">
                        <div className="flex flex-col w-full gap-2.5">
                          <select 
                            value={selectedMockupId}
                            onChange={(e) => setSelectedMockupId(e.target.value)}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white shadow-xs"
                          >
                            {MOCKUP_TEMPLATES.map(t => (
                              <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                          </select>
                          
                          <div className="grid grid-cols-2 gap-2 w-full">
                            <button 
                              onClick={downloadMockup}
                              title="Etsy 2.5K 목업 다운로드"
                              className="bg-orange-500 hover:bg-orange-600 active:scale-98 text-white px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 w-full whitespace-nowrap"
                            >
                              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                              <span>👕 2.5K 목업</span>
                            </button>
                            
                            <button 
                              onClick={downloadPODPrintPNG}
                              disabled={isProcessingPNG}
                              title="4K 투명 PNG 인쇄용 다운로드"
                              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 active:scale-98 text-white px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 w-full whitespace-nowrap"
                            >
                              {isProcessingPNG ? (
                                '4K 변환중...'
                              ) : (
                                <>
                                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                  <span>🖨️ 4K PNG</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                          <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-gray-500 text-center">크기 조절 (Zoom)</label>
                            <input 
                              type="range" min="0.5" max="2.0" step="0.01" 
                              value={mockupScale} onChange={(e) => setMockupScale(parseFloat(e.target.value))}
                              className="w-full accent-orange-500 touch-none"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-gray-500 text-center">좌우 이동 (X)</label>
                            <input 
                              type="range" min="-300" max="300" step="1" 
                              value={mockupOffsetX} onChange={(e) => setMockupOffsetX(parseInt(e.target.value))}
                              className="w-full accent-orange-500 touch-none"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-gray-500 text-center">상하 이동 (Y)</label>
                            <input 
                              type="range" min="-300" max="300" step="1" 
                              value={mockupOffsetY} onChange={(e) => setMockupOffsetY(parseInt(e.target.value))}
                              className="w-full accent-orange-500 touch-none"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="relative w-full flex-1 bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center border border-gray-200">
                        <canvas ref={canvasRef} className="max-w-full max-h-full object-contain" />
                      </div>
                    </div>
                  )}
                  
                  {activeTab === 'edit' && (
                    <div className="flex flex-col h-full gap-4">
                      <div className="flex flex-col gap-2">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
                            <button 
                              onClick={() => setEditMode('eraser')} 
                              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${editMode === 'eraser' ? 'bg-white shadow-sm text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                              지우개
                            </button>
                            <button 
                              onClick={() => setEditMode('text')} 
                              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${editMode === 'text' ? 'bg-white shadow-sm text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                              텍스트
                            </button>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button onClick={downloadEditCanvas} className="text-xs px-2 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg font-medium shadow-sm transition-colors flex items-center gap-1">
                              ⬇️ 다운
                            </button>
                            <button onClick={saveManualEdit} disabled={isSavingManual} className="text-xs px-2 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium shadow-sm transition-colors flex items-center gap-1 disabled:opacity-50">
                              💾 {isSavingManual ? '저장 중...' : '저장'}
                            </button>
                          </div>
                        </div>

                        {editMode === 'eraser' && (
                          <div className="flex flex-wrap items-center gap-3">
                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                              지우개 굵기:
                              <input 
                                type="range" min="5" max="100" step="1" 
                                value={brushSize} onChange={(e) => setBrushSize(parseInt(e.target.value))}
                                className="w-24 accent-purple-500"
                              />
                            </label>
                            <div className="flex gap-2 ml-auto sm:ml-0">
                              <button onClick={handleUndo} disabled={history.length === 0} className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors disabled:opacity-50">
                                ↩️ 되돌리기
                              </button>
                              <button onClick={resetEditCanvas} className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors">
                                초기화
                              </button>
                            </div>
                          </div>
                        )}
                        
                        {editMode === 'text' && (
                          <div className="flex flex-wrap items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200">
                            <button onClick={handleAddText} className="text-xs px-3 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-md font-bold transition-colors">
                              + 텍스트
                            </button>
                            {activeTextId && (
                              <>
                                <div className="h-4 w-px bg-gray-300 mx-1"></div>
                                <select 
                                  className="text-xs border border-gray-200 rounded p-1"
                                  value={textElements.find(t => t.id === activeTextId)?.font}
                                  onChange={(e) => updateTextElement(activeTextId, { font: e.target.value })}
                                >
                                  <option value="Pacifico">Pacifico (손글씨)</option>
                                  <option value="Comic Neue">Comic Neue (위트)</option>
                                  <option value="Jua">Jua (둥근고딕)</option>
                                  <option value="Roboto">Roboto (기본)</option>
                                </select>
                                <input 
                                  type="number" 
                                  className="text-xs border border-gray-200 rounded p-1 w-16"
                                  value={textElements.find(t => t.id === activeTextId)?.size}
                                  onChange={(e) => updateTextElement(activeTextId, { size: parseInt(e.target.value) || 20 })}
                                />
                                <input 
                                  type="color" 
                                  className="w-6 h-6 p-0 border-0 rounded cursor-pointer"
                                  value={textElements.find(t => t.id === activeTextId)?.color}
                                  onChange={(e) => updateTextElement(activeTextId, { color: e.target.value })}
                                />
                                <button 
                                  onClick={() => setTextElements(prev => prev.filter(t => t.id !== activeTextId))}
                                  className="text-xs text-red-500 hover:text-red-700 ml-auto"
                                >
                                  삭제
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="relative w-full flex-1 bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center border border-gray-200 touch-none shadow-inner">
                        <div 
                          className="relative inline-block leading-none cursor-none"
                          onMouseEnter={() => setIsHoveringCanvas(true)}
                          onMouseMove={handleCanvasMouseMove}
                          onMouseUp={handleCanvasMouseUp}
                          onMouseOut={handleCanvasMouseLeave}
                          onMouseLeave={handleCanvasMouseLeave}
                          onTouchMove={handleCanvasMouseMove}
                          onTouchEnd={handleCanvasMouseUp}
                        >
                          <canvas 
                            ref={editCanvasRef} 
                            className={`max-w-full max-h-full object-contain ${editMode === 'eraser' ? 'cursor-none' : 'cursor-default'}`}
                            onMouseDown={editMode === 'eraser' ? startDrawing : undefined}
                            onTouchStart={editMode === 'eraser' ? startDrawing : undefined}
                          />
                          
                          {/* Custom Eraser Cursor */}
                          {editMode === 'eraser' && isHoveringCanvas && (
                            <div 
                              style={{
                                position: 'absolute',
                                left: cursorPos.x,
                                top: cursorPos.y,
                                width: brushSize * canvasDisplayScale,
                                height: brushSize * canvasDisplayScale,
                                borderRadius: '50%',
                                border: '1.5px solid rgba(0,0,0,0.5)',
                                backgroundColor: 'rgba(255,255,255,0.4)',
                                pointerEvents: 'none',
                                transform: 'translate(-50%, -50%)',
                                zIndex: 10,
                                boxShadow: '0 0 0 1px rgba(255,255,255,0.3)'
                              }}
                            />
                          )}
                          {textElements.map(t => (
                            <div
                              key={t.id}
                              onMouseDown={(e) => handleTextMouseDown(e, t.id)}
                              onTouchStart={(e) => handleTextMouseDown(e, t.id)}
                              style={{
                                position: 'absolute',
                                left: t.x * canvasDisplayScale,
                                top: t.y * canvasDisplayScale,
                                fontFamily: `'${t.font}', sans-serif`,
                                fontSize: `${t.size * canvasDisplayScale}px`,
                                color: t.color,
                                cursor: editMode === 'text' ? 'move' : 'default',
                                userSelect: 'none',
                                whiteSpace: 'nowrap',
                                outline: activeTextId === t.id && editMode === 'text' ? '2px dashed #a855f7' : 'none',
                                padding: '2px',
                                pointerEvents: editMode === 'text' ? 'auto' : 'none'
                              }}
                            >
                              <input
                                type="text"
                                value={t.text}
                                onChange={(e) => updateTextElement(t.id, { text: e.target.value })}
                                onFocus={() => setActiveTextId(t.id)}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  outline: 'none',
                                  color: 'inherit',
                                  font: 'inherit',
                                  width: `${Math.max(t.text.length, 1) + 0.5}ch`
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 text-center font-medium">
                        {editMode === 'eraser' ? '💡 마우스로 드래그하여 원하지 않는 부분을 하얗게 지워보세요.' : '💡 텍스트를 추가하고 드래그하여 원하는 위치에 배치하세요.'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Chat Interface for Modification */}
                {activeTab === 'info' && (
                  <div className="p-4 sm:p-6 border-t border-gray-100 bg-gray-50/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <span>✨</span> 디자인 수정 요청
                      </h4>
                      {previewDesign && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full font-bold">
                          미리보기 적용 중
                        </span>
                      )}
                    </div>

                    <div className="space-y-2">
                      <input 
                        type="text" 
                        value={globalCatchphrase}
                        onChange={e => setGlobalCatchphrase(e.target.value)}
                        placeholder="브랜드 문구 추가 (선택)" 
                        className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm disabled:opacity-50"
                        disabled={modifying || autoGeneratePhrase}
                        title="이 텍스트가 수정된 디자인에 자연스럽게 합성됩니다."
                      />
                      <div className="flex items-center gap-2 bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                        <input
                          type="checkbox"
                          id="auto-phrase-modify"
                          checked={autoGeneratePhrase}
                          onChange={(e) => setAutoGeneratePhrase(e.target.checked)}
                          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                        />
                        <label htmlFor="auto-phrase-modify" className="text-xs font-semibold text-gray-700 cursor-pointer select-none">
                          위트 문구 자동 생성 (추천)
                        </label>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={feedback}
                        onChange={e => setFeedback(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleModify()}
                        placeholder={
                          previewDesign 
                            ? "추가 수정 명령어 입력 (예: 폰트 확대)" 
                            : ((globalCatchphrase.trim() || autoGeneratePhrase) ? "예: 텍스트 상단 배치 (선택)" : "예: 배경색 변경...")
                        }
                        className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
                        disabled={modifying}
                      />
                      <button 
                        onClick={handleModify}
                        disabled={modifying || (!feedback.trim() && !globalCatchphrase.trim() && !autoGeneratePhrase)}
                        className="bg-gray-900 hover:bg-black text-white px-4 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50 text-sm flex-shrink-0 shadow-sm flex items-center gap-1.5 whitespace-nowrap"
                      >
                        {modifying ? (
                          <span>생성 중...</span>
                        ) : (
                          <span>{previewDesign ? '다시 수정' : '수정'}</span>
                        )}
                      </button>
                    </div>

                    {previewDesign && (
                      <div className="flex items-center justify-between gap-2 p-2.5 bg-blue-50/80 rounded-xl border border-blue-100">
                        <span className="text-xs font-semibold text-blue-900 flex items-center gap-1 shrink-0">
                          💡 만족 시 [확인], 취소 시 [원본 복원]
                        </span>
                        <div className="flex gap-2 shrink-0">
                          <button 
                            onClick={handleCancel}
                            disabled={modifying}
                            className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-3.5 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50 text-xs shadow-xs"
                          >
                            취소
                          </button>
                          <button 
                            onClick={handleConfirm}
                            disabled={modifying}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-lg font-bold transition-colors disabled:opacity-50 text-xs shadow-xs"
                          >
                            {modifying ? '저장 중...' : '확인'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {/* Auto Agent Modal */}
        {isAutoAgentModalOpen && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl relative">
              <button onClick={() => setIsAutoAgentModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 text-xl font-bold z-10 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">×</button>
              <h2 className="text-xl font-bold text-gray-900 mb-4">자동 생성 설정</h2>
              
              <label className="block text-sm font-semibold text-gray-700 mb-2">어떤 동물로 만들까요?</label>
              <select 
                value={autoAgentAnimal}
                onChange={(e) => setAutoAgentAnimal(e.target.value)}
                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm mb-6"
              >
                <option value="random">랜덤 (Random)</option>
                <option value="hamster">햄스터 (Hamster)</option>
                <option value="guinea pig">기니피그 (Guinea Pig)</option>
                <option value="kitten">새끼 고양이 (Kitten)</option>
                <option value="puppy">강아지 (Puppy)</option>
                <option value="bunny">토끼 (Bunny)</option>
                <option value="duckling">새끼 오리 (Duckling)</option>
                <option value="piglet">아기 돼지 (Piglet)</option>
                <option value="pygmy hippo">피그미 하마 (Pygmy Hippo)</option>
                <option value="sea otter pup">새끼 해달 (Sea Otter Pup)</option>
                <option value="black bear cub">새끼 흑곰 (Black Bear Cub)</option>
                <option value="fawn">새끼 사슴 (Fawn)</option>
                <option value="baby sloth">나무늘보 (Baby Sloth)</option>
                <option value="baby hedgehog">새끼 고슴도치 (Baby Hedgehog)</option>
                <option value="baby red panda">레서판다 (Baby Red Panda)</option>
              </select>

              <label className="block text-sm font-semibold text-gray-700 mb-2">티셔츠 색상 타겟</label>
              <select 
                value={autoAgentGarmentColor}
                onChange={(e) => setAutoAgentGarmentColor(e.target.value)}
                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm mb-6"
              >
                <option value="random">랜덤 (밝은 티셔츠 70%, 검정/네이비 30%)</option>
                <option value="light">밝은 티셔츠 전용 (흰색/크림)</option>
                <option value="dark">어두운 티셔츠 전용 (검정/네이비 - 화이트/파스텔 글씨)</option>
              </select>

              <label className="block text-sm font-semibold text-gray-700 mb-2">유행 시즌 (도래 3달 전 법칙)</label>
              <select 
                value={autoAgentSeason}
                onChange={(e) => setAutoAgentSeason(e.target.value)}
                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm mb-6"
              >
                <option value="auto">⚡ 자동 (도래 3달 전 활성 시즌 우선)</option>
                {SEASONAL_HOLIDAYS.map(h => {
                  const activeInfo = activeSeasonsList.find(s => s.holiday.id === h.id);
                  return (
                    <option key={h.id} value={h.id}>
                      {h.icon} {h.koreanName} ({h.name}) {activeInfo ? `[D-${activeInfo.daysRemaining} 3달전 집중]` : ''}
                    </option>
                  );
                })}
              </select>

              <div className="flex items-center gap-2 mb-6 bg-blue-50 p-3 rounded-lg border border-blue-100">
                <input
                  type="checkbox"
                  id="auto-phrase-modal"
                  checked={autoGeneratePhrase}
                  onChange={(e) => setAutoGeneratePhrase(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="auto-phrase-modal" className="text-sm font-semibold text-blue-800 cursor-pointer select-none">
                  위트 문구 자동 생성 (추천)
                </label>
              </div>

              <div className="flex gap-3 justify-end">
                <button 
                  onClick={() => setIsAutoAgentModalOpen(false)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-5 rounded-xl transition-colors flex-1"
                >
                  취소
                </button>
                <button 
                  onClick={runAgent}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-5 rounded-xl transition-colors disabled:opacity-50 flex-1"
                >
                  생성 시작
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Image to Image Modal */}
        {isImageModalOpen && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onPaste={handlePaste}>
            <div className={`bg-white rounded-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative ${uploadPreviewDesign ? 'max-w-4xl md:flex-row' : 'max-w-2xl'}`}>
              <div className="absolute top-4 left-4 z-10 flex items-center space-x-2">
                <button 
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.dispatchEvent(new Event('go-home-reset'));
                    }
                  }} 
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center space-x-1.5 shadow-sm transition-colors cursor-pointer"
                  title="첫화면으로 이동"
                >
                  <span>🏠 첫화면으로</span>
                </button>
              </div>
              <button onClick={() => { setIsImageModalOpen(false); setUploadImageBase64(''); setUploadPrompt(''); setUploadPreviewDesign(null); }} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 text-xl font-bold z-10 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">×</button>
              
              {uploadPreviewDesign ? (
                <>
                  <div className="w-full md:w-1/2 bg-gray-100 flex items-center justify-center relative p-4 sm:p-6 min-h-[30vh] sm:min-h-0 cursor-pointer group" title="클릭 시 첫화면으로 이동" onClick={() => { if (typeof window !== 'undefined') window.dispatchEvent(new Event('go-home-reset')); }}>
                    <img src={uploadPreviewDesign.image_url} alt={uploadPreviewDesign.title} className="max-w-full max-h-full object-contain rounded-xl shadow-md group-hover:scale-105 transition-transform" />
                    <span className="absolute bottom-3 bg-black/70 text-white text-xs px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">🏠 클릭 시 첫화면으로 이동</span>
                  </div>
                  <div className="md:w-1/2 flex flex-col flex-1 min-h-0 bg-white relative">
                    <div className="p-5 sm:p-8 overflow-y-auto flex-1 custom-scrollbar">
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{uploadPreviewDesign.title}</h2>
                      <div className="space-y-6 mt-6">
                        <div>
                          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">SEO Tags</h4>
                          <div className="flex flex-wrap gap-2">
                            {uploadPreviewDesign.tags?.map((tag: string, i: number) => (
                              <span key={i} className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full border border-blue-100">{tag}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 sm:p-6 border-t border-gray-100 bg-gray-50/50">
                      <div className="flex gap-2 justify-end w-full">
                        <button 
                          onClick={handleCancelUpload}
                          disabled={isGeneratingFromImage}
                          className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-5 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 text-sm flex-1 sm:flex-none shadow-sm"
                        >
                          다시 만들기
                        </button>
                        <button 
                          onClick={handleConfirmUpload}
                          disabled={isGeneratingFromImage}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 text-sm flex-1 sm:flex-none shadow-sm"
                        >
                          {isGeneratingFromImage ? '저장 중...' : '확인 (최종 반영)'}
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-6 sm:p-8 flex flex-col h-full w-full">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 mt-4 sm:mt-0">새 디자인 생성</h2>
                  
                  <div className="flex-1 space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 sm:p-6 text-center hover:bg-gray-50 transition-colors relative flex flex-col items-center justify-center min-h-[200px]">
                      {uploadImageBase64 ? (
                        <>
                          <img 
                            src={uploadImageBase64} 
                            alt="Preview" 
                            className="max-h-64 object-contain rounded-lg cursor-pointer hover:opacity-90 transition-opacity" 
                            onClick={() => {
                              if (typeof window !== 'undefined') {
                                window.dispatchEvent(new Event('go-home-reset'));
                              }
                            }}
                            title="업로드 이미지 클릭 시 첫화면으로 이동"
                          />
                          <div className="flex items-center space-x-3 mt-2">
                            <button onClick={() => setUploadImageBase64('')} className="text-xs text-red-500 hover:underline">이미지 지우기</button>
                            <button 
                              onClick={() => {
                                if (typeof window !== 'undefined') {
                                  window.dispatchEvent(new Event('go-home-reset'));
                                }
                              }} 
                              className="text-xs text-indigo-600 font-semibold hover:underline"
                            >
                              🏠 클릭하여 첫화면 이동
                            </button>
                          </div>
                        </>
                      ) : (

                        <>
                          <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          <p className="text-sm text-gray-600 mb-1">참고할 이미지가 있다면 클릭하여 첨부하세요 (선택 사항)</p>
                          <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                        </>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">동물 선택</label>
                      <select 
                        value={selectedAnimal}
                        onChange={(e) => setSelectedAnimal(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white shadow-sm mb-4"
                      >
                        <option value="">동물 없음 (순수 오브제 / 템플릿 전용)</option>
                        <option value="hamster">햄스터 (Hamster)</option>
                        <option value="guinea pig">기니피그 (Guinea Pig)</option>
                        <option value="kitten">새끼 고양이 (Kitten)</option>
                        <option value="puppy">강아지 (Puppy)</option>
                        <option value="bunny">토끼 (Bunny)</option>
                        <option value="duckling">새끼 오리 (Duckling)</option>
                        <option value="piglet">아기 돼지 (Piglet)</option>
                        <option value="pygmy hippo">피그미 하마 (Pygmy Hippo)</option>
                        <option value="sea otter pup">새끼 해달 (Sea Otter Pup)</option>
                        <option value="black bear cub">새끼 흑곰 (Black Bear Cub)</option>
                        <option value="fawn">새끼 사슴 (Fawn)</option>
                        <option value="baby sloth">나무늘보 (Baby Sloth)</option>
                        <option value="baby hedgehog">새끼 고슴도치 (Baby Hedgehog)</option>
                        <option value="baby red panda">레서판다 (Baby Red Panda)</option>
                      </select>

                      <label className="block text-sm font-semibold text-gray-700 mb-2">어떤 디자인을 만들까요? (필수)</label>
                      <textarea 
                        value={uploadPrompt}
                        onChange={e => setUploadPrompt(e.target.value)}
                        placeholder="예: 수채화 톤의 코티지코어 감성, 들꽃 일러스트" 
                        className="w-full border border-gray-200 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white shadow-sm resize-none h-24"
                      />
                    </div>
                    
                    <div className="mt-4">
                      <div className="flex items-center gap-2 mb-4 bg-purple-50 p-3 rounded-lg border border-purple-100">
                        <input
                          type="checkbox"
                          id="auto-phrase-image-modal"
                          checked={autoGeneratePhrase}
                          onChange={(e) => setAutoGeneratePhrase(e.target.checked)}
                          className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500 cursor-pointer"
                        />
                        <label htmlFor="auto-phrase-image-modal" className="text-sm font-semibold text-purple-800 cursor-pointer select-none">
                          위트 문구 자동 생성 (추천)
                        </label>
                      </div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">적용할 화풍 (선택)</label>
                      <select 
                        value={selectedStyleId || ''}
                        onChange={(e) => setSelectedStyleId(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white shadow-sm"
                      >
                        <option value="">-- 원본 이미지 스타일 유지 --</option>
                        {styles.map(s => (
                          <option key={s.id} value={s.id}>
                            {s.is_priority ? '⭐️ ' : ''}{s.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3 justify-end">
                    <button 
                      onClick={() => { setIsImageModalOpen(false); setUploadImageBase64(''); setUploadPrompt(''); setUploadPreviewDesign(null); }}
                      className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-xl font-medium transition-colors"
                    >
                      취소
                    </button>
                    <button 
                      onClick={handleGenerateFromImage}
                      disabled={!uploadPrompt.trim() || isGeneratingFromImage}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 min-w-[120px]"
                    >
                      {isGeneratingFromImage ? '생성 중...' : '생성하기'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Manage Styles Modal */}
        {isManageStylesModalOpen && (
          <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative">
              <button onClick={() => { setIsManageStylesModalOpen(false); setEditingStyleId(null); }} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 text-xl font-bold z-10 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">×</button>
              
              <div className="p-6 sm:p-8 flex flex-col h-full">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">⚙️ 화풍 관리</h2>
                
                <div className="overflow-y-auto flex-1 custom-scrollbar space-y-4">
                  {styles.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">저장된 화풍이 없습니다.</div>
                  ) : (
                    styles.map((style) => (
                      <div key={style.id} className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden shrink-0 border border-gray-200">
                          {style.image_url ? (
                            <img 
                              src={style.image_url} 
                              alt={style.name} 
                              className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity" 
                              onClick={() => setEnlargedStyleImage(style.image_url)}
                              title="크게 보기"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Img</div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          {editingStyleId === style.id ? (
                            <div className="flex gap-2">
                              <input 
                                type="text"
                                value={editingStyleName}
                                onChange={(e) => setEditingStyleName(e.target.value)}
                                className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                autoFocus
                                onKeyDown={(e) => e.key === 'Enter' && handleUpdateStyle(style.id)}
                              />
                              <button onClick={() => handleUpdateStyle(style.id)} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700">저장</button>
                              <button onClick={() => setEditingStyleId(null)} className="bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-300">취소</button>
                            </div>
                          ) : (
                            <h3 className="font-bold text-gray-800 truncate">{style.name}</h3>
                          )}
                        </div>

                        {editingStyleId !== style.id && (
                          <div className="flex gap-2 shrink-0">
                            <button 
                              onClick={() => handleTogglePriority(style.id, !style.is_priority)}
                              className={`p-2 transition-colors ${style.is_priority ? 'text-yellow-500 hover:text-yellow-600' : 'text-gray-300 hover:text-yellow-400'}`}
                              title={style.is_priority ? "우선순위 해제" : "우선순위 설정"}
                            >
                              ★
                            </button>
                            <button 
                              onClick={() => { setEditingStyleId(style.id); setEditingStyleName(style.name); }}
                              className="text-gray-400 hover:text-blue-600 p-2 transition-colors"
                              title="이름 수정"
                            >
                              ✏️
                            </button>
                            <button 
                              onClick={() => handleDeleteStyle(style.id)}
                              className="text-gray-400 hover:text-red-600 p-2 transition-colors"
                              title="삭제"
                            >
                              🗑️
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Style Creation Modal */}
        {isStyleModalOpen && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onPaste={handleStylePaste}>
            <div className="bg-white rounded-3xl max-w-lg w-full flex flex-col shadow-2xl overflow-hidden relative">
              <button onClick={() => { setIsStyleModalOpen(false); setStyleImageBase64(''); setStyleName(''); }} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 text-xl font-bold z-10 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">×</button>
              
              <div className="p-6 sm:p-8 flex flex-col h-full w-full">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">🎨 나만의 화풍 만들기</h2>
                </div>
                
                <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 mb-6">
                  <h4 className="text-sm font-bold text-orange-800 mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                    사용 방법 안내
                  </h4>
                  <ol className="text-xs text-orange-700 space-y-1.5 pl-5 list-decimal marker:text-orange-400">
                    <li>그림체나 색감이 마음에 드는 <strong>레퍼런스 이미지</strong>를 업로드하세요.</li>
                    <li>이름을 지정하고 저장하면, AI가 <strong>'화풍(스타일)'만 정밀 분석하여 공식으로 저장</strong>합니다.</li>
                    <li>저장 완료 후 메인 화면 상단의 <strong>[화풍 선택 ▾] 드롭다운에서 방금 만든 화풍을 선택</strong>하세요.</li>
                    <li>이후 그림을 생성하면, 어떤 주제를 요청하든 <strong>선택한 화풍이 강제로 적용되어 생성</strong>됩니다!</li>
                  </ol>
                </div>
                
                <div className="flex-1 space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">화풍 이름</label>
                    <input 
                      type="text"
                      value={styleName}
                      onChange={e => setStyleName(e.target.value)}
                      placeholder="예: 귀여운 수채화풍" 
                      className="w-full border border-gray-200 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white shadow-sm"
                    />
                  </div>
                  
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 sm:p-6 text-center hover:bg-gray-50 transition-colors relative flex flex-col items-center justify-center min-h-[200px]">
                    {styleImageBase64 ? (
                      <>
                        <img src={styleImageBase64} alt="Style Preview" className="max-h-64 object-contain rounded-lg" />
                        <button onClick={() => setStyleImageBase64('')} className="mt-2 text-sm text-red-500 hover:underline">이미지 지우기</button>
                      </>
                    ) : (
                      <>
                        <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        <p className="text-sm text-gray-600 mb-1">레퍼런스 이미지 파일 선택 또는 <br/>붙여넣기(Ctrl+V) 하세요.</p>
                        <input type="file" accept="image/*" onChange={handleStyleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                      </>
                    )}
                  </div>
                </div>

                <div className="mt-8 flex gap-3 justify-end">
                  <button 
                    onClick={() => { setIsStyleModalOpen(false); setStyleImageBase64(''); setStyleName(''); }}
                    className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-xl font-medium transition-colors"
                  >
                    취소
                  </button>
                  <button 
                    onClick={handleCreateStyle}
                    disabled={!styleImageBase64 || !styleName.trim() || isCreatingStyle}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 min-w-[120px]"
                  >
                    {isCreatingStyle ? '분석 및 저장 중...' : '화풍 저장하기'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Enlarged Style Image Modal */}
        {enlargedStyleImage && (
          <div 
            className="fixed inset-0 bg-black/80 z-[70] flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setEnlargedStyleImage(null)}
          >
            <div className="relative max-w-4xl max-h-[90vh] flex items-center justify-center">
              <button 
                onClick={() => setEnlargedStyleImage(null)} 
                className="absolute -top-12 right-0 text-white hover:text-gray-300 text-4xl font-bold z-10 w-12 h-12 flex items-center justify-center"
                title="닫기"
              >
                ×
              </button>
              <img 
                src={enlargedStyleImage} 
                alt="Enlarged style" 
                className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl border border-gray-700" 
                onClick={(e) => e.stopPropagation()} 
              />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
