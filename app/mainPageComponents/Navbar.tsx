import React from 'react';

export default function Navbar() {
  return (
    <nav className="w-full bg-white px-6 py-4 flex items-center justify-between border-b border-gray-100">
      {/* Left Side: Logo and Brand Name */}
      <div className="flex items-center gap-3 select-none">
        {/* Plant Icon Container */}
        <div className="bg-[#E11D48] text-white p-2 rounded-xl flex items-center justify-center shadow-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 3v18M12 3a9 9 0 0 1 9 9M12 3a9 9 0 0 0-9 9M21 12c-3 0-6 1.5-9 3m9-3c-3 0-6-1.5-9-3M3 12c3 0 6 1.5 9 3m-9-3c3 0 6-1.5 9-3"
            />
          </svg>
        </div>

        {/* Brand Text */}
        <span className="text-xl font-bold tracking-tight text-slate-800">
          <span className="text-[#E11D48]">Daily</span> Activity
        </span>
      </div>

      {/* Right Side: Authentication Buttons */}
      <div className="flex items-center gap-3">
        {/* Sign In Button */}
        <button className="bg-[#E11D48] text-white font-medium px-5 py-2 rounded-lg hover:bg-rose-700 transition duration-200 shadow-sm text-sm">
          Sign In
        </button>

        {/* Sign Up Button */}
        <button className="bg-white text-rose-600 border border-rose-200 font-medium px-5 py-2 rounded-lg hover:bg-rose-50 transition duration-200 text-sm">
          Sign Up
        </button>
      </div>
    </nav>
  );
}