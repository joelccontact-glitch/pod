"use client";

import Link from "next/link";
import { Sparkles, ShoppingBag } from "lucide-react";

export function TopMasterTab() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/90 transition-colors duration-200">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-3.5 py-1.5 sm:px-6 lg:px-8">

        {/* Brand Logo / Link to Shop - Click to Go Home / Reset Initial Screen */}
        <Link 
          href="/" 
          onClick={() => {
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new Event('go-home-reset'));
            }
          }}
          className="flex items-center space-x-2.5 group cursor-pointer"
          title="첫화면으로 이동 (Reset to Initial Screen)"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white shadow-sm group-hover:scale-105 transition-transform duration-200">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
            <span className="font-extrabold text-slate-800 dark:text-slate-100 text-base sm:text-lg tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              Little Paws Studio Shop
            </span>
            <span className="hidden sm:inline-block rounded-full bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
              POD Studio
            </span>
          </div>
        </Link>


        {/* Status Badge */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Shop Active</span>
          </div>
          <div className="hidden lg:flex items-center space-x-1.5 text-slate-500 dark:text-slate-400">
            <Sparkles className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
            <span>Vercel Auto Deploy Active</span>
          </div>
        </div>
      </div>
    </header>
  );
}

