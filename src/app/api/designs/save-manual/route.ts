import { db } from '@/lib/firebase-admin';
import crypto from 'crypto';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { originalId, imageBase64, topic, originalPrompt, tags } = await req.json();

    if (!imageBase64 || !topic) {
      return NextResponse.json({ success: false, error: 'Image and topic are required' }, { status: 400 });
    }

    const newHash = crypto.createHash('md5').update(imageBase64 + Date.now().toString()).digest('hex');

    const newDesignData = {
      prompt_hash: newHash,
      topic: topic,
      prompt: originalPrompt || '',
      title: `[Manual Edit] ${topic} T-Shirt`,
      tags: tags || ["manual-edit"],
      image_url: imageBase64,
      created_at: new Date().toISOString(),
      status: 'success',
      modified_from: originalId || null,
      feedback_applied: 'Manual Canvas Edit (Eraser)'
    };

    if (process.env.FIREBASE_PROJECT_ID) {
      const designRef = db.collection('designs').doc(newHash);
      await designRef.set(newDesignData);
    }

    return NextResponse.json({ 
      success: true, 
      data: { id: newHash, ...newDesignData } 
    });

  } catch (error: any) {
    console.error('Error saving manual edit:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
