"use client";

import React, { useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ToastProps {
  id?: string;
  type?: "success" | "error" | "info";
  title: string;
  message?: string;
  duration?: number;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  type = "success",
  title,
  message,
  duration = 6000,
  onClose,
}) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-50 max-w-md w-full p-4 rounded-xl border shadow-2xl backdrop-blur-md transition-all duration-300 animate-in slide-in-from-bottom-5",
        type === "success" && "bg-slate-900/95 border-emerald-500/50 text-emerald-100 shadow-emerald-950/40",
        type === "error" && "bg-slate-900/95 border-rose-500/50 text-rose-100 shadow-rose-950/40",
        type === "info" && "bg-slate-900/95 border-cyan-500/50 text-cyan-100 shadow-cyan-950/40"
      )}
    >
      <div className="flex items-start gap-3">
        {type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />}
        {type === "error" && <AlertCircle className="w-5 h-5 text-rose-400 mt-0.5 shrink-0" />}
        {type === "info" && <Info className="w-5 h-5 text-cyan-400 mt-0.5 shrink-0" />}

        <div className="flex-1 text-sm">
          <h4 className="font-semibold text-slate-100">{title}</h4>
          {message && (
            <p className="mt-1 text-xs text-slate-300 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto pr-1">
              {message}
            </p>
          )}
        </div>

        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-200 transition-colors p-1"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
