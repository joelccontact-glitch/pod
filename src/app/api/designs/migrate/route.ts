import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export async function GET() {
  try {
    if (!process.env.FIREBASE_PROJECT_ID) {
      return NextResponse.json({ success: false, error: 'Firebase project ID is not set.' });
    }

    const snapshot = await db.collection('designs').get();
    if (snapshot.empty) {
      return NextResponse.json({ success: true, updatedCount: 0, message: 'No designs found.' });
    }

    const itemsToUpdate: { ref: any; data: any }[] = [];

    snapshot.docs.forEach((doc: any) => {
      const data = doc.data();
      const titleTopic = `${data.title || ''} ${data.topic || ''} ${data.prompt || ''} ${data.stickerPresetId || ''} ${data.theme || ''}`.toLowerCase();
      
      const isPodTitle = (
        titleTopic.includes('t-shirt') ||
        titleTopic.includes('shirt') ||
        titleTopic.includes('tee') ||
        titleTopic.includes('mug') ||
        titleTopic.includes('tumbler') ||
        titleTopic.includes('티셔츠') ||
        titleTopic.includes('머그컵')
      );

      const isStickerTitleOrType = (
        data.is_sticker === true ||
        data.design_type === 'sticker' ||
        Boolean(data.stickerPresetId) ||
        titleTopic.includes('스티커') ||
        titleTopic.includes('sticker') ||
        titleTopic.includes('die-cut') ||
        titleTopic.includes('terrarium') ||
        titleTopic.includes('테라리움') ||
        titleTopic.includes('succulent') ||
        titleTopic.includes('다육식물') ||
        titleTopic.includes('vivarium') ||
        titleTopic.includes('비바리움') ||
        titleTopic.includes('chameleon') ||
        titleTopic.includes('gecko') ||
        titleTopic.includes('saltaquarium') ||
        titleTopic.includes('saltwater') ||
        titleTopic.includes('해수어항') ||
        titleTopic.includes('해수 어항') ||
        titleTopic.includes('clownfish') ||
        titleTopic.includes('seahorse') ||
        titleTopic.includes('freshaquarium') ||
        titleTopic.includes('freshwater') ||
        titleTopic.includes('열대어어항') ||
        titleTopic.includes('열대어 어항') ||
        titleTopic.includes('betta') ||
        titleTopic.includes('guppy') ||
        titleTopic.includes('aquarium') ||
        titleTopic.includes('master cover') ||
        titleTopic.includes('마스터 썸네일') ||
        titleTopic.includes('마스터 표지')
      );

      let resolvedType: 'pod' | 'sticker' = 'pod';
      if (isStickerTitleOrType) {
        resolvedType = 'sticker';
      } else if (isPodTitle) {
        resolvedType = 'pod';
      } else if (data.design_type === 'pod') {
        resolvedType = 'pod';
      } else {
        resolvedType = 'pod';
      }

      let stickerSub: 'terrarium' | 'vivarium' | 'saltaquarium' | 'freshaquarium' | 'other' = 'other';

      if (resolvedType === 'sticker') {
        const presetId = (data.stickerPresetId || doc.id || '').toLowerCase();
        const title = (data.title || '').toLowerCase();
        const topic = (data.topic || '').toLowerCase();
        const prompt = (data.prompt || '').toLowerCase();
        const theme = (data.theme || '').toLowerCase();
        const text = `${title} ${topic} ${prompt} ${theme}`;

        // Priority 1: Explicit presetId prefix
        if (presetId.startsWith('fresh-aquarium') || presetId.startsWith('freshaquarium')) {
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
      }

      // Update if design_type or sticker_sub is missing or inconsistent
      if (data.design_type !== resolvedType || data.sticker_sub !== stickerSub) {
        itemsToUpdate.push({
          ref: doc.ref,
          data: {
            design_type: resolvedType,
            sticker_sub: stickerSub,
            updated_at: new Date().toISOString()
          }
        });
      }
    });

    // Chunk update operations in mini batches of 50 to avoid Firestore Transaction Too Big limits
    const CHUNK_SIZE = 50;
    for (let i = 0; i < itemsToUpdate.length; i += CHUNK_SIZE) {
      const chunk = itemsToUpdate.slice(i, i + CHUNK_SIZE);
      const batch = db.batch();
      chunk.forEach(item => {
        batch.update(item.ref, item.data);
      });
      await batch.commit();
    }

    return NextResponse.json({
      success: true,
      totalCount: snapshot.size,
      updatedCount: itemsToUpdate.length,
      message: `Successfully migrated ${itemsToUpdate.length} out of ${snapshot.size} designs in Firestore.`
    });
  } catch (error: any) {
    console.error('Migration error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
