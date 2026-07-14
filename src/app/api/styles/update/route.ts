import { db } from '@/lib/firebase-admin';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { id, name } = await req.json();

    if (!id || !name) {
      return NextResponse.json({ success: false, error: 'Style ID and new name are required' }, { status: 400 });
    }

    if (!process.env.FIREBASE_PROJECT_ID) {
      return NextResponse.json({ success: false, error: 'Firebase is not configured' }, { status: 500 });
    }

    const styleRef = db.collection('styles').doc(id);
    await styleRef.update({ name: name });

    return NextResponse.json({ success: true, data: { id, name } });
  } catch (error: any) {
    console.error('Error updating style:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
