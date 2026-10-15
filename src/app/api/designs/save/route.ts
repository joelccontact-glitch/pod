import { db } from '@/lib/firebase-admin';
import { NextResponse } from 'next/server';
import { addCachedDesign } from '../route';
import { clearImageCache } from '../image/route';

export async function POST(req: Request) {
  try {
    const { id, designData } = await req.json();

    if (!id || !designData) {
      return NextResponse.json({ success: false, error: 'ID and designData are required' }, { status: 400 });
    }

    if (process.env.FIREBASE_PROJECT_ID) {
      const designRef = db.collection('designs').doc(id);
      const fullDocData = {
        ...designData,
        created_at: designData.created_at || new Date().toISOString()
      };
      await designRef.set(fullDocData);
      addCachedDesign({ id, data: fullDocData });
      clearImageCache(id);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error saving design:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
