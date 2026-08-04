"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  Sparkles,
  Wand2,
  Tag,
  Layers,
  TrendingUp,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { StockDashboard } from "@/components/stock-factory/StockDashboard";
import { PromptLibrary } from "@/components/stock-factory/PromptLibrary";
import { StockImageGenerator } from "@/components/stock-factory/StockImageGenerator";
import { MetadataGenerator } from "@/components/stock-factory/MetadataGenerator";
import { SeriesManager } from "@/components/stock-factory/SeriesManager";

export default function StockFactoryPage() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [generatorPrompt, setGeneratorPrompt] = useState<string>("");

  const handleUsePromptFromLibrary = (prompt: string) => {
    setGeneratorPrompt(prompt);
    setActiveTab("generator");
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-200">
      {/* Hero Header Area */}
      <div className="border-b border-slate-200/80 bg-white/70 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/70">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center rounded-full bg-blue-600/10 px-3 py-1 text-xs font-bold text-blue-600 dark:bg-blue-400/10 dark:text-blue-400 border border-blue-600/20">
                  <TrendingUp className="mr-1.5 h-3.5 w-3.5" /> B2B Stock Automation System
                </span>
                <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Target ₩1,000,000 / Month
                </span>
              </div>
              <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                AI Financial Stock Factory
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                금융 · 퇴직연금 · ETF · AI 비즈니스 스톡 이미지 자동 대량 생성 및 메타데이터 파이프라인
              </p>
            </div>

            {/* Top Quick Status Badge */}
            <div className="flex items-center space-x-3 text-xs bg-slate-100 dark:bg-slate-800 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700">
              <ShieldCheck className="h-5 w-5 text-emerald-500" />
              <div>
                <div className="font-bold text-slate-800 dark:text-slate-200">스톡 승인율 99% 규격 준수</div>
                <div className="text-[11px] text-slate-500">배경 제거 #FFFFFF & 로고 사전 검증</div>
              </div>
            </div>
          </div>

          {/* Sub Navigation Bar */}
          <div className="mt-6 flex overflow-x-auto space-x-1 border-t border-slate-200 dark:border-slate-800 pt-4 scrollbar-none">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center space-x-2 shrink-0 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                activeTab === "dashboard"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>대시보드 & 루틴</span>
            </button>

            <button
              onClick={() => setActiveTab("prompts")}
              className={`flex items-center space-x-2 shrink-0 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                activeTab === "prompts"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              }`}
            >
              <Sparkles className="h-4 w-4" />
              <span>금융 프롬프트 팩토리</span>
            </button>

            <button
              onClick={() => setActiveTab("generator")}
              className={`flex items-center space-x-2 shrink-0 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                activeTab === "generator"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              }`}
            >
              <Wand2 className="h-4 w-4" />
              <span>AI 이미지 생성기</span>
            </button>

            <button
              onClick={() => setActiveTab("metadata")}
              className={`flex items-center space-x-2 shrink-0 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                activeTab === "metadata"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              }`}
            >
              <Tag className="h-4 w-4" />
              <span>SEO 메타데이터 (40개 키워드)</span>
            </button>

            <button
              onClick={() => setActiveTab("series")}
              className={`flex items-center space-x-2 shrink-0 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                activeTab === "series"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              }`}
            >
              <Layers className="h-4 w-4" />
              <span>시리즈 팩토리 (20~50장 묶음)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main View Area */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {activeTab === "dashboard" && <StockDashboard onNavigate={(tab) => setActiveTab(tab)} />}
        {activeTab === "prompts" && (
          <PromptLibrary onUsePrompt={(p) => handleUsePromptFromLibrary(p)} />
        )}
        {activeTab === "generator" && (
          <StockImageGenerator
            initialPrompt={generatorPrompt}
            onGeneratedSuccess={() => setActiveTab("metadata")}
          />
        )}
        {activeTab === "metadata" && <MetadataGenerator />}
        {activeTab === "series" && <SeriesManager />}
      </div>
    </main>
  );
}
