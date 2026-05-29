"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatDateToBangladeshYMD, parseBangladeshYMD } from "@/lib/dateUtils";
import { getMonthCompletionMap } from "@/lib/dailyAnalytics";
import { type Task } from "@/Types/DashboardTypes";

interface ProductivityCalendarProps {
  tasks: Task[];
  selectedDate?: string;
  onDateSelect?: (date: string) => void;
}

export default function ProductivityCalendar({
  tasks,
  selectedDate,
  onDateSelect,
}: ProductivityCalendarProps) {
  const today = formatDateToBangladeshYMD(parseBangladeshYMD(new Date()));
  const [displayDate, setDisplayDate] = useState<Date>(new Date());

  const monthCompletionMap = useMemo(() => {
    return getMonthCompletionMap(tasks, displayDate.getFullYear(), displayDate.getMonth());
  }, [tasks, displayDate]);

  const monthName = useMemo(() => {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Dhaka",
      month: "long",
      year: "numeric",
    }).format(displayDate);
  }, [displayDate]);

  const calendarDays = useMemo(() => {
    const year = displayDate.getFullYear();
    const month = displayDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const current = new Date(startDate);

    while (current <= lastDay || current.getDay() !== 0) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return days;
  }, [displayDate]);

  const handlePrevMonth = () => {
    setDisplayDate(new Date(displayDate.getFullYear(), displayDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setDisplayDate(new Date(displayDate.getFullYear(), displayDate.getMonth() + 1));
  };

  const getColorByPercentage = (percentage: number): string => {
    if (percentage === 0) {
      return "bg-slate-800/30 border-slate-700/20 text-slate-600";
    }
    
    // High completion (80-100): Deep emerald
    if (percentage >= 80) {
      const intensity = (percentage - 80) / 20; // 0-1
      return "bg-emerald-700 border-emerald-600/70 text-emerald-100 shadow-lg shadow-emerald-900/30";
    }
    
    // Medium-high (60-79): Emerald with reduced opacity
    if (percentage >= 60) {
      return "bg-emerald-600/80 border-emerald-500/60 text-emerald-50 shadow-md shadow-emerald-900/20";
    }
    
    // Medium (40-59): Cyan
    if (percentage >= 40) {
      return "bg-cyan-600/70 border-cyan-500/50 text-cyan-50 shadow-sm shadow-cyan-900/15";
    }
    
    // Medium-low (20-39): Cyan with reduced opacity
    if (percentage >= 20) {
      return "bg-cyan-500/60 border-cyan-400/40 text-cyan-50";
    }
    
    // Low (1-19): Slate with color hint
    if (percentage >= 1) {
      return "bg-slate-700/40 border-slate-600/30 text-slate-400";
    }
    
    return "bg-slate-800/30 border-slate-700/20 text-slate-600";
  };

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-4"
    >
      {/* Header with Navigation */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-100">{monthName}</h3>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePrevMonth}
            className="p-1.5 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:text-slate-100 hover:border-slate-600/50 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleNextMonth}
            className="p-1.5 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:text-slate-100 hover:border-slate-600/50 transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="space-y-2">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-1.5 mb-2">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center text-xs font-semibold text-slate-500 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Date Grid */}
        <div className="grid grid-cols-7 gap-1.5">
          <AnimatePresence mode="popLayout">
            {calendarDays.map((date, idx) => {
              const dateStr = formatDateToBangladeshYMD(date);
              const stat = monthCompletionMap[dateStr];
              const isCurrentMonth =
                date.getMonth() === displayDate.getMonth();
              const isSelected = dateStr === selectedDate;
              const isToday = dateStr === today;

              // Determine color based on completion percentage or today
              let colorClass = "bg-slate-800/30 border-slate-700/20 text-slate-600";
              if (isCurrentMonth && stat) {
                if (isToday) {
                  // Today always shows emerald, depth based on percentage
                  colorClass = `${getColorByPercentage(stat.percentage).replace('text-', 'text-emerald-')}`.replace(/bg-[^ ]+ border-[^ ]+/, "bg-emerald-600 border-emerald-500/70 ring-1 ring-emerald-400");
                  colorClass = stat.percentage === 0 
                    ? "bg-emerald-600/60 border-emerald-500/50 text-emerald-50 ring-1 ring-emerald-400"
                    : `${getColorByPercentage(stat.percentage)} ring-1 ring-emerald-400`;
                } else {
                  colorClass = getColorByPercentage(stat.percentage);
                }
              } else if (!isCurrentMonth) {
                colorClass = "bg-slate-900/20 border-slate-700/20 text-slate-500";
              }

              return (
                <motion.button
                  key={dateStr}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: idx * 0.01 }}
                  onClick={() => onDateSelect?.(dateStr)}
                  className={`aspect-square rounded-lg border transition-all text-xs font-medium flex items-center justify-center ${
                    isCurrentMonth && isSelected
                      ? "ring-2 ring-cyan-400 ring-offset-2 ring-offset-black"
                      : ""
                  } ${colorClass}`}
                  title={isCurrentMonth ? `${dateStr} - ${stat?.percentage || 0}%` : ""}
                >
                  <span>{date.getDate()}</span>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-slate-700/50 space-y-3">
        <p className="text-xs font-semibold text-slate-400">Completion Intensity</p>
        
        {/* Gradient Bar */}
        <div className="space-y-2">
          <div className="flex gap-1 h-4 rounded-lg overflow-hidden border border-slate-600/30">
            <div className="flex-1 bg-slate-800/30"></div>
            <div className="flex-1 bg-cyan-500/60"></div>
            <div className="flex-1 bg-cyan-600/70"></div>
            <div className="flex-1 bg-emerald-600/80"></div>
            <div className="flex-1 bg-emerald-700"></div>
          </div>
          <div className="flex justify-between text-xs text-slate-400">
            <span>0%</span>
            <span>25%</span>
            <span>50%</span>
            <span>75%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Special Cases */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-emerald-600 border border-emerald-500/70 ring-1 ring-emerald-400"></div>
            <span className="text-xs text-slate-400">Today (any completion)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2 border-cyan-400"></div>
            <span className="text-xs text-slate-400">Selected date</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
