import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import fs from 'fs';
import path from 'path';
import os from 'os';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Disk snapshot cache path (persists across serverless container restarts where /tmp is available)
const SNAPSHOT_CACHE_FILE = path.join(os.tmpdir(), 'mypod-designs-snapshot.json');

// In-memory cache for fast pagination and instant responses (< 5ms)
let cachedSnapshotDocs: { id: string; data: any }[] | null = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 600000; // 10 minutes cache to drastically cut Firestore read quota consumption (99%+ reduction!)

function saveSnapshotToDisk(docs: { id: string; data: any }[] | null) {
  if (!docs || docs.length === 0) return;
  try {
    fs.writeFile(SNAPSHOT_CACHE_FILE, JSON.stringify(docs), 'utf-8', (err) => {
      if (err) console.error('Failed to write designs snapshot to disk:', err);
    });
  } catch (e) {
    console.error('saveSnapshotToDisk error:', e);
  }
}

function loadSnapshotFromDisk(): { id: string; data: any }[] | null {
  try {
    if (fs.existsSync(SNAPSHOT_CACHE_FILE)) {
      const content = fs.readFileSync(SNAPSHOT_CACHE_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('loadSnapshotFromDisk error:', e);
  }
  return null;
}

// In-place cache updates so we never wipe the 1000-doc cache during normal updates!
export function updateCachedDesign(id: string, updates: any) {
  if (!cachedSnapshotDocs) return;
  const idx = cachedSnapshotDocs.findIndex(d => d.id === id);
  if (idx !== -1) {
    cachedSnapshotDocs[idx] = {
      ...cachedSnapshotDocs[idx],
      data: { ...cachedSnapshotDocs[idx].data, ...updates }
    };
    saveSnapshotToDisk(cachedSnapshotDocs);
  }
}

export function addCachedDesign(item: { id: string; data: any }) {
  if (!cachedSnapshotDocs) {
    cachedSnapshotDocs = [];
  }
  const idx = cachedSnapshotDocs.findIndex(d => d.id === item.id);
  if (idx !== -1) {
    cachedSnapshotDocs[idx] = item;
  } else {
    cachedSnapshotDocs.unshift(item);
  }
  saveSnapshotToDisk(cachedSnapshotDocs);
}

export function removeCachedDesign(id: string, permanent: boolean = false) {
  if (!cachedSnapshotDocs) return;
  if (permanent) {
    cachedSnapshotDocs = cachedSnapshotDocs.filter(d => d.id !== id);
  } else {
    updateCachedDesign(id, { is_deleted: true });
  }
  saveSnapshotToDisk(cachedSnapshotDocs);
}

export function clearDesignsCache() {
  cachedSnapshotDocs = null;
  lastCacheTime = 0;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limitNum = parseInt(searchParams.get('limit') || '12', 10);
    const offsetNum = (page - 1) * limitNum;

    if (!process.env.FIREBASE_PROJECT_ID) {
      // Mock data for local testing without Firebase
      return NextResponse.json({
        success: true,
        data: [
          {
            id: 'mock-1',
            topic: 'Retro sunset hiking graphic',
            title: 'Vintage Hiking Retro Sunset T-Shirt',
            tags: ['hiking', 'retro', 'sunset', 'vintage', 'outdoors', 'nature', 'mountains', 'camper', 'adventure', 'graphic tee', 'summer', 'camp', 'hiker gift'],
            image_url: 'https://source.unsplash.com/800x800/?hiking',
            created_at: new Date().toISOString(),
            prompt: 'Retro sunset hiking graphic, vector art, t-shirt design, clean white background'
          }
        ],
        total: 1,
        page: 1,
        totalPages: 1
      });
    }

    const filterType = searchParams.get('type') || 'all'; // 'pod' | 'sticker' | 'all'
    const subType = searchParams.get('subType') || 'all'; // 'all' | 'terrarium' | 'vivarium' | 'saltaquarium' | 'freshaquarium'
    const searchQuery = (searchParams.get('search') || searchParams.get('q') || '').trim().toLowerCase();
    const onlyCovers = searchParams.get('onlyCovers') === 'true';
    const nocache = searchParams.get('nocache') === 'true';

    const now = Date.now();
    let isQuotaFallback = false;

    if (nocache || !cachedSnapshotDocs || (now - lastCacheTime > CACHE_TTL_MS)) {
      try {
        // Fetch ONLY lightweight metadata fields from Firestore (excludes heavy base64 images!)
        const designsSnapshot = await db.collection('designs')
          .orderBy('created_at', 'desc')
          .select(
            'title', 'topic', 'prompt', 'tags', 'stickerPresetId', 'theme',
            'sticker_sub', 'design_type', 'is_sticker', 'is_deleted',
            'created_at', 'updated_at', 'catchphrase', 'season_name',
            'style_name', 'feedback_applied', 'is_liked', 'prompt_hash'
          )
          .get();

        cachedSnapshotDocs = designsSnapshot.docs.map((doc: any) => ({
          id: doc.id,
          data: doc.data()
        }));
        lastCacheTime = now;
        saveSnapshotToDisk(cachedSnapshotDocs);
      } catch (dbErr: any) {
        console.error('Firestore query error in /api/designs:', dbErr?.message);
        // If Firestore read fails (e.g. Quota Exceeded / RESOURCE_EXHAUSTED), fallback gracefully!
        if (cachedSnapshotDocs && cachedSnapshotDocs.length > 0) {
          console.warn('[Quota Fallback] Serving from in-memory cachedSnapshotDocs');
          isQuotaFallback = true;
        } else {
          const diskDocs = loadSnapshotFromDisk();
          if (diskDocs && diskDocs.length > 0) {
            console.warn(`[Quota Fallback] Recovered ${diskDocs.length} designs from disk snapshot!`);
            cachedSnapshotDocs = diskDocs;
            lastCacheTime = now;
            isQuotaFallback = true;
          } else {
            throw dbErr;
          }
        }
      }
    }
      
    let podCount = 0;
    let stickerCount = 0;
    const dynamicSubCounts: Record<string, number> = {
      all: 0,
      dessert: 0,
      socialbattery: 0,
      hangul: 0,
      terrarium: 0,
      vivarium: 0,
      saltaquarium: 0,
      freshaquarium: 0,
      booktok: 0,
      christmas: 0,
      halloween: 0,
      thanksgiving: 0,
      valentines: 0,
      stpatrick: 0,
      easter: 0,
      mothersday: 0,
      fathersday: 0,
      july4th: 0,
      backtoschool: 0,
      newyear: 0
    };

    const allDesigns = (cachedSnapshotDocs || [])
      .map(({ id: docId, data }: any) => {
        if (!data || data.is_deleted) return null;

        let resolvedType: 'pod' | 'sticker' = 'pod';

        // 1. Strict Determination of POD Apparel vs Sticker Pack
        const titleLower = `${data.title || ''} ${data.topic || ''}`.toLowerCase();
        const isExplicitStickerPresetOrTag = (
          Boolean(data.stickerPresetId) ||
          titleLower.includes('스티커') ||
          titleLower.includes('sticker pack') ||
          titleLower.includes('sticker bundle') ||
          titleLower.includes('마스터 썸네일') ||
          titleLower.includes('마스터 표지') ||
          titleLower.includes('대표 커버')
        );

        const isPodApparelTitle = (
          titleLower.includes('t-shirt') ||
          titleLower.includes('shirt') ||
          titleLower.includes('tee') ||
          titleLower.includes('mug') ||
          titleLower.includes('tumbler') ||
          titleLower.includes('티셔츠') ||
          titleLower.includes('머그컵')
        );

        if (isExplicitStickerPresetOrTag) {
          resolvedType = 'sticker';
        } else if (isPodApparelTitle) {
          resolvedType = 'pod';
        } else if (data.design_type === 'sticker' || data.is_sticker === true) {
          resolvedType = 'sticker';
        } else if (data.design_type === 'pod') {
          resolvedType = 'pod';
        } else {
          resolvedType = 'pod';
        }

        let stickerSub: string = 'other';

        if (resolvedType === 'sticker') {
          stickerCount++;
          const explicitSub = data.sticker_sub;
          const presetId = (data.stickerPresetId || docId || '').toLowerCase();
          const title = (data.title || '').toLowerCase();
          const topic = (data.topic || '').toLowerCase();
          const prompt = (data.prompt || '').toLowerCase();
          const theme = (data.theme || '').toLowerCase();
          const text = `${title} ${topic} ${prompt} ${theme}`;

          // Priority 0: Explicit sticker_sub saved in Firestore DB
          if (explicitSub && explicitSub !== 'other') {
            stickerSub = explicitSub;
          }
          // Priority 1: Explicit presetId prefix matching
          else if (presetId.startsWith('dessert')) {
            stickerSub = 'dessert';
          } else if (presetId.startsWith('socialbattery') || presetId.startsWith('social-battery')) {
            stickerSub = 'socialbattery';
          } else if (presetId.startsWith('hangul')) {
            stickerSub = 'hangul';
          } else if (presetId.startsWith('christmas')) {
            stickerSub = 'christmas';
          } else if (presetId.startsWith('halloween')) {
            stickerSub = 'halloween';
          } else if (presetId.startsWith('thanksgiving')) {
            stickerSub = 'thanksgiving';
          } else if (presetId.startsWith('valentines') || presetId.startsWith('valentine')) {
            stickerSub = 'valentines';
          } else if (presetId.startsWith('stpatrick')) {
            stickerSub = 'stpatrick';
          } else if (presetId.startsWith('easter')) {
            stickerSub = 'easter';
          } else if (presetId.startsWith('mothersday')) {
            stickerSub = 'mothersday';
          } else if (presetId.startsWith('fathersday')) {
            stickerSub = 'fathersday';
          } else if (presetId.startsWith('july4th')) {
            stickerSub = 'july4th';
          } else if (presetId.startsWith('backtoschool')) {
            stickerSub = 'backtoschool';
          } else if (presetId.startsWith('newyear')) {
            stickerSub = 'newyear';
          } else if (presetId.startsWith('fresh-aquarium') || presetId.startsWith('freshaquarium')) {
            stickerSub = 'freshaquarium';
          } else if (presetId.startsWith('salt-aquarium') || presetId.startsWith('saltaquarium')) {
            stickerSub = 'saltaquarium';
          } else if (presetId.startsWith('vivarium')) {
            stickerSub = 'vivarium';
          } else if (presetId.startsWith('terrarium')) {
            stickerSub = 'terrarium';
          } else if (presetId.startsWith('booktok')) {
            stickerSub = 'booktok';
          } 
          // Priority 2: Explicit Title & Topic Matching (HIGHEST DETERMINISTIC INTENT)
          else if (
            title.includes('디저트') || title.includes('베이커리') || title.includes('dessert') || title.includes('bakery') || title.includes('sweet treat') ||
            topic.includes('디저트') || topic.includes('베이커리') || topic.includes('dessert') || topic.includes('bakery')
          ) {
            stickerSub = 'dessert';
          } else if (
            title.includes('사회적 배터리') || title.includes('내향인') || title.includes('social battery') || title.includes('introvert') ||
            topic.includes('사회적 배터리') || topic.includes('내향인') || topic.includes('social battery') || topic.includes('introvert')
          ) {
            stickerSub = 'socialbattery';
          } else if (
            title.includes('한글') || title.includes('k-감성') || title.includes('hangul') || title.includes('k-vibe') || title.includes('korean vibe') ||
            topic.includes('한글') || topic.includes('hangul') || topic.includes('k-vibe')
          ) {
            stickerSub = 'hangul';
          } else if (
            title.includes('크리스마스') || title.includes('christmas') || title.includes('스노우볼') ||
            topic.includes('크리스마스') || topic.includes('christmas')
          ) {
            stickerSub = 'christmas';
          } else if (
            title.includes('할로윈') || title.includes('halloween') || title.includes('스푸키') ||
            topic.includes('할로윈') || topic.includes('halloween') || topic.includes('스푸키')
          ) {
            stickerSub = 'halloween';
          } else if (
            title.includes('추수감사절') || title.includes('thanksgiving') || title.includes('가을 수확') || title.includes('하베스트') ||
            topic.includes('추수감사절') || topic.includes('thanksgiving') || topic.includes('하베스트')
          ) {
            stickerSub = 'thanksgiving';
          } else if (
            title.includes('열대어어항') || title.includes('열대어 어항') || title.includes('freshwater aquarium') || title.includes('fresh aquarium') ||
            topic.includes('열대어어항') || topic.includes('열대어 어항') || topic.includes('freshwater aquarium')
          ) {
            stickerSub = 'freshaquarium';
          } else if (
            title.includes('해수어항') || title.includes('해수 어항') || title.includes('saltwater aquarium') || title.includes('salt aquarium') ||
            topic.includes('해수어항') || topic.includes('해수 어항') || topic.includes('saltwater aquarium')
          ) {
            stickerSub = 'saltaquarium';
          } else if (
            title.includes('비바리움') || title.includes('vivarium') ||
            topic.includes('비바리움') || topic.includes('vivarium')
          ) {
            stickerSub = 'vivarium';
          } else if (
            title.includes('테라리움') || title.includes('terrarium') ||
            topic.includes('테라리움') || topic.includes('terrarium')
          ) {
            stickerSub = 'terrarium';
          } else if (
            title.includes('북톡') || title.includes('독서') || title.includes('booktok') || title.includes('book club') ||
            topic.includes('북톡') || topic.includes('booktok')
          ) {
            stickerSub = 'booktok';
          }
          // Priority 3: Keyword / Prompt text matching (Fallback when title has no explicit series tag)
          else if (
            text.includes('croissant') || text.includes('크루아상') || text.includes('pancake') || text.includes('팬케이크') || text.includes('dessert') || text.includes('bakery') || text.includes('디저트')
          ) {
            stickerSub = 'dessert';
          } else if (
            text.includes('social battery') || text.includes('배터리') || text.includes('introvert') || text.includes('overstimulated') || text.includes('recharging')
          ) {
            stickerSub = 'socialbattery';
          } else if (
            text.includes('대박') || text.includes('괜찮아') || text.includes('hangul') || text.includes('한글') || text.includes('k-vibe') || text.includes('gwenchana') || text.includes('daebak')
          ) {
            stickerSub = 'hangul';
          } else if (
            text.includes('christmas') || text.includes('크리스마스') || text.includes('snowglobe') || text.includes('스노우볼') || text.includes('gingerbread')
          ) {
            stickerSub = 'christmas';
          } else if (
            text.includes('halloween') || text.includes('할로윈') || text.includes('spooky') || text.includes('cute ghost') || text.includes('호박')
          ) {
            stickerSub = 'halloween';
          } else if (
            text.includes('thanksgiving') || text.includes('추수감사절') || text.includes('harvest') || text.includes('하베스트') || text.includes('acorn')
          ) {
            stickerSub = 'thanksgiving';
          } else if (
            text.includes('terrarium') || text.includes('테라리움') || text.includes('succulent') || text.includes('다육식물') || text.includes('teacup succulent') || text.includes('moss jar')
          ) {
            stickerSub = 'terrarium';
          } else if (
            text.includes('vivarium') || text.includes('비바리움') || text.includes('chameleon') || text.includes('gecko') || text.includes('dart frog') || text.includes('tree frog')
          ) {
            stickerSub = 'vivarium';
          } else if (
            text.includes('saltaquarium') || text.includes('saltwater') || text.includes('해수어항') || text.includes('해수 어항') || text.includes('clownfish') || text.includes('seahorse') || text.includes('anemone') || text.includes('coral tank') || text.includes('blue tang')
          ) {
            stickerSub = 'saltaquarium';
          } else if (
            text.includes('freshaquarium') || text.includes('freshwater') || text.includes('열대어어항') || text.includes('열대어 어항') || text.includes('열대어') || text.includes('betta') || text.includes('guppy') || text.includes('neon tetra') || text.includes('angelfish') || text.includes('goldfish') || text.includes('오토싱') || text.includes('애플 스네일') || text.includes('어항')
          ) {
            stickerSub = 'freshaquarium';
          } else if (
            text.includes('booktok') || text.includes('북톡') || text.includes('kindle girlie') || text.includes('book club') || text.includes('킨들') || text.includes('cozy reader')
          ) {
            stickerSub = 'booktok';
          } else {
            stickerSub = 'other';
          }

          dynamicSubCounts[stickerSub] = (dynamicSubCounts[stickerSub] || 0) + 1;
        } else {
          podCount++;
        }

        const versionTs = data.updated_at ? new Date(data.updated_at).getTime() : (data.created_at ? new Date(data.created_at).getTime() : Date.now());
        
        // Exclude heavy raw base64 data string from list response to shrink payload from 10MB to 50KB!
        const { image_url: rawImg, ...restData } = data;
        const optimizedImageUrl = (rawImg && rawImg.startsWith('data:image/')) 
          ? `/api/designs/image?id=${docId}&v=${versionTs}` 
          : (rawImg || `/api/designs/image?id=${docId}&v=${versionTs}`);

        return {
          id: docId,
          ...restData,
          design_type: resolvedType,
          sticker_sub: stickerSub,
          image_url: optimizedImageUrl
        };
      })
      .filter((item: any) => {
        if (!item) return false;

        // 1. Keyword search filter
        if (searchQuery) {
          const tagsStr = Array.isArray(item.tags) ? item.tags.join(' ') : (item.tags || '');
          const searchableText = `${item.title || ''} ${item.topic || ''} ${item.prompt || ''} ${item.catchphrase || ''} ${item.season_name || ''} ${tagsStr}`.toLowerCase();
          if (!searchableText.includes(searchQuery)) return false;
        }

        // 2. Category tab filter ('all' | 'pod' | 'sticker')
        if (filterType === 'pod' && item.design_type !== 'pod') return false;
        if (filterType === 'sticker') {
          if (item.design_type !== 'sticker') return false;
          if (subType && subType !== 'all' && item.sticker_sub !== subType) return false;
          
          if (onlyCovers) {
            const scanStr = `${item.title || ''} ${item.topic || ''} ${item.prompt || ''} ${item.stickerPresetId || ''} ${item.id || ''}`.toLowerCase();
            const isExplicitCover = (
              scanStr.includes('-20-pack-cover') ||
              scanStr.includes('-standalone-20-pack-cover') ||
              scanStr.includes('-pack-cover') ||
              scanStr.includes('마스터 썸네일') ||
              scanStr.includes('마스터 표지') ||
              scanStr.includes('대표 커버') ||
              scanStr.includes('master cover') ||
              scanStr.includes('bundle cover') ||
              scanStr.includes('pack cover') ||
              scanStr.includes('20+ cute') ||
              scanStr.includes('40+ cute') ||
              scanStr.includes('20+ sticker') ||
              scanStr.includes('40+ sticker') ||
              scanStr.includes('sticker bundle') ||
              scanStr.includes('etsy digital sticker bundle')
            );
            if (!isExplicitCover) return false;
          }
          return true;
        }
        return true;
      });

    const total = allDesigns.length;
    const paginatedDesigns = allDesigns.slice(offsetNum, offsetNum + limitNum);
    dynamicSubCounts.all = stickerCount;

    const jsonResponse = NextResponse.json({ 
      success: true, 
      data: paginatedDesigns,
      total,
      podCount,
      stickerCount,
      stickerSubCounts: dynamicSubCounts,
      page,
      totalPages: Math.ceil(total / limitNum)
    });

    if (!nocache) {
      jsonResponse.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=180');
    }
    if (isQuotaFallback) {
      jsonResponse.headers.set('X-Quota-Fallback', 'true');
    }
    return jsonResponse;
  } catch (error: any) {
    console.error('Error fetching designs:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
