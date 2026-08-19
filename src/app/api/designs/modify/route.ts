import { GoogleGenAI } from '@google/genai';
import { db } from '@/lib/firebase-admin';
import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { sanitizeSpelling, getStrictSpellingInstruction, generateImageWithVisionRetry, buildEnforced2DVectorPrompt, fetchLikedDesignsSummary } from '@/lib/spelling-verifier';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const { originalId, feedback: rawFeedback, topic, originalPrompt, isPreview, catchphrase: rawCatchphrase, autoPhrase } = await req.json();

    if ((!rawFeedback && !rawCatchphrase && !autoPhrase) || !topic) {
      return NextResponse.json({ success: false, error: 'Feedback or catchphrase is required' }, { status: 400 });
    }

    const feedback = rawFeedback ? sanitizeSpelling(rawFeedback) : '';
    const catchphrase = rawCatchphrase ? sanitizeSpelling(rawCatchphrase) : null;
    const spellingInstruction = getStrictSpellingInstruction(catchphrase || undefined, autoPhrase);

    let newPrompt = sanitizeSpelling(originalPrompt);
    let productInfo = { title: `[MOCK Modified] ${topic} T-Shirt`, tags: ["mock", "modified"] };

    if (process.env.GEMINI_API_KEY) {
      const { likedDesigns, likedPromptSummary } = await fetchLikedDesignsSummary(db, 3);
      const likedInstruction = likedDesigns.length > 0 ? `\nCRITICAL #1 MASTER BENCHMARK: The user LIKED (HEARTED) these favorite designs. Ensure the modified prompt maintains their favorite aesthetic:\n${likedPromptSummary}\n` : '';

      // 1. Generate new prompt based on feedback
      const promptResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `I have a t-shirt design concept with the original prompt: "${originalPrompt}". ${feedback ? `The user provided the following feedback to modify it: "${feedback}". ` : ''}${spellingInstruction}${likedInstruction} Generate a new, modified prompt for an image generator (vector art, graphic illustration, pure solid white background (#FFFFFF), NO scenery). CRITICAL INSTRUCTION: You must append this strict rule to the prompt: The image MUST be a SINGLE isolated graphic illustration centered on a pure solid white background (#FFFFFF). NEVER draw actual t-shirt garments, clothing mockups, grid layouts, or multiple t-shirts. NEVER generate any background colors, gradients, or scenery. Return ONLY the new prompt string.`,
      });
      newPrompt = sanitizeSpelling(promptResponse.text?.trim() || originalPrompt);


      // 2. Generate new SEO Content
      const textResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Please create an Etsy t-shirt product title and 13 SEO tags for the theme '${topic}' considering this modification: '${feedback}'. Format as JSON with keys 'title' and 'tags'.`,
        config: { responseMimeType: 'application/json' }
      });
      const productInfoText = textResponse.text;
      productInfo = productInfoText ? JSON.parse(productInfoText) : productInfo;
      newPrompt = buildEnforced2DVectorPrompt(newPrompt, spellingInstruction);
    }

    let newImageUrl = '';
    let verificationInfo: any = null;
    let totalAttempts = 1;

    if (process.env.GEMINI_API_KEY) {
      try {
        console.log(`🎨 Drawing modified image with Imagen 4.0 & Gemini Vision OCR Verification...`);
        const result = await generateImageWithVisionRetry(ai, newPrompt, catchphrase || undefined, 2);
        newImageUrl = result.imageUrl;
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
    } else {
      newImageUrl = `https://placehold.co/800x800/eff6ff/1d4ed8?text=${encodeURIComponent(topic.split(' ').slice(0, 3).join(' ')+ '\\n(Modified Preview)')}`;
    }
    const newHash = crypto.createHash('md5').update(newPrompt + Date.now().toString()).digest('hex');

    const newDesignData = {
      prompt_hash: newHash,
      topic: topic,
      prompt: newPrompt,
      title: productInfo.title,
      tags: productInfo.tags,
      image_url: newImageUrl,
      created_at: new Date().toISOString(),
      status: 'success',
      modified_from: originalId || null,
      feedback_applied: feedback,
      catchphrase: catchphrase || null,
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
    console.error('Error modifying design:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
