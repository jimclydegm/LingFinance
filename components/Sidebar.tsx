"use client";

import React from "react";
import { BarChart3, Table, Search, Sparkles, BookOpen, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

export type DemoTab = "demo1" | "demo2" | "demo3";

interface SidebarProps {
  activeTab: DemoTab;
  onSelectTab: (tab: DemoTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab }) => {
  const navItems = [
    {
      id: "demo1" as DemoTab,
      title: "Finance Report & Viz",
      subtitle: "NVIDIA Growth Drivers",
      description: "Hyperscale vs ACIE revenue parity & Recharts visualization",
      icon: BarChart3,
      badge: "Demo 1",
      badgeColor: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    },
    {
      id: "demo2" as DemoTab,
      title: "Financial Modeling",
      subtitle: "Excel Workbook & Grid",
      description: "Alphabet 6-segment actuals mapping & 5,000+ formula updates",
      icon: Table,
      badge: "Demo 2",
      badgeColor: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
    },
    {
      id: "demo3" as DemoTab,
      title: "Financial Research",
      subtitle: "SEC Tool Calls & 10-K",
      description: "Spire Global (SPIR) Kpler divestiture & debt retirement analysis",
      icon: Search,
      badge: "Demo 3",
      badgeColor: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    },
  ];

  return (
    <aside className="w-72 border-r border-slate-800/80 bg-slate-950/60 backdrop-blur-md flex flex-col justify-between shrink-0">
      {/* Navigation Section */}
      <div className="p-4 space-y-4">
        <div className="px-2 pt-1">
          <p className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
            Demonstration Modules
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            Select a financial reasoning task
          </p>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={cn(
                  "w-full text-left p-3.5 rounded-xl transition-all duration-200 border flex flex-col gap-2 group relative",
                  isActive
                    ? "bg-slate-900/90 border-slate-700 shadow-lg shadow-black/40 text-white"
                    : "bg-slate-900/30 border-transparent hover:bg-slate-900/60 hover:border-slate-800 text-slate-400 hover:text-slate-200"
                )}
              >
                {isActive && (
                  <span className="absolute left-0 top-3 bottom-3 w-1 bg-gradient-to-b from-emerald-400 to-teal-500 rounded-r-full" />
                )}
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={cn(
                        "p-2 rounded-lg transition-colors",
                        isActive
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-slate-800/80 text-slate-400 group-hover:text-slate-300"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold tracking-tight text-slate-100">
                      {item.title}
                    </span>
                  </div>
                  <span
                    className={cn(
                      "text-[10px] font-mono px-2 py-0.5 rounded-full border",
                      item.badgeColor
                    )}
                  >
                    {item.badge}
                  </span>
                </div>
                <div className="pl-9">
                  <p className="text-xs font-medium text-slate-300">
                    {item.subtitle}
                  </p>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Model Spec & Quick Reference */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
        <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Ling 3.0 Flash Fin</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Specialized in quantitative financial analysis, multi-statement cross-validation, and high-precision financial modeling.
          </p>
          <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>Provider: InclusionAI</span>
            <span className="text-emerald-400 font-medium">Free Tier</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
