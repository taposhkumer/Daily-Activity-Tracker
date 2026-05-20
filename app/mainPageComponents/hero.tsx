// app/mainPageComponents/Hero.tsx
import React from 'react';

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white to-rose-50/30 pt-16 pb-24 sm:pt-24 sm:pb-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Side: Text Content & Actions */}
        <div className="lg:col-span-7 text-center lg:text-left space-y-6">
          {/* Subtle Tag/Badge */}
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700 ring-1 ring-inset ring-rose-600/10">
            Now Live: Daily Activity Tracker v1.0
          </span>

          {/* Main Headline */}
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl leading-tight">
           Master your day, <br />
            <span className="text-[#E11D48] bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
              one stack at a time.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg leading-8 text-slate-600 max-w-xl mx-auto lg:mx-0">
            Stop trying to change overnight. Daily Activity Tracker breaks your daily routines into bite-sized, sequential actions. Build unstoppable streaks, track your progress, and automate your self-discipline.
          </p>

          {/* Action Buttons */}
          <div className="mt-10 flex items-center justify-center lg:justify-start gap-x-6">
            <button className="rounded-xl bg-[#E11D48] px-6 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-rose-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600 transition duration-200">
              Start Stacking Free
            </button>
            <button className="text-sm font-semibold leading-6 text-slate-900 flex items-center gap-2 group hover:text-rose-600 transition duration-200">
              See how it works 
              <span className="group-hover:translate-x-1 transition-transform" aria-hidden="true">→</span>
            </button>
          </div>
        </div>

        {/* Right Side: Mockup / Illustration Placeholder */}
        <div className="lg:col-span-5 relative w-full flex justify-center">
          <div className="relative w-full max-w-md lg:max-w-none aspect-[4/3] rounded-2xl bg-white p-2 shadow-xl shadow-rose-100/40 border border-slate-100">
            {/* Inner Placeholder styling to look like an app screenshot layout */}
            <div className="w-full h-full rounded-xl bg-slate-50 border border-dashed border-slate-200 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-[#E11D48]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-slate-700">App Dashboard Preview</p>
              <p className="text-xs text-slate-400 mt-1 max-w-[200px]">Drop your Today's mostValuable Activity</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}