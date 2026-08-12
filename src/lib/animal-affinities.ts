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

  const baseRules = `PRIMARY MANDATE 1: ANTHROPOMORPHISM & FRIENDLINESS (#1 MANDATE). The character MUST be an ultra-cute, friendly, endearing anthropomorphic character wearing cute clothing (e.g., cozy sweater, hoodie, beanie, denim jacket, or sneakers) and engaged in a friendly human-like posture.
PRIMARY MANDATE 2: POPULAR US CULTURE & HOBBIES. Incorporate popular American lifestyle preferences, hobbies, or trendy accessories (e.g., sipping iced coffee/boba tea, cozy book reading, skateboarding, playing acoustic guitar, outdoor camping, baking, or vinyl music).`;

  if (!affinity) return baseRules;

  let rule = `${baseRules}
PRIMARY MANDATE 3: HARMONIOUS BIOLOGICAL AFFINITY. Seamlessly blend ${affinity.animalName}'s biological preferences (${affinity.preferredItems.join(', ')}) with its anthropomorphic US hobby (e.g., ${affinity.usHobbyIdeas.join(' OR ')}).`;

  if (affinity.strictExclusions && affinity.strictExclusions.length > 0) {
    rule += ` STRICT NEGATIVE RULE: ABSOLUTELY DO NOT generate biologically mismatched items for ${affinity.animalName} such as: ${affinity.strictExclusions.join(', ')}. (For example, Red Pandas eat bamboo/bamboo boba, NOT mushrooms or spores!).`;
  }

  return rule;
}
