"use client";

interface OverallProgressProps {
  percentage: number;
  label?: string;
  size?: "sm" | "md" | "lg";
}

export default function OverallProgress({
  percentage,
  label = "Progress",
  size = "md",
}: OverallProgressProps) {
  const sizeClasses = {
    sm: "h-6",
    md: "h-8",
    lg: "h-10",
  };

  const percentageClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className={`font-medium text-slate-300 ${percentageClasses[size]}`}>
          {label}
        </span>
        <span className={`font-semibold text-slate-100 ${percentageClasses[size]}`}>
          {percentage}%
        </span>
      </div>
      <div className={`w-full rounded-full bg-slate-800/50 overflow-hidden ${sizeClasses[size]}`}>
        <div
          className="h-full rounded-full bg-linear-to-r from-cyan-400 to-blue-500 transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
