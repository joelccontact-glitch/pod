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

    // Fetch non-deleted designs
    const designsSnapshot = await db.collection('designs')
      .orderBy('created_at', 'desc')
      .get();
      
    const allDesigns = designsSnapshot.docs
      .map((doc: any) => {
        const data = doc.data();
        if (data.is_deleted) return null;
        const versionTs = data.updated_at ? new Date(data.updated_at).getTime() : (data.created_at ? new Date(data.created_at).getTime() : Date.now());
        return {
          id: doc.id,
          ...data,
          image_url: data.image_url?.startsWith('data:image/') ? `/api/designs/image?id=${doc.id}&v=${versionTs}` : data.image_url
        };
      })
      .filter((item: any) => item !== null);

    const total = allDesigns.length;
    const paginatedDesigns = allDesigns.slice(offsetNum, offsetNum + limitNum);

    return NextResponse.json({ 
      success: true, 
      data: paginatedDesigns,
      total,
      page,
      totalPages: Math.ceil(total / limitNum)
    });
  } catch (error: any) {
    console.error('Error fetching designs:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
