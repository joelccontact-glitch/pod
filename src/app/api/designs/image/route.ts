import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return new NextResponse('Missing id', { status: 400 });

    if (!process.env.FIREBASE_PROJECT_ID) {
       return NextResponse.redirect('https://placehold.co/800x800?text=No+Firebase');
    }

    const doc = await db.collection('designs').doc(id).get();
    if (!doc.exists) return new NextResponse('Not found', { status: 404 });

    const data = doc.data();
    const imageUrl = data?.image_url;

    if (!imageUrl || !imageUrl.startsWith('data:image/')) {
      // If it's a regular URL, just redirect to it
      return NextResponse.redirect(imageUrl || 'https://placehold.co/800x800?text=No+Image');
    }

    // Extract base64 and mime type
    const matches = imageUrl.match(/^data:(image\/\w+);base64,(.*)$/);
    if (!matches) return new NextResponse('Invalid image data', { status: 500 });

    const mimeType = matches[1];
    const buffer = Buffer.from(matches[2], 'base64');

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Error fetching image:', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
