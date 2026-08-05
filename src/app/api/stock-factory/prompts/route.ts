import { NextResponse } from "next/server";

export interface StockPromptItem {
  id: string;
  category: "퇴직연금" | "IRP" | "ETF" | "AI 금융" | "한국 직장인" | "자산관리" | "디지털 뱅킹";
  title: string;
  description: string;
  prompt: string;
  negativePrompt: string;
  recommendedKeywords: string[];
  targetSites: string[];
}

const STOCK_PROMPTS: StockPromptItem[] = [
  {
    id: "p1",
    category: "퇴직연금",
    title: "퇴직연금 DC/IRP 가입 상담 (어도비스톡 TOP 1% 품질)",
    description: "35세 한국인 전문 자산관리사가 강남 고층 오피스에서 50대 은퇴 준비 부부에게 슬림 태블릿으로 IRP 연금 포트폴리오를 경청하며 설명하는 8K 극사실주의 상업 포토",
    prompt: "Award-winning commercial stock photography, a handsome 35-year-old polished Korean male financial advisor wearing a tailored navy blue blazer, demonstrating a retirement pension portfolio on a sleek metallic tablet to a well-dressed 50s Korean couple. Set in a sunlit modern Seoul executive office with marble table and glass windows overlooking soft city skyline. Authentic smiling facial expressions, natural skin texture with visible pores, crystal clear eye focus. Professional studio rim light mixed with warm window daylight, 85mm f/1.4 lens depth of field, generous negative copy space on the top right for editorial headline text, 8k ultra high resolution, perfect five realistic fingers, high commercial value.",
    negativePrompt: "text, logo, watermark, distorted hands, extra fingers, cartoon, 3d render, illustration, bad anatomy, low quality, dark shadows, blurry faces, oil painting filter",
    recommendedKeywords: ["퇴직연금", "IRP", "DC형", "연금설계", "금융상담", "자산관리", "재테크", "한국직장인", "은퇴준비", "태블릿상담", "금융전문가", "어워드수상포토"],
    targetSites: ["크라우드픽", "Adobe Stock", "Shutterstock", "Getty Images"],
  },
  {
    id: "p2",
    category: "ETF",
    title: "ETF 주식 포트폴리오 차트 정밀 분석",
    description: "듀얼 4K 모니터와 맥북으로 미국 AI 반도체 ETF 및 고배당 주식 수익률 그래프를 정밀 심층 분석하는 한국 핀테크 자산운용가",
    prompt: "High-end commercial stock photo, an intelligent 30s Korean stock analyst focused on analyzing multi-monitor ETF stock market trading graphs and real-time candlestick charts. Clean wooden desk with a ceramic coffee mug, wireless keyboard, and smartphone. Set in a contemporary fintech corporate trading floor in Yeouido, Seoul. Cinematic cool blue ambient lighting, sharp focus on screen data details, realistic skin texture, shallow depth of field, 8k resolution, shot on Sony A7R V with 50mm f/1.2 prime lens, clean composition with ample copy space for financial magazine cover.",
    negativePrompt: "text, brand logos, distorted screens, bad fingers, extra digits, grainy, low resolution, dark lighting, cartoonish faces",
    recommendedKeywords: ["ETF", "주식투자", "수익률", "자산운용", "재테크", "증권", "금융차트", "디지털금융", "여의도금융", "포트폴리오", "핀테크"],
    targetSites: ["크라우드픽", "Adobe Stock", "Shutterstock"],
  },
  {
    id: "p3",
    category: "AI 금융",
    title: "AI 빅데이터 금융 자산 자동화 회의",
    description: "투명 유리 스마트 보드판에 AI 알고리즘 차트를 띄워놓고 데이터 기반 자산 배분 전략을 열정적으로 논의하는 3040 한국인 팀원들",
    prompt: "Commercial grade corporate photography, a group of sharp 30s Korean business executives discussing AI-driven financial automated asset allocation around a glass boardroom table. A female lead manager holding a smart stylus points at a transparent digital glowing chart. Bright natural indoor lighting combined with sleek blue corporate accent lights, authentic collaborative expressions, razor-sharp focus on faces and hands, anatomical accuracy, 8k resolution, commercial advertising aesthetics, copy space for corporate presentation slides.",
    negativePrompt: "distorted faces, extra limbs, blur, low resolution, bad hands, dark shadows, oil painting, ugly facial features",
    recommendedKeywords: ["AI금융", "인공지능", "금융데이터", "빅데이터", "핀테크", "스마트오피스", "비즈니스회의", "IT솔루션", "자산배분"],
    targetSites: ["크라우드픽", "Adobe Stock", "Freepik"],
  },
  {
    id: "p4",
    category: "한국 직장인",
    title: "글로벌 파트너 화상 회의 & 프리젠테이션",
    description: "햇살 가득한 스마트 공유 오피스에서 파트너사와 화상 미팅을 진행하며 자신감 있게 미소 짓는 30대 한국인 직장인 여성",
    prompt: "Authentic commercial portrait photo, a confident 30-year-old Korean female business consultant having a video conference call on a sleek laptop. Dressed in a modern white silk blouse, sitting in a bright sunlit Gangnam coworking space with lush green indoor plants and wooden aesthetic background. Natural genuine smile, crisp facial detail, realistic skin texture, perfect hand posture, soft diffused daylight, 8k ultra resolution, stock photo standard for corporate HR and recruitment ads.",
    negativePrompt: "deformed fingers, asymmetric eyes, blur, dark tones, logos, text, cartoon, low contrast",
    recommendedKeywords: ["한국직장인", "화상회의", "재택근무", "코워킹스페이스", "컨설턴트", "프로젝트관리", "비즈니스미팅", "공유오피스"],
    targetSites: ["크라우드픽", "Adobe Stock", "Shutterstock"],
  },
  {
    id: "p5",
    category: "자산관리",
    title: "5060 중년 은퇴 부부의 여유로운 자산 점검",
    description: "화사한 봄날 카페 테라스에서 태블릿으로 안심 노후 연금과 IRP 수익률을 확인하며 온화하게 웃는 50대 한국인 은퇴 부부",
    prompt: "Heartwarming premium stock photo, an attractive 50s Korean middle-aged retired couple seated at a stylish outdoor cafe terrace, happily checking their retirement index fund growth on an iPad. Wearing elegant smart-casual pastel autumn outfits, soft warm golden hour sunlight, lush garden backdrop in out-of-focus blur. Genuine affectionate smiles, natural facial wrinkles with high detail realism, realistic hands holding tablet, 8k resolution, ideal for senior wealth management marketing banners.",
    negativePrompt: "ugly, deformed, extra fingers, cartoon, text, logos, dark mood, distorted faces, heavy makeup",
    recommendedKeywords: ["노후준비", "은퇴생활", "시니어", "자산관리", "연금수령", "행복한노후", "재무설계", "5060부부", "액티브시니어"],
    targetSites: ["크라우드픽", "Adobe Stock"],
  },
  {
    id: "p6",
    category: "디지털 뱅킹",
    title: "모바일 핀테크 인증 & 비대면 계좌 개설",
    description: "모바일 뱅킹 앱에서 원클릭 생체 인증 및 비대면 주식 계좌 개설을 진행하는 한국 직장인의 깔끔한 수트 손 컷 (Pure White 배경)",
    prompt: "Macro commercial studio photography, hands of a Korean male executive in a charcoal suit sleeve holding a flagship smartphone completing a biometric digital bank authentication. Clean pure solid white studio backdrop (#FFFFFF), high contrast lighting, crystal clear screen glass clarity with no reflections, no brand logo or text, crisp skin texture, flawless realistic fingers, 8k ultra sharp focus, commercial stock photography standard.",
    negativePrompt: "text, logos, extra fingers, broken screen, low quality, dark background, color gradients, shadows",
    recommendedKeywords: ["모바일뱅킹", "간편송금", "전자서명", "디지털인증", "금융보안", "스마트폰금융", "핀테크", "비대면개설"],
    targetSites: ["크라우드픽", "Adobe Stock", "Freepik"],
  }
];

export async function GET() {
  return NextResponse.json({
    success: true,
    count: STOCK_PROMPTS.length,
    data: STOCK_PROMPTS,
  });
}
