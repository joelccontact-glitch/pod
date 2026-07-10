import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
    }

    if (process.env.FIREBASE_PROJECT_ID) {
      await db.collection('designs').doc(id).delete();
      return NextResponse.json({ success: true, message: 'Deleted successfully' });
    } else {
      // Mock mode
      return NextResponse.json({ success: true, message: '[MOCK MODE] Deleted successfully' });
    }
  } catch (error: any) {
    console.error('Error deleting design:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
