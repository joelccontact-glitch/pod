import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import sharp from 'sharp';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { coverId, mockupType, dataUrl } = body;

    if (!coverId || !mockupType || !dataUrl) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    let finalDataUrl = dataUrl;

    // Compress & resize to ensure it strictly stays well within Firestore 1MB limit (1,048,487 bytes)
    if (dataUrl.startsWith('data:image/')) {
      try {
        const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, '');
        const inputBuffer = Buffer.from(base64Data, 'base64');

        const optimizedBuffer = await sharp(inputBuffer)
          .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 85, progressive: true })
          .toBuffer();

        finalDataUrl = `data:image/jpeg;base64,${optimizedBuffer.toString('base64')}`;
      } catch (err) {
        console.warn('Sharp compression error, using original dataUrl:', err);
      }
    }

    const docId = `${coverId}_${mockupType}`;
    await db.collection('mockups').doc(docId).set({
      cover_id: coverId,
      mockup_type: mockupType,
      image_url: finalDataUrl,
      created_at: new Date().toISOString()
    }, { merge: true });

    return NextResponse.json({ success: true, docId });
  } catch (error: any) {
    console.error('Error saving mockup for Pinterest:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

