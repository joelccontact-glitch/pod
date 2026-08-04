"use client";

import { useState } from "react";
import {
  Layers,
  Plus,
  Download,
  FolderArchive,
  CheckCircle2,
  Sliders,
  ChevronRight,
  TrendingUp,
  FileSpreadsheet,
} from "lucide-react";

interface SeriesItem {
  id: string;
  name: string;
  category: string;
  targetCount: number;
  completedCount: number;
  variations: string[];
  status: "진행중" | "완료" | "대기";
}

export function SeriesManager() {
  const [seriesList, setSeriesList] = useState<SeriesItem[]>([
    {
      id: "s1",
      name: "퇴직연금 (DC/IRP) 상담 시리즈",
      category: "금융",
      targetCount: 50,
      completedCount: 32,
      variations: ["태블릿 설명 구도", "30대 직장인 부부", "50대 은퇴 준비", "회사 HR 교육"],
      status: "진행중",
    },
    {
      id: "s2",
      name: "ETF 투자 & 주식 포트폴리오 시리즈",
      category: "ETF",
      targetCount: 50,
      completedCount: 45,
      variations: ["AI ETF 대시보드", "노트북 분석 구도", "주식 차트 배경", "스마트폰 확인"],
      status: "진행중",
    },
    {
      id: "s3",
      name: "AI 기반 업무 자동화 회의 시리즈",
      category: "AI",
      targetCount: 50,
      completedCount: 50,
      variations: ["유리 회의실 구도", "개발자 팀원", "스마트패드 시연", "블루 톤 오피스"],
      status: "완료",
    },
    {
      id: "s4",
      name: "한국 직장인 비즈니스 라이브러리",
      category: "직장인",
      targetCount: 100,
      completedCount: 68,
      variations: ["발표 회의", "재택근무 화상미팅", "커피 브레이크", "노트북 협업"],
      status: "진행중",
    },
  ]);

  const [newSeriesName, setNewSeriesName] = useState<string>("");
  const [newTarget, setNewTarget] = useState<number>(50);

  const handleAddSeries = () => {
    if (!newSeriesName.trim()) return;
    const newItem: SeriesItem = {
      id: Date.now().toString(),
      name: newSeriesName,
      category: "금융",
      targetCount: newTarget,
      completedCount: 0,
      variations: ["기본 구도", "인물 변형", "배경 변형", "기기 변형"],
      status: "진행중",
    };
    setSeriesList((prev) => [newItem, ...prev]);
    setNewSeriesName("");
  };

  const exportCSV = () => {
    const headers = ["Series ID,Series Name,Category,Completed,Target,Status\n"];
    const rows = seriesList.map(
      (s) => `${s.id},"${s.name}",${s.category},${s.completedCount},${s.targetCount},${s.status}\n`
    );
    const blob = new Blob([...headers, ...rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "stock_series_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Strategy Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-900 via-purple-950 to-slate-900 p-6 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-bold text-indigo-300 border border-indigo-500/30">
              <TrendingUp className="mr-1.5 h-3.5 w-3.5" /> 스톡 노출 및 구매율 300% 상승 전략
            </span>
            <h2 className="mt-2 text-xl font-extrabold tracking-tight">
              20~50장 묶음 '시리즈 팩토리' 관리자
            </h2>
            <p className="mt-1 text-xs text-slate-300">
              단품 1장보다 동일 주제의 20~50장 다양한 구도/상황 변형 시리즈가 검색 노출과 세트 구매 확률을 극대화합니다.
            </p>
          </div>
          <button
            onClick={exportCSV}
            className="inline-flex items-center rounded-xl bg-white/10 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/20 transition-all shrink-0 border border-white/20"
          >
            <FileSpreadsheet className="mr-2 h-4 w-4 text-emerald-400" />
            시리즈 데이터 CSV 내보내기
          </button>
        </div>
      </div>

      {/* Add New Series Box */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 mb-3">
          신규 시리즈 테마 추가하기
        </h4>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="시리즈 명칭 (예: 노후 자산 관리 50장 패키지)"
            value={newSeriesName}
            onChange={(e) => setNewSeriesName(e.target.value)}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
          />
          <select
            value={newTarget}
            onChange={(e) => setNewTarget(Number(e.target.value))}
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
          >
            <option value={20}>20장 시리즈</option>
            <option value={50}>50장 시리즈</option>
            <option value={100}>100장 시리즈</option>
          </select>
          <button
            onClick={handleAddSeries}
            className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-500/20 hover:bg-indigo-700 transition-all shrink-0"
          >
            <Plus className="mr-1.5 h-4 w-4" /> 시리즈 신규 생성
          </button>
        </div>
      </div>

      {/* Series Cards Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {seriesList.map((item) => {
          const percent = Math.round((item.completedCount / item.targetCount) * 100);
          return (
            <div
              key={item.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-600 dark:bg-blue-950 dark:text-blue-300">
                  {item.category}
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    item.status === "완료"
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                  }`}
                >
                  {item.status}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {item.name}
                </h3>
                <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                  <span>제작 달성률</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {item.completedCount} / {item.targetCount} 장 ({percent}%)
                  </span>
                </div>
                <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>

              {/* Variations Chip */}
              <div>
                <span className="text-[11px] font-bold text-slate-500">포함된 구도/상황 변형:</span>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {item.variations.map((v, idx) => (
                    <span
                      key={idx}
                      className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:text-slate-300"
                    >
                      ✓ {v}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
