import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { coverId, mockupType, dataUrl } = body;

    if (!coverId || !mockupType || !dataUrl) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const docId = `${coverId}_${mockupType}`;
    await db.collection('mockups').doc(docId).set({
      cover_id: coverId,
      mockup_type: mockupType,
      image_url: dataUrl,
      created_at: new Date().toISOString()
    }, { merge: true });

    return NextResponse.json({ success: true, docId });
  } catch (error: any) {
    console.error('Error saving mockup for Pinterest:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
