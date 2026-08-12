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

# 이미지 생성 3대 커스텀 규칙

## 0. [1순위] 친근한 의인화 (Friendly Anthropomorphism)
이미지 생성 시 **최우선 1순위 규칙은 동물을 귀엽고 친근하게 의인화(Anthropomorphic)**하는 것입니다.
- 동물이 귀여운 옷(포근한 스웨터, 후드티, 비니 모자, 청자켓, 멜빵바지 등)을 입거나, 사랑스러운 소품(아이스 커피, 버블티, 백팩, 헤드폰 등)을 착용하고 친근하게 포즈를 취하도록 지시하세요.

## 1. 미국 선호 취미 / 문화 / 취향 반영 (US Cultural Preferences & Hobbies)
동물을 의인화할 때 **미국인들이 좋아하는 인기 트렌드, 취미, 소품, 취향**을 적극적으로 포함시켜야 합니다.
- **주요 미국 선호 취미/소품 예시**: 아이스 커피 / 버블티, 독서(Cozy reading), 캠핑/하이킹, 통기타 연주, 스케이트보드, 가드닝(식물 가꾸기), 베이킹(컵케이크), 비닐 LP 레코드/음악 감상, 레트로 게임 등.

## 2. 생태적 취향의 자연스러운 조화 (Harmonious Biological Affinity)
의인화 요소 및 미국 선호 취미와 해당 동물이 **실제 생태계에서 좋아하는 사물/음식을 자연스럽게 융합**해야 합니다.
- 예시: 레서판다가 귀여운 오버핏 후드티를 입고 **대나무 버블티(Bamboo Boba)**를 마시는 모습!
- 예시: 토끼가 청자켓을 입고 **당근 컵케이크**를 들고 있는 모습!
- 예시: 햄스터가 비니를 쓰고 **해바라기씨 쿠키**를 먹는 모습!
- **동물별 대표 생태 사물**:
  - **레서판다 (Red Panda)**: 대나무(Bamboo), 대나무 순, 푸른 나뭇가지 (**절대 버섯/포자 금지!**)
  - **햄스터 (Hamster)**: 해바라기 씨, 땅콩, 치즈 조각
  - **기니피그 (Guinea Pig)**: 클로버, 생상추, 티모시 건초, 당근
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


