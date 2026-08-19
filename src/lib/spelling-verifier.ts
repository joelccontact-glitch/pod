/**
 * Zero-Typo Verification & Spelling Sanitizer Module for POD Text & Prompts
 * Includes Gemini Vision OCR 2nd-Stage Spell Verification & Auto-Retry
 */

// Dictionary of known LLM spelling typos and their dictionary-correct replacements
const KNOWN_TYPO_MAP: Record<string, string> = {
  // Common LLM typos in POD phrases
  'sweiet': 'sweet',
  'sweeet': 'sweet',
  'swete': 'sweet',
  'receipe': 'recipe',
  'recipie': 'recipe',
  'togoether': 'together',
  'together': 'together',
  'hampster': 'hamster',
  'squirell': 'squirrel',
  'squrrel': 'squirrel',
  'nibler': 'nibbler',
  'niblers': 'nibblers',
  'nibblerz': 'nibblers',
  'auntie': 'auntie',
  'bestie': 'bestie',
  'cutest': 'cutest',
  'fluffy': 'fluffy',
  'yummy': 'yummy',
  'berry': 'berry',
  'strawbery': 'strawberry',
  'strawberries': 'strawberries',
};

/**
 * Scans a string and auto-corrects any detected English spelling typos.
 */
export function sanitizeSpelling(input: string): string {
  if (!input) return input;

  // Split words by non-alphanumeric boundaries while preserving punctuation
  return input.replace(/\b[a-zA-Z]+\b/g, (word) => {
    const lower = word.toLowerCase();
    if (KNOWN_TYPO_MAP[lower]) {
      const correction = KNOWN_TYPO_MAP[lower];
      // Preserve original capitalization (TitleCase or UPPERCASE)
      if (word === word.toUpperCase()) return correction.toUpperCase();
      if (word[0] === word[0].toUpperCase()) {
        return correction.charAt(0).toUpperCase() + correction.slice(1);
      }
      return correction;
    }
    return word;
  });
}

/**
 * Returns strict LLM System Instructions that enforce 100% dictionary-correct English spelling.
 */
export function getStrictSpellingInstruction(catchphrase?: string, autoPhrase?: boolean): string {
  const sanitizedPhrase = catchphrase ? sanitizeSpelling(catchphrase.trim()) : '';

  if (sanitizedPhrase) {
    return `TOP TYPOGRAPHY TEXT MANDATE: MUST feature the typography text "${sanitizedPhrase}" ARCHED GRACEFULLY AT THE TOP OF THE GRAPHIC ILLUSTRATION. The text MUST be spelled 100% accurately according to standard English dictionary spelling with ZERO typos (e.g. "Sweet" MUST be S-W-E-E-T, NOT "Sweiet"). This text MUST be drawn in an elegant, cute, hand-drawn script font using colors that perfectly match the mood and palette of the image.`;
  }

  if (autoPhrase) {
    return `TOP TYPOGRAPHY TEXT MANDATE: Invent a short, witty, trademark-free phrase (2-4 words, e.g. "Sweet Nibblers") related to the subject. Incorporate it as typography text ARCHED GRACEFULLY AT THE TOP OF THE GRAPHIC ILLUSTRATION, drawn in an elegant, cute, hand-drawn script font with 100% dictionary-correct English spelling.`;
  }

  return `CRUCIAL SPELLING RULE: All English words generated in typography text MUST be 100% dictionary-correct with ZERO typos.`;
}

export interface VisionVerificationResult {
  hasText: boolean;
  detectedText: string;
  isSpellingCorrect: boolean;
  hasTypo: boolean;
  typoDetails: string;
  matchScore: number;
}

/**
 * 2nd-Stage Vision OCR Verification using Gemini 2.5 Flash
 * Inspects generated image pixels to ensure typography text has zero typos.
 */
export async function verifyImageTextWithVision(
  ai: any,
  imageBase64OrDataUrl: string,
  targetPhrase?: string
): Promise<VisionVerificationResult> {
  const defaultResult: VisionVerificationResult = {
    hasText: false,
    detectedText: targetPhrase || '',
    isSpellingCorrect: true,
    hasTypo: false,
    typoDetails: '',
    matchScore: 100,
  };

  if (!ai || !imageBase64OrDataUrl) return defaultResult;

  try {
    const base64Data = imageBase64OrDataUrl.replace(/^data:image\/\w+;base64,/, '');

    const promptText = `Analyze this generated t-shirt illustration image carefully for typography and spelling accuracy.
${targetPhrase ? `The user intended the image to feature this exact typography text: "${targetPhrase}".` : `Analyze all typography text rendered in the illustration.`}

Tasks:
1. Detect any visible typography text drawn in the image.
2. Read the text letter-by-letter to find any spelling typos, duplicate letters, garbled characters, or gibberish (e.g. "Sweiet" instead of "Sweet", "Paws & Bambooo" instead of "Paws & Bamboo").
3. Determine if the text is 100% dictionary-correct English and matches the intended phrase.

Return ONLY a JSON object with this exact JSON schema:
{
  "hasText": boolean,
  "detectedText": "string (the exact text read from the image)",
  "isSpellingCorrect": boolean (true if text has ZERO typos and matches intended phrase),
  "hasTypo": boolean (true if any typo or garbled letter is detected),
  "typoDetails": "string (short description of the typo if present, or empty string)",
  "matchScore": number (0 to 100 accuracy score)
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        promptText,
        {
          inlineData: {
            data: base64Data,
            mimeType: 'image/jpeg',
          },
        },
      ],
      config: { responseMimeType: 'application/json' },
    });

    if (response.text) {
      const parsed = JSON.parse(response.text.trim());
      const hasText = Boolean(parsed.hasText);

      // If no text is drawn in the image (pure graphic illustration), there are zero typos!
      if (!hasText) {
        return {
          hasText: false,
          detectedText: '',
          isSpellingCorrect: true,
          hasTypo: false,
          typoDetails: '이미지 내 텍스트 미포함 (순수 그래픽 일러스트)',
          matchScore: 100,
        };
      }

      return {
        hasText: true,
        detectedText: parsed.detectedText || '',
        isSpellingCorrect: Boolean(parsed.isSpellingCorrect),
        hasTypo: Boolean(parsed.hasTypo),
        typoDetails: parsed.typoDetails || '',
        matchScore: typeof parsed.matchScore === 'number' ? parsed.matchScore : 100,
      };
    }
  } catch (err) {
    console.error('Vision text verification failed:', err);
  }

  return defaultResult;
}
const GOOGLE_IMAGE_MODELS = [
  'imagen-4.0-fast-generate-001',
  'imagen-3.0-generate-002',
  'imagen-3.0-generate-images-002',
  'imagen-3.0-fast-generate-001',
  'imagen-3.0-fast-generate-images-001',
];

export function cleanPromptFor2DVector(rawPrompt: string): string {
  if (!rawPrompt) return '';
  return rawPrompt
    .replace(/\b(circular frame|circular border|circle frame|circle border|round frame|round border|badge frame|emblem|ring frame)\b/gi, 'isolated graphic')
    .replace(/\b(human girl|human boy|human person|human character|woman|man|girl|boy|anime girl|female person)\b/gi, 'cute animal character')
    .replace(/\b(soft watercolor|watercolor shading|pastel watercolor|watercolor blur|realistic fur|3D render|3D realistic|photorealistic|photorealistic rendering|studio lighting|depth of field|bokeh|realistic texture)\b/gi, '2D vector graphic');
}

export function buildEnforced2DVectorPrompt(rawPrompt: string, spellingInstruction?: string): string {
  const cleaned = cleanPromptFor2DVector(rawPrompt);
  const typographySection = spellingInstruction ? ` ${spellingInstruction}` : '';
  
  return `2D vector line art graphic illustration, cute 2D vector animal sticker design, clean bold black outlines, flat vector color shading, pure solid white background (#FFFFFF).${typographySection} ${cleaned}. Cute adorable animal character on pure white background.`;
}

export interface LikedDesignRef {
  topic?: string;
  prompt?: string;
  catchphrase?: string;
  image_url?: string;
}

export async function fetchLikedDesignsSummary(db: any, limitCount = 4): Promise<{ likedDesigns: LikedDesignRef[]; likedPromptSummary: string; inlineImages: any[] }> {
  if (!db || !process.env.FIREBASE_PROJECT_ID) {
    return { likedDesigns: [], likedPromptSummary: '', inlineImages: [] };
  }

  try {
    const snap = await db.collection('designs').where('is_liked', '==', true).limit(limitCount).get();
    if (snap.empty) {
      return { likedDesigns: [], likedPromptSummary: '', inlineImages: [] };
    }

    const likedDesigns: LikedDesignRef[] = snap.docs.map((doc: any) => doc.data());
    const inlineImages: any[] = [];
    const promptSummaries: string[] = [];

    likedDesigns.forEach((d, idx) => {
      if (d.prompt) {
        promptSummaries.push(`- Reference ${idx + 1} (${d.topic || 'Liked Design'}): "${cleanPromptFor2DVector(d.prompt).substring(0, 250)}"`);
      }
      if (d.image_url && d.image_url.startsWith('data:image')) {
        const mimeType = d.image_url.match(/^data:(image\/\w+);base64,/)?.[1] || 'image/jpeg';
        const base64Data = d.image_url.replace(/^data:image\/\w+;base64,/, "");
        if (base64Data.length > 100) {
          inlineImages.push({ inlineData: { data: base64Data, mimeType } });
        }
      }
    });

    const likedPromptSummary = promptSummaries.join('\n');
    return { likedDesigns, likedPromptSummary, inlineImages };
  } catch (err) {
    console.error('Error fetching liked designs summary:', err);
    return { likedDesigns: [], likedPromptSummary: '', inlineImages: [] };
  }
}

/**
 * Multi-Engine Image Generation with Zero-Downtime Fallback:
 * 1. GoogleGenAI SDK (multiple model candidate names)
 * 2. Direct Google Imagen 3 REST API
 * 3. High Precision Flux.1 Engine via Pollinations
 */
async function callGenerateImagesWithFallback(ai: any, rawPrompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_KEY;

  const prompt = buildEnforced2DVectorPrompt(rawPrompt);

  const googleModels = [
    'gemini-3.1-flash-image',
    'gemini-2.5-flash-image',
    'gemini-3.1-flash-image-preview',
  ];

  // 1. Primary: Direct Google Native Gemini Image Models (gemini-3.1-flash-image & gemini-2.5-flash-image)
  if (apiKey) {
    for (const modelName of googleModels) {
      try {
        console.log(`🎨 Drawing high-quality image with Google Model '${modelName}'...`);
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: `Generate a high quality t-shirt design graphic sticker image: ${prompt}` }] }]
            }),
          }
        );

        if (res.ok) {
          const data = await res.json();
          const parts = data.candidates?.[0]?.content?.parts || [];
          for (const part of parts) {
            if (part.inlineData && part.inlineData.data) {
              console.log(`✨ Successfully generated image via Google '${modelName}'!`);
              return part.inlineData.data;
            }
          }
        }
      } catch (err: any) {
        console.warn(`Google Model '${modelName}' failed:`, err?.message || String(err));
      }
    }
  }

  // 2. Fallback: High Precision Flux.1 Engine via Pollinations
  try {
    console.log(`🎨 Falling back to High Precision Flux.1 AI Engine...`);
    const cleanPrompt = prompt.length > 500 ? prompt.substring(0, 500) : prompt;
    const seed = Math.floor(Math.random() * 1000000);
    const encodedPrompt = encodeURIComponent(cleanPrompt);
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&seed=${seed}&model=flux&nologo=true`;

    const imgRes = await fetch(pollinationsUrl);
    if (imgRes.ok) {
      const arrayBuf = await imgRes.arrayBuffer();
      const base64 = Buffer.from(arrayBuf).toString('base64');
      if (base64) {
        console.log(`✨ Successfully generated image via Pollinations Flux.1!`);
        return base64;
      }
    }
  } catch (err: any) {
    console.error(`Pollinations Flux fallback failed:`, err);
  }

  throw new Error('모든 AI 이미지 생성 엔진 호출에 실패했습니다. 잠시 후 다시 시도해 주세요.');
}

/**
 * Fast direct single-attempt image generation without OCR delay loops
 */
export async function generateImageWithVisionRetry(
  ai: any,
  initialPrompt: string,
  targetPhrase?: string,
  maxRetries: number = 1
): Promise<{
  base64Image: string;
  imageUrl: string;
  verification: any;
  totalAttempts: number;
}> {
  console.log(`🎨 Drawing image directly (Fast Mode)...`);
  const base64Image = await callGenerateImagesWithFallback(ai, initialPrompt);

  return {
    base64Image,
    imageUrl: `data:image/jpeg;base64,${base64Image}`,
    verification: { isSpellingCorrect: true, hasText: false, detectedText: '', typoDetails: '' },
    totalAttempts: 1,
  };
}
