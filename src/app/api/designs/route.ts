import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

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

    // Fetch non-deleted designs
    const designsSnapshot = await db.collection('designs')
      .orderBy('created_at', 'desc')
      .get();
      
    let podCount = 0;
    let stickerCount = 0;
    let terrariumCount = 0;
    let vivariumCount = 0;
    let saltaquariumCount = 0;
    let freshaquariumCount = 0;

    const allDesigns = designsSnapshot.docs
      .map((doc: any) => {
        const data = doc.data();
        if (data.is_deleted) return null;

        // Auto-detect design type for entries
        let resolvedType: 'pod' | 'sticker' = 'pod';

        const titleTopic = `${data.title || ''} ${data.topic || ''} ${data.stickerPresetId || ''}`.toLowerCase();

        // 1. Explicit POD apparel titles (T-Shirt, Mug, Tumbler, etc.)
        const isPodTitle = (
          titleTopic.includes('t-shirt') ||
          titleTopic.includes('shirt') ||
          titleTopic.includes('tee') ||
          titleTopic.includes('mug') ||
          titleTopic.includes('tumbler') ||
          titleTopic.includes('티셔츠') ||
          titleTopic.includes('머그컵')
        );

        // 2. Explicit Sticker titles or metadata flags
        const isStickerTitleOrType = (
          data.is_sticker === true ||
          data.design_type === 'sticker' ||
          Boolean(data.stickerPresetId) ||
          titleTopic.includes('스티커') ||
          titleTopic.includes('sticker pack') ||
          titleTopic.includes('terrarium') ||
          titleTopic.includes('테라리움') ||
          titleTopic.includes('vivarium') ||
          titleTopic.includes('비바리움') ||
          titleTopic.includes('saltaquarium') ||
          titleTopic.includes('해수어항') ||
          titleTopic.includes('freshaquarium') ||
          titleTopic.includes('열대어어항') ||
          titleTopic.includes('master cover') ||
          titleTopic.includes('마스터 썸네일') ||
          titleTopic.includes('마스터 표지')
        );

        if (isPodTitle && !isStickerTitleOrType) {
          resolvedType = 'pod';
        } else if (isStickerTitleOrType) {
          resolvedType = 'sticker';
        } else if (data.design_type === 'pod') {
          resolvedType = 'pod';
        } else {
          resolvedType = 'pod';
        }

        let stickerSub: 'terrarium' | 'vivarium' | 'saltaquarium' | 'freshaquarium' | 'other' = 'other';

        if (resolvedType === 'sticker') {
          stickerCount++;
          const presetId = (data.stickerPresetId || doc.id || '').toLowerCase();
          const text = `${data.title || ''} ${data.topic || ''} ${data.prompt || ''} ${data.theme || ''}`.toLowerCase();

          if (presetId.startsWith('terrarium') || text.includes('terrarium') || text.includes('테라리움')) {
            stickerSub = 'terrarium';
            terrariumCount++;
          } else if (presetId.startsWith('vivarium') || text.includes('vivarium') || text.includes('비바리움') || text.includes('chameleon') || text.includes('gecko')) {
            stickerSub = 'vivarium';
            vivariumCount++;
          } else if (
            presetId.startsWith('salt-aquarium') || 
            presetId.startsWith('saltaquarium') || 
            text.includes('saltaquarium') || 
            text.includes('saltwater') || 
            text.includes('해수어항') || 
            text.includes('clownfish') || 
            text.includes('seahorse')
          ) {
            stickerSub = 'saltaquarium';
            saltaquariumCount++;
          } else if (
            presetId.startsWith('fresh-aquarium') || 
            presetId.startsWith('freshaquarium') || 
            text.includes('freshaquarium') || 
            text.includes('freshwater') || 
            text.includes('열대어어항') || 
            text.includes('열대어') || 
            text.includes('어항') || 
            text.includes('betta') || 
            text.includes('guppy')
          ) {
            stickerSub = 'freshaquarium';
            freshaquariumCount++;
          } else {
            stickerSub = 'other';
          }
        } else {
          podCount++;
        }

        const versionTs = data.updated_at ? new Date(data.updated_at).getTime() : (data.created_at ? new Date(data.created_at).getTime() : Date.now());
        
        // Exclude heavy raw base64 data string from list response to shrink payload from 10MB to 50KB!
        const { image_url: rawImg, ...restData } = data;
        const optimizedImageUrl = (rawImg && rawImg.startsWith('data:image/')) 
          ? `/api/designs/image?id=${doc.id}&v=${versionTs}` 
          : (rawImg || `/api/designs/image?id=${doc.id}&v=${versionTs}`);

        return {
          id: doc.id,
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
