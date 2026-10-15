'use client';
import { useState, useEffect, useRef } from 'react';
import { useSession, signOut } from "next-auth/react";
import { MOCKUP_TEMPLATES, getMockupsForMode } from '@/lib/mockups';
import { processTransparentPNG } from '@/lib/image-processor';
import { getActiveUpcomingSeasons, SEASONAL_HOLIDAYS, ActiveSeasonInfo } from '@/lib/seasonal-trends';
import {
  TERRARIUM_SERIES,
  PYGMY_PUMPKIN_SERIES,
  TERRARIUM_20_SERIES,
  VIVARIUM_20_SERIES,
  SALT_AQUARIUM_20_SERIES,
  FRESH_AQUARIUM_20_SERIES,
  TERRARIUM_STANDALONE_20_SERIES,
  VIVARIUM_STANDALONE_20_SERIES,
  SALT_AQUARIUM_STANDALONE_20_SERIES,
  FRESH_AQUARIUM_STANDALONE_20_SERIES,
  CHRISTMAS_20_SERIES,
  CHRISTMAS_STANDALONE_20_SERIES,
  HALLOWEEN_20_SERIES,
  HALLOWEEN_STANDALONE_20_SERIES,
  THANKSGIVING_20_SERIES,
  THANKSGIVING_STANDALONE_20_SERIES,
  BOOKTOK_20_SERIES,
  DESSERT_20_SERIES,
  SOCIAL_BATTERY_20_SERIES,
  HANGUL_20_SERIES,
  SEASONAL_RECOMMENDATIONS,
  getDynamicSeasonalStickerRecommendations,
  getSeasonalPackPresets,
  SeasonalRecommendation,
  StickerPreset,
  buildStickerPrompt,
  formatCoverTitleWithCount,
  formatCoverPromptWithCount,
} from '@/lib/sticker-prompts';
import JSZip from 'jszip';
import { createCompositeMasterCover } from '@/lib/master-cover-builder';
import { generateA4StickerSheet, generateA4StickerSheets, generateA4StickerSheetsPair } from '@/lib/sticker-sheet-builder';
import { extractStandaloneStickerFromTank } from '@/lib/standalone-extractor';
import { createVesselStickerFromStandalone } from '@/lib/vessel-housing-builder';
import { generateEtsySeo } from '@/lib/etsy-seo-generator';
import { generateAllLifestyleMockups, LifestyleMockupResult } from '@/lib/lifestyle-mockup-builder';

// Client-side cache for high-frequency design pool queries to eliminate redundant Firestore reads (99%+ reduction)
let clientPoolCache: { data: any[]; timestamp: number } | null = null;
const CLIENT_POOL_TTL_MS = 600000; // 10 minutes cache
const SESSION_CACHE_KEY = 'mypod_stickers_pool_cache_v3';

const getCachedStickersPool = async (forceRefresh = false): Promise<any[]> => {
  const now = Date.now();

  // 1. Check in-memory variable
  if (!forceRefresh && clientPoolCache && (now - clientPoolCache.timestamp < CLIENT_POOL_TTL_MS)) {
    return clientPoolCache.data;
  }

  // 2. Check sessionStorage if memory cache was lost (e.g. page navigation)
  if (!forceRefresh && typeof window !== 'undefined') {
    try {
      const stored = sessionStorage.getItem(SESSION_CACHE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && Array.isArray(parsed.data) && (now - parsed.timestamp < CLIENT_POOL_TTL_MS)) {
          clientPoolCache = parsed;
          return parsed.data;
        }
      }
    } catch {}
  }

  // If forceRefresh requested but last fetch was within 15 seconds, avoid hammering Firestore
  if (forceRefresh && clientPoolCache && (now - clientPoolCache.timestamp < 15000)) {
    return clientPoolCache.data;
  }

  try {
    const res = await fetch(`/api/designs?limit=1000&type=sticker${forceRefresh ? `&nocache=true&_t=${now}` : ''}`);
    const data = await res.json();
    if (data.success && Array.isArray(data.data)) {
      clientPoolCache = { data: data.data, timestamp: now };
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.setItem(SESSION_CACHE_KEY, JSON.stringify(clientPoolCache));
        } catch {}
      }
      return data.data;
    }
  } catch (e) {
    console.error('Failed to fetch stickers pool:', e);
    if (clientPoolCache) return clientPoolCache.data;
  }
  return clientPoolCache?.data || [];
};

// Client-side cache for gallery page queries (prevents re-fetching when paginating or switching back and forth)
const galleryPageCache = new Map<string, { data: any; timestamp: number }>();
const GALLERY_CACHE_TTL_MS = 300000; // 5 minutes client cache

const clearGalleryPageCache = () => {
  galleryPageCache.clear();
};

const invalidateClientPoolCache = () => {
  clientPoolCache = null;
  clearGalleryPageCache();
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.removeItem(SESSION_CACHE_KEY);
    } catch {}
  }
};

export const isCoverDesign = (d: any): boolean => {
  if (!d) return false;
  if (d.is_cover === true) return true;

  const id = (d.id || '').toLowerCase();
  const presetId = (d.stickerPresetId || '').toLowerCase();

  // 1. Strict ID & presetId check (must end with -cover or contain -pack-cover / master-cover)
  if (
    presetId.endsWith('-cover') ||
    presetId.includes('-pack-cover') ||
    id.endsWith('-cover') ||
    id.includes('-pack-cover') ||
    presetId.includes('master-cover') ||
    id.includes('master-cover')
  ) {
    return true;
  }

  // 2. Strict Title / Topic check (only cover designs have these specific title markers)
  const title = (d.title || d.topic || '').toLowerCase();
  if (
    title.includes('마스터 썸네일') ||
    title.includes('마스터 표지') ||
    title.includes('대표 커버') ||
    title.includes('master cover') ||
    title.includes('bundle cover') ||
    title.includes('pack cover')
  ) {
    return true;
  }

  // 3. Prompt check (strictly check for master cover specific multi-word phrases, NEVER isolated words or fragments like '-cover'!)
  const prompt = (d.prompt || '').toLowerCase();
  if (
    prompt.includes('bundle master cover') ||
    prompt.includes('master cover graphic') ||
    prompt.includes('sticker bundle master') ||
    prompt.includes('etsy digital sticker bundle')
  ) {
    return true;
  }

  return false;
};


const getDesignCategoryKey = (d: any): string => {
  if (!d) return 'other';
  const sub = (d.sticker_sub || '').toLowerCase();
  if (sub && sub !== 'other') return sub;

  const presetId = (d.stickerPresetId || d.id || '').toLowerCase();
  if (presetId.includes('dessert')) return 'dessert';
  if (presetId.includes('socialbattery') || presetId.includes('social-battery')) return 'socialbattery';
  if (presetId.includes('hangul')) return 'hangul';
  if (presetId.includes('christmas')) return 'christmas';
  if (presetId.includes('halloween')) return 'halloween';
  if (presetId.includes('thanksgiving')) return 'thanksgiving';
  if (presetId.includes('valentines') || presetId.includes('valentine')) return 'valentines';
  if (presetId.includes('stpatrick')) return 'stpatrick';
  if (presetId.includes('easter')) return 'easter';
  if (presetId.includes('mothersday')) return 'mothersday';
  if (presetId.includes('fathersday')) return 'fathersday';
  if (presetId.includes('july4th')) return 'july4th';
  if (presetId.includes('backtoschool')) return 'backtoschool';
  if (presetId.includes('newyear')) return 'newyear';
  if (presetId.includes('vivarium')) return 'vivarium';
  if (presetId.includes('saltaquarium') || presetId.includes('salt-aquarium')) return 'saltaquarium';
  if (presetId.includes('freshaquarium') || presetId.includes('fresh-aquarium')) return 'freshaquarium';
  if (presetId.includes('terrarium')) return 'terrarium';
  if (presetId.includes('booktok') || presetId.includes('reading')) return 'booktok';

  const title = (d.title || d.topic || '').toLowerCase();
  if (title.includes('디저트') || title.includes('베이커리') || title.includes('dessert') || title.includes('bakery')) return 'dessert';
  if (title.includes('사회적 배터리') || title.includes('내향인') || title.includes('social battery') || title.includes('introvert')) return 'socialbattery';
  if (title.includes('한글') || title.includes('k-감성') || title.includes('hangul') || title.includes('k-vibe')) return 'hangul';
  if (title.includes('크리스마스') || title.includes('스노우볼') || title.includes('christmas')) return 'christmas';
  if (title.includes('할로윈') || title.includes('halloween') || title.includes('스푸키')) return 'halloween';
  if (title.includes('추수감사절') || title.includes('thanksgiving') || title.includes('가을 수확') || title.includes('하베스트')) return 'thanksgiving';
  if (title.includes('발렌타인') || title.includes('valentine')) return 'valentines';
  if (title.includes('성 패트릭') || title.includes('st. patrick') || title.includes('stpatrick')) return 'stpatrick';
  if (title.includes('부활절') || title.includes('easter')) return 'easter';
  if (title.includes('마더스데이') || title.includes('mothersday') || title.includes('어버이')) return 'mothersday';
  if (title.includes('비바리움') || title.includes('vivarium')) return 'vivarium';
  if (title.includes('해수어항') || title.includes('saltaquarium') || title.includes('salt aquarium')) return 'saltaquarium';
  if (title.includes('열대어') || title.includes('freshaquarium') || title.includes('fresh aquarium')) return 'freshaquarium';
  if (title.includes('테라리움') || title.includes('terrarium')) return 'terrarium';
  if (title.includes('북톡') || title.includes('독서') || title.includes('booktok') || title.includes('book club') || title.includes('kindle')) return 'booktok';

  return 'other';
};

const getStickerSeriesTitle = (tab: string) => {
  if (tab.startsWith('dessert20')) return '🥞 미국 유행 디저트 & 베이커리 20종 스티커 팩';
  if (tab.startsWith('socialbattery20')) return '🔋 사회적 배터리 & 내향인 20종 스티커 팩';
  if (tab.startsWith('hangul20')) return '🇰🇷 K-감성 한글 & 아기 동물 20종 스티커 팩';
  if (tab.startsWith('booktok20')) return '📚 북톡 & 코지 리딩 20종 스티커 팩';
  if (tab.startsWith('terrarium20')) return tab.includes('standalone') ? '🪴 테라리움 단일 식물 20종 스티커 팩' : '🫙 테라리움 세트 완성 20종 스티커 팩';
  if (tab.startsWith('vivarium20')) return tab.includes('standalone') ? '🦎 비바리움 단일 동물 20종 스티커 팩' : '🦎 비바리움 세트 완성 20종 스티커 팩';
  if (tab.startsWith('saltaquarium20')) return tab.includes('standalone') ? '🐠 해수어 단일 어류 20종 스티커 팩' : '🪸 해수어항 세트 완성 20종 스티커 팩';
  if (tab.startsWith('freshaquarium20')) return tab.includes('standalone') ? '🐟 열대어 단일 어류 20종 스티커 팩' : '🐠 열대어어항 세트 완성 20종 스티커 팩';
  if (tab.startsWith('christmas20')) return tab.includes('standalone') ? '🎄 크리스마스 단일 오브젝트 20종 스티커 팩' : '🎄 크리스마스 윈터 스노우볼 20종 스티커 팩';
  if (tab.startsWith('halloween20')) return tab.includes('standalone') ? '🎃 할로윈 단일 오브젝트 20종 스티커 팩' : '🎃 할로윈 스푸키 큐트 20종 스티커 팩';
  if (tab.startsWith('thanksgiving20')) return tab.includes('standalone') ? '🦃 추수감사절 단일 오브젝트 20종 스티커 팩' : '🦃 추수감사절 코지 어텀 20종 스티커 팩';
  if (tab.startsWith('valentines20')) return tab.includes('standalone') ? '💖 발렌타인 단일 오브젝트 20종 스티커 팩' : '💖 발렌타인데이 핑크 러브 20종 스티커 팩';
  if (tab.startsWith('stpatrick20')) return tab.includes('standalone') ? '☘️ 성 패트릭 단일 오브젝트 20종 스티커 팩' : '☘️ 성 패트릭 럭키 클로버 20종 스티커 팩';
  if (tab.startsWith('easter20')) return tab.includes('standalone') ? '🌸 부활절 단일 오브젝트 20종 스티커 팩' : '🌸 부활절 파스텔 스프링 20종 스티커 팩';
  if (tab.startsWith('mothersday20')) return tab.includes('standalone') ? '💐 마더스데이 단일 오브젝트 20종 스티커 팩' : '💐 마더스데이 플로럴 티컵 20종 스티커 팩';
  return '📦 스티커 20종 스티커 팩';
};

const getPresetSeriesList = (tab: string): StickerPreset[] => {
  if (tab === 'dessert20') return DESSERT_20_SERIES;
  if (tab === 'socialbattery20') return SOCIAL_BATTERY_20_SERIES;
  if (tab === 'hangul20') return HANGUL_20_SERIES;
  if (tab === 'booktok20') return BOOKTOK_20_SERIES;
  if (tab === 'terrarium20') return TERRARIUM_20_SERIES;
  if (tab === 'terrarium20_standalone') return TERRARIUM_STANDALONE_20_SERIES;
  if (tab === 'vivarium20') return VIVARIUM_20_SERIES;
  if (tab === 'vivarium20_standalone') return VIVARIUM_STANDALONE_20_SERIES;
  if (tab === 'saltaquarium20') return SALT_AQUARIUM_20_SERIES;
  if (tab === 'saltaquarium20_standalone') return SALT_AQUARIUM_STANDALONE_20_SERIES;
  if (tab === 'freshaquarium20') return FRESH_AQUARIUM_20_SERIES;
  if (tab === 'freshaquarium20_standalone') return FRESH_AQUARIUM_STANDALONE_20_SERIES;
  if (tab === 'christmas20') return CHRISTMAS_20_SERIES;
  if (tab === 'christmas20_standalone') return CHRISTMAS_STANDALONE_20_SERIES;
  if (tab === 'halloween20') return HALLOWEEN_20_SERIES;
  if (tab === 'halloween20_standalone') return HALLOWEEN_STANDALONE_20_SERIES;
  if (tab === 'thanksgiving20') return THANKSGIVING_20_SERIES;
  if (tab === 'thanksgiving20_standalone') return THANKSGIVING_STANDALONE_20_SERIES;

  const baseSeasonId = tab.replace('20_standalone', '').replace('20', '');
  const pack = getSeasonalPackPresets(baseSeasonId);
  return tab.includes('standalone') ? pack.standaloneSeries : pack.vesselSeries;
};

export const isStickerStandalone = (item: any): boolean => {
  if (!item) return false;
  const title = (item.title || item.topic || '').toLowerCase();
  const presetId = (item.stickerPresetId || item.id || '').toLowerCase();
  const prompt = (item.prompt || '').toLowerCase();
  return (
    presetId.includes('standalone') ||
    title.includes('단일') ||
    title.includes('단독') ||
    title.includes('낱개') ||
    prompt.includes('standalone') ||
    prompt.includes('pure standalone') ||
    prompt.includes('strict no glass')
  );
};

export interface PackPresetsInfo {
  themeKey: string;
  isSingleSeries20Theme: boolean;
  vesselSeries: StickerPreset[] | null;
  standaloneSeries: StickerPreset[] | null;
}

export const getPackPresetsInfo = (coverDesign: any): PackPresetsInfo => {
  if (!coverDesign) {
    return { themeKey: 'other', isSingleSeries20Theme: false, vesselSeries: null, standaloneSeries: null };
  }
  const presetId = (coverDesign.stickerPresetId || coverDesign.id || '').toLowerCase();
  const sub = (coverDesign.sticker_sub || '').toLowerCase();
  const title = (coverDesign.title || coverDesign.topic || '').toLowerCase();

  // 1. Single 20 themes (strictly 20-pack only, never 40-pack)
  if (presetId.includes('dessert') || sub === 'dessert' || title.includes('디저트')) {
    return { themeKey: 'dessert', isSingleSeries20Theme: true, vesselSeries: DESSERT_20_SERIES, standaloneSeries: null };
  }
  if (presetId.includes('socialbattery') || presetId.includes('social-battery') || sub === 'socialbattery' || title.includes('사회적 배터리')) {
    return { themeKey: 'socialbattery', isSingleSeries20Theme: true, vesselSeries: SOCIAL_BATTERY_20_SERIES, standaloneSeries: null };
  }
  if (presetId.includes('hangul') || sub === 'hangul' || title.includes('한글')) {
    return { themeKey: 'hangul', isSingleSeries20Theme: true, vesselSeries: HANGUL_20_SERIES, standaloneSeries: null };
  }
  if (presetId.includes('booktok') || sub === 'booktok' || title.includes('북톡') || title.includes('독서')) {
    return { themeKey: 'booktok', isSingleSeries20Theme: true, vesselSeries: BOOKTOK_20_SERIES, standaloneSeries: null };
  }

  // 2. Dual-series themes (can be 40-pack with vessel + standalone, or 20-pack)
  if (presetId.includes('terrarium') || sub === 'terrarium' || title.includes('테라리움')) {
    return { themeKey: 'terrarium', isSingleSeries20Theme: false, vesselSeries: TERRARIUM_20_SERIES, standaloneSeries: TERRARIUM_STANDALONE_20_SERIES };
  }
  if (presetId.includes('vivarium') || sub === 'vivarium' || title.includes('비바리움')) {
    return { themeKey: 'vivarium', isSingleSeries20Theme: false, vesselSeries: VIVARIUM_20_SERIES, standaloneSeries: VIVARIUM_STANDALONE_20_SERIES };
  }
  if (presetId.includes('saltaquarium') || presetId.includes('salt-aquarium') || sub === 'saltaquarium' || title.includes('해수어')) {
    return { themeKey: 'saltaquarium', isSingleSeries20Theme: false, vesselSeries: SALT_AQUARIUM_20_SERIES, standaloneSeries: SALT_AQUARIUM_STANDALONE_20_SERIES };
  }
  if (presetId.includes('freshaquarium') || presetId.includes('fresh-aquarium') || sub === 'freshaquarium' || title.includes('열대어')) {
    return { themeKey: 'freshaquarium', isSingleSeries20Theme: false, vesselSeries: FRESH_AQUARIUM_20_SERIES, standaloneSeries: FRESH_AQUARIUM_STANDALONE_20_SERIES };
  }
  if (presetId.includes('christmas') || sub === 'christmas' || title.includes('크리스마스')) {
    return { themeKey: 'christmas', isSingleSeries20Theme: false, vesselSeries: CHRISTMAS_20_SERIES, standaloneSeries: CHRISTMAS_STANDALONE_20_SERIES };
  }
  if (presetId.includes('halloween') || sub === 'halloween' || title.includes('할로윈')) {
    return { themeKey: 'halloween', isSingleSeries20Theme: false, vesselSeries: HALLOWEEN_20_SERIES, standaloneSeries: HALLOWEEN_STANDALONE_20_SERIES };
  }
  if (presetId.includes('thanksgiving') || sub === 'thanksgiving' || title.includes('추수감사절')) {
    return { themeKey: 'thanksgiving', isSingleSeries20Theme: false, vesselSeries: THANKSGIVING_20_SERIES, standaloneSeries: THANKSGIVING_STANDALONE_20_SERIES };
  }

  // 3. Other seasonal presets
  if (sub) {
    try {
      const seasonalPack = getSeasonalPackPresets(sub);
      if (seasonalPack?.vesselSeries && seasonalPack.vesselSeries.length > 0) {
        return {
          themeKey: sub,
          isSingleSeries20Theme: false,
          vesselSeries: seasonalPack.vesselSeries,
          standaloneSeries: seasonalPack.standaloneSeries || null
        };
      }
    } catch (e) {}
  }

  return { themeKey: 'other', isSingleSeries20Theme: false, vesselSeries: null, standaloneSeries: null };
};

export const getPackSeriesPresets = (coverDesign: any): StickerPreset[] => {
  const info = getPackPresetsInfo(coverDesign);
  if (info.isSingleSeries20Theme) return info.vesselSeries || [];
  if (isStickerStandalone(coverDesign)) return info.standaloneSeries || info.vesselSeries || [];
  return info.vesselSeries || [];
};

export const matchStickerToPresetSlot = (item: any, presets: StickerPreset[]): number => {
  if (!item || !presets || presets.length <= 1) return -1;
  const stickerPresets = presets.slice(1); // 20 presets

  const itemPresetId = (item.stickerPresetId || '').toLowerCase().trim();
  const itemId = (item.id || '').toLowerCase().trim();
  const itemTitle = (item.title || item.topic || '').toLowerCase();
  const itemPrompt = (item.prompt || '').toLowerCase();
  const fullText = `${itemTitle} ${itemPrompt} ${itemPresetId}`;

  // 1. High priority: Check if title has numbered pattern e.g. "17/20", "17/40", or "[크리스마스 단일 17/20]"
  const titleNumMatch = itemTitle.match(/(?:독서|스티커|배터리|디저트|한글|단일|단독|\s|^)(\d{1,2})\s*\/\s*(?:20|40)/) || 
                        itemTitle.match(/\[.*?(\d{1,2})\s*\/\s*(?:20|40).*?\]/);
  if (titleNumMatch && titleNumMatch[1]) {
    const num = parseInt(titleNumMatch[1], 10);
    if (num >= 1 && num <= stickerPresets.length) {
      return num - 1;
    } else if (num >= 21 && num <= 20 + stickerPresets.length) {
      return num - 21;
    }
  }

  // 2. Direct exact preset ID match (must respect word/digit boundaries, e.g. pack-1 must not match pack-17)
  const exactIdMatch = (id: string, targetId: string) => {
    if (!id || !targetId) return false;
    if (id === targetId) return true;
    const regex = new RegExp(`(^|[^a-z0-9])${targetId}($|[^a-z0-9])`, 'i');
    return regex.test(id);
  };

  for (let idx = 0; idx < stickerPresets.length; idx++) {
    const p = stickerPresets[idx];
    const pid = (p.id || '').toLowerCase();
    if (pid && (exactIdMatch(itemPresetId, pid) || exactIdMatch(itemId, pid))) {
      return idx;
    }
  }

  // 3. English phrase match with word boundary (e.g. "Kindle Girlie", "Late Night Book Club")
  for (let idx = 0; idx < stickerPresets.length; idx++) {
    const p = stickerPresets[idx];
    const pPhrase = (p.phrase || '').trim().toLowerCase();
    if (pPhrase && pPhrase.length >= 3) {
      const escaped = pPhrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const phraseRegex = new RegExp(`(^|[^a-z0-9])${escaped}($|[^a-z0-9])`, 'i');
      if (phraseRegex.test(fullText)) {
        return idx;
      }
    }
  }

  // 4. Affinity object & Korean title match
  for (let idx = 0; idx < stickerPresets.length; idx++) {
    const p = stickerPresets[idx];
    const pObj = (p.affinityObject || '').trim().toLowerCase();
    const pName = (p.name || '').replace(/\[.*?\]/g, '').trim().toLowerCase();

    if (pObj && pObj.length >= 3 && (itemTitle.includes(pObj) || itemPrompt.includes(pObj))) {
      return idx;
    }
    if (pName && pName.length >= 3 && (itemTitle.includes(pName) || itemPrompt.includes(pName))) {
      return idx;
    }
  }

  return -1;
};

export const organizePackStickers = (matched: any[], coverDesign: any): { finalStickers: any[]; is40Pack: boolean; targetMax: number } => {
  const packInfo = getPackPresetsInfo(coverDesign);
  const titleLower = (coverDesign.title || coverDesign.topic || '').toLowerCase();
  const promptLower = (coverDesign.prompt || '').toLowerCase();

  const vesselMatched = matched.filter((d: any) => !isStickerStandalone(d));
  const standaloneMatched = matched.filter((d: any) => isStickerStandalone(d));

  // Determine if this is a 40-pack:
  // Must NOT be a single-series 20 theme (booktok, dessert, socialbattery, hangul),
  // AND either has 40 in title/prompt, has >=25 matched items, or has both vessel & standalone stickers!
  const is40Pack = !packInfo.isSingleSeries20Theme && (
    titleLower.includes('40종') ||
    titleLower.includes('40') ||
    promptLower.includes('40+') ||
    matched.length >= 25 ||
    (vesselMatched.length >= 5 && standaloneMatched.length >= 5)
  );

  const targetMax = is40Pack ? 40 : 20;

  if (is40Pack && packInfo.vesselSeries && packInfo.standaloneSeries) {
    const vesselPresets = packInfo.vesselSeries.slice(1);
    const standalonePresets = packInfo.standaloneSeries.slice(1);

    // 1. Sort & match Vessel stickers (Sheet 1: Slots 0..19)
    vesselMatched.sort((a: any, b: any) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
    const vesselBuckets = new Map<number, any[]>();
    const vesselUnmatched: any[] = [];
    for (const item of vesselMatched) {
      const slot = matchStickerToPresetSlot(item, packInfo.vesselSeries);
      if (slot >= 0 && slot < vesselPresets.length) {
        if (!vesselBuckets.has(slot)) vesselBuckets.set(slot, []);
        vesselBuckets.get(slot)!.push(item);
      } else {
        vesselUnmatched.push(item);
      }
    }
    const vesselOrdered: any[] = [];
    for (let i = 0; i < vesselPresets.length; i++) {
      const b = vesselBuckets.get(i);
      if (b && b.length > 0) vesselOrdered.push(b[0]);
    }
    for (const item of vesselUnmatched) {
      if (vesselOrdered.length >= 20) break;
      vesselOrdered.push(item);
    }

    // 2. Sort & match Standalone stickers (Sheet 2: Slots 0..19)
    standaloneMatched.sort((a: any, b: any) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
    const standaloneBuckets = new Map<number, any[]>();
    const standaloneUnmatched: any[] = [];
    for (const item of standaloneMatched) {
      const slot = matchStickerToPresetSlot(item, packInfo.standaloneSeries);
      if (slot >= 0 && slot < standalonePresets.length) {
        if (!standaloneBuckets.has(slot)) standaloneBuckets.set(slot, []);
        standaloneBuckets.get(slot)!.push(item);
      } else {
        standaloneUnmatched.push(item);
      }
    }
    const standaloneOrdered: any[] = [];
    for (let i = 0; i < standalonePresets.length; i++) {
      const b = standaloneBuckets.get(i);
      if (b && b.length > 0) standaloneOrdered.push(b[0]);
    }
    for (const item of standaloneUnmatched) {
      if (standaloneOrdered.length >= 20) break;
      standaloneOrdered.push(item);
    }

    const finalStickers = [...vesselOrdered, ...standaloneOrdered];
    return { finalStickers, is40Pack: true, targetMax: 40 };
  }

  // 20-Pack processing
  const activeSeries = packInfo.isSingleSeries20Theme
    ? packInfo.vesselSeries
    : ((isStickerStandalone(coverDesign) || vesselMatched.length === 0)
        ? (packInfo.standaloneSeries || packInfo.vesselSeries)
        : (packInfo.vesselSeries || packInfo.standaloneSeries));

  if (activeSeries && activeSeries.length > 1) {
    const expectedSlots = activeSeries.slice(1);
    const slotBuckets = new Map<number, any[]>();
    const unmatched: any[] = [];

    matched.sort((a: any, b: any) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());

    for (const item of matched) {
      const slot = matchStickerToPresetSlot(item, activeSeries);
      if (slot >= 0 && slot < expectedSlots.length) {
        if (!slotBuckets.has(slot)) slotBuckets.set(slot, []);
        slotBuckets.get(slot)!.push(item);
      } else {
        unmatched.push(item);
      }
    }

    const slotOrdered: any[] = [];
    for (let i = 0; i < expectedSlots.length; i++) {
      const bucket = slotBuckets.get(i);
      if (bucket && bucket.length > 0) {
        slotOrdered.push(bucket[0]);
      }
    }
    for (const item of unmatched) {
      if (slotOrdered.length >= targetMax) break;
      slotOrdered.push(item);
    }

    return { finalStickers: slotOrdered, is40Pack: false, targetMax: 20 };
  }

  // Fallback for non-series packs
  matched.sort((a: any, b: any) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
  const deduplicatedStickers: any[] = [];
  const seenKeys = new Set<string>();

  for (const item of matched) {
    const presetKey = (item.stickerPresetId || '').toLowerCase().trim();
    const cleanName = (item.title || item.topic || '').replace(/\[.*?\]/g, '').trim().toLowerCase();
    const uniqueKey = presetKey || cleanName;

    if (uniqueKey && seenKeys.has(uniqueKey)) continue;
    if (uniqueKey) seenKeys.add(uniqueKey);
    deduplicatedStickers.push(item);
    if (deduplicatedStickers.length >= targetMax) break;
  }

  deduplicatedStickers.sort((a: any, b: any) => {
    const aStandalone = isStickerStandalone(a);
    const bStandalone = isStickerStandalone(b);
    if (!aStandalone && bStandalone) return -1;
    if (aStandalone && !bStandalone) return 1;
    return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
  });

  return { finalStickers: deduplicatedStickers, is40Pack: false, targetMax: 20 };
};

export default function Home() {
  const { data: session } = useSession();
  const [designs, setDesigns] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = sessionStorage.getItem('mypod_initial_page_data_v1');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && Array.isArray(parsed.data?.data) && (Date.now() - parsed.timestamp < 600000)) {
            return parsed.data.data;
          }
        }
      } catch {}
    }
    return [];
  });
  const [loading, setLoading] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = sessionStorage.getItem('mypod_initial_page_data_v1');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && Array.isArray(parsed.data?.data) && (Date.now() - parsed.timestamp < 600000)) {
            return false;
          }
        }
      } catch {}
    }
    return true;
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [dbApiError, setDbApiError] = useState<string | null>(null);

  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [searchInput, setSearchInput] = useState<string>('');

  // Debounce search input by 350ms to prevent hammering Firestore on every keystroke
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchKeyword(searchInput);
      setPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // Main Category Tab State ('pod' | 'sticker' | 'all')
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<'pod' | 'sticker' | 'all'>('sticker');
  const [podCount, setPodCount] = useState<number>(0);
  const [stickerCount, setStickerCount] = useState<number>(0);

  // Sticker Sub-Category Filter State
  const [selectedStickerSubTab, setSelectedStickerSubTab] = useState<string>('all');
  const [stickerSubCounts, setStickerSubCounts] = useState<Record<string, number>>({
    all: 0,
    dessert: 0,
    socialbattery: 0,
    hangul: 0,
    terrarium: 0,
    vivarium: 0,
    saltaquarium: 0,
    freshaquarium: 0,
    booktok: 0,
    christmas: 0,
    halloween: 0,
    thanksgiving: 0
  });

  const [dynamicSeasonalRecommendations, setDynamicSeasonalRecommendations] = useState<SeasonalRecommendation[]>([]);

  useEffect(() => {
    setDynamicSeasonalRecommendations(getDynamicSeasonalStickerRecommendations());
  }, []);

  // Sticker & Digital PNG Pack States
  const [isStickerMode, setIsStickerMode] = useState(true);
  const [isSeasonalRadarExpanded, setIsSeasonalRadarExpanded] = useState(false); // Collapsed by default
  const [expandedStrategySeasonIds, setExpandedStrategySeasonIds] = useState<string[]>([]);
  const [copiedTagsSeasonId, setCopiedTagsSeasonId] = useState<string | null>(null);
  const [copiedEtsyTitleNotice, setCopiedEtsyTitleNotice] = useState(false);
  const [copiedEtsyDescNotice, setCopiedEtsyDescNotice] = useState(false);
  const [copiedPackTitleNotice, setCopiedPackTitleNotice] = useState(false);
  const [copiedPackDescNotice, setCopiedPackDescNotice] = useState(false);
  const [copiedPackTagsNotice, setCopiedPackTagsNotice] = useState(false);
  const [isPinterestHubExpanded, setIsPinterestHubExpanded] = useState(false); // Collapsed by default
  const [isPackSeoExpanded, setIsPackSeoExpanded] = useState(false); // Collapsed by default
  const [isDetailDescExpanded, setIsDetailDescExpanded] = useState(false);
  const [isStickerBannerExpanded, setIsStickerBannerExpanded] = useState(false); // Collapsed by default
  const [isPresetGridExpanded, setIsPresetGridExpanded] = useState(false); // Collapsed by default
  const [selectedStickerSeriesTab, setSelectedStickerSeriesTab] = useState<
    | 'dessert20'
    | 'socialbattery20'
    | 'hangul20'
    | 'booktok20'
    | 'terrarium20'
    | 'terrarium20_standalone'
    | 'vivarium20'
    | 'vivarium20_standalone'
    | 'saltaquarium20'
    | 'saltaquarium20_standalone'
    | 'freshaquarium20'
    | 'freshaquarium20_standalone'
    | 'christmas20'
    | 'christmas20_standalone'
    | 'halloween20'
    | 'halloween20_standalone'
    | 'thanksgiving20'
    | 'thanksgiving20_standalone'
  >('dessert20');
  const [selectedStickerPresetId, setSelectedStickerPresetId] = useState<string>('terrarium-20-pack-1');
  const [isExportingBundle, setIsExportingBundle] = useState(false);
  const [exportBundleProgress, setExportBundleProgress] = useState<{ current: number; total: number; message: string } | null>(null);
  const [isBatchZipModalOpen, setIsBatchZipModalOpen] = useState(false);
  const [batchZipSessions, setBatchZipSessions] = useState<any[]>([]);
  const [allZipPool, setAllZipPool] = useState<any[]>([]);
  const [isBatchGenerating, setIsBatchGenerating] = useState(false);
  const [activeBatchPackId, setActiveBatchPackId] = useState<string | null>(null);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number; label: string; packTitle?: string }>({ current: 0, total: 0, label: '', packTitle: '' });
  const [batchCompletionNotice, setBatchCompletionNotice] = useState<{
    packId: string;
    packName: string;
    successCount: number;
    totalExpectedCount: number;
  } | null>(null);
  const [isMigrating, setIsMigrating] = useState(false);

  // Sticker Pack 20-Pack Bundle Detail View Modal States
  const [isPackDetailModalOpen, setIsPackDetailModalOpen] = useState(false);
  const [selectedPackCover, setSelectedPackCover] = useState<any>(null);
  const [packStickers, setPackStickers] = useState<any[]>([]);
  const [loadingPackStickers, setLoadingPackStickers] = useState(false);
  const [isRegeneratingCover, setIsRegeneratingCover] = useState(false);

  // Pinterest & Etsy Marketing Link States
  const [etsyShopUrl, setEtsyShopUrl] = useState<string>('');
  const [currentListingUrl, setCurrentListingUrl] = useState<string>('');
  const [copiedPinterestDescNotice, setCopiedPinterestDescNotice] = useState(false);
  const [copiedTitleNotice, setCopiedTitleNotice] = useState(false);
  const [copiedLinkNotice, setCopiedLinkNotice] = useState(false);
  const [copiedImageNotice, setCopiedImageNotice] = useState(false);
  const [copiedMockupNotice, setCopiedMockupNotice] = useState<string | null>(null);

  const handleCopyImageToClipboard = async (imgUrl: string) => {
    try {
      setCopiedImageNotice(true);
      setTimeout(() => setCopiedImageNotice(false), 2500);

      // In browser, create canvas and write PNG blob to clipboard for direct Ctrl+V pasting
      const res = await fetch(imgUrl);
      const blob = await res.blob();
      const img = new Image();
      img.crossOrigin = 'anonymous';
      const objUrl = URL.createObjectURL(blob);
      img.src = objUrl;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('No canvas context');
      ctx.drawImage(img, 0, 0);

      canvas.toBlob(async (pngBlob) => {
        if (pngBlob && navigator.clipboard && window.ClipboardItem) {
          try {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': pngBlob })
            ]);
            alert('🖼️ 이미지가 클립보드에 복사되었습니다!\n핀터레스트 "핀 만들기" 화면에서 [Ctrl + V]를 누르면 사진이 바로 꽂힙니다.');
          } catch (e) {
            // fallback download
            const a = document.createElement('a');
            a.href = imgUrl;
            a.download = 'pinterest_pin_image.jpg';
            a.click();
          }
        } else {
          const a = document.createElement('a');
          a.href = imgUrl;
          a.download = 'pinterest_pin_image.jpg';
          a.click();
        }
      }, 'image/png');
    } catch (err) {
      console.warn('Image clipboard copy error:', err);
      const a = document.createElement('a');
      a.href = imgUrl;
      a.download = 'pinterest_pin_image.jpg';
      a.click();
    }
  };

  const handleUpdateEtsyListingUrl = (newUrl: string) => {
    let trimmed = newUrl.trim();
    // Auto-clean internal tracking query parameters from Etsy listing URL (e.g. ?sr_prefetch=...&ref=...)
    if (trimmed.includes('etsy.com/listing/') && trimmed.includes('?')) {
      trimmed = trimmed.split('?')[0];
    }
    setCurrentListingUrl(trimmed);
    if (typeof window !== 'undefined') {
      if (selectedPackCover?.id) {
        localStorage.setItem(`etsy_listing_url_${selectedPackCover.id}`, trimmed);
        // Persist to Firestore design document so it's permanently stored across devices & reloads
        try {
          fetch('/api/designs/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: selectedPackCover.id,
              updates: { etsy_listing_url: trimmed }
            })
          }).catch(err => console.warn('Failed to sync etsy_listing_url to Firestore:', err));
        } catch (e) {
          // Ignore background sync errors
        }
      }
      if (trimmed.includes('etsy.com/shop/') || trimmed.includes('etsy.me/')) {
        setEtsyShopUrl(trimmed);
        localStorage.setItem('user_etsy_shop_url', trimmed);
      }
    }
  };

  const [sharingMockupId, setSharingMockupId] = useState<string | null>(null);

  const handleShareToPinterest = (
    customMediaUrl?: string,
    customTitle?: string,
    customDesc?: string,
    existingPopup?: Window | null
  ) => {
    if (!selectedPackCover) return;

    const targetLink = (currentListingUrl || etsyShopUrl || 'https://www.etsy.com/shop/LittlePawsStudioShop').trim();

    const baseUrl = typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
      ? window.location.origin
      : 'https://pod-ebon.vercel.app';

    // If customMediaUrl is data: (base64), fallback to public cover API URL with .jpg extension to pass Pinterest file validation
    let mediaUrl = customMediaUrl;
    if (!mediaUrl || mediaUrl.startsWith('data:')) {
      mediaUrl = `${baseUrl}/api/designs/image/master-cover.jpg?id=${selectedPackCover.id}`;
    }

    const packSeo = generateEtsySeo(selectedPackCover, packStickers.length);
    const title = customTitle || packSeo.title;

    const hashTags = (packSeo.tags || [])
      .map(t => '#' + t.replace(/[^a-zA-Z0-9]/g, ''))
      .filter(t => t.length > 2)
      .slice(0, 8)
      .join(' ');

    const description = customDesc || `${title}\n\n✨ ${packStickers.length > 0 ? packStickers.length : 40} Cute Die-Cut Digital Stickers Bundle for GoodNotes, Digital Planners & Crafts.\nHigh resolution 300DPI PNG files with transparent backgrounds + printable sheet.\n\n👉 Shop on Etsy: ${targetLink}\n\n${hashTags} #stickers #digitalstickers #goodnotes #digitalplanning #etsyseller #clipart`;

    const pinUrl = `https://www.pinterest.com/pin/create/button/?url=${encodeURIComponent(targetLink)}&media=${encodeURIComponent(mediaUrl)}&description=${encodeURIComponent(description)}`;

    const width = 760;
    const height = 660;
    const left = typeof window !== 'undefined' && window.screen.width ? (window.screen.width - width) / 2 : 100;
    const top = typeof window !== 'undefined' && window.screen.height ? (window.screen.height - height) / 2 : 100;

    if (existingPopup && !existingPopup.closed) {
      existingPopup.location.href = pinUrl;
    } else {
      window.open(
        pinUrl,
        'pinterest_pin_share',
        `width=${width},height=${height},top=${top},left=${left},toolbar=no,menubar=no,location=no,status=no,scrollbars=yes`
      );
    }
  };

  const createPinterestOptimizedDataUrl = async (originalDataUrl: string): Promise<string> => {
    return new Promise((resolve) => {
      if (!originalDataUrl || !originalDataUrl.startsWith('data:image/')) {
        resolve(originalDataUrl);
        return;
      }
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const maxDim = 1200;
        let w = img.naturalWidth || img.width || 1200;
        let h = img.naturalHeight || img.height || 1200;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        } else {
          resolve(originalDataUrl);
        }
      };
      img.onerror = () => resolve(originalDataUrl);
      img.src = originalDataUrl;
    });
  };

  const getMockupEnglishSeo = (mockup: LifestyleMockupResult, cover: any, packCount: number) => {
    const packSeo = generateEtsySeo(cover, packCount);
    // Extract primary English base title (segment before comma or fallback)
    const baseTitle = (packSeo.title || 'Cute Stickers PNG Bundle').split(',')[0].trim();

    let demoTitleSuffix = 'Lifestyle Demonstration';
    let demoContext = 'Digital Planner & Lifestyle demonstration';

    if (mockup.id === 'ipad_planner') {
      demoTitleSuffix = 'iPad GoodNotes Digital Planning Demo';
      demoContext = 'Realistic iPad & GoodNotes digital planning demonstration with cute die-cut stickers';
    } else if (mockup.id === 'print_craft') {
      demoTitleSuffix = 'Printed DIY Sticker Sheet & Craft Demo';
      demoContext = 'Printed & cut DIY sticker craft demonstration';
    } else if (mockup.id === 'phone_journal') {
      demoTitleSuffix = 'Aesthetic Laptop & Phone Case Decor Demo';
      demoContext = 'Laptop & phone case aesthetic sticker decoration demonstration';
    }

    const title = `${baseTitle} - ${demoTitleSuffix}`;
    const hashTags = (packSeo.tags || [])
      .map(t => '#' + t.replace(/[^a-zA-Z0-9]/g, ''))
      .filter(t => t.length > 2)
      .slice(0, 8)
      .join(' ');

    const targetLink = (currentListingUrl || etsyShopUrl || 'https://www.etsy.com/shop/LittlePawsStudioShop').trim();
    const countText = packCount > 0 ? packCount : 20;
    const description = `${title}\n\n📸 [Lifestyle Demo] ${demoContext}.\n✨ ${countText} Cute Die-Cut Digital Stickers Bundle for GoodNotes, Planners & Cricut.\nHigh resolution 300DPI PNG files with transparent backgrounds + printable sheet.\n\n👉 Shop on Etsy: ${targetLink}\n\n${hashTags} #stickers #digitalstickers #goodnotes #digitalplanning #etsyseller #clipart`;

    return { title, description, targetLink };
  };

  const handleShareMockupToPinterest = async (mockup: LifestyleMockupResult) => {
    if (!selectedPackCover) return;

    const targetLink = (currentListingUrl || etsyShopUrl || 'https://www.etsy.com/shop/LittlePawsStudioShop').trim();

    const width = 760;
    const height = 660;
    const left = typeof window !== 'undefined' && window.screen.width ? (window.screen.width - width) / 2 : 100;
    const top = typeof window !== 'undefined' && window.screen.height ? (window.screen.height - height) / 2 : 100;

    const popup = window.open(
      'about:blank',
      'pinterest_pin_share',
      `width=${width},height=${height},top=${top},left=${left},toolbar=no,menubar=no,location=no,status=no,scrollbars=yes`
    );
    if (popup) {
      try {
        popup.document.write('<div style="font-family:system-ui,-apple-system,sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;height:80vh;text-align:center;padding:24px;"><div style="font-size:42px;margin-bottom:12px;">📌</div><h2 style="font-size:20px;font-weight:bold;color:#E60023;margin:0 0 8px 0;">Pinterest 연결 중...</h2><p style="color:#666;font-size:14px;margin:0;line-height:1.5;">실물 시연 목업 이미지를 Pinterest 핀 규격으로 준비하고 있습니다.<br/>잠시만 기다려주시면 핀 생성 화면으로 자동 이동합니다.</p></div>');
      } catch (e) {}
    }

    try {
      setSharingMockupId(mockup.id);

      // 1. Client-side optimize mockup image to 1200px max (~200KB) to guarantee staying well under Firestore 1MB limit
      let uploadDataUrl = mockup.dataUrl;
      if (uploadDataUrl && uploadDataUrl.startsWith('data:image/')) {
        uploadDataUrl = await createPinterestOptimizedDataUrl(uploadDataUrl);
      }

      // 2. Save mockup canvas dataUrl to backend so Pinterest scraper can fetch it via HTTP GET
      if (uploadDataUrl && uploadDataUrl.startsWith('data:')) {
        const saveRes = await fetch('/api/designs/save-mockup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            coverId: selectedPackCover.id,
            mockupType: mockup.id,
            dataUrl: uploadDataUrl
          })
        });
        const saveJson = await saveRes.json();
        if (!saveRes.ok || !saveJson.success) {
          throw new Error(saveJson.error || '목업 이미지 서버 저장에 실패했습니다.');
        }
      }

      const baseUrl = typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
        ? window.location.origin
        : 'https://pod-ebon.vercel.app';

      // Use coverId_mockupType in the path so Pinterest scraper can fetch it with or without query params
      const mediaUrl = `${baseUrl}/api/designs/image/${selectedPackCover.id}_${mockup.id}.jpg?id=${selectedPackCover.id}&type=${mockup.id}&v=${Date.now()}`;
      const seoData = getMockupEnglishSeo(mockup, selectedPackCover, packStickers.length);

      handleShareToPinterest(mediaUrl, seoData.title, seoData.description, popup);
    } catch (error: any) {
      console.error('Error sharing mockup to Pinterest:', error);
      if (popup && !popup.closed) popup.close();
      alert('목업 이미지를 Pinterest로 전송하는 중 오류가 발생했습니다: ' + (error?.message || error));
    } finally {
      setSharingMockupId(null);
    }
  };

  // A4 Printable Sticker Sheet Modal & States (Supports Multi-Page e.g. 40 items = 2 Sheets)
  const [isA4SheetModalOpen, setIsA4SheetModalOpen] = useState(false);
  const [a4SheetPages, setA4SheetPages] = useState<string[]>([]);
  const [currentA4PageIndex, setCurrentA4PageIndex] = useState<number>(0);
  const [a4SheetLoading, setA4SheetLoading] = useState(false);
  const [a4SheetProgress, setA4SheetProgress] = useState<{ current: number; total: number; label: string }>({ current: 0, total: 0, label: '' });
  const [a4SheetBg, setA4SheetBg] = useState<'transparent' | 'white'>('transparent');

  const handleGenerateAndOpenA4Sheet = async (stickersToUse?: any[], bg: 'transparent' | 'white' = 'transparent') => {
    const list = (stickersToUse && stickersToUse.length > 0) ? stickersToUse : packStickers;
    if (!list || list.length === 0) {
      alert('정렬할 스티커가 없습니다.');
      return;
    }

    setIsA4SheetModalOpen(true);
    setA4SheetLoading(true);
    setA4SheetBg(bg);
    setA4SheetPages([]);
    setCurrentA4PageIndex(0);
    setA4SheetProgress({ current: 0, total: list.length, label: 'A4 시트 생성 준비 중...' });

    try {
      const pages = await generateA4StickerSheets(list, {
        background: bg,
        pageSize: 20,
        onProgress: (current, total, label) => {
          setA4SheetProgress({ current, total, label });
        },
      });
      setA4SheetPages(pages);
      setCurrentA4PageIndex(0);
    } catch (err: any) {
      console.error('Error generating A4 sheets:', err);
      alert('A4 스티커 시트 생성 중 오류가 발생했습니다: ' + (err?.message || err));
    } finally {
      setA4SheetLoading(false);
    }
  };

  // Lifestyle Mockups (Etsy Photos 2~4 & Pinterest Pins) Modal & States
  const [isLifestyleModalOpen, setIsLifestyleModalOpen] = useState(false);
  const [lifestyleMockups, setLifestyleMockups] = useState<LifestyleMockupResult[]>([]);
  const [lifestyleLoading, setLifestyleLoading] = useState(false);
  const [lifestyleProgress, setLifestyleProgress] = useState<{ current: number; total: number; message: string }>({ current: 0, total: 0, message: '' });

  const handleOpenLifestyleMockups = async (stickersToUse?: any[], shuffle: boolean = false) => {
    let list = (stickersToUse && stickersToUse.length > 0) ? [...stickersToUse] : [...packStickers];
    if (!list || list.length === 0) {
      alert('목업을 생성할 스티커가 없습니다.');
      return;
    }

    if (shuffle) {
      // Shuffle stickers for fresh visual combinations
      list = [...list].sort(() => Math.random() - 0.5);
    }

    setIsLifestyleModalOpen(true);
    setLifestyleLoading(true);
    setLifestyleProgress({ current: 0, total: 4, message: '실물 시연 목업 3종 생성 준비 중...' });

    try {
      const themeName = getCleanEnglishThemeName(
        selectedPackCover?.sticker_sub,
        selectedStickerSeriesTab,
        selectedPackCover?.topic || selectedPackCover?.title || 'Sticker'
      );
      const results = await generateAllLifestyleMockups(list, themeName, (current, total, message) => {
        setLifestyleProgress({ current, total, message });
      });
      setLifestyleMockups(results);
    } catch (e: any) {
      console.error('Failed to generate lifestyle mockups:', e);
      alert('실물 시연 목업 생성 중 오류가 발생했습니다: ' + (e?.message || String(e)));
    } finally {
      setLifestyleLoading(false);
    }
  };

  const handleDownloadSingleMockup = (mockup: LifestyleMockupResult) => {
    const a = document.createElement('a');
    a.href = mockup.dataUrl;
    a.download = mockup.filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleDownloadAllMockupsZip = async () => {
    if (lifestyleMockups.length === 0) return;
    try {
      const zip = new JSZip();
      for (const m of lifestyleMockups) {
        const base64Data = m.dataUrl.split(',')[1];
        zip.file(m.filename, base64Data, { base64: true });
      }
      const blob = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 9 },
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const theme = getCleanEnglishThemeName(selectedPackCover?.sticker_sub, selectedStickerSeriesTab, selectedPackCover?.topic || selectedPackCover?.title || 'Sticker');
      a.download = `02_Lifestyle_Mockups_3Pack_${theme}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Failed to download mockups zip:', e);
      alert('목업 ZIP 압축 중 오류가 발생했습니다.');
    }
  };


  const getCleanEnglishThemeName = (subKey?: string, tabKey?: string, topic?: string): string => {
    const raw = (subKey || tabKey || '').toLowerCase();
    
    if (raw.includes('dessert') || raw.includes('bakery')) return 'Dessert';
    if (raw.includes('socialbattery') || raw.includes('social_battery') || raw.includes('introvert')) return 'SocialBattery';
    if (raw.includes('hangul') || raw.includes('korean')) return 'HangulKVibe';
    if (raw.includes('halloween')) return 'Halloween';
    if (raw.includes('christmas')) return 'Christmas';
    if (raw.includes('thanksgiving')) return 'Thanksgiving';
    if (raw.includes('valentine')) return 'Valentine';
    if (raw.includes('stpatrick') || raw.includes('patrick')) return 'StPatricks';
    if (raw.includes('easter')) return 'Easter';
    if (raw.includes('mother')) return 'MothersDay';
    if (raw.includes('terrarium')) return 'Terrarium';
    if (raw.includes('vivarium')) return 'Vivarium';
    if (raw.includes('saltaquarium') || raw.includes('salt_aquarium')) return 'SaltAquarium';
    if (raw.includes('freshaquarium') || raw.includes('fresh_aquarium')) return 'FreshAquarium';
    if (raw.includes('booktok') || raw.includes('reading') || raw.includes('book_club')) return 'BookTok';

    const topicLower = (topic || '').toLowerCase();
    if (topicLower.includes('dessert') || topicLower.includes('디저트') || topicLower.includes('베이커리')) return 'Dessert';
    if (topicLower.includes('social battery') || topicLower.includes('배터리') || topicLower.includes('내향')) return 'SocialBattery';
    if (topicLower.includes('hangul') || topicLower.includes('한글') || topicLower.includes('대박') || topicLower.includes('괜찮아')) return 'HangulKVibe';
    if (topicLower.includes('halloween') || topicLower.includes('할로윈')) return 'Halloween';
    if (topicLower.includes('christmas') || topicLower.includes('크리스마스')) return 'Christmas';
    if (topicLower.includes('thanksgiving') || topicLower.includes('추수감사절')) return 'Thanksgiving';
    if (topicLower.includes('valentine') || topicLower.includes('발렌타인') || topicLower.includes('밸런타인')) return 'Valentine';
    if (topicLower.includes('patrick') || topicLower.includes('패트릭')) return 'StPatricks';
    if (topicLower.includes('easter') || topicLower.includes('부활절')) return 'Easter';
    if (topicLower.includes('mother') || topicLower.includes('어버이날') || topicLower.includes('마더스')) return 'MothersDay';
    if (topicLower.includes('terrarium') || topicLower.includes('테라리움')) return 'Terrarium';
    if (topicLower.includes('vivarium') || topicLower.includes('비바리움')) return 'Vivarium';
    if (topicLower.includes('해수어')) return 'SaltAquarium';
    if (topicLower.includes('열대어') || topicLower.includes('담수')) return 'FreshAquarium';
    if (topicLower.includes('북톡') || topicLower.includes('독서') || topicLower.includes('booktok')) return 'BookTok';

    const clean = (topic || tabKey || '')
      .replace(/[^a-zA-Z0-9\s_-]/g, '')
      .trim()
      .replace(/[\s_-]+/g, '_');

    return clean || 'Sticker_Pack';
  };

  const handleDownloadA4Sheet = (pageIdx?: number) => {
    const targetIdx = typeof pageIdx === 'number' ? pageIdx : currentA4PageIndex;
    const dataUrl = a4SheetPages[targetIdx];
    if (!dataUrl) return;

    const a = document.createElement('a');
    a.href = dataUrl;
    const englishTheme = getCleanEnglishThemeName(
      selectedPackCover?.sticker_sub,
      selectedStickerSeriesTab,
      selectedPackCover?.topic || selectedPackCover?.title
    );
    const isJpeg = dataUrl.startsWith('data:image/jpeg');
    const ext = isJpeg ? 'jpg' : 'png';
    const bgName = a4SheetBg === 'transparent' ? 'Transparent' : 'White';
    const sheetNum = targetIdx + 1;
    a.download = a4SheetPages.length > 1
      ? `A4_${englishTheme}_Stickers_Sheet${sheetNum}_${bgName}_300DPI.${ext}`
      : `A4_${englishTheme}_Stickers_${bgName}_300DPI.${ext}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleDownloadAllA4Sheets = () => {
    if (a4SheetPages.length === 0) return;
    a4SheetPages.forEach((_, idx) => {
      setTimeout(() => {
        handleDownloadA4Sheet(idx);
      }, idx * 500);
    });
  };

  const compressImageForFirestore = (dataUrl: string, maxBytes: number = 800000): Promise<string> => {
    return new Promise((resolve) => {
      if (!dataUrl || !dataUrl.startsWith('data:image/') || dataUrl.length <= maxBytes) {
        resolve(dataUrl);
        return;
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = dataUrl;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width || 1024;
        let height = img.height || 1024;
        const maxDim = 1024;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        let quality = 0.85;
        let compressed = canvas.toDataURL('image/jpeg', quality);

        while (compressed.length > maxBytes && quality > 0.3) {
          quality -= 0.1;
          compressed = canvas.toDataURL('image/jpeg', quality);
        }

        resolve(compressed);
      };
      img.onerror = () => resolve(dataUrl);
    });
  };

  const handleRegenerateMasterCover = async (coverDesign: any, count?: number) => {
    if (!coverDesign) return;

    setIsRegeneratingCover(true);
    try {
      // 1. Calculate actual sticker count in this pack
      let targetCount = count && count > 0 ? count : 0;
      if (!targetCount) {
        if (packStickers && packStickers.length > 0) {
          targetCount = packStickers.length;
        } else {
          const title = (coverDesign.title || coverDesign.topic || '').toLowerCase();
          if (title.includes('40종') || title.includes('40')) {
            targetCount = 40;
          } else {
            const coverCategory = getDesignCategoryKey(coverDesign);
            const coverTime = new Date(coverDesign.created_at || 0).getTime();
            const matched = designs.filter((d: any) => {
              if (d.id === coverDesign.id || isCoverDesign(d)) return false;
              const itemCategory = getDesignCategoryKey(d);
              if (coverCategory !== 'other' && itemCategory !== 'other' && coverCategory !== itemCategory) return false;
              const itemTime = new Date(d.created_at || 0).getTime();
              return Math.abs(itemTime - coverTime) <= 120 * 60 * 1000;
            });
            targetCount = matched.length > 25 ? 40 : (matched.length > 0 ? matched.length : 20);
          }
        }
      }
      if (!targetCount) targetCount = 20;

      let basePrompt = coverDesign.prompt || '';
      const presetId = (coverDesign.stickerPresetId || coverDesign.id || '').toLowerCase();
      const sub = coverDesign.sticker_sub;

      if (presetId.includes('dessert') || sub === 'dessert') {
        const p = DESSERT_20_SERIES.find(s => s.id === 'dessert-20-pack-cover');
        if (p) basePrompt = p.prompt;
      } else if (presetId.includes('socialbattery') || presetId.includes('social-battery') || sub === 'socialbattery') {
        const p = SOCIAL_BATTERY_20_SERIES.find(s => s.id === 'social-battery-20-pack-cover');
        if (p) basePrompt = p.prompt;
      } else if (presetId.includes('hangul') || sub === 'hangul') {
        const p = HANGUL_20_SERIES.find(s => s.id === 'hangul-20-pack-cover');
        if (p) basePrompt = p.prompt;
      } else if (presetId.includes('terrarium') || sub === 'terrarium') {
        const p = TERRARIUM_20_SERIES.find(s => s.id === 'terrarium-20-pack-cover');
        if (p) basePrompt = p.prompt;
      } else if (presetId.includes('vivarium') || sub === 'vivarium') {
        const p = VIVARIUM_20_SERIES.find(s => s.id === 'vivarium-20-pack-cover');
        if (p) basePrompt = p.prompt;
      } else if (presetId.includes('saltaquarium') || presetId.includes('salt-aquarium') || sub === 'saltaquarium') {
        const p = SALT_AQUARIUM_20_SERIES.find(s => s.id === 'salt-aquarium-20-pack-cover');
        if (p) basePrompt = p.prompt;
      } else if (presetId.includes('freshaquarium') || presetId.includes('fresh-aquarium') || sub === 'freshaquarium') {
        const p = FRESH_AQUARIUM_20_SERIES.find(s => s.id === 'fresh-aquarium-20-pack-cover');
        if (p) basePrompt = p.prompt;
      } else if (presetId.includes('booktok') || sub === 'booktok') {
        const p = BOOKTOK_20_SERIES.find(s => s.id === 'booktok-20-pack-cover');
        if (p) basePrompt = p.prompt;
      } else if (sub) {
        try {
          const seasonalPack = getSeasonalPackPresets(sub);
          if (seasonalPack && seasonalPack.vesselSeries && seasonalPack.vesselSeries[0]) {
            basePrompt = seasonalPack.vesselSeries[0].prompt;
          }
        } catch (e) {
          // ignore
        }
      }

      // Format prompt and title with real count!
      const adjustedPrompt = formatCoverPromptWithCount(basePrompt, targetCount);
      const adjustedTitle = formatCoverTitleWithCount(coverDesign.title || coverDesign.topic || '스티커 팩 대표 커버 표지', targetCount);

      const res = await fetch('/api/designs/from-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: '',
          prompt: adjustedPrompt,
          title: adjustedTitle,
          isPreview: true,
          styleId: selectedStyleId,
          catchphrase: '',
          autoPhrase: false
        })
      });

      const data = await res.json();
      if (data.success && data.data?.image_url) {
        const rawImageUrl = data.data.image_url;
        const compressedUrl = await compressImageForFirestore(rawImageUrl, 800000);

        const updates = {
          image_url: compressedUrl,
          prompt: adjustedPrompt,
          title: adjustedTitle,
          topic: adjustedTitle,
          updated_at: new Date().toISOString()
        };

        const updateRes = await fetch('/api/designs/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: coverDesign.id,
            updates
          })
        });

        const updateData = await updateRes.json();
        if (!updateRes.ok || !updateData.success) {
          throw new Error(updateData.error || 'Firestore DB 업데이트 실패');
        }

        const freshTs = updateData.updated_at ? new Date(updateData.updated_at).getTime() : Date.now();
        const freshImageUrl = `/api/designs/image?id=${coverDesign.id}&v=${freshTs}&_t=${Date.now()}`;

        const freshData = {
          ...updates,
          updated_at: updateData.updated_at || updates.updated_at,
          image_url: freshImageUrl
        };

        setSelectedPackCover((prev: any) => prev ? { ...prev, ...freshData } : prev);
        setDesigns(prev => prev.map(d => d.id === coverDesign.id ? { ...d, ...freshData } : d));
        if (selectedDesign?.id === coverDesign.id) {
          setSelectedDesign((prev: any) => prev ? { ...prev, ...freshData } : prev);
        }

        alert(`✨ ${targetCount}종 최신 AI 마스터 표지가 성공적으로 재생성되었습니다!`);
        await fetchDesigns(page, false, undefined, undefined, true);
      } else {
        alert('마스터 표지 생성 실패: ' + (data.error || '오류가 발생했습니다.'));
      }
    } catch (e: any) {
      console.error('Error regenerating master cover:', e);
      alert('마스터 표지 재생성 중 오류가 발생했습니다: ' + (e.message || String(e)));
    } finally {
      setIsRegeneratingCover(false);
    }
  };

  const [isBuildingComposite, setIsBuildingComposite] = useState(false);

  const handleGenerateRealCompositeCover = async (coverDesign: any, stickerList?: any[]) => {
    if (!coverDesign) return;

    const coverCategory = getDesignCategoryKey(coverDesign);
    const coverTime = new Date(coverDesign.created_at || 0).getTime();
    let targetStickers = stickerList && stickerList.length > 0 ? stickerList : packStickers;

    if (targetStickers.length === 0 || getDesignCategoryKey(targetStickers[0]) !== coverCategory) {
      try {
        const pool = await getCachedStickersPool();
        if (pool && pool.length > 0) {
          const matched = pool.filter((d: any) => {
            if (d.id === coverDesign.id || isCoverDesign(d)) return false;
            const itemCategory = getDesignCategoryKey(d);
            if (coverCategory !== 'other' && itemCategory !== 'other' && coverCategory !== itemCategory) {
              return false; // Mismatched category -> exclude
            }
            const itemTime = new Date(d.created_at || 0).getTime();
            const isTimeMatched = coverTime > 0 && itemTime > 0 && Math.abs(itemTime - coverTime) <= 120 * 60 * 1000;
            return isTimeMatched || (coverCategory !== 'other' && itemCategory === coverCategory);
          });

          matched.sort((a: any, b: any) => {
            const timeA = new Date(a.created_at || 0).getTime();
            const timeB = new Date(b.created_at || 0).getTime();
            return Math.abs(timeA - coverTime) - Math.abs(timeB - coverTime);
          });

          const is20Theme = ['booktok', 'dessert', 'socialbattery', 'hangul'].includes(coverCategory);
          const maxItems = !is20Theme && ((coverDesign.title || '').includes('40종') || matched.length >= 35) ? 40 : 20;
          const finalItems = matched.slice(0, maxItems);
          finalItems.sort((a: any, b: any) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime());
          targetStickers = finalItems;
        }
      } catch (e) {
        console.error('Error loading stickers for composite cover:', e);
      }
    }

    if (targetStickers.length === 0) {
      alert('실제 스티커 항목이 없습니다. 먼저 스티커 일괄 생성을 진행해 주세요.');
      return;
    }

    setIsBuildingComposite(true);
    try {
      const targetCount = targetStickers.length;
      const adjustedTitle = formatCoverTitleWithCount(coverDesign.title || coverDesign.topic, targetCount);
      const compositeDataUrl = await createCompositeMasterCover(targetStickers, {
        title: adjustedTitle,
        subType: coverCategory !== 'other' ? coverCategory : (coverDesign.sticker_sub || 'terrarium'),
        stickerCount: targetCount
      });

      const compressedUrl = await compressImageForFirestore(compositeDataUrl, 650000);

      const updates = {
        image_url: compressedUrl,
        title: adjustedTitle,
        topic: adjustedTitle,
        updated_at: new Date().toISOString()
      };

      const updateRes = await fetch('/api/designs/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: coverDesign.id,
          updates
        })
      });

      const updateData = await updateRes.json();
      if (!updateRes.ok || !updateData.success) {
        throw new Error(updateData.error || 'DB 업데이트 실패');
      }

      const freshTs = updateData.updated_at ? new Date(updateData.updated_at).getTime() : Date.now();
      const freshImageUrl = `/api/designs/image?id=${coverDesign.id}&v=${freshTs}&_t=${Date.now()}`;

      const freshData = {
        ...updates,
        updated_at: updateData.updated_at || updates.updated_at,
        image_url: freshImageUrl
      };

      setSelectedPackCover((prev: any) => prev ? { ...prev, ...freshData } : prev);
      setDesigns(prev => prev.map(d => d.id === coverDesign.id ? { ...d, ...freshData } : d));
      if (selectedDesign?.id === coverDesign.id) {
        setSelectedDesign((prev: any) => prev ? { ...prev, ...freshData } : prev);
      }

      alert(`✨ 실제 ${targetCount}종 스티커 100% 실물 일치 마스터 표지 합성이 완료되었습니다!`);
      await fetchDesigns(page, false, undefined, undefined, true);
    } catch (e: any) {
      console.error('Error creating composite master cover:', e);
      alert('실체 합성 마스터 표지 생성 실패: ' + (e.message || String(e)));
    } finally {
      setIsBuildingComposite(false);
    }
  };

  const [isExtractingStandalone, setIsExtractingStandalone] = useState(false);
  const [extractProgress, setExtractProgress] = useState<{ current: number; total: number; label: string } | null>(null);

  const handleExtractAllStandaloneFromTanks = async () => {
    if (!selectedPackCover || packStickers.length === 0) return;

    const tankStickers = packStickers.filter((s: any) => {
      const title = (s.title || s.prompt || '').toLowerCase();
      const preset = (s.stickerPresetId || '').toLowerCase();
      return !title.includes('단일') && !title.includes('단독') && !preset.includes('standalone');
    });

    if (tankStickers.length === 0) {
      alert('어항/유리병 본품 스티커를 찾을 수 없습니다.');
      return;
    }

    if (!confirm(`현재 어항/유리병 본품 스티커 ${tankStickers.length}종에서 내부 주인공 아이템을 100% 동일하게 직접 추출하여 독립 스티커를 생성/교체하시겠습니까?`)) {
      return;
    }

    setIsExtractingStandalone(true);
    let successCount = 0;

    try {
      const coverCategory = getDesignCategoryKey(selectedPackCover);
      const seasonalPresets = getSeasonalPackPresets(coverCategory);
      const standaloneSeries = seasonalPresets?.standaloneSeries || [];

      for (let idx = 0; idx < tankStickers.length; idx++) {
        const tank = tankStickers[idx];
        const defaultName = standaloneSeries[idx + 1]?.name || `${tank.title ? tank.title.replace(/ 어항| 유리병| 수조| 미니| 돔/gi, '') : '아이템'} 단일 스티커`;
        setExtractProgress({
          current: idx + 1,
          total: tankStickers.length,
          label: `${defaultName} (100% 실물 추출 중...)`
        });

        try {
          const extractedUrl = await extractStandaloneStickerFromTank(
            tank.image_url,
            defaultName
          );

          // Find existing matching standalone sticker in packStickers if present
          const existingStandalone = packStickers.find((s: any) => {
            const title = (s.title || '').toLowerCase();
            const preset = (s.stickerPresetId || '').toLowerCase();
            return (title.includes('단일') || title.includes('단독') || preset.includes('standalone')) &&
                   (s.stickerPresetId === standaloneSeries[idx + 1]?.id || title.includes(defaultName) || title.includes(tank.title));
          });

          const compressedUrl = await compressImageForFirestore(extractedUrl, 800000);
          const designData = {
            image_url: compressedUrl,
            title: defaultName,
            topic: defaultName,
            prompt: `100% Real Object Extracted Die-Cut Sticker: ${defaultName} on pure solid white background (#FFFFFF)`,
            stickerPresetId: standaloneSeries[idx + 1]?.id || `standalone-${tank.id}`,
            sticker_sub: coverCategory,
            design_type: 'sticker',
            is_deleted: false,
            updated_at: new Date().toISOString()
          };

          if (existingStandalone) {
            await fetch('/api/designs/update', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id: existingStandalone.id,
                updates: designData
              })
            });
          } else {
            await fetch('/api/designs/save', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id: `${designData.stickerPresetId}-${Date.now()}`,
                designData: { ...designData, created_at: new Date().toISOString() }
              })
            });
          }
          successCount++;
        } catch (e) {
          console.error(`Failed to extract standalone for tank ${tank.id}:`, e);
        }
      }

      alert(`✨ 어항 본품 ${successCount}종에서 100% 실물 일치 독립 스티커 추출이 완료되었습니다!`);
      await handleOpenPackDetail(selectedPackCover, true);
      await fetchDesigns(page, false, undefined, undefined, true);
    } catch (e: any) {
      console.error('Error in handleExtractAllStandaloneFromTanks:', e);
      alert('독립 스티커 추출 중 오류가 발생했습니다: ' + (e.message || String(e)));
    } finally {
      setIsExtractingStandalone(false);
      setExtractProgress(null);
    }
  };

  const [isBuildingVessels, setIsBuildingVessels] = useState(false);
  const [vesselProgress, setVesselProgress] = useState<{ current: number; total: number; label: string } | null>(null);

  const handleBuildAllVesselsFromStandalone = async () => {
    if (!selectedPackCover || packStickers.length === 0) return;

    const standaloneStickers = packStickers.filter((s: any) => {
      const title = (s.title || s.prompt || '').toLowerCase();
      const preset = (s.stickerPresetId || '').toLowerCase();
      return title.includes('단일') || title.includes('단독') || preset.includes('standalone');
    });

    if (standaloneStickers.length === 0) {
      alert('독립 스티커를 찾을 수 없습니다.');
      return;
    }

    if (!confirm(`현재 독립 스티커 ${standaloneStickers.length}종 원본을 테마별 크리스털 유리 돔/병 안에 쏙 넣어, 100% 동일한 어항/유리병 스티커로 합성·교체하시겠습니까?`)) {
      return;
    }

    setIsBuildingVessels(true);
    let successCount = 0;

    try {
      const coverCategory = getDesignCategoryKey(selectedPackCover);
      const seasonalPresets = getSeasonalPackPresets(coverCategory);
      const vesselSeries = seasonalPresets?.vesselSeries || [];

      for (let idx = 0; idx < standaloneStickers.length; idx++) {
        const standalone = standaloneStickers[idx];
        const defaultName = vesselSeries[idx + 1]?.name || `${standalone.title ? standalone.title.replace(/ 단일| 단독| 스티커/gi, '') : '아이템'} 유리 돔 스티커`;
        setVesselProgress({
          current: idx + 1,
          total: standaloneStickers.length,
          label: `${defaultName} (100% 실물 어항 결합 중...)`
        });

        try {
          const vesselUrl = await createVesselStickerFromStandalone(
            standalone.image_url,
            {
              theme: coverCategory,
              characterIndex: idx
            }
          );

          const existingVessel = packStickers.find((s: any) => {
            const title = (s.title || '').toLowerCase();
            const preset = (s.stickerPresetId || '').toLowerCase();
            const isStand = title.includes('단일') || title.includes('단독') || preset.includes('standalone');
            return !isStand && (s.stickerPresetId === vesselSeries[idx + 1]?.id || title.includes(defaultName) || title.includes(standalone.title));
          });

          const compressedUrl = await compressImageForFirestore(vesselUrl, 800000);
          const designData = {
            image_url: compressedUrl,
            title: defaultName,
            topic: defaultName,
            prompt: `100% Real Standalone Housed in Glass Vessel: ${defaultName} on pure solid white background (#FFFFFF)`,
            stickerPresetId: vesselSeries[idx + 1]?.id || `vessel-${standalone.id}`,
            sticker_sub: coverCategory,
            design_type: 'sticker',
            is_deleted: false,
            updated_at: new Date().toISOString()
          };

          if (existingVessel) {
            await fetch('/api/designs/update', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id: existingVessel.id,
                updates: designData
              })
            });
          } else {
            await fetch('/api/designs/save', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id: `${designData.stickerPresetId}-${Date.now()}`,
                designData: { ...designData, created_at: new Date().toISOString() }
              })
            });
          }
          successCount++;
        } catch (e) {
          console.error(`Failed to build vessel for standalone ${standalone.id}:`, e);
        }
      }

      alert(`✨ 독립 스티커 ${successCount}종에서 100% 실물 일치 어항/유리병 스티커 합성이 완료되었습니다!`);
      await handleOpenPackDetail(selectedPackCover, true);
      await fetchDesigns(page, false, undefined, undefined, true);
    } catch (e: any) {
      console.error('Error in handleBuildAllVesselsFromStandalone:', e);
      alert('어항 스티커 합성 중 오류가 발생했습니다: ' + (e.message || String(e)));
    } finally {
      setIsBuildingVessels(false);
      setVesselProgress(null);
    }
  };

  const handleOpenPackDetail = async (coverDesign: any, forceRefresh: boolean = false) => {
    setSelectedPackCover(coverDesign);
    setIsPackDetailModalOpen(true);
    setIsPinterestHubExpanded(false);
    const hasWarmCache = !forceRefresh && clientPoolCache && clientPoolCache.data.length > 0;
    if (!hasWarmCache) {
      setLoadingPackStickers(true);
      setPackStickers([]);
    }

    if (typeof window !== 'undefined') {
      const savedShop = localStorage.getItem('user_etsy_shop_url') || 'https://www.etsy.com/shop/LittlePawsStudioShop';
      setEtsyShopUrl(savedShop);
      const firestoreListing = coverDesign.etsy_listing_url || '';
      const localListing = localStorage.getItem(`etsy_listing_url_${coverDesign.id}`) || '';
      const savedListing = firestoreListing || localListing || savedShop;
      setCurrentListingUrl(savedListing);
    }

    try {
      const pool = await getCachedStickersPool(forceRefresh);
      if (pool && pool.length > 0) {
        const coverTime = new Date(coverDesign.created_at || 0).getTime();
        const coverCategory = getDesignCategoryKey(coverDesign);

        const matched = pool.filter((d: any) => {
          if (d.id === coverDesign.id) return false;
          if (isCoverDesign(d)) return false;

          // 🚨 CRITICAL: Strictly exclude POD Apparel and Mockups, but NEVER exclude stickers where the animal wears clothes (e.g. hoodie/후드티)
          if (d.design_type === 'pod' || d.is_mockup === true) return false;
          if (d.design_type !== 'sticker' && !d.stickerPresetId) {
            const titleOnly = `${d.title || ''} ${d.topic || ''}`.toLowerCase();
            if (
              titleOnly.includes('t-shirt') ||
              titleOnly.includes('tshirt') ||
              titleOnly.includes('티셔츠') ||
              titleOnly.includes('mockup') ||
              titleOnly.includes('목업')
            ) {
              return false;
            }
          }

          const itemCategory = getDesignCategoryKey(d);

          // Strictly filter by category if identified!
          if (coverCategory !== 'other' && itemCategory !== 'other') {
            if (coverCategory !== itemCategory) {
              return false; // Mismatched category -> exclude
            }
          }

          const itemTime = new Date(d.created_at || 0).getTime();
          const isTimeMatched = coverTime > 0 && itemTime > 0 && Math.abs(itemTime - coverTime) <= 120 * 60 * 1000;
          return isTimeMatched || (coverCategory !== 'other' && itemCategory === coverCategory);
        });

        const { finalStickers } = organizePackStickers(matched, coverDesign);

        setPackStickers(finalStickers);

        // Auto-synchronize master cover title to reflect the real count!
        if (finalStickers.length > 0) {
          const currentTitle = coverDesign.title || coverDesign.topic || '';
          const correctedTitle = formatCoverTitleWithCount(currentTitle, finalStickers.length);
          if (correctedTitle && correctedTitle !== currentTitle) {
            setSelectedPackCover((prev: any) => prev ? { ...prev, title: correctedTitle, topic: correctedTitle } : prev);
            setDesigns(prev => prev.map(d => d.id === coverDesign.id ? { ...d, title: correctedTitle, topic: correctedTitle } : d));
            
            fetch('/api/designs/update', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id: coverDesign.id,
                updates: { title: correctedTitle, topic: correctedTitle }
              })
            }).catch(e => console.error('Failed to update cover title:', e));
          }
        }
      }
    } catch (e) {
      console.error('Error fetching pack stickers:', e);
    } finally {
      setLoadingPackStickers(false);
    }
  };

  const [isFillingMissing, setIsFillingMissing] = useState(false);

  const handleFillMissingPackStickers = async (missingList: StickerPreset[]) => {
    if (!selectedPackCover || missingList.length === 0) return;
    setIsFillingMissing(true);

    const coverCategory = getDesignCategoryKey(selectedPackCover);
    const subKey = selectedPackCover.sticker_sub || coverCategory;
    let addedCount = 0;
    const newlyAddedStickers: any[] = [];

    try {
      for (let i = 0; i < missingList.length; i++) {
        const preset = missingList[i];
        let genData = null;
        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            const res = await fetch('/api/designs/from-image', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                imageBase64: '',
                prompt: preset.prompt,
                title: preset.name,
                isPreview: true,
                styleId: selectedStyleId,
                catchphrase: '',
                autoPhrase: false
              })
            });
            const data = await res.json();
            if (data.success && data.data?.image_url) {
              genData = data;
              break;
            }
          } catch (e) {
            console.warn(`Attempt ${attempt} failed for missing preset ${preset.name}:`, e);
          }
          if (attempt < 3) await new Promise(r => setTimeout(r, 2000));
        }

        if (genData?.data?.image_url) {
          const compressedUrl = await compressImageForFirestore(genData.data.image_url, 800000);
          const newDoc = {
            ...genData.data,
            image_url: compressedUrl,
            title: preset.name,
            topic: preset.name,
            stickerPresetId: preset.id,
            sticker_sub: subKey,
            design_type: 'sticker',
            is_deleted: false,
            created_at: selectedPackCover.created_at || new Date().toISOString()
          };

          await fetch('/api/designs/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: genData.data.id,
              designData: newDoc
            })
          });

          newlyAddedStickers.push(newDoc);
          addedCount++;
        }
      }

      if (addedCount > 0) {
        const combined = [...packStickers, ...newlyAddedStickers];
        const { finalStickers: updatedStickers } = organizePackStickers(combined, selectedPackCover);

        setPackStickers(updatedStickers);

        const newTotalCount = updatedStickers.length;
        const currentTitle = selectedPackCover.title || selectedPackCover.topic || '';
        const correctedTitle = formatCoverTitleWithCount(currentTitle, newTotalCount);
        if (correctedTitle !== currentTitle) {
          setSelectedPackCover((prev: any) => prev ? { ...prev, title: correctedTitle, topic: correctedTitle } : prev);
          setDesigns(prev => prev.map(d => d.id === selectedPackCover.id ? { ...d, title: correctedTitle, topic: correctedTitle } : d));
          fetch('/api/designs/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: selectedPackCover.id,
              updates: { title: correctedTitle, topic: correctedTitle }
            })
          }).catch(console.error);
        }

        alert(`✨ 누락되었던 스티커 ${addedCount}종이 성공적으로 생성되어 팩에 추가되었습니다! (총 ${newTotalCount}종 완성)`);
        await fetchDesigns(page, false, undefined, undefined, true);
      } else {
        alert('스티커 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
      }
    } catch (e: any) {
      console.error('Error filling missing stickers:', e);
      alert('누락 스티커 채우기 중 오류: ' + (e.message || String(e)));
    } finally {
      setIsFillingMissing(false);
    }
  };

  const handleRunMigration = async () => {
    if (!confirm('기존 DB에 저장된 모든 스티커 데이터에 영문 카테고리(sticker_sub: terrarium/vivarium/saltaquarium/freshaquarium) 일괄 업데이트를 진행하시겠습니까?')) return;
    setIsMigrating(true);
    try {
      const res = await fetch('/api/designs/migrate');
      const data = await res.json();
      if (data.success) {
        alert(`✨ 기존 DB 레거시 데이터 마이그레이션 완료!\n\n총 ${data.totalCount}개 데이터 중 ${data.updatedCount}개 항목에 영문 서브 카테고리(sticker_sub)가 Firestore DB에 저장되었습니다.`);
        fetchDesigns(1);
      } else {
        alert('마이그레이션 실패: ' + data.error);
      }
    } catch (e) {
      console.error(e);
      alert('마이그레이션 중 오류가 발생했습니다.');
    } finally {
      setIsMigrating(false);
    }
  };

  // Synchronized Handlers for Tab and Mode
  const handleSelectCategoryTab = (tab: 'pod' | 'sticker' | 'all') => {
    setSelectedCategoryTab(tab);
    setSelectedStickerSubTab('all');
    setPage(1);
    if (tab === 'sticker') {
      setIsStickerMode(true);
    } else {
      setIsStickerMode(false); // POD or All defaults to POD Mode
    }
  };

  const handleSelectStickerSubTab = (sub: string) => {
    setSelectedStickerSubTab(sub);
    setPage(1);
    if (sub !== 'all') {
      const isStandalone = selectedStickerSeriesTab.includes('standalone');
      setSelectedStickerSeriesTab(isStandalone ? `${sub}20_standalone` as any : `${sub}20` as any);
    }
  };

  const handleToggleStickerMode = () => {
    const nextStickerMode = !isStickerMode;
    setIsStickerMode(nextStickerMode);
    if (nextStickerMode) {
      setSelectedCategoryTab('sticker');
    } else {
      setSelectedCategoryTab('pod');
    }
  };
  
  const [selectedDesign, setSelectedDesign] = useState<any>(null);
  const [previewDesign, setPreviewDesign] = useState<any>(null);
  const [feedback, setFeedback] = useState('');
  const [modifying, setModifying] = useState(false);

  // Multi-select & Trash Bin States
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIdsForDelete, setSelectedIdsForDelete] = useState<string[]>([]);
  const [isTrashModalOpen, setIsTrashModalOpen] = useState(false);
  const [trashDesigns, setTrashDesigns] = useState<any[]>([]);
  const [selectedIdsInTrash, setSelectedIdsInTrash] = useState<string[]>([]);
  const [loadingTrash, setLoadingTrash] = useState(false);

  const fetchTrashDesigns = async () => {
    setLoadingTrash(true);
    try {
      const res = await fetch('/api/designs/trash');
      const data = await res.json();
      if (data.success) {
        setTrashDesigns(data.data || []);
      }
    } catch (e) {
      console.error('Error fetching trash designs:', e);
    } finally {
      setLoadingTrash(false);
    }
  };

  const handleMoveToTrash = async (targetIds: string[]) => {
    if (targetIds.length === 0) return;

    let finalTargetIds = [...targetIds];
    let coverCount = 0;
    let childCount = 0;

    try {
      const pool = await getCachedStickersPool();
      if (pool && pool.length > 0) {
        const selectedCovers = pool.filter((d: any) => targetIds.includes(d.id) && isCoverDesign(d));
        coverCount = selectedCovers.length;

        if (coverCount > 0) {
          const childIdsSet = new Set<string>();

          selectedCovers.forEach((cover: any) => {
            const coverTime = new Date(cover.created_at || 0).getTime();
            const coverCategory = getDesignCategoryKey(cover);

            pool.forEach((d: any) => {
              if (d.id === cover.id || isCoverDesign(d)) return;
              const itemCategory = getDesignCategoryKey(d);

              if (coverCategory !== 'other' && itemCategory !== 'other' && coverCategory !== itemCategory) {
                return; // Mismatched category -> skip
              }

              const itemTime = new Date(d.created_at || 0).getTime();
              const isTimeMatched = coverTime > 0 && itemTime > 0 && Math.abs(itemTime - coverTime) <= 120 * 60 * 1000;
              if (isTimeMatched || (coverCategory !== 'other' && itemCategory === coverCategory)) {
                childIdsSet.add(d.id);
              }
            });
          });

          childCount = childIdsSet.size;
          finalTargetIds = Array.from(new Set([...targetIds, ...Array.from(childIdsSet)]));
        }
      }
    } catch (e) {
      console.error('Error finding child stickers for cascade delete:', e);
    }

    const confirmMsg = coverCount > 0
      ? `선택한 마스터 팩 ${coverCount}개 및 포함된 하위 스티커 ${childCount}개 (총 ${finalTargetIds.length}개 항목)를 삭제함으로 이동하시겠습니까?\n(삭제함에서 15일간 보관 후 자동 영구 삭제됩니다)`
      : `선택한 ${finalTargetIds.length}개 항목을 삭제함으로 이동하시겠습니까?\n(삭제함에서 15일간 보관 후 자동 영구 삭제됩니다)`;

    if (!confirm(confirmMsg)) return;

    try {
      const res = await fetch('/api/designs/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: finalTargetIds, permanent: false })
      });
      const data = await res.json();
      if (data.success) {
        setDesigns(prev => prev.filter(d => !finalTargetIds.includes(d.id)));
        setSelectedIdsForDelete([]);
        if (selectedDesign && finalTargetIds.includes(selectedDesign.id)) {
          setSelectedDesign(null);
        }
        invalidateClientPoolCache();
        fetchDesigns(page, false, undefined, undefined, true);
      }
    } catch (e) {
      console.error('Error moving to trash:', e);
      alert('삭제함 이동 중 오류가 발생했습니다.');
    }
  };

  const handleRestoreFromTrash = async (targetIds: string[]) => {
    if (targetIds.length === 0) return;

    let finalTargetIds = [...targetIds];
    let coverCount = 0;
    let childCount = 0;

    try {
      const res = await fetch('/api/designs/trash');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        const pool = data.data;

        const selectedCovers = pool.filter((d: any) => targetIds.includes(d.id) && isCoverDesign(d));
        coverCount = selectedCovers.length;

        if (coverCount > 0) {
          const childIdsSet = new Set<string>();

          selectedCovers.forEach((cover: any) => {
            const coverTime = new Date(cover.created_at || 0).getTime();
            const coverCategory = getDesignCategoryKey(cover);

            pool.forEach((d: any) => {
              if (d.id === cover.id || isCoverDesign(d)) return;
              const itemCategory = getDesignCategoryKey(d);

              if (coverCategory !== 'other' && itemCategory !== 'other' && coverCategory !== itemCategory) {
                return; // Mismatched category -> skip
              }

              const itemTime = new Date(d.created_at || 0).getTime();
              const isTimeMatched = coverTime > 0 && itemTime > 0 && Math.abs(itemTime - coverTime) <= 120 * 60 * 1000;
              if (isTimeMatched || (coverCategory !== 'other' && itemCategory === coverCategory)) {
                childIdsSet.add(d.id);
              }
            });
          });

          childCount = childIdsSet.size;
          finalTargetIds = Array.from(new Set([...targetIds, ...Array.from(childIdsSet)]));
        }
      }
    } catch (e) {
      console.error('Error finding child stickers for cascade restore:', e);
    }

    try {
      const res = await fetch('/api/designs/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: finalTargetIds })
      });
      const data = await res.json();
      if (data.success) {
        setTrashDesigns(prev => prev.filter(d => !finalTargetIds.includes(d.id)));
        setSelectedIdsInTrash([]);
        fetchDesigns(page, false, undefined, undefined, true);
      }
    } catch (e) {
      console.error('Error restoring design:', e);
      alert('복원 중 오류가 발생했습니다.');
    }
  };

  const handlePermanentDelete = async (targetIds: string[]) => {
    if (targetIds.length === 0) return;

    let finalTargetIds = [...targetIds];
    let coverCount = 0;
    let childCount = 0;

    try {
      const res = await fetch('/api/designs/trash');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        const pool = data.data;

        const selectedCovers = pool.filter((d: any) => targetIds.includes(d.id) && isCoverDesign(d));
        coverCount = selectedCovers.length;

        if (coverCount > 0) {
          const childIdsSet = new Set<string>();

          selectedCovers.forEach((cover: any) => {
            const coverTime = new Date(cover.created_at || 0).getTime();
            const sub = cover.sticker_sub;

            pool.forEach((d: any) => {
              if (d.id === cover.id || isCoverDesign(d)) return;
              const itemTime = new Date(d.created_at || 0).getTime();
              const isTimeMatched = Math.abs(itemTime - coverTime) <= 45 * 60 * 1000;
              const isSubMatched = sub && d.sticker_sub === sub;

              if (isTimeMatched || isSubMatched) {
                childIdsSet.add(d.id);
              }
            });
          });

          childCount = childIdsSet.size;
          finalTargetIds = Array.from(new Set([...targetIds, ...Array.from(childIdsSet)]));
        }
      }
    } catch (e) {
      console.error('Error finding child stickers for cascade permanent delete:', e);
    }

    const confirmMsg = coverCount > 0
      ? `선택한 마스터 팩 ${coverCount}개 및 포함된 하위 스티커 ${childCount}개 (총 ${finalTargetIds.length}개 항목)를 영구 삭제하시겠습니까?\n이 작업은 복구할 수 없습니다!`
      : `선택한 ${finalTargetIds.length}개 항목을 영구 삭제하시겠습니까?\n이 작업은 복구할 수 없습니다!`;

    if (!confirm(confirmMsg)) return;

    try {
      const res = await fetch('/api/designs/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: finalTargetIds, permanent: true })
      });
      const data = await res.json();
      if (data.success) {
        setTrashDesigns(prev => prev.filter(d => !finalTargetIds.includes(d.id)));
        setSelectedIdsInTrash([]);
        fetchDesigns(page, false, undefined, undefined, true);
      }
    } catch (e) {
      console.error('Error permanently deleting:', e);
      alert('영구 삭제 중 오류가 발생했습니다.');
    }
  };
  
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [uploadImageBase64, setUploadImageBase64] = useState('');
  const [uploadPrompt, setUploadPrompt] = useState('');
  const [isGeneratingFromImage, setIsGeneratingFromImage] = useState(false);
  const [uploadPreviewDesign, setUploadPreviewDesign] = useState<any>(null);
  const [selectedAnimal, setSelectedAnimal] = useState('hamster');

  const [styles, setStyles] = useState<any[]>([]);
  const [selectedStyleId, setSelectedStyleId] = useState<string>('');
  
  const [isStyleModalOpen, setIsStyleModalOpen] = useState(false);
  const [styleImageBase64, setStyleImageBase64] = useState('');
  const [styleName, setStyleName] = useState('');
  const [isCreatingStyle, setIsCreatingStyle] = useState(false);
  const [isGeneratingTrend, setIsGeneratingTrend] = useState(false);
  const [globalCatchphrase, setGlobalCatchphrase] = useState('');
  const [autoGeneratePhrase, setAutoGeneratePhrase] = useState(true);

  const [isManageStylesModalOpen, setIsManageStylesModalOpen] = useState(false);
  const [editingStyleId, setEditingStyleId] = useState<string | null>(null);
  const [editingStyleName, setEditingStyleName] = useState('');
  const [enlargedStyleImage, setEnlargedStyleImage] = useState<string | null>(null);

  const [isAutoAgentModalOpen, setIsAutoAgentModalOpen] = useState(false);
  const [autoAgentAnimal, setAutoAgentAnimal] = useState('random');
  const [autoAgentGarmentColor, setAutoAgentGarmentColor] = useState('random');
  const [autoAgentSeason, setAutoAgentSeason] = useState('auto');
  const [activeSeasonsList, setActiveSeasonsList] = useState<ActiveSeasonInfo[]>([]);

  const [activeTab, setActiveTab] = useState<'info' | 'mockup' | 'edit'>('info');
  const [selectedMockupId, setSelectedMockupId] = useState(MOCKUP_TEMPLATES[0].id);
  const [mockupScale, setMockupScale] = useState(1.0);
  const [isProcessingPNG, setIsProcessingPNG] = useState(false);
  const [mockupOffsetX, setMockupOffsetX] = useState(0);
  const [mockupOffsetY, setMockupOffsetY] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const loadedMockupImgRef = useRef<{ id: string; img: HTMLImageElement } | null>(null);
  const loadedDesignImgRef = useRef<{ url: string; img: HTMLImageElement | HTMLCanvasElement } | null>(null);
  const drawSequenceRef = useRef<number>(0);

  // Auto-switch mockup when mode changes (POD vs Sticker)
  useEffect(() => {
    const availableMockups = getMockupsForMode(isStickerMode);
    if (availableMockups.length > 0) {
      setSelectedMockupId(availableMockups[0].id);
    }
  }, [isStickerMode]);

  const editCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(20);
  const [isSavingManual, setIsSavingManual] = useState(false);
  const [originalEditImage, setOriginalEditImage] = useState<string | null>(null);
  
  type TextElement = {
    id: string;
    text: string;
    x: number;
    y: number;
    font: string;
    size: number;
    color: string;
  };
  const [editMode, setEditMode] = useState<'eraser' | 'text'>('eraser');
  const [textElements, setTextElements] = useState<TextElement[]>([]);
  const [activeTextId, setActiveTextId] = useState<string | null>(null);
  const [isDraggingText, setIsDraggingText] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [canvasDisplayScale, setCanvasDisplayScale] = useState(1);
  const [history, setHistory] = useState<string[]>([]);
  const [cursorPos, setCursorPos] = useState({ x: -1000, y: -1000 });
  const [isHoveringCanvas, setIsHoveringCanvas] = useState(false);

  const getStyleDisplayName = (design: any) => {
    if (!design) return '기본 수채화/벡터 일러스트';
    if (design.style_name) return design.style_name;
    const textToScan = `${design.prompt || ''} ${design.topic || ''} ${design.title || ''}`.toLowerCase();
    if (textToScan.includes('cottagecore')) return '코티지코어 감성 (Cottagecore)';
    if (textToScan.includes('pixel') || textToScan.includes('y2k')) return 'Y2K 레트로 픽셀 (Y2K Pixel Art)';
    if (textToScan.includes('minimalist') || textToScan.includes('line art')) return '미니멀 라인아트 (Minimal Line Art)';
    if (textToScan.includes('watercolor')) return '포근한 수채화 (Cozy Watercolor)';
    if (textToScan.includes('vintage') || textToScan.includes('retro')) return '빈티지 레트로 (Vintage Retro)';
    if (textToScan.includes('chibi') || textToScan.includes('kawaii')) return '카와이 치비 (Kawaii Chibi)';
    return '귀여운 수채화/벡터 일러스트';
  };



  useEffect(() => {
    const updateScale = () => {
      if (editCanvasRef.current && editCanvasRef.current.width > 0) {
        const rect = editCanvasRef.current.getBoundingClientRect();
        setCanvasDisplayScale(rect.width / editCanvasRef.current.width);
      }
    };
    window.addEventListener('resize', updateScale);
    const timeoutId = setTimeout(updateScale, 100);
    return () => {
      window.removeEventListener('resize', updateScale);
      clearTimeout(timeoutId);
    };
  }, [activeTab, selectedDesign, originalEditImage]);

  // Load styles and upcoming seasons ONCE on initial mount (saves redundant Firestore reads)
  // And pre-warm sticker pool cache in background after initial render so detail modals open in 0ms!
  useEffect(() => {
    fetchStyles();
    setActiveSeasonsList(getActiveUpcomingSeasons());

    const prewarmTimer = setTimeout(() => {
      getCachedStickersPool(false).catch(() => {});
    }, 1200);

    return () => clearTimeout(prewarmTimer);
  }, []);

  // Fetch designs only when page, tab, subtab, or debounced search keyword changes
  useEffect(() => {
    fetchDesigns(page);
  }, [page, selectedCategoryTab, selectedStickerSubTab, searchKeyword]);

  useEffect(() => {
    if (activeTab === 'mockup' && selectedDesign) {
      drawMockup();
    }
  }, [activeTab, selectedMockupId, mockupScale, mockupOffsetX, mockupOffsetY, previewDesign, selectedDesign]);

  // Reset all modals and page state to initial home screen on header logo / upload image home click
  useEffect(() => {
    const handleGoHome = () => {
      setSelectedDesign(null);
      setPreviewDesign(null);
      setIsImageModalOpen(false);
      setUploadImageBase64('');
      setUploadPrompt('');
      setUploadPreviewDesign(null);
      setIsStyleModalOpen(false);
      setIsManageStylesModalOpen(false);
      setIsAutoAgentModalOpen(false);
      setSelectedStyleId('');
      setPage(1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('go-home-reset', handleGoHome);
    return () => {
      window.removeEventListener('go-home-reset', handleGoHome);
    };
  }, []);

  // Reset scale and offsets when mockup changes
  useEffect(() => {
    setMockupScale(1.0);
    setMockupOffsetX(0);
    setMockupOffsetY(0);
  }, [selectedMockupId]);


  // Reset text elements when a different design is opened
  useEffect(() => {
    setTextElements([]);
  }, [selectedDesign?.id]);

  const createTransparentDesignCanvas = (img: HTMLImageElement): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    const width = img.naturalWidth || img.width || 800;
    const height = img.naturalHeight || img.height || 800;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    ctx.drawImage(img, 0, 0, width, height);
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const totalPixels = width * height;

    // Sample background color from 4 corners
    const samplePoints = [
      (0 * width + 0) * 4,
      (0 * width + (width - 1)) * 4,
      ((height - 1) * width + 0) * 4,
      ((height - 1) * width + (width - 1)) * 4,
    ];

    let bgR = 0, bgG = 0, bgB = 0;
    samplePoints.forEach(idx => {
      bgR += data[idx];
      bgG += data[idx + 1];
      bgB += data[idx + 2];
    });
    bgR = Math.round(bgR / 4);
    bgG = Math.round(bgG / 4);
    bgB = Math.round(bgB / 4);

    const visited = new Uint8Array(totalPixels);
    const queue = new Int32Array(totalPixels * 2);
    let head = 0;
    let tail = 0;

    const isBackgroundPixel = (x: number, y: number) => {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const a = data[idx + 3];

      if (a === 0) return true;

      // 1. Color distance from sampled corner background
      const dr = Math.abs(r - bgR);
      const dg = Math.abs(g - bgG);
      const db = Math.abs(b - bgB);
      if (dr <= 32 && dg <= 32 && db <= 32) return true;

      // 2. Off-white / light gray ground shadow / floor noise under feet/chairs
      // (High brightness & low saturation neutral gray ground shadow)
      if (r >= 150 && g >= 150 && b >= 145) {
        const maxC = Math.max(r, g, b);
        const minC = Math.min(r, g, b);
        if (maxC - minC <= 20) { // Low saturation neutral ground shadow
          return true;
        }
      }

      return false;
    };


    // 1. Seed 4 outer border edges for BFS Flood Fill
    for (let x = 0; x < width; x++) {
      if (isBackgroundPixel(x, 0)) {
        const idx = 0 * width + x;
        if (!visited[idx]) { visited[idx] = 1; queue[tail++] = x; queue[tail++] = 0; }
      }
      if (isBackgroundPixel(x, height - 1)) {
        const idx = (height - 1) * width + x;
        if (!visited[idx]) { visited[idx] = 1; queue[tail++] = x; queue[tail++] = height - 1; }
      }
    }

    for (let y = 0; y < height; y++) {
      if (isBackgroundPixel(0, y)) {
        const idx = y * width + 0;
        if (!visited[idx]) { visited[idx] = 1; queue[tail++] = 0; queue[tail++] = y; }
      }
      if (isBackgroundPixel(width - 1, y)) {
        const idx = y * width + (width - 1);
        if (!visited[idx]) { visited[idx] = 1; queue[tail++] = width - 1; queue[tail++] = y; }
      }
    }

    // BFS Flood Fill 4-directional
    const dx = [1, -1, 0, 0];
    const dy = [0, 0, 1, -1];

    while (head < tail) {
      const cx = queue[head++];
      const cy = queue[head++];

      for (let i = 0; i < 4; i++) {
        const nx = cx + dx[i];
        const ny = cy + dy[i];

        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const nidx = ny * width + nx;
          if (!visited[nidx] && isBackgroundPixel(nx, ny)) {
            visited[nidx] = 1;
            queue[tail++] = nx;
            queue[tail++] = ny;
          }
        }
      }
    }

    // 2. Enclosed Letter Hole Cleanup for ALL text stroke colors (mint, pink, coral, black, etc.)
    // Strictly small enclosed background holes (< 400px on 4K) surrounded by non-background strokes
    const maxHoleArea = Math.min(500, Math.max(40, Math.round(totalPixels * 0.00003)));

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const startIdx = y * width + x;
        if (!visited[startIdx] && isBackgroundPixel(x, y)) {
          let iHead = 0;
          let iTail = 0;
          const islandQueue = new Int32Array(totalPixels * 2);
          const islandPixels = new Int32Array(totalPixels);

          visited[startIdx] = 2; // Mark temporary
          islandQueue[iTail++] = x;
          islandQueue[iTail++] = y;
          islandPixels[0] = startIdx;
          let count = 1;
          let strokeBoundaryCount = 0;

          while (iHead < iTail) {
            const ix = islandQueue[iHead++];
            const iy = islandQueue[iHead++];

            for (let d = 0; d < 4; d++) {
              const nx = ix + dx[d];
              const ny = iy + dy[d];

              if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                const nidx = ny * width + nx;
                if (!visited[nidx]) {
                  if (isBackgroundPixel(nx, ny)) {
                    visited[nidx] = 2;
                    islandQueue[iTail++] = nx;
                    islandQueue[iTail++] = ny;
                    islandPixels[count++] = nidx;
                  } else {
                    // Neighbor is a non-background stroke pixel (mint green, pink, black, coral, etc.)
                    strokeBoundaryCount++;
                  }
                }
              }
            }
          }

          // Clear if small background hole is bounded by text stroke (mint, pink, coral, black)
          if (count <= maxHoleArea && strokeBoundaryCount > 4) {
            for (let k = 0; k < count; k++) {
              visited[islandPixels[k]] = 1;
            }
          }
        }
      }
    }


    // 3. Clear background & letter holes with smooth anti-aliased defringing
    for (let i = 0; i < totalPixels; i++) {
      if (visited[i] === 1) {
        const pIdx = i * 4;
        const r = data[pIdx];
        const g = data[pIdx + 1];
        const b = data[pIdx + 2];
        const minVal = Math.min(r, g, b);

        if (minVal >= 242) {
          data[pIdx + 3] = 0; // 100% transparent for background & letter holes
        } else if (minVal >= 215) {
          const alphaRatio = (255 - minVal) / 40;
          data[pIdx + 3] = Math.min(data[pIdx + 3], Math.floor((1 - alphaRatio) * 255));
        } else {
          data[pIdx + 3] = 0;
        }
      }
    }




    ctx.putImageData(imageData, 0, 0);
    return canvas;
  };




  const getTrimmedDesignBounds = (canvas: HTMLCanvasElement | HTMLImageElement) => {
    let w = canvas.width;
    let h = canvas.height;
    let ctx: CanvasRenderingContext2D | null = null;

    if (canvas instanceof HTMLCanvasElement) {
      ctx = canvas.getContext('2d');
    } else {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = w;
      tempCanvas.height = h;
      ctx = tempCanvas.getContext('2d');
      if (ctx) ctx.drawImage(canvas, 0, 0);
    }

    if (!ctx || w === 0 || h === 0) {
      return { x: 0, y: 0, width: w, height: h };
    }

    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;

    let minX = w, minY = h, maxX = 0, maxY = 0;
    let hasPixel = false;

    // Scan with alpha > 40 threshold to ignore noise
    for (let y = 0; y < h; y += 2) {
      for (let x = 0; x < w; x += 2) {
        const alpha = data[(y * w + x) * 4 + 3];
        if (alpha > 40) {
          hasPixel = true;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    if (!hasPixel || minX >= maxX || minY >= maxY) {
      return { x: 0, y: 0, width: w, height: h };
    }

    const padX = Math.round(w * 0.005);
    const padY = Math.round(h * 0.005);

    const safeMinX = Math.max(0, minX - padX);
    const safeMinY = Math.max(0, minY - padY);
    const safeMaxX = Math.min(w - 1, maxX + padX);
    const safeMaxY = Math.min(h - 1, maxY + padY);

    return {
      x: safeMinX,
      y: safeMinY,
      width: Math.max(10, safeMaxX - safeMinX + 1),
      height: Math.max(10, safeMaxY - safeMinY + 1)
    };
  };


  const drawMockup = () => {
    if (activeTab !== 'mockup') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const template = MOCKUP_TEMPLATES.find(m => m.id === selectedMockupId);
    if (!template) return;

    const designUrl = previewDesign ? previewDesign.image_url : selectedDesign?.image_url;
    if (!designUrl) return;

    const currentDrawSeq = ++drawSequenceRef.current;

    const render = (mockupImg: HTMLImageElement, designImg: HTMLImageElement | HTMLCanvasElement) => {
      const targetW = mockupImg.width || 800;
      const targetH = mockupImg.height || 800;
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }

      ctx.globalCompositeOperation = 'source-over';
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(mockupImg, 0, 0, canvas.width, canvas.height);

      ctx.globalCompositeOperation = template.overlay.blendMode as GlobalCompositeOperation;
      
      const bounds = getTrimmedDesignBounds(designImg);
      const aspect = bounds.width / bounds.height;

      const baseBoxW = template.overlay.width * mockupScale;
      const baseBoxH = template.overlay.height * mockupScale;

      let drawW = baseBoxW;
      let drawH = baseBoxW / aspect;

      if (drawH > baseBoxH) {
        drawH = baseBoxH;
        drawW = baseBoxH * aspect;
      }

      const chestCenterX = template.overlay.x + template.overlay.width / 2;
      const chestCenterY = template.overlay.y + template.overlay.height / 2;

      const finalX = chestCenterX - drawW / 2 + mockupOffsetX;
      const finalY = chestCenterY - drawH / 2 + mockupOffsetY;

      ctx.drawImage(
        designImg,
        bounds.x, bounds.y, bounds.width, bounds.height,
        finalX, finalY, drawW, drawH
      );
      ctx.globalCompositeOperation = 'source-over';
    };

    const isMockupCached = loadedMockupImgRef.current?.id === selectedMockupId;
    const isDesignCached = loadedDesignImgRef.current?.url === designUrl;

    if (isMockupCached && isDesignCached) {
      render(loadedMockupImgRef.current!.img, loadedDesignImgRef.current!.img);
      return;
    }

    let loadedMockup: HTMLImageElement | null = isMockupCached ? loadedMockupImgRef.current!.img : null;
    let loadedDesign: HTMLImageElement | HTMLCanvasElement | null = isDesignCached ? loadedDesignImgRef.current!.img : null;

    const checkAndRender = () => {
      if (currentDrawSeq !== drawSequenceRef.current) return;
      if (loadedMockup && loadedDesign) {
        render(loadedMockup, loadedDesign);
      }
    };

    if (!loadedMockup) {
      const mImg = new Image();
      mImg.crossOrigin = 'anonymous';
      mImg.src = template.imageUrl;
      mImg.onload = () => {
        loadedMockupImgRef.current = { id: selectedMockupId, img: mImg };
        loadedMockup = mImg;
        checkAndRender();
      };
    }

    if (!loadedDesign) {
      const dImg = new Image();
      dImg.crossOrigin = 'anonymous';
      dImg.src = designUrl;
      dImg.onload = () => {
        const transparentCanvas = createTransparentDesignCanvas(dImg);
        loadedDesignImgRef.current = { url: designUrl, img: transparentCanvas };
        loadedDesign = transparentCanvas;
        checkAndRender();
      };
    }
  };

  const downloadMockup = () => {
    const template = MOCKUP_TEMPLATES.find(t => t.id === selectedMockupId);
    const designUrl = previewDesign ? previewDesign.image_url : selectedDesign?.image_url;
    if (!template || !designUrl) return;

    const targetDimension = 2500; // Etsy High-Res 2500px square
    const mockupImg = new Image();
    mockupImg.crossOrigin = 'anonymous';
    mockupImg.src = template.imageUrl;

    mockupImg.onload = () => {
      const origW = mockupImg.width || 800;
      const origH = mockupImg.height || 800;
      const scaleFactor = targetDimension / Math.max(origW, origH);

      const offCanvas = document.createElement('canvas');
      offCanvas.width = Math.round(origW * scaleFactor);
      offCanvas.height = Math.round(origH * scaleFactor);
      const offCtx = offCanvas.getContext('2d');
      if (!offCtx) return;

      offCtx.imageSmoothingEnabled = true;
      offCtx.imageSmoothingQuality = 'high';

      offCtx.globalCompositeOperation = 'source-over';
      offCtx.drawImage(mockupImg, 0, 0, offCanvas.width, offCanvas.height);

      const designImg = new Image();
      designImg.crossOrigin = 'anonymous';
      designImg.src = designUrl;

      designImg.onload = () => {
        const transparentDesignCanvas = createTransparentDesignCanvas(designImg);
        offCtx.globalCompositeOperation = template.overlay.blendMode as GlobalCompositeOperation;

        const bounds = getTrimmedDesignBounds(transparentDesignCanvas);
        const aspect = bounds.width / bounds.height;

        const baseBoxW = template.overlay.width * mockupScale * scaleFactor;
        const baseBoxH = template.overlay.height * mockupScale * scaleFactor;

        let drawW = baseBoxW;
        let drawH = baseBoxW / aspect;

        if (drawH > baseBoxH) {
          drawH = baseBoxH;
          drawW = baseBoxH * aspect;
        }

        const chestCenterX = (template.overlay.x + template.overlay.width / 2) * scaleFactor;
        const chestCenterY = (template.overlay.y + template.overlay.height / 2) * scaleFactor;

        const finalX = chestCenterX - drawW / 2 + (mockupOffsetX * scaleFactor);
        const finalY = chestCenterY - drawH / 2 + (mockupOffsetY * scaleFactor);

        offCtx.drawImage(
          transparentDesignCanvas,
          bounds.x, bounds.y, bounds.width, bounds.height,
          finalX, finalY, drawW, drawH
        );
        offCtx.globalCompositeOperation = 'source-over';

        const url = offCanvas.toDataURL('image/jpeg', 0.95);
        const a = document.createElement('a');
        a.href = url;
        const designTheme = getCleanEnglishThemeName(selectedDesign?.sticker_sub, undefined, selectedDesign?.topic || selectedDesign?.title);
        a.download = `Etsy_Mockup_${designTheme}_2.5K.jpg`;
        a.click();
      };
    };
  };


  const downloadPODPrintPNG = async () => {
    const designUrl = previewDesign ? previewDesign.image_url : selectedDesign?.image_url;
    if (!designUrl) return;

    try {
      setIsProcessingPNG(true);
      const transparentDataUrl = await processTransparentPNG(designUrl, {
        targetWidth: 4000,
        targetHeight: 4000,
        tolerance: 238
      });

      const a = document.createElement('a');
      a.href = transparentDataUrl;
      const designTheme = getCleanEnglishThemeName(selectedDesign?.sticker_sub, undefined, selectedDesign?.topic || selectedDesign?.title);
      a.download = `POD_Print_${designTheme}_4K_300DPI.png`;
      a.click();
    } catch (err) {
      console.error('PNG processing failed', err);
      alert('PNG 생성 중 오류가 발생했습니다.');
    } finally {
      setIsProcessingPNG(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'edit' && selectedDesign) {
      initEditCanvas();
    }
  }, [activeTab, selectedDesign]);

  const initEditCanvas = () => {
    const canvas = editCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = selectedDesign.image_url;
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      setOriginalEditImage(canvas.toDataURL('image/png'));
      setHistory([]);
    };
  };

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    let clientX, clientY;
    
    if ('touches' in e) {
      clientX = (e as TouchEvent | React.TouchEvent).touches[0].clientX;
      clientY = (e as TouchEvent | React.TouchEvent).touches[0].clientY;
    } else {
      clientX = (e as MouseEvent | React.MouseEvent).clientX;
      clientY = (e as MouseEvent | React.MouseEvent).clientY;
    }
    
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (editMode !== 'eraser') return;
    const canvas = editCanvasRef.current;
    if (canvas) {
      setHistory(prev => [...prev, canvas.toDataURL('image/png')]);
    }
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    if (editMode !== 'eraser') return;
    setIsDrawing(false);
    const canvas = editCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.beginPath();
        ctx.globalCompositeOperation = 'source-over';
      }
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || editMode !== 'eraser') return;
    const canvas = editCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e, canvas);
    
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.globalCompositeOperation = 'destination-out';
    ctx.strokeStyle = 'rgba(0,0,0,1)';
    
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const resetEditCanvas = () => {
    const canvas = editCanvasRef.current;
    if (!canvas || !originalEditImage) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const img = new Image();
    img.src = originalEditImage;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    setTextElements([]);
    setHistory([]);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const canvas = editCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const previousState = history[history.length - 1];
    setHistory(prev => prev.slice(0, -1));
    
    const img = new Image();
    img.src = previousState;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
  };

  const getFinalCanvasDataUrl = () => {
    const canvas = editCanvasRef.current;
    if (!canvas) return null;
    
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const ctx = tempCanvas.getContext('2d');
    if (!ctx) return null;
    
    ctx.drawImage(canvas, 0, 0);
    
    textElements.forEach(t => {
      ctx.font = `${t.size}px '${t.font}'`;
      ctx.fillStyle = t.color;
      ctx.textBaseline = 'top';
      ctx.fillText(t.text, t.x, t.y);
    });
    
    return tempCanvas.toDataURL('image/jpeg', 0.95);
  };

  const saveManualEdit = async () => {
    const rawDataUrl = getFinalCanvasDataUrl();
    if (!rawDataUrl || !selectedDesign) return;
    
    setIsSavingManual(true);
    try {
      const dataUrl = await compressImageForFirestore(rawDataUrl, 800000);
      const res = await fetch('/api/designs/save-manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalId: selectedDesign.id,
          imageBase64: dataUrl,
          topic: selectedDesign.topic,
          originalPrompt: selectedDesign.prompt,
          tags: selectedDesign.tags
        })
      });
      const data = await res.json();
      if (data.success) {
        alert('성공적으로 저장되었습니다!');
        fetchDesigns(1);
      } else {
        alert('저장에 실패했습니다.');
      }
    } catch (e) {
      console.error(e);
      alert('오류가 발생했습니다.');
    }
    setIsSavingManual(false);
  };

  const downloadEditCanvas = () => {
    const url = getFinalCanvasDataUrl();
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    const designTheme = getCleanEnglishThemeName(selectedDesign?.sticker_sub, undefined, selectedDesign?.topic || selectedDesign?.title);
    a.download = `Edited_${designTheme}_${Date.now()}.jpg`;
    a.click();
  };

  const handleAddText = () => {
    setTextElements([...textElements, {
      id: Date.now().toString(),
      text: 'Hello',
      x: 50,
      y: 50,
      font: 'Pacifico',
      size: 40,
      color: '#333333'
    }]);
    setEditMode('text');
  };

  const updateTextElement = (id: string, updates: Partial<TextElement>) => {
    setTextElements(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const handleTextMouseDown = (e: React.MouseEvent | React.TouchEvent, id: string) => {
    if (editMode !== 'text') return;
    e.stopPropagation();
    setActiveTextId(id);
    setIsDraggingText(true);
    
    const canvas = editCanvasRef.current;
    if (!canvas) return;
    const { x, y } = getCoordinates(e, canvas);
    const textEl = textElements.find(t => t.id === id);
    if (textEl) {
      setDragOffset({ x: x - textEl.x, y: y - textEl.y });
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (editMode === 'eraser') {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
      setCursorPos({ x: clientX - rect.left, y: clientY - rect.top });
      
      if (isDrawing) {
        draw(e);
      }
    }
  };

  const handleCanvasMouseLeave = () => {
    setIsHoveringCanvas(false);
    handleCanvasMouseUp();
  };

  const handleCanvasMouseUp = () => {
    if (editMode === 'eraser') {
      stopDrawing();
    }
  };

  useEffect(() => {
    if (editMode === 'text' && isDraggingText && activeTextId) {
      const handleGlobalMouseMove = (e: MouseEvent | TouchEvent) => {
        const canvas = editCanvasRef.current;
        if (!canvas) return;
        const { x, y } = getCoordinates(e, canvas);
        updateTextElement(activeTextId, { x: x - dragOffset.x, y: y - dragOffset.y });
      };
      
      const handleGlobalMouseUp = () => {
        setIsDraggingText(false);
      };
      
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
      window.addEventListener('touchmove', handleGlobalMouseMove, { passive: false });
      window.addEventListener('touchend', handleGlobalMouseUp);

      return () => {
        window.removeEventListener('mousemove', handleGlobalMouseMove);
        window.removeEventListener('mouseup', handleGlobalMouseUp);
        window.removeEventListener('touchmove', handleGlobalMouseMove);
        window.removeEventListener('touchend', handleGlobalMouseUp);
      };
    }
  }, [editMode, isDraggingText, activeTextId, dragOffset]);

  const fetchStyles = async () => {
    try {
      const res = await fetch('/api/styles/list');
      const data = await res.json();
      if (data.success) {
        setStyles(data.data);
      }
    } catch (error) {
      console.error('Error fetching styles:', error);
    }
  };

  const handleUpdateStyle = async (id: string) => {
    if (!editingStyleName.trim()) return;
    try {
      const res = await fetch('/api/styles/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name: editingStyleName })
      });
      if (res.ok) {
        setStyles(styles.map(s => s.id === id ? { ...s, name: editingStyleName } : s));
        setEditingStyleId(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleLikeDesign = async (id: string, is_liked: boolean) => {
    try {
      const res = await fetch('/api/designs/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_liked })
      });
      if (res.ok) {
        setDesigns(designs.map(d => d.id === id ? { ...d, is_liked } : d));
        if (selectedDesign?.id === id) {
          setSelectedDesign({ ...selectedDesign, is_liked });
        }
      } else {
        const data = await res.json();
        alert('좋아요 설정 실패: ' + data.error);
      }
    } catch (e) {
      console.error('Like toggle failed', e);
      alert('오류가 발생했습니다.');
    }
  };

  const handleDeleteStyle = async (id: string) => {
    if (!confirm('정말 이 화풍을 삭제하시겠습니까?')) return;
    try {
      const res = await fetch('/api/styles/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        setStyles(styles.filter(s => s.id !== id));
        if (selectedStyleId === id) setSelectedStyleId('');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const downloadBatchSession = async (
    targetDesigns: any[],
    sessionName: string,
    options?: { splitForEtsy?: boolean }
  ) => {
    if (!targetDesigns || targetDesigns.length === 0) {
      alert('다운로드할 스티커가 없습니다.');
      return;
    }
    if (isExportingBundle) return; // Prevent duplicate clicks

    const splitForEtsy = options?.splitForEtsy !== false; // Default: true for Etsy 20MB compliance

    try {
      setIsExportingBundle(true);
      setIsBatchZipModalOpen(false);
      setExportBundleProgress({ current: 0, total: targetDesigns.length, message: 'ZIP 파일 생성 준비 중...' });

      // 🚨 CRITICAL GUARANTEE: Strictly exclude any apparel, POD products, or mockups from sticker bundle!
      const items = targetDesigns.filter(d => {
        if (!d) return false;
        if (d.design_type === 'pod' || d.is_mockup === true) return false;
        if (d.design_type !== 'sticker' && !d.stickerPresetId) {
          const titleOnly = `${d.title || ''} ${d.topic || ''}`.toLowerCase();
          if (
            titleOnly.includes('t-shirt') ||
            titleOnly.includes('tshirt') ||
            titleOnly.includes('티셔츠') ||
            titleOnly.includes('mockup') ||
            titleOnly.includes('목업')
          ) {
            return false;
          }
        }
        return true;
      });
      items.sort((a, b) => {
        const aIsCover = isCoverDesign(a);
        const bIsCover = isCoverDesign(b);
        if (aIsCover && !bIsCover) return -1;
        if (!aIsCover && bIsCover) return 1;
        const aTime = new Date(a.created_at || 0).getTime();
        const bTime = new Date(b.created_at || 0).getTime();
        return aTime - bTime;
      });

      const themeName = getCleanEnglishThemeName(
        items[0]?.sticker_sub,
        selectedStickerSeriesTab,
        sessionName || items[0]?.topic
      );
      const cleanSessionName = `${themeName}_Sticker_Bundle`;

      const totalItems = items.length;
      let stickerCounter = 1;
      const processedStickers: any[] = [];
      let coverFile: { fileName: string; bytes: Uint8Array } | null = null;
      const stickerFiles: { fileName: string; bytes: Uint8Array }[] = [];

      for (let i = 0; i < totalItems; i++) {
        const d = items[i];
        const isCover = i === 0 || isCoverDesign(d);
        const rawUrl = d.transparent_png_url || (d.id ? `/api/designs/image?id=${d.id}` : d.image_url || d.url);
        if (!rawUrl) continue;

        setExportBundleProgress({
          current: i + 1,
          total: totalItems,
          message: isCover 
            ? `마스터 표지 패키징 중 (${i + 1}/${totalItems})...` 
            : `스티커 투명 배경 처리 중 (${i + 1}/${totalItems})...`
        });

        // Yield to browser main thread so UI updates smoothly
        await new Promise(resolve => setTimeout(resolve, 15));

        try {
          if (isCover) {
            // Master Cover: MUST have solid white (#FFFFFF) background! Never transparent!
            const img = new Image();
            img.crossOrigin = 'anonymous';
            await new Promise((resolve) => {
              img.onload = resolve;
              img.onerror = () => {
                const fb = new Image();
                fb.onload = resolve;
                fb.onerror = resolve;
                fb.src = rawUrl;
              };
              img.src = rawUrl;
            });

            const coverCanvas = document.createElement('canvas');
            const cw = Math.max(img.naturalWidth || 3000, 3000);
            const ch = Math.max(img.naturalHeight || 3000, 3000);
            coverCanvas.width = cw;
            coverCanvas.height = ch;
            const cctx = coverCanvas.getContext('2d');
            if (cctx) {
              cctx.fillStyle = '#FFFFFF';
              cctx.fillRect(0, 0, cw, ch);
              cctx.drawImage(img, 0, 0, cw, ch);
            }

            // Master Cover: 3000x3000px solid white background.
            // Exported as high-res JPEG (0.94) to keep file under 1.5MB (vs 8MB PNG) and protect Part 1 from exceeding 20MB.
            const coverDataUrl = coverCanvas.toDataURL('image/jpeg', 0.94);
            coverCanvas.width = 0;
            coverCanvas.height = 0;
            const base64Data = coverDataUrl.split(',')[1];
            const binaryString = atob(base64Data);
            const bytes = new Uint8Array(binaryString.length);
            for (let b = 0; b < binaryString.length; b++) bytes[b] = binaryString.charCodeAt(b);

            coverFile = {
              fileName: `00_Master_Cover_${themeName}_300DPI.jpg`,
              bytes,
            };
          } else {
            // Sticker item: Process high-res transparent PNG
            const transparentDataUrl = await processTransparentPNG(rawUrl, {
              targetWidth: 2400,
              targetHeight: 2400,
            });

            const base64Data = transparentDataUrl.split(',')[1];
            const binaryString = atob(base64Data);
            const bytes = new Uint8Array(binaryString.length);
            for (let b = 0; b < binaryString.length; b++) {
              bytes[b] = binaryString.charCodeAt(b);
            }

            const fileName = `${String(stickerCounter).padStart(2, '0')}_${themeName}_Sticker_300DPI.png`;
            stickerFiles.push({ fileName, bytes });
            stickerCounter++;

            processedStickers.push({
              ...d,
              processedTransparentDataUrl: transparentDataUrl,
            });
          }
        } catch (err) {
          console.error(`Error processing image index ${i} for ZIP:`, err);
        }
      }

      // Generate and package BOTH Transparent and White A4 Printable Sticker Sheets
      const printableFiles: { fileName: string; bytes: Uint8Array }[] = [];
      if (processedStickers.length > 0) {
        setExportBundleProgress({
          current: totalItems,
          total: totalItems,
          message: 'A4 인쇄용 시트 (투명 및 화이트) 생성 중...'
        });
        await new Promise(resolve => setTimeout(resolve, 15));

        try {
          // Efficiently generate BOTH Transparent (Cricut) and White (Home Printers) A4 sheets in a single pass
          const { transparentPages, whitePages } = await generateA4StickerSheetsPair(processedStickers, { pageSize: 20 });

          // 1. Transparent Background A4 Sheets (Optimized for Cricut / Silhouette cutting machines)
          for (let p = 0; p < transparentPages.length; p++) {
            const a4Base64 = transparentPages[p].split(',')[1];
            const a4Binary = atob(a4Base64);
            const a4Bytes = new Uint8Array(a4Binary.length);
            for (let b = 0; b < a4Binary.length; b++) {
              a4Bytes[b] = a4Binary.charCodeAt(b);
            }
            const sheetSuffix = transparentPages.length > 1 ? `_Sheet${p + 1}` : '';
            printableFiles.push({
              fileName: `00_A4_Printable${sheetSuffix}_Transparent_For_Cricut.png`,
              bytes: a4Bytes,
            });
          }

          // 2. Solid White Background A4 Sheets (Full 300 DPI High-Res JPG for Home Printers)
          for (let p = 0; p < whitePages.length; p++) {
            const a4Base64 = whitePages[p].split(',')[1];
            const a4Binary = atob(a4Base64);
            const a4Bytes = new Uint8Array(a4Binary.length);
            for (let b = 0; b < a4Binary.length; b++) {
              a4Bytes[b] = a4Binary.charCodeAt(b);
            }
            const sheetSuffix = whitePages.length > 1 ? `_Sheet${p + 1}` : '';
            printableFiles.push({
              fileName: `00_A4_Printable${sheetSuffix}_White_For_Home_Printers_300DPI.jpg`,
              bytes: a4Bytes,
            });
          }
        } catch (a4Err) {
          console.error('Error generating A4 sheets for ZIP bundle:', a4Err);
        }
      }

      const triggerDownload = (blob: Blob, filename: string) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      };

      // Determine Packaging Strategy:
      // Etsy strictly enforces MAX 5 files per listing and MAX 20.00MB per file.
      if (splitForEtsy && stickerFiles.length > 10) {
        const parts: { name: string; folderName: string; files: { fileName: string; bytes: Uint8Array }[] }[] = [];

        if (stickerFiles.length > 20) {
          // 40-pack: Divide into 5 Etsy parts (max 5 files on Etsy, each ~10-15MB < 20MB limit):
          // Part 1: Cover + Stickers 01..10
          // Part 2: Stickers 11..20
          // Part 3: Stickers 21..30
          // Part 4: Stickers 31..40
          // Part 5: 4 A4 Printable Sheets
          const p1Files: { fileName: string; bytes: Uint8Array }[] = [];
          if (coverFile) p1Files.push(coverFile);
          p1Files.push(...stickerFiles.slice(0, 10));
          parts.push({
            name: `01_${themeName}_Part1_Stickers_01-10_300DPI.zip`,
            folderName: `${cleanSessionName}_Part1`,
            files: p1Files,
          });

          parts.push({
            name: `02_${themeName}_Part2_Stickers_11-20_300DPI.zip`,
            folderName: `${cleanSessionName}_Part2`,
            files: stickerFiles.slice(10, 20),
          });

          parts.push({
            name: `03_${themeName}_Part3_Stickers_21-30_300DPI.zip`,
            folderName: `${cleanSessionName}_Part3`,
            files: stickerFiles.slice(20, 30),
          });

          parts.push({
            name: `04_${themeName}_Part4_Stickers_31-40_300DPI.zip`,
            folderName: `${cleanSessionName}_Part4`,
            files: stickerFiles.slice(30, 40),
          });

          parts.push({
            name: `05_${themeName}_Part5_Printable_A4_Sheets_300DPI.zip`,
            folderName: `${cleanSessionName}_Printables`,
            files: printableFiles,
          });
        } else {
          // 20-pack: Divide into exactly 3 Etsy parts (each safely ~10-12MB < 20MB limit, 3 files <= 5 files):
          // Part 1: Cover + Stickers 01..10 (~11MB)
          // Part 2: Stickers 11..20 (~10MB)
          // Part 3: Printable A4 Sheets (~5MB, Transparent for Cricut + White for Home Printers)
          const p1Files: { fileName: string; bytes: Uint8Array }[] = [];
          if (coverFile) p1Files.push(coverFile);
          p1Files.push(...stickerFiles.slice(0, 10));
          parts.push({
            name: `01_${themeName}_Part1_Stickers_01-10_300DPI.zip`,
            folderName: `${cleanSessionName}_Part1`,
            files: p1Files,
          });

          parts.push({
            name: `02_${themeName}_Part2_Stickers_11-20_300DPI.zip`,
            folderName: `${cleanSessionName}_Part2`,
            files: stickerFiles.slice(10, 20),
          });

          parts.push({
            name: `03_${themeName}_Part3_Printable_A4_Sheets_300DPI.zip`,
            folderName: `${cleanSessionName}_Printables`,
            files: printableFiles,
          });
        }

        for (let p = 0; p < parts.length; p++) {
          setExportBundleProgress({
            current: totalItems,
            total: totalItems,
            message: `[Etsy 분할 ${p + 1}/${parts.length}] ${parts[p].name} 압축 및 다운로드 중...`
          });
          await new Promise(resolve => setTimeout(resolve, 30));

          const partZip = new JSZip();
          const pFolder = partZip.folder(parts[p].folderName);
          for (const f of parts[p].files) {
            pFolder?.file(f.fileName, f.bytes);
          }

          const blob = await partZip.generateAsync({
            type: 'blob',
            compression: 'DEFLATE',
            compressionOptions: { level: 9 }
          });
          const mbSize = (blob.size / (1024 * 1024)).toFixed(2);
          console.log(`[Etsy ZIP ${p + 1}/${parts.length}] ${parts[p].name} generated: ${mbSize} MB`);

          triggerDownload(blob, parts[p].name);
          if (p < parts.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 800));
          }
        }
      } else {
        // Single Unified ZIP (for Creative Fabrica or packs <= 20 stickers)
        setExportBundleProgress({
          current: totalItems,
          total: totalItems,
          message: '통합 ZIP 압축 패키징 및 다운로드 중...'
        });
        await new Promise(resolve => setTimeout(resolve, 30));

        const singleZip = new JSZip();
        const sFolder = singleZip.folder(cleanSessionName);
        if (coverFile) {
          sFolder?.file(coverFile.fileName, coverFile.bytes);
        }
        for (const f of stickerFiles) {
          sFolder?.file(f.fileName, f.bytes);
        }
        for (const f of printableFiles) {
          sFolder?.file(f.fileName, f.bytes);
        }

        const zipBlob = await singleZip.generateAsync({
          type: 'blob',
          compression: 'DEFLATE',
          compressionOptions: { level: 9 }
        });
        triggerDownload(zipBlob, `${cleanSessionName}_300DPI.zip`);
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'ZIP 번들 파일 생성 중 오류가 발생했습니다.');
    } finally {
      setIsExportingBundle(false);
      setExportBundleProgress(null);
    }
  };

  const handleExportZIPBundle = async () => {
    const currentTab = selectedStickerSeriesTab;
    let bundleName = 'Dessert_20_Stickers_Bundle';
    let seriesTitle = '[미국 유행 디저트 & 베이커리 (20종)]';

    if (currentTab === 'dessert20') {
      bundleName = 'Dessert_20_Stickers_Bundle';
      seriesTitle = '[미국 유행 디저트 & 베이커리 (20종)]';
    } else if (currentTab === 'socialbattery20') {
      bundleName = 'Social_Battery_20_Stickers_Bundle';
      seriesTitle = '[사회적 배터리 & 내향인 (20종)]';
    } else if (currentTab === 'hangul20') {
      bundleName = 'Hangul_K_Vibe_20_Stickers_Bundle';
      seriesTitle = '[K-감성 한글 & 아기 동물 (20종)]';
    } else if (currentTab === 'booktok20') {
      bundleName = 'BookTok_20_Stickers_Bundle';
      seriesTitle = '[북톡 & 코지 리딩 (20종)]';
    } else if (currentTab === 'terrarium20') {
      bundleName = 'Terrarium_20_Stickers_Bundle';
      seriesTitle = '[테라리움 완성 세트 (20종)]';
    } else if (currentTab === 'vivarium20') {
      bundleName = 'Vivarium_20_Stickers_Bundle';
      seriesTitle = '[비바리움 완성 세트 (20종)]';
    } else if (currentTab === 'saltaquarium20') {
      bundleName = 'Saltwater_Aquarium_20_Stickers_Bundle';
      seriesTitle = '[해수어항 완성 세트 (20종)]';
    } else if (currentTab === 'freshaquarium20') {
      bundleName = 'Freshwater_Aquarium_20_Stickers_Bundle';
      seriesTitle = '[열대어 어항 완성 세트 (20종)]';
    }

    try {
      setIsExportingBundle(true);

      // Fetch all designs using client-side cached pool to save Firestore read quota
      let allFetchedDesigns: any[] = [];
      try {
        const pool = await getCachedStickersPool();
        if (pool && pool.length > 0) {
          allFetchedDesigns = pool;
        } else {
          allFetchedDesigns = designs;
        }
      } catch (e) {
        allFetchedDesigns = designs;
      }

      if (!allFetchedDesigns || allFetchedDesigns.length === 0) {
        alert('다운로드할 디자인이 없습니다. 먼저 아래 템플릿 카드의 [생성] 버튼을 눌러 디자인을 만들어 주세요.');
        setIsExportingBundle(false);
        return;
      }

      const filteredDesigns = allFetchedDesigns.filter((d) => {
        const presetId = (d.stickerPresetId || d.id || '').toLowerCase();
        const textToScan = `${d.title || ''} ${d.prompt || ''} ${d.topic || ''} ${d.feedback_applied || ''}`.toLowerCase();
        const sub = d.sticker_sub;

        if (currentTab === 'dessert20') {
          return sub === 'dessert' || presetId.startsWith('dessert') || textToScan.includes('dessert') || textToScan.includes('디저트') || textToScan.includes('베이커리');
        } else if (currentTab === 'socialbattery20') {
          return sub === 'socialbattery' || presetId.startsWith('social-battery') || presetId.startsWith('socialbattery') || textToScan.includes('social battery') || textToScan.includes('사회적 배터리') || textToScan.includes('내향');
        } else if (currentTab === 'hangul20') {
          return sub === 'hangul' || presetId.startsWith('hangul') || textToScan.includes('hangul') || textToScan.includes('한글') || textToScan.includes('k-감성') || textToScan.includes('대박') || textToScan.includes('괜찮아');
        } else if (currentTab === 'booktok20') {
          return sub === 'booktok' || presetId.startsWith('booktok') || textToScan.includes('booktok') || textToScan.includes('북톡') || textToScan.includes('독서');
        } else if (currentTab === 'terrarium20') {
          return sub === 'terrarium' || presetId.startsWith('terrarium') || textToScan.includes('terrarium') || textToScan.includes('테라리움');
        } else if (currentTab === 'vivarium20') {
          return sub === 'vivarium' || presetId.startsWith('vivarium') || textToScan.includes('vivarium') || textToScan.includes('비바리움');
        } else if (currentTab === 'saltaquarium20') {
          return sub === 'saltaquarium' || presetId.startsWith('salt-aquarium') || presetId.startsWith('saltaquarium') || textToScan.includes('saltaquarium') || textToScan.includes('saltwater') || textToScan.includes('해수어항');
        } else {
          return sub === 'freshaquarium' || presetId.startsWith('fresh-aquarium') || presetId.startsWith('freshaquarium') || textToScan.includes('freshaquarium') || textToScan.includes('freshwater') || textToScan.includes('열대어어항') || textToScan.includes('열대어 어항');
        }
      });

      if (filteredDesigns.length === 0) {
        const confirmDownload = confirm(`현재 ${seriesTitle} 전용으로 생성된 스티커가 없습니다.\n전체 저장된 이미지(${allFetchedDesigns.length}장)를 다운로드하시겠습니까?`);
        if (!confirmDownload) {
          setIsExportingBundle(false);
          return;
        }
      }

      const pool = filteredDesigns.length > 0 ? filteredDesigns : allFetchedDesigns;
      pool.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());

      // Identify all Master Cover items using robust isCoverDesign check
      const covers = pool.filter(d => isCoverDesign(d));

      const sessions: any[] = [];

      if (covers.length > 0) {
        covers.forEach((cover, idx) => {
          const coverTime = new Date(cover.created_at || 0).getTime();
          const coverCategory = getDesignCategoryKey(cover);
          const matchedStickers = pool.filter(d => {
            if (isCoverDesign(d)) return false;
            if (d.design_type === 'pod' || d.is_mockup === true) return false;
            const itemCategory = getDesignCategoryKey(d);
            if (coverCategory !== 'other' && itemCategory !== 'other' && coverCategory !== itemCategory) return false;
            const itemTime = new Date(d.created_at || 0).getTime();
            return (coverTime > 0 && itemTime > 0 && Math.abs(itemTime - coverTime) <= 120 * 60 * 1000) ||
                   (coverCategory !== 'other' && itemCategory === coverCategory);
          });
          const { finalStickers: batchStickers } = organizePackStickers(matchedStickers, cover);

          const dateObj = new Date(cover.created_at || Date.now());
          const formattedDate = dateObj.toLocaleDateString('ko-KR', {
            year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
          });

          sessions.push({
            id: cover.id || `session-${idx}`,
            batchName: `${bundleName}_Batch_${covers.length - idx}`,
            dateStr: formattedDate,
            cover,
            stickers: batchStickers,
            totalCount: 1 + batchStickers.length,
            isLatest: idx === 0
          });
        });
      } else {
        // Fallback: If no explicit cover design is found, group the latest 20 items into a session
        const fallbackCover = pool[0];
        const fallbackStickers = pool.slice(1, 21);
        const dateObj = new Date(fallbackCover?.created_at || Date.now());
        const formattedDate = dateObj.toLocaleDateString('ko-KR', {
          year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
        });

        sessions.push({
          id: `fallback-session`,
          batchName: `${bundleName}_Batch_1`,
          dateStr: formattedDate,
          cover: fallbackCover,
          stickers: fallbackStickers,
          totalCount: pool.length > 21 ? 21 : pool.length,
          isLatest: true
        });
      }

      // Open Modal Window ALWAYS so user can see batch choices!
      setBatchZipSessions(sessions);
      setAllZipPool(pool);
      setIsExportingBundle(false);
      setIsBatchZipModalOpen(true);
    } catch (err: any) {
      alert(err.message || 'ZIP 번들 파일 생성 중 오류가 발생했습니다.');
      setIsExportingBundle(false);
    }
  };

  const handleGenerateStandaloneFromTank = async (design: any) => {
    if (!design || !design.image_url) return;
    setIsBatchGenerating(true);
    try {
      const subKey = getDesignCategoryKey(design);
      const promptText = `A cute die-cut sticker design featuring ONLY the standalone single main object (plant, animal, reptile, or fish) extracted from this reference image. NO glass jar, NO glass tank, NO container, NO background scenery. Pure solid white background (#FFFFFF). Crisp white die-cut border.`;
      const titleText = `${design.title || '어항 스티커'} (단일 낱개 1:1 추출)`;

      const res = await fetch('/api/designs/from-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: design.image_url,
          prompt: promptText,
          title: titleText,
          isPreview: true,
          styleId: selectedStyleId,
          catchphrase: '',
          autoPhrase: false
        })
      });
      const data = await res.json();
      if (data.success && data.data) {
        const compressedUrl = await compressImageForFirestore(data.data.image_url, 800000);
        const designToSave = {
          ...data.data,
          image_url: compressedUrl,
          title: titleText,
          topic: titleText,
          sticker_sub: subKey !== 'other' ? subKey : 'terrarium',
          design_type: 'sticker',
          is_deleted: false
        };

        await fetch('/api/designs/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: data.data.id,
            designData: designToSave
          })
        });

        alert(`✨ 선택한 어항 이미지에서 1:1 맞춤 화풍의 단일 낱개 스티커 추출/생성이 완료되었습니다!`);
        await fetchDesigns(1, false);
      } else {
        alert('단일 낱개 추출 생성 실패: ' + (data.error || '오류 발생'));
      }
    } catch (e: any) {
      console.error(e);
      alert('오류가 발생했습니다.');
    } finally {
      setIsBatchGenerating(false);
    }
  };

  const handleBatchGenerateSeries = async (packType: string) => {
    let targetPresets = TERRARIUM_20_SERIES;
    let targetStandalonePresets = TERRARIUM_STANDALONE_20_SERIES;
    let isBothMode = packType.endsWith('_both');
    const baseType = packType.replace('_both', '');
    let packName = '[북톡 & 코지 리딩 20종 스티커 팩]';
    let subKey = 'booktok';

    if (baseType.startsWith('dessert')) {
      targetPresets = DESSERT_20_SERIES;
      targetStandalonePresets = DESSERT_20_SERIES;
      packName = '[미국 유행 디저트 & 베이커리 20종 스티커 팩]';
      subKey = 'dessert';
    } else if (baseType.startsWith('socialbattery') || baseType.startsWith('social-battery')) {
      targetPresets = SOCIAL_BATTERY_20_SERIES;
      targetStandalonePresets = SOCIAL_BATTERY_20_SERIES;
      packName = '[사회적 배터리 & 내향인 20종 스티커 팩]';
      subKey = 'socialbattery';
    } else if (baseType.startsWith('hangul')) {
      targetPresets = HANGUL_20_SERIES;
      targetStandalonePresets = HANGUL_20_SERIES;
      packName = '[K-감성 한글 & 아기 동물 20종 스티커 팩]';
      subKey = 'hangul';
    } else if (baseType.startsWith('booktok')) {
      targetPresets = BOOKTOK_20_SERIES;
      targetStandalonePresets = BOOKTOK_20_SERIES;
      packName = '[북톡 & 코지 리딩 20종 스티커 팩]';
      subKey = 'booktok';
    } else if (baseType.startsWith('terrarium')) {
      targetPresets = baseType.includes('standalone') ? TERRARIUM_STANDALONE_20_SERIES : TERRARIUM_20_SERIES;
      targetStandalonePresets = TERRARIUM_STANDALONE_20_SERIES;
      packName = isBothMode ? '[테라리움 어항세트 + 단일식물 40종 1:1 맞춤 팩]' : (baseType.includes('standalone') ? '[테라리움 단일 식물/오브제 20종 팩]' : '[테라리움 완성 세트 20종 팩]');
      subKey = 'terrarium';
    } else if (baseType.startsWith('vivarium')) {
      targetPresets = baseType.includes('standalone') ? VIVARIUM_STANDALONE_20_SERIES : VIVARIUM_20_SERIES;
      targetStandalonePresets = VIVARIUM_STANDALONE_20_SERIES;
      packName = isBothMode ? '[비바리움 어항세트 + 단일동물 40종 1:1 맞춤 팩]' : (baseType.includes('standalone') ? '[비바리움 단일 동물 20종 팩]' : '[비바리움 완성 세트 20종 팩]');
      subKey = 'vivarium';
    } else if (baseType.startsWith('saltaquarium')) {
      targetPresets = baseType.includes('standalone') ? SALT_AQUARIUM_STANDALONE_20_SERIES : SALT_AQUARIUM_20_SERIES;
      targetStandalonePresets = SALT_AQUARIUM_STANDALONE_20_SERIES;
      packName = isBothMode ? '[해수어항 어항세트 + 단일해수어 40종 1:1 맞춤 팩]' : (baseType.includes('standalone') ? '[해수어항 단일 해수어 20종 팩]' : '[해수어항 완성 세트 20종 팩]');
      subKey = 'saltaquarium';
    } else if (baseType.startsWith('freshaquarium')) {
      targetPresets = baseType.includes('standalone') ? FRESH_AQUARIUM_STANDALONE_20_SERIES : FRESH_AQUARIUM_20_SERIES;
      targetStandalonePresets = FRESH_AQUARIUM_STANDALONE_20_SERIES;
      packName = isBothMode ? '[열대어어항 어항세트 + 단일열대어 40종 1:1 맞춤 팩]' : (baseType.includes('standalone') ? '[열대어 어항 단일 열대어 20종 팩]' : '[열대어 어항 완성 세트 20종 팩]');
      subKey = 'freshaquarium';
    } else if (baseType.startsWith('christmas')) {
      targetPresets = baseType.includes('standalone') ? CHRISTMAS_STANDALONE_20_SERIES : CHRISTMAS_20_SERIES;
      targetStandalonePresets = CHRISTMAS_STANDALONE_20_SERIES;
      packName = isBothMode ? '[크리스마스 스노우볼 + 단일오브젝트 40종 1:1 맞춤 팩]' : (baseType.includes('standalone') ? '[크리스마스 단일 오브젝트 20종 팩]' : '[크리스마스 스노우볼 완성 세트 20종 팩]');
      subKey = 'christmas';
    } else if (baseType.startsWith('halloween')) {
      targetPresets = baseType.includes('standalone') ? HALLOWEEN_STANDALONE_20_SERIES : HALLOWEEN_20_SERIES;
      targetStandalonePresets = HALLOWEEN_STANDALONE_20_SERIES;
      packName = isBothMode ? '[할로윈 스푸키큐트 + 단일오브젝트 40종 1:1 맞춤 팩]' : (baseType.includes('standalone') ? '[할로윈 단일 오브젝트 20종 팩]' : '[할로윈 스푸키큐트 완성 세트 20종 팩]');
      subKey = 'halloween';
    } else if (baseType.startsWith('thanksgiving')) {
      targetPresets = baseType.includes('standalone') ? THANKSGIVING_STANDALONE_20_SERIES : THANKSGIVING_20_SERIES;
      targetStandalonePresets = THANKSGIVING_STANDALONE_20_SERIES;
      packName = isBothMode ? '[추수감사절 코지어텀 + 단일오브젝트 40종 1:1 맞춤 팩]' : (baseType.includes('standalone') ? '[추수감사절 단일 오브젝트 20종 팩]' : '[추수감사절 코지어텀 완성 세트 20종 팩]');
      subKey = 'thanksgiving';
    } else {
      const cleanSeasonId = baseType.replace('20_standalone', '').replace('20', '');
      const seasonalPack = getSeasonalPackPresets(cleanSeasonId);
      targetPresets = baseType.includes('standalone') ? seasonalPack.standaloneSeries : seasonalPack.vesselSeries;
      targetStandalonePresets = seasonalPack.standaloneSeries;
      const titleKo = getStickerSeriesTitle(baseType).split(' ')[1] || cleanSeasonId;
      packName = isBothMode ? `[${titleKo} 완성세트 + 낱개 40종 1:1 맞춤 팩]` : (baseType.includes('standalone') ? `[${titleKo} 단일 오브젝트 20종 팩]` : `[${titleKo} 완성 세트 20종 팩]`);
      subKey = cleanSeasonId;
    }

    const totalExpectedCount = isBothMode ? 1 + (targetPresets.length - 1) * 2 : targetPresets.length;
    const totalStickerItems = isBothMode ? (targetPresets.length - 1) * 2 : targetPresets.length - 1;

    const confirmed = confirm(
      `${packName} 자동 일괄 생성을 시작하시겠습니까?\n\n• ${isBothMode ? '마스터 표지 1장 + 메인 테마 세트 20종 + 1:1 맞춤 단독 낱개 20종 (총 41장 동시 생성)' : `마스터 썸네일 표지 1장 + 스티커 20종 (총 ${targetPresets.length}장)`}\n\n300DPI 고화질 PNG 이미지가 순차적으로 연속 자동 생성되어 갤러리에 저장됩니다.`
    );
    if (!confirmed) return;

    setIsBatchGenerating(true);
    setActiveBatchPackId(packType);
    setBatchCompletionNotice(null);
    let successCount = 0;

    let coverDocData: any = null;

    const generateWithRetry = async (prompt: string, title: string, maxAttempts: number = 3) => {
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          const res = await fetch('/api/designs/from-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imageBase64: '',
              prompt,
              title,
              isPreview: true,
              styleId: selectedStyleId,
              catchphrase: '',
              autoPhrase: false
            })
          });
          const data = await res.json();
          if (data.success && data.data?.image_url) {
            return data;
          }
          console.warn(`[Batch Retry] Attempt ${attempt}/${maxAttempts} for "${title}" non-success:`, data?.error);
        } catch (err) {
          console.warn(`[Batch Retry] Attempt ${attempt}/${maxAttempts} for "${title}" network error:`, err);
        }
        if (attempt < maxAttempts) {
          await new Promise(r => setTimeout(r, 2000 * attempt));
        }
      }
      return null;
    };

    for (let i = 0; i < targetPresets.length; i++) {
      const isCover = i === 0;

      if (isCover) {
        // Master Cover generation
        const preset = targetPresets[0];
        const itemName = formatCoverTitleWithCount(preset.name, totalStickerItems);
        const itemPrompt = formatCoverPromptWithCount(preset.prompt, totalStickerItems);

        setBatchProgress({
          current: 1,
          total: totalExpectedCount,
          label: itemName,
          packTitle: packName
        });

        try {
          const data = await generateWithRetry(itemPrompt, itemName, 3);
          if (data && data.success && data.data) {
            const compressedUrl = await compressImageForFirestore(data.data.image_url, 800000);
            coverDocData = {
              ...data.data,
              image_url: compressedUrl,
              title: itemName,
              topic: itemName,
              stickerPresetId: preset.id,
              sticker_sub: subKey,
              design_type: 'sticker',
              is_deleted: false
            };

            await fetch('/api/designs/save', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id: data.data.id,
                designData: coverDocData
              })
            });
            successCount++;
            fetchDesigns(1, false);
          }
        } catch (e) {
          console.error('Failed to generate cover:', e);
        }
        continue;
      }

      // For i > 0 (Main stickers):
      // GOLDEN COMPROMISE: Generate glorious original AI vessels + clean standalone theme stickers!
      const vesselPreset = targetPresets[i];
      const standalonePreset = targetStandalonePresets[i] || targetPresets[i];

      // 1. Generate Glorious Original AI Vessel/Tank Sticker
      setBatchProgress({
        current: isBothMode ? (i - 1) * 2 + 2 : i + 1,
        total: totalExpectedCount,
        label: `${vesselPreset.name} (화려한 어항 본품 AI 생성)`,
        packTitle: packName
      });

      try {
        const data = await generateWithRetry(vesselPreset.prompt, vesselPreset.name, 3);
        if (data && data.success && data.data?.image_url) {
          const compressedUrl = await compressImageForFirestore(data.data.image_url, 800000);
          await fetch('/api/designs/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: data.data.id,
              designData: {
                ...data.data,
                image_url: compressedUrl,
                title: vesselPreset.name,
                topic: vesselPreset.name,
                stickerPresetId: vesselPreset.id,
                sticker_sub: subKey,
                design_type: 'sticker',
                is_deleted: false
              }
            })
          });
          successCount++;
        }
      } catch (e) {
        console.error(`Failed to generate vessel sticker for ${vesselPreset.name}:`, e);
      }

      // 2. If in both mode, generate clean standalone theme sticker (Zero crops, pure full-body single sticker!)
      if (isBothMode && standalonePreset) {
        setBatchProgress({
          current: (i - 1) * 2 + 3,
          total: totalExpectedCount,
          label: `${standalonePreset.name} (깨끗한 테마 단독 스티커 AI 생성)`,
          packTitle: packName
        });

        try {
          const data = await generateWithRetry(standalonePreset.prompt, standalonePreset.name, 3);
          if (data && data.success && data.data?.image_url) {
            const compressedUrl = await compressImageForFirestore(data.data.image_url, 800000);
            await fetch('/api/designs/save', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id: data.data.id,
                designData: {
                  ...data.data,
                  image_url: compressedUrl,
                  title: standalonePreset.name,
                  topic: standalonePreset.name,
                  stickerPresetId: standalonePreset.id,
                  sticker_sub: subKey,
                  design_type: 'sticker',
                  is_deleted: false
                }
              })
            });
            successCount++;
          }
        } catch (e) {
          console.error(`Failed to generate standalone sticker for ${standalonePreset.name}:`, e);
        }
      }
    }


    invalidateClientPoolCache();
    setIsBatchGenerating(false);
    setActiveBatchPackId(null);
    setBatchCompletionNotice({
      packId: subKey,
      packName,
      successCount,
      totalExpectedCount
    });
    fetchDesigns(1, false);
  };

  const fetchDesigns = async (currentPage: number = 1, showSpinner: boolean = true, subOverride?: string, searchOverride?: string, forceNoCache: boolean = false) => {
    const activeSub = subOverride !== undefined ? subOverride : selectedStickerSubTab;
    const activeSearch = searchOverride !== undefined ? searchOverride : searchKeyword;
    const onlyCoversParam = selectedCategoryTab === 'sticker' ? '&onlyCovers=true' : '';
    const cacheKey = `${selectedCategoryTab}_${activeSub}_${activeSearch.trim()}_${currentPage}_${onlyCoversParam}`;
    const now = Date.now();

    // 1. Check client-side gallery page cache (instant 0ms response, 0 Firestore reads)
    if (!forceNoCache) {
      const cached = galleryPageCache.get(cacheKey);
      if (cached && (now - cached.timestamp < GALLERY_CACHE_TTL_MS)) {
        const cachedData = cached.data;
        setDbApiError(null);
        setDesigns(cachedData.data || []);
        const newTotalPages = cachedData.totalPages || 1;
        setTotalPages(newTotalPages);
        setTotalCount(cachedData.total || 0);
        if (cachedData.podCount !== undefined) setPodCount(cachedData.podCount);
        if (cachedData.stickerCount !== undefined) setStickerCount(cachedData.stickerCount);
        if (cachedData.stickerSubCounts !== undefined) setStickerSubCounts(cachedData.stickerSubCounts);
        if (currentPage > newTotalPages && newTotalPages > 0) {
          setPage(newTotalPages);
        }
        return;
      }
    } else {
      galleryPageCache.clear();
    }

    if (showSpinner) setLoadingInitial(true);
    try {
      const nocacheParam = forceNoCache ? '&nocache=true' : '';
      const res = await fetch(`/api/designs?page=${currentPage}&limit=12&type=${selectedCategoryTab}&subType=${activeSub}&search=${encodeURIComponent(activeSearch.trim())}${onlyCoversParam}${nocacheParam}`);
      const data = await res.json();
      if (data.success) {
        galleryPageCache.set(cacheKey, { data, timestamp: now });
        if (currentPage === 1 && selectedCategoryTab === 'sticker' && activeSub === 'all' && !activeSearch) {
          try {
            sessionStorage.setItem('mypod_initial_page_data_v1', JSON.stringify({ data, timestamp: now }));
          } catch {}
        }
        setDbApiError(null);
        setDesigns(data.data);
        const newTotalPages = data.totalPages || 1;
        setTotalPages(newTotalPages);
        setTotalCount(data.total || 0);
        if (data.podCount !== undefined) setPodCount(data.podCount);
        if (data.stickerCount !== undefined) setStickerCount(data.stickerCount);
        if (data.stickerSubCounts !== undefined) setStickerSubCounts(data.stickerSubCounts);

        if (currentPage > newTotalPages && newTotalPages > 0) {
          setPage(newTotalPages);
        }
      } else {
        setDbApiError(data.error || '데이터베이스 조회 중 오류가 발생했습니다.');
      }
    } catch (e: any) {
      console.error('Failed to fetch designs', e);
      setDbApiError(e?.message || '네트워크 통신 중 오류가 발생했습니다.');
    }
    if (showSpinner) setLoadingInitial(false);
  };

  const runAgent = async () => {
    setLoading(true);
    setIsAutoAgentModalOpen(false);
    try {
      let url = selectedStyleId ? `/api/run-agent?styleId=${selectedStyleId}` : '/api/run-agent';
      if (autoAgentAnimal && autoAgentAnimal !== 'random') {
        url += (url.includes('?') ? '&' : '?') + `animal=${encodeURIComponent(autoAgentAnimal)}`;
      }
      if (autoAgentGarmentColor && autoAgentGarmentColor !== 'random') {
        url += (url.includes('?') ? '&' : '?') + `garmentColor=${encodeURIComponent(autoAgentGarmentColor)}`;
      }
      if (autoAgentSeason && autoAgentSeason !== 'auto') {
        url += (url.includes('?') ? '&' : '?') + `season=${encodeURIComponent(autoAgentSeason)}`;
      }
      if (autoGeneratePhrase) {
        url += (url.includes('?') ? '&' : '?') + `autoPhrase=true`;
      } else if (globalCatchphrase.trim()) {
        url += (url.includes('?') ? '&' : '?') + `catchphrase=${encodeURIComponent(globalCatchphrase.trim())}`;
      }
      const res = await fetch(url, {
        headers: {
          'Authorization': 'Bearer ' + (process.env.NEXT_PUBLIC_CRON_SECRET || 'demo-secret')
        }
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert('생성 실패: ' + (data.error || '알 수 없는 오류'));
      } else if (data.data?.recommended_mockup) {
        setSelectedMockupId(data.data.recommended_mockup);
      }
      await fetchDesigns(1);
      setPage(1);
    } catch (e: any) {
      console.error('Agent run failed', e);
      alert('네트워크 오류가 발생했습니다.');
    }
    setLoading(false);
  };

  const handlePaste = (e: any) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        const reader = new FileReader();
        reader.onload = (event) => setUploadImageBase64(event.target?.result as string);
        reader.readAsDataURL(file);
        break;
      }
    }
  };

  const handleFileChange = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => setUploadImageBase64(event.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleStylePaste = (e: any) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        const reader = new FileReader();
        reader.onload = (event) => setStyleImageBase64(event.target?.result as string);
        reader.readAsDataURL(file);
        break;
      }
    }
  };

  const handleStyleFileChange = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => setStyleImageBase64(event.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleCreateStyle = async () => {
    if (!styleImageBase64 || !styleName.trim()) return;
    setIsCreatingStyle(true);
    try {
      const res = await fetch('/api/styles/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: styleImageBase64, styleName })
      });
      const data = await res.json();
      if (data.success) {
        setIsStyleModalOpen(false);
        setStyleImageBase64('');
        setStyleName('');
        await fetchStyles();
        setSelectedStyleId(data.data.id);
      } else {
        alert('스타일 생성 실패: ' + data.error);
      }
    } catch (e) {
      console.error(e);
      alert('오류가 발생했습니다.');
    }
    setIsCreatingStyle(false);
  };

  const handleTogglePriority = async (id: string, is_priority: boolean) => {
    try {
      const res = await fetch('/api/styles/priority', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_priority })
      });
      if (res.ok) {
        await fetchStyles(); // Refresh to show new priorities
      } else {
        const data = await res.json();
        alert('우선순위 설정 실패: ' + data.error);
      }
    } catch (e) {
      console.error('Priority toggle failed', e);
      alert('오류가 발생했습니다.');
    }
  };

  const handleManualTrendSearch = async () => {
    setIsGeneratingTrend(true);
    try {
      const res = await fetch('/api/run-agent/styles');
      const data = await res.json();
      if (data.success) {
        alert('✨ 트렌드 화풍 등록 성공: ' + data.data.name);
        await fetchStyles(); // Update dropdown
        setSelectedStyleId(data.data.id);
      } else {
        alert('트렌드 검색 실패: ' + data.error);
      }
    } catch (e) {
      console.error('Trend search failed', e);
      alert('오류가 발생했습니다.');
    }
    setIsGeneratingTrend(false);
  };

  const handleGenerateFromImage = async () => {
    if (!uploadPrompt.trim()) return;
    setIsGeneratingFromImage(true);
    try {
      const isTemplatePrompt = uploadPrompt.toLowerCase().includes('die-cut sticker');
      const finalPrompt = (selectedAnimal && !isTemplatePrompt) ? `${selectedAnimal} subject, ${uploadPrompt}` : uploadPrompt;
      const res = await fetch('/api/designs/from-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          imageBase64: uploadImageBase64, 
          prompt: finalPrompt, 
          isPreview: true, 
          styleId: selectedStyleId, 
          catchphrase: autoGeneratePhrase ? '' : globalCatchphrase.trim(),
          autoPhrase: autoGeneratePhrase
        })
      });
      const data = await res.json();
      if (data.success) {
        setUploadPreviewDesign(data.data);
      } else {
        alert('생성 실패: ' + data.error);
      }
    } catch (e) {
      console.error(e);
      alert('오류가 발생했습니다.');
    }
    setIsGeneratingFromImage(false);
  };

  const handleConfirmUpload = async () => {
    if (!uploadPreviewDesign) return;
    setIsGeneratingFromImage(true);
    try {
      const res = await fetch('/api/designs/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: uploadPreviewDesign.id,
          designData: uploadPreviewDesign
        })
      });
      const data = await res.json();
      if (data.success) {
        setIsImageModalOpen(false);
        setUploadImageBase64('');
        setUploadPrompt('');
        setUploadPreviewDesign(null);
        await fetchDesigns(1);
        setPage(1);
      } else {
        alert('저장 실패: ' + data.error);
      }
    } catch (e) {
      console.error(e);
      alert('오류가 발생했습니다.');
    }
    setIsGeneratingFromImage(false);
  };

  const handleCancelUpload = () => {
    setUploadPreviewDesign(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      const res = await fetch('/api/designs/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.success) {
        setDesigns(prev => prev.filter(d => d.id !== id));
        setTotalCount(prev => Math.max(0, prev - 1));
        if (selectedDesign?.id === id) setSelectedDesign(null);
        await fetchDesigns(page, false);
      } else {
        alert(data.error || '삭제하지 못했습니다.');
      }
    } catch (e) {
      console.error('Delete failed', e);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('복사되었습니다!');
  };

  const handleModify = async () => {
    if ((!feedback.trim() && !globalCatchphrase.trim() && !autoGeneratePhrase) || !selectedDesign) return;
    setModifying(true);
    try {
      const baseDesign = previewDesign || selectedDesign;
      const res = await fetch('/api/designs/modify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalId: selectedDesign.id,
          originalTitle: baseDesign.title || selectedDesign.title || '',
          feedback: feedback.trim(),
          topic: baseDesign.topic,
          originalPrompt: baseDesign.prompt,
          isPreview: true,
          catchphrase: autoGeneratePhrase ? '' : globalCatchphrase.trim(),
          autoPhrase: autoGeneratePhrase
        })
      });
      const data = await res.json();
      if (data.success) {
        setPreviewDesign(data.data);
        setFeedback('');
      } else {
        alert(data.error || '이미지 수정 생성에 실패했습니다.');
      }
    } catch (e: any) {
      console.error('Modify failed', e);
      alert('오류가 발생했습니다: ' + (e?.message || '알 수 없는 오류'));
    }
    setModifying(false);
  };


  const handleConfirm = async () => {
    if (!previewDesign || !selectedDesign) return;
    setModifying(true);
    try {
      const res = await fetch('/api/designs/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedDesign.id,
          updates: {
            prompt_hash: previewDesign.prompt_hash,
            prompt: previewDesign.prompt,
            title: previewDesign.title,
            tags: previewDesign.tags,
            image_url: previewDesign.image_url,
            modified_from: previewDesign.modified_from,
            feedback_applied: previewDesign.feedback_applied
          }
        })
      });
      const data = await res.json();
      if (data.success) {
        const updatedDesign = { ...selectedDesign, ...previewDesign, id: selectedDesign.id };
        setDesigns(designs.map(d => d.id === selectedDesign.id ? updatedDesign : d));
        setSelectedDesign(updatedDesign);
        setPreviewDesign(null);
        setFeedback('');
      }
    } catch (e) {
      console.error('Confirm failed', e);
    }
    setModifying(false);
  };

  const handleCancel = () => {
    setPreviewDesign(null);
    setFeedback('');
  };

  return (
    <main className="min-h-screen pt-2 sm:pt-3 md:pt-4 px-3 sm:px-4 md:px-6 pb-6 bg-gray-50 text-gray-900 font-sans">
      <div className="max-w-6xl mx-auto space-y-3.5 sm:space-y-4">
        <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center bg-white p-3 sm:p-4 rounded-2xl shadow-sm border border-gray-100 gap-2.5 xl:gap-0">
          <div className="shrink-0 w-full xl:w-auto flex justify-between items-start">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-blue-600 mb-0.5 whitespace-nowrap">Little Paws Studio Shop</h1>
              <p className="text-gray-500 text-xs sm:text-sm flex items-center gap-2">
                디자인 생성 결과
                {totalCount > 0 && <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md text-xs font-semibold border border-blue-100">총 {totalCount}개</span>}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-start xl:justify-end gap-2 sm:gap-2.5 w-full xl:w-auto mt-2 xl:mt-0">
            {session?.user && (
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100 shrink-0">
                {session.user.image && <img src={session.user.image} alt="Profile" className="w-6 h-6 rounded-full" />}
                <span className="text-xs font-medium text-gray-700">{session.user.email}</span>
                <button onClick={() => signOut()} className="text-xs text-red-500 hover:underline font-bold ml-1">로그아웃</button>
              </div>
            )}
            <div className="flex bg-gray-100 p-1 rounded-lg shrink-0">
              <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'}`} title="그리드 뷰">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
              </button>
              <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'}`} title="리스트 뷰">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
              </button>
            </div>
            <select
              value={selectedStyleId}
              onChange={(e) => setSelectedStyleId(e.target.value)}
              className="bg-white border border-gray-200 rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 max-w-[110px] sm:max-w-[130px] truncate shrink-0"
            >
              <option value="">화풍 선택 ▾</option>
              {styles.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <input 
              type="text" 
              value={globalCatchphrase}
              onChange={(e) => setGlobalCatchphrase(e.target.value)}
              placeholder="브랜드 문구 (선택)"
              className="bg-white border border-gray-200 rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 max-w-[95px] sm:max-w-[130px] shrink-0"
              title="디자인에 포함할 텍스트 (예: Little Paws)"
            />
            <button 
              onClick={() => {
                setIsSelectMode(!isSelectMode);
                if (isSelectMode) setSelectedIdsForDelete([]);
              }}
              className={`flex-1 sm:flex-none font-semibold py-1.5 px-2.5 sm:py-2 sm:px-3.5 rounded-xl transition-all whitespace-nowrap text-xs sm:text-sm border ${
                isSelectMode ? 'bg-rose-600 text-white border-rose-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200'
              }`}
            >
              {isSelectMode ? `☑️ 선택 해제 (${selectedIdsForDelete.length})` : '☑️ 다중 선택 삭제'}
            </button>
            <button 
              onClick={() => {
                setIsTrashModalOpen(true);
                fetchTrashDesigns();
              }}
              className="flex-1 sm:flex-none bg-stone-700 hover:bg-stone-800 text-white font-semibold py-1.5 px-2.5 sm:py-2 sm:px-3.5 rounded-xl transition-colors whitespace-nowrap text-xs sm:text-sm shadow-sm flex items-center gap-1"
            >
              <span>🗑️ 삭제함</span>
            </button>
            <button 
              onClick={() => setIsManageStylesModalOpen(true)}
              className="flex-1 sm:flex-none bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-1.5 px-2.5 sm:py-2 sm:px-3.5 rounded-xl transition-colors whitespace-nowrap text-xs sm:text-sm border border-gray-200 flex items-center gap-1"
            >
              ⚙️ 화풍 관리
            </button>
            <button 
              onClick={handleToggleStickerMode}
              className={`flex-1 sm:flex-none font-bold py-1.5 px-2.5 sm:py-2 sm:px-3.5 rounded-xl transition-all whitespace-nowrap text-xs sm:text-sm border shadow-sm ${
                isStickerMode 
                  ? 'bg-teal-600 hover:bg-teal-700 text-white border-teal-700 ring-2 ring-teal-300' 
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-700'
              }`}
            >
              {isStickerMode ? '📦 Etsy 스티커 팩 모드 (ON)' : '👕 POD 실물 커머스 모드 (ON)'}
            </button>
            {isStickerMode && (
              <button 
                onClick={handleExportZIPBundle}
                disabled={isExportingBundle || designs.length === 0}
                className="flex-1 sm:flex-none bg-amber-600 hover:bg-amber-700 text-white font-semibold py-1.5 px-2.5 sm:py-2 sm:px-3.5 rounded-xl transition-colors disabled:opacity-50 whitespace-nowrap text-xs sm:text-sm shadow-sm"
                title="현재 스티커 디자인들을 300DPI 투명 PNG ZIP 번들로 내보냅니다."
              >
                {isExportingBundle ? '📦 압축 생성중...' : '📦 디지털 PNG ZIP 다운로드'}
              </button>
            )}
          </div>
        </header>

        {/* Database Error / Quota Exceeded Notification Banner */}
        {dbApiError && (
          <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 text-amber-900 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl shrink-0">⚠️</span>
              <div>
                <h4 className="font-extrabold text-sm sm:text-base">데이터베이스 일일 한도(Quota Exceeded) 소진 안내</h4>
                <p className="text-xs sm:text-sm text-amber-800 mt-0.5">
                  {dbApiError.includes('Quota exceeded') || dbApiError.includes('RESOURCE_EXHAUSTED')
                    ? 'Firebase 무료 플랜의 하루 읽기/쓰기 한도(5만 회)가 소진되어 잠시 갤러리를 불러오지 못하고 있습니다. 🔒 생성하신 이미지 및 삭제함 데이터는 DB에 100% 안전하게 보관되어 있으며, 매일 오후 4:00 (한국시간 KST / PST 0시 리셋)에 한도가 자동으로 초기화되어 정상 복구됩니다.'
                    : dbApiError}
                </p>
              </div>
            </div>
            <button 
              onClick={() => fetchDesigns(page, true, undefined, undefined, true)}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm px-4 py-2 rounded-xl shrink-0 transition-colors shadow-sm"
            >
              🔄 다시 시도
            </button>
          </div>
        )}

        {/* POD Commercial Mode Action Toolbar */}
        {!isStickerMode && (
          <div className="mb-4 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border border-indigo-200/80 rounded-2xl p-3.5 sm:p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className="text-2xl sm:text-3xl shrink-0">👕</span>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-indigo-950 flex items-center gap-1.5">
                  <span>POD 실물 커머스 전용 이미지 생성</span>
                  <span className="bg-indigo-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">POD Mode</span>
                </h3>
                <p className="text-[11px] sm:text-xs text-indigo-700 font-medium">
                  반팔티, 후드티, 머그컵 등 실물 커머스 상품에 최적화된 고화질 그래픽을 생성합니다.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
              <button 
                onClick={() => setIsImageModalOpen(true)}
                className="flex-1 sm:flex-none bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-xl transition-all shadow-sm text-xs sm:text-sm flex items-center justify-center gap-1.5"
              >
                <span>🎨 이미지 생성</span>
              </button>
              <button 
                onClick={() => setIsAutoAgentModalOpen(true)}
                disabled={loading}
                className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl transition-all disabled:opacity-50 shadow-sm text-xs sm:text-sm flex items-center justify-center gap-1.5"
              >
                <span>🤖 {loading ? '생성 중..' : '자동 생성'}</span>
              </button>
            </div>
          </div>
        )}

        {/* 🎯 시즌 선점 트렌드 레이더 (Seasonal Radar) */}
        {isStickerMode && (
          <div className="mb-4 bg-gradient-to-r from-rose-50 via-amber-50 to-purple-50 border-2 border-rose-300 rounded-2xl shadow-md overflow-hidden transition-all">
            {/* Collapsible Header Bar */}
            <div 
              onClick={() => setIsSeasonalRadarExpanded(!isSeasonalRadarExpanded)}
              className="p-3.5 sm:p-4 cursor-pointer hover:bg-rose-100/50 transition-colors flex items-center justify-between gap-3 select-none"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-2xl sm:text-3xl">🎯</span>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-gray-900 flex items-center gap-2 flex-wrap">
                    <span>Etsy 2~3개월 전 선점: 시즌 추천 스티커 테마 레이더</span>
                    <span className="bg-rose-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">AI Surge Radar</span>
                  </h3>
                  <p className="text-xs text-gray-600 mt-0.5 hidden sm:block">
                    Etsy 알고리즘 인덱싱(4~6주)에 맞춰 지금 즉시 등록해야 시즌 검색 1위를 독점할 수 있는 황금 테마입니다.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] font-extrabold text-rose-900 bg-white/95 border border-rose-200 px-2.5 py-1 rounded-full shadow-2xs hidden md:flex items-center gap-1">
                  <span>🖨️</span>
                  <span>A4 2장 분할</span>
                </span>
                <span className="text-xs font-bold text-rose-900 bg-white/90 border border-rose-300 px-2.5 py-1 rounded-xl shadow-xs flex items-center gap-1">
                  <span>{isSeasonalRadarExpanded ? '▲ 접기' : '▼ 펼치기'}</span>
                </span>
              </div>
            </div>

            {/* Collapsible Content Section */}
            {isSeasonalRadarExpanded && (
              <div className="p-3.5 sm:p-5 border-t border-rose-200/80 space-y-4">
                {/* 실시간 40종 일괄 생성 진행 상태 배너 */}
                {isBatchGenerating && (
                  <div className="bg-gradient-to-r from-purple-950 via-indigo-900 to-slate-900 text-white p-4 rounded-2xl shadow-xl border-2 border-purple-400 space-y-2.5 animate-pulse-subtle">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 border-3 border-purple-300 border-t-amber-400 rounded-full animate-spin shrink-0" />
                        <div>
                          <h4 className="font-extrabold text-xs sm:text-sm text-amber-300 flex items-center gap-1.5">
                            <span>⚡️</span>
                            <span>{batchProgress.packTitle || '40종 스티커 팩'} 자동 일괄 생성 진행 중...</span>
                          </h4>
                          <p className="text-[11px] text-purple-200 mt-0.5">
                            현재 생성 항목: <strong className="text-white underline">{batchProgress.label}</strong>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <span className="bg-white/20 border border-white/30 px-3 py-1 rounded-full font-mono text-xs sm:text-sm font-black text-amber-300">
                          {batchProgress.current} / {batchProgress.total}장 ({Math.round((batchProgress.current / Math.max(batchProgress.total, 1)) * 100)}%)
                        </span>
                      </div>
                    </div>

                    {/* 프로그레스 게이지 바 */}
                    <div className="w-full bg-black/50 rounded-full h-3 overflow-hidden p-0.5 border border-purple-500/50">
                      <div
                        className="bg-gradient-to-r from-amber-400 via-rose-400 to-emerald-400 h-full rounded-full transition-all duration-300 shadow-sm"
                        style={{ width: `${Math.max(5, Math.round((batchProgress.current / Math.max(batchProgress.total, 1)) * 100))}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* 최근 생성 완료 알림 배너 */}
                {batchCompletionNotice && (
                  <div className="bg-emerald-600 text-white p-3.5 sm:p-4 rounded-2xl shadow-lg border-2 border-emerald-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">🎉</span>
                      <div>
                        <h4 className="font-extrabold text-xs sm:text-sm">
                          {batchCompletionNotice.packName} 생성이 성공적으로 완료되었습니다!
                        </h4>
                        <p className="text-[11px] text-emerald-100 mt-0.5">
                          성공: {batchCompletionNotice.successCount} / {batchCompletionNotice.totalExpectedCount}장 모두 300 DPI 투명 PNG로 저장되었으며, A4 2장 인쇄용 시트가 준비되었습니다.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedStickerSubTab(batchCompletionNotice.packId);
                          const el = document.getElementById('gallery-section');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="text-xs bg-white text-emerald-900 font-extrabold px-3 py-1.5 rounded-xl transition-colors hover:bg-emerald-50 cursor-pointer shadow-xs"
                      >
                        생성된 갤러리 확인 →
                      </button>
                      <button
                        type="button"
                        onClick={() => setBatchCompletionNotice(null)}
                        className="text-xs bg-emerald-700/80 hover:bg-emerald-700 text-white px-2.5 py-1.5 rounded-xl cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}

                {/* 3대 시즌 추천 카드 그리드 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {(dynamicSeasonalRecommendations.length > 0 ? dynamicSeasonalRecommendations : SEASONAL_RECOMMENDATIONS).map((season) => (
                    <div
                      key={season.seasonId}
                      className="bg-white/95 hover:bg-white border border-rose-200/80 rounded-2xl p-3.5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-3 relative group"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-2xl">{season.icon}</span>
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-2xs ${season.badgeColor}`}>
                            {season.badge}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-xs sm:text-sm font-extrabold text-gray-900 line-clamp-1">
                            {season.title}
                          </h4>
                          <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
                            {season.subtitle}
                          </p>
                        </div>

                        <div className="bg-stone-50 border border-gray-100 rounded-xl p-2 text-[11px] text-gray-600 leading-snug">
                          <span className="font-bold text-gray-800">⏱️ 선점 타이밍: </span>
                          {season.timingText}
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {season.keySearchTerms.slice(0, 3).map((term, tIdx) => (
                            <span key={tIdx} className="text-[10px] bg-stone-100 text-stone-700 px-1.5 py-0.5 rounded-md font-medium">
                              #{term}
                            </span>
                          ))}
                        </div>

                        {/* 💰 적정 가격 & 판매 전략 가이드 영역 */}
                        {season.pricingStrategy && (
                          <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-2.5 space-y-1.5">
                            <div className="flex items-center justify-between gap-1 flex-wrap">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs">💰</span>
                                <span className="text-[11px] font-bold text-amber-900">
                                  권장 판매가:
                                </span>
                                <span className="text-xs font-black text-rose-600">
                                  {season.pricingStrategy.suggestedPrice}
                                </span>
                                <span className="text-[10px] text-gray-400 line-through">
                                  {season.pricingStrategy.originalPrice.split(' ')[0]}
                                </span>
                              </div>
                              <span className="text-[10px] font-bold text-amber-800 bg-white px-1.5 py-0.5 rounded border border-amber-300/80 shadow-2xs">
                                {season.pricingStrategy.bundleOffer}
                              </span>
                            </div>

                            <p className="text-[11px] text-amber-950 leading-tight">
                              🎯 <strong>타겟:</strong> {season.pricingStrategy.targetAudience}
                            </p>

                            {/* 전략 토글 버튼 */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedStrategySeasonIds(prev =>
                                  prev.includes(season.seasonId)
                                    ? prev.filter(id => id !== season.seasonId)
                                    : [...prev, season.seasonId]
                                );
                              }}
                              className="w-full mt-1 pt-1.5 border-t border-amber-200/70 text-[11px] font-bold text-amber-800 hover:text-amber-950 flex items-center justify-between cursor-pointer transition-colors"
                            >
                              <span className="flex items-center gap-1">
                                <span>📈</span>
                                <span>실전 전략 & Etsy 태그</span>
                              </span>
                              <span className="text-[10px] bg-amber-200/70 px-1.5 py-0.5 rounded text-amber-900 font-extrabold">
                                {expandedStrategySeasonIds.includes(season.seasonId) ? '▲ 닫기' : '▼ 가이드'}
                              </span>
                            </button>

                            {/* 확장된 판매 전략 & Etsy 태그 영역 */}
                            {expandedStrategySeasonIds.includes(season.seasonId) && (
                              <div className="mt-2 pt-2 border-t border-amber-200 space-y-2 text-[11px] text-gray-700 bg-white/90 p-2.5 rounded-lg shadow-2xs">
                                <div>
                                  <span className="font-extrabold text-gray-900 flex items-center gap-1 text-[11px]">
                                    <span>💡</span>
                                    <span>핵심 판매 노하우:</span>
                                  </span>
                                  <ul className="list-disc list-inside space-y-1 mt-1 text-gray-600 pl-0.5 leading-relaxed">
                                    {season.pricingStrategy.salesTactics.map((tactic, idx) => (
                                      <li key={idx} className="leading-snug">{tactic}</li>
                                    ))}
                                  </ul>
                                </div>

                                <div className="bg-rose-50 border border-rose-200/80 rounded-md p-1.5 text-rose-950 text-[10.5px]">
                                  <span className="font-bold">⚡ 골든타임 팁: </span>
                                  <span>{season.pricingStrategy.highlightTip}</span>
                                </div>

                                <div>
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-extrabold text-gray-900 text-[11px] flex items-center gap-1">
                                      <span>🏷️</span>
                                      <span>추천 13태그:</span>
                                    </span>
                                    <div className="flex items-center gap-1">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const tagsText = season.pricingStrategy.etsyTags.join(', ');
                                          if (navigator.clipboard) {
                                            navigator.clipboard.writeText(tagsText);
                                          }
                                          setCopiedTagsSeasonId(season.seasonId);
                                          setTimeout(() => setCopiedTagsSeasonId(null), 2000);
                                        }}
                                        className="text-[10px] bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded border border-indigo-200 transition-colors flex items-center gap-1 cursor-pointer"
                                      >
                                        <span>{copiedTagsSeasonId === season.seasonId ? '✓ 완료' : '📋 13태그 복사'}</span>
                                      </button>
                                    </div>
                                  </div>
                                  <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                                    {season.pricingStrategy.etsyTags.map((tag, tagIdx) => (
                                      <span
                                        key={tagIdx}
                                        className="text-[10px] bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded border border-gray-200 font-medium"
                                      >
                                        #{tag}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="pt-2 border-t border-gray-100 space-y-2">
                        {/* 40종 패키지 구성 안내 바 (버튼 바로 위 배치) */}
                        <div className="bg-purple-50/90 border border-purple-200/80 rounded-xl px-2 py-1 text-[11px] flex items-center justify-between gap-1">
                          <span className="font-bold text-purple-950 flex items-center gap-1 truncate">
                            <span>🎁</span>
                            <span><strong>40종 세트</strong> (완성20 + 낱개20)</span>
                          </span>
                          <span className="text-[10px] font-extrabold text-purple-700 bg-white px-1.5 py-0.5 rounded border border-purple-200 shrink-0">
                            A4 2장
                          </span>
                        </div>

                        {/* 동적 상태 버튼: 생성 중 / 대기 중 / 기본 */}
                        {isBatchGenerating && activeBatchPackId === `${season.seasonId}20_both` ? (
                          <div className="w-full bg-gradient-to-r from-purple-700 to-indigo-700 text-white font-extrabold text-xs py-2 px-3 rounded-xl shadow-md flex items-center justify-center gap-2 border border-purple-400 animate-pulse">
                            <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin shrink-0" />
                            <span>생성 중 ({batchProgress.current} / {batchProgress.total}장)</span>
                          </div>
                        ) : isBatchGenerating ? (
                          <button
                            disabled
                            className="w-full bg-gray-200 text-gray-500 font-bold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1 cursor-not-allowed opacity-60"
                          >
                            <span>⏳ 다른 팩 생성 중...</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleBatchGenerateSeries(`${season.seasonId}20_both`)}
                            disabled={isBatchGenerating}
                            className="w-full bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-700 hover:to-purple-700 text-white font-extrabold text-xs py-2 px-3 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                            title={`${season.title} (메인 20종 + 단독 20종 = 총 41장 및 A4 2장 시트) 일괄 자동 생성을 시작합니다`}
                          >
                            <span>⚡️</span>
                            <span>40종 원클릭 생성</span>
                          </button>
                        )}

                        {/* 해당 시즌 팩 최근 생성 완료 안내 태그 */}
                        {batchCompletionNotice && batchCompletionNotice.packId === season.seasonId && (
                          <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-2 text-xs font-bold text-emerald-950 flex items-center justify-between gap-1 shadow-2xs animate-fade-in">
                            <span className="flex items-center gap-1 text-emerald-800 text-[11px]">
                              <span>🎉</span>
                              <span>생성 완료! ({batchCompletionNotice.successCount}장)</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedStickerSubTab(season.seasonId);
                                const el = document.getElementById('gallery-section');
                                if (el) el.scrollIntoView({ behavior: 'smooth' });
                              }}
                              className="text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-0.5 rounded font-extrabold transition-colors cursor-pointer shrink-0"
                            >
                              갤러리 보기 →
                            </button>
                          </div>
                        )}

                        <button
                          onClick={() => {
                            setSelectedStickerSeriesTab(`${season.seasonId}20` as any);
                            setIsStickerBannerExpanded(true);
                            setIsPresetGridExpanded(true);
                          }}
                          className="w-full bg-white hover:bg-stone-50 text-gray-700 border border-gray-200 text-[11px] font-bold py-1.5 px-2 rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <span>👀</span>
                          <span>템플릿 둘러보기</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Sticker Mode & Pygmy Pumpkin & Friends Banner */}
        {isStickerMode && (
          <div className="mb-4 bg-gradient-to-r from-teal-50 via-emerald-50 to-cyan-50 border-2 border-teal-300 rounded-2xl shadow-md overflow-hidden transition-all">
            {/* Collapsible Header Bar */}
            <div 
              onClick={() => setIsStickerBannerExpanded(!isStickerBannerExpanded)}
              className="p-3.5 sm:p-4 cursor-pointer hover:bg-teal-100/50 transition-colors flex items-center justify-between gap-3 select-none"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl sm:text-3xl">📦</span>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-teal-900 flex items-center gap-2">
                    <span>{getStickerSeriesTitle(selectedStickerSeriesTab)}</span>
                    <span className="bg-teal-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">Etsy Best Niche</span>
                  </h3>
                  <p className="text-xs text-teal-700 font-medium hidden sm:block">
                    버튼 한 번으로 20가지 완성형 300DPI 스티커 일괄 생성 & ZIP 다운로드
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-teal-800 bg-white/80 border border-teal-300 px-3 py-1.5 rounded-xl shadow-xs flex items-center gap-1">
                  <span>{isStickerBannerExpanded ? '▲ 메뉴 접기' : '▼ 20종 생성 메뉴 펼치기'}</span>
                </span>
              </div>
            </div>

            {/* Collapsible Content Section (Collapsed by default) */}
            {isStickerBannerExpanded && (
              <div className="p-4 border-t border-teal-200/80 space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <p className="text-xs text-teal-800 font-medium">
                    버튼 한 번으로 독창적인 20가지 완성형 300DPI 투명 PNG 스티커를 일괄 생성하여 Etsy 팩 ZIP 파일로 다운로드합니다.
                  </p>

                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    {!['dessert20', 'socialbattery20', 'hangul20', 'booktok20'].includes(selectedStickerSeriesTab) && (
                      <button
                        onClick={() => handleBatchGenerateSeries(`${selectedStickerSeriesTab}_both`)}
                        disabled={isBatchGenerating}
                        className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold py-2 px-3 rounded-xl shadow transition-colors flex items-center justify-center gap-1 border border-purple-500 whitespace-nowrap cursor-pointer disabled:opacity-50"
                        title="메인 세트 20종 + 단독 낱개 20종 = 총 41장 및 A4 2장 시트 동시 생성"
                      >
                        <span>🔥</span>
                        <span>40종 동시 생성</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleBatchGenerateSeries(selectedStickerSeriesTab)}
                      disabled={isBatchGenerating}
                      className="w-full sm:w-auto bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold py-2 px-3 rounded-xl shadow transition-colors flex items-center justify-center gap-1 border border-emerald-600 whitespace-nowrap"
                      title="선택된 팩 20종(표지 1장 + 스티커 20종 = 총 21장) 자동 일괄 연속 생성"
                    >
                      <span>⚡️</span>
                      <span>20종 일괄 생성</span>
                    </button>

                    <button
                      onClick={handleExportZIPBundle}
                      disabled={isExportingBundle || designs.length === 0}
                      className="w-full sm:w-auto bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold py-2 px-3 rounded-xl shadow transition-colors flex items-center justify-center gap-1.5 shrink-0 whitespace-nowrap"
                    >
                      <span>📦</span>
                      <span>{isExportingBundle ? 'ZIP 패키징 중...' : '전체 ZIP 다운로드'}</span>
                    </button>
                  </div>
                </div>

            {isBatchGenerating && (
              <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-inner">
                <div className="flex items-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin shrink-0" />
                  <span>20종 팩 연속 자동 생성 중: <span className="underline">{batchProgress.label}</span></span>
                </div>
                <span className="bg-emerald-200/80 px-2 py-0.5 rounded font-mono">
                  {batchProgress.current} / {batchProgress.total} 장 생성 완료
                </span>
              </div>
            )}

            <div className="pt-2 border-t border-teal-200/60">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-2 bg-teal-100/60 p-2 sm:p-2.5 rounded-2xl border border-teal-200">
                <div className="flex items-center gap-2">
                  <span className="text-base sm:text-lg">🎯</span>
                  <div>
                    <label htmlFor="series-select" className="block text-xs font-bold text-teal-950">
                      스티커 팩 테마 선택 (20 Unique Stickers Pack):
                    </label>
                    <p className="text-[11px] text-teal-700">
                      원하는 틈새 테마를 선택하면 일괄 생성 및 템플릿 목록이 자동 전환됩니다.
                    </p>
                  </div>
                </div>
                <div className="w-full sm:w-auto min-w-[280px]">
                  <select
                    id="series-select"
                    value={selectedStickerSeriesTab}
                    onChange={(e) => {
                      const val = e.target.value as any;
                      setSelectedStickerSeriesTab(val);
                      const presets = getPresetSeriesList(val);
                      if (presets && presets.length > 1) {
                        setSelectedStickerPresetId(presets[1].id);
                      }
                    }}
                    className="w-full bg-white text-teal-950 font-extrabold text-xs sm:text-sm py-2 px-3 rounded-xl border-2 border-teal-600 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-400 cursor-pointer"
                  >
                    <optgroup label="🌟 신규 인기 틈새 테마 (NEW)">
                      <option value="dessert20">🥞 미국 유행 디저트 & 베이커리 20종</option>
                      <option value="socialbattery20">🔋 사회적 배터리 & 내향인 20종</option>
                      <option value="hangul20">🇰🇷 K-감성 한글 & 아기 동물 20종</option>
                      <option value="booktok20">📚 북톡 & 코지 리딩 20종</option>
                    </optgroup>
                    <optgroup label="🌿 수조 & 생태계 테마">
                      <option value="terrarium20">🫙 테라리움 세트 완성 20종</option>
                      <option value="terrarium20_standalone">🪴 테라리움 단일 식물 20종</option>
                      <option value="vivarium20">🦎 비바리움 세트 완성 20종</option>
                      <option value="vivarium20_standalone">🦎 비바리움 단일 동물 20종</option>
                      <option value="saltaquarium20">🪸 해수어항 세트 완성 20종</option>
                      <option value="saltaquarium20_standalone">🐠 해수어 단일 어류 20종</option>
                      <option value="freshaquarium20">🐠 열대어어항 세트 완성 20종</option>
                      <option value="freshaquarium20_standalone">🐟 열대어 단일 어류 20종</option>
                    </optgroup>
                    <optgroup label="🎉 시즌 & 홀리데이 테마">
                      <option value="christmas20">🎄 크리스마스 윈터 스노우볼 20종</option>
                      <option value="christmas20_standalone">🎁 크리스마스 단일 오브젝트 20종</option>
                      <option value="halloween20">🎃 할로윈 스푸키 큐트 20종</option>
                      <option value="halloween20_standalone">👻 할로윈 단일 오브젝트 20종</option>
                      <option value="thanksgiving20">🦃 추수감사절 코지 어텀 20종</option>
                      <option value="thanksgiving20_standalone">🍂 추수감사절 단일 오브젝트 20종</option>
                    </optgroup>
                  </select>
                </div>
              </div>

              <div className="mt-2 mb-1">
                <button
                  type="button"
                  onClick={() => setIsPresetGridExpanded(!isPresetGridExpanded)}
                  className="w-full py-1.5 px-3 text-xs font-bold text-teal-800 bg-white hover:bg-teal-50 border border-teal-300 rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all select-none"
                >
                  <span>
                    {isPresetGridExpanded
                      ? '▲ 템플릿 목록 접기'
                      : `▼ 템플릿 목록 보기 (${getPresetSeriesList(selectedStickerSeriesTab).length}개)`}
                  </span>
                </button>
              </div>

              {isPresetGridExpanded && (
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 max-h-96 overflow-y-auto pr-1">
                  {getPresetSeriesList(selectedStickerSeriesTab).map((preset) => (
                    <div
                      key={preset.id}
                      onClick={() => {
                        setSelectedStickerPresetId(preset.id);
                        setSelectedAnimal(preset.animalValue);
                        setUploadPrompt(preset.prompt);
                        setAutoGeneratePhrase(false);
                        setIsImageModalOpen(true);
                      }}
                      className={`p-2 rounded-xl border text-xs cursor-pointer transition-all hover:scale-[1.02] shadow-sm ${
                        selectedStickerPresetId === preset.id
                          ? 'bg-teal-100 border-teal-600 text-teal-950 font-bold ring-2 ring-teal-400'
                          : 'bg-white border-teal-200 text-gray-800 hover:bg-teal-50'
                      }`}
                    >
                      <div className="font-bold flex items-center justify-between">
                        <span className="truncate pr-1">{preset.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded text-teal-700 bg-teal-200/60 shrink-0">생성</span>
                      </div>
                      <p className="text-[11px] text-gray-600 line-clamp-1 mt-0.5">{preset.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    )}

        {/* Active Seasonal Trends (D-90 Rule) Banner */}
        {!isStickerMode && activeSeasonsList.length > 0 && (
          <div className="mb-4 p-3.5 bg-gradient-to-r from-orange-50 via-amber-50 to-rose-50 border border-amber-200/80 rounded-2xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🔥</span>
              <div>
                <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                  도래 3개월 전 유행 시즌 (D-90 트렌드 자동 집중)
                </h4>
                <p className="text-xs text-amber-800 font-medium">
                  현재 미국 POD 시장에서 집중 반영 중인 유행 시즌입니다.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {activeSeasonsList.map(s => (
                <span
                  key={s.holiday.id}
                  className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 transition-transform hover:scale-105 cursor-pointer ${
                    s.isUrgent
                      ? 'bg-rose-600 text-white border-rose-500 animate-pulse'
                      : 'bg-white text-amber-900 border-amber-300'
                  }`}
                  onClick={() => {
                    setAutoAgentSeason(s.holiday.id);
                    setIsAutoAgentModalOpen(true);
                  }}
                  title={`${s.holiday.koreanName} - D-${s.daysRemaining}일 남음 (클릭하여 이 시즌으로 생성)`}
                >
                  <span>{s.holiday.icon}</span>
                  <span>{s.holiday.koreanName}</span>
                  <span className={s.isUrgent ? 'text-amber-200' : 'text-amber-700'}>
                    D-{s.daysRemaining}
                  </span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Main Category Filter Tabs (POD vs Sticker Pack & Keyword Search) */}
        <div id="gallery-section" className="mb-5 flex flex-wrap items-center justify-between gap-3 bg-white p-2.5 sm:p-3 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap flex-1 min-w-0">
            <button
              onClick={() => handleSelectCategoryTab('sticker')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                selectedCategoryTab === 'sticker'
                  ? 'bg-teal-600 text-white shadow-sm ring-2 ring-teal-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>📦 스티커 팩</span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full ${selectedCategoryTab === 'sticker' ? 'bg-teal-700 text-teal-100' : 'bg-gray-200 text-gray-600'}`}>
                {stickerCount}
              </span>
            </button>

            <button
              onClick={() => handleSelectCategoryTab('pod')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                selectedCategoryTab === 'pod'
                  ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>👕 POD 실물 상품</span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full ${selectedCategoryTab === 'pod' ? 'bg-indigo-700 text-indigo-100' : 'bg-gray-200 text-gray-600'}`}>
                {podCount}
              </span>
            </button>

            <button
              onClick={() => handleSelectCategoryTab('all')}
              className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                selectedCategoryTab === 'all'
                  ? 'bg-stone-800 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span>🌐 전체 보기</span>
            </button>
          </div>

          {/* Keyword Search Input Box */}
          <div className="relative w-full sm:w-auto sm:min-w-[240px] max-w-full">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="🔍 키워드 검색 (예: 오리, 베타, 햄스터...)"
              className="w-full bg-gray-50 hover:bg-white focus:bg-white border border-gray-200 rounded-xl pl-8 pr-8 py-1.5 sm:py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs transition-colors text-gray-800"
            />
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs sm:text-sm pointer-events-none">
              🔍
            </span>
            {searchInput && (
              <button
                onClick={() => {
                  setSearchInput('');
                  setSearchKeyword('');
                  setPage(1);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full hover:bg-gray-200"
                title="검색어 지우기"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Sticker Pack Sub-Category Filter Bar (Dropdown Combo Box Selector) */}
        {selectedCategoryTab === 'sticker' && (
          <div className="mb-4 bg-teal-50/90 p-2.5 sm:p-3 rounded-2xl border border-teal-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1 min-w-0">
              <span className="text-xs font-bold text-teal-950 shrink-0 flex items-center gap-1.5">
                <span>🎯 테마별 갤러리 필터:</span>
                <span className="text-[11px] font-semibold text-teal-700 bg-teal-100/90 px-2 py-0.5 rounded-full">
                  현재 {selectedStickerSubTab === 'all' ? (stickerSubCounts.all || stickerCount) : (stickerSubCounts[selectedStickerSubTab] || 0)}장 표시
                </span>
              </span>

              <div className="w-full sm:w-auto min-w-[260px] sm:max-w-md">
                <select
                  value={selectedStickerSubTab}
                  onChange={(e) => handleSelectStickerSubTab(e.target.value)}
                  className="w-full bg-white text-teal-950 font-bold text-xs sm:text-sm py-2 px-3 rounded-xl border-2 border-teal-500 shadow-xs focus:outline-none focus:ring-2 focus:ring-teal-400 cursor-pointer"
                >
                  <option value="all">🌐 전체 테마 보기 (총 {stickerSubCounts.all || stickerCount}장)</option>
                  <optgroup label="🌟 신규 인기 틈새 테마">
                    <option value="dessert">🥞 미국 유행 디저트 & 베이커리 ({stickerSubCounts.dessert || 0}장)</option>
                    <option value="socialbattery">🔋 사회적 배터리 & 내향인 ({stickerSubCounts.socialbattery || 0}장)</option>
                    <option value="hangul">🇰🇷 K-감성 한글 & 아기 동물 ({stickerSubCounts.hangul || 0}장)</option>
                    <option value="booktok">📚 북톡 & 코지 리딩 ({stickerSubCounts.booktok || 0}장)</option>
                  </optgroup>
                  <optgroup label="🌿 수조 & 생태계 테마">
                    <option value="terrarium">🫙 테라리움 세트 ({stickerSubCounts.terrarium || 0}장)</option>
                    <option value="vivarium">🦎 비바리움 세트 ({stickerSubCounts.vivarium || 0}장)</option>
                    <option value="saltaquarium">🪸 해수어항 세트 ({stickerSubCounts.saltaquarium || 0}장)</option>
                    <option value="freshaquarium">🐠 열대어어항 세트 ({stickerSubCounts.freshaquarium || 0}장)</option>
                  </optgroup>
                  <optgroup label="🎉 시즌 & 홀리데이 테마">
                    <option value="christmas">🎄 크리스마스 ({stickerSubCounts.christmas || 0}장)</option>
                    <option value="halloween">🎃 할로윈 ({stickerSubCounts.halloween || 0}장)</option>
                    <option value="thanksgiving">🦃 추수감사절 ({stickerSubCounts.thanksgiving || 0}장)</option>
                    <option value="valentines">💖 발렌타인데이 ({stickerSubCounts.valentines || 0}장)</option>
                    <option value="stpatrick">☘️ 성 패트릭 데이 ({stickerSubCounts.stpatrick || 0}장)</option>
                    <option value="easter">🌸 부활절 ({stickerSubCounts.easter || 0}장)</option>
                    <option value="mothersday">💐 마더스데이 ({stickerSubCounts.mothersday || 0}장)</option>
                    <option value="fathersday">👔 파더스데이 ({stickerSubCounts.fathersday || 0}장)</option>
                    <option value="july4th">🎆 미국 독립기념일 ({stickerSubCounts.july4th || 0}장)</option>
                    <option value="backtoschool">🎒 백투스쿨 ({stickerSubCounts.backtoschool || 0}장)</option>
                    <option value="newyear">🎊 새해 뉴이어 ({stickerSubCounts.newyear || 0}장)</option>
                  </optgroup>
                </select>
              </div>
            </div>

            {/* Quick reset / switch button */}
            {selectedStickerSubTab !== 'all' && (
              <button
                onClick={() => handleSelectStickerSubTab('all')}
                className="shrink-0 text-xs font-bold text-teal-800 hover:text-teal-950 bg-teal-100 hover:bg-teal-200/80 px-3 py-1.5 rounded-xl border border-teal-300 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                title="모든 테마 스티커 전체 보기로 초기화"
              >
                <span>↺ 전체 보기</span>
              </button>
            )}
          </div>
        )}

        {/* Gallery View */}
        {loadingInitial ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-gray-500 font-medium text-sm">디자인 데이터를 불러오는 중입니다...</p>
          </div>
        ) : (
          <>
            {/* Top Pagination Controls */}
            {totalCount > 0 && (
              <div className="flex flex-wrap justify-between items-center gap-2 mb-3.5 bg-white/80 p-2.5 rounded-2xl border border-gray-200/80 shadow-xs">
                <div className="text-xs text-gray-500 font-semibold flex items-center gap-1.5 pl-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>
                    {selectedCategoryTab === 'sticker' ? '🌟 마스터 표지 목록' : '🎨 디자인 목록'}: 총 <strong className="text-gray-900 font-extrabold">{totalCount}</strong>개 중 {page} / {totalPages} 페이지
                  </span>
                </div>
                
                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    disabled={page === 1 || loadingInitial}
                    className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors shadow-xs bg-white"
                  >
                    이전
                  </button>
                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                      <button
                        key={p}
                        onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        disabled={loadingInitial}
                        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg text-xs sm:text-sm font-medium transition-colors ${page === p ? 'bg-blue-600 text-white shadow-xs font-bold' : 'border border-gray-200 text-gray-600 hover:bg-gray-50 bg-white'}`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                  <button 
                    onClick={() => { setPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    disabled={page === totalPages || loadingInitial}
                    className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors shadow-xs bg-white"
                  >
                    다음
                  </button>
                </div>
              </div>
            )}

            <section className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4.5" : "flex flex-col gap-3"}>

              {designs.map((design) => {
                const isMasterCover = isCoverDesign(design);

                return (
                <div 
                  key={design.id} 
                  className={`bg-white overflow-hidden transition-all group cursor-pointer relative ${
                    isMasterCover 
                      ? 'ring-2 ring-amber-400 border-amber-300 bg-amber-50/20 shadow-md' 
                      : 'border border-gray-100 hover:shadow-md shadow-sm'
                  } ${
                    selectedIdsForDelete.includes(design.id) ? 'ring-2 ring-rose-500 border-rose-300 bg-rose-50/20' : ''
                  } ${viewMode === 'grid' ? 'rounded-2xl' : 'rounded-xl flex flex-row h-28 sm:h-36'}`} 
                  onClick={() => {
                    if (isSelectMode) {
                      if (selectedIdsForDelete.includes(design.id)) {
                        setSelectedIdsForDelete(prev => prev.filter(id => id !== design.id));
                      } else {
                        setSelectedIdsForDelete(prev => [...prev, design.id]);
                      }
                    } else {
                      if (selectedCategoryTab === 'sticker' || isMasterCover) {
                        handleOpenPackDetail(design);
                      } else {
                        setSelectedDesign(design);
                        if (design.recommended_mockup) {
                          setSelectedMockupId(design.recommended_mockup);
                        }
                      }
                    }
                  }}
                >
                  <div className={`${viewMode === 'grid' ? 'aspect-square' : 'w-28 sm:w-36 flex-shrink-0'} bg-gray-200 relative`}>
                    <img 
                      src={design.image_url} 
                      alt={design.title} 
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover transition-opacity duration-300" 
                    />
                    
                    {/* Master Cover Overlay Badge */}
                    {isMasterCover && (
                      <span className="absolute top-1.5 left-1.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[10px] sm:text-[11px] font-extrabold px-2 py-0.5 rounded-lg shadow-md z-10 border border-amber-300 flex items-center gap-1">
                        🌟 마스터 표지
                      </span>
                    )}

                    {/* Select mode checkbox */}
                    {isSelectMode && (
                      <div className="absolute top-2 left-2 z-10">
                        <input
                          type="checkbox"
                          checked={selectedIdsForDelete.includes(design.id)}
                          onChange={() => {}}
                          className="w-5 h-5 accent-rose-600 rounded cursor-pointer shadow-md"
                        />
                      </div>
                    )}

                    <div className="absolute top-1.5 right-1.5 flex gap-1.5 opacity-100 transition-opacity backdrop-blur-sm">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleToggleLikeDesign(design.id, !design.is_liked); }}
                        className={`bg-white/90 hover:bg-white p-1.5 rounded-full shadow-sm border border-gray-200 transition-colors flex items-center justify-center w-7 h-7 ${design.is_liked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}
                        title={design.is_liked ? "좋아요 취소" : "좋아요"}
                      >
                        <svg className="w-4 h-4" fill={design.is_liked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleMoveToTrash([design.id]); }}
                        className="bg-white/90 hover:bg-red-50 text-gray-400 hover:text-red-500 p-1.5 rounded-full shadow-sm border border-gray-200 transition-colors flex items-center justify-center w-7 h-7"
                        title="삭제함으로 이동"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </div>
                  </div>
                  <div className={`p-2.5 sm:p-3 flex flex-col justify-center ${viewMode === 'list' ? 'flex-1 min-w-0' : ''}`}>
                    <div className="flex items-center gap-1.5 flex-wrap mb-1">
                      {isMasterCover && (
                        <span className="text-[10px] sm:text-[11px] font-extrabold text-amber-950 bg-amber-200 border border-amber-400 px-2 py-0.5 rounded-md inline-flex items-center gap-1 shadow-2xs">
                          🌟 마스터 썸네일
                        </span>
                      )}
                      <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md inline-block w-fit">
                        {design.topic}
                      </span>
                      {design.season_name && (
                        <span className="text-[10px] sm:text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md inline-flex items-center gap-1 border border-rose-100/80">
                          {design.season_name} {design.season_days_remaining !== null && design.season_days_remaining !== undefined && `(D-${design.season_days_remaining})`}
                        </span>
                      )}
                      <span className="text-[10px] sm:text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md inline-flex items-center gap-1 border border-purple-100/80" title={`바탕 화풍: ${getStyleDisplayName(design)}`}>
                        🎨 {getStyleDisplayName(design)}
                      </span>
                      {design.target_garment === 'dark' && (
                        <span className="text-[10px] font-bold text-amber-300 bg-slate-900 px-1.5 py-0.5 rounded-md inline-block">
                          🖤 어두운 티셔츠용
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-gray-800 text-xs sm:text-sm line-clamp-2 leading-snug" title={design.title}>{design.title}</h3>
                    {design.created_at && (
                      <p className="text-[10px] text-gray-400 mt-1">
                        {new Date(design.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>
                </div>
              );
              })}
              {designs.length === 0 && !loading && (
                <div className="col-span-full text-center py-12 text-gray-500">생성된 디자인이 없습니다.</div>
              )}

            </section>

            {/* Bottom Pagination Controls */}
            {totalCount > 0 && (
              <div className="flex flex-wrap justify-between items-center gap-2 pt-6 pb-2 border-t border-gray-100 mt-4">
                <div className="text-xs text-gray-500 font-semibold pl-1">
                  총 <strong className="text-gray-900 font-extrabold">{totalCount}</strong>개 중 {page} / {totalPages} 페이지
                </div>
                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    disabled={page === 1 || loadingInitial}
                    className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors bg-white shadow-xs"
                  >
                    이전
                  </button>
                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                      <button
                        key={p}
                        onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        disabled={loadingInitial}
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg text-sm font-medium transition-colors ${page === p ? 'bg-blue-600 text-white font-bold shadow-xs' : 'border border-gray-200 text-gray-600 hover:bg-gray-50 bg-white'}`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                  <button 
                    onClick={() => { setPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    disabled={page === totalPages || loadingInitial}
                    className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors bg-white shadow-xs"
                  >
                    다음
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Detail Modal */}
        {selectedDesign && (
          <div className="fixed inset-0 bg-black/60 z-[90] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-2xl">
              {/* Left: Image */}
              <div className="w-full md:w-1/2 bg-gray-100 flex items-center justify-center relative p-4 sm:p-6 min-h-[30vh] sm:min-h-0">
                <img src={previewDesign ? previewDesign.image_url : selectedDesign.image_url} alt={previewDesign ? previewDesign.title : selectedDesign.title} className="max-w-full max-h-full object-contain rounded-xl shadow-md" />
              </div>
              
              {/* Right: Details & Chat */}
              <div className="md:w-1/2 flex flex-col flex-1 min-h-0 bg-white relative">
                <button onClick={() => { setSelectedDesign(null); handleCancel(); setActiveTab('info'); }} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 text-xl font-bold z-10 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">×</button>
                
                <div className="flex border-b border-gray-100 px-5 sm:px-8 pt-5 sm:pt-8 gap-6">
                  <button 
                    onClick={() => setActiveTab('info')} 
                    className={`pb-3 font-semibold text-sm transition-colors border-b-2 ${activeTab === 'info' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-700'}`}
                  >
                    수정·SEO
                  </button>
                  <button 
                    onClick={() => setActiveTab('mockup')} 
                    className={`pb-3 font-semibold text-sm transition-colors border-b-2 flex items-center gap-1.5 ${activeTab === 'mockup' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-400 hover:text-gray-700'}`}
                  >
                    {isStickerMode ? '📦 스티커 디스플레이' : '👕 목업'}
                  </button>
                  <button 
                    onClick={() => setActiveTab('edit')} 
                    className={`pb-3 font-semibold text-sm transition-colors border-b-2 flex items-center gap-1.5 ${activeTab === 'edit' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-400 hover:text-gray-700'}`}
                  >
                    🖌️ 편집
                  </button>
                </div>

                <div className="p-5 sm:p-8 overflow-y-auto flex-1 custom-scrollbar">
                  {activeTab === 'info' && (() => {
                    const currentActiveDesign = previewDesign || selectedDesign;
                    const etsySeo = currentActiveDesign ? generateEtsySeo(currentActiveDesign) : null;

                    return (
                      <>
                        {isCoverDesign(currentActiveDesign) && (
                          <div className="mb-3.5 p-3 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl shadow-xs flex items-center gap-2.5">
                            <span className="text-xl shrink-0">🌟</span>
                            <div>
                              <h4 className="text-xs sm:text-sm font-extrabold text-amber-950 flex items-center gap-1.5">
                                <span>Etsy 스티커 팩 대표 마스터 썸네일 커버 표지</span>
                                <span className="bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">Master Cover</span>
                              </h4>
                              <p className="text-[11px] sm:text-xs text-amber-900 mt-0.5 font-medium">
                                Etsy 판매 등록 시 <span className="font-bold underline text-amber-950">1번 메인 대표 썸네일 표지</span>로 노출하는 그래픽입니다.
                              </p>
                            </div>
                          </div>
                        )}

                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{currentActiveDesign?.title}</h2>
                        
                        {/* 📝 Etsy 영문 SEO Title (140자 최적화) 배너 */}
                        {etsySeo && (
                          <div className="mb-4 p-3.5 bg-gradient-to-r from-blue-50/90 to-indigo-50/80 border-2 border-indigo-200 rounded-2xl space-y-2 shadow-2xs">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <div className="flex items-center gap-1.5">
                                <span className="text-base">📝</span>
                                <span className="text-xs font-black text-indigo-950 uppercase tracking-wider">Etsy 영문 제목 (SEO Title)</span>
                                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full border border-emerald-300">
                                  ✓ {etsySeo.wordCount}단어 (14단어 이하 준수)
                                </span>
                                <span className="text-[10px] bg-indigo-200 text-indigo-900 font-extrabold px-2 py-0.5 rounded-full">
                                  {etsySeo.charCount}/140자
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  handleCopy(etsySeo.title);
                                  setCopiedEtsyTitleNotice(true);
                                  setTimeout(() => setCopiedEtsyTitleNotice(false), 2000);
                                }}
                                className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1 rounded-lg transition-all flex items-center gap-1 shadow-xs cursor-pointer"
                              >
                                <span>{copiedEtsyTitleNotice ? '✓ 복사완료!' : '📋 영문 제목 복사'}</span>
                              </button>
                            </div>
                            <div className="p-2.5 bg-white rounded-xl border border-indigo-100 text-xs sm:text-sm text-gray-800 font-medium select-all">
                              {etsySeo.title}
                            </div>
                          </div>
                        )}

                        {/* 복사 액션 버튼 모음 */}
                        <div className="flex flex-wrap gap-2 mb-6">
                          <button onClick={() => handleCopy(currentActiveDesign?.title)} className="text-xs sm:text-sm bg-gray-100 hover:bg-gray-200 px-3.5 py-1.5 rounded-full font-medium transition-colors cursor-pointer">한글명 복사</button>
                          {etsySeo && (
                            <button 
                              onClick={() => {
                                handleCopy(etsySeo.title);
                                setCopiedEtsyTitleNotice(true);
                                setTimeout(() => setCopiedEtsyTitleNotice(false), 2000);
                              }} 
                              className="text-xs sm:text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1.5 rounded-full font-bold transition-colors cursor-pointer shadow-2xs"
                            >
                              {copiedEtsyTitleNotice ? '✓ 영문 제목 복사완료!' : '📋 Etsy 영문 제목 복사'}
                            </button>
                          )}
                          <button onClick={() => handleCopy(etsySeo ? etsySeo.tags.join(', ') : currentActiveDesign?.tags?.join(', '))} className="text-xs sm:text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 px-3.5 py-1.5 rounded-full font-medium transition-colors cursor-pointer">Etsy 13태그 복사</button>
                          {etsySeo && (
                            <button 
                              onClick={() => {
                                handleCopy(etsySeo.description);
                                setCopiedEtsyDescNotice(true);
                                setTimeout(() => setCopiedEtsyDescNotice(false), 2000);
                              }}
                              className="text-xs sm:text-sm bg-amber-500 hover:bg-amber-600 text-white px-3.5 py-1.5 rounded-full font-bold transition-colors cursor-pointer shadow-2xs"
                            >
                              {copiedEtsyDescNotice ? '✓ 영문 설명 복사완료!' : '📋 Etsy 영문 상세설명 복사'}
                            </button>
                          )}
                        </div>

                          {/* 📄 Etsy 영문 상세설명 (Listing Description) 전문 섹션 */}
                          {etsySeo && (
                            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2.5">
                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                <div className="flex items-center gap-2">
                                  <span className="text-base">📄</span>
                                  <h4 className="text-xs font-extrabold text-amber-950 uppercase tracking-wider">
                                    Etsy 영문 상세설명 (Listing Description)
                                  </h4>
                                  <span className="text-[10px] bg-amber-500 text-white font-bold px-2 py-0.5 rounded-full">
                                    원클릭 복사
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => setIsDetailDescExpanded(!isDetailDescExpanded)}
                                    className="text-xs text-amber-800 hover:text-amber-950 font-bold px-2.5 py-1 rounded-lg border border-amber-300 bg-white/80 transition-colors cursor-pointer"
                                  >
                                    {isDetailDescExpanded ? '접기 ▲' : '전문 보기 ▼'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleCopy(etsySeo.description);
                                      setCopiedEtsyDescNotice(true);
                                      setTimeout(() => setCopiedEtsyDescNotice(false), 2000);
                                    }}
                                    className="text-xs bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1 rounded-lg transition-all flex items-center gap-1 shadow-xs cursor-pointer"
                                  >
                                    <span>{copiedEtsyDescNotice ? '✓ 복사완료!' : '📋 영문 설명 복사'}</span>
                                  </button>
                                </div>
                              </div>
                              <p className="text-[11px] text-amber-900/90 leading-relaxed">
                                Etsy 상품 등록 시 <strong>Description</strong> 입력창에 그대로 붙여넣을 수 있는 라이선스, 구성품, 소프트웨어 호환성 완벽 포맷 전문입니다.
                              </p>
                              <div className={`p-3 bg-white rounded-xl border border-amber-200 text-xs text-gray-700 font-mono leading-relaxed whitespace-pre-wrap ${isDetailDescExpanded ? 'max-h-[500px]' : 'max-h-36'} overflow-y-auto custom-scrollbar select-all`}>
                                {etsySeo.description}
                              </div>
                            </div>
                          )}

                          <div className="pt-4 border-t border-gray-100 space-y-3">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">고해상도 다운로드 옵션</h4>
                            <div className="flex flex-col sm:flex-row gap-2.5">
                              <button 
                                onClick={downloadPODPrintPNG}
                                disabled={isProcessingPNG}
                                className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm flex items-center justify-center gap-2 whitespace-nowrap"
                              >
                                {isProcessingPNG ? (
                                  <>
                                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>4K 변환 중...</span>
                                  </>
                                ) : (
                                  <>
                                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                    <span>🖨️ 4K 투명 PNG</span>
                                  </>
                                )}
                              </button>

                              <button 
                                onClick={downloadMockup}
                                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm flex items-center justify-center gap-2 whitespace-nowrap"
                              >
                                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                <span>{isStickerMode ? '📦 스티커 디스플레이 다운' : '👕 2.5K 목업'}</span>
                              </button>
                            </div>
                          </div>
                      </>
                    );
                  })()}
                  {activeTab === 'mockup' && (
                    <div className="flex flex-col items-center h-full min-h-[400px]">
                      {isStickerMode && (
                        <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 mb-3 text-xs text-teal-950 w-full flex items-start gap-2">
                          <span className="text-base shrink-0">💡</span>
                          <div>
                            <span className="font-bold">Etsy 스티커 셀링 핵심 노하우:</span> 스티커 베스트셀러는 의류 목업 대신 <span className="font-bold text-teal-700">전체 20종 스티커 종합 컬렉션 디스플레이</span>와 <span className="font-bold text-teal-700">대표 마스터 썸네일 커버 표지(00_Master_Sticker_Pack_Cover.png)</span>를 메인으로 노출할 때 가장 높은 판매 전환율을 기록합니다.
                          </div>
                        </div>
                      )}
                      <div className="w-full mb-4 flex flex-col gap-3">
                        <div className="flex flex-col w-full gap-2.5">
                          <select 
                            value={selectedMockupId}
                            onChange={(e) => setSelectedMockupId(e.target.value)}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white shadow-xs"
                          >
                            {getMockupsForMode(isStickerMode).map(t => (
                              <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                          </select>
                          
                          <div className="grid grid-cols-2 gap-2 w-full">
                            <button 
                              onClick={downloadMockup}
                              title="Etsy 고화질 목업 다운로드"
                              className="bg-orange-500 hover:bg-orange-600 active:scale-98 text-white px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 w-full whitespace-nowrap"
                            >
                              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                              <span>{isStickerMode ? '📦 스티커 디스플레이 다운' : '👕 2.5K 목업'}</span>
                            </button>
                            
                            <button 
                              onClick={downloadPODPrintPNG}
                              disabled={isProcessingPNG}
                              title="4K 투명 PNG 인쇄용 다운로드"
                              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 active:scale-98 text-white px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 w-full whitespace-nowrap"
                            >
                              {isProcessingPNG ? (
                                '4K 변환중...'
                              ) : (
                                <>
                                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                  <span>🖨️ 4K PNG</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                          <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-gray-500 text-center">크기 조절 (Zoom)</label>
                            <input 
                              type="range" min="0.5" max="2.0" step="0.01" 
                              value={mockupScale} onChange={(e) => setMockupScale(parseFloat(e.target.value))}
                              className="w-full accent-orange-500 touch-none"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-gray-500 text-center">좌우 이동 (X)</label>
                            <input 
                              type="range" min="-300" max="300" step="1" 
                              value={mockupOffsetX} onChange={(e) => setMockupOffsetX(parseInt(e.target.value))}
                              className="w-full accent-orange-500 touch-none"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-gray-500 text-center">상하 이동 (Y)</label>
                            <input 
                              type="range" min="-300" max="300" step="1" 
                              value={mockupOffsetY} onChange={(e) => setMockupOffsetY(parseInt(e.target.value))}
                              className="w-full accent-orange-500 touch-none"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="relative w-full flex-1 bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center border border-gray-200">
                        <canvas ref={canvasRef} className="max-w-full max-h-full object-contain" />
                      </div>
                    </div>
                  )}
                  
                  {activeTab === 'edit' && (
                    <div className="flex flex-col h-full gap-4">
                      <div className="flex flex-col gap-2">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
                            <button 
                              onClick={() => setEditMode('eraser')} 
                              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${editMode === 'eraser' ? 'bg-white shadow-sm text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                              지우개
                            </button>
                            <button 
                              onClick={() => setEditMode('text')} 
                              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${editMode === 'text' ? 'bg-white shadow-sm text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                              텍스트
                            </button>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button onClick={downloadEditCanvas} className="text-xs px-2 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg font-medium shadow-sm transition-colors flex items-center gap-1">
                              ⬇️ 다운
                            </button>
                            <button onClick={saveManualEdit} disabled={isSavingManual} className="text-xs px-2 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium shadow-sm transition-colors flex items-center gap-1 disabled:opacity-50">
                              💾 {isSavingManual ? '저장 중...' : '저장'}
                            </button>
                          </div>
                        </div>

                        {editMode === 'eraser' && (
                          <div className="flex flex-wrap items-center gap-3">
                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                              지우개 굵기:
                              <input 
                                type="range" min="5" max="100" step="1" 
                                value={brushSize} onChange={(e) => setBrushSize(parseInt(e.target.value))}
                                className="w-24 accent-purple-500"
                              />
                            </label>
                            <div className="flex gap-2 ml-auto sm:ml-0">
                              <button onClick={handleUndo} disabled={history.length === 0} className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors disabled:opacity-50">
                                ↩️ 되돌리기
                              </button>
                              <button onClick={resetEditCanvas} className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors">
                                초기화
                              </button>
                            </div>
                          </div>
                        )}
                        
                        {editMode === 'text' && (
                          <div className="flex flex-wrap items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200">
                            <button onClick={handleAddText} className="text-xs px-3 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-md font-bold transition-colors">
                              + 텍스트
                            </button>
                            {activeTextId && (
                              <>
                                <div className="h-4 w-px bg-gray-300 mx-1"></div>
                                <select 
                                  className="text-xs border border-gray-200 rounded p-1"
                                  value={textElements.find(t => t.id === activeTextId)?.font}
                                  onChange={(e) => updateTextElement(activeTextId, { font: e.target.value })}
                                >
                                  <option value="Pacifico">Pacifico (손글씨)</option>
                                  <option value="Comic Neue">Comic Neue (위트)</option>
                                  <option value="Jua">Jua (둥근고딕)</option>
                                  <option value="Roboto">Roboto (기본)</option>
                                </select>
                                <input 
                                  type="number" 
                                  className="text-xs border border-gray-200 rounded p-1 w-16"
                                  value={textElements.find(t => t.id === activeTextId)?.size}
                                  onChange={(e) => updateTextElement(activeTextId, { size: parseInt(e.target.value) || 20 })}
                                />
                                <input 
                                  type="color" 
                                  className="w-6 h-6 p-0 border-0 rounded cursor-pointer"
                                  value={textElements.find(t => t.id === activeTextId)?.color}
                                  onChange={(e) => updateTextElement(activeTextId, { color: e.target.value })}
                                />
                                <button 
                                  onClick={() => setTextElements(prev => prev.filter(t => t.id !== activeTextId))}
                                  className="text-xs text-red-500 hover:text-red-700 ml-auto"
                                >
                                  삭제
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="relative w-full flex-1 bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center border border-gray-200 touch-none shadow-inner">
                        <div 
                          className="relative inline-block leading-none cursor-none"
                          onMouseEnter={() => setIsHoveringCanvas(true)}
                          onMouseMove={handleCanvasMouseMove}
                          onMouseUp={handleCanvasMouseUp}
                          onMouseOut={handleCanvasMouseLeave}
                          onMouseLeave={handleCanvasMouseLeave}
                          onTouchMove={handleCanvasMouseMove}
                          onTouchEnd={handleCanvasMouseUp}
                        >
                          <canvas 
                            ref={editCanvasRef} 
                            className={`max-w-full max-h-full object-contain ${editMode === 'eraser' ? 'cursor-none' : 'cursor-default'}`}
                            onMouseDown={editMode === 'eraser' ? startDrawing : undefined}
                            onTouchStart={editMode === 'eraser' ? startDrawing : undefined}
                          />
                          
                          {/* Custom Eraser Cursor */}
                          {editMode === 'eraser' && isHoveringCanvas && (
                            <div 
                              style={{
                                position: 'absolute',
                                left: cursorPos.x,
                                top: cursorPos.y,
                                width: brushSize * canvasDisplayScale,
                                height: brushSize * canvasDisplayScale,
                                borderRadius: '50%',
                                border: '1.5px solid rgba(0,0,0,0.5)',
                                backgroundColor: 'rgba(255,255,255,0.4)',
                                pointerEvents: 'none',
                                transform: 'translate(-50%, -50%)',
                                zIndex: 10,
                                boxShadow: '0 0 0 1px rgba(255,255,255,0.3)'
                              }}
                            />
                          )}
                          {textElements.map(t => (
                            <div
                              key={t.id}
                              onMouseDown={(e) => handleTextMouseDown(e, t.id)}
                              onTouchStart={(e) => handleTextMouseDown(e, t.id)}
                              style={{
                                position: 'absolute',
                                left: t.x * canvasDisplayScale,
                                top: t.y * canvasDisplayScale,
                                fontFamily: `'${t.font}', sans-serif`,
                                fontSize: `${t.size * canvasDisplayScale}px`,
                                color: t.color,
                                cursor: editMode === 'text' ? 'move' : 'default',
                                userSelect: 'none',
                                whiteSpace: 'nowrap',
                                outline: activeTextId === t.id && editMode === 'text' ? '2px dashed #a855f7' : 'none',
                                padding: '2px',
                                pointerEvents: editMode === 'text' ? 'auto' : 'none'
                              }}
                            >
                              <input
                                type="text"
                                value={t.text}
                                onChange={(e) => updateTextElement(t.id, { text: e.target.value })}
                                onFocus={() => setActiveTextId(t.id)}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  outline: 'none',
                                  color: 'inherit',
                                  font: 'inherit',
                                  width: `${Math.max(t.text.length, 1) + 0.5}ch`
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 text-center font-medium">
                        {editMode === 'eraser' ? '💡 마우스로 드래그하여 원하지 않는 부분을 하얗게 지워보세요.' : '💡 텍스트를 추가하고 드래그하여 원하는 위치에 배치하세요.'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Chat Interface for Modification */}
                {activeTab === 'info' && (
                  <div className="p-4 sm:p-6 border-t border-gray-100 bg-gray-50/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <span>✨</span> 디자인 수정 요청
                      </h4>
                      {previewDesign && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full font-bold">
                          미리보기 적용 중
                        </span>
                      )}
                    </div>

                    <div className="space-y-2">
                      <input 
                        type="text" 
                        value={globalCatchphrase}
                        onChange={e => setGlobalCatchphrase(e.target.value)}
                        placeholder="브랜드 문구 추가 (선택)" 
                        className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm disabled:opacity-50"
                        disabled={modifying || autoGeneratePhrase}
                        title="이 텍스트가 수정된 디자인에 자연스럽게 합성됩니다."
                      />
                      <div className="flex items-center gap-2 bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                        <input
                          type="checkbox"
                          id="auto-phrase-modify"
                          checked={autoGeneratePhrase}
                          onChange={(e) => setAutoGeneratePhrase(e.target.checked)}
                          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                        />
                        <label htmlFor="auto-phrase-modify" className="text-xs font-semibold text-gray-700 cursor-pointer select-none">
                          위트 문구 자동 생성 (추천)
                        </label>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={feedback}
                        onChange={e => setFeedback(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleModify()}
                        placeholder={
                          previewDesign 
                            ? "추가 수정 명령어 입력 (예: 폰트 확대)" 
                            : ((globalCatchphrase.trim() || autoGeneratePhrase) ? "예: 텍스트 상단 배치 (선택)" : "예: 배경색 변경...")
                        }
                        className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
                        disabled={modifying}
                      />
                      <button 
                        onClick={handleModify}
                        disabled={modifying || (!feedback.trim() && !globalCatchphrase.trim() && !autoGeneratePhrase)}
                        className="bg-gray-900 hover:bg-black text-white px-4 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50 text-sm flex-shrink-0 shadow-sm flex items-center gap-1.5 whitespace-nowrap"
                      >
                        {modifying ? (
                          <span>생성 중...</span>
                        ) : (
                          <span>{previewDesign ? '다시 수정' : '수정'}</span>
                        )}
                      </button>
                    </div>

                    {previewDesign && (
                      <div className="flex items-center justify-between gap-2 p-2.5 bg-blue-50/80 rounded-xl border border-blue-100">
                        <span className="text-xs font-semibold text-blue-900 flex items-center gap-1 shrink-0">
                          💡 만족 시 [확인], 취소 시 [원본 복원]
                        </span>
                        <div className="flex gap-2 shrink-0">
                          <button 
                            onClick={handleCancel}
                            disabled={modifying}
                            className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-3.5 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50 text-xs shadow-xs"
                          >
                            취소
                          </button>
                          <button 
                            onClick={handleConfirm}
                            disabled={modifying}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-lg font-bold transition-colors disabled:opacity-50 text-xs shadow-xs"
                          >
                            {modifying ? '저장 중...' : '확인'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {/* Auto Agent Modal */}
        {isAutoAgentModalOpen && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl relative">
              <button onClick={() => setIsAutoAgentModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 text-xl font-bold z-10 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">×</button>
              <h2 className="text-xl font-bold text-gray-900 mb-4">자동 생성 설정</h2>
              
              <label className="block text-sm font-semibold text-gray-700 mb-2">어떤 동물로 만들까요?</label>
              <select 
                value={autoAgentAnimal}
                onChange={(e) => setAutoAgentAnimal(e.target.value)}
                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm mb-6"
              >
                <option value="random">랜덤 (Random)</option>
                <option value="hamster">햄스터 (Hamster)</option>
                <option value="guinea pig">기니피그 (Guinea Pig)</option>
                <option value="kitten">새끼 고양이 (Kitten)</option>
                <option value="puppy">강아지 (Puppy)</option>
                <option value="bunny">토끼 (Bunny)</option>
                <option value="duckling">새끼 오리 (Duckling)</option>
                <option value="piglet">아기 돼지 (Piglet)</option>
                <option value="pygmy hippo">피그미 하마 (Pygmy Hippo)</option>
                <option value="sea otter pup">새끼 해달 (Sea Otter Pup)</option>
                <option value="black bear cub">새끼 흑곰 (Black Bear Cub)</option>
                <option value="fawn">새끼 사슴 (Fawn)</option>
                <option value="baby sloth">나무늘보 (Baby Sloth)</option>
                <option value="baby hedgehog">새끼 고슴도치 (Baby Hedgehog)</option>
                <option value="baby red panda">레서판다 (Baby Red Panda)</option>
              </select>

              <label className="block text-sm font-semibold text-gray-700 mb-2">티셔츠 색상 타겟</label>
              <select 
                value={autoAgentGarmentColor}
                onChange={(e) => setAutoAgentGarmentColor(e.target.value)}
                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm mb-6"
              >
                <option value="random">랜덤 (밝은 티셔츠 70%, 검정/네이비 30%)</option>
                <option value="light">밝은 티셔츠 전용 (흰색/크림)</option>
                <option value="dark">어두운 티셔츠 전용 (검정/네이비 - 화이트/파스텔 글씨)</option>
              </select>

              <label className="block text-sm font-semibold text-gray-700 mb-2">유행 시즌 (도래 3달 전 법칙)</label>
              <select 
                value={autoAgentSeason}
                onChange={(e) => setAutoAgentSeason(e.target.value)}
                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm mb-6"
              >
                <option value="auto">⚡ 자동 (도래 3달 전 활성 시즌 우선)</option>
                {SEASONAL_HOLIDAYS.map(h => {
                  const activeInfo = activeSeasonsList.find(s => s.holiday.id === h.id);
                  return (
                    <option key={h.id} value={h.id}>
                      {h.icon} {h.koreanName} ({h.name}) {activeInfo ? `[D-${activeInfo.daysRemaining} 3달전 집중]` : ''}
                    </option>
                  );
                })}
              </select>

              <div className="flex items-center gap-2 mb-6 bg-blue-50 p-3 rounded-lg border border-blue-100">
                <input
                  type="checkbox"
                  id="auto-phrase-modal"
                  checked={autoGeneratePhrase}
                  onChange={(e) => setAutoGeneratePhrase(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="auto-phrase-modal" className="text-sm font-semibold text-blue-800 cursor-pointer select-none">
                  위트 문구 자동 생성 (추천)
                </label>
              </div>

              <div className="flex gap-3 justify-end">
                <button 
                  onClick={() => setIsAutoAgentModalOpen(false)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-5 rounded-xl transition-colors flex-1"
                >
                  취소
                </button>
                <button 
                  onClick={runAgent}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-5 rounded-xl transition-colors disabled:opacity-50 flex-1"
                >
                  생성 시작
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Image to Image Modal */}
        {isImageModalOpen && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onPaste={handlePaste}>
            <div className={`bg-white rounded-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative ${uploadPreviewDesign ? 'max-w-4xl md:flex-row' : 'max-w-2xl'}`}>
              <div className="absolute top-4 left-4 z-10 flex items-center space-x-2">
                <button 
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.dispatchEvent(new Event('go-home-reset'));
                    }
                  }} 
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center space-x-1.5 shadow-sm transition-colors cursor-pointer"
                  title="첫화면으로 이동"
                >
                  <span>🏠 첫화면으로</span>
                </button>
              </div>
              <button onClick={() => { setIsImageModalOpen(false); setUploadImageBase64(''); setUploadPrompt(''); setUploadPreviewDesign(null); }} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 text-xl font-bold z-10 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">×</button>
              
              {uploadPreviewDesign ? (
                <>
                  <div className="w-full md:w-1/2 bg-gray-100 flex items-center justify-center relative p-4 sm:p-6 min-h-[30vh] sm:min-h-0 cursor-pointer group" title="클릭 시 첫화면으로 이동" onClick={() => { if (typeof window !== 'undefined') window.dispatchEvent(new Event('go-home-reset')); }}>
                    <img src={uploadPreviewDesign.image_url} alt={uploadPreviewDesign.title} className="max-w-full max-h-full object-contain rounded-xl shadow-md group-hover:scale-105 transition-transform" />
                    <span className="absolute bottom-3 bg-black/70 text-white text-xs px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">🏠 클릭 시 첫화면으로 이동</span>
                  </div>
                  <div className="md:w-1/2 flex flex-col flex-1 min-h-0 bg-white relative">
                    <div className="p-5 sm:p-8 overflow-y-auto flex-1 custom-scrollbar">
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{uploadPreviewDesign.title}</h2>
                      <div className="space-y-6 mt-6">
                        <div>
                          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">SEO Tags</h4>
                          <div className="flex flex-wrap gap-2">
                            {uploadPreviewDesign.tags?.map((tag: string, i: number) => (
                              <span key={i} className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full border border-blue-100">{tag}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 sm:p-6 border-t border-gray-100 bg-gray-50/50">
                      <div className="flex gap-2 justify-end w-full">
                        <button 
                          onClick={handleCancelUpload}
                          disabled={isGeneratingFromImage}
                          className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-5 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 text-sm flex-1 sm:flex-none shadow-sm"
                        >
                          다시 만들기
                        </button>
                        <button 
                          onClick={handleConfirmUpload}
                          disabled={isGeneratingFromImage}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 text-sm flex-1 sm:flex-none shadow-sm"
                        >
                          {isGeneratingFromImage ? '저장 중...' : '확인 (최종 반영)'}
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-6 sm:p-8 flex flex-col h-full w-full">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 mt-4 sm:mt-0">새 디자인 생성</h2>
                  
                  <div className="flex-1 space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 sm:p-6 text-center hover:bg-gray-50 transition-colors relative flex flex-col items-center justify-center min-h-[200px]">
                      {uploadImageBase64 ? (
                        <>
                          <img 
                            src={uploadImageBase64} 
                            alt="Preview" 
                            className="max-h-64 object-contain rounded-lg cursor-pointer hover:opacity-90 transition-opacity" 
                            onClick={() => {
                              if (typeof window !== 'undefined') {
                                window.dispatchEvent(new Event('go-home-reset'));
                              }
                            }}
                            title="업로드 이미지 클릭 시 첫화면으로 이동"
                          />
                          <div className="flex items-center space-x-3 mt-2">
                            <button onClick={() => setUploadImageBase64('')} className="text-xs text-red-500 hover:underline">이미지 지우기</button>
                            <button 
                              onClick={() => {
                                if (typeof window !== 'undefined') {
                                  window.dispatchEvent(new Event('go-home-reset'));
                                }
                              }} 
                              className="text-xs text-indigo-600 font-semibold hover:underline"
                            >
                              🏠 클릭하여 첫화면 이동
                            </button>
                          </div>
                        </>
                      ) : (

                        <>
                          <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          <p className="text-sm text-gray-600 mb-1">참고할 이미지가 있다면 클릭하여 첨부하세요 (선택 사항)</p>
                          <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                        </>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">동물 선택</label>
                      <select 
                        value={selectedAnimal}
                        onChange={(e) => setSelectedAnimal(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white shadow-sm mb-4"
                      >
                        <option value="">동물 없음 (순수 오브제 / 템플릿 전용)</option>
                        <option value="hamster">햄스터 (Hamster)</option>
                        <option value="guinea pig">기니피그 (Guinea Pig)</option>
                        <option value="kitten">새끼 고양이 (Kitten)</option>
                        <option value="puppy">강아지 (Puppy)</option>
                        <option value="bunny">토끼 (Bunny)</option>
                        <option value="duckling">새끼 오리 (Duckling)</option>
                        <option value="piglet">아기 돼지 (Piglet)</option>
                        <option value="pygmy hippo">피그미 하마 (Pygmy Hippo)</option>
                        <option value="sea otter pup">새끼 해달 (Sea Otter Pup)</option>
                        <option value="black bear cub">새끼 흑곰 (Black Bear Cub)</option>
                        <option value="fawn">새끼 사슴 (Fawn)</option>
                        <option value="baby sloth">나무늘보 (Baby Sloth)</option>
                        <option value="baby hedgehog">새끼 고슴도치 (Baby Hedgehog)</option>
                        <option value="baby red panda">레서판다 (Baby Red Panda)</option>
                      </select>

                      <label className="block text-sm font-semibold text-gray-700 mb-2">어떤 디자인을 만들까요? (필수)</label>
                      <textarea 
                        value={uploadPrompt}
                        onChange={e => setUploadPrompt(e.target.value)}
                        placeholder="예: 수채화 톤의 코티지코어 감성, 들꽃 일러스트" 
                        className="w-full border border-gray-200 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white shadow-sm resize-none h-24"
                      />
                    </div>
                    
                    <div className="mt-4">
                      {!uploadPrompt.toLowerCase().includes('die-cut sticker') ? (
                        <div className="flex items-center gap-2 mb-4 bg-purple-50 p-3 rounded-lg border border-purple-100">
                          <input
                            type="checkbox"
                            id="auto-phrase-image-modal"
                            checked={autoGeneratePhrase}
                            onChange={(e) => setAutoGeneratePhrase(e.target.checked)}
                            className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500 cursor-pointer"
                          />
                          <label htmlFor="auto-phrase-image-modal" className="text-sm font-semibold text-purple-800 cursor-pointer select-none">
                            위트 문구 자동 생성 (추천)
                          </label>
                        </div>
                      ) : (
                        <div className="mb-4 bg-emerald-50 p-3 rounded-lg border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
                          <span>✨</span>
                          <span>스티커 템플릿 전용 모드: 임의의 무단 문구가 주입되지 않습니다.</span>
                        </div>
                      )}
                      <label className="block text-sm font-semibold text-gray-700 mb-2">적용할 화풍 (선택)</label>
                      <select 
                        value={selectedStyleId || ''}
                        onChange={(e) => setSelectedStyleId(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white shadow-sm"
                      >
                        <option value="">-- 원본 이미지 스타일 유지 --</option>
                        {styles.map(s => (
                          <option key={s.id} value={s.id}>
                            {s.is_priority ? '⭐️ ' : ''}{s.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3 justify-end">
                    <button 
                      onClick={() => { setIsImageModalOpen(false); setUploadImageBase64(''); setUploadPrompt(''); setUploadPreviewDesign(null); }}
                      className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-xl font-medium transition-colors"
                    >
                      취소
                    </button>
                    <button 
                      onClick={handleGenerateFromImage}
                      disabled={!uploadPrompt.trim() || isGeneratingFromImage}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 min-w-[120px]"
                    >
                      {isGeneratingFromImage ? '생성 중...' : '생성하기'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Manage Styles Modal */}
        {isManageStylesModalOpen && (
          <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative">
              <button onClick={() => { setIsManageStylesModalOpen(false); setEditingStyleId(null); }} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 text-xl font-bold z-10 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">×</button>
              
              <div className="p-6 sm:p-8 flex flex-col h-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100 pr-8">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                      <span>⚙️ 화풍 관리</span>
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">화풍을 새로 등록하거나 트렌드 화풍을 생성/관리할 수 있습니다.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setIsStyleModalOpen(true)}
                      className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-3.5 rounded-xl transition-colors text-xs sm:text-sm shadow-sm flex items-center gap-1 shrink-0"
                    >
                      <span>➕ 화풍 등록</span>
                    </button>
                    <button 
                      onClick={handleManualTrendSearch}
                      disabled={isGeneratingTrend}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-3.5 rounded-xl transition-colors disabled:opacity-50 text-xs sm:text-sm shadow-sm flex items-center gap-1 shrink-0"
                    >
                      <span>✨ {isGeneratingTrend ? '트렌드 분석중..' : '트렌드화풍 생성'}</span>
                    </button>
                  </div>
                </div>
                
                <div className="overflow-y-auto flex-1 custom-scrollbar space-y-4">
                  {styles.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">저장된 화풍이 없습니다.</div>
                  ) : (
                    styles.map((style) => (
                      <div key={style.id} className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden shrink-0 border border-gray-200">
                          {style.image_url ? (
                            <img 
                              src={style.image_url} 
                              alt={style.name} 
                              className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity" 
                              onClick={() => setEnlargedStyleImage(style.image_url)}
                              title="크게 보기"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Img</div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          {editingStyleId === style.id ? (
                            <div className="flex gap-2">
                              <input 
                                type="text"
                                value={editingStyleName}
                                onChange={(e) => setEditingStyleName(e.target.value)}
                                className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                autoFocus
                                onKeyDown={(e) => e.key === 'Enter' && handleUpdateStyle(style.id)}
                              />
                              <button onClick={() => handleUpdateStyle(style.id)} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700">저장</button>
                              <button onClick={() => setEditingStyleId(null)} className="bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-300">취소</button>
                            </div>
                          ) : (
                            <h3 className="font-bold text-gray-800 truncate">{style.name}</h3>
                          )}
                        </div>

                        {editingStyleId !== style.id && (
                          <div className="flex gap-2 shrink-0">
                            <button 
                              onClick={() => handleTogglePriority(style.id, !style.is_priority)}
                              className={`p-2 transition-colors ${style.is_priority ? 'text-yellow-500 hover:text-yellow-600' : 'text-gray-300 hover:text-yellow-400'}`}
                              title={style.is_priority ? "우선순위 해제" : "우선순위 설정"}
                            >
                              ★
                            </button>
                            <button 
                              onClick={() => { setEditingStyleId(style.id); setEditingStyleName(style.name); }}
                              className="text-gray-400 hover:text-blue-600 p-2 transition-colors"
                              title="이름 수정"
                            >
                              ✏️
                            </button>
                            <button 
                              onClick={() => handleDeleteStyle(style.id)}
                              className="text-gray-400 hover:text-red-600 p-2 transition-colors"
                              title="삭제"
                            >
                              🗑️
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Style Creation Modal */}
        {isStyleModalOpen && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onPaste={handleStylePaste}>
            <div className="bg-white rounded-3xl max-w-lg w-full flex flex-col shadow-2xl overflow-hidden relative">
              <button onClick={() => { setIsStyleModalOpen(false); setStyleImageBase64(''); setStyleName(''); }} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 text-xl font-bold z-10 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">×</button>
              
              <div className="p-6 sm:p-8 flex flex-col h-full w-full">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">🎨 나만의 화풍 만들기</h2>
                </div>
                
                <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 mb-6">
                  <h4 className="text-sm font-bold text-orange-800 mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                    사용 방법 안내
                  </h4>
                  <ol className="text-xs text-orange-700 space-y-1.5 pl-5 list-decimal marker:text-orange-400">
                    <li>그림체나 색감이 마음에 드는 <strong>레퍼런스 이미지</strong>를 업로드하세요.</li>
                    <li>이름을 지정하고 저장하면, AI가 <strong>'화풍(스타일)'만 정밀 분석하여 공식으로 저장</strong>합니다.</li>
                    <li>저장 완료 후 메인 화면 상단의 <strong>[화풍 선택 ▾] 드롭다운에서 방금 만든 화풍을 선택</strong>하세요.</li>
                    <li>이후 그림을 생성하면, 어떤 주제를 요청하든 <strong>선택한 화풍이 강제로 적용되어 생성</strong>됩니다!</li>
                  </ol>
                </div>
                
                <div className="flex-1 space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">화풍 이름</label>
                    <input 
                      type="text"
                      value={styleName}
                      onChange={e => setStyleName(e.target.value)}
                      placeholder="예: 귀여운 수채화풍" 
                      className="w-full border border-gray-200 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white shadow-sm"
                    />
                  </div>
                  
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 sm:p-6 text-center hover:bg-gray-50 transition-colors relative flex flex-col items-center justify-center min-h-[200px]">
                    {styleImageBase64 ? (
                      <>
                        <img src={styleImageBase64} alt="Style Preview" className="max-h-64 object-contain rounded-lg" />
                        <button onClick={() => setStyleImageBase64('')} className="mt-2 text-sm text-red-500 hover:underline">이미지 지우기</button>
                      </>
                    ) : (
                      <>
                        <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        <p className="text-sm text-gray-600 mb-1">레퍼런스 이미지 파일 선택 또는 <br/>붙여넣기(Ctrl+V) 하세요.</p>
                        <input type="file" accept="image/*" onChange={handleStyleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                      </>
                    )}
                  </div>
                </div>

                <div className="mt-8 flex gap-3 justify-end">
                  <button 
                    onClick={() => { setIsStyleModalOpen(false); setStyleImageBase64(''); setStyleName(''); }}
                    className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-xl font-medium transition-colors"
                  >
                    취소
                  </button>
                  <button 
                    onClick={handleCreateStyle}
                    disabled={!styleImageBase64 || !styleName.trim() || isCreatingStyle}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 min-w-[120px]"
                  >
                    {isCreatingStyle ? '분석 및 저장 중...' : '화풍 저장하기'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Enlarged Style Image Modal */}
        {enlargedStyleImage && (
          <div 
            className="fixed inset-0 bg-black/80 z-[70] flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setEnlargedStyleImage(null)}
          >
            <div className="relative max-w-4xl max-h-[90vh] flex items-center justify-center">
              <button 
                onClick={() => setEnlargedStyleImage(null)} 
                className="absolute -top-12 right-0 text-white hover:text-gray-300 text-4xl font-bold z-10 w-12 h-12 flex items-center justify-center"
                title="닫기"
              >
                ×
              </button>
              <img 
                src={enlargedStyleImage} 
                alt="Enlarged style" 
                className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl border border-gray-700" 
                onClick={(e) => e.stopPropagation()} 
              />
            </div>
          </div>
        )}

        {/* Floating Action Bar for Multi-Select */}
        {isSelectMode && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-stone-900/90 backdrop-blur-md text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-4 border border-stone-700 animate-bounce-short">
            <span className="text-sm font-semibold">
              <strong className="text-rose-400 font-bold">{selectedIdsForDelete.length}개</strong> 선택됨
            </span>
            <button
              onClick={() => {
                if (selectedIdsForDelete.length === designs.length) {
                  setSelectedIdsForDelete([]);
                } else {
                  setSelectedIdsForDelete(designs.map(d => d.id));
                }
              }}
              className="text-xs bg-stone-800 hover:bg-stone-700 text-stone-200 px-3 py-1.5 rounded-lg transition-colors border border-stone-600"
            >
              {selectedIdsForDelete.length === designs.length ? '전체 해제' : '전체 선택'}
            </button>
            <button
              onClick={() => handleMoveToTrash(selectedIdsForDelete)}
              disabled={selectedIdsForDelete.length === 0}
              className="text-xs font-bold bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white px-4 py-1.5 rounded-lg transition-colors shadow-sm flex items-center gap-1.5"
            >
              <span>🗑️</span>
              <span>선택 항목 삭제함으로 이동</span>
            </button>
            <button
              onClick={() => {
                setIsSelectMode(false);
                setSelectedIdsForDelete([]);
              }}
              className="text-stone-400 hover:text-white text-xs font-medium pl-1"
            >
              닫기
            </button>
          </div>
        )}

        {/* 🗑️ Trash Bin Modal */}
        {isTrashModalOpen && (
          <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-3 sm:p-6 backdrop-blur-sm">
            <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-stone-200 animate-fadeIn">
              {/* Trash Header */}
              <div className="p-4 sm:p-6 bg-gradient-to-r from-stone-800 via-stone-900 to-zinc-900 text-white flex justify-between items-center shrink-0">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                    <span>🗑️ 삭제함 (Trash Bin)</span>
                    <span className="text-xs font-normal bg-rose-500/30 text-rose-300 px-2.5 py-0.5 rounded-full border border-rose-400/30">
                      {trashDesigns.length}개 보관 중
                    </span>
                  </h3>
                  <p className="text-xs text-stone-400 mt-1">
                    💡 삭제함에 들어온 이미지는 <strong>15일간 보관</strong>되며, 15일이 지나면 자동 영구 삭제됩니다. 복원 버튼을 눌러 갤러리로 되돌릴 수 있습니다.
                  </p>
                </div>
                <button
                  onClick={() => setIsTrashModalOpen(false)}
                  className="text-stone-400 hover:text-white text-2xl font-bold w-10 h-10 rounded-full flex items-center justify-center hover:bg-stone-800 transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Trash Action Toolbar */}
              <div className="p-3 sm:p-4 bg-stone-100 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (selectedIdsInTrash.length === trashDesigns.length) {
                        setSelectedIdsInTrash([]);
                      } else {
                        setSelectedIdsInTrash(trashDesigns.map(t => t.id));
                      }
                    }}
                    className="text-xs bg-white border border-stone-300 text-stone-700 font-semibold px-3 py-1.5 rounded-lg hover:bg-stone-50 transition-colors"
                  >
                    {selectedIdsInTrash.length === trashDesigns.length ? '전체 해제' : '전체 선택'}
                  </button>
                  <span className="text-xs font-medium text-stone-600">
                    {selectedIdsInTrash.length}개 선택됨
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRestoreFromTrash(selectedIdsInTrash)}
                    disabled={selectedIdsInTrash.length === 0}
                    className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-3.5 py-1.5 rounded-lg transition-colors shadow-xs flex items-center gap-1"
                  >
                    <span>↺</span>
                    <span>선택 복원 ({selectedIdsInTrash.length})</span>
                  </button>
                  <button
                    onClick={() => handlePermanentDelete(selectedIdsInTrash)}
                    disabled={selectedIdsInTrash.length === 0}
                    className="text-xs font-bold bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white px-3.5 py-1.5 rounded-lg transition-colors shadow-xs flex items-center gap-1"
                  >
                    <span>❌</span>
                    <span>선택 영구 삭제 ({selectedIdsInTrash.length})</span>
                  </button>
                  <button
                    onClick={() => handlePermanentDelete(trashDesigns.map(t => t.id))}
                    disabled={trashDesigns.length === 0}
                    className="text-xs font-bold bg-stone-800 hover:bg-stone-900 disabled:opacity-50 text-stone-200 px-3.5 py-1.5 rounded-lg transition-colors shadow-xs"
                  >
                    🗑️ 삭제함 모두 비우기
                  </button>
                </div>
              </div>

              {/* Trash Grid List */}
              <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-stone-50">
                {loadingTrash ? (
                  <div className="py-20 text-center text-stone-500 font-medium">
                    <div className="w-8 h-8 border-4 border-stone-300 border-t-stone-700 rounded-full animate-spin mx-auto mb-3"></div>
                    삭제함 목록을 불러오는 중입니다...
                  </div>
                ) : trashDesigns.length === 0 ? (
                  <div className="py-24 text-center text-stone-400 font-medium space-y-2">
                    <div className="text-4xl mb-2">🗑️</div>
                    <p className="text-base text-stone-600 font-semibold">삭제함이 비어 있습니다.</p>
                    <p className="text-xs text-stone-400">삭제한 이미지가 이곳에 15일간 안전하게 보관됩니다.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {trashDesigns.map((item) => (
                      <div
                        key={item.id}
                        className={`bg-white rounded-2xl overflow-hidden border shadow-xs transition-all relative flex flex-col justify-between ${
                          selectedIdsInTrash.includes(item.id) ? 'ring-2 ring-emerald-500 border-emerald-400 bg-emerald-50/20' : 'border-stone-200 hover:shadow-md'
                        }`}
                      >
                        {/* Checkbox */}
                        <div className="absolute top-2 left-2 z-10">
                          <input
                            type="checkbox"
                            checked={selectedIdsInTrash.includes(item.id)}
                            onChange={() => {
                              if (selectedIdsInTrash.includes(item.id)) {
                                setSelectedIdsInTrash(prev => prev.filter(id => id !== item.id));
                              } else {
                                setSelectedIdsInTrash(prev => [...prev, item.id]);
                              }
                            }}
                            className="w-5 h-5 accent-emerald-600 rounded cursor-pointer shadow-md"
                          />
                        </div>

                        {/* Expiry Badge */}
                        <div className="absolute top-2 right-2 z-10 bg-amber-500 text-white font-bold text-[10px] px-2 py-0.5 rounded-full shadow-md">
                          D-{item.daysLeft ?? 15}일 남음
                        </div>

                        {/* Image Preview */}
                        <div className="aspect-square bg-stone-100 relative overflow-hidden">
                          <img src={item.image_url} alt={item.title} className="w-full h-full object-cover opacity-90" />
                        </div>

                        {/* Card Meta Info */}
                        <div className="p-3 flex flex-col gap-1.5 flex-1 justify-between">
                          <div>
                            <span className="text-[10px] font-semibold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md inline-block">
                              {item.topic || '이미지'}
                            </span>
                            <h4 className="text-xs font-bold text-stone-800 line-clamp-1 mt-1">
                              {item.title || 'Untitled Graphic'}
                            </h4>
                          </div>

                          <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-stone-100">
                            <button
                              onClick={() => handleRestoreFromTrash([item.id])}
                              className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold text-xs py-1.5 rounded-xl transition-colors flex items-center justify-center gap-1"
                            >
                              <span>↺</span>
                              <span>복원</span>
                            </button>
                            <button
                              onClick={() => handlePermanentDelete([item.id])}
                              className="w-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs py-1.5 rounded-xl transition-colors flex items-center justify-center gap-1"
                            >
                              <span>❌</span>
                              <span>영구삭제</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 🌟 Sticker 20-Pack Bundle Detail View Modal (마스터 썸네일 클릭 시 20종 전용 뷰어) */}
        {isPackDetailModalOpen && selectedPackCover && (
          <div className="fixed inset-0 bg-black/70 z-[70] flex items-center justify-center p-1.5 sm:p-6 backdrop-blur-md">
            <div className="bg-white rounded-2xl sm:rounded-3xl max-w-6xl w-full max-h-[96vh] sm:max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-teal-200 animate-fadeIn">
              
              {/* Modal Header (Compact & sleek on mobile, docked cleanly at top) */}
              <div className="p-3 sm:p-5 bg-gradient-to-r from-teal-900 via-emerald-900 to-slate-900 text-white flex justify-between items-center shrink-0 shadow-sm z-20">
                <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
                  <div className="w-10 h-10 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-white/10 border border-white/20 overflow-hidden shrink-0 shadow-md">
                    <img 
                      src={selectedPackCover.image_url} 
                      alt={selectedPackCover.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap mb-0.5 sm:mb-1">
                      <span className="bg-amber-400 text-amber-950 text-[9px] sm:text-xs font-extrabold px-2 py-0.5 rounded-full shadow-xs uppercase tracking-wider">
                        🌟 마스터 썸네일 팩
                      </span>
                      <span className="bg-teal-500/30 text-teal-200 text-[9px] sm:text-xs font-semibold px-2 py-0.5 rounded-full border border-teal-400/30">
                        {selectedPackCover.sticker_sub ? selectedPackCover.sticker_sub.toUpperCase() : 'STICKER PACK'}
                      </span>
                    </div>
                    <h3 className="text-xs sm:text-xl font-bold text-white truncate">
                      {formatCoverTitleWithCount(selectedPackCover.title || selectedPackCover.topic || 'Etsy 스티커 마스터 팩', packStickers.length)}
                    </h3>
                    <p className="text-[10px] sm:text-xs text-teal-200 mt-0.5 font-medium flex items-center gap-1.5 sm:gap-2">
                      <span className="hidden xs:inline">📅 {new Date(selectedPackCover.created_at || Date.now()).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })}</span>
                      <span className="hidden xs:inline">•</span>
                      <span className="text-amber-300 font-bold">
                        총 {1 + packStickers.length}장 (표지 1 + 스티커 {packStickers.length}종)
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={async () => {
                      if (selectedPackCover) {
                        await handleOpenPackDetail(selectedPackCover, true);
                      }
                    }}
                    title="스티커 팩 목록 새로고침"
                    className="text-teal-200 hover:text-white text-xs bg-white/10 hover:bg-white/20 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer border border-white/10"
                  >
                    <span className="text-sm">🔄</span>
                    <span className="hidden sm:inline font-semibold">동기화</span>
                  </button>
                  <button
                    onClick={() => setIsPackDetailModalOpen(false)}
                    className="text-teal-200 hover:text-white text-2xl font-bold w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* UNIFIED SCROLL CONTAINER (모바일에서 상단 툴바와 스티커가 하나의 흐름으로 부드럽게 스크롤) */}
              <div id="pack-detail-scroll-container" className="overflow-y-auto flex-1 bg-stone-50 overscroll-contain [-webkit-overflow-scrolling:touch] custom-scrollbar scroll-smooth flex flex-col">
                {/* Missing Stickers Detection & 1-Click Recovery Banner */}
              {(() => {
                const packInfo = getPackPresetsInfo(selectedPackCover);
                const titleLower = (selectedPackCover.title || selectedPackCover.topic || '').toLowerCase();
                const promptLower = (selectedPackCover.prompt || '').toLowerCase();
                const is40 = packStickers.length > 20 || (!packInfo.isSingleSeries20Theme && (
                  titleLower.includes('40종') || titleLower.includes('40') || promptLower.includes('40+')
                ));

                let expectedStickers: StickerPreset[] = [];
                let missingPresets: StickerPreset[] = [];

                if (is40 && packInfo.vesselSeries && packInfo.standaloneSeries) {
                  const vesselPresets = packInfo.vesselSeries.slice(1);
                  const standalonePresets = packInfo.standaloneSeries.slice(1);
                  expectedStickers = [...vesselPresets, ...standalonePresets];

                  const coveredVesselSlots = new Set<number>();
                  const coveredStandaloneSlots = new Set<number>();

                  packStickers.forEach((s: any) => {
                    if (isStickerStandalone(s)) {
                      const slot = matchStickerToPresetSlot(s, packInfo.standaloneSeries!);
                      if (slot >= 0 && slot < standalonePresets.length) coveredStandaloneSlots.add(slot);
                    } else {
                      const slot = matchStickerToPresetSlot(s, packInfo.vesselSeries!);
                      if (slot >= 0 && slot < vesselPresets.length) coveredVesselSlots.add(slot);
                    }
                  });

                  const missingVessel = vesselPresets.filter((_, idx) => !coveredVesselSlots.has(idx));
                  const missingStandalone = standalonePresets.filter((_, idx) => !coveredStandaloneSlots.has(idx));
                  missingPresets = [...missingVessel, ...missingStandalone];
                } else {
                  const activeSeries = packInfo.isSingleSeries20Theme
                    ? packInfo.vesselSeries
                    : (isStickerStandalone(selectedPackCover) ? (packInfo.standaloneSeries || packInfo.vesselSeries) : (packInfo.vesselSeries || packInfo.standaloneSeries));
                  if (!activeSeries || activeSeries.length <= 1) return null;
                  expectedStickers = activeSeries.slice(1);

                  const coveredSlots = new Set<number>();
                  packStickers.forEach((s: any) => {
                    const slot = matchStickerToPresetSlot(s, activeSeries);
                    if (slot >= 0 && slot < expectedStickers.length) coveredSlots.add(slot);
                  });
                  missingPresets = expectedStickers.filter((_, idx) => !coveredSlots.has(idx));
                }

                if (missingPresets.length === 0) return null;

                return (
                  <div className="bg-amber-500/20 border-b-2 border-amber-400 p-3 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-950 shrink-0">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl shrink-0">⚠️</span>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs sm:text-sm font-extrabold text-amber-950">
                            스티커 {expectedStickers.length}종 중 {missingPresets.length}개가 누락되었습니다! (현재 {packStickers.length}종)
                          </span>
                          <span className="text-[10px] bg-amber-500 text-white font-black px-2 py-0.5 rounded-full">
                            표지 이미지({expectedStickers.length}+)와 일치 필요
                          </span>
                        </div>
                        <p className="text-[11px] text-amber-900 mt-0.5 font-medium">
                          누락된 항목: {missingPresets.map(p => p.name.replace(/\[.*?\]/g, '').trim()).slice(0, 3).join(', ')}{missingPresets.length > 3 ? ' 외' : ''}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleFillMissingPackStickers(missingPresets)}
                      disabled={isFillingMissing}
                      className="bg-amber-600 hover:bg-amber-700 disabled:bg-amber-800 text-white font-black text-xs sm:text-sm py-2 px-3.5 rounded-xl shadow-md transition-all flex items-center gap-1.5 shrink-0 border border-amber-500 cursor-pointer disabled:cursor-wait"
                    >
                      {isFillingMissing ? (
                        <>
                          <span className="animate-spin inline-block">⏳</span>
                          <span>누락 스티커 자동 보충 중...</span>
                        </>
                      ) : (
                        <>
                          <span>⚡</span>
                          <span>누락 스티커 {missingPresets.length}개 즉시 채우기 ({expectedStickers.length}종 완성)</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })()}

              {/* Action Toolbar */}
              <div className="p-3 sm:p-4 bg-teal-50/90 border-b border-teal-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-teal-900 bg-teal-100 border border-teal-300 px-3 py-1.5 rounded-xl">
                    📦 세트 구성: 표지 1장 + 하위 스티커 {packStickers.length}종
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">


                  {/* 1단계: 마스터 표지 다운로드 (Etsy 대표 사진 1번용) */}
                  <button
                    onClick={async () => {
                      try {
                        const coverTheme = getCleanEnglishThemeName(selectedPackCover.sticker_sub, selectedStickerSeriesTab, selectedPackCover.topic || selectedPackCover.title);
                        const img = new Image();
                        img.crossOrigin = 'anonymous';
                        await new Promise((resolve) => {
                          img.onload = resolve;
                          img.onerror = () => {
                            const fb = new Image();
                            fb.onload = resolve;
                            fb.onerror = resolve;
                            fb.src = selectedPackCover.image_url;
                          };
                          img.src = selectedPackCover.image_url;
                        });

                        const canvas = document.createElement('canvas');
                        const cw = Math.max(img.naturalWidth || 3000, 3000);
                        const ch = Math.max(img.naturalHeight || 3000, 3000);
                        canvas.width = cw;
                        canvas.height = ch;
                        const ctx = canvas.getContext('2d');
                        if (ctx) {
                          ctx.fillStyle = '#FFFFFF';
                          ctx.fillRect(0, 0, cw, ch);
                          ctx.drawImage(img, 0, 0, cw, ch);
                        }

                        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
                        const a = document.createElement('a');
                        a.href = dataUrl;
                        a.download = `00_Master_Cover_${coverTheme}_300DPI.jpg`;
                        document.body.appendChild(a);
                        a.click();
                        a.remove();
                      } catch (e) {
                        console.error('Error downloading cover:', e);
                        const a = document.createElement('a');
                        a.href = selectedPackCover.image_url;
                        const coverTheme = getCleanEnglishThemeName(selectedPackCover.sticker_sub, selectedStickerSeriesTab, selectedPackCover.topic || selectedPackCover.title);
                        a.download = `00_Master_Cover_${coverTheme}_300DPI.jpg`;
                        a.click();
                      }
                    }}
                    disabled={isExportingBundle}
                    className="bg-teal-700 hover:bg-teal-800 disabled:bg-gray-400 text-white font-extrabold text-xs sm:text-sm py-2 px-3 rounded-xl shadow-md transition-colors flex items-center gap-1.5 border border-teal-600 cursor-pointer disabled:cursor-not-allowed"
                    title="[1단계] Etsy 상품 등록 시 '1번 대표 사진'으로 올릴 고화질 마스터 표지를 다운로드합니다."
                  >
                    <span className="bg-teal-900/60 px-1.5 py-0.5 rounded text-[11px] font-black text-teal-200">1단계</span>
                    <span>🖼️</span>
                    <span>표지 다운로드</span>
                  </button>

                  {/* 2단계: 실물 시연 목업 3종 (Etsy 2~4번 사진 & Pinterest 핀용) */}
                  <button
                    onClick={() => handleOpenLifestyleMockups(packStickers)}
                    disabled={lifestyleLoading || isExportingBundle || packStickers.length === 0}
                    className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 disabled:bg-gray-400 text-white font-extrabold text-xs sm:text-sm py-2 px-3.5 rounded-xl shadow-md transition-all flex items-center gap-1.5 border border-violet-500 cursor-pointer disabled:cursor-not-allowed hover:shadow-indigo-300/50 hover:scale-[1.02]"
                    title="[2단계] Etsy 2~4번 보조 사진 및 Pinterest 핀으로 올릴 고화질(2048px) 실물 시연 목업 3종(다이어리/노트북/텀블러)을 자동 생성 및 다운로드합니다."
                  >
                    <span className="bg-violet-950/60 px-1.5 py-0.5 rounded text-[11px] font-black text-violet-200">2단계</span>
                    <span>📸</span>
                    <span>실물 시연 목업 3종</span>
                  </button>

                  {/* A4 인쇄용 시트 (Etsy 추가 사진 5번용 목업) */}
                  <button
                    onClick={() => handleGenerateAndOpenA4Sheet(packStickers, 'white')}
                    disabled={a4SheetLoading || isExportingBundle || packStickers.length === 0}
                    className="bg-slate-700 hover:bg-slate-800 disabled:bg-gray-400 text-white font-extrabold text-xs sm:text-sm py-2 px-3 rounded-xl shadow-md transition-colors flex items-center gap-1.5 border border-slate-600 cursor-pointer disabled:cursor-not-allowed"
                    title="Etsy 상품 등록 시 '추가 사진(5번)'으로 올려 구매자에게 A4 출력 구성을 보여주는 인쇄용 시트를 확인합니다."
                  >
                    <span className="bg-slate-900/60 px-1.5 py-0.5 rounded text-[11px] font-black text-slate-200">A4 시트</span>
                    <span>🖨️</span>
                    <span>인쇄용 시트</span>
                  </button>

                  {/* 3단계: 전체 ZIP 파일 일괄 다운로드 (Etsy 20MB 분할 vs CF 단일 통합) */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      onClick={() => downloadBatchSession([selectedPackCover, ...packStickers], `${selectedPackCover.topic || 'Sticker_Pack'}_Bundle`, { splitForEtsy: true })}
                      disabled={isExportingBundle || packStickers.length === 0}
                      className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800 disabled:opacity-90 text-white font-extrabold text-xs sm:text-sm py-2 px-3 rounded-xl shadow-md transition-all flex items-center gap-1.5 border border-emerald-500 cursor-pointer disabled:cursor-wait"
                      title="[Etsy 전용] Etsy 파일 20MB 제한을 통과하도록 20MB 이하 분할 ZIP으로 자동 다운로드합니다."
                    >
                      <span className="bg-emerald-900/60 px-1.5 py-0.5 rounded text-[11px] font-black text-emerald-200">
                        3단계
                      </span>
                      {isExportingBundle ? (
                        <span className="animate-spin inline-block">⏳</span>
                      ) : (
                        <span>📦</span>
                      )}
                      <span>
                        {isExportingBundle 
                          ? (exportBundleProgress ? exportBundleProgress.message : 'ZIP 압축 생성 중...') 
                          : (packStickers.length > 10 ? `Etsy 분할 다운 (${packStickers.length}종)` : `전체 ZIP 다운 (${packStickers.length}종)`)}
                      </span>
                    </button>
                  </div>

                  {/* Pinterest 핀 등록 키트 바로가기 버튼 */}
                  <button
                    onClick={() => {
                      setIsPinterestHubExpanded(true);
                      setTimeout(() => {
                        const el = document.getElementById('pinterest-marketing-hub');
                        if (el) {
                          el.scrollIntoView({ behavior: 'smooth' });
                        } else {
                          window.open('https://www.pinterest.com/pin-creation-tool/', '_blank');
                        }
                      }, 50);
                    }}
                    className="bg-[#E60023] hover:bg-[#ad081b] active:scale-95 text-white font-extrabold text-xs sm:text-sm py-2 px-3.5 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer hover:shadow-red-200"
                    title="Pinterest 비즈니스 핀 등록 키트를 펼치고 바로 이동합니다"
                  >
                    <span>📌</span>
                    <span>Pinterest 핀 등록</span>
                  </button>

                  {/* 모바일 최적화: 개별 스티커 세부 목록 바로가기 퀵점프 버튼 */}
                  <button
                    onClick={() => {
                      const el = document.getElementById('pack-stickers-grid-section');
                      if (el) {
                        el.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className="bg-teal-700 hover:bg-teal-800 active:scale-95 text-white font-extrabold text-xs sm:text-sm py-2 px-3.5 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer border border-teal-600"
                    title="개별 스티커 세부 목록으로 바로 스크롤 이동합니다"
                  >
                    <span>🎨</span>
                    <span>스티커 목록 ({packStickers.length}종)</span>
                  </button>

                  {/* 부가 도구: 표지 AI 재생성, 표지 편집 및 삭제 */}
                  <button
                    onClick={() => handleRegenerateMasterCover(selectedPackCover, packStickers.length)}
                    disabled={isRegeneratingCover || isExportingBundle}
                    className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-bold text-xs sm:text-sm py-2 px-3 rounded-xl shadow-xs transition-colors flex items-center gap-1 cursor-pointer disabled:cursor-wait"
                    title="현재 스티커 개수 및 최신 스타일에 맞춰 마스터 표지를 AI로 다시 생성합니다."
                  >
                    {isRegeneratingCover ? (
                      <>
                        <span className="animate-spin inline-block">⏳</span>
                        <span>표지 AI 재생성 중...</span>
                      </>
                    ) : (
                      <>
                        <span>✨</span>
                        <span>표지 AI 재생성</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setSelectedDesign(selectedPackCover);
                      if (selectedPackCover.recommended_mockup) {
                        setSelectedMockupId(selectedPackCover.recommended_mockup);
                      }
                    }}
                    disabled={isExportingBundle}
                    className="bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 text-white font-bold text-xs sm:text-sm py-2 px-3 rounded-xl shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                    title="마스터 표지를 상세보기 모달에서 지우개/텍스트/AI수정합니다"
                  >
                    <span>🛠️</span>
                    <span>표지 편집</span>
                  </button>

                  <button
                    onClick={async () => {
                      const allIds = [selectedPackCover.id, ...packStickers.map(s => s.id)];
                      if (confirm(`이 마스터 팩 및 포함된 스티커 전체 (총 ${allIds.length}개 항목)를 삭제함으로 이동하시겠습니까?`)) {
                        await handleMoveToTrash(allIds);
                        setIsPackDetailModalOpen(false);
                      }
                    }}
                    disabled={isExportingBundle}
                    className="bg-rose-600 hover:bg-rose-700 disabled:bg-gray-400 text-white font-bold text-xs sm:text-sm py-2 px-3 rounded-xl shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>🗑️</span>
                    <span>팩 삭제</span>
                  </button>
                </div>

                {/* 3단계 진행 상황 실시간 배너 */}
                {isExportingBundle && (
                  <div className="w-full mt-3 bg-emerald-900 text-white border-2 border-emerald-400 rounded-xl p-3.5 shadow-lg">
                    <div className="flex items-center justify-between text-xs sm:text-sm font-bold mb-2">
                      <span className="flex items-center gap-2 text-emerald-200">
                        <span className="animate-spin inline-block text-base">⏳</span>
                        <span>{exportBundleProgress?.message || '고화질 300DPI ZIP 압축팩 생성 중...'}</span>
                      </span>
                      <span className="text-emerald-300 font-mono font-black text-sm">
                        {exportBundleProgress ? Math.round((exportBundleProgress.current / Math.max(1, exportBundleProgress.total)) * 100) : 0}%
                      </span>
                    </div>
                    <div className="w-full bg-emerald-950/80 rounded-full h-3 overflow-hidden border border-emerald-700">
                      <div 
                        className="bg-gradient-to-r from-emerald-400 to-teal-300 h-3 rounded-full transition-all duration-200"
                        style={{ width: `${exportBundleProgress ? Math.round((exportBundleProgress.current / Math.max(1, exportBundleProgress.total)) * 100) : 5}%` }}
                      ></div>
                    </div>
                    <p className="text-[11px] text-emerald-300 mt-1.5 flex items-center gap-1">
                      <span>💡</span>
                      <span>개별 스티커의 투명 배경(PNG) 변환 및 A4 인쇄용 시트 2장을 정밀 생성 후 자동으로 ZIP 다운로드가 시작됩니다. 잠시만 기다려 주세요!</span>
                    </p>
                  </div>
                )}

                {/* 하단 친절한 Etsy 등록 4단계 안내 가이드 배너 */}
                <div className="mt-3 bg-gradient-to-r from-amber-50 via-violet-50 to-emerald-50 border border-indigo-200 text-stone-800 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-2xs">
                  <div className="flex items-start sm:items-center gap-2 text-xs font-semibold leading-relaxed flex-wrap">
                    <span className="text-base shrink-0">💡</span>
                    <span>
                      <strong className="text-amber-950 font-black">Etsy 상품 등록 필수 순서:</strong>{' '}
                      <span className="inline-block bg-teal-100 text-teal-900 px-1.5 py-0.5 rounded font-black mr-1">1단계</span> <strong>마스터 표지</strong>(1번 대표 사진) ➔{' '}
                      <span className="inline-block bg-violet-100 text-violet-900 px-1.5 py-0.5 rounded font-black mr-1">2단계</span> <strong>실물 시연 목업 3종</strong>(2~4번 연출 사진 & Pinterest 핀) ➔{' '}
                      <span className="inline-block bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded font-black mr-1">A4 시트</span> <strong>인쇄용 시트</strong>(5번 사진) ➔{' '}
                      <span className="inline-block bg-emerald-100 text-emerald-950 px-1.5 py-0.5 rounded font-black mr-1">3단계</span> <strong>전체 ZIP</strong>을 <strong>Digital files</strong>에 업로드!
                    </span>
                  </div>
                </div>
              </div>

              {/* Grid Content Section */}
              <div className="p-3 sm:p-6 flex-1 bg-stone-50 relative">
                {/* 📝 Etsy 상품 등록용 영문 정보 (SEO Title, Description, Tags) 카드 */}
                {(() => {
                  const packSeo = generateEtsySeo(selectedPackCover, packStickers.length);
                  return (
                    <>
                      {/* 📌 Pinterest 비즈니스 핀 등록 마케팅 바 */}
                      <div id="pinterest-marketing-hub" className="mb-4 bg-gradient-to-r from-rose-50 via-red-50 to-pink-50 border-2 border-red-200 rounded-2xl p-3.5 sm:p-4 shadow-sm transition-all">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div 
                            className="flex items-center gap-2.5 cursor-pointer select-none flex-1"
                            onClick={() => setIsPinterestHubExpanded(!isPinterestHubExpanded)}
                          >
                            <div className="w-10 h-10 rounded-xl bg-[#E60023] text-white flex items-center justify-center font-black text-xl shadow-sm shrink-0">
                              P
                            </div>
                            <div>
                              <h4 className="text-sm font-black text-red-950 flex items-center gap-2 flex-wrap">
                                <span>Pinterest 비즈니스 핀 등록 허브</span>
                                <span className="text-[10px] bg-red-600 text-white font-extrabold px-2 py-0.5 rounded-full shadow-2xs">
                                  Etsy 외부 유입 극대화
                                </span>
                              </h4>
                              <p className="text-[11px] text-red-800 mt-0.5">
                                미국 바이어 70%가 사용하는 핀터레스트에 공식 비즈니스 핀(제목 볼드 + 본문 + Etsy 링크 직결)을 등록하세요.
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
                            <a
                              href="https://www.pinterest.com/pin-creation-tool/"
                              target="_blank"
                              rel="noreferrer"
                              className="bg-[#E60023] hover:bg-[#ad081b] active:scale-95 text-white font-black text-xs py-2 px-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:shadow-red-200 shrink-0"
                              title="Pinterest의 공식 핀 생성 페이지(핀 빌더)를 새 창으로 엽니다"
                            >
                              <span>🚀</span>
                              <span>핀 만들기 열기</span>
                            </a>
                            <button
                              type="button"
                              onClick={() => setIsPinterestHubExpanded(!isPinterestHubExpanded)}
                              className="text-xs text-red-800 hover:text-red-950 font-bold px-3 py-2 rounded-xl border border-red-200 bg-white transition-colors cursor-pointer shadow-2xs shrink-0"
                            >
                              {isPinterestHubExpanded ? '접기 ▲' : '도구 펼치기 ▼'}
                            </button>
                          </div>
                        </div>

                        {isPinterestHubExpanded && (
                          <div className="mt-3 space-y-3 pt-2 border-t border-red-200/70">
                            {/* Etsy Link Input Bar */}
                            <div className="bg-white/95 rounded-xl p-3 border border-red-200 flex flex-col gap-2 text-xs shadow-2xs">
                              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                <div className="flex items-center gap-1.5 shrink-0 text-red-900 font-bold">
                                  <span>🔗 핀 연결 링크:</span>
                                </div>
                                <input
                                  type="url"
                                  value={currentListingUrl}
                                  onChange={(e) => handleUpdateEtsyListingUrl(e.target.value)}
                                  placeholder="https://www.etsy.com/shop/LittlePawsStudioShop"
                                  className="flex-1 bg-red-50/40 border border-red-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-800 focus:outline-hidden focus:ring-1 focus:ring-red-400 placeholder-gray-400 font-mono"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const linkToCopy = (currentListingUrl || etsyShopUrl || 'https://www.etsy.com/shop/LittlePawsStudioShop').trim();
                                    handleCopy(linkToCopy);
                                    setCopiedLinkNotice(true);
                                    setTimeout(() => setCopiedLinkNotice(false), 2000);
                                  }}
                                  className="bg-red-100 hover:bg-red-200 text-red-800 font-bold px-3 py-1.5 rounded-lg transition-colors shrink-0 flex items-center justify-center gap-1 cursor-pointer"
                                  title="Etsy 상품/상점 링크를 클립보드에 복사합니다"
                                >
                                  <span>{copiedLinkNotice ? '✓ 링크 복사됨!' : '🔗 링크 복사'}</span>
                                </button>
                              </div>

                              {/* 링크 상태 가이드 안내 */}
                              <div className="text-[11px] pt-1 border-t border-red-100">
                                {currentListingUrl && currentListingUrl.includes('/listing/') ? (
                                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                                    <span>✅ 개별 상품 상세 직결 링크 등록됨</span>
                                    <span className="font-normal text-emerald-600">(바이어가 핀 클릭 시 이 상품 상세 페이지로 즉시 구매 가능!)</span>
                                  </span>
                                ) : (
                                  <span className="text-gray-600 flex items-center gap-1">
                                    <span>💡 기본 대표 샵 링크(LittlePawsStudioShop)가 복사됩니다. 특정 상품 개별 URL을 연결하고 싶으실 때만 위 칸에 입력해주세요.</span>
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* 🏆 Mode A: 정품 비즈니스 핀 원클릭 복사 키트 (15초 완성, 권장) */}
                            <div className="bg-white rounded-xl p-3 border border-red-200 shadow-2xs space-y-2.5">
                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                <span className="text-xs font-black text-red-950 flex items-center gap-1.5">
                                  <span className="bg-red-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded">강력 추천</span>
                                  <span>🏆 정식 비즈니스 핀 복사 키트 (15초 완성 - 타이핑 0번)</span>
                                </span>
                                <span className="text-[11px] text-gray-500 font-medium">
                                  비바리움처럼 제목 볼드 & Etsy 직결 링크 완벽 지원
                                </span>
                              </div>

                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-0.5">
                                {/* 1. 이미지 다운로드 */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const coverUrl = selectedPackCover?.image_url;
                                    if (!coverUrl) return;
                                    const cleanTheme = (selectedPackCover.topic || selectedPackCover.title || 'Stickers').replace(/[^a-zA-Z0-9_-]/g, '_');
                                    const a = document.createElement('a');
                                    a.href = coverUrl;
                                    a.download = `00_Pinterest_Cover_${cleanTheme}.jpg`;
                                    document.body.appendChild(a);
                                    a.click();
                                    a.remove();
                                    setCopiedImageNotice(true);
                                    setTimeout(() => setCopiedImageNotice(false), 2000);
                                  }}
                                  className="bg-stone-900 hover:bg-black text-white text-xs font-bold py-2 px-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                                  title="핀터레스트 업로드용 표지 사진을 즉시 다운로드합니다. (핀 만들기 화면에 드래그&드롭)"
                                >
                                  <span>📥</span>
                                  <span>{copiedImageNotice ? '✓ 다운로드됨!' : '1. 사진 다운로드'}</span>
                                </button>

                                {/* 2. 제목 복사 */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleCopy(packSeo.title);
                                    setCopiedTitleNotice(true);
                                    setTimeout(() => setCopiedTitleNotice(false), 2000);
                                  }}
                                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 px-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                                  title="영문 최적화 제목을 복사합니다. 핀 만들기 화면의 제목 칸에 Ctrl+V 하세요."
                                >
                                  <span>📋</span>
                                  <span>{copiedTitleNotice ? '✓ 복사완료!' : '2. 제목 복사'}</span>
                                </button>

                                {/* 3. 설명 복사 */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const hashTags = (packSeo.tags || []).map(t => '#' + t.replace(/[^a-zA-Z0-9]/g, '')).filter(t => t.length > 2).slice(0, 8).join(' ');
                                    const text = `${packSeo.title}\n\n✨ ${packStickers.length || 40} Cute Die-Cut Digital Stickers Bundle for Digital Planners, Journals & Craft Cutters.\n👉 Shop on Etsy: ${currentListingUrl || etsyShopUrl || 'https://www.etsy.com/shop/LittlePawsStudioShop'}\n\n${hashTags} #stickers #digitalstickers #digitalplanner #planneraddict #etsyseller`;
                                    handleCopy(text);
                                    setCopiedPinterestDescNotice(true);
                                    setTimeout(() => setCopiedPinterestDescNotice(false), 2000);
                                  }}
                                  className="bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold py-2 px-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                                  title="상세설명과 해시태그를 복사합니다. 핀 만들기 화면의 설명 칸에 Ctrl+V 하세요."
                                >
                                  <span>📝</span>
                                  <span>{copiedPinterestDescNotice ? '✓ 복사완료!' : '3. 설명 복사'}</span>
                                </button>

                                {/* 4. 링크 복사 */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const linkToCopy = (currentListingUrl || etsyShopUrl || 'https://www.etsy.com/shop/LittlePawsStudioShop').trim();
                                    handleCopy(linkToCopy);
                                    setCopiedLinkNotice(true);
                                    setTimeout(() => setCopiedLinkNotice(false), 2000);
                                  }}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 px-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                                  title="Etsy 상점/상품 링크를 복사합니다. 핀 만들기 화면의 링크 칸에 Ctrl+V 하세요."
                                >
                                  <span>🔗</span>
                                  <span>{copiedLinkNotice ? '✓ 복사완료!' : '4. 링크 복사'}</span>
                                </button>
                              </div>

                              {/* 친절한 3단계 가이드 박스 */}
                              <div className="bg-stone-50 rounded-xl p-2.5 border border-gray-200 text-xs space-y-1">
                                <div className="font-extrabold text-stone-900 flex items-center gap-1.5 text-[11px]">
                                  <span>📌</span>
                                  <span>정품 비즈니스 핀 등록 3단계 (좌측 비바리움과 100% 동일):</span>
                                </div>
                                <div className="text-[11px] text-stone-600 space-y-0.5 leading-relaxed pl-1">
                                  <p>
                                    <strong>①</strong> <strong>[1. 사진 다운로드]</strong> 클릭 ➔ 상단 <strong>[🚀 핀 만들기 열기]</strong> 클릭
                                  </p>
                                  <p>
                                    <strong>②</strong> 핀터레스트 왼쪽 큰 점선 네모 박스에 <strong>방금 다운로드된 사진 끌어다 놓기(드래그)</strong>
                                  </p>
                                  <p>
                                    <strong>③</strong> <strong>[2. 제목]</strong>, <strong>[3. 설명]</strong>, <strong>[4. 링크]</strong> 순서대로 클릭하여 우측 칸들에 <strong>Ctrl+V</strong> 붙여넣기 ➔ <strong>[게시]</strong> 끝!
                                  </p>
                                </div>
                              </div>

                              <div className="text-[11px] text-gray-500 pt-1 border-t border-gray-100 flex items-center justify-between">
                                <span>💡 순서: <strong>[🚀 핀 만들기 열기]</strong> 클릭 ➔ 핀터레스트 화면에서 <strong>1~4번 각각 Ctrl+V</strong> 붙여넣기 ➔ 15초 끝!</span>
                                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">✓ 공식 비즈니스 핀 규격</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="mb-5 bg-gradient-to-r from-blue-50/90 via-indigo-50/80 to-teal-50/90 border-2 border-indigo-200 rounded-2xl p-3.5 sm:p-4 shadow-sm transition-all">
                      <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                        <div 
                          className="flex items-center gap-2 cursor-pointer select-none flex-1"
                          onClick={() => setIsPackSeoExpanded(!isPackSeoExpanded)}
                        >
                          <span className="text-xl shrink-0">📝</span>
                          <div>
                            <h4 className="text-sm font-black text-indigo-950 flex items-center gap-2">
                              <span>Etsy 상품 등록용 영문 정보 (Listing Title & Description)</span>
                              <span className="text-[10px] bg-indigo-600 text-white font-extrabold px-2 py-0.5 rounded-full shadow-2xs">
                                Etsy 140자 최적화
                              </span>
                            </h4>
                            <p className="text-[11px] text-indigo-800 mt-0.5">
                              Etsy에 상품 등록 시 복사하여 붙여넣을 수 있는 영문 제목, 13태그, 상세설명 전문입니다.
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setIsPackSeoExpanded(!isPackSeoExpanded)}
                            className="text-xs text-indigo-700 hover:text-indigo-900 font-bold px-3 py-1.5 rounded-xl border border-indigo-200 bg-white transition-colors cursor-pointer shadow-2xs"
                          >
                            {isPackSeoExpanded ? '접기 ▲' : '상세정보 펼치기 ▼'}
                          </button>
                        </div>
                      </div>

                      {isPackSeoExpanded && (
                        <div className="space-y-3 pt-1">
                          {/* 1. Etsy English Title */}
                          <div className="bg-white rounded-xl border border-indigo-100 p-3 shadow-2xs">
                            <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-xs font-black text-indigo-950">① Etsy Listing Title (영문 제목)</span>
                                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full border border-emerald-300">
                                  ✓ {packSeo.wordCount}단어 (14단어 이하 준수)
                                </span>
                                <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-full">
                                  {packSeo.charCount}/140자
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  handleCopy(packSeo.title);
                                  setCopiedPackTitleNotice(true);
                                  setTimeout(() => setCopiedPackTitleNotice(false), 2000);
                                }}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                              >
                                <span>{copiedPackTitleNotice ? '✓ 복사완료!' : '📋 영문 제목 복사'}</span>
                              </button>
                            </div>
                            <p className="text-xs sm:text-sm text-gray-800 font-medium bg-indigo-50/40 p-2.5 rounded-lg border border-indigo-100/60 select-all">
                              {packSeo.title}
                            </p>
                          </div>

                          {/* 2. Etsy 13 Tags */}
                          <div className="bg-white rounded-xl border border-indigo-100 p-3 shadow-2xs">
                            <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                              <span className="text-xs font-black text-indigo-950">② Etsy 13 SEO Tags (영문 태그 13개)</span>
                              <button
                                type="button"
                                onClick={() => {
                                  handleCopy(packSeo.tags.join(', '));
                                  setCopiedPackTagsNotice(true);
                                  setTimeout(() => setCopiedPackTagsNotice(false), 2000);
                                }}
                                className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-3 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                              >
                                <span>{copiedPackTagsNotice ? '✓ 복사완료!' : '📋 13태그 복사'}</span>
                              </button>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {packSeo.tags.map((tag, idx) => (
                                <span key={idx} className="text-xs bg-teal-50 text-teal-800 px-2.5 py-1 rounded-lg border border-teal-200/80 font-medium">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* 3. Etsy Listing Description */}
                          <div className="bg-white rounded-xl border border-indigo-100 p-3 shadow-2xs">
                            <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                              <span className="text-xs font-black text-indigo-950">③ Etsy Listing Description (영문 상세설명 전문)</span>
                              <button
                                type="button"
                                onClick={() => {
                                  handleCopy(packSeo.description);
                                  setCopiedPackDescNotice(true);
                                  setTimeout(() => setCopiedPackDescNotice(false), 2000);
                                }}
                                className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-3 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                              >
                                <span>{copiedPackDescNotice ? '✓ 복사완료!' : '📋 영문 상세설명 복사'}</span>
                              </button>
                            </div>
                            <div className="max-h-48 overflow-y-auto bg-amber-50/30 p-2.5 rounded-lg border border-amber-200/60 text-xs text-gray-700 font-mono leading-relaxed whitespace-pre-wrap custom-scrollbar select-all">
                              {packSeo.description}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    </>
                  );
                })()}

                {loadingPackStickers ? (
                  <div className="py-24 text-center text-teal-800 font-medium space-y-3">
                    <div className="w-10 h-10 border-4 border-teal-300 border-t-teal-700 rounded-full animate-spin mx-auto"></div>
                    <p className="text-sm">팩에 포함된 스티커 목록을 불러오는 중입니다...</p>
                  </div>
                ) : packStickers.length === 0 ? (
                  <div className="py-20 text-center text-gray-500 font-medium space-y-2">
                    <div className="text-4xl mb-2">🖼️</div>
                    <p className="text-base text-gray-700 font-bold">하위 스티커 항목을 찾을 수 없습니다.</p>
                    <p className="text-xs text-gray-500">마스터 썸네일 단독 항목이거나 스티커 작성을 완료해 주세요.</p>
                  </div>
                ) : (
                  <div id="pack-stickers-grid-section" className="scroll-mt-4 pt-1">
                    <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                      <h4 className="text-xs sm:text-sm font-extrabold text-teal-950 uppercase tracking-wider flex items-center gap-1.5">
                        <span>🎨</span>
                        <span>개별 스티커 세부 목록 ({packStickers.length}종)</span>
                      </h4>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-teal-700 font-medium hidden sm:inline">개별 항목 클릭 시 수정/목업</span>
                        <button
                          type="button"
                          onClick={() => {
                            const container = document.getElementById('pack-detail-scroll-container');
                            if (container) container.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="text-[11px] bg-teal-100 hover:bg-teal-200 text-teal-900 font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                        >
                          <span>↑</span>
                          <span>상단 툴바로</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-4">
                      {packStickers.map((sticker, idx) => (
                        <div
                          key={sticker.id || idx}
                          className="bg-white rounded-2xl border border-teal-100 hover:border-teal-400 overflow-hidden shadow-xs hover:shadow-md transition-all group relative flex flex-col justify-between"
                        >
                          {/* Sticker Number Badge */}
                          <span className="absolute top-2 left-2 z-10 bg-teal-800 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-sm">
                            #{String(idx + 1).padStart(2, '0')}
                          </span>

                          {/* Image Preview */}
                          <div 
                            className="aspect-square bg-gray-100 relative overflow-hidden cursor-pointer"
                            onClick={() => {
                              setSelectedDesign(sticker);
                              if (sticker.recommended_mockup) {
                                setSelectedMockupId(sticker.recommended_mockup);
                              }
                            }}
                          >
                            <img
                              src={sticker.image_url}
                              alt={sticker.title || `Sticker #${idx + 1}`}
                              loading="lazy"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="bg-white/90 text-teal-900 text-xs font-bold px-3 py-1.5 rounded-xl shadow-md">
                                🔍 상세보기 / 편집
                              </span>
                            </div>
                          </div>

                          {/* Title & Actions */}
                          <div className="p-2 sm:p-2.5 flex flex-col justify-between flex-1 gap-2">
                            <div>
                              <h5 className="text-xs font-bold text-gray-800 line-clamp-1">
                                {sticker.title || sticker.topic || `Sticker #${idx + 1}`}
                              </h5>
                              <p className="text-[10px] text-gray-400 line-clamp-1 mt-0.5">
                                {sticker.prompt}
                              </p>
                            </div>

                            <div className="pt-1.5 border-t border-gray-100 space-y-1.5">
                              <div className="grid grid-cols-2 gap-1.5">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleGenerateStandaloneFromTank(sticker);
                                  }}
                                  className="w-full bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 font-bold text-[10px] py-1.5 rounded-lg transition-colors flex items-center justify-center gap-0.5 active:scale-95 cursor-pointer"
                                  title="이 어항 이미지에서 주요 대상만 AI 비전으로 1:1 맞춤 낱개 스티커 추출 생성"
                                >
                                  <span>✨</span>
                                  <span>낱개 추출</span>
                                </button>

                                <button
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    try {
                                      const transparentDataUrl = await processTransparentPNG(sticker.image_url, { targetWidth: 3000, targetHeight: 3000 });
                                      const a = document.createElement('a');
                                      a.href = transparentDataUrl;
                                       const stickerTheme = getCleanEnglishThemeName(sticker.sticker_sub, selectedStickerSeriesTab, sticker.topic || sticker.title);
                                       a.download = `${String(idx + 1).padStart(2, '0')}_${stickerTheme}_Sticker_300DPI.png`;
                                       a.click();
                                     } catch (err) {
                                       const a = document.createElement('a');
                                       a.href = sticker.image_url;
                                       const stickerTheme = getCleanEnglishThemeName(sticker.sticker_sub, selectedStickerSeriesTab, sticker.topic || sticker.title);
                                       a.download = `${String(idx + 1).padStart(2, '0')}_${stickerTheme}_Sticker.jpg`;
                                       a.click();
                                    }
                                  }}
                                  className="w-full bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 font-bold text-[10px] py-1.5 rounded-lg transition-colors flex items-center justify-center gap-0.5 active:scale-95 cursor-pointer"
                                  title="300DPI 고화질 PNG 다운로드"
                                >
                                  <span>📥</span>
                                  <span>PNG</span>
                                </button>
                              </div>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMoveToTrash([sticker.id]);
                                  setPackStickers(prev => prev.filter(s => s.id !== sticker.id));
                                }}
                                className="w-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-[11px] py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1 active:scale-95 cursor-pointer"
                                title="삭제함으로 이동"
                              >
                                <span>🗑️</span>
                                <span>삭제</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 모바일/PC 스크롤 편의 플로팅 퀵 버튼 (스티커가 4개 이상일 때) */}
                {packStickers.length > 4 && (
                  <div className="sticky bottom-3 right-3 ml-auto w-fit z-20 flex items-center gap-1.5 bg-white/95 backdrop-blur-md p-1.5 rounded-2xl shadow-lg border border-teal-200 mt-4">
                    <button
                      type="button"
                      onClick={() => {
                        const container = document.getElementById('pack-detail-scroll-container');
                        if (container) container.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="bg-stone-800 hover:bg-black text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                      title="모달 맨 위 툴바로 스크롤"
                    >
                      <span>↑</span>
                      <span>맨위로</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const el = document.getElementById('pack-stickers-grid-section');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                      title="스티커 세부 목록 시작 위치로 스크롤"
                    >
                      <span>🎨</span>
                      <span>스티커 목록</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

        {/* 🖨️ A4 Printable Sticker Sheet Modal */}
        {isA4SheetModalOpen && (
          <div className="fixed inset-0 bg-black/75 z-[80] flex items-center justify-center p-3 sm:p-6 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-indigo-100">
              {/* Modal Header */}
              <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-xl shadow-md shrink-0">
                    🖨️
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-extrabold text-gray-900 flex items-center gap-2">
                      <span>A4 규격 인쇄용 스티커 시트 (Printable Sheet)</span>
                      <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-full font-bold">300 DPI</span>
                    </h3>
                    <p className="text-xs text-gray-600 mt-0.5">
                      A4 규격 (2480 × 3508 px)에 20종 스티커를 4×5 그리드로 완벽 정렬 배치한 인쇄 전용 시트입니다.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsA4SheetModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/80 hover:bg-white text-gray-500 hover:text-gray-900 flex items-center justify-center text-lg font-bold shadow-xs transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Etsy Photo Tip Banner */}
              <div className="bg-amber-50 px-4 py-2 border-b border-amber-200 text-xs text-amber-900 flex items-center gap-2">
                <span className="text-base shrink-0">💡</span>
                <span><strong>Etsy 상품 사진(Photos) 업로드 팁:</strong> Etsy 뷰어는 투명 PNG를 검은색 배경으로 자동 처리하므로, <strong>상품 사진 등록용으로는 반드시 '화이트 배경' 시트</strong>를 다운받아 등록하세요!</span>
              </div>

              {/* Controls Bar */}
              <div className="px-4 sm:px-6 py-3 bg-stone-50 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3">
                {/* Sheet Purpose Info */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-black text-indigo-950 bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-xl shadow-2xs">
                    ⬜ Etsy 상품 사진(2~3번) 등록 전용 화이트 시트 (300 DPI)
                  </span>
                  <span className="text-[11px] text-gray-500 font-medium">
                    (※ 크리컷/실루엣 커팅기용 투명 A4 시트는 3단계 전체 ZIP에 자동 포함되어 있습니다)
                  </span>
                </div>

                {/* Download Buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => handleDownloadA4Sheet(currentA4PageIndex)}
                    disabled={a4SheetLoading || a4SheetPages.length === 0}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white font-bold text-xs sm:text-sm py-2 px-3.5 rounded-xl shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>💾</span>
                    <span>{a4SheetPages.length > 1 ? `현재 Sheet ${currentA4PageIndex + 1} PNG 다운로드` : 'A4 고화질 시트 PNG 다운로드'}</span>
                  </button>

                  {a4SheetPages.length > 1 && (
                    <button
                      onClick={handleDownloadAllA4Sheets}
                      disabled={a4SheetLoading || a4SheetPages.length === 0}
                      className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white font-bold text-xs sm:text-sm py-2 px-3.5 rounded-xl shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
                      title="생성된 2장의 A4 시트를 모두 다운로드합니다"
                    >
                      <span>📦</span>
                      <span>전체 {a4SheetPages.length}장 모두 다운로드</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Multi-Page Tabs Bar (When 40 items = 2 Sheets) */}
              {a4SheetPages.length > 1 && (
                <div className="px-4 sm:px-6 py-2 bg-indigo-50/70 border-b border-indigo-100 flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-indigo-950 flex items-center gap-1">
                      <span>📑</span>
                      <span>시트 선택:</span>
                    </span>
                    <div className="flex gap-1.5">
                      {a4SheetPages.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentA4PageIndex(idx)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                            currentA4PageIndex === idx
                              ? 'bg-indigo-600 text-white shadow-xs ring-2 ring-indigo-300'
                              : 'bg-white text-indigo-900 hover:bg-indigo-100 border border-indigo-200'
                          }`}
                        >
                          <span>{idx === 0 ? '🎨' : '✨'}</span>
                          <span>
                            {idx === 0 ? 'Sheet 1: 메인 테마 세트 20종' : (idx === 1 ? 'Sheet 2: 단독 낱개 오브젝트 20종' : `Sheet ${idx + 1}`)}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <span className="text-[11px] font-semibold text-indigo-700 bg-white px-2.5 py-1 rounded-lg border border-indigo-200">
                    💡 40종 패키지: 메인 세트와 단독 오브젝트 각 20개씩 완벽한 황금 비율 크기로 분할 인쇄
                  </span>
                </div>
              )}

              {/* Preview Body */}
              <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-neutral-900/5 flex items-center justify-center min-h-[350px]">
                {a4SheetLoading ? (
                  <div className="text-center py-12 space-y-4 max-w-sm w-full">
                    <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">{a4SheetProgress.label}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        고화질 300 DPI 캔버스에 스티커들을 오차 없이 정렬 합성하고 있습니다.
                      </p>
                    </div>
                    {a4SheetProgress.total > 0 && (
                      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                          style={{ width: `${Math.round((a4SheetProgress.current / a4SheetProgress.total) * 100)}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                ) : a4SheetPages.length > 0 && a4SheetPages[currentA4PageIndex] ? (
                  <div className="max-w-md w-full shadow-2xl rounded-2xl overflow-hidden border border-gray-300 transition-all relative">
                    {/* Floating Page Badge */}
                    <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md z-10 flex items-center gap-1.5">
                      <span>📄</span>
                      <span>
                        {a4SheetPages.length > 1
                          ? (currentA4PageIndex === 0 ? 'Sheet 1: 메인 테마 세트 (20종)' : 'Sheet 2: 단독 낱개 오브젝트 (20종)')
                          : 'A4 인쇄용 시트 (20종)'}
                      </span>
                    </div>

                    <div
                      className={`w-full p-2 flex items-center justify-center ${
                        a4SheetBg === 'transparent'
                          ? 'bg-[linear-gradient(45deg,#f0f0f0_25%,transparent_25%),linear-gradient(-45deg,#f0f0f0_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f0f0f0_75%),linear-gradient(-45deg,transparent_75%,#f0f0f0_75%)] bg-[size:16px_16px] bg-[position:0_0,0_8px,8px_-8px,-8px_0px] bg-white'
                          : 'bg-white'
                      }`}
                    >
                      <img
                        src={a4SheetPages[currentA4PageIndex]}
                        alt={`A4 Printable Sticker Sheet Preview Page ${currentA4PageIndex + 1}`}
                        className="w-full h-auto object-contain rounded shadow-xs max-h-[62vh]"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-400 py-12">
                    <p className="text-sm font-medium">생성된 시트가 없습니다.</p>
                  </div>
                )}
              </div>

              {/* Modal Footer Note */}
              <div className="px-5 py-3 bg-stone-100 border-t border-gray-200 text-xs text-gray-600 flex flex-wrap items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 font-medium">
                  <span>💡</span>
                  <span>Etsy 고객은 이 파일을 A4 스티커 라벨지에 바로 인쇄하거나, 크리컷(Cricut)에서 자동 칼선 컷팅하여 사용할 수 있습니다.</span>
                </span>
                <button
                  onClick={() => setIsA4SheetModalOpen(false)}
                  className="text-xs text-gray-600 hover:text-gray-900 font-bold px-3 py-1 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 📸 Lifestyle Mockups (Etsy Photos 2~4 & Pinterest Pins) Modal */}
        {isLifestyleModalOpen && (
          <div className="fixed inset-0 bg-black/80 z-[80] flex items-center justify-center p-2 sm:p-4 md:p-6 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-6xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-violet-100">
              {/* Modal Header */}
              <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-violet-50 via-indigo-50 to-pink-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white flex items-center justify-center text-xl shadow-md shrink-0">
                    📸
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-extrabold text-gray-900 flex items-center gap-2 flex-wrap">
                      <span>실제 활용 시연 라이프스타일 목업 3종</span>
                      <span className="text-[10px] bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-2 py-0.5 rounded-full font-bold">2048 × 2048 px 초고화질</span>
                    </h3>
                    <p className="text-xs text-gray-600 mt-0.5">
                      다이어리, 맥북 상판, 텀블러에 스티커를 실제로 붙인 듯한 자연스러운 다이컷 그림자 연출 컷입니다.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsLifestyleModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/80 hover:bg-white text-gray-500 hover:text-gray-900 flex items-center justify-center text-lg font-bold shadow-xs transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Etsy & Pinterest Tip Banner */}
              <div className="bg-gradient-to-r from-amber-50 to-violet-50 px-4 py-2.5 border-b border-violet-200 text-xs text-stone-800 flex items-center gap-2">
                <span className="text-base shrink-0">📌</span>
                <span className="leading-relaxed">
                  <strong>Etsy & Pinterest 활용 필수 팁:</strong> Etsy 상품 등록 시 1번 대표 표지 다음인 <strong>2~4번 추가 사진</strong>으로 업로드하세요! 또한 Pinterest에 핀으로 발행하면 구매 의도가 높은 미국 다꾸·플래너 타깃 유저들의 대규모 외부 유입을 유도할 수 있습니다.
                </span>
              </div>

              {/* Action Bar */}
              <div className="px-4 sm:px-6 py-3 bg-stone-50 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-black text-violet-950 bg-violet-100 border border-violet-200 px-3 py-1.5 rounded-xl shadow-2xs">
                    ✨ 고화질 실물 시연 세트 (총 3장)
                  </span>
                  <span className="text-[11px] text-gray-500 font-medium">
                    (상세 팝업에서 일일이 맞출 필요 없이, 원클릭으로 3종이 자동 완성됩니다)
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => handleOpenLifestyleMockups(packStickers, true)}
                    disabled={lifestyleLoading || packStickers.length === 0}
                    className="bg-white hover:bg-gray-100 disabled:bg-gray-200 text-gray-700 font-bold text-xs sm:text-sm py-2 px-3 rounded-xl border border-gray-300 shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
                    title="스티커 배치 순서를 무작위로 섞어 새로운 조합으로 다시 합성합니다"
                  >
                    <span>🎲</span>
                    <span>스티커 순서 셔플</span>
                  </button>

                  <button
                    onClick={handleDownloadAllMockupsZip}
                    disabled={lifestyleLoading || lifestyleMockups.length === 0}
                    className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-extrabold text-xs sm:text-sm py-2 px-3.5 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed hover:scale-[1.02]"
                    title="3장의 고화질 목업 이미지를 ZIP 파일로 한 번에 다운로드합니다"
                  >
                    <span>📦</span>
                    <span>3종 한 번에 ZIP 다운로드</span>
                  </button>

                  <a
                    href="https://www.pinterest.com/pin-creation-tool/"
                    target="_blank"
                    rel="noreferrer"
                    className="bg-[#E60023] hover:bg-[#ad081b] active:scale-95 text-white font-extrabold text-xs sm:text-sm py-2 px-3.5 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer hover:scale-[1.02]"
                    title="Pinterest의 공식 핀 생성 페이지(핀 빌더)를 새 창으로 엽니다"
                  >
                    <span>🚀</span>
                    <span>Pinterest 핀 만들기 열기</span>
                  </a>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-stone-100/60">
                {lifestyleLoading ? (
                  <div className="flex flex-col items-center justify-center min-h-[380px] py-12 space-y-4 max-w-sm mx-auto text-center">
                    <div className="w-14 h-14 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin"></div>
                    <div>
                      <p className="text-sm font-extrabold text-gray-800">{lifestyleProgress.message || '실물 시연 목업 생성 중...'}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        스티커의 배경을 정밀 투명화하고 부드러운 다이컷 그림자를 계산하여 2048px 캔버스에 합성하고 있습니다.
                      </p>
                    </div>
                    {lifestyleProgress.total > 0 && (
                      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-violet-500 to-indigo-600 h-2.5 rounded-full transition-all duration-300"
                          style={{ width: `${Math.round((lifestyleProgress.current / lifestyleProgress.total) * 100)}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                ) : lifestyleMockups.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {lifestyleMockups.map((mockup, idx) => (
                      <div
                        key={mockup.id}
                        className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-md hover:shadow-xl transition-all duration-200 flex flex-col group"
                      >
                        {/* Image Preview */}
                        <div className="relative aspect-square w-full bg-stone-100 overflow-hidden cursor-pointer" onClick={() => window.open(mockup.dataUrl, '_blank')}>
                          <img
                            src={mockup.dataUrl}
                            alt={mockup.title}
                            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                          />
                          <div className="absolute top-2.5 left-2.5 bg-black/75 backdrop-blur-xs text-white text-[11px] font-black px-2.5 py-1 rounded-full shadow-md flex items-center gap-1.5">
                            <span>{mockup.id === 'ipad_planner' ? '📱' : mockup.id === 'print_craft' ? '🖨️' : '📱'}</span>
                            <span>{mockup.id === 'ipad_planner' ? '굿노트 다꾸' : mockup.id === 'print_craft' ? 'A4 인쇄 & DIY 가위 컷' : '폰케이스 & 저널'}</span>
                          </div>
                          <div className="absolute bottom-2.5 right-2.5 bg-white/90 text-stone-700 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs opacity-0 group-hover:opacity-100 transition-opacity">
                            클릭하여 확대 🔍
                          </div>
                        </div>

                        {/* Card Info & Download */}
                        <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                          <div>
                            <h4 className="text-sm font-extrabold text-gray-900 leading-tight">
                              {mockup.title}
                            </h4>
                            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                              {mockup.description}
                            </p>
                            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                              <span className="text-[10px] font-extrabold bg-violet-100 text-violet-800 border border-violet-200 px-2 py-0.5 rounded-md shadow-2xs">
                                {mockup.recommendedUse || `Etsy ${idx + 2}번 사진 추천`}
                              </span>
                              <span className="text-[10px] font-bold bg-pink-100 text-pink-800 px-2 py-0.5 rounded-md">
                                📌 Pinterest 핀 추천
                              </span>
                            </div>
                          </div>

                          <div className="space-y-2 pt-2 border-t border-gray-100">
                            {/* 1. 고화질 다운로드 */}
                            <button
                              onClick={() => {
                                handleDownloadSingleMockup(mockup);
                                setCopiedMockupNotice(`${mockup.id}_img`);
                                setTimeout(() => setCopiedMockupNotice(null), 2000);
                              }}
                              className="w-full bg-stone-900 hover:bg-black text-white font-extrabold text-xs py-2 px-3 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                              title="목업 사진을 다운로드합니다"
                            >
                              <span>📥</span>
                              <span>{copiedMockupNotice === `${mockup.id}_img` ? '✓ 다운로드 완료!' : '1. 목업 사진 다운로드'}</span>
                            </button>

                            {/* 📌 Pinterest 핀 등록 키트 */}
                            <div className="bg-red-50/70 rounded-xl p-2.5 border border-red-200 space-y-2">
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-[11px] font-black text-red-950 flex items-center gap-1">
                                  <span>📌</span>
                                  <span>Pinterest 핀 등록 키트</span>
                                </span>
                                <a
                                  href="https://www.pinterest.com/pin-creation-tool/"
                                  target="_blank"
                                  rel="noreferrer"
                                  className="bg-[#E60023] hover:bg-[#ad081b] active:scale-95 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-2xs flex items-center gap-1 cursor-pointer transition-all"
                                  title="Pinterest의 공식 핀 생성 페이지를 새 창으로 엽니다"
                                >
                                  <span>🚀</span>
                                  <span>핀 만들기 창</span>
                                </a>
                              </div>

                              <div className="grid grid-cols-3 gap-1">
                                {/* 2. 제목 복사 */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const seoData = getMockupEnglishSeo(mockup, selectedPackCover, packStickers.length);
                                    handleCopy(seoData.title);
                                    setCopiedMockupNotice(`${mockup.id}_title`);
                                    setTimeout(() => setCopiedMockupNotice(null), 2000);
                                  }}
                                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold py-1.5 px-1 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
                                  title="목업 영문 핀 제목을 복사합니다. 핀 화면의 제목 칸에 Ctrl+V 하세요."
                                >
                                  <span>📋</span>
                                  <span>{copiedMockupNotice === `${mockup.id}_title` ? '✓ 복사됨' : '2. 제목'}</span>
                                </button>

                                {/* 3. 설명 복사 */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const seoData = getMockupEnglishSeo(mockup, selectedPackCover, packStickers.length);
                                    handleCopy(seoData.description);
                                    setCopiedMockupNotice(`${mockup.id}_desc`);
                                    setTimeout(() => setCopiedMockupNotice(null), 2000);
                                  }}
                                  className="bg-violet-600 hover:bg-violet-700 text-white text-[11px] font-bold py-1.5 px-1 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
                                  title="목업 영문 상세설명 및 해시태그를 복사합니다. 핀 화면의 설명 칸에 Ctrl+V 하세요."
                                >
                                  <span>📝</span>
                                  <span>{copiedMockupNotice === `${mockup.id}_desc` ? '✓ 복사됨' : '3. 설명'}</span>
                                </button>

                                {/* 4. 링크 복사 */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const seoData = getMockupEnglishSeo(mockup, selectedPackCover, packStickers.length);
                                    handleCopy(seoData.targetLink);
                                    setCopiedMockupNotice(`${mockup.id}_link`);
                                    setTimeout(() => setCopiedMockupNotice(null), 2000);
                                  }}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold py-1.5 px-1 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
                                  title="Etsy 상점 링크를 복사합니다. 핀 화면의 링크 칸에 Ctrl+V 하세요."
                                >
                                  <span>🔗</span>
                                  <span>{copiedMockupNotice === `${mockup.id}_link` ? '✓ 복사됨' : '4. 링크'}</span>
                                </button>
                              </div>

                              <p className="text-[10px] text-stone-500 text-center leading-tight pt-0.5">
                                💡 <strong>1.사진</strong> 드래그 ➔ <strong>2~4번</strong> 클릭 후 핀 창에 <strong>Ctrl+V</strong> 붙여넣기
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-400 py-16">
                    <p className="text-sm font-medium">생성된 목업이 없습니다.</p>
                  </div>
                )}
              </div>

              {/* Modal Footer Note */}
              <div className="px-5 py-3 bg-stone-100 border-t border-gray-200 text-xs text-gray-600 flex flex-wrap items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 font-medium">
                  <span>💡</span>
                  <span>Etsy는 상품 사진이 많을수록 검색 점수를 높게 부여합니다. 이 3종 목업을 함께 업로드하면 구매 전환율과 검색 랭킹이 동시에 올라갑니다.</span>
                </span>
                <button
                  onClick={() => setIsLifestyleModalOpen(false)}
                  className="text-xs text-gray-600 hover:text-gray-900 font-bold px-3 py-1 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 📦 Batch ZIP Session Selector Modal */}
        {isBatchZipModalOpen && (
          <div className="fixed inset-0 bg-black/60 z-[75] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 relative animate-in fade-in zoom-in duration-200 border border-teal-100">
              <button 
                onClick={() => setIsBatchZipModalOpen(false)} 
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 text-xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                ×
              </button>

              <div className="flex items-center gap-3">
                <span className="text-3xl">📦</span>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">생성 회차별 ZIP 다운로드 선택</h3>
                  <p className="text-xs text-gray-500">다운로드하실 스티커 팩 생성 회차(배치)를 선택해 주세요.</p>
                </div>
              </div>

              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {batchZipSessions.map((session, idx) => (
                  <div
                    key={session.id}
                    onClick={() => downloadBatchSession([session.cover, ...session.stickers], session.batchName)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all hover:scale-[1.01] shadow-xs flex items-center justify-between gap-3 ${
                      session.isLatest
                        ? 'bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 border-teal-300 hover:border-teal-500 ring-2 ring-teal-400/40'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 overflow-hidden shrink-0 shadow-xs">
                        <img src={session.cover.image_url} alt={session.cover.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-bold text-gray-900 truncate">
                            {session.isLatest ? '⚡️ [최신 회차]' : `📦 [${batchZipSessions.length - idx}회차]`} {session.dateStr}
                          </span>
                          {session.isLatest && (
                            <span className="bg-teal-600 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded">최신</span>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-600 mt-0.5 font-medium truncate">
                          • 마스터 표지 1장 + 스티커 {session.stickers.length}종 (총 {session.totalCount}장)
                        </p>
                      </div>
                    </div>

                    <button className={`text-xs font-bold px-3 py-2 rounded-xl text-white shadow-xs shrink-0 transition-colors ${
                      session.isLatest ? 'bg-teal-700 hover:bg-teal-800' : 'bg-gray-700 hover:bg-gray-800'
                    }`}>
                      다운로드
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
                <button
                  onClick={() => downloadBatchSession(allZipPool, `${selectedStickerSeriesTab}_All_Combined`)}
                  className="w-full bg-stone-800 hover:bg-stone-900 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>🌐 전체 누적 스티커 통합 다운로드 (총 {allZipPool.length}장)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 화면 하단 플로팅 실시간 ZIP 압축 다운로드 진행상황 도크 */}
        {isExportingBundle && (
          <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 bg-emerald-950/95 backdrop-blur-md text-white border-2 border-emerald-400 p-3.5 rounded-2xl shadow-2xl flex items-center gap-3.5 max-w-sm sm:max-w-md w-[calc(100vw-2rem)] sm:w-auto animate-bounce-subtle">
            <div className="w-5 h-5 border-3 border-emerald-400/40 border-t-emerald-400 rounded-full animate-spin shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-black text-emerald-300 truncate">
                  📦 ZIP 압축팩 패키징 중
                </span>
                <span className="text-[11px] font-mono font-bold text-emerald-200 shrink-0">
                  {exportBundleProgress ? Math.round((exportBundleProgress.current / Math.max(exportBundleProgress.total, 1)) * 100) : 0}%
                </span>
              </div>
              <p className="text-[10.5px] text-gray-300 truncate mt-0.5">
                {exportBundleProgress?.message || '고화질 스티커 투명 배경 및 A4 시트 생성 중...'}
              </p>
              <div className="w-full bg-white/20 rounded-full h-1.5 overflow-hidden mt-1.5">
                <div
                  className="bg-gradient-to-r from-teal-400 to-emerald-400 h-full rounded-full transition-all duration-200"
                  style={{ width: `${exportBundleProgress ? Math.round((exportBundleProgress.current / Math.max(exportBundleProgress.total, 1)) * 100) : 5}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* 화면 하단 플로팅 실시간 진행상황 도크 (스크롤 시에도 100% 명확히 인지 가능) */}
        {isBatchGenerating && (
          <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 bg-slate-950/95 backdrop-blur-md text-white border-2 border-amber-400 p-3.5 rounded-2xl shadow-2xl flex items-center gap-3.5 max-w-sm sm:max-w-md w-[calc(100vw-2rem)] sm:w-auto animate-bounce-subtle">
            <div className="w-5 h-5 border-3 border-amber-400/40 border-t-amber-400 rounded-full animate-spin shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-black text-amber-300 truncate">
                  ⚡ {batchProgress.packTitle || '40종 스티커 팩'} 생성 중
                </span>
                <span className="text-[11px] font-mono font-bold text-amber-200 shrink-0">
                  {batchProgress.current}/{batchProgress.total}장 ({Math.round((batchProgress.current / Math.max(batchProgress.total, 1)) * 100)}%)
                </span>
              </div>
              <p className="text-[10.5px] text-gray-300 truncate mt-0.5">
                {batchProgress.label}
              </p>
              <div className="w-full bg-white/20 rounded-full h-1.5 overflow-hidden mt-1.5">
                <div
                  className="bg-gradient-to-r from-amber-400 to-emerald-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.max(5, Math.round((batchProgress.current / Math.max(batchProgress.total, 1)) * 100))}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* 화면 하단 플로팅 완료 알림 토스트 (생성 완료 후 스크롤 상태에서도 즉시 인지) */}
        {batchCompletionNotice && !isBatchGenerating && (
          <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 bg-emerald-950/95 backdrop-blur-md text-white border-2 border-emerald-400 p-3.5 rounded-2xl shadow-2xl flex items-center gap-3 max-w-sm sm:max-w-md w-[calc(100vw-2rem)] sm:w-auto animate-fade-in">
            <span className="text-2xl shrink-0">🎉</span>
            <div className="min-w-0 flex-1">
              <span className="text-xs font-black text-emerald-300 block truncate">
                {batchCompletionNotice.packName} 생성 완료!
              </span>
              <p className="text-[11px] text-emerald-100 truncate">
                총 {batchCompletionNotice.successCount}장 생성 완료 & A4 2장 시트 준비됨
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedStickerSubTab(batchCompletionNotice.packId);
                const el = document.getElementById('gallery-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-[11px] bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold px-2.5 py-1.5 rounded-xl shrink-0 cursor-pointer shadow-xs"
            >
              갤러리 보기
            </button>
            <button
              onClick={() => setBatchCompletionNotice(null)}
              className="text-emerald-300 hover:text-white text-xs px-1 cursor-pointer shrink-0"
              title="닫기"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
