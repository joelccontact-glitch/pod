import { db } from '@/lib/firebase-admin';
import { NextResponse } from 'next/server';
import { updateCachedDesign } from '../route';

export async function POST(req: Request) {
  try {
    const { id, updates } = await req.json();

    if (!id || !updates) {
      return NextResponse.json({ success: false, error: 'ID and updates are required' }, { status: 400 });
    }

    if (process.env.FIREBASE_PROJECT_ID) {
      const designRef = db.collection('designs').doc(id);
      const payload: any = { ...updates };
      
      // Only bump updated_at if image changed or explicitly requested
      // (prevents busting browser image cache for pure metadata/title/tag updates!)
      if (updates.image_url || updates.forceTimestamp) {
        payload.updated_at = new Date().toISOString();
      }

      await designRef.set(payload, { merge: true });
      
      // Update in-place in memory cache without wiping 1000 items!
      updateCachedDesign(id, payload);

      return NextResponse.json({ success: true, updated_at: payload.updated_at });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating design:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
