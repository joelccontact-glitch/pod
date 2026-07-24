import { db } from '@/lib/firebase-admin';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { id, is_liked } = await req.json();

    if (!id) {
      return NextResponse.json({ success: false, error: 'Design ID is required' }, { status: 400 });
    }

    if (!process.env.FIREBASE_PROJECT_ID) {
      return NextResponse.json({ success: false, error: 'Firebase is not configured' }, { status: 500 });
    }

    const designRef = db.collection('designs').doc(id);
    await designRef.update({ is_liked });

    return NextResponse.json({ success: true, data: { id, is_liked } });
  } catch (error: any) {
    console.error('Error updating design like status:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
