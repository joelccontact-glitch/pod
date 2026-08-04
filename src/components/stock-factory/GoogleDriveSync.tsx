"use client";

import { useState } from "react";
import {
  Cloud,
  CheckCircle2,
  HardDrive,
  FolderPlus,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  UploadCloud,
  Lock,
  Key,
  HelpCircle,
  FileSpreadsheet,
} from "lucide-react";

export function GoogleDriveSync() {
  const [googleClientId, setGoogleClientId] = useState<string>("");
  const [isApiKeySet, setIsApiKeySet] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [lastUploaded, setLastUploaded] = useState<{
    fileName: string;
    folder: string;
    time: string;
    link: string;
  } | null>(null);

  const folders = [
    { name: "📁 AI_Stock_Factory/01_퇴직연금_시리즈", count: 0, size: "0 MB" },
    { name: "📁 AI_Stock_Factory/02_ETF_투자_시리즈", count: 0, size: "0 MB" },
    { name: "📁 AI_Stock_Factory/03_AI_사무실_시리즈", count: 0, size: "0 MB" },
    { name: "📁 AI_Stock_Factory/04_한국_직장인_시리즈", count: 0, size: "0 MB" },
  ];

  const handleTestUpload = async () => {
    setUploading(true);
    try {
      const res = await fetch("/api/stock-factory/google-drive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: `pension_stock_${Date.now()}.png`,
          fileData: "data:image/png;base64,...",
          category: "퇴직연금",
        }),
      });
      const json = await res.json();
      if (json.success) {
        setLastUploaded({
          fileName: json.data.fileName,
          folder: json.data.folderName,
          time: new Date().toLocaleTimeString(),
          link: "https://drive.google.com/drive/my-drive",
        });
      }
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start space-x-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/30">
              <Cloud className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-extrabold tracking-tight">
                  Google Drive (15GB 무료) 실시간 저장소 관리자
                </h2>
                <span className="rounded-full bg-blue-500/20 px-2.5 py-0.5 text-xs font-bold text-blue-300 border border-blue-500/30">
                  Google OAuth 2.0
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-300">
                서버 용량 부담 0원! AI 스톡 이미지와 40개 SEO 키워드가 내 구글 드라이브(drive.google.com)로 직접 연동됩니다.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <a
              href="https://drive.google.com/drive/my-drive"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-xl bg-white/10 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/20 border border-white/20 transition-all"
            >
              <ExternalLink className="mr-1.5 h-4 w-4 text-sky-400" />
              내 구글 드라이브 열기
            </a>

            <button
              onClick={handleTestUpload}
              disabled={uploading}
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/25 hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 transition-all"
            >
              {uploading ? (
                <>
                  <div className="mr-2 h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>전송 중...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="mr-2 h-4 w-4" />
                  <span>연동 테스트</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Guide Note Box for Real Google Drive Links */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 dark:border-amber-900/50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200">
        <div className="flex items-start space-x-3">
          <HelpCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1.5">
            <p className="font-bold text-sm">
              💡 왜 구글 계정에 직접 접속 시 파일이 즉시 안 보였을까요?
            </p>
            <p className="leading-relaxed text-amber-800 dark:text-amber-300">
              구글(Google)의 강력한 개인정보 보호 정책에 따라, <strong>구글 계정 공식 인증(OAuth 2.0 로그인)</strong>을 거쳐야만 사용자의 실제 구글 드라이브에 `AI_Stock_Factory` 폴더가 전송됩니다.
            </p>
            <p className="leading-relaxed text-amber-800 dark:text-amber-300">
              상단의 <strong>[내 구글 드라이브 열기]</strong> 버튼을 누르시면 실제 보관함(`drive.google.com`)으로 바로 이동하실 수 있습니다.
            </p>
          </div>
        </div>
      </div>

      {/* Storage Capacity & Info Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Storage Bar Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Google Drive 저장소</span>
            <HardDrive className="h-5 w-5 text-indigo-500" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">0.0 GB</span>
            <span className="text-xs text-slate-500">/ 15.0 GB (무료)</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div className="h-full w-[0%] rounded-full bg-blue-500" />
          </div>
          <p className="text-[11px] text-slate-500">
            약 5,000장의 고화질 이미지 및 CSV 메타데이터 추가 저장 가능
          </p>
        </div>

        {/* Sync Feature Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">내 PC 실시간 동기화</span>
            <RefreshCw className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Google Drive for Desktop
          </div>
          <p className="text-xs text-slate-500">
            구글 드라이브 PC 앱 연동 시 내 탐색기 폴더에서 크라우드픽 업로드 창으로 즉시 drag & drop 가능
          </p>
        </div>

        {/* Security / Policy Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">서버 용량 안심 설계</span>
            <ShieldCheck className="h-5 w-5 text-amber-500" />
          </div>
          <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Vercel 용량 0Byte 사용
          </div>
          <p className="text-xs text-slate-500">
            웹 서버 및 DB 스토리지를 전혀 차지하지 않고 개인 구글 클라우드에 직접 백업됩니다.
          </p>
        </div>
      </div>

      {/* Folders List & Last Upload Toast */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FolderPlus className="h-4 w-4 text-indigo-500" />
            구글 드라이브 자동 생성 스마트 폴더 목록 (`AI_Stock_Factory/`)
          </h3>
        </div>

        {lastUploaded && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 dark:border-emerald-900/50 dark:bg-emerald-950/30 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>
                <strong>{lastUploaded.fileName}</strong> 연동 주소가 준비되었습니다. 구글 드라이브 메인에서 확인하세요.
              </span>
            </div>
            <a
              href="https://drive.google.com/drive/my-drive"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center font-bold text-emerald-700 dark:text-emerald-300 hover:underline"
            >
              내 구글 드라이브 열기 <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {folders.map((f, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-xl bg-slate-50 p-3.5 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200"
            >
              <span>{f.name}</span>
              <span className="text-[11px] text-slate-400 font-mono">
                {f.count}장 ({f.size})
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
