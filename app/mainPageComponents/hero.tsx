import Link from "next/link";
import React from "react";

const previewDays = [
  { label: "Today", hasNote: true, hasImage: true },
  { label: "Yesterday", hasNote: true, hasImage: false },
  { label: "Mon", hasNote: false, hasImage: true },
  { label: "Sun", hasNote: false, hasImage: false },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white to-rose-50/30 pt-16 pb-24 sm:pt-24 sm:pb-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 text-center lg:text-left space-y-6">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700 ring-1 ring-inset ring-rose-600/10">
            Now Live: Daily Activity Tracker v1.0
          </span>

          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl leading-tight">
            Master your day, <br />
            <span className="text-[#E11D48] bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
              one stack at a time.
            </span>
          </h1>

          <p className="text-lg leading-8 text-slate-600 max-w-xl mx-auto lg:mx-0">
            Log notes and photos for the last 7 days. Look back at what you did,
            how you felt, and keep your streak alive.
          </p>

          <div className="mt-10 flex items-center justify-center lg:justify-start gap-x-6">
            <Link
              href="/sign-up"
              className="rounded-xl bg-[#E11D48] px-6 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-rose-700 transition duration-200"
            >
              Start Stacking Free
            </Link>
            <Link
              href="/dasboard"
              className="text-sm font-semibold leading-6 text-slate-900 flex items-center gap-2 group hover:text-rose-600 transition duration-200"
            >
              Open journal
              <span
                className="group-hover:translate-x-1 transition-transform"
                aria-hidden="true"
              >
                →
              </span>
            </Link>
          </div>
        </div>

        {/* Preview: recent days + note + image */}
        <div className="lg:col-span-5 relative w-full flex justify-center">
          <div className="relative w-full max-w-md lg:max-w-none rounded-2xl bg-white p-3 shadow-xl shadow-rose-100/40 border border-slate-100">
            <div className="flex items-center justify-between px-2 pb-3 border-b border-slate-100">
              <div>
                <p className="text-xs font-semibold text-slate-800">
                  App Dashboard Preview
                </p>
                <p className="text-[10px] text-slate-400">
                  Notes & photos for recent days
                </p>
              </div>
              <span className="text-[10px] font-medium text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                7 days
              </span>
            </div>

            <div className="mt-3 rounded-xl bg-slate-50 border border-slate-100 p-3 space-y-3">
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                Recent days
              </p>
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {previewDays.map((day, i) => (
                  <div
                    key={day.label}
                    className={`shrink-0 rounded-lg px-2 py-1.5 text-[10px] ${
                      i === 0
                        ? "bg-[#E11D48] text-white font-semibold"
                        : "bg-white border border-slate-200 text-slate-600"
                    }`}
                  >
                    <span className="block font-medium">{day.label}</span>
                    <span
                      className={
                        i === 0 ? "text-rose-100" : "text-slate-400"
                      }
                    >
                      {day.hasNote && "note "}
                      {day.hasImage && "photo"}
                      {!day.hasNote && !day.hasImage && "—"}
                    </span>
                  </div>
                ))}
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-700 mb-1.5">
                  Image · Today
                </p>
                <div className="aspect-[16/10] rounded-lg bg-gradient-to-br from-rose-100 to-white border border-slate-200 flex items-center justify-center">
                  <span className="text-[10px] text-slate-500">
                    Your activity photo
                  </span>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-700 mb-1.5">
                  Note · Today
                </p>
                <p className="text-[11px] leading-relaxed text-slate-600 rounded-lg bg-white border border-slate-200 p-2.5">
                  Log what you did each day — workouts, habits, or quick
                  reflections.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
