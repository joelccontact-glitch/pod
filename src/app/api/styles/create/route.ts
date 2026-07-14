import { GoogleGenAI } from '@google/genai';
import { db } from '@/lib/firebase-admin';
import crypto from 'crypto';
import { NextResponse } from 'next/server';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const { imageBase64, styleName } = await req.json();

    if (!imageBase64 || !styleName) {
      return NextResponse.json({ success: false, error: 'Image and styleName are required' }, { status: 400 });
    }

    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    let stylePrompt = "A standard vector illustration style";

    if (process.env.GEMINI_API_KEY) {
      const promptResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          `Analyze this reference image. Extract ONLY the artistic style, coloring technique, linework, mood, texture, and medium (e.g., watercolor, minimalist vector, vintage poster, 3d render, etc.). Do NOT include the specific subject matter (e.g., if it's a dog, do not mention a dog). Output ONLY the comma-separated style tags and a concise sentence describing the art style, designed to be used as a style suffix for an image generator prompt.`,
          {
            inlineData: {
              data: base64Data,
              mimeType: 'image/jpeg'
            }
          }
        ]
      });
      stylePrompt = promptResponse.text?.trim() || stylePrompt;
    }

    const styleId = crypto.createHash('md5').update(styleName + Date.now().toString()).digest('hex');

    const styleData = {
      id: styleId,
      name: styleName,
      style_prompt: stylePrompt,
      image_url: imageBase64,
      created_at: new Date().toISOString()
    };

    if (process.env.FIREBASE_PROJECT_ID) {
      const styleRef = db.collection('styles').doc(styleId);
      await styleRef.set(styleData);
    }

    return NextResponse.json({ success: true, data: styleData });
  } catch (error: any) {
    console.error('Error creating style:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
