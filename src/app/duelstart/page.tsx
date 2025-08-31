"use client";
import React, { useEffect, useState } from "react";
import { useXP } from "../XPProvider";
import { useRouter } from "next/navigation";

export default function DuelStart() {
  const router = useRouter();
  const [playerName, setPlayerName] = useState("");
  const [equippedCharacter, setEquippedCharacter] = useState("");
  const [wpmHistory, setWpmHistory] = useState<number[]>([]);
  const { xp, level } = useXP();

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPlayerName(localStorage.getItem("playerName") || "");
      setEquippedCharacter(localStorage.getItem("equippedCharacter") || "None");
      const history = localStorage.getItem("wpmHistory");
      setWpmHistory(history ? JSON.parse(history) : []);
    }
  }, []);

  const averageWpm = wpmHistory.length > 0 ? Math.round(wpmHistory.reduce((a, b) => a + b, 0) / wpmHistory.length) : 0;

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-white to-slate-100 dark:from-black dark:to-gray-900">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 w-full max-w-md flex flex-col items-center border border-gray-200 dark:border-gray-800">
        {/* Level at the top for higher visibility */}
        <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-300 mb-2">Level: {level}</span>
        <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 bg-clip-text text-transparent drop-shadow-lg">Duel Mode Stats</h1>
        <div className="mb-4 w-full flex flex-col gap-2">
          <span className="text-lg font-semibold text-gray-700 dark:text-gray-200">Player Name: <span className="font-bold text-purple-600 dark:text-purple-300">{playerName || "Not set"}</span></span>
          <span className="text-lg font-semibold text-gray-700 dark:text-gray-200">Equipped Character: <span className="font-bold text-blue-600 dark:text-blue-300">{equippedCharacter}</span></span>
          <span className="text-lg font-semibold text-gray-700 dark:text-gray-200">Average WPM: <span className="font-bold text-pink-600 dark:text-pink-300">{averageWpm}</span></span>
          <span className="text-lg font-semibold text-gray-700 dark:text-gray-200">XP: <span className="font-bold text-green-600 dark:text-green-300">{xp}</span></span>
        </div>
        <button
          className="mt-6 w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 text-white text-xl font-bold shadow-lg hover:scale-105 transition-all duration-200 border-2 border-white dark:border-gray-800"
          onClick={() => router.push("/duel")}
        >
          Start Duel
        </button>
      </div>
    </div>
  );
}
