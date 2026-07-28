<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# 사용자 맞춤 규칙 (Vercel 배포)
코드나 기능 수정 사항을 적용한 후에는 무조건 `git add .`, `git commit -m "..."`, `git push`를 수행하여 Vercel에 자동 배포되도록 해야 합니다.

# 디자인 생성 시 배경 제거 원칙
이미지를 생성하는 코드를 작성하거나 프롬프트를 수정할 때, 또는 에이전트가 직접 이미지를 생성할 때는 **반드시 배경 풍경이나 색상이 없는 깔끔한 흰색 단색 배경(또는 투명 배경)**이 되도록 지시사항을 강제해야 합니다. (예: `pure solid white background with NO scenery`). POD 상품에 프린팅 시 배경색이 남아 있으면 사각형 테두리가 인쇄되어 매우 부자연스럽기 때문입니다.
