"use client";

import { useState, ReactNode } from "react";
import { cn } from "@/lib/utils";

type DashboardTabsProps = {
  treasuryTab: ReactNode;
  ledgerTab: ReactNode;
  clearinghouseTab: ReactNode;
};

export function DashboardTabs({ treasuryTab, ledgerTab, clearinghouseTab }: DashboardTabsProps) {
  const [activeTab, setActiveTab] = useState<"treasury" | "ledger" | "clearinghouse">("treasury");

  return (
    <div className="w-full">
      {/* Navigation Tabs */}
      <div className="flex border-b border-white/10 mb-8 sticky top-0 bg-black/80 backdrop-blur-xl z-20">
        <button
          onClick={() => setActiveTab("treasury")}
          className={cn(
            "px-6 py-4 text-sm font-medium transition-all relative",
            activeTab === "treasury" ? "text-white" : "text-zinc-500 hover:text-zinc-300"
          )}
        >
          Treasury
          {activeTab === "treasury" && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 rounded-t-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("ledger")}
          className={cn(
            "px-6 py-4 text-sm font-medium transition-all relative",
            activeTab === "ledger" ? "text-white" : "text-zinc-500 hover:text-zinc-300"
          )}
        >
          Ledger
          {activeTab === "ledger" && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 rounded-t-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("clearinghouse")}
          className={cn(
            "px-6 py-4 text-sm font-medium transition-all relative",
            activeTab === "clearinghouse" ? "text-emerald-400" : "text-zinc-500 hover:text-zinc-300"
          )}
        >
          Clearinghouse
          {activeTab === "clearinghouse" && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-400 rounded-t-full shadow-[0_0_15px_rgba(52,211,153,0.5)]" />
          )}
        </button>
      </div>

      {/* Tab Content */}
      <div className="w-full">
        {activeTab === "treasury" && treasuryTab}
        {activeTab === "ledger" && ledgerTab}
        {activeTab === "clearinghouse" && clearinghouseTab}
      </div>
    </div>
  );
}
