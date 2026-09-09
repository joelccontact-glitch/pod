import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

// In-memory cache for fast pagination and instant responses (< 5ms)
let cachedSnapshotDocs: { id: string; data: any }[] | null = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 10000; // 10 seconds cache

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
    const nocache = searchParams.get('nocache') === 'true';

    const now = Date.now();
    if (nocache || !cachedSnapshotDocs || (now - lastCacheTime > CACHE_TTL_MS)) {
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
    }
      
    let podCount = 0;
    let stickerCount = 0;
    let terrariumCount = 0;
    let vivariumCount = 0;
    let saltaquariumCount = 0;
    let freshaquariumCount = 0;

    const allDesigns = (cachedSnapshotDocs || [])
      .map(({ id: docId, data }: any) => {
        if (!data || data.is_deleted) return null;

        let resolvedType: 'pod' | 'sticker' = 'pod';

        // 1. Strict DB Field Priority for design_type
        if (data.design_type === 'sticker' || data.is_sticker === true) {
          resolvedType = 'sticker';
        } else if (data.design_type === 'pod') {
          resolvedType = 'pod';
        } else {
          // Fallback parsing ONLY for legacy documents where design_type is missing in DB
          const titleTopic = `${data.title || ''} ${data.topic || ''} ${data.prompt || ''} ${data.stickerPresetId || ''} ${data.theme || ''}`.toLowerCase();
          const isStickerTitleOrType = (
            Boolean(data.stickerPresetId) ||
            titleTopic.includes('스티커') ||
            titleTopic.includes('sticker') ||
            titleTopic.includes('die-cut') ||
            titleTopic.includes('master cover') ||
            titleTopic.includes('마스터 썸네일') ||
            titleTopic.includes('마스터 표지')
          );
          resolvedType = isStickerTitleOrType ? 'sticker' : 'pod';
        }

        let stickerSub: 'terrarium' | 'vivarium' | 'saltaquarium' | 'freshaquarium' | 'other' = 'other';

        if (resolvedType === 'sticker') {
          stickerCount++;
          const presetId = (data.stickerPresetId || docId || '').toLowerCase();
          const title = (data.title || '').toLowerCase();
          const topic = (data.topic || '').toLowerCase();
          const prompt = (data.prompt || '').toLowerCase();
          const theme = (data.theme || '').toLowerCase();
          const text = `${title} ${topic} ${prompt} ${theme}`;

          // Priority 0: Explicit DB Field (If already set in Firestore)
          if (data.sticker_sub && ['terrarium', 'vivarium', 'saltaquarium', 'freshaquarium'].includes(data.sticker_sub)) {
            stickerSub = data.sticker_sub;
          }
          // Priority 1: Explicit presetId prefix matching
          else if (presetId.startsWith('fresh-aquarium') || presetId.startsWith('freshaquarium')) {
            stickerSub = 'freshaquarium';
          } else if (presetId.startsWith('salt-aquarium') || presetId.startsWith('saltaquarium')) {
            stickerSub = 'saltaquarium';
          } else if (presetId.startsWith('vivarium')) {
            stickerSub = 'vivarium';
          } else if (presetId.startsWith('terrarium')) {
            stickerSub = 'terrarium';
          } 
          // Priority 2: Niche Keyword Priority (Terrarium & Succulent -> Vivarium -> Saltwater Aquarium -> Freshwater Aquarium)
          else if (
            text.includes('terrarium') || text.includes('테라리움') || text.includes('succulent') || text.includes('다육식물') || text.includes('teacup succulent') || text.includes('moss jar')
          ) {
            stickerSub = 'terrarium';
          } else if (
            text.includes('vivarium') || text.includes('비바리움') || text.includes('chameleon') || text.includes('gecko') || text.includes('dart frog') || text.includes('tree frog')
          ) {
            stickerSub = 'vivarium';
          } else if (
            text.includes('saltaquarium') || text.includes('saltwater') || text.includes('해수어항') || text.includes('해수 어항') || text.includes('clownfish') || text.includes('seahorse') || text.includes('anemone') || text.includes('coral tank') || text.includes('angelfish')
          ) {
            stickerSub = 'saltaquarium';
          } else if (
            text.includes('freshaquarium') || text.includes('freshwater') || text.includes('열대어어항') || text.includes('열대어 어항') || text.includes('열대어') || text.includes('betta') || text.includes('guppy') || text.includes('neon tetra') || text.includes('goldfish') || text.includes('어항')
          ) {
            stickerSub = 'freshaquarium';
          } else {
            stickerSub = 'other';
          }

          if (stickerSub === 'terrarium') terrariumCount++;
          else if (stickerSub === 'vivarium') vivariumCount++;
          else if (stickerSub === 'saltaquarium') saltaquariumCount++;
          else if (stickerSub === 'freshaquarium') freshaquariumCount++;
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

        // 2. Type & SubType filter
        if (filterType === 'pod') return item.design_type === 'pod';
        if (filterType === 'sticker') {
          if (item.design_type !== 'sticker') return false;
          if (subType === 'terrarium') return item.sticker_sub === 'terrarium';
          if (subType === 'vivarium') return item.sticker_sub === 'vivarium';
          if (subType === 'saltaquarium') return item.sticker_sub === 'saltaquarium';
          if (subType === 'freshaquarium') return item.sticker_sub === 'freshaquarium';
          return true;
        }
        return true;
      });

    const total = allDesigns.length;
    const paginatedDesigns = allDesigns.slice(offsetNum, offsetNum + limitNum);

    return NextResponse.json({ 
      success: true, 
      data: paginatedDesigns,
      total,
      podCount,
      stickerCount,
      stickerSubCounts: {
        all: stickerCount,
        terrarium: terrariumCount,
        vivarium: vivariumCount,
        saltaquarium: saltaquariumCount,
        freshaquarium: freshaquariumCount
      },
      page,
      totalPages: Math.ceil(total / limitNum)
    });
  } catch (error: any) {
    console.error('Error fetching designs:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
