/**
 * Zero-Typo Verification & Spelling Sanitizer Module for POD Text & Prompts
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
