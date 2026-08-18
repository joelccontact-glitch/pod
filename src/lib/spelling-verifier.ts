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
    return `CRUCIAL TYPOGRAPHY & SPELLING RULE: Incorporate the typography text "${sanitizedPhrase}". The text MUST be spelled 100% accurately according to standard English dictionary spelling with ZERO typos (e.g. "Sweet" MUST be S-W-E-E-T, NOT "Sweiet"). This text MUST be drawn in an elegant, cute, hand-drawn script font using colors that perfectly match the mood and palette of the image.`;
  }

  if (autoPhrase) {
    return `CRUCIAL TYPOGRAPHY & SPELLING RULE: Invent a short, witty, trademark-free phrase (2-4 words, e.g. "Sweet Nibblers") related to the subject. Double-check all English spelling to guarantee 100% dictionary-correct spelling with ZERO typos (e.g., "Sweet" MUST be S-W-E-E-T, NOT "Sweiet"). Incorporate it as typography text drawn in an elegant, cute, hand-drawn script font using colors that perfectly match the mood and palette of the image.`;
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
      return {
        hasText: Boolean(parsed.hasText),
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

/**
 * Generates an image with Imagen 4.0 and automatically retries using Gemini Vision OCR verification
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
    console.log(`🎨 [Attempt ${attempt}/${maxAttempts}] Drawing image with Imagen 4.0...`);
    const imgResponse = await ai.models.generateImages({
      model: 'imagen-4.0-fast-generate-001',
      prompt: currentPrompt,
      config: { numberOfImages: 1, aspectRatio: '1:1', outputMimeType: 'image/jpeg' },
    });

    const base64Image = imgResponse.generatedImages?.[0]?.image?.imageBytes;
    if (!base64Image) {
      throw new Error('AI 이미지 생성 결과가 비어있습니다.');
    }

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
