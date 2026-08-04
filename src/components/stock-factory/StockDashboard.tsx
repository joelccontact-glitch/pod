"use client";

import { useState } from "react";
import {
  TrendingUp,
  Target,
  Image as ImageIcon,
  Download,
  DollarSign,
  CheckCircle2,
  Clock,
  Briefcase,
  Bot,
  Users,
  Award,
  Layers,
  ChevronRight,
} from "lucide-react";

export function StockDashboard({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({
    gen: false,
    check: false,
    meta: false,
    upload: false,
  });

  const toggleTask = (key: string) => {
    setCompletedTasks((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const categories = [
    { name: "금융 / 퇴직연금 / ETF", target: 300, current: 0, color: "bg-blue-500", label: "추천 ★★★★★" },
    { name: "AI & 스마트 오피스", target: 300, current: 0, color: "bg-indigo-500", label: "인기 ★★★★☆" },
    { name: "한국 직장인 & 회의", target: 300, current: 0, color: "bg-purple-500", label: "수요 ★★★★☆" },
    { name: "디지털 뱅킹 / 핀테크", target: 200, current: 0, color: "bg-emerald-500", label: "전문 ★★★★★" },
    { name: "시니어 & 노후 자산", target: 200, current: 0, color: "bg-amber-500", label: "틈새 ★★★★☆" },
    { name: "비즈니스 배경 & 패턴", target: 300, current: 0, color: "bg-cyan-500", label: "스테디 ★★★☆☆" },
  ];

  const totalCurrent = categories.reduce((sum, c) => sum + c.current, 0);
  const totalTarget = 2000;
  const progressPercent = Math.round((totalCurrent / totalTarget) * 100);

  return (
    <div className="space-y-6">
      {/* Target & KPI Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* KPI 1 */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-5 text-white shadow-lg shadow-blue-500/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-100">
              월 수익 목표 (6~12개월)
            </span>
            <DollarSign className="h-6 w-6 text-blue-200" />
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold tracking-tight">₩500,000</span>
            <span className="text-xs font-medium text-blue-200">~ ₩1,000,000</span>
          </div>
          <p className="mt-2 text-xs text-blue-100/90">
            크라우드픽 + Adobe Stock + Shutterstock 동시 판매
          </p>
          <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-white/10 blur-xl pointer-events-none" />
        </div>

        {/* KPI 2 */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">누적 이미지 등록</span>
            <ImageIcon className="h-5 w-5 text-indigo-500" />
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {totalCurrent.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500">/ {totalTarget.toLocaleString()} 장</span>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* KPI 3 */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">목표 월 다운로드</span>
            <Download className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">100 ~ 200</span>
            <span className="text-xs text-emerald-600 font-medium">건 / 월</span>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            단순 이미지보다 전문 B2B 금융 이미지 구매율 3배 높음
          </p>
        </div>

        {/* KPI 4 */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">승인율 관리</span>
            <Award className="h-5 w-5 text-amber-500" />
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">98.5%</span>
            <span className="text-xs font-bold text-emerald-600">HIGH</span>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            SEO 자동 메타데이터 & 로고/손가락 왜곡 사전 검증 적용
          </p>
        </div>
      </div>

      {/* Main Content Split: Daily 30-min Routine & Category Progress */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Category Breakdown & Quick Actions */}
        <div className="space-y-6 lg:col-span-2">
          {/* Action Banner */}
          <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white shadow-md border border-indigo-900/50">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="inline-flex items-center rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-300 border border-blue-500/30">
                  <Briefcase className="mr-1.5 h-3.5 w-3.5" /> SI / 퇴직연금 전문성 특화 파이프라인
                </span>
                <h3 className="mt-2 text-xl font-extrabold tracking-tight text-white">
                  오늘의 스톡 이미지 대량 생성 시작하기
                </h3>
                <p className="mt-1 text-sm text-slate-300">
                  퇴직연금(DC/DB/IRP), ETF, AI 비즈니스 등 기업이 구매하는 프롬프트를 바로 실행하세요.
                </p>
              </div>
              <button
                onClick={() => onNavigate("generator")}
                className="inline-flex items-center shrink-0 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/25 hover:from-blue-600 hover:to-indigo-700 transition-all duration-200"
              >
                <Bot className="mr-2 h-4 w-4" />
                이미지 팩토리 가동
              </button>
            </div>
          </div>

          {/* Category Progress Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="h-5 w-5 text-indigo-500" />
                  스톡 이미지 카테고리별 제작 목표 현황
                </h3>
                <p className="text-xs text-slate-500">
                  기업 구매율이 가장 높은 TOP 6 금융/AI 비즈니스 테마
                </p>
              </div>
              <button
                onClick={() => onNavigate("prompts")}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center"
              >
                프롬프트 보러가기 <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              {categories.map((cat, idx) => {
                const percent = Math.round((cat.current / cat.target) * 100);
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <div className="flex items-center space-x-2 font-medium text-slate-700 dark:text-slate-200">
                        <span>{cat.name}</span>
                        <span className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 dark:text-slate-400">
                          {cat.label}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 font-mono">
                        {cat.current} / {cat.target} 장 ({percent}%)
                      </span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className={`h-full rounded-full ${cat.color} transition-all duration-500`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Daily 30-min Routine Checklist */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Clock className="h-5 w-5 text-amber-500" />
                  하루 30분 스톡 생산 루틴
                </h3>
                <p className="text-xs text-slate-500">매일 꾸준한 자동화 작업으로 월 3,000장 확보</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {/* Task 1 */}
              <div
                onClick={() => toggleTask("gen")}
                className={`cursor-pointer flex items-start space-x-3 rounded-xl p-3 border transition-all duration-200 ${
                  completedTasks.gen
                    ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/50 dark:bg-emerald-950/20"
                    : "border-slate-200 bg-slate-50/50 hover:bg-slate-100/50 dark:border-slate-800 dark:bg-slate-800/40"
                }`}
              >
                <CheckCircle2
                  className={`mt-0.5 h-5 w-5 shrink-0 transition-colors ${
                    completedTasks.gen ? "text-emerald-500" : "text-slate-300 dark:text-slate-600"
                  }`}
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      1. AI 이미지 생성 (15장)
                    </span>
                    <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-1.5 py-0.5 rounded">
                      10분
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">
                    퇴직연금/ETF 프롬프트 템플릿 사용
                  </p>
                </div>
              </div>

              {/* Task 2 */}
              <div
                onClick={() => toggleTask("check")}
                className={`cursor-pointer flex items-start space-x-3 rounded-xl p-3 border transition-all duration-200 ${
                  completedTasks.check
                    ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/50 dark:bg-emerald-950/20"
                    : "border-slate-200 bg-slate-50/50 hover:bg-slate-100/50 dark:border-slate-800 dark:bg-slate-800/40"
                }`}
              >
                <CheckCircle2
                  className={`mt-0.5 h-5 w-5 shrink-0 transition-colors ${
                    completedTasks.check ? "text-emerald-500" : "text-slate-300 dark:text-slate-600"
                  }`}
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      2. 품질 검수 & 손가락/텍스트 체크
                    </span>
                    <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-1.5 py-0.5 rounded">
                      5분
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">
                    로고, 상표권, 손가락 개수 최종 점검
                  </p>
                </div>
              </div>

              {/* Task 3 */}
              <div
                onClick={() => toggleTask("meta")}
                className={`cursor-pointer flex items-start space-x-3 rounded-xl p-3 border transition-all duration-200 ${
                  completedTasks.meta
                    ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/50 dark:bg-emerald-950/20"
                    : "border-slate-200 bg-slate-50/50 hover:bg-slate-100/50 dark:border-slate-800 dark:bg-slate-800/40"
                }`}
              >
                <CheckCircle2
                  className={`mt-0.5 h-5 w-5 shrink-0 transition-colors ${
                    completedTasks.meta ? "text-emerald-500" : "text-slate-300 dark:text-slate-600"
                  }`}
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      3. SEO 제목 & 키워드 40개 추출
                    </span>
                    <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-1.5 py-0.5 rounded">
                      10분
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">
                    메타데이터 자동 생성 도구 활용
                  </p>
                </div>
              </div>

              {/* Task 4 */}
              <div
                onClick={() => toggleTask("upload")}
                className={`cursor-pointer flex items-start space-x-3 rounded-xl p-3 border transition-all duration-200 ${
                  completedTasks.upload
                    ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/50 dark:bg-emerald-950/20"
                    : "border-slate-200 bg-slate-50/50 hover:bg-slate-100/50 dark:border-slate-800 dark:bg-slate-800/40"
                }`}
              >
                <CheckCircle2
                  className={`mt-0.5 h-5 w-5 shrink-0 transition-colors ${
                    completedTasks.upload ? "text-emerald-500" : "text-slate-300 dark:text-slate-600"
                  }`}
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      4. 크라우드픽 & 스톡 사이트 업로드
                    </span>
                    <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-1.5 py-0.5 rounded">
                      5분
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">
                    크라우드픽 + Adobe Stock 멀티 등록
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stock Platforms Grid */}
          <div className="mt-6 border-t border-slate-100 dark:border-slate-800 pt-4">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
              멀티 파이프라인 판매 스톡 플랫폼
            </h4>
            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-2 font-semibold text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-300">
                크라우드픽 (국내 1위)
              </div>
              <div className="rounded-lg border border-indigo-200 bg-indigo-50/50 p-2 font-semibold text-indigo-700 dark:border-indigo-900/50 dark:bg-indigo-950/30 dark:text-indigo-300">
                Adobe Stock (해외 1위)
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-2 font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300">
                Shutterstock
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-2 font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300">
                Freepik Contributor
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
