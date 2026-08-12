export interface AnimalAffinity {
  animalName: string;
  koreanName: string;
  preferredItems: string[];
  strictExclusions?: string[];
}

export const ANIMAL_AFFINITY_MAP: Record<string, AnimalAffinity> = {
  'red panda': {
    animalName: 'Red Panda',
    koreanName: '레서판다',
    preferredItems: ['bamboo stalks', 'bamboo leaves', 'bamboo shoots', 'green forest branches'],
    strictExclusions: ['mushrooms', 'spores', 'fungi', 'acorns']
  },
  'baby red panda': {
    animalName: 'Baby Red Panda',
    koreanName: '아기 레서판다',
    preferredItems: ['bamboo stalks', 'bamboo leaves', 'bamboo shoots', 'green forest branches'],
    strictExclusions: ['mushrooms', 'spores', 'fungi', 'acorns']
  },
  'hamster': {
    animalName: 'Hamster',
    koreanName: '햄스터',
    preferredItems: ['sunflower seeds', 'peanuts', 'tiny cheese wedge'],
    strictExclusions: ['fish', 'bamboo']
  },
  'guinea pig': {
    animalName: 'Guinea Pig',
    koreanName: '기니피그',
    preferredItems: ['clover leaves', 'fresh lettuce', 'timothy hay', 'baby carrots']
  },
  'kitten': {
    animalName: 'Kitten',
    koreanName: '아기 고양이',
    preferredItems: ['yarn ball', 'saucer of milk', 'fish graphic', 'catnip flowers']
  },
  'puppy': {
    animalName: 'Puppy',
    koreanName: '아기 강아지',
    preferredItems: ['chew bone', 'tennis ball', 'paw prints', 'cozy cushion']
  },
  'bunny': {
    animalName: 'Bunny',
    koreanName: '토끼',
    preferredItems: ['crunchy carrots', 'wild strawberries', 'daisies', 'wildflowers']
  },
  'duckling': {
    animalName: 'Duckling',
    koreanName: '아기 오리',
    preferredItems: ['water lily pad', 'lotus blossom', 'gentle pond ripples']
  },
  'piglet': {
    animalName: 'Piglet',
    koreanName: '아기 돼지',
    preferredItems: ['juicy watermelon slice', 'red apples', 'flower meadow']
  },
  'pygmy hippo': {
    animalName: 'Pygmy Hippo',
    koreanName: '피그미 하마',
    preferredItems: ['water lilies', 'watermelon slices', 'aquatic plants']
  },
  'sea otter pup': {
    animalName: 'Sea Otter Pup',
    koreanName: '아기 해달',
    preferredItems: ['sea clam shell', 'floating kelp', 'starfish']
  },
  'black bear cub': {
    animalName: 'Black Bear Cub',
    koreanName: '아기 흑곰',
    preferredItems: ['honeycomb pot', 'wild blueberries', 'river salmon']
  },
  'fawn': {
    animalName: 'Fawn',
    koreanName: '아기 사슴',
    preferredItems: ['forest wildflowers', 'acorns', 'berries']
  },
  'baby sloth': {
    animalName: 'Baby Sloth',
    koreanName: '나무늘보',
    preferredItems: ['tropical green leaves', 'cherry blossoms', 'cozy tree branch']
  },
  'baby hedgehog': {
    animalName: 'Baby Hedgehog',
    koreanName: '아기 고슴도치',
    preferredItems: ['wild mushrooms', 'autumn leaves', 'acorns']
  }
};

export function getAnimalAffinityData(targetAnimal: string): AnimalAffinity | null {
  if (!targetAnimal) return null;
  const normalized = targetAnimal.toLowerCase().trim();
  for (const [key, value] of Object.entries(ANIMAL_AFFINITY_MAP)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return value;
    }
  }
  return null;
}

export function getAnimalAffinityInstruction(targetAnimal: string): string {
  const affinity = getAnimalAffinityData(targetAnimal);
  if (!affinity) return '';

  let rule = `ANIMAL NATURAL AFFINITY MANDATE: The target animal is ${affinity.animalName}. You MUST only pair or feature objects, foods, or accessories that ${affinity.animalName} naturally loves in real life, such as: ${affinity.preferredItems.join(', ')}.`;
  
  if (affinity.strictExclusions && affinity.strictExclusions.length > 0) {
    rule += ` STRICT NEGATIVE RULE: DO NOT generate biologically mismatched items for ${affinity.animalName} such as: ${affinity.strictExclusions.join(', ')}. (For example, Red Pandas eat bamboo, NOT mushrooms or spores!).`;
  }
  
  return rule;
}
