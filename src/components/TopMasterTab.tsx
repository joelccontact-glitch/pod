"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, TrendingUp, ShoppingBag, Layers } from "lucide-react";

export function TopMasterTab() {
  const pathname = usePathname();

  const isStockFactory = pathname.startsWith("/stock-factory");
  const isShop = !isStockFactory;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/90 transition-colors duration-200">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-3 py-2 sm:px-6 lg:px-8">
        {/* Brand Logo / Label */}
        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white shadow-sm">
            <Layers className="h-4 w-4" />
          </div>
          <span className="font-extrabold text-slate-800 dark:text-slate-100 text-sm sm:text-base tracking-tight">
            Joel Multi-Studio
          </span>
          <span className="hidden sm:inline-block rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            Enterprise Hub
          </span>
        </div>

        {/* Master Tab Bar */}
        <nav className="flex items-center rounded-xl bg-slate-100/90 p-1 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-inner">
          <Link
            href="/"
            className={`flex items-center space-x-1.5 sm:space-x-2 rounded-lg px-2.5 py-1.5 sm:px-3.5 text-xs sm:text-sm font-semibold transition-all duration-200 ${
              isShop
                ? "bg-white text-indigo-600 shadow-md shadow-indigo-100 dark:bg-slate-800 dark:text-indigo-400 dark:shadow-none"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <ShoppingBag className={`h-4 w-4 ${isShop ? "text-indigo-500" : "text-slate-400"}`} />
            <span>Little Paws Studio Shop</span>
            {isShop && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
            )}
          </Link>

          <Link
            href="/stock-factory"
            className={`flex items-center space-x-1.5 sm:space-x-2 rounded-lg px-2.5 py-1.5 sm:px-3.5 text-xs sm:text-sm font-semibold transition-all duration-200 ${
              isStockFactory
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <TrendingUp className={`h-4 w-4 ${isStockFactory ? "text-white" : "text-slate-400"}`} />
            <span>AI Financial Stock Factory</span>
            <span className="hidden md:inline-flex items-center rounded-full bg-blue-500/20 dark:bg-blue-400/20 px-1.5 py-0.5 text-[10px] font-bold text-blue-700 dark:text-blue-300">
              NEW
            </span>
          </Link>
        </nav>

        {/* Quick Info / Status Badge */}
        <div className="hidden lg:flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
          <Sparkles className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
          <span>Vercel Auto Deploy Active</span>
        </div>
      </div>
    </header>
  );
}
