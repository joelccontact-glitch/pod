import { db } from '@/lib/firebase-admin';
import { NextResponse } from 'next/server';
import { clearDesignsCache } from '../route';
import { clearImageCache } from '../image/route';

export async function POST(req: Request) {
  try {
    const { id, designData } = await req.json();

    if (!id || !designData) {
      return NextResponse.json({ success: false, error: 'ID and designData are required' }, { status: 400 });
    }

    if (process.env.FIREBASE_PROJECT_ID) {
      const designRef = db.collection('designs').doc(id);
      await designRef.set({
        ...designData,
        created_at: new Date().toISOString()
      });
      clearDesignsCache();
      clearImageCache(id);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error saving design:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
