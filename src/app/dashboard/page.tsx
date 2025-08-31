
// Solo mode page moved to /dashboard

'use client';

// All unused imports, variables, and assignments removed to fix eslint errors

import { useRouter } from "next/navigation";
import React from "react";

export default function Home() {
  const router = useRouter();
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-white to-slate-100 dark:from-black dark:to-gray-900">
      <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 bg-clip-text text-transparent drop-shadow-lg">TypeDuels</h1>
      <div className="flex flex-col gap-6 w-full max-w-md">
        <button
          className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 text-white text-2xl font-bold shadow-lg hover:scale-105 transition-all duration-200 border-2 border-white dark:border-gray-800"
          onClick={() => router.push("/duelstart")}
        >
          Duel Mode
        </button>

        {/* Add other mode buttons here if needed */}
          <button
            className="w-full py-2 rounded-xl bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-lg font-semibold shadow hover:bg-gray-300 dark:hover:bg-gray-700 transition-all duration-200 border-2 border-white dark:border-gray-800 mt-4"
            onClick={() => router.push("/")}
          >
            Back to Home
          </button>
      </div>
    </div>
  );
}
