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
    const v = searchParams.get('v');
    const nocache = searchParams.get('nocache') === 'true' || searchParams.has('_t');
    if (!id) return new NextResponse('Missing id', { status: 400 });

    const cacheKey = v ? `${id}_${v}` : id;

    // 1. Check in-memory cache first (0 Firestore reads!)
    if (!nocache) {
      const cached = inMemoryImageCache.get(cacheKey);
      if (cached) {
        return new NextResponse(new Uint8Array(cached.buffer), {
          headers: {
            'Content-Type': cached.mimeType,
            'Content-Length': cached.buffer.length.toString(),
            'Content-Disposition': 'inline; filename="sticker-cover.jpg"',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': v ? 'public, max-age=31536000, immutable' : 'public, max-age=3600, stale-while-revalidate=86400',
          },
        });
      }
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
          inMemoryImageCache.set(cacheKey, { buffer, mimeType: contentType });

          return new NextResponse(new Uint8Array(buffer), {
            headers: {
              'Content-Type': contentType,
              'Content-Length': buffer.length.toString(),
              'Content-Disposition': 'inline; filename="sticker-cover.jpg"',
              'Access-Control-Allow-Origin': '*',
              'Cache-Control': nocache ? 'no-store, no-cache, must-revalidate' : (v ? 'public, max-age=31536000, immutable' : 'public, max-age=3600, stale-while-revalidate=86400'),
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
    inMemoryImageCache.set(cacheKey, { buffer, mimeType });

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': mimeType,
        'Content-Length': buffer.length.toString(),
        'Content-Disposition': 'inline; filename="sticker-cover.jpg"',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': nocache ? 'no-store, no-cache, must-revalidate' : (v ? 'public, max-age=31536000, immutable' : 'public, max-age=3600, stale-while-revalidate=86400'),
      },
    });
  } catch (error: any) {
    console.error('Error fetching image:', error);
    if (error?.message?.includes('RESOURCE_EXHAUSTED') || error?.message?.includes('Quota exceeded')) {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
        <rect width="600" height="600" fill="#FFFBEB" stroke="#FDE68A" stroke-width="4" rx="20"/>
        <text x="50%" y="36%" text-anchor="middle" font-size="52">⏳</text>
        <text x="50%" y="46%" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="bold" fill="#92400E">Firebase DB 1일 무료 한도 소진</text>
        <text x="50%" y="54%" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="15" fill="#B45309">오후 4시 정각 자동 리셋되거나</text>
        <text x="50%" y="60%" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="15" font-weight="bold" fill="#D97706">Blaze(종량제) 전환 시 즉시 복구됩니다.</text>
      </svg>`;
      return new NextResponse(svg, {
        status: 200,
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      });
    }
    return new NextResponse('Internal error', { status: 500 });
  }
}
