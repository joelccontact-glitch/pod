import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { clearDesignsCache } from '../route';
import { clearImageCache } from '../image/route';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, ids, permanent } = body;

    const targetIds: string[] = ids || (id ? [id] : []);

    if (targetIds.length === 0) {
      return NextResponse.json({ success: false, error: 'ID or IDs array is required' }, { status: 400 });
    }

    if (process.env.FIREBASE_PROJECT_ID) {
      const batch = db.batch();
      const now = new Date().toISOString();

      for (const targetId of targetIds) {
        const docRef = db.collection('designs').doc(targetId);
        if (permanent) {
          batch.delete(docRef);
        } else {
          batch.update(docRef, {
            is_deleted: true,
            deleted_at: now
          });
        }
      }

      await batch.commit();
      clearDesignsCache();
      targetIds.forEach(tId => clearImageCache(tId));

      return NextResponse.json({
        success: true,
        message: permanent ? 'Permanently deleted successfully' : 'Moved to trash successfully',
        count: targetIds.length
      });
    } else {
      return NextResponse.json({
        success: true,
        message: '[MOCK MODE] Operation completed',
        count: targetIds.length
      });
    }
  } catch (error: any) {
    console.error('Error deleting design:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
