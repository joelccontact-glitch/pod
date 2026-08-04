"use client";

import { useState } from "react";
import {
  Tag,
  Copy,
  Check,
  Sparkles,
  Award,
  AlertCircle,
  CheckCircle2,
  FileText,
  HelpCircle,
} from "lucide-react";

export function MetadataGenerator() {
  const [topic, setTopic] = useState<string>("퇴직연금 DC IRP 상담");
  const [category, setCategory] = useState<string>("금융");
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<{
    topic: string;
    category: string;
    approvalScore: number;
    titles: string[];
    descriptions: string[];
    keywords: string[];
    keywordCount: number;
    seoTips: string[];
  } | null>(null);

  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);

    try {
      const res = await fetch("/api/stock-factory/generate-metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, category }),
      });
      const json = await res.json();
      if (json.success) {
        setResult(json.data);
      }
    } catch (err) {
      console.error("Failed to generate metadata:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (section: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            <Tag className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-white">
              SEO 메타데이터 (제목 & 40개 키워드) 자동 생성기
            </h2>
            <p className="mt-0.5 text-xs text-slate-300">
              이미지 주제 입력 한 번으로 크라우드픽 / Adobe Stock / Shutterstock 승인용 메타데이터 40종을 1초 만에 추출합니다.
            </p>
          </div>
        </div>
      </div>

      {/* Input Control Box */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
              이미지 주제 / 콘셉트 (예: ETF 투자 분석 중인 한국 직장인)
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="예: 퇴직연금 수령 상담하는 중년 부부"
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
              스톡 카테고리
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
            >
              <option value="금융">금융 / 연금 / ETF</option>
              <option value="AI">AI & IT 데이터</option>
              <option value="직장인">한국 직장인 & 회의</option>
              <option value="자산">노후 & 자산관리</option>
              <option value="배경">비즈니스 배경</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || !topic.trim()}
          className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-xs font-extrabold text-white shadow-md shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>메타데이터 AI 분석 추출 중...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              <span>제목 5종 & 키워드 40개 추출하기</span>
            </>
          )}
        </button>
      </div>

      {/* Results Display */}
      {result && (
        <div className="space-y-6">
          {/* Score & Compatibility Banner */}
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 dark:border-emerald-900/50 dark:bg-emerald-950/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-white font-extrabold text-lg shadow-md shadow-emerald-500/30">
                {result.approvalScore}점
              </div>
              <div>
                <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" /> 스톡 사이트 승인 예상율 HIGH
                </h4>
                <p className="text-xs text-emerald-700 dark:text-emerald-300">
                  크라우드픽(국내) 및 해외 스톡 사이트 메타데이터 SEO 표준 완벽 부합
                </p>
              </div>
            </div>

            <button
              onClick={() => handleCopy("all_keywords", result.keywords.join(", "))}
              className="inline-flex items-center rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition-all shrink-0"
            >
              {copiedSection === "all_keywords" ? (
                <>
                  <Check className="mr-1.5 h-4 w-4" /> 40개 키워드 한 번에 복사됨!
                </>
              ) : (
                <>
                  <Copy className="mr-1.5 h-4 w-4" /> 40개 키워드 전체 복사
                </>
              )}
            </button>
          </div>

          {/* Titles & Keywords Detail Grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* SEO Titles Box */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="h-4 w-4 text-indigo-500" />
                  크라우드픽 추천 SEO 제목 (5가지 버전)
                </h4>
              </div>
              <div className="space-y-2">
                {result.titles.map((title, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-xl bg-slate-50 p-3 dark:bg-slate-950 text-xs font-medium text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-800"
                  >
                    <span>{title}</span>
                    <button
                      onClick={() => handleCopy(`title_${i}`, title)}
                      className="ml-2 rounded p-1 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 text-[10px] font-bold"
                    >
                      {copiedSection === `title_${i}` ? "복사됨" : "복사"}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Keyword Chips (40 Keywords) */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Tag className="h-4 w-4 text-indigo-500" />
                  추천 SEO 타겟 키워드 ({result.keywordCount}개)
                </h4>
                <button
                  onClick={() => handleCopy("all_keywords", result.keywords.join(", "))}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  전체 복사
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-60 overflow-y-auto p-1">
                {result.keywords.map((kw, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center rounded-lg bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-900/50"
                  >
                    #{kw}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
