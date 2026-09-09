import { db } from '@/lib/firebase-admin';
import { NextResponse } from 'next/server';
import { clearDesignsCache } from '../route';

export async function POST(req: Request) {
  try {
    const { id, updates } = await req.json();

    if (!id || !updates) {
      return NextResponse.json({ success: false, error: 'ID and updates are required' }, { status: 400 });
    }

    if (process.env.FIREBASE_PROJECT_ID) {
      const nowIso = new Date().toISOString();
      const designRef = db.collection('designs').doc(id);
      await designRef.set({
        ...updates,
        updated_at: nowIso
      }, { merge: true });
      clearDesignsCache();
      return NextResponse.json({ success: true, updated_at: nowIso });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating design:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
