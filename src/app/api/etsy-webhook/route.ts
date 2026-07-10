import { GoogleGenAI } from '@google/genai';
import { db } from '@/lib/firebase-admin';
import { NextResponse } from 'next/server';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    // 1. Collect Order Data from Etsy Webhook
    const body = await req.json();
    const { order_id, product_id, personalization_text } = body; 
    
    // Use fallback name if not provided
    const petName = personalization_text || "My Pet"; 
    console.log(`📦 New custom order received for: ${petName}`);

    // 2. Log Order Status in Firebase (with fallback)
    if (!order_id) {
        return NextResponse.json({ error: 'order_id is required' }, { status: 400 });
    }

    let orderRef;
    if (process.env.FIREBASE_PROJECT_ID) {
      orderRef = db.collection('orders').doc(order_id.toString());
      await orderRef.set({
        pet_name: petName,
        product_id: product_id || 'unknown',
        status: 'received',
        created_at: new Date().toISOString()
      });
    }

    // 3. Generate Personalized Thank You Message using Gemini (with fallback)
    let thankYouMessage = '';
    if (process.env.GEMINI_API_KEY) {
      const textResponse = await ai.models.generateContent({
        model: 'gemini-3.1-pro',
        contents: `Write a warm, friendly, and emotional purchase thank you message in English for a customer who bought a custom product for their pet named '${petName}'.`,
      });
      thankYouMessage = textResponse.text || '';
    } else {
      thankYouMessage = `[MOCK] Thank you so much for your order! We are starting to work on the custom design for ${petName} right away.`;
    }

    // 4. Update Order Status
    if (orderRef) {
      await orderRef.update({
        status: 'processed',
        thank_you_message: thankYouMessage
      });
    }

    // In a full implementation, you would trigger the image generation 
    // with the pet's name here and send the final asset to Printify.

    return NextResponse.json({ success: true, message: 'Custom order processed successfully.', petName, thankYouMessage });

  } catch (error: any) {
    console.error('❌ Error processing order webhook:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
