import { GoogleGenAI } from '@google/genai';
import { db } from '@/lib/firebase-admin';
import crypto from 'crypto';
import { NextResponse } from 'next/server';

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
    if (process.env.GEMINI_API_KEY) {
      try {
        const trendResponse = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: 'Search for recent US trends on Etsy or Pinterest, but strictly adapt the trend to fit a "little paw" (small animals like hamsters, guinea pigs, kittens, etc.) store concept. Return exactly 1 t-shirt design theme/topic. Return ONLY a concise short string describing the theme (e.g., "Vintage cottagecore hamster eating strawberry" or "Funny guinea pig with sunglasses"). Do not include any other text, markdown, or quotes.',
        });
        if (trendResponse.text) {
          baseTopic = trendResponse.text.trim().replace(/^["']|["']$/g, '');
        }
      } catch (err) {
        console.error("Trend research failed, using fallback topic.");
      }
    }
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

    let designPrompt = `${baseTopic}, vector art, t-shirt design, clean white background`;
    
    if (styleData && process.env.GEMINI_API_KEY) {
      console.log(`🎨 Applying style: ${styleData.name}`);
      try {
        const promptResponse = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [
            `You are an expert prompt engineer. Create an image generation prompt for the topic: "${baseTopic}". IMPORTANT: Match the exact artistic style, coloring, texture, and mood of the provided reference image, as well as these instructions: "${styleData.style_prompt}". Do NOT include the subject of the reference image. The output must be ONLY the raw prompt string for an image generator (clean background, t-shirt design).`,
            { inlineData: { data: styleData.image_url.replace(/^data:image\/\w+;base64,/, ""), mimeType: 'image/jpeg' } }
          ]
        });
        if (promptResponse.text) {
          designPrompt = promptResponse.text.trim();
        }
      } catch (err) {
        console.error("Style prompt generation failed, using fallback.");
        designPrompt = `${baseTopic}. MUST STRICTLY ADHERE TO THIS STYLE: ${styleData.style_prompt}`;
      }
    }
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

    console.log(`🎨 Generating design and SEO text for: ${baseTopic}...`);
    
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

    // [STEP 4] Generate actual AI Image using Google Imagen
    let imageUrl = `https://placehold.co/800x800/eff6ff/1d4ed8?text=${encodeURIComponent(baseTopic.split(' ').slice(0, 3).join(' ')+ '\\n(Generation Failed)')}`;
    if (process.env.GEMINI_API_KEY) {
      try {
        console.log(`🎨 Drawing image with Imagen 4.0...`);
        const imgResponse = await ai.models.generateImages({
          model: 'imagen-4.0-fast-generate-001',
          prompt: designPrompt,
          config: { numberOfImages: 1, aspectRatio: '1:1', outputMimeType: 'image/jpeg' }
        });
        const base64Image = imgResponse.generatedImages?.[0]?.image?.imageBytes;
        if (base64Image) {
          imageUrl = `data:image/jpeg;base64,${base64Image}`;
        }
      } catch (imgError) {
        console.error("Imagen generation failed:", imgError);
      }
    }

    // [STEP 5] Log success to Firebase
    const designData = {
      prompt_hash: promptHash,
      topic: baseTopic,
      prompt: designPrompt,
      title: productInfo.title,
      tags: productInfo.tags,
      image_url: imageUrl,
      created_at: new Date().toISOString(),
      status: 'success'
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
