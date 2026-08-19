import { GoogleGenAI } from '@google/genai';
import { db } from '@/lib/firebase-admin';
import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { sanitizeSpelling, getStrictSpellingInstruction, generateImageWithVisionRetry, buildEnforced2DVectorPrompt, fetchLikedDesignsSummary } from '@/lib/spelling-verifier';
import { getAnimalAffinityInstruction } from '@/lib/animal-affinities';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function GET(req: Request) {
  // 1. Vercel Cron Security Validation bypassed for dashboard UI
  // In production, you'd want to secure this endpoint properly.

  try {
    // [STEP 0] Data Retention Policy: Delete records older than 90 days
    if (process.env.FIREBASE_PROJECT_ID) {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      
      const oldDesignsSnapshot = await db.collection('designs')
        .where('created_at', '<', ninetyDaysAgo.toISOString())
        .get();
        
      if (!oldDesignsSnapshot.empty) {
        const batch = db.batch();
        oldDesignsSnapshot.forEach((doc: any) => {
          batch.delete(doc.ref);
        });
        await batch.commit();
        console.log(`🗑️ Deleted ${oldDesignsSnapshot.size} old records.`);
      }
    }

    // [STEP 1] Trend Research using Gemini
    let baseTopic = "Cute minimalist animal illustration";
    const animalList = ['hamsters', 'guinea pigs', 'kittens', 'puppies', 'bunnies', 'ducklings', 'piglets', 'Pygmy Hippos', 'sea otter pups', 'Black Bear Cubs', 'fawns', 'Baby Sloths', 'Baby Hedgehogs', 'baby red pandas'];
    const urlParams = new URL(req.url);
    const requestedAnimal = urlParams.searchParams.get('animal');
    const targetAnimal = (requestedAnimal && requestedAnimal !== 'random') ? requestedAnimal : animalList[Math.floor(Math.random() * animalList.length)];
    const affinityInstruction = getAnimalAffinityInstruction(targetAnimal);

    const userCatchphrase = urlParams.searchParams.get('catchphrase') || '';
    const autoPhraseParam = urlParams.searchParams.get('autoPhrase');
    const autoPhrase = autoPhraseParam === null ? true : autoPhraseParam === 'true';
    let catchphrase = userCatchphrase;
    if (process.env.GEMINI_API_KEY) {
      try {
        const trendResponse = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `Search for recent US trends on Etsy or Pinterest, but strictly adapt the trend to fit a "little paw" (${targetAnimal}) store concept. ${affinityInstruction} Return a JSON object with: 1. "theme": exactly 1 t-shirt design theme/topic featuring the ${targetAnimal} (e.g. "Vintage cottagecore ${targetAnimal} with bamboo").${autoPhrase ? ` 2. "catchphrase": A short, witty, trademark-free phrase (2-4 words) related to the animal or theme, such as "Paws & Bamboo".` : ''}`,
          config: { responseMimeType: 'application/json' }
        });
        if (trendResponse.text) {
          const data = JSON.parse(trendResponse.text.trim());
          baseTopic = data.theme;
          catchphrase = userCatchphrase || (autoPhrase && data.catchphrase ? data.catchphrase : '');
          catchphrase = sanitizeSpelling(userCatchphrase || (autoPhrase && data.catchphrase ? data.catchphrase : ''));
        }
      } catch (err) {
        console.error("Trend research failed, using fallback topic.");
      }
    }
    // [STEP 1.2] Garment Color Preference (Light vs Dark T-Shirt)
    const garmentParam = urlParams.searchParams.get('garmentColor');
    let isDarkGarment = false;
    if (garmentParam === 'dark') {
      isDarkGarment = true;
    } else if (garmentParam === 'light') {
      isDarkGarment = false;
    } else {
      // ~30% random probability for Dark Garment (Black or Navy T-Shirt)
      isDarkGarment = Math.random() < 0.30;
    }

    const darkMockupId = Math.random() < 0.5 ? 'black-tshirt' : 'navy-tshirt';
    const recommendedMockup = isDarkGarment ? darkMockupId : 'white-tshirt';
    const darkGarmentInstruction = isDarkGarment 
      ? ` CRITICAL INSTRUCTION FOR DARK (BLACK/NAVY) T-SHIRT PRINTING: This graphic illustration will be printed on a DARK (BLACK or NAVY BLUE) t-shirt. All text, catchphrases, lettering, typography, outlines, and key subject details MUST be drawn using BRIGHT WHITE, LIGHT CREAM, GLOWING GOLD, or VIVID LIGHT PASTEL COLORS (e.g., crisp white script font, bright pastel yellow, vivid mint). ABSOLUTELY NO BLACK, DARK BROWN, OR DARK NAVY TEXT OR OUTLINES, as they will be completely invisible on dark fabric. Ensure all text and artwork pop brightly against a dark background!`
      : '';

    // [STEP 1.5] Fetch Style Presets
    const url = new URL(req.url);
    const styleId = url.searchParams.get('styleId');
    let styleData = null;

    if (styleId && process.env.FIREBASE_PROJECT_ID) {
      const styleDoc = await db.collection('styles').doc(styleId).get();
      if (styleDoc.exists) {
        styleData = styleDoc.data();
      }
    } else if (!styleId && process.env.FIREBASE_PROJECT_ID) {
      // Find priority style if no styleId is specified
      const priorityQuery = await db.collection('styles').where('is_priority', '==', true).limit(1).get();
      if (!priorityQuery.empty) {
        styleData = priorityQuery.docs[0].data();
      }
    }

    // Fetch #1 priority liked (heart-marked) designs from Firebase
    const { likedDesigns, likedPromptSummary, inlineImages: likedInlineImages } = await fetchLikedDesignsSummary(db, 4);

    const spellingInstruction = getStrictSpellingInstruction(catchphrase, autoPhrase);
    let designPrompt = sanitizeSpelling(`${baseTopic}, vector art, standalone graphic illustration. ${affinityInstruction}${darkGarmentInstruction} CRITICAL RULE: The image MUST be a SINGLE isolated graphic illustration centered on a pure solid white background (#FFFFFF). ABSOLUTELY NO GROUND SHADOWS, NO DROP SHADOWS, NO FLOOR REFLECTIONS, NO PEDESTAL SHADING, AND NO BACKGROUND SHADOWS UNDER THE FEET OR SUBJECT. NEVER draw actual t-shirt garments, clothing mockups, grid layouts, or multiple t-shirts. NEVER generate any background colors, gradients, or scenery. ${spellingInstruction}`);
    
    if (process.env.GEMINI_API_KEY && (likedDesigns.length > 0 || styleData)) {
      console.log(`🎨 Constructing prompt using Liked Benchmark (${likedDesigns.length} liked designs) & Style Preset (${styleData?.name || 'Default'})...`);
      try {
        let systemMsg = `You are an expert T-shirt graphic design prompt engineer.\n`;
        
        if (likedDesigns.length > 0) {
          systemMsg += `CRITICAL #1 MASTER BENCHMARK RULE: The user has explicitly HEART-MARKED (LIKED) ${likedDesigns.length} previous design(s) as their FAVORITES!
These liked designs are your #1 PRIMARY STYLE BENCHMARK for vector art quality, crisp linework, color palette, typography placement, and overall charm.
Here are the exact prompts and themes of the user's favorite liked designs:
${likedPromptSummary}

You MUST generate an image generation prompt for the new topic: "${baseTopic}". ${affinityInstruction} ${spellingInstruction}${darkGarmentInstruction}
Ensure the new prompt strictly matches the 2D vector line art aesthetic, crisp linework, flat colors, cute charm, and script typography placement of the user's LIKED benchmark designs.
The output must be ONLY the raw prompt string for an image generator.`;
        } else {
          systemMsg += `You are an expert prompt engineer. Create an image generation prompt for the topic: "${baseTopic}". ${affinityInstruction} ${spellingInstruction}${darkGarmentInstruction} IMPORTANT: Match the exact artistic style, coloring, texture, and mood of the provided reference style image, as well as these instructions: "${styleData?.style_prompt}". Do NOT include the subject of the reference image. The output must be ONLY the raw prompt string for an image generator. CRITICAL INSTRUCTION: You must append this strict rule to the prompt: The image MUST be a SINGLE isolated graphic illustration centered on a pure solid white background (#FFFFFF). ABSOLUTELY NO GROUND SHADOWS, NO DROP SHADOWS, NO FLOOR REFLECTIONS, NO PEDESTAL SHADING, AND NO BACKGROUND SHADOWS UNDER THE FEET OR SUBJECT. NEVER draw actual t-shirt garments, clothing mockups, grid layouts, or multiple t-shirts. NEVER generate any background colors, gradients, or scenery.`;
        }

        const contents: any[] = [systemMsg];

        // Attach style reference image if present
        if (styleData?.image_url && styleData.image_url.startsWith('data:image')) {
          const mimeType = styleData.image_url.match(/^data:(image\/\w+);base64,/)?.[1] || 'image/jpeg';
          contents.push({ inlineData: { data: styleData.image_url.replace(/^data:image\/\w+;base64,/, ""), mimeType } });
        }

        // Attach liked design images as #1 visual reference!
        likedInlineImages.forEach(imgObj => contents.push(imgObj));

        const promptResponse = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: contents
        });

        if (promptResponse.text) {
          designPrompt = sanitizeSpelling(promptResponse.text.trim());
        }
      } catch (err) {
        console.error("Style prompt generation failed, using fallback.");
        designPrompt = sanitizeSpelling(`${baseTopic}. ${affinityInstruction}${darkGarmentInstruction} CRITICAL RULE: The image MUST be a SINGLE isolated graphic illustration centered on a pure solid white background (#FFFFFF). ABSOLUTELY NO GROUND SHADOWS, NO DROP SHADOWS, NO FLOOR REFLECTIONS, NO PEDESTAL SHADING, AND NO BACKGROUND SHADOWS UNDER THE FEET OR SUBJECT. NEVER draw actual t-shirt garments, clothing mockups, grid layouts, or multiple t-shirts. NEVER generate any background colors, gradients, or scenery. ${spellingInstruction} ${styleData ? `MUST STRICTLY ADHERE TO THIS STYLE: ${styleData.style_prompt}` : ''}`);
      }
    }

    // Always enforce strict 2D vector line art, arched typography script text, and white background rules
    designPrompt = buildEnforced2DVectorPrompt(designPrompt, spellingInstruction);

    // [STEP 2] Check for duplicates in Firebase via hash
    const promptHash = crypto.createHash('md5').update(designPrompt).digest('hex');
    let docExists = false;
    if (process.env.FIREBASE_PROJECT_ID) {
      const designRef = db.collection('designs').doc(promptHash);
      const doc = await designRef.get();
      docExists = doc.exists;
    }

    if (docExists) {
      console.log('⚠️ Duplicate design concept exists. Skipping.');
      return NextResponse.json({ message: 'Skipped: Duplicate design', topic: baseTopic });
    }

    console.log(`🎨 Generating design and SEO text for: ${baseTopic} (Target: ${isDarkGarment ? 'Dark' : 'Light'} Garment)...`);
    
    // [STEP 3] Generate SEO Content using Gemini 3.1 Pro
    let productInfo;
    if (process.env.GEMINI_API_KEY) {
      const textResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Please create an Etsy t-shirt product title and 13 SEO tags for the theme '${baseTopic}'. Format as JSON with keys 'title' and 'tags'.`,
        config: { responseMimeType: 'application/json' }
      });
      const productInfoText = textResponse.text;
      productInfo = productInfoText ? JSON.parse(productInfoText) : { title: '', tags: [] };
    } else {
      productInfo = {
        title: `[MOCK] ${baseTopic} T-Shirt`,
        tags: ["mock tag 1", "mock tag 2", "trending shirt", "apparel"]
      };
    }

    // [STEP 4] Generate actual AI Image using Google Imagen + 2nd-Stage Gemini Vision Verification & Auto-Retry
    let imageUrl = `https://placehold.co/800x800/eff6ff/1d4ed8?text=${encodeURIComponent(baseTopic.split(' ').slice(0, 3).join(' ')+ '\\n(Generation Failed)')}`;
    let verificationInfo: any = null;
    let totalAttempts = 1;

    if (process.env.GEMINI_API_KEY) {
      try {
        console.log(`🎨 Drawing image with Imagen 4.0 & Gemini Vision OCR Verification...`);
        const result = await generateImageWithVisionRetry(ai, designPrompt, catchphrase || undefined, 2);
        imageUrl = result.imageUrl;
        verificationInfo = result.verification;
        totalAttempts = result.totalAttempts;
      } catch (imgError: any) {
        console.error("Imagen generation failed:", imgError);
        const errMsg = imgError?.message || String(imgError);
        if (errMsg.includes('429') || errMsg.includes('quota') || errMsg.includes('RESOURCE_EXHAUSTED')) {
          return NextResponse.json({ 
            success: false, 
            error: '오늘 사용할 수 있는 구글 AI 이미지 생성 하루 한도(70회)를 모두 소진했습니다. 내일 다시 시도해 주세요!' 
          }, { status: 429 });
        }
        return NextResponse.json({ success: false, error: `AI 이미지 생성 중 오류 발생: ${errMsg}` }, { status: 500 });
      }
    }

    // [STEP 5] Log success to Firebase
    const styleNameUsed = styleData ? styleData.name : (styleId ? '지정 화풍' : '기본 수채화/벡터 일러스트');

    const designData = {
      prompt_hash: promptHash,
      topic: baseTopic,
      prompt: designPrompt,
      title: productInfo.title,
      tags: productInfo.tags,
      image_url: imageUrl,
      created_at: new Date().toISOString(),
      status: 'success',
      target_garment: isDarkGarment ? 'dark' : 'light',
      recommended_mockup: recommendedMockup,
      catchphrase: catchphrase || null,
      style_name: styleNameUsed,
      spelling_verified: verificationInfo ? verificationInfo.isSpellingCorrect : true,
      spelling_has_text: verificationInfo ? Boolean(verificationInfo.hasText) : false,
      spelling_detected_text: verificationInfo ? (verificationInfo.hasText ? verificationInfo.detectedText : '') : '',
      spelling_attempts: totalAttempts,
      spelling_typo_details: verificationInfo ? verificationInfo.typoDetails : '',
    };

    if (process.env.FIREBASE_PROJECT_ID) {
      const designRef = db.collection('designs').doc(promptHash);
      await designRef.set(designData);
    }

    return NextResponse.json({ 
      success: true, 
      message: process.env.GEMINI_API_KEY ? 'Agent ran successfully.' : '[MOCK MODE] Agent ran successfully.', 
      data: designData 
    });

  } catch (error: any) {
    // [STEP 6] Log errors
    console.error('❌ Error in run-agent:', error);
    
    if (process.env.FIREBASE_PROJECT_ID) {
        await db.collection('errors').add({
        error_message: error.message,
        stack: error.stack,
        created_at: new Date().toISOString()
        });
    }

    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
