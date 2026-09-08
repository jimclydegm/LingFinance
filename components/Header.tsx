"use client";

import React, { useState } from "react";
import { Cpu, Wifi, CheckCircle2, ShieldCheck, Sparkles, AlertTriangle } from "lucide-react";
import { LING_MODEL_ID } from "@/lib/openrouter";

interface HeaderProps {
  apiKeyConfigured: boolean;
}

export const Header: React.FC<HeaderProps> = ({ apiKeyConfigured }) => {
  const [showKeyModal, setShowKeyModal] = useState(false);

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Brand & App Name */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 p-0.5 shadow-lg shadow-emerald-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[7px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-tight">Ling 3 Flash Fin Demo</h1>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                INTERNAL PREVIEW
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Engine: <span className="text-slate-300 font-medium">{LING_MODEL_ID}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center gap-3">
        {/* OpenRouter Model Target Indicator */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs font-mono text-slate-300">
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-400">Target:</span>
          <span className="text-cyan-300 font-semibold">ling-3.0-flash-fin:free</span>
        </div>

        {/* API Status Indicator */}
        <button
          onClick={() => setShowKeyModal(!showKeyModal)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all text-xs font-medium cursor-pointer"
        >
          {apiKeyConfigured ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-emerald-400 flex items-center gap-1">
                <Wifi className="w-3.5 h-3.5" />
                <span>OpenRouter Connected</span>
              </span>
            </>
          ) : (
            <>
              <span className="h-2 w-2 rounded-full bg-amber-400"></span>
              <span className="text-amber-400 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Key Missing</span>
              </span>
            </>
          )}
        </button>

        {showKeyModal && (
          <div className="absolute top-16 right-6 w-80 p-4 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 text-xs text-slate-300">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 font-medium text-slate-200">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <ShieldCheck className="w-4 h-4" /> Environment Status
              </span>
              <button onClick={() => setShowKeyModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div className="mt-3 space-y-2 font-mono text-[11px]">
              <div>
                <span className="text-slate-500">Endpoint:</span>
                <div className="text-slate-300 truncate">https://openrouter.ai/api/v1/chat/completions</div>
              </div>
              <div>
                <span className="text-slate-500">Model:</span>
                <div className="text-cyan-300 truncate">{LING_MODEL_ID}</div>
              </div>
              <div>
                <span className="text-slate-500">API Key:</span>
                <div className="text-emerald-400 truncate">
                  {apiKeyConfigured ? "sk-or-v1-••••••••••••••••" : "Not configured"}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
