import { GoogleGenAI } from '@google/genai';
import { db } from '@/lib/firebase-admin';
import crypto from 'crypto';
import { NextResponse } from 'next/server';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function GET(req: Request) {
  try {
    console.log("🚀 Running automated style trend agent...");

    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured.");
    }

    // 1. Trend Research for a new style
    const trendResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Identify a highly popular, trending art or design style currently popular on platforms like Etsy or Pinterest (e.g., Cottagecore Watercolor, Y2K Retro Pixel Art, Minimalist Line Art). 
Return a JSON object with:
- "styleName": A very short, catchy name for this style (max 4 words).
- "promptDescription": A detailed prompt description for an image generator to create an icon or simple illustration perfectly demonstrating this style.`,
      config: { responseMimeType: 'application/json' }
    });

    const trendText = trendResponse.text;
    if (!trendText) throw new Error("Failed to get trend from Gemini.");
    
    const trendData = JSON.parse(trendText);
    const styleName = `[Trend] ${trendData.styleName}`;
    const promptDescription = trendData.promptDescription;

    console.log(`🎨 Identified Style: ${styleName}`);

    // 2. Generate Sample Image using Imagen
    let imageUrl = "";
    let base64Data = "";
    try {
      console.log(`🖼️ Generating sample image...`);
      const imgResponse = await ai.models.generateImages({
        model: 'imagen-4.0-fast-generate-001',
        prompt: `A beautiful icon or simple illustration. strictly following this style: ${promptDescription}. Clean white background.`,
        config: { numberOfImages: 1, aspectRatio: '1:1', outputMimeType: 'image/jpeg' }
      });
      
      const base64Image = imgResponse.generatedImages?.[0]?.image?.imageBytes;
      if (base64Image) {
        base64Data = base64Image;
        imageUrl = `data:image/jpeg;base64,${base64Image}`;
      } else {
        throw new Error("No image generated.");
      }
    } catch (imgError) {
      console.error("Imagen generation failed:", imgError);
      throw new Error("Failed to generate sample image.");
    }

    // 3. Extract exact style prompt using Gemini
    let stylePrompt = promptDescription;
    try {
      console.log(`🧠 Extracting style prompt...`);
      const promptResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          `Analyze this reference image. Extract ONLY the artistic style, coloring technique, linework, mood, texture, and medium. Do NOT include the specific subject matter. Output ONLY the comma-separated style tags and a concise sentence describing the art style, designed to be used as a style suffix for an image generator prompt.`,
          {
            inlineData: {
              data: base64Data,
              mimeType: 'image/jpeg'
            }
          }
        ]
      });
      stylePrompt = promptResponse.text?.trim() || stylePrompt;
    } catch (extractError) {
      console.error("Style extraction failed, using fallback.", extractError);
    }

    // 4. Save to Firebase
    const styleId = crypto.createHash('md5').update(styleName + Date.now().toString()).digest('hex');
    const styleDocData = {
      id: styleId,
      name: styleName,
      style_prompt: stylePrompt,
      image_url: imageUrl,
      created_at: new Date().toISOString()
    };

    if (process.env.FIREBASE_PROJECT_ID) {
      const styleRef = db.collection('styles').doc(styleId);
      await styleRef.set(styleDocData);
      console.log(`✅ Saved new style: ${styleId}`);

      // 5. Enforce Maximum limit of 20 styles
      const stylesSnapshot = await db.collection('styles').orderBy('created_at', 'asc').get();
      const totalStyles = stylesSnapshot.size;
      
      if (totalStyles > 20) {
        const deleteCount = totalStyles - 20;
        console.log(`🧹 Cleaning up ${deleteCount} old styles to maintain max limit of 20...`);
        const batch = db.batch();
        
        // The first 'deleteCount' documents are the oldest because of orderBy('created_at', 'asc')
        let count = 0;
        stylesSnapshot.forEach((doc) => {
          if (count < deleteCount) {
            batch.delete(doc.ref);
            count++;
          }
        });
        
        await batch.commit();
        console.log(`✅ Cleanup complete.`);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Trend style generated and registered successfully.', 
      data: styleDocData 
    });

  } catch (error: any) {
    console.error('❌ Error in run-agent/styles:', error);
    
    if (process.env.FIREBASE_PROJECT_ID) {
      await db.collection('errors').add({
        error_message: error.message,
        stack: error.stack,
        context: 'run-agent/styles',
        created_at: new Date().toISOString()
      });
    }

    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
