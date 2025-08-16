"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function SettingsPage() {
  const [playerName, setPlayerName] = useState("");
  const [theme, setTheme] = useState("light");
  const [averageAccuracy, setAverageAccuracy] = useState<number | null>(null);
  const [codeInput, setCodeInput] = useState("");
  const [codeMessage, setCodeMessage] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPlayerName(localStorage.getItem("playerName") || "");
      setTheme(localStorage.getItem("theme") || "light");
      // Calculate average accuracy from solo and duel
      const soloAcc = localStorage.getItem("soloAccuracyHistory");
      const duelAcc = localStorage.getItem("duelAccuracyHistory");
      let accArr: number[] = [];
      if (soloAcc) accArr = accArr.concat(JSON.parse(soloAcc));
      if (duelAcc) accArr = accArr.concat(JSON.parse(duelAcc));
      if (accArr.length > 0) {
        setAverageAccuracy(Math.round(accArr.reduce((a, b) => a + b, 0) / accArr.length));
      } else {
        setAverageAccuracy(null);
      }
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("playerName", playerName);
    localStorage.setItem("theme", theme);
    // Apply theme immediately
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", theme === "dark");
    }
    alert("Settings saved!");
  };

  return (
    <main className="min-h-screen flex flex-col items-center bg-gradient-to-br from-white to-slate-100 dark:from-black dark:to-gray-900 p-4">
      <h1 className="text-3xl font-bold mb-6">⚙️ Settings</h1>
      <form onSubmit={handleSave} className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg flex flex-col gap-4 min-w-[320px] max-w-md w-full">
        <label className="font-semibold">In-Game Name
          <input
            type="text"
            value={playerName}
            onChange={e => setPlayerName(e.target.value)}
            className="mt-1 p-3 border rounded-md text-black dark:text-white dark:bg-gray-700 w-full"
            required
          />
        </label>
        <label className="font-semibold">Theme
          <select
            value={theme}
            onChange={e => setTheme(e.target.value)}
            className="mt-1 p-3 border rounded-md text-black dark:text-white dark:bg-gray-700 w-full"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </label>
        {/* Code Redemption Bar */}
        <label className="font-semibold">Redeem Code
          <div className="flex gap-2 mt-1">
            <input
              type="text"
              value={codeInput}
              onChange={e => setCodeInput(e.target.value)}
              className="p-3 border rounded-md text-black dark:text-white dark:bg-gray-700 w-full"
              placeholder="Enter code..."
            />
            <button
              type="button"
              className="bg-green-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-green-700 transition"
              onClick={() => {
                if (codeInput === "Daniel2013") {       
                  localStorage.setItem("duelPoints", (10000000000000).toString());
                  localStorage.setItem("typingSkill", (1000000000000).toString());
                  setCodeMessage("Success! 10,000,000,000 Duel Points and Skill Points added.");
                } else {
                  setCodeMessage("Invalid code.");
                  
                  setTimeout(() => setCodeMessage(""), 3000); // Clear message after 3 seconds
                  
                  
                }
              }}
            >
              Redeem
            </button>
          </div>
          {codeMessage && <div className="text-sm mt-1 font-semibold text-green-600 dark:text-green-400">{codeMessage}</div>}
        </label>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md font-semibold mt-2 hover:bg-blue-600 transition">Save</button>
      </form>
      <div className="mt-8 text-lg text-center">
        <div className="mb-2">Average Accuracy:</div>
        <div className="text-2xl font-bold">
          {averageAccuracy !== null ? `${averageAccuracy}%` : "No data yet"}
        </div>
      </div>
      <Link href="/" className="mt-8 text-blue-600 hover:underline">← Back to Home</Link>
    </main>
  );
}
