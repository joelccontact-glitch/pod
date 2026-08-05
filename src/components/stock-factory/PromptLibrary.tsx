"use client";

import { useState, useEffect } from "react";
import {
  Copy,
  Check,
  Search,
  Sparkles,
  ShieldCheck,
  Tag,
  Briefcase,
  Layers,
  ArrowUpRight,
} from "lucide-react";
import { StockPromptItem } from "@/app/api/stock-factory/prompts/route";

export function PromptLibrary({ onUsePrompt }: { onUsePrompt?: (prompt: string) => void }) {
  const [prompts, setPrompts] = useState<StockPromptItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("전체");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchPrompts() {
      try {
        const res = await fetch("/api/stock-factory/prompts");
        const json = await res.json();
        if (json.success) {
          setPrompts(json.data);
        }
      } catch (err) {
        console.error("Failed to load prompts:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPrompts();
  }, []);

  const categories = ["전체", "퇴직연금", "ETF", "AI 금융", "한국 직장인", "자산관리", "디지털 뱅킹"];

  const filteredPrompts = prompts.filter((item) => {
    const matchesCategory = selectedCategory === "전체" || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.prompt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Strategy Intro */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300 border border-emerald-500/30">
              <ShieldCheck className="mr-1.5 h-3.5 w-3.5" /> 어도비스톡 TOP 1% 베스트셀러 극세사 8K 프롬프트
            </span>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight">
              B2B 금융 · 퇴직연금 · ETF 프로급 프롬프트 라이브러리
            </h2>
            <p className="mt-1 text-sm text-slate-300">
              실제 어도비스톡과 크라우드픽에서 매월 수백만 원씩 판매되는 최고 레벨 작가들의 20가지 극세사 디테일 프롬프트입니다.
            </p>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Category Chips */}
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all duration-200 ${
                selectedCategory === cat
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                  : "bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Box */}
        <div className="relative shrink-0 sm:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="프롬프트, 키워드 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>
      </div>

      {/* Prompts Cards Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
        </div>
      ) : filteredPrompts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-800">
          <p className="text-sm font-semibold text-slate-500">검색 조건에 해당 프롬프트가 없습니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {filteredPrompts.map((item) => (
            <div
              key={item.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:border-indigo-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-800"
            >
              <div>
                {/* Header Badge */}
                <div className="flex items-center justify-between">
                  <span className="rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-900/60">
                    {item.category}
                  </span>
                  <div className="flex items-center space-x-1">
                    {item.targetSites.map((site, i) => (
                      <span key={i} className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono">
                        {site}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Title & Description */}
                <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
                  {item.title}
                </h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {item.description}
                </p>

                {/* Prompt Box */}
                <div className="mt-4 relative rounded-xl bg-slate-950 p-3.5 text-xs text-slate-200 font-mono leading-relaxed group">
                  <p className="pr-8">{item.prompt}</p>
                  <button
                    onClick={() => handleCopy(item.id, item.prompt)}
                    className="absolute top-2.5 right-2.5 rounded-lg bg-white/10 p-1.5 text-slate-300 hover:bg-white/20 hover:text-white transition-all"
                    title="프롬프트 복사"
                  >
                    {copiedId === item.id ? (
                      <Check className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {/* Negative Prompt */}
                <div className="mt-2 text-[11px] text-slate-400 dark:text-slate-500">
                  <span className="font-semibold text-rose-500">네거티브:</span> {item.negativePrompt}
                </div>

                {/* Recommended Keywords */}
                <div className="mt-3 flex flex-wrap gap-1">
                  {item.recommendedKeywords.map((kw, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center text-[10px] text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full"
                    >
                      <Tag className="mr-0.5 h-2.5 w-2.5 text-slate-400" /> #{kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => handleCopy(item.id, item.prompt)}
                  className="inline-flex items-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  {copiedId === item.id ? "복사 완료!" : "프롬프트 클립보드 복사"}
                </button>
                {onUsePrompt && (
                  <button
                    onClick={() => onUsePrompt(item.prompt)}
                    className="inline-flex items-center rounded-lg bg-indigo-50 dark:bg-indigo-950 px-3 py-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 transition-colors"
                  >
                    생성기에 적용 <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
