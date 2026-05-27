"use client";

import Link from "next/link";

export default function LogoAnName() {
  return (
    <Link href="/" className="flex items-center gap-3 select-none">
      <div className="bg-slate-900 ring-1 ring-white/10 text-white p-3 rounded-2xl flex items-center justify-center shadow-lg shadow-slate-950/20">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3v18M12 3a9 9 0 0 1 9 9M12 3a9 9 0 0 0-9 9M21 12c-3 0-6 1.5-9 3m9-3c-3 0-6-1.5-9-3M3 12c3 0 6 1.5 9 3m-9-3c3 0 6-1.5 9-3"
          />
        </svg>
      </div>
      <span className="text-lg font-semibold tracking-tight text-white">
        <span className="text-cyan-300">Daily</span> <span className="text-slate-400">Activity</span>
      </span>
    </Link>
  );
}
