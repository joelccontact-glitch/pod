import { GoogleGenAI } from '@google/genai';
import { db } from '@/lib/firebase-admin';
import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { sanitizeSpelling, getStrictSpellingInstruction, generateImageWithVisionRetry } from '@/lib/spelling-verifier';
import { getAnimalAffinityInstruction } from '@/lib/animal-affinities';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const { imageBase64, prompt, isPreview, styleId, catchphrase: rawCatchphrase, autoPhrase } = await req.json();

    if (!prompt) {
      return NextResponse.json({ success: false, error: 'Prompt is required' }, { status: 400 });
    }

    const catchphrase = rawCatchphrase ? sanitizeSpelling(rawCatchphrase) : null;
    const spellingInstruction = getStrictSpellingInstruction(catchphrase || undefined, autoPhrase);
    const affinityInstruction = getAnimalAffinityInstruction(prompt);

    // Strip data URL prefix if present
    const base64Data = imageBase64 ? imageBase64.replace(/^data:image\/\w+;base64,/, "") : "";

    let newPrompt = sanitizeSpelling(prompt);
    let productInfo: any = { title: `[MOCK] Image derived T-Shirt`, tags: ["mock", "derived"] };
    let styleData: any = null;

    if (process.env.GEMINI_API_KEY) {
      if (styleId && process.env.FIREBASE_PROJECT_ID) {
        const styleDoc = await db.collection('styles').doc(styleId).get();
        if (styleDoc.exists) {
          styleData = styleDoc.data();
        }
      }

      let contentsArray: any[] = [];
      if (styleData) {
        console.log(`🎨 Applying style: ${styleData.name}`);
        if (base64Data) {
          contentsArray = [
            `You are an expert prompt engineer. The user wants to create a new t-shirt design based on the FIRST image (concept), with the instruction: "${prompt}". ${affinityInstruction} ${catchphrase ? `CRUCIAL: Incorporate the typography text "${catchphrase}". This text MUST be drawn in an elegant, cute, hand-drawn script font using colors that perfectly match the mood and palette of the image. ` : (autoPhrase ? `CRUCIAL: Invent a short, witty, trademark-free phrase (2-4 words, e.g., "Tiny Oink") related to the instruction, and incorporate it as typography text. This text MUST be drawn in an elegant, cute, hand-drawn script font using colors that perfectly match the mood and palette of the image. ` : '')}IMPORTANT: Match the exact artistic style, coloring, texture, and mood of the SECOND image (style reference), as well as these style instructions: "${styleData.style_prompt}". Generate a highly detailed prompt for an image generator (like vector art, pure solid white background (#FFFFFF), NO scenery, t-shirt design style) that captures the essence of the first image but completely applies the style of the second image. CRITICAL INSTRUCTION: You must append this strict rule to the prompt: The image MUST have a pure solid white background (#FFFFFF). NEVER generate any background colors, gradients, or scenery. Return ONLY the new prompt string.`,
            { inlineData: { data: base64Data, mimeType: 'image/jpeg' } },
            { inlineData: { data: styleData.image_url.replace(/^data:image\/\w+;base64,/, ""), mimeType: 'image/jpeg' } }
          ];
        } else {
          contentsArray = [
            `You are an expert prompt engineer. The user wants to create a new t-shirt design based on the instruction: "${prompt}". ${affinityInstruction} ${catchphrase ? `CRUCIAL: Incorporate the typography text "${catchphrase}". This text MUST be drawn in an elegant, cute, hand-drawn script font using colors that perfectly match the mood and palette of the image. ` : (autoPhrase ? `CRUCIAL: Invent a short, witty, trademark-free phrase (2-4 words, e.g., "Tiny Oink") related to the instruction, and incorporate it as typography text. This text MUST be drawn in an elegant, cute, hand-drawn script font using colors that perfectly match the mood and palette of the image. ` : '')}IMPORTANT: Match the exact artistic style, coloring, texture, and mood of the provided reference image, as well as these style instructions: "${styleData.style_prompt}". Generate a highly detailed prompt for an image generator (like vector art, pure solid white background (#FFFFFF), NO scenery, t-shirt design style) that applies the instruction while strictly following the style reference. CRITICAL INSTRUCTION: You must append this strict rule to the prompt: The image MUST have a pure solid white background (#FFFFFF). NEVER generate any background colors, gradients, or scenery. Return ONLY the new prompt string.`,
            { inlineData: { data: styleData.image_url.replace(/^data:image\/\w+;base64,/, ""), mimeType: 'image/jpeg' } }
          ];
        }
      } else {
        if (base64Data) {
          contentsArray = [
            `Analyze this reference image. The user wants to create a new t-shirt design based on this, with the following instruction: "${prompt}". ${affinityInstruction} ${catchphrase ? `CRUCIAL: Incorporate the typography text "${catchphrase}". This text MUST be drawn in an elegant, cute, hand-drawn script font using colors that perfectly match the mood and palette of the image. ` : (autoPhrase ? `CRUCIAL: Invent a short, witty, trademark-free phrase (2-4 words, e.g., "Tiny Oink") related to the instruction, and incorporate it as typography text. This text MUST be drawn in an elegant, cute, hand-drawn script font using colors that perfectly match the mood and palette of the image. ` : '')}Generate a highly detailed prompt for an image generator (like vector art, pure solid white background (#FFFFFF), NO scenery, t-shirt design style) that captures the essence of the reference image but applies the user's instruction. CRITICAL INSTRUCTION: You must append this strict rule to the prompt: The image MUST have a pure solid white background (#FFFFFF). NEVER generate any background colors, gradients, or scenery. Return ONLY the new prompt string.`,
            { inlineData: { data: base64Data, mimeType: 'image/jpeg' } }
          ];
        } else {
          contentsArray = [
            `You are an expert prompt engineer. Generate a highly detailed prompt for an image generator (like vector art, pure solid white background (#FFFFFF), NO scenery, t-shirt design style) based on this instruction: "${prompt}". ${affinityInstruction} ${catchphrase ? `CRUCIAL: Incorporate the typography text "${catchphrase}". This text MUST be drawn in an elegant, cute, hand-drawn script font using colors that perfectly match the mood and palette of the image. ` : (autoPhrase ? `CRUCIAL: Invent a short, witty, trademark-free phrase (2-4 words, e.g., "Tiny Oink") related to the instruction, and incorporate it as typography text. This text MUST be drawn in an elegant, cute, hand-drawn script font using colors that perfectly match the mood and palette of the image. ` : '')}CRITICAL INSTRUCTION: You must append this strict rule to the prompt: The image MUST have a pure solid white background (#FFFFFF). NEVER generate any background colors, gradients, or scenery. Return ONLY the new prompt string.`
          ];
        }
      }

      // 1. Generate new prompt based on image(s) + user prompt
      const promptResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contentsArray
      });
      newPrompt = promptResponse.text?.trim() || prompt;

      // 2. Generate SEO Content
      const textResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Please create an Etsy t-shirt product title and 13 SEO tags for a design described as: '${newPrompt}'. Format as JSON with keys 'title' and 'tags'.`,
        config: { responseMimeType: 'application/json' }
      });
      const productInfoText = textResponse.text;
      productInfo = productInfoText ? JSON.parse(productInfoText) : productInfo;
    }

    newPrompt = `${newPrompt}. 2D vector graphic illustration, clean bold line art with crisp black outlines, flat vector color shading, cute kawaii T-shirt graphic sticker layout. ${spellingInstruction} BACKGROUND MANDATE: The image MUST be a SINGLE isolated 2D graphic illustration centered on a pure solid white background (#FFFFFF) (or pure solid dark background for dark t-shirts). ABSOLUTELY NO GROUND SHADOWS, NO DROP SHADOWS, NO ROOM WALLS, NO WOODEN TABLES, NO BACKGROUND SCENERY. STRICT NEGATIVE DIRECTIVES: ABSOLUTELY NO 3D rendering, NO photorealism, NO 3D realism, NO photographic lighting, NO realistic fur textures, NO depth of field blur, NO background environment scenery.`;

    let newImageUrl = `https://placehold.co/800x800/eff6ff/1d4ed8?text=Image+Derived+Preview`;
    let verificationInfo: any = null;
    let totalAttempts = 1;

    if (process.env.GEMINI_API_KEY) {
      try {
        console.log(`🎨 Drawing derived image with Imagen 4.0 & Gemini Vision OCR Verification...`);
        const result = await generateImageWithVisionRetry(ai, newPrompt, catchphrase || undefined, 2);
        newImageUrl = result.imageUrl;
        verificationInfo = result.verification;
        totalAttempts = result.totalAttempts;
      } catch (imgError) {
        console.error("Imagen generation failed:", imgError);
      }
    }
    
    const newHash = crypto.createHash('md5').update(newPrompt + Date.now().toString()).digest('hex');

    const styleNameUsed = styleData ? styleData.name : (styleId ? '지정 화풍' : '이미지 맞춤 화풍');

    const newDesignData = {
      prompt_hash: newHash,
      topic: productInfo.title,
      prompt: newPrompt,
      title: productInfo.title,
      tags: productInfo.tags,
      image_url: newImageUrl,
      created_at: new Date().toISOString(),
      status: 'success',
      reference_image_used: !!base64Data,
      feedback_applied: prompt,
      catchphrase: catchphrase || null,
      style_name: styleNameUsed,
      spelling_verified: verificationInfo ? verificationInfo.isSpellingCorrect : true,
      spelling_has_text: verificationInfo ? Boolean(verificationInfo.hasText) : false,
      spelling_detected_text: verificationInfo ? (verificationInfo.hasText ? verificationInfo.detectedText : '') : '',
      spelling_attempts: totalAttempts,
      spelling_typo_details: verificationInfo ? verificationInfo.typoDetails : '',
    };

    if (!isPreview && process.env.FIREBASE_PROJECT_ID) {
      const designRef = db.collection('designs').doc(newHash);
      await designRef.set(newDesignData);
    }

    return NextResponse.json({ 
      success: true, 
      data: { id: newHash, ...newDesignData } 
    });

  } catch (error: any) {
    console.error('Error generating from image:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
