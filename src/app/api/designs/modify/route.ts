import { GoogleGenAI } from '@google/genai';
import { db } from '@/lib/firebase-admin';
import crypto from 'crypto';
import { NextResponse } from 'next/server';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const { originalId, feedback, topic, originalPrompt } = await req.json();

    if (!feedback || !topic) {
      return NextResponse.json({ success: false, error: 'Feedback and topic are required' }, { status: 400 });
    }

    let newPrompt = originalPrompt;
    let productInfo = { title: `[MOCK Modified] ${topic} T-Shirt`, tags: ["mock", "modified"] };

    if (process.env.GEMINI_API_KEY) {
      // 1. Generate new prompt based on feedback
      const promptResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `I have a t-shirt design with the original prompt: "${originalPrompt}". The user provided the following feedback to modify it: "${feedback}". Generate a new, modified prompt for an image generator (like vector art, t-shirt design, clean white background). Return ONLY the new prompt string.`,
      });
      newPrompt = promptResponse.text?.trim() || originalPrompt;

      // 2. Generate new SEO Content
      const textResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Please create an Etsy t-shirt product title and 13 SEO tags for the theme '${topic}' considering this modification: '${feedback}'. Format as JSON with keys 'title' and 'tags'.`,
        config: { responseMimeType: 'application/json' }
      });
      const productInfoText = textResponse.text;
      productInfo = productInfoText ? JSON.parse(productInfoText) : productInfo;
    }

    let newImageUrl = `https://placehold.co/800x800/eff6ff/1d4ed8?text=${encodeURIComponent(topic.split(' ').slice(0, 3).join(' ')+ '\\n(Modified Preview)')}`;
    if (process.env.GEMINI_API_KEY) {
      try {
        console.log(`🎨 Drawing modified image with Imagen 4.0...`);
        const imgResponse = await ai.models.generateImages({
          model: 'imagen-4.0-fast-generate-001',
          prompt: newPrompt,
          config: { numberOfImages: 1, aspectRatio: '1:1', outputMimeType: 'image/jpeg' }
        });
        const base64Image = imgResponse.generatedImages[0].image.imageBytes;
        newImageUrl = `data:image/jpeg;base64,${base64Image}`;
      } catch (imgError) {
        console.error("Imagen generation failed:", imgError);
      }
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
      feedback_applied: feedback
    };

    if (process.env.FIREBASE_PROJECT_ID) {
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
