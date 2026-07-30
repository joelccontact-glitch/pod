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
