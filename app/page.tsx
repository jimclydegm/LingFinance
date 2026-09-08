"use client";

import React, { useState } from "react";
import { Header } from "@/components/Header";
import { Sidebar, DemoTab } from "@/components/Sidebar";
import { Demo1FinanceReport } from "@/components/demos/Demo1FinanceReport";
import { Demo2ExcelModeling } from "@/components/demos/Demo2ExcelModeling";
import { Demo3FinancialResearch } from "@/components/demos/Demo3FinancialResearch";
import { Toast, ToastProps } from "@/components/Toast";

export default function Home() {
  const [activeTab, setActiveTab] = useState<DemoTab>("demo1");
  const [toast, setToast] = useState<Omit<ToastProps, "onClose"> | null>(null);

  const apiKeyConfigured = Boolean(
    process.env.NEXT_PUBLIC_OPENROUTER_API_KEY &&
      process.env.NEXT_PUBLIC_OPENROUTER_API_KEY.length > 5
  );

  const showToast = (
    title: string,
    message: string,
    type: "success" | "error" | "info" = "success"
  ) => {
    setToast({
      title,
      message,
      type,
      duration: 8000,
    });
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#080c14] text-slate-100 select-none">
      {/* Top Header */}
      <Header apiKeyConfigured={apiKeyConfigured} />

      {/* Main Workspace Area with Left Sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar activeTab={activeTab} onSelectTab={setActiveTab} />

        {/* Dynamic Workspace Container */}
        <main className="flex-1 overflow-hidden bg-gradient-to-br from-[#080c14] via-[#0d1322] to-[#0a0f1c] relative">
          {activeTab === "demo1" && <Demo1FinanceReport />}
          {activeTab === "demo2" && <Demo2ExcelModeling onShowToast={showToast} />}
          {activeTab === "demo3" && <Demo3FinancialResearch />}
        </main>
      </div>

      {/* Global Toast Notification */}
      {toast && (
        <Toast
          title={toast.title}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
