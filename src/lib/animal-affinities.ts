export interface AnimalAffinity {
  animalName: string;
  koreanName: string;
  preferredItems: string[];
  strictExclusions?: string[];
  usHobbyIdeas: string[];
}

export const ANIMAL_AFFINITY_MAP: Record<string, AnimalAffinity> = {
  'red panda': {
    animalName: 'Red Panda',
    koreanName: '레서판다',
    preferredItems: ['bamboo stalks', 'bamboo leaves', 'bamboo shoots', 'green forest branches'],
    strictExclusions: ['mushrooms', 'spores', 'fungi', 'acorns'],
    usHobbyIdeas: ['sipping iced bamboo tea or boba', 'wearing a cozy oversized sweater', 'listening to acoustic music', 'backpacking']
  },
  'baby red panda': {
    animalName: 'Baby Red Panda',
    koreanName: '아기 레서판다',
    preferredItems: ['bamboo stalks', 'bamboo leaves', 'bamboo shoots', 'green forest branches'],
    strictExclusions: ['mushrooms', 'spores', 'fungi', 'acorns'],
    usHobbyIdeas: ['sipping iced bamboo boba tea', 'wearing a cute cozy beanie and sweater', 'holding a bamboo shoot']
  },
  'hamster': {
    animalName: 'Hamster',
    koreanName: '햄스터',
    preferredItems: ['sunflower seeds', 'peanuts', 'tiny cheese wedge'],
    strictExclusions: ['fish', 'bamboo'],
    usHobbyIdeas: ['eating a sunflower seed cookie', 'wearing tiny retro sneakers', 'gaming with headphones']
  },
  'guinea pig': {
    animalName: 'Guinea Pig',
    koreanName: '기니피그',
    preferredItems: ['clover leaves', 'fresh lettuce', 'timothy hay', 'baby carrots'],
    usHobbyIdeas: ['gardening with tiny tools', 'wearing cozy knitted scarf', 'reading a book']
  },
  'kitten': {
    animalName: 'Kitten',
    koreanName: '아기 고양이',
    preferredItems: ['yarn ball', 'saucer of milk', 'fish graphic', 'catnip flowers'],
    usHobbyIdeas: ['drinking iced boba tea', 'playing acoustic guitar', 'wearing a cute hoodie']
  },
  'puppy': {
    animalName: 'Puppy',
    koreanName: '아기 강아지',
    preferredItems: ['chew bone', 'tennis ball', 'paw prints', 'cozy cushion'],
    usHobbyIdeas: ['skateboarding', 'wearing a cool cap and sneakers', 'camping with a tiny tent']
  },
  'bunny': {
    animalName: 'Bunny',
    koreanName: '토끼',
    preferredItems: ['crunchy carrots', 'wild strawberries', 'daisies', 'wildflowers'],
    usHobbyIdeas: ['baking carrot cupcakes', 'wearing a denim jacket', 'holding an iced latte']
  },
  'duckling': {
    animalName: 'Duckling',
    koreanName: '아기 오리',
    preferredItems: ['water lily pad', 'lotus blossom', 'gentle pond ripples'],
    usHobbyIdeas: ['wearing a cute raincoat and yellow boots', 'holding a tiny umbrella', 'listening to music']
  },
  'piglet': {
    animalName: 'Piglet',
    koreanName: '아기 돼지',
    preferredItems: ['juicy watermelon slice', 'red apples', 'flower meadow'],
    usHobbyIdeas: ['eating watermelon popsicles', 'wearing denim overalls', 'gardening']
  },
  'pygmy hippo': {
    animalName: 'Pygmy Hippo',
    koreanName: '피그미 하마',
    preferredItems: ['water lilies', 'watermelon slices', 'aquatic plants'],
    usHobbyIdeas: ['relaxing in a pool float', 'wearing sunglasses', 'drinking iced fruit smoothie']
  },
  'sea otter pup': {
    animalName: 'Sea Otter Pup',
    koreanName: '아기 해달',
    preferredItems: ['sea clam shell', 'floating kelp', 'starfish'],
    usHobbyIdeas: ['hugging a clam-shaped pillow', 'wearing a cozy beanie', 'surfing']
  },
  'black bear cub': {
    animalName: 'Black Bear Cub',
    koreanName: '아기 흑곰',
    preferredItems: ['honeycomb pot', 'wild blueberries', 'river salmon'],
    usHobbyIdeas: ['hiking with a camping backpack', 'drinking hot honey tea', 'wearing a flannel shirt']
  },
  'fawn': {
    animalName: 'Fawn',
    koreanName: '아기 사슴',
    preferredItems: ['forest wildflowers', 'acorns', 'berries'],
    usHobbyIdeas: ['cozy cottagecore reading', 'wearing a floral crown and sweater', 'photography with a vintage camera']
  },
  'baby sloth': {
    animalName: 'Baby Sloth',
    koreanName: '나무늘보',
    preferredItems: ['tropical green leaves', 'cherry blossoms', 'cozy tree branch'],
    usHobbyIdeas: ['napping with a coffee cup (Nap Champ)', 'wearing cozy pajamas', 'listening to chill lofi music']
  },
  'baby hedgehog': {
    animalName: 'Baby Hedgehog',
    koreanName: '아기 고슴도치',
    preferredItems: ['wild mushrooms', 'autumn leaves', 'acorns'],
    usHobbyIdeas: ['hiking in autumn clothes', 'wearing a tiny scarf', 'baking acorn pie']
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

  // Randomly select between Anthropomorphic vs Authentic Natural Baby Animal (~50/50 probability)
  const isAnthropomorphic = Math.random() < 0.5;

  let styleDirective = '';
  if (isAnthropomorphic) {
    styleDirective = `SUBJECT MANDATE: THE MAIN CHARACTER MUST BE AN ADORABLE CUTE ANIMAL (${affinity ? affinity.animalName : targetAnimal}), NOT A HUMAN. Depict ${affinity ? affinity.animalName : targetAnimal} as a cute, friendly 2D vector line art animal character wearing cute cozy clothes (e.g. sweater, hoodie, beanie) and enjoying a US lifestyle/hobby (e.g. sipping iced boba, reading a book). STRICT NEGATIVE RULE: DO NOT DRAW HUMAN PERSONS, HUMAN GIRLS, HUMAN BOYS, OR HUMAN FACES!`;
  } else {
    styleDirective = `SUBJECT MANDATE: THE MAIN CHARACTER MUST BE AN ADORABLE CUTE ANIMAL (${affinity ? affinity.animalName : targetAnimal}), NOT A HUMAN. Depict ${affinity ? affinity.animalName : targetAnimal} in its pure, fluffy 2D vector baby animal state (no human clothes), in a charming standalone pose. STRICT NEGATIVE RULE: DO NOT DRAW HUMAN PERSONS, HUMAN GIRLS, HUMAN BOYS, OR HUMAN FACES!`;
  }

  let affinityRule = '';
  if (affinity) {
    affinityRule = `BIOLOGICAL AFFINITY RULE: Incorporate small standalone props ${affinity.animalName} actually loves in real life (preferred items: ${affinity.preferredItems.join(', ')}). DO NOT draw full background landscapes or scenery environments.`;
    if (affinity.strictExclusions && affinity.strictExclusions.length > 0) {
      affinityRule += ` STRICT NEGATIVE RULE: DO NOT include biologically mismatched items for ${affinity.animalName} such as: ${affinity.strictExclusions.join(', ')}.`;
    }
  }

  return `${styleDirective} ${affinityRule}`.trim();
}
