<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# 사용자 맞춤 규칙 (Vercel 배포)
코드나 기능 수정 사항을 적용한 후에는 무조건 `git add .`, `git commit -m "..."`, `git push`를 수행하여 Vercel에 자동 배포되도록 해야 합니다.

# 디자인 생성 시 배경 제거 원칙 (가장 중요!!!)
절대로 바탕 배경색을 생성하지 마세요!!! 이미지를 생성하는 코드를 작성하거나 프롬프트를 수정할 때, **반드시 배경 풍경이나 색상이 전혀 없는 완벽한 흰색 단색 배경(Pure White, #FFFFFF)**이 되도록 지시사항을 최우선으로 강제해야 합니다. (예: `CRITICAL: The image MUST have a pure solid white background (#FFFFFF). NEVER generate any background colors, gradients, or scenery.`). POD 상품에 프린팅 시 배경색이 남아 있으면 사각형 테두리가 인쇄되어 상품을 망치게 됩니다.

# 브랜드 텍스트 스타일 유지 원칙
생성되는 이미지에 브랜드 텍스트(예: Little Paws)를 추가할 때는 반드시 특정 스타일("귀엽고 우아한 손글씨(스크립트) 폰트")을 유지하도록 프롬프트에 강제해야 합니다. 단, 텍스트의 색상은 생성되는 이미지 분위기에 맞게 자연스럽게 변경되도록 지시해야 합니다. (예: `MUST be drawn in an elegant, cute, hand-drawn script font, using colors that perfectly match the mood and palette of the image.`)

# 반응형 UI/UX 우선 원칙 (반응형 웹 디자인)
모든 새로운 기능 구현 및 기존 기능 수정 시에는 **반드시 '모바일(Mobile)'과 'PC(Desktop)' 버전 두 가지 환경 모두에서 완벽하게 작동하고 예쁘게 보이도록 UI/UX 측면을 최우선으로 고려하여 개발**해야 합니다. 화면 너비가 좁은 모바일 기기에서의 레이아웃 깨짐, 버튼 텍스트 잘림, 터치 이벤트(Touch Event) 지원 여부 등을 항상 점검하세요.

# 동물별 생태적 취향 및 사물 매칭 원칙 (가장 중요!)
동물 디자인이나 이미지 프롬프트를 생성할 때는 **반드시 해당 동물이 실제로 좋아하거나 자연 생태계에서 연관된 사물/음식/소품과 매칭**되어야 합니다. 생물학적으로 맞지 않거나 엉뚱한 사물(예: 레서판다에게 버섯이나 포자)을 조합하지 마세요!
- **레서판다 (Red Panda)**: 대나무(Bamboo), 대나무 순(Bamboo shoots), 푸른 나뭇가지 (절대 버섯/포자/도토리 금지!)
- **햄스터 (Hamster)**: 해바라기 씨, 땅콩, 치즈 조각
- **기니피그 (Guinea Pig)**: 클로버, 상추, 티모시 건초, 당근
- **아기 고양이 (Kitten)**: 털실 뭉치, 우유 그릇, 생선, 캣닙 꽃
- **아기 강아지 (Puppy)**: 장난감 뼈다귀, 테니스 공, 발자국, 방석
- **토끼 (Bunny)**: 당근, 산딸기, 들꽃
- **아기 오리 (Duckling)**: 연꽃, 수련 잎(Water lily), 물결
- **아기 돼지 (Piglet)**: 수박 조각, 사과, 꽃밭
- **피그미 하마 (Pygmy Hippo)**: 수련, 수박 조각, 수생 식물
- **아기 해달 (Sea Otter Pup)**: 조개껍데기, 다시마/해조류, 불가사리
- **아기 흑곰 (Black Bear Cub)**: 꿀단지/벌집, 블루베리, 연어
- **아기 사슴 (Fawn)**: 들꽃, 도토리, 숲속 베리
- **나무늘보 (Baby Sloth)**: 열대 나뭇잎, 벚꽃 나뭇가지, 베개
- **아기 고슴도치 (Baby Hedgehog)**: 야생 버섯, 낙엽, 도토리

