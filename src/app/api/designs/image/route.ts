import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

    if (!imageUrl) {
      return NextResponse.redirect('https://placehold.co/800x800?text=No+Image');
    }

    if (!imageUrl.startsWith('data:image/')) {
      // If it's a regular URL, try fetching to provide CORS headers or fallback to redirect
      try {
        const fetchRes = await fetch(imageUrl);
        if (fetchRes.ok) {
          const contentType = fetchRes.headers.get('content-type') || 'image/png';
          const arrayBuf = await fetchRes.arrayBuffer();
          return new NextResponse(Buffer.from(arrayBuf), {
            headers: {
              'Content-Type': contentType,
              'Access-Control-Allow-Origin': '*',
              'Cache-Control': 'public, max-age=86400',
            },
          });
        }
      } catch (e) {
        // Fallback to redirect
      }
      return NextResponse.redirect(imageUrl);
    }

    // Extract base64 and mime type
    const matches = imageUrl.match(/^data:(image\/\w+);base64,(.*)$/);
    if (!matches) return new NextResponse('Invalid image data', { status: 500 });

    const mimeType = matches[1];
    const buffer = Buffer.from(matches[2], 'base64');

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': mimeType,
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Error fetching image:', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
