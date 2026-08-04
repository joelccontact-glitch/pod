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
    title: "퇴직연금 DC/IRP 가입 상담 장면",
    description: "전문 금융 자산 관리사가 3040 한국 직장인 부부에게 태블릿으로 퇴직연금 포트폴리오를 설명하는 고화질 스톡 포토",
    prompt: "Ultra realistic commercial stock photo, professional Korean financial advisor explaining retirement pension plan on a modern tablet to a young Korean couple, clean office setting, corporate blue accents, soft natural sunlight, copy space for text, high detail, 8k resolution, five fingers, correct human anatomy, no text, no logo",
    negativePrompt: "text, logo, watermark, distorted hands, extra fingers, bad anatomy, low quality, blur, dark background",
    recommendedKeywords: ["퇴직연금", "IRP", "DC형", "연금설계", "금융상담", "자산관리", "재테크", "한국직장인", "은퇴준비", "태블릿상담", "금융전문가"],
    targetSites: ["크라우드픽", "Adobe Stock", "Shutterstock", "Freepik"],
  },
  {
    id: "p2",
    category: "ETF",
    title: "ETF 주식 투자 대시보드 분석",
    description: "노트북으로 미국 AI ETF 및 배당 ETF 수익률 그래프를 분석하는 한국 직장인의 데스크 스톡 라이브러리",
    prompt: "Premium corporate stock photo, a Korean office worker analyzing stock market investment dashboard and ETF performance charts on a laptop, modern clean desk, coffee cup, sleek office background, professional ambient lighting, shallow depth of field, 8k, photorealistic",
    negativePrompt: "text, logo, brand names, distorted screens, bad fingers, grainy, low resolution",
    recommendedKeywords: ["ETF", "주식투자", "수익률", "자산운용", "재테크", "증권", "금융차트", "디지털금융", "직장인재테크", "포트폴리오"],
    targetSites: ["크라우드픽", "Adobe Stock", "Shutterstock"],
  },
  {
    id: "p3",
    category: "AI 금융",
    title: "AI 기반 금융 데이터 자동화 회의",
    description: "인공지능 금융 솔루션 화면과 함께 비즈니스 전략을 논의하는 스마트 IT 데이터 회의",
    prompt: "High-end corporate photography, Korean business team discussing AI-driven financial data strategy in a futuristic glass meeting room, bright blue light accents, clean professional aesthetic, realistic skin texture, sharp focus, 8k, commercial quality",
    negativePrompt: "distorted faces, extra limbs, blur, low resolution, bad hands, dark shadows",
    recommendedKeywords: ["AI금융", "인공지능", "금융데이터", "빅데이터", "핀테크", "스마트오피스", "비즈니스회의", "IT솔루션"],
    targetSites: ["크라우드픽", "Adobe Stock", "Freepik"],
  },
  {
    id: "p4",
    category: "한국 직장인",
    title: "화상 회의 진행 중인 한국 핀테크 개발자",
    description: "노트북으로 해외 파트너와 화상 미팅을 하며 웃는 한국인 IT 전문가",
    prompt: "Clean commercial portrait, friendly Korean male IT specialist having a video conference on laptop, modern bright coworking space, warm corporate lighting, authentic natural smile, realistic skin detail, copy space, 8k",
    negativePrompt: "deformed fingers, asymmetric eyes, blur, dark tones, logos",
    recommendedKeywords: ["한국직장인", "화상회의", "재택근무", "코워킹스페이스", "개발자", "프로젝트관리", "비즈니스미팅"],
    targetSites: ["크라우드픽", "Adobe Stock", "Shutterstock"],
  },
  {
    id: "p5",
    category: "자산관리",
    title: "은퇴 부부의 행복한 노후 자산 설계",
    description: "공원에서 태블릿으로 연금 수령 현황을 보며 여유롭게 웃는 5060 중년 한국인 부부",
    prompt: "Heartwarming commercial stock photo, happy middle-aged Korean couple relaxing at a sunny park reviewing retirement fund on tablet, active senior lifestyle, natural facial expressions, warm soft lighting, high resolution, 8k",
    negativePrompt: "ugly, deformed, extra fingers, cartoon, text, logos",
    recommendedKeywords: ["노후준비", "은퇴생활", "시니어", "자산관리", "연금수령", "행복한노후", "재무설계"],
    targetSites: ["크라우드픽", "Adobe Stock"],
  },
  {
    id: "p6",
    category: "디지털 뱅킹",
    title: "모바일 금융 앱 간편 송금 및 보안 인증",
    description: "스마트폰으로 간편인증 및 전자서명을 진행하는 비즈니스 손 모음 (배경 깔끔한 흰색)",
    prompt: "Close up commercial photography, Korean business hands holding a modern smartphone executing digital bank transaction, clean white background, high contrast, crisp detail, no brand logo, no text on screen, 8k",
    negativePrompt: "text, logos, extra fingers, broken screen, low quality",
    recommendedKeywords: ["모바일뱅킹", "간편송금", "전자서명", "디지털인증", "금융보안", "스마트폰금융", "핀테크"],
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
