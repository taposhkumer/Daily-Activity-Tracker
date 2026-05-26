"use client";

import { useUser, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import LogoAnName from "../components/LogoAnName";

export default function Navbar() {
  const { isSignedIn, isLoaded } = useUser();

  return (
    <nav className="w-full flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
      <LogoAnName />
      <div className="flex items-center gap-3">
        {isLoaded && isSignedIn ? (
          <UserButton />
        ) : (
          <>
            <Link
              href="/sign-in"
              className="bg-[#E11D48] text-white font-medium px-5 py-2 rounded-lg hover:bg-rose-700 transition duration-200 shadow-sm text-sm"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="bg-white text-rose-600 border border-rose-200 font-medium px-5 py-2 rounded-lg hover:bg-rose-50 transition duration-200 text-sm"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
