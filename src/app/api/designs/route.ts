import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Default statistics snapshot (Updated incrementally on create/delete, 0 Firestore reads on gallery load!)
const DEFAULT_STATS = {
  total: 1542,
  podCount: 15,
  stickerCount: 480,
  stickerSubCounts: {
    all: 480,
    axolotl: 20,
    deepsea: 20,
    dessert: 20,
    socialbattery: 20,
    hangul: 20,
    terrarium: 20,
    vivarium: 20,
    saltaquarium: 20,
    freshaquarium: 20,
    booktok: 20,
    christmas: 40,
    halloween: 40,
    thanksgiving: 40,
    valentines: 40,
    stpatrick: 40,
    easter: 40,
    mothersday: 40,
    fathersday: 40,
    july4th: 40,
    backtoschool: 40,
    newyear: 40
  },
  updated_at: new Date().toISOString()
};

// In-memory cache for ultra-fast navigation (< 2ms)
let inMemoryCoversCache: { data: any[]; timestamp: number } | null = null;
let inMemoryStatsCache: { data: typeof DEFAULT_STATS; timestamp: number } | null = null;
const CACHE_TTL_MS = 300000; // 5 minutes in-memory cache

// Load cached stats (Max 1 Firestore read or 0 reads if in-memory)
async function getCachedStats(): Promise<typeof DEFAULT_STATS> {
  const now = Date.now();
  if (inMemoryStatsCache && (now - inMemoryStatsCache.timestamp < CACHE_TTL_MS)) {
    return inMemoryStatsCache.data;
  }
  try {
    const statsDoc = await db.collection('_system_cache').doc('stats').get();
    if (statsDoc.exists) {
      const data = statsDoc.data() as typeof DEFAULT_STATS;
      inMemoryStatsCache = { data, timestamp: now };
      return data;
    }
  } catch (e) {
    console.error('Failed to load stats cache:', e);
  }
  return DEFAULT_STATS;
}

// In-place cache updates called from save/delete/update routes
export function updateCachedDesign(id: string, updates: any) {
  if (inMemoryCoversCache) {
    const idx = inMemoryCoversCache.data.findIndex(d => d.id === id);
    if (idx !== -1) {
      inMemoryCoversCache.data[idx] = { ...inMemoryCoversCache.data[idx], ...updates };
    }
  }
}

export function addCachedDesign(item: { id: string; data: any }) {
  if (inMemoryCoversCache && item?.data?.is_cover) {
    inMemoryCoversCache.data.unshift({ id: item.id, ...item.data });
  }
}

export function removeCachedDesign(id: string, permanent: boolean = false) {
  if (inMemoryCoversCache) {
    inMemoryCoversCache.data = inMemoryCoversCache.data.filter(d => d.id !== id);
  }
}

export function clearDesignsCache() {
  inMemoryCoversCache = null;
  inMemoryStatsCache = null;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limitNum = parseInt(searchParams.get('limit') || '12', 10);
    const offsetNum = (page - 1) * limitNum;

    if (!process.env.FIREBASE_PROJECT_ID) {
      return NextResponse.json({
        success: true,
        data: [],
        total: 0,
        page: 1,
        totalPages: 1
      });
    }

    const filterType = searchParams.get('type') || 'all'; // 'pod' | 'sticker' | 'all'
    const subType = searchParams.get('subType') || 'all';
    const searchQuery = (searchParams.get('search') || searchParams.get('q') || '').trim().toLowerCase();
    const onlyCovers = searchParams.get('onlyCovers') === 'true';
    const nocache = searchParams.get('nocache') === 'true';

    const now = Date.now();
    let actualDbReads = 0;
    let dataSource = 'firestore_paged';

    // 1. Get cached statistics (0 reads from memory, 1 read on cold-start)
    const stats = await getCachedStats();

    // =========================================================================
    // CASE A: MASTER COVERS REQUEST (onlyCovers === true)
    // There are only ~13-20 master covers in the entire DB!
    // Never full-scan 1,542 documents to find 13 covers!
    // =========================================================================
    if (onlyCovers && filterType === 'sticker') {
      let covers: any[] = [];

      // 1. Check in-memory covers cache (0 Firestore reads!)
      if (!nocache && inMemoryCoversCache && (now - inMemoryCoversCache.timestamp < CACHE_TTL_MS)) {
        covers = inMemoryCoversCache.data;
        dataSource = 'memory';
        actualDbReads = 0;
      } else {
        // 2. Read from _system_cache/covers (Exactly 1 Firestore read!)
        try {
          const coversCacheDoc = await db.collection('_system_cache').doc('covers').get();
          actualDbReads += 1;
          if (coversCacheDoc.exists && Array.isArray(coversCacheDoc.data()?.items) && coversCacheDoc.data()!.items.length > 0) {
            covers = coversCacheDoc.data()!.items;
            dataSource = 'covers_cache';
          }
        } catch (e: any) {
          console.error('Failed to read covers cache:', e?.message);
        }

        // 3. Fallback: Query where is_cover == true (Exactly 13 reads, NEVER full scan!)
        if (covers.length === 0) {
          try {
            const snap = await db.collection('designs')
              .where('is_cover', '==', true)
              .get();
            actualDbReads += snap.docs.length;
            covers = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
            dataSource = 'firestore_covers';

            // Cache in _system_cache/covers for future 0-1 read performance
            if (covers.length > 0) {
              db.collection('_system_cache').doc('covers').set({
                items: covers,
                updated_at: new Date().toISOString()
              }).catch(() => {});
            }
          } catch (e: any) {
            console.error('Failed to query is_cover docs:', e?.message);
          }
        }

        inMemoryCoversCache = { data: covers, timestamp: now };
      }

      // 4. Sort covers strictly by created_at descending (Newest first!)
      covers.sort((a, b) => {
        const timeA = new Date(a.created_at || a.updated_at || 0).getTime();
        const timeB = new Date(b.created_at || b.updated_at || 0).getTime();
        return timeB - timeA;
      });

      // Filter by search query if present
      let filteredCovers = covers;
      if (searchQuery) {
        filteredCovers = covers.filter(item => {
          const text = `${item.title || ''} ${item.topic || ''} ${item.prompt || ''}`.toLowerCase();
          return text.includes(searchQuery);
        });
      }

      // Apply pagination on covers (13 items, 12 per page)
      const totalCovers = filteredCovers.length;
      const paginatedCovers = filteredCovers.slice(offsetNum, offsetNum + limitNum).map(d => {
        const versionTs = d.updated_at ? new Date(d.updated_at).getTime() : (d.created_at ? new Date(d.created_at).getTime() : 0);
        return {
          ...d,
          image_url: `/api/designs/image?id=${d.id}&v=${versionTs}`
        };
      });

      const response = NextResponse.json({
        success: true,
        data: paginatedCovers,
        total: totalCovers,
        podCount: stats.podCount,
        stickerCount: stats.stickerCount,
        stickerSubCounts: stats.stickerSubCounts,
        page,
        totalPages: Math.ceil(totalCovers / limitNum) || 1,
        audit: {
          dbReads: actualDbReads,
          source: dataSource,
          cacheAgeSeconds: Math.round((now - (inMemoryCoversCache?.timestamp || now)) / 1000)
        }
      });
      response.headers.set('X-Firestore-Reads', actualDbReads.toString());
      response.headers.set('X-Data-Source', dataSource);
      return response;
    }

    // =========================================================================
    // CASE B: SPECIFIC SUB-THEME STICKERS (e.g. subType === 'valentines')
    // Directly query only the 20-40 stickers of that sub-theme!
    // Strictly limited to limitNum (12 items) or max 45 items!
    // =========================================================================
    if (filterType === 'sticker' && subType && subType !== 'all') {
      let query = db.collection('designs')
        .where('sticker_sub', '==', subType)
        .limit(limitNum)
        .offset(offsetNum);

      let snap = await query.get();
      actualDbReads = snap.docs.length;

      // If sticker_sub direct query returned empty, query by matching stickerPresetId prefix
      if (snap.empty) {
        try {
          const prefixQuery = await db.collection('designs')
            .where('stickerPresetId', '>=', subType)
            .where('stickerPresetId', '<=', subType + '\uf8ff')
            .limit(limitNum)
            .get();
          if (!prefixQuery.empty) {
            snap = prefixQuery;
            actualDbReads += snap.docs.length;
          }
        } catch {
          // If compound query fails, keep snap empty - NEVER return unrelated themes
        }
      }

      const items = snap.docs.map((d: any) => {
        const data = d.data();
        const versionTs = data.updated_at ? new Date(data.updated_at).getTime() : (data.created_at ? new Date(data.created_at).getTime() : 0);
        return {
          id: d.id,
          ...data,
          image_url: `/api/designs/image?id=${d.id}&v=${versionTs}`
        };
      }).filter((d: any) => !d.is_deleted);

      // Sort items strictly by created_at descending (Newest first!)
      items.sort((a: any, b: any) => {
        const timeA = new Date(a.created_at || a.updated_at || 0).getTime();
        const timeB = new Date(b.created_at || b.updated_at || 0).getTime();
        return timeB - timeA;
      });

      const subTotal = stats.stickerSubCounts[subType as keyof typeof stats.stickerSubCounts] || items.length;

      const response = NextResponse.json({
        success: true,
        data: items.slice(0, limitNum),
        total: subTotal,
        podCount: stats.podCount,
        stickerCount: stats.stickerCount,
        stickerSubCounts: stats.stickerSubCounts,
        page,
        totalPages: Math.ceil(subTotal / limitNum) || 1,
        audit: {
          dbReads: actualDbReads,
          source: 'firestore_sub_theme',
          cacheAgeSeconds: 0
        }
      });
      response.headers.set('X-Firestore-Reads', actualDbReads.toString());
      response.headers.set('X-Data-Source', 'firestore_sub_theme');
      return response;
    }

    // =========================================================================
    // CASE C: POD APPAREL PRODUCTS (filterType === 'pod')
    // There are only ~52 POD products in DB. Query single field without composite index,
    // then sort and paginate in-memory to prevent FAILED_PRECONDITION index errors!
    // =========================================================================
    if (filterType === 'pod') {
      const podSnap = await db.collection('designs').where('design_type', '==', 'pod').get();
      actualDbReads = podSnap.docs.length;
      let podItems = podSnap.docs.map((d: any) => {
        const data = d.data();
        const versionTs = data.updated_at ? new Date(data.updated_at).getTime() : (data.created_at ? new Date(data.created_at).getTime() : 0);
        return {
          id: d.id,
          ...data,
          image_url: `/api/designs/image?id=${d.id}&v=${versionTs}`
        };
      }).filter((d: any) => !d.is_deleted);

      podItems.sort((a: any, b: any) => {
        const timeA = new Date(a.created_at || a.updated_at || 0).getTime();
        const timeB = new Date(b.created_at || b.updated_at || 0).getTime();
        return timeB - timeA;
      });

      if (searchQuery) {
        podItems = podItems.filter((item: any) => {
          const text = `${item.title || ''} ${item.topic || ''} ${item.prompt || ''}`.toLowerCase();
          return text.includes(searchQuery);
        });
      }

      const totalPod = podItems.length;
      const paginatedPod = podItems.slice(offsetNum, offsetNum + limitNum);

      const response = NextResponse.json({
        success: true,
        data: paginatedPod,
        total: totalPod,
        podCount: stats.podCount || totalPod,
        stickerCount: stats.stickerCount,
        stickerSubCounts: stats.stickerSubCounts,
        page,
        totalPages: Math.ceil(totalPod / limitNum) || 1,
        audit: {
          dbReads: actualDbReads,
          source: 'firestore_pod',
          cacheAgeSeconds: 0
        }
      });
      response.headers.set('X-Firestore-Reads', actualDbReads.toString());
      response.headers.set('X-Data-Source', 'firestore_pod');
      return response;
    }

    // =========================================================================
    // CASE D: GENERAL PAGINATED DESIGNS (Strict limit 12 items!)
    // Absolutely NO full-collection scan! Read ONLY 12 documents from DB!
    // =========================================================================
    let baseQuery = db.collection('designs').orderBy('created_at', 'desc');

    const paginatedSnap = await baseQuery.limit(limitNum).offset(offsetNum).get();
    actualDbReads = paginatedSnap.docs.length;

    const items = paginatedSnap.docs.map((d: any) => {
      const data = d.data();
      const versionTs = data.updated_at ? new Date(data.updated_at).getTime() : (data.created_at ? new Date(data.created_at).getTime() : 0);
      return {
        id: d.id,
        ...data,
        image_url: `/api/designs/image?id=${d.id}&v=${versionTs}`
      };
    }).filter((d: any) => !d.is_deleted);

    const totalCount = filterType === 'pod' ? stats.podCount : (filterType === 'sticker' ? stats.stickerCount : stats.total);

    const response = NextResponse.json({
      success: true,
      data: items,
      total: totalCount,
      podCount: stats.podCount,
      stickerCount: stats.stickerCount,
      stickerSubCounts: stats.stickerSubCounts,
      page,
      totalPages: Math.ceil(totalCount / limitNum) || 1,
      audit: {
        dbReads: actualDbReads,
        source: 'firestore_paged',
        cacheAgeSeconds: 0
      }
    });

    response.headers.set('X-Firestore-Reads', actualDbReads.toString());
    response.headers.set('X-Data-Source', 'firestore_paged');
    return response;

  } catch (error: any) {
    console.error('Error fetching designs:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
