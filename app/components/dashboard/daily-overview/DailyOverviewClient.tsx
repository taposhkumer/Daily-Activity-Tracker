"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { formatDateToBangladeshYMD, parseBangladeshYMD } from "@/lib/dateUtils";
import TodaysSection from "./TodaysSection";
import ProductivityCalendar from "./ProductivityCalendar";
import StreakAnalytics from "./StreakAnalytics";
import DayDetailsPanel from "./DayDetailsPanel";
import { type Category, type Task } from "@/Types/DashboardTypes";

interface DailyOverviewClientProps {
  tasks: Task[];
  allTasks: Task[];
  categories: Category[];
}

export default function DailyOverviewClient({
  tasks,
  allTasks,
  categories,
}: DailyOverviewClientProps) {
  const today = formatDateToBangladeshYMD(parseBangladeshYMD(new Date()));
  const [selectedDate, setSelectedDate] = useState<string>(today);
  const [detailsPanelOpen, setDetailsPanelOpen] = useState(false);

  const selectedDateTasks = useMemo(() => {
    return allTasks.filter((task) => {
      const taskDate = typeof task.date === "string" ? task.date : String(task.date);
      return taskDate === selectedDate;
    });
  }, [allTasks, selectedDate]);

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setDetailsPanelOpen(true);
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Main Grid Layout: 2 columns on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6">
        {/* Left Section: Today's Overview */}
        <div className="lg:col-span-8 space-y-6">
          {/* Today's Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-slate-900/40 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm"
          >
            <TodaysSection
              date={today}
              tasks={tasks}
              categories={categories}
            />
          </motion.div>
        </div>

        {/* Right Sidebar Section: Calendar + Analytics */}
        <div className="lg:col-span-4 space-y-6">
          {/* Calendar Section - Compact */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-slate-900/40 border border-slate-700/50 rounded-2xl p-4 backdrop-blur-sm"
          >
            <ProductivityCalendar
              tasks={allTasks}
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
              compact={true}
            />
          </motion.div>

          {/* Streak Analytics */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-slate-900/40 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm"
          >
            <h2 className="text-sm font-semibold text-slate-100 mb-4">
              Streak Analytics
            </h2>
            <StreakAnalytics tasks={allTasks} />
          </motion.div>
        </div>
      </div>

      {/* Day Details Panel */}
      <DayDetailsPanel
        date={selectedDate}
        tasks={allTasks}
        categories={categories}
        isOpen={detailsPanelOpen}
        onClose={() => setDetailsPanelOpen(false)}
      />
    </div>
  );
}
