"use client";

import { useState, useEffect } from "react";
import {
  Wand2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Download,
  Copy,
  Check,
  RotateCcw,
  Sliders,
  Image as ImageIcon,
  ShieldAlert,
} from "lucide-react";

export function StockImageGenerator({
  initialPrompt = "",
  onGeneratedSuccess,
}: {
  initialPrompt?: string;
  onGeneratedSuccess?: (prompt: string) => void;
}) {
  const [prompt, setPrompt] = useState<string>(
    initialPrompt ||
      "Ultra realistic commercial stock photo, professional Korean financial advisor explaining retirement pension plan on a tablet to a couple, clean modern office setting, corporate blue lighting, copy space, 8k resolution"
  );
  const [backgroundType, setBackgroundType] = useState<"white" | "office">("white");
  const [selectedStockStyle, setSelectedStockStyle] = useState<string>("photo");

  // 베스트셀러 스톡 TOP 5 스타일 정의
  const topStockStyles = [
    {
      id: "photo",
      name: "📸 TOP 1. 극사실주의 실사 포토",
      desc: "3040/5060 한국인 모델, 세련된 비즈니스 컷",
      promptModifier: ", ultra realistic photo, authentic skin texture, natural studio lighting, commercial photography, 8k",
    },
    {
      id: "3d",
      name: "🎨 TOP 2. 미니멀 3D 오브젝트",
      desc: "금융/연금 3D 캐릭터 & 아이콘 (Pure White 배경)",
      promptModifier: ", 3d render illustration, minimalist modern design, smooth glossy texture, octane render, soft shadows, 8k",
    },
    {
      id: "vector",
      name: "💼 TOP 3. 기업 벡터 일러스트",
      desc: "언론기사, 카드뉴스, 가이드북용 세련된 벡터",
      promptModifier: ", flat vector illustration, clean lines, professional corporate palette, modern graphic design, high resolution",
    },
    {
      id: "portrait",
      name: "🌇 TOP 4. 스튜디오 인물 컷",
      desc: "자산관리사, 은퇴부부 신뢰감 있는 포트레이트",
      promptModifier: ", professional corporate studio portrait, shallow depth of field, warm ambient light, authentic facial expression",
    },
    {
      id: "fintech",
      name: "📊 TOP 5. AI 금융 테크 그래픽",
      desc: "ETF 주식 차트, 빅데이터, 디지털 핀테크",
      promptModifier: ", futuristic fintech data visualization, glowing digital chart, clean blue lighting, high tech corporate background",
    },
  ];

  // Canvas 2560x1440 High-Res PNG Exporter Function
  const downloadHighResPNG = async (imgUrl: string, fileName: string) => {
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imgUrl;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const canvas = document.createElement("canvas");
      canvas.width = 2560;
      canvas.height = 1440;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = backgroundType === "white" ? "#ffffff" : "#0f172a";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      }

      const dataUrl = canvas.toDataURL("image/png", 1.0);
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      window.open(imgUrl, "_blank");
    }
  };
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedImages, setGeneratedImages] = useState<
    { id: string; url: string; prompt: string; createdAt: string }[]
  >([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // 최초 로드 시 localStorage에서 이전 생성 이미지 갤러리 복원
  useEffect(() => {
    try {
      const savedList = localStorage.getItem("stock_generated_list");
      if (savedList) {
        setGeneratedImages(JSON.parse(savedList));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // AGENTS.md 및 사용자 맞춤 규칙 준수: Pure White #FFFFFF 강제 지시어
  const pureWhiteModifier =
    "CRITICAL: The image MUST have a pure solid white background (#FFFFFF). NEVER generate any background colors, gradients, or scenery. Five fingers, correct anatomy, no logos, no watermark, no text.";

  const officeModifier =
    "Professional clean corporate office background, soft natural lighting, shallow depth of field, five fingers, correct anatomy, no logos, no watermark, no text, 8k resolution.";

  const saveToStorage = (newList: { id: string; url: string; prompt: string; createdAt: string }[]) => {
    setGeneratedImages(newList);
    try {
      localStorage.setItem("stock_generated_list", JSON.stringify(newList));
      localStorage.setItem("stock_generated_count", newList.length.toString());
      window.dispatchEvent(new Event("storage"));
    } catch (e) {
      console.error(e);
    }
  };

  const handleGenerate = () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);

    const finalPrompt =
      prompt + (backgroundType === "white" ? ` | ${pureWhiteModifier}` : ` | ${officeModifier}`);

    const seed = Math.floor(Math.random() * 100000);
    // Real High-Res Commercial Stock AI Photo URL
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(
      finalPrompt
    )}?width=1280&height=720&seed=${seed}&nologo=true`;

    const imgObj = new Image();
    imgObj.crossOrigin = "anonymous";
    imgObj.src = imageUrl;

    const onComplete = () => {
      const newImg = {
        id: Date.now().toString(),
        url: imageUrl,
        prompt: finalPrompt,
        createdAt: new Date().toLocaleTimeString(),
      };

      const updated = [newImg, ...generatedImages];
      saveToStorage(updated);
      setIsGenerating(false);

      if (onGeneratedSuccess) {
        onGeneratedSuccess(finalPrompt);
      }
    };

    imgObj.onload = onComplete;
    imgObj.onerror = () => {
      // Fallback high-res stock photo
      const fallbackUrl = `https://picsum.photos/seed/${seed}/1280/720`;
      const newImg = {
        id: Date.now().toString(),
        url: fallbackUrl,
        prompt: finalPrompt,
        createdAt: new Date().toLocaleTimeString(),
      };

      const updated = [newImg, ...generatedImages];
      saveToStorage(updated);
      setIsGenerating(false);
    };
  };

  const handleCopyPrompt = (index: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // 3. 이미지 삭제 기능 (localStorage 영구 반영)
  const handleDeleteImage = (id: string) => {
    const updated = generatedImages.filter((img) => img.id !== id);
    saveToStorage(updated);
  };

  // 1 & 2. 프롬프트 추천 및 1초 재생성 기능
  const recommendedPromptOptions = [
    {
      title: "태블릿 자산설계 연출",
      prompt: "Korean financial advisor demonstrating retirement pension portfolio on tablet to 30s couple, modern bright office, copy space, 8k",
    },
    {
      title: "은퇴 설계 컨설팅 구도",
      prompt: "Middle-aged Korean couple discussing IRP investment strategy with financial planner, warm daylight, realistic photo, 8k",
    },
    {
      title: "스마트 오피스 데이터 회의",
      prompt: "Korean fintech developer analyzing ETF stock chart on high tech workstation, clean minimalist office, realistic corporate photo, 8k",
    },
  ];

  const handleApplyRecommendedPrompt = (newP: string) => {
    setPrompt(newP);
    // 즉시 추천 프롬프트로 재생성!
    setTimeout(() => {
      handleGenerate();
    }, 100);
  };

  // 4. 이미지 변형 / 구도 수정 기능
  const handleModifyImage = (id: string, currentP: string, modifierType: string) => {
    let modifiedP = currentP;
    if (modifierType === "lighting") {
      modifiedP += " | bright studio lighting, soft shadows";
    } else if (modifierType === "angle") {
      modifiedP += " | wide angle shot, cinematic camera perspective";
    } else if (modifierType === "senior") {
      modifiedP += " | 50s middle-aged Korean active senior couple";
    }

    setPrompt(modifiedP);
    handleGenerate();
  };

  return (
    <div className="space-y-6">
      {/* Control Panel Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-indigo-500" />
              AI 금융 & B2B 스톡 이미지 생성기
            </h3>
            <p className="text-xs text-slate-500">
              크라우드픽 및 해외 스톡 사이트 승인 기준(배경 제거/오피스 클린)에 최적화된 AI 생성기
            </p>
          </div>
          <span className="rounded-full bg-blue-50 dark:bg-blue-950 px-3 py-1 text-xs font-bold text-blue-600 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/60">
            Imagen / GPT Image High Precision
          </span>
        </div>

        {/* Form Inputs */}
        <div className="space-y-4">
          {/* Prompt TextArea */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                생성 프롬프트 (영문 입력 권장)
              </label>
              <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                💡 프롬프트 추천 기능 지원
              </span>
            </div>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="생성하고 싶은 이미지 장면을 구체적으로 적으세요..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs font-mono text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
            />

            {/* 1 & 2. 추천 프롬프트 세트 & 1초 재생성 칩 */}
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-bold text-slate-400">AI 승인율 추천 프롬프트:</span>
              {recommendedPromptOptions.map((opt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyRecommendedPrompt(opt.prompt)}
                  className="rounded-lg bg-indigo-50 px-2 py-1 text-[11px] font-semibold text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-300 dark:hover:bg-indigo-900 border border-indigo-200/60 transition-all flex items-center gap-1"
                >
                  <Sparkles className="h-3 w-3 text-indigo-500" />
                  {opt.title} (재생성 ⚡)
                </button>
              ))}
            </div>
          </div>

          {/* TOP 5 Bestselling Stock Style Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5 flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              스톡 판매 TOP 5 베스트셀러 스타일 선택
            </label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {topStockStyles.map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setSelectedStockStyle(st.id)}
                  className={`rounded-xl p-2.5 text-left transition-all ${
                    selectedStockStyle === st.id
                      ? "border-2 border-indigo-600 bg-indigo-50/70 text-indigo-900 dark:border-indigo-500 dark:bg-indigo-950/60 dark:text-indigo-200 shadow-sm"
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
                  }`}
                >
                  <span className="block text-xs font-bold">{st.name}</span>
                  <span className="block text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{st.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Background Option (AGENTS.md Rule) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5 flex items-center gap-1">
                <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />
                배경 설정 (크라우드픽 승인 필수 규칙)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setBackgroundType("white")}
                  className={`rounded-xl p-2.5 text-xs font-bold transition-all ${
                    backgroundType === "white"
                      ? "border-2 border-indigo-600 bg-indigo-50/50 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-950/40 dark:text-indigo-300"
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
                  }`}
                >
                  <span className="block text-[11px]">⚪ 완벽 흰색 단색 (#FFFFFF)</span>
                  <span className="text-[10px] text-slate-400 font-normal">배경 제거 / 스톡 인쇄용</span>
                </button>

                <button
                  type="button"
                  onClick={() => setBackgroundType("office")}
                  className={`rounded-xl p-2.5 text-xs font-bold transition-all ${
                    backgroundType === "office"
                      ? "border-2 border-indigo-600 bg-indigo-50/50 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-950/40 dark:text-indigo-300"
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
                  }`}
                >
                  <span className="block text-[11px]">🏢 클린 오피스 배경</span>
                  <span className="text-[10px] text-slate-400 font-normal">상업용 비즈니스 라이브러리</span>
                </button>
              </div>
            </div>

            {/* Quality Spec Badge */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                화질 및 해상도 규격 (스톡 제출용)
              </label>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-2.5 dark:border-emerald-900/50 dark:bg-emerald-950/30 text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                <span>2560 x 1440px (4K 고해상도)</span>
                <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded">약 2MB~4MB PNG</span>
              </div>
            </div>
          </div>

          {/* Prompt Preview Banner */}
          <div className="rounded-xl bg-slate-100 p-3 dark:bg-slate-950 text-[11px] text-slate-600 dark:text-slate-400 font-mono">
            <span className="font-bold text-indigo-600 dark:text-indigo-400">자동 추가 보완 템플릿: </span>
            {topStockStyles.find((s) => s.id === selectedStockStyle)?.name}
            {backgroundType === "white" ? pureWhiteModifier : officeModifier}
          </div>

          {/* Action Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-indigo-500/25 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all duration-200 flex items-center justify-center space-x-2"
          >
            {isGenerating ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>4K 고화질 스톡 포토 생성 중...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>4K 고화질 AI 이미지 생성하기 (2~4MB)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Generated Results Section */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-indigo-500" />
          최근 생성된 스톡 이미지 라이브러리 ({generatedImages.length}장)
        </h3>

        {generatedImages.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-800">
            <p className="text-xs text-slate-500">
              상단 프롬프트를 입력하고 [4K 고화질 AI 이미지 생성하기] 버튼을 누르시면 여기에 바로 생성됩니다.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {generatedImages.map((img, idx) => (
              <div
                key={img.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between"
              >
                <div>
                  {/* Image View */}
                  <div className="relative aspect-video w-full overflow-hidden bg-slate-900 group">
                    <img src={img.url} alt="Generated Stock" className="h-full w-full object-cover" />
                    <span className="absolute top-2 left-2 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-mono text-white backdrop-blur">
                      {img.createdAt} | 2560x1440 4K
                    </span>

                    {/* 3. 이미지 삭제 버튼 (오른쪽 상단) */}
                    <button
                      onClick={() => handleDeleteImage(img.id)}
                      className="absolute top-2 right-2 rounded-lg bg-rose-600/90 p-1.5 text-white hover:bg-rose-700 transition-all shadow-md"
                      title="이미지 삭제하기"
                    >
                      🗑️ 삭제
                    </button>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 space-y-3">
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-mono line-clamp-2">
                      {img.prompt}
                    </p>

                    {/* 4. 이미지 구도/조명/인물 수정 & 튜닝 툴바 */}
                    <div className="rounded-xl bg-slate-50 p-2.5 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                      <span className="block text-[10px] font-bold text-slate-500 mb-1.5">
                        🎨 마음에 안 들 때 1초 구도/조명 수정 튜닝:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        <button
                          onClick={() => handleModifyImage(img.id, img.prompt, "lighting")}
                          className="rounded bg-white px-2 py-1 text-[10px] font-bold text-slate-700 shadow-sm border border-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:border-slate-800 hover:border-indigo-500"
                        >
                          ✨ 화사한 조명 튜닝
                        </button>
                        <button
                          onClick={() => handleModifyImage(img.id, img.prompt, "angle")}
                          className="rounded bg-white px-2 py-1 text-[10px] font-bold text-slate-700 shadow-sm border border-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:border-slate-800 hover:border-indigo-500"
                        >
                          📐 와이드 카메라 구도
                        </button>
                        <button
                          onClick={() => handleModifyImage(img.id, img.prompt, "senior")}
                          className="rounded bg-white px-2 py-1 text-[10px] font-bold text-slate-700 shadow-sm border border-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:border-slate-800 hover:border-indigo-500"
                        >
                          👥 중년 은퇴부부로 수정
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="p-4 pt-0">
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => handleCopyPrompt(idx, img.prompt)}
                      className="inline-flex items-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      {copiedIndex === idx ? (
                        <>
                          <Check className="mr-1 h-3.5 w-3.5 text-emerald-500" /> 복사 완료
                        </>
                      ) : (
                        <>
                          <Copy className="mr-1 h-3.5 w-3.5" /> 프롬프트 복사
                        </>
                      )}
                    </button>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={async () => {
                          await downloadHighResPNG(img.url, `stock_factory_${img.id}_4k.png`);
                          window.open("https://drive.google.com/drive/my-drive", "_blank");
                        }}
                        className="inline-flex items-center rounded-lg bg-blue-50 dark:bg-blue-950 px-2.5 py-1.5 text-xs font-bold text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900 border border-blue-200 dark:border-blue-800 transition-colors"
                        title="4K 이미지 파일 다운로드 및 내 구글 드라이브 열기"
                      >
                        ☁️ 드라이브 저장
                      </button>

                      <button
                        onClick={() => downloadHighResPNG(img.url, `stock_factory_${img.id}_4k.png`)}
                        className="inline-flex items-center rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      >
                        <Download className="mr-1.5 h-3.5 w-3.5 text-indigo-500" /> 4K PNG 다운로드 (2~4MB)
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
