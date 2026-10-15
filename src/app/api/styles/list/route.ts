import { db } from '@/lib/firebase-admin';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const STYLES_CACHE_FILE = path.join(os.tmpdir(), 'mypod-styles-snapshot.json');
let cachedStyles: any[] | null = null;
let lastStylesCacheTime = 0;
const STYLES_CACHE_TTL = 600000; // 10 minutes cache

function saveStylesToDisk(styles: any[]) {
  try {
    fs.writeFile(STYLES_CACHE_FILE, JSON.stringify(styles), 'utf-8', (err) => {
      if (err) console.error('Failed to write styles snapshot to disk:', err);
    });
  } catch (e) {
    console.error('saveStylesToDisk error:', e);
  }
}

function loadStylesFromDisk(): any[] | null {
  try {
    if (fs.existsSync(STYLES_CACHE_FILE)) {
      const content = fs.readFileSync(STYLES_CACHE_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('loadStylesFromDisk error:', e);
  }
  return null;
}

export function clearStylesCache() {
  cachedStyles = null;
  lastStylesCacheTime = 0;
}

export async function GET(req: Request) {
  try {
    if (!process.env.FIREBASE_PROJECT_ID) {
      return NextResponse.json({ success: false, error: 'Firebase not configured' }, { status: 500 });
    }

    const { searchParams } = new URL(req.url);
    const nocache = searchParams.get('nocache') === 'true';
    const now = Date.now();

    if (!nocache && cachedStyles && (now - lastStylesCacheTime < STYLES_CACHE_TTL)) {
      const res = NextResponse.json({ success: true, data: cachedStyles });
      res.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
      return res;
    }

    try {
      const snapshot = await db.collection('styles').orderBy('created_at', 'desc').get();
      
      const styles = snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data()
      }));

      cachedStyles = styles;
      lastStylesCacheTime = now;
      saveStylesToDisk(styles);

      const res = NextResponse.json({ success: true, data: styles });
      res.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
      return res;
    } catch (dbErr: any) {
      console.error('Firestore error in /api/styles/list:', dbErr?.message);
      if (cachedStyles && cachedStyles.length > 0) {
        console.warn('[Styles Quota Fallback] Serving from in-memory cache');
        return NextResponse.json({ success: true, data: cachedStyles });
      }
      const diskStyles = loadStylesFromDisk();
      if (diskStyles && diskStyles.length > 0) {
        console.warn(`[Styles Quota Fallback] Recovered ${diskStyles.length} styles from disk`);
        cachedStyles = diskStyles;
        lastStylesCacheTime = now;
        return NextResponse.json({ success: true, data: diskStyles });
      }
      throw dbErr;
    }
  } catch (error: any) {
    console.error('Error fetching styles:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
