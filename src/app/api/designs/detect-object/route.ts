import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const { imageBase64, itemName } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ success: false, error: 'imageBase64 is required' }, { status: 400 });
    }

    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    const promptText = `You are an expert computer vision object detector.
Analyze this sticker image of a glass vessel, terrarium, vivarium, or aquarium tank.
The image contains a glass container/frame and an inner creature or item (${itemName || 'creature or item'}).
Your task is to detect the tight bounding box of ONLY the main inner subject/creature/item (e.g. the animal, fish, pie, mug, frog, lizard, plant).
DO NOT include the outer glass walls, jar lid, wooden base, stone gravel at the very bottom, or the white background border.
Return ONLY a valid JSON object in this format:
{
  "box": [ymin, xmin, ymax, xmax]
}
Coordinates must be normalized integers from 0 to 1000 (representing top-left and bottom-right percentages * 10).`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        promptText,
        {
          inlineData: {
            data: base64Data,
            mimeType: 'image/jpeg'
          }
        }
      ],
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text?.trim() || '{}';
    let parsed: any = {};
    try {
      parsed = JSON.parse(text);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        parsed = JSON.parse(match[0]);
      }
    }

    let box = parsed.box || parsed.box_2d || parsed.bounding_box;

    // Validate box format [ymin, xmin, ymax, xmax]
    if (!Array.isArray(box) || box.length !== 4) {
      // Default to center 60% crop if detection failed
      box = [200, 200, 800, 800];
    } else {
      // Ensure values are within 0~1000
      box = box.map((v: any) => Math.max(0, Math.min(1000, Number(v) || 0)));
      // Ensure min < max
      if (box[0] >= box[2]) { box[0] = 200; box[2] = 800; }
      if (box[1] >= box[3]) { box[1] = 200; box[3] = 800; }
    }

    return NextResponse.json({
      success: true,
      box
    });
  } catch (e: any) {
    console.error('Error detecting object bounding box:', e);
    // Fallback to center crop on any error
    return NextResponse.json({
      success: true,
      box: [200, 200, 800, 800],
      fallback: true
    });
  }
}
