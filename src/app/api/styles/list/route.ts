import { db } from '@/lib/firebase-admin';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    if (!process.env.FIREBASE_PROJECT_ID) {
      return NextResponse.json({ success: false, error: 'Firebase not configured' }, { status: 500 });
    }

    const snapshot = await db.collection('styles').orderBy('created_at', 'desc').get();
    
    const styles = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ success: true, data: styles });
  } catch (error: any) {
    console.error('Error fetching styles:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
