"use client";

import { useState } from "react";
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
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "4:3" | "1:1">("16:9");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedImages, setGeneratedImages] = useState<
    { id: string; url: string; prompt: string; createdAt: string }[]
  >([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // AGENTS.md 및 사용자 맞춤 규칙 준수: Pure White #FFFFFF 강제 지시어
  const pureWhiteModifier =
    "CRITICAL: The image MUST have a pure solid white background (#FFFFFF). NEVER generate any background colors, gradients, or scenery. Five fingers, correct anatomy, no logos, no watermark, no text.";

  const officeModifier =
    "Professional clean corporate office background, soft natural lighting, shallow depth of field, five fingers, correct anatomy, no logos, no watermark, no text, 8k resolution.";

  const handleGenerate = () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);

    // 가상 이미지 생성 타임아웃
    setTimeout(() => {
      const finalPrompt =
        prompt + (backgroundType === "white" ? ` | ${pureWhiteModifier}` : ` | ${officeModifier}`);

      // 파랑/보라 계열 스톡 플레이스홀더 SVG 생성
      const bgStyle =
        backgroundType === "white"
          ? "background: #ffffff;"
          : "background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);";

      const textColor = backgroundType === "white" ? "#1e293b" : "#ffffff";

      const svgString = `
        <svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450" style="${bgStyle}">
          <rect width="800" height="450" fill="${backgroundType === "white" ? "#ffffff" : "#0f172a"}" />
          ${
            backgroundType === "white"
              ? ""
              : '<circle cx="400" cy="225" r="180" fill="#3b82f6" opacity="0.15" />'
          }
          <text x="50%" y="40%" dominant-baseline="middle" text-anchor="middle" fill="${textColor}" font-family="sans-serif" font-size="22" font-weight="bold">
            📈 AI FINANCIAL STOCK FACTORY
          </text>
          <text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle" fill="${textColor}" opacity="0.8" font-family="sans-serif" font-size="14">
            ${prompt.length > 50 ? prompt.substring(0, 50) + "..." : prompt}
          </text>
          <rect x="250" y="270" width="300" height="40" rx="8" fill="#2563eb" />
          <text x="50%" y="293" dominant-baseline="middle" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-size="13" font-weight="bold">
            ${backgroundType === "white" ? "Pure White Background (#FFFFFF)" : "Commercial Office Background"}
          </text>
        </svg>
      `;

      const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;

      const newImg = {
        id: Date.now().toString(),
        url: dataUrl,
        prompt: finalPrompt,
        createdAt: new Date().toLocaleTimeString(),
      };

      setGeneratedImages((prev) => [newImg, ...prev]);
      setIsGenerating(false);

      if (onGeneratedSuccess) {
        onGeneratedSuccess(finalPrompt);
      }
    }, 1800);
  };

  const handleCopyPrompt = (index: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
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
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
              생성 프롬프트 (영문 입력 권장)
            </label>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="생성하고 싶은 이미지 장면을 구체적으로 적으세요..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs font-mono text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
            />
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

            {/* Aspect Ratio */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                이미지 비율 (스톡 규격)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["16:9", "4:3", "1:1"] as const).map((ratio) => (
                  <button
                    key={ratio}
                    type="button"
                    onClick={() => setAspectRatio(ratio)}
                    className={`rounded-xl py-2.5 text-xs font-bold transition-all ${
                      aspectRatio === ratio
                        ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm"
                        : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Prompt Preview Banner */}
          <div className="rounded-xl bg-slate-100 p-3 dark:bg-slate-950 text-[11px] text-slate-600 dark:text-slate-400 font-mono">
            <span className="font-bold text-indigo-600 dark:text-indigo-400">자동 추가 보완 템플릿: </span>
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
                <span>스톡 이미지 팩토리 생성 중...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>AI 이미지 고화질 생성하기</span>
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
              상단 프롬프트를 입력하고 [AI 이미지 고화질 생성하기] 버튼을 누르시면 여기에 바로 생성됩니다.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {generatedImages.map((img, idx) => (
              <div
                key={img.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                {/* SVG Rendered Image */}
                <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
                  <img src={img.url} alt="Generated Stock" className="h-full w-full object-cover" />
                  <span className="absolute top-2 left-2 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-mono text-white backdrop-blur">
                    {img.createdAt}
                  </span>
                </div>

                {/* Card Content */}
                <div className="p-4 space-y-3">
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-mono line-clamp-2">
                    {img.prompt}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
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
                          try {
                            const res = await fetch("/api/stock-factory/google-drive", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                fileName: `stock_img_${img.id}.png`,
                                fileData: img.url,
                                category: "퇴직연금",
                              }),
                            });
                            const json = await res.json();
                            if (json.success) {
                              alert("☁️ Google Drive 15GB 무료 폴더에 성공적으로 자동 백업되었습니다!");
                            }
                          } catch (e) {
                            console.error(e);
                          }
                        }}
                        className="inline-flex items-center rounded-lg bg-blue-50 dark:bg-blue-950 px-2.5 py-1.5 text-xs font-bold text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900 border border-blue-200 dark:border-blue-800 transition-colors"
                        title="Google Drive로 원클릭 백업"
                      >
                        ☁️ 드라이브 저장
                      </button>

                      <a
                        href={img.url}
                        download={`stock_factory_${img.id}.svg`}
                        className="inline-flex items-center rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      >
                        <Download className="mr-1.5 h-3.5 w-3.5 text-indigo-500" /> 내 PC 저장
                      </a>
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
