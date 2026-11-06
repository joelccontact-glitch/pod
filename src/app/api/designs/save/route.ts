import { db } from '@/lib/firebase-admin';
import { NextResponse } from 'next/server';
import { addCachedDesign, clearDesignsCache } from '../route';
import { clearImageCache } from '../image/route';

export async function POST(req: Request) {
  try {
    const { id, designData } = await req.json();

    if (!id || !designData) {
      return NextResponse.json({ success: false, error: 'ID and designData are required' }, { status: 400 });
    }

    if (process.env.FIREBASE_PROJECT_ID) {
      const designRef = db.collection('designs').doc(id);

      const isCover = designData.is_cover === true ||
        (designData.stickerPresetId && (
          designData.stickerPresetId.includes('-cover') ||
          designData.stickerPresetId.includes('-pack-cover') ||
          designData.stickerPresetId.includes('master-cover')
        )) ||
        (designData.title && (
          designData.title.includes('마스터 썸네일') ||
          designData.title.includes('마스터 표지') ||
          designData.title.includes('대표 커버')
        ));

      const fullDocData = {
        ...designData,
        is_cover: isCover ? true : (designData.is_cover || false),
        created_at: designData.created_at || new Date().toISOString()
      };
      await designRef.set(fullDocData);
      addCachedDesign({ id, data: fullDocData });
      clearImageCache(id);

      // 🚨 CRITICAL: If master cover, immediately update Firestore _system_cache/covers and invalidate in-memory cache
      if (isCover) {
        clearDesignsCache();
        try {
          const coversCacheDoc = await db.collection('_system_cache').doc('covers').get();
          let items = coversCacheDoc.exists ? (coversCacheDoc.data()?.items || []) : [];
          items = items.filter((c: any) => c.id !== id);
          items.unshift({ id, ...fullDocData });
          await db.collection('_system_cache').doc('covers').set({
            items,
            updated_at: new Date().toISOString()
          });
        } catch (cacheErr: any) {
          console.error('Failed to update _system_cache/covers on save:', cacheErr?.message);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error saving design:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
