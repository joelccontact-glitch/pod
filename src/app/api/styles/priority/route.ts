import { db } from '@/lib/firebase-admin';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { id, is_priority } = await req.json();

    if (!id) {
      return NextResponse.json({ success: false, error: 'Style ID is required' }, { status: 400 });
    }

    if (!process.env.FIREBASE_PROJECT_ID) {
      return NextResponse.json({ success: false, error: 'Firebase is not configured' }, { status: 500 });
    }

    // If we are setting this one to true, we must set all existing priority styles to false
    if (is_priority) {
      const existingPriorities = await db.collection('styles').where('is_priority', '==', true).get();
      
      const batch = db.batch();
      existingPriorities.forEach((doc) => {
        if (doc.id !== id) {
          batch.update(doc.ref, { is_priority: false });
        }
      });
      
      // Update the target style
      const styleRef = db.collection('styles').doc(id);
      batch.update(styleRef, { is_priority: true });
      
      await batch.commit();
    } else {
      // Just unsetting it
      const styleRef = db.collection('styles').doc(id);
      await styleRef.update({ is_priority: false });
    }

    return NextResponse.json({ success: true, data: { id, is_priority } });
  } catch (error: any) {
    console.error('Error updating style priority:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
