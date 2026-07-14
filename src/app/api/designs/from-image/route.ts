import { GoogleGenAI } from '@google/genai';
import { db } from '@/lib/firebase-admin';
import crypto from 'crypto';
import { NextResponse } from 'next/server';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const { imageBase64, prompt, isPreview, styleId } = await req.json();

    if (!imageBase64 || !prompt) {
      return NextResponse.json({ success: false, error: 'Image and prompt are required' }, { status: 400 });
    }

    // Strip data URL prefix if present
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    let newPrompt = prompt;
    let productInfo = { title: `[MOCK] Image derived T-Shirt`, tags: ["mock", "derived"] };

    if (process.env.GEMINI_API_KEY) {
      let styleData = null;
      if (styleId && process.env.FIREBASE_PROJECT_ID) {
        const styleDoc = await db.collection('styles').doc(styleId).get();
        if (styleDoc.exists) {
          styleData = styleDoc.data();
        }
      }

      let contentsArray: any[] = [];
      if (styleData) {
        console.log(`🎨 Applying style: ${styleData.name} to Image-to-Image`);
        contentsArray = [
          `You are an expert prompt engineer. The user wants to create a new t-shirt design based on the FIRST image (concept), with the instruction: "${prompt}". IMPORTANT: Match the exact artistic style, coloring, texture, and mood of the SECOND image (style reference), as well as these style instructions: "${styleData.style_prompt}". Generate a highly detailed prompt for an image generator (like vector art, clean background, t-shirt design style) that captures the essence of the first image but completely applies the style of the second image. Return ONLY the new prompt string.`,
          { inlineData: { data: base64Data, mimeType: 'image/jpeg' } },
          { inlineData: { data: styleData.image_url.replace(/^data:image\/\w+;base64,/, ""), mimeType: 'image/jpeg' } }
        ];
      } else {
        contentsArray = [
          `Analyze this reference image. The user wants to create a new t-shirt design based on this, with the following instruction: "${prompt}". Generate a highly detailed prompt for an image generator (like vector art, clean background, t-shirt design style) that captures the essence of the reference image but applies the user's instruction. Return ONLY the new prompt string.`,
          { inlineData: { data: base64Data, mimeType: 'image/jpeg' } }
        ];
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

    let newImageUrl = `https://placehold.co/800x800/eff6ff/1d4ed8?text=Image+Derived+Preview`;
    if (process.env.GEMINI_API_KEY) {
      try {
        console.log(`🎨 Drawing derived image with Imagen 4.0...`);
        const imgResponse = await ai.models.generateImages({
          model: 'imagen-4.0-fast-generate-001',
          prompt: newPrompt,
          config: { numberOfImages: 1, aspectRatio: '1:1', outputMimeType: 'image/jpeg' }
        });
        const generatedBase64Image = imgResponse.generatedImages?.[0]?.image?.imageBytes;
        if (generatedBase64Image) {
          newImageUrl = `data:image/jpeg;base64,${generatedBase64Image}`;
        }
      } catch (imgError) {
        console.error("Imagen generation failed:", imgError);
      }
    }
    
    const newHash = crypto.createHash('md5').update(newPrompt + Date.now().toString()).digest('hex');

    const newDesignData = {
      prompt_hash: newHash,
      topic: productInfo.title,
      prompt: newPrompt,
      title: productInfo.title,
      tags: productInfo.tags,
      image_url: newImageUrl,
      created_at: new Date().toISOString(),
      status: 'success',
      reference_image_used: true,
      feedback_applied: prompt
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
