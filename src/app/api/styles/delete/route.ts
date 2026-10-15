import { db } from '@/lib/firebase-admin';
import { NextResponse } from 'next/server';
import { clearStylesCache } from '../list/route';

export async function POST(req: Request) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ success: false, error: 'Style ID is required' }, { status: 400 });
    }

    if (!process.env.FIREBASE_PROJECT_ID) {
      return NextResponse.json({ success: false, error: 'Firebase is not configured' }, { status: 500 });
    }

    const styleRef = db.collection('styles').doc(id);
    await styleRef.delete();
    clearStylesCache();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting style:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
