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

    // Fetch non-deleted designs
    const designsSnapshot = await db.collection('designs')
      .orderBy('created_at', 'desc')
      .get();
      
    let podCount = 0;
    let stickerCount = 0;

    const allDesigns = designsSnapshot.docs
      .map((doc: any) => {
        const data = doc.data();
        if (data.is_deleted) return null;

        // Auto-detect design type for legacy entries
        let resolvedType: 'pod' | 'sticker' = data.design_type || 'pod';
        const searchStr = `${data.topic || ''} ${data.theme || ''} ${data.title || ''} ${data.stickerPresetId || ''} ${data.prompt || ''}`.toLowerCase();
        
        if (
          data.is_sticker || 
          data.design_type === 'sticker' || 
          searchStr.includes('sticker') || 
          searchStr.includes('스티커') || 
          searchStr.includes('terrarium') || 
          searchStr.includes('테라리움') || 
          searchStr.includes('vivarium') || 
          searchStr.includes('비바리움') || 
          searchStr.includes('aquarium') || 
          searchStr.includes('어항') || 
          searchStr.includes('pygmy')
        ) {
          resolvedType = 'sticker';
          stickerCount++;
        } else {
          resolvedType = 'pod';
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
          image_url: optimizedImageUrl
        };
      })
      .filter((item: any) => {
        if (!item) return false;
        if (filterType === 'pod') return item.design_type === 'pod';
        if (filterType === 'sticker') return item.design_type === 'sticker';
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
      page,
      totalPages: Math.ceil(total / limitNum)
    });
  } catch (error: any) {
    console.error('Error fetching designs:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
