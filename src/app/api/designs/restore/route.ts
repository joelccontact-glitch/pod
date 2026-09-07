import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, ids } = body;

    const targetIds: string[] = ids || (id ? [id] : []);

    if (targetIds.length === 0) {
      return NextResponse.json({ success: false, error: 'ID or IDs array is required' }, { status: 400 });
    }

    if (process.env.FIREBASE_PROJECT_ID) {
      const batch = db.batch();

      for (const targetId of targetIds) {
        const docRef = db.collection('designs').doc(targetId);
        batch.update(docRef, {
          is_deleted: false,
          deleted_at: null
        });
      }

      await batch.commit();
      return NextResponse.json({
        success: true,
        message: 'Restored successfully',
        count: targetIds.length
      });
    } else {
      return NextResponse.json({
        success: true,
        message: '[MOCK MODE] Restored successfully',
        count: targetIds.length
      });
    }
  } catch (error: any) {
    console.error('Error restoring design:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
