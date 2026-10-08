import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

// In-memory cache for high-frequency image requests (saves thousands of Firestore reads!)
const inMemoryImageCache = new Map<string, { buffer: Buffer; mimeType: string }>();
const MAX_CACHE_ITEMS = 300;

export function clearImageCache(id?: string) {
  if (id) {
    inMemoryImageCache.delete(id);
  } else {
    inMemoryImageCache.clear();
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return new NextResponse('Missing id', { status: 400 });

    // 1. Check in-memory cache first (0 Firestore reads!)
    const cached = inMemoryImageCache.get(id);
    if (cached) {
      return new NextResponse(new Uint8Array(cached.buffer), {
        headers: {
          'Content-Type': cached.mimeType,
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=604800, stale-while-revalidate=86400',
        },
      });
    }

    if (!process.env.FIREBASE_PROJECT_ID) {
      return NextResponse.redirect('https://placehold.co/800x800?text=No+Firebase');
    }

    // 2. Fetch from Firestore only if not cached
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
          const buffer = Buffer.from(arrayBuf);

          if (inMemoryImageCache.size >= MAX_CACHE_ITEMS) {
            const firstKey = inMemoryImageCache.keys().next().value;
            if (firstKey) inMemoryImageCache.delete(firstKey);
          }
          inMemoryImageCache.set(id, { buffer, mimeType: contentType });

          return new NextResponse(new Uint8Array(buffer), {
            headers: {
              'Content-Type': contentType,
              'Access-Control-Allow-Origin': '*',
              'Cache-Control': 'public, max-age=604800, stale-while-revalidate=86400',
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

    // Store in RAM cache for instant repeat views
    if (inMemoryImageCache.size >= MAX_CACHE_ITEMS) {
      const firstKey = inMemoryImageCache.keys().next().value;
      if (firstKey) inMemoryImageCache.delete(firstKey);
    }
    inMemoryImageCache.set(id, { buffer, mimeType });

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': mimeType,
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=604800, stale-while-revalidate=86400',
      },
    });
  } catch (error: any) {
    console.error('Error fetching image:', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
