/**
 * Seasonal Trend Calendar & Trending Style Engine for POD Designs
 * Enforces the 3-Month Lead-Time Rule (도래 3달 전~도래일까지 집중 반영)
 */

export interface SeasonalHoliday {
  id: string;
  name: string;
  koreanName: string;
  month: number; // 1-12
  day: number;   // 1-31 (or standard base day)
  icon: string;
  trendingMotifs: string[];
  seasonalProps: string[];
  catchphrases: string[];
  styleKeywords: string[];
}

export const SEASONAL_HOLIDAYS: SeasonalHoliday[] = [
  {
    id: 'halloween',
    name: 'Halloween',
    koreanName: '할로윈',
    month: 10,
    day: 31,
    icon: '🎃',
    trendingMotifs: ['spooky cute ghost', 'pumpkin patch', 'candy corn', 'witch hat', 'black cat pillow', 'bat wings'],
    seasonalProps: ['carved jack-o-lantern', 'trick-or-treat bucket', 'pumpkin spice latte', 'mini pumpkin'],
    catchphrases: ['Spooky & Cute', 'Creep It Real', 'Too Cute to Spook', 'Boo-tiful Paws', 'Pumpkin Patch Pal'],
    styleKeywords: ['Pastel Spooky Kawaii', 'Retro Vintage Halloween Line Art', 'Cozy Autumn Gothic Watercolor', 'Chibi Ghost Vector']
  },
  {
    id: 'thanksgiving',
    name: 'Thanksgiving & Fall Harvest',
    koreanName: '추수감사절 & 가을 수확',
    month: 11,
    day: 26, // 4th Thursday of Nov approx
    icon: '🦃',
    trendingMotifs: ['fall leaves', 'acorns', 'pumpkin spice', 'harvest wreath', 'cozy autumn scarf', 'pecan pie'],
    seasonalProps: ['golden maple leaf', 'cinnamon stick', 'knit blanket', 'pumpkin pie slice'],
    catchphrases: ['Grateful & Cute', 'Gather & Feast', 'Give Thanks', 'Cozy Harvest Vibez', 'Stuffed & Happy'],
    styleKeywords: ['Cozy Earth-Toned Autumn Watercolor', 'Cottagecore Harvest Folk Art', 'Warm Retro Fall Vector']
  },
  {
    id: 'christmas',
    name: 'Christmas & Winter Holiday',
    koreanName: '크리스마스 & 겨울 연말',
    month: 12,
    day: 25,
    icon: '🎄',
    trendingMotifs: ['santa hat', 'gingerbread cookie', 'holly berries', 'snowflakes', 'cozy Christmas sweater', 'gift box'],
    seasonalProps: ['wrapped gift with ribbon', 'hot cocoa with marshmallows', 'candy cane', 'pinecone branch'],
    catchphrases: ['Santa Paws', 'Merry & Fluffy', 'Joy to the Paws', 'Cozy & Bright', 'Jingle All the Way'],
    styleKeywords: ['Retro Vintage Christmas Script', 'Nordic Winter Cottagecore', 'Chibi Festive Holiday Vector']
  },
  {
    id: 'newyear',
    name: "New Year's Day",
    koreanName: '새해 첫날',
    month: 1,
    day: 1,
    icon: '🎆',
    trendingMotifs: ['sparklers', 'confetti', 'party hat', 'clock striking midnight', 'celebration balloons'],
    seasonalProps: ['glowing sparkler wand', 'festive party noise maker', 'golden star balloon'],
    catchphrases: ['New Year New Paws', 'Cheers to 2027', 'Sparkle & Shine', 'Fresh Start Paw', 'Happy New Year'],
    styleKeywords: ['Glamorous Gold Script Vector', 'Celebratory Retro Pop Art', 'Minimalist Star Line Art']
  },
  {
    id: 'valentines',
    name: "Valentine's Day",
    koreanName: '발렌타인데이',
    month: 2,
    day: 14,
    icon: '💖',
    trendingMotifs: ['pink hearts', 'cupid wings', 'chocolate box', 'strawberry bouquet', 'love letters'],
    seasonalProps: ['chocolate dipped strawberry', 'red heart balloon', 'envelope with heart seal'],
    catchphrases: ['Be My Bestie', 'Paws & Kisses', 'Love You S\'more', 'Sweet Heart', 'Cute & Beloved'],
    styleKeywords: ['Pastel Pink Chibi Kawaii', 'Romantic Script Typography', 'Retro Heart Doodle Line Art']
  },
  {
    id: 'stpatrick',
    name: "St. Patrick's Day",
    koreanName: '성 패트릭의 날',
    month: 3,
    day: 17,
    icon: '☘️',
    trendingMotifs: ['four-leaf clover', 'leprechaun hat', 'pot of gold', 'emerald ribbon', 'rainbow'],
    seasonalProps: ['lucky clover sprig', 'golden coin', 'green bow tie'],
    catchphrases: ['Lucky Little Paw', 'Paws & Clovers', 'One Lucky Bestie', 'Charmed Life', 'Feeling Lucky'],
    styleKeywords: ['Vivid Mint & Emerald Vector', 'Celtic Retro Script', 'Cute Irish Folk Illustration']
  },
  {
    id: 'mothersday',
    name: "Mother's Day",
    koreanName: '어버이의 날 (마더스데이)',
    month: 5,
    day: 10, // 2nd Sunday in May approx
    icon: '💐',
    trendingMotifs: ['tulip bouquet', 'floral wreath', 'mama bear/paw', 'carnations', 'tea set'],
    seasonalProps: ['pink tulip stem', 'floral tea cup', 'ribbon tied flowers'],
    catchphrases: ['Best Paw Mama', 'Mama Paws', 'Loved Beyond Measure', 'Sweetest Mom Ever', 'Blooming With Love'],
    styleKeywords: ['Soft Botanical Floral Watercolor', 'Elegantly Curved Script Typography', 'Cozy Cottagecore Pastels']
  },
  {
    id: 'fathersday',
    name: "Father's Day",
    koreanName: '파더스데이 (아버지의 날)',
    month: 6,
    day: 20, // 3rd Sunday in June approx
    icon: '👔',
    trendingMotifs: ['bow tie', 'dad hat', 'grill spatula', 'coffee mug', 'fishing rod', 'toolbox'],
    seasonalProps: ['coffee thermos', 'classic dad sunglasses', 'grilling tongs'],
    catchphrases: ['Best Paw Dad', 'Rad Dad Paws', 'King of the Grill', 'No. 1 Paw Dad', 'Tough & Cute'],
    styleKeywords: ['Retro Vintage Dad Badge Art', 'Bold Classic Americana Line Art', 'Minimalist Woodcut Vector']
  },
  {
    id: 'july4th',
    name: '4th of July (Independence Day)',
    koreanName: '미국 독립기념일 (4th of July)',
    month: 7,
    day: 4,
    icon: '🇺🇸',
    trendingMotifs: ['patriotic stars', 'red white blue sunglasses', 'fireworks', 'popsicle', 'picnic basket'],
    seasonalProps: ['rocket popsicle', 'patriotic bandana', 'sparkler stick'],
    catchphrases: ['Red White & Cute', 'Star Spangled Paw', 'Paws & Freedom', 'Bold & Brave', 'Summer Sparkler'],
    styleKeywords: ['Americana Retro Vintage', 'Rustic Pop Graphic Line Art', 'Bold Stars & Script Vector']
  },
  {
    id: 'backtoschool',
    name: 'Back to School',
    koreanName: '신학기 (Back to School)',
    month: 8,
    day: 25,
    icon: '🎒',
    trendingMotifs: ['yellow pencil', 'school backpack', 'red apple', 'notebook paper', 'crayon'],
    seasonalProps: ['shiny red apple', 'mini ruler', 'vintage book stack'],
    catchphrases: ['Smarty Paws', 'Back to Cool', 'Ready to Learn', 'Classroom Star', 'Paw-sitive Vibes'],
    styleKeywords: ['Playful Hand-Drawn Doodle', 'Chalkboard Line Art', 'Vibrant Primary Vector Art']
  }
];

export interface ActiveSeasonInfo {
  holiday: SeasonalHoliday;
  targetDate: Date;
  daysRemaining: number;
  isUrgent: boolean; // D-30 or less
}

/**
 * Calculates exact holiday date for a given holiday and year
 */
function getExactHolidayDate(holiday: SeasonalHoliday, referenceYear: number): Date {
  // Fixed dates
  const date = new Date(referenceYear, holiday.month - 1, holiday.day, 12, 0, 0);

  // Dynamic holidays (Mother's Day = 2nd Sun in May, Father's Day = 3rd Sun in June, Thanksgiving = 4th Thu in Nov)
  if (holiday.id === 'mothersday') {
    // 2nd Sunday of May (Month index 4)
    return getNthDayOfWeekInMonth(referenceYear, 4, 0, 2);
  }
  if (holiday.id === 'fathersday') {
    // 3rd Sunday of June (Month index 5)
    return getNthDayOfWeekInMonth(referenceYear, 5, 0, 3);
  }
  if (holiday.id === 'thanksgiving') {
    // 4th Thursday of November (Month index 10)
    return getNthDayOfWeekInMonth(referenceYear, 10, 4, 4);
  }

  return date;
}

function getNthDayOfWeekInMonth(year: number, monthIndex: number, dayOfWeek: number, n: number): Date {
  const firstDay = new Date(year, monthIndex, 1);
  let count = 0;
  for (let day = 1; day <= 31; day++) {
    const testDate = new Date(year, monthIndex, day);
    if (testDate.getMonth() !== monthIndex) break;
    if (testDate.getDay() === dayOfWeek) {
      count++;
      if (count === n) return testDate;
    }
  }
  return new Date(year, monthIndex, 15); // Fallback
}

/**
 * Returns all seasonal holidays that fall within the 3-month (90 days) lead-time window.
 * Rule 1.1: 유행 시즌 도래 3달 전(90일)부터 도래일까지 집중적으로 생성
 */
export function getActiveUpcomingSeasons(referenceDate: Date = new Date()): ActiveSeasonInfo[] {
  const currentYear = referenceDate.getFullYear();
  const activeList: ActiveSeasonInfo[] = [];

  for (const holiday of SEASONAL_HOLIDAYS) {
    let targetDate = getExactHolidayDate(holiday, currentYear);

    // If the holiday has already passed this year by more than 3 days, look at next year's date
    const diffMs = targetDate.getTime() - referenceDate.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < -3) {
      targetDate = getExactHolidayDate(holiday, currentYear + 1);
    }

    const finalDiffMs = targetDate.getTime() - referenceDate.getTime();
    const finalDiffDays = Math.ceil(finalDiffMs / (1000 * 60 * 60 * 24));

    // Lead-time window check: 0 to 90 days (3 months)
    if (finalDiffDays >= 0 && finalDiffDays <= 90) {
      activeList.push({
        holiday,
        targetDate,
        daysRemaining: finalDiffDays,
        isUrgent: finalDiffDays <= 30
      });
    }
  }

  // Sort by closest holiday first
  activeList.sort((a, b) => a.daysRemaining - b.daysRemaining);
  return activeList;
}

/**
 * Returns prompt instructions for seasonal & trending style generation
 */
export function getSeasonalTrendInstruction(
  targetAnimal: string,
  chosenSeasonId?: string,
  referenceDate: Date = new Date()
): {
  seasonPromptInstruction: string;
  activeSeasonInfo: ActiveSeasonInfo | null;
  allActiveSeasons: ActiveSeasonInfo[];
} {
  const activeSeasons = getActiveUpcomingSeasons(referenceDate);

  let selectedSeason: ActiveSeasonInfo | null = null;

  if (chosenSeasonId && chosenSeasonId !== 'auto') {
    const found = activeSeasons.find(s => s.holiday.id === chosenSeasonId);
    if (found) {
      selectedSeason = found;
    } else {
      // Find from full list if requested specifically outside current window
      const fullHoliday = SEASONAL_HOLIDAYS.find(h => h.id === chosenSeasonId);
      if (fullHoliday) {
        selectedSeason = {
          holiday: fullHoliday,
          targetDate: new Date(),
          daysRemaining: 0,
          isUrgent: true
        };
      }
    }
  } else if (activeSeasons.length > 0) {
    // Default to the closest active season in the 3-month window
    selectedSeason = activeSeasons[0];
  }

  if (!selectedSeason) {
    return {
      seasonPromptInstruction: '',
      activeSeasonInfo: null,
      allActiveSeasons: activeSeasons
    };
  }

  const h = selectedSeason.holiday;
  const motif = h.trendingMotifs[Math.floor(Math.random() * h.trendingMotifs.length)];
  const prop = h.seasonalProps[Math.floor(Math.random() * h.seasonalProps.length)];
  const styleKeyword = h.styleKeywords[Math.floor(Math.random() * h.styleKeywords.length)];

  const instruction = `SEASONAL TREND MANDATE (${h.name} - ${h.koreanName} Season, D-${selectedSeason.daysRemaining}): Incorporate a cute ${h.name} festive holiday element! The main subject (${targetAnimal}) should feature a charming ${h.name} motif (${motif}) and hold or interact with a seasonal prop (${prop}). STRICT STYLE MANDATE: Apply the top-trending ${styleKeyword} design aesthetic with crisp line art and flat vector colors. CRITICAL RULE: Pure solid white background (#FFFFFF) with ZERO background scenery or background colors.`;

  return {
    seasonPromptInstruction: instruction,
    activeSeasonInfo: selectedSeason,
    allActiveSeasons: activeSeasons
  };
}
