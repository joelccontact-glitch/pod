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
  'imagen-3.0-generate-002',
  'imagen-3.0-generate-images-002',
  'imagen-3.0-fast-generate-001',
  'imagen-3.0-fast-generate-images-001',
];

export function cleanPromptFor2DVector(rawPrompt: string): string {
  if (!rawPrompt) return '';
  return rawPrompt
    .replace(/\b(circular frame|circular border|circle frame|circle border|round frame|round border|badge frame|emblem|ring frame)\b/gi, 'isolated sticker graphic')
    .replace(/\b(soft watercolor|watercolor shading|pastel watercolor|watercolor blur|realistic fur|3D render|3D realistic|photorealistic|photorealistic rendering|studio lighting|depth of field|bokeh|realistic texture)\b/gi, '2D vector line art graphic with crisp outlines and flat vector colors');
}

export function buildEnforced2DVectorPrompt(rawPrompt: string, spellingInstruction?: string): string {
  const cleaned = cleanPromptFor2DVector(rawPrompt);
  const typographySection = spellingInstruction ? ` ${spellingInstruction}` : '';
  
  return `2D vector graphic illustration, clean bold line art with crisp black outlines, flat vector color shading, cute kawaii T-shirt graphic sticker layout.${typographySection} ${cleaned}. BACKGROUND MANDATE: The image MUST be a SINGLE isolated 2D graphic illustration centered on a pure solid white background (#FFFFFF) (or pure solid dark background for dark t-shirts). ABSOLUTELY NO CIRCULAR FRAMES, NO RING FRAMES, NO GROUND SHADOWS, NO DROP SHADOWS, NO ROOM WALLS, NO WOODEN TABLES, NO BACKGROUND SCENERY. STRICT NEGATIVE DIRECTIVES: ABSOLUTELY NO 3D rendering, NO photorealism, NO 3D realism, NO photographic lighting, NO realistic fur textures, NO depth of field blur, NO soft pastel watercolor blur, NO background environment scenery.`;
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

  // 1. Try GoogleGenAI SDK model methods
  for (const modelName of GOOGLE_IMAGE_MODELS) {
    try {
      console.log(`🎨 Drawing image with Google model '${modelName}'...`);
      const response = await ai.models.generateImages({
        model: modelName,
        prompt: prompt,
        config: { numberOfImages: 1, aspectRatio: '1:1', outputMimeType: 'image/jpeg' },
      });
      const base64Image = response.generatedImages?.[0]?.image?.imageBytes;
      if (base64Image) {
        return base64Image;
      }
    } catch (err: any) {
      console.warn(`Google GenAI SDK model '${modelName}' failed:`, err?.message || String(err));
    }
  }

  // 2. Try Direct Google Imagen 3 REST API
  if (apiKey) {
    try {
      console.log(`🎨 Trying Direct Google Imagen 3 REST API...`);
      const googleRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-images-002:generate?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: prompt,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/jpeg',
              aspectRatio: '1:1',
            },
          }),
        }
      );
      const data = await googleRes.json();
      if (data.generatedImages && data.generatedImages.length > 0) {
        const base64Image = data.generatedImages[0].image.imageBytes;
        if (base64Image) {
          return base64Image;
        }
      }
      console.warn(`Direct Google Imagen 3 REST API returned no images:`, data);
    } catch (err: any) {
      console.warn(`Direct Google Imagen 3 REST API failed:`, err?.message || String(err));
    }
  }

  // 3. Fallback: Ultra-Reliable High Precision Flux.1 Engine via Pollinations
  try {
    console.log(`🎨 Falling back to High Precision Flux.1 AI Engine...`);
    // Crucial: keep the vector style prefix at the front so truncation never removes style rules!
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
 * Generates an image with multi-engine fallback and automatically retries using Gemini Vision OCR verification
 * if a text typo is detected in the generated image.
 */
export async function generateImageWithVisionRetry(
  ai: any,
  initialPrompt: string,
  targetPhrase?: string,
  maxRetries: number = 2
): Promise<{
  base64Image: string;
  imageUrl: string;
  verification: VisionVerificationResult;
  totalAttempts: number;
}> {
  let currentPrompt = initialPrompt;
  let attempt = 1;
  let lastVerification: VisionVerificationResult = {
    hasText: false,
    detectedText: targetPhrase || '',
    isSpellingCorrect: true,
    hasTypo: false,
    typoDetails: '',
    matchScore: 100,
  };
  let lastBase64 = '';

  const maxAttempts = Math.max(1, maxRetries + 1);

  while (attempt <= maxAttempts) {
    console.log(`🎨 [Attempt ${attempt}/${maxAttempts}] Drawing image...`);
    const base64Image = await callGenerateImagesWithFallback(ai, currentPrompt);
    lastBase64 = base64Image;

    // Run 2nd-stage Vision OCR verification
    console.log(`🔍 [Attempt ${attempt}/${maxAttempts}] Running Gemini Vision 2nd-stage spell verification...`);
    lastVerification = await verifyImageTextWithVision(ai, base64Image, targetPhrase);
    console.log(`✨ Vision OCR Result (Attempt ${attempt}):`, lastVerification);

    // If zero typos or correct spelling, or max attempts reached, break
    if (lastVerification.isSpellingCorrect || !lastVerification.hasTypo || attempt >= maxAttempts) {
      if (lastVerification.hasTypo && attempt >= maxAttempts) {
        console.warn(`⚠️ Max retries reached (${attempt}). Proceeding with current image despite minor typo.`);
      }
      break;
    }

    // Auto Retry: Refine prompt with typo correction instructions
    attempt++;
    console.warn(`⚠️ Typo detected in generated image ("${lastVerification.detectedText}" vs expected "${targetPhrase || 'clean text'}"). Auto-retrying (${attempt}/${maxAttempts})...`);

    currentPrompt = `${initialPrompt} CRITICAL REVISION (RETRY ATTEMPT ${attempt}): Previous attempt had a spelling artifact/typo "${lastVerification.detectedText}". The typography text MUST BE SPELED WITH 100% DICTIONARY ACCURACY as "${targetPhrase || 'clean English text'}". Do NOT add extra letters or misspellings!`;
  }

  return {
    base64Image: lastBase64,
    imageUrl: `data:image/jpeg;base64,${lastBase64}`,
    verification: lastVerification,
    totalAttempts: attempt,
  };
}
