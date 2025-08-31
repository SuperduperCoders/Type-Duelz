"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function DuelEnd() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [time, setTime] = useState(0);
  const [xp, setXP] = useState(0);

  useEffect(() => {
    const t = searchParams.get("time");
    const x = searchParams.get("xp");
    setTime(t ? parseFloat(t) : 0);
    setXP(x ? parseInt(x, 10) : 0);
  }, [searchParams]);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-white to-slate-100 dark:from-black dark:to-gray-900">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 w-full max-w-md flex flex-col items-center border border-gray-200 dark:border-gray-800">
        <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 bg-clip-text text-transparent drop-shadow-lg">Duel Complete!</h1>
        <div className="mb-4 w-full flex flex-col gap-2 text-lg font-semibold text-gray-700 dark:text-gray-200">
          <span>Time Taken: <span className="font-bold text-blue-600 dark:text-blue-300">{time} seconds</span></span>
          <span>XP Earned: <span className="font-bold text-green-600 dark:text-green-300">{xp}</span></span>
        </div>
        <button
          className="mt-6 w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 text-white text-xl font-bold shadow-lg hover:scale-105 transition-all duration-200 border-2 border-white dark:border-gray-800"
          onClick={() => router.push("/dashboard")}
        >
          Back to Dashboard 
        </button>
      </div>
    </div>
  );
}
