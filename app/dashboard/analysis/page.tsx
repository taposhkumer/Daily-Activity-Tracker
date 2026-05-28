"use client";

import React from "react";
import Sidebar from "../../components/SideBar/Sidebar";
import DashboardAnalytics from "../DashboardAnalytics";

export default function DashboardAnalysisPage() {
  return (
    <div className="min-h-screen flex bg-black">
      <Sidebar />
      <main className="flex-1 p-6 bg-black">
        <DashboardAnalytics />
      </main>
    </div>
  );
}
