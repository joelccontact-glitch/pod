import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export async function GET(req: Request) {
  try {
    if (process.env.FIREBASE_PROJECT_ID) {
      const snapshot = await db
        .collection('designs')
        .where('is_deleted', '==', true)
        .get();

      const now = Date.now();
      const FIFTEEN_DAYS_MS = 15 * 24 * 60 * 60 * 1000;
      
      const activeTrashItems: any[] = [];
      const expiredDocRefs: any[] = [];

      snapshot.docs.forEach((doc: any) => {
        const data = doc.data();
        const deletedAtMs = data.deleted_at ? new Date(data.deleted_at).getTime() : now;
        const diffMs = now - deletedAtMs;

        if (diffMs > FIFTEEN_DAYS_MS) {
          // Over 15 days old -> Auto permanent delete
          expiredDocRefs.push(doc.ref);
        } else {
          const daysLeft = Math.max(0, 15 - Math.floor(diffMs / (24 * 60 * 60 * 1000)));
          activeTrashItems.push({
            id: doc.id,
            ...data,
            daysLeft
          });
        }
      });

      // Execute auto cleanup for expired docs (>15 days)
      if (expiredDocRefs.length > 0) {
        const batch = db.batch();
        expiredDocRefs.forEach((ref: any) => batch.delete(ref));
        await batch.commit();
        console.log(`Auto-cleaned ${expiredDocRefs.length} expired trash items (>15 days).`);
      }

      // Sort by deleted_at descending
      activeTrashItems.sort((a, b) => {
        const dateA = a.deleted_at ? new Date(a.deleted_at).getTime() : 0;
        const dateB = b.deleted_at ? new Date(b.deleted_at).getTime() : 0;
        return dateB - dateA;
      });

      return NextResponse.json({
        success: true,
        data: activeTrashItems,
        count: activeTrashItems.length,
        cleanedCount: expiredDocRefs.length
      });
    } else {
      // Mock mode
      return NextResponse.json({
        success: true,
        data: [],
        count: 0
      });
    }
  } catch (error: any) {
    console.error('Error fetching trash designs:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
