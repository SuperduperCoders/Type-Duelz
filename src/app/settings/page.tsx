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

  const handleRedeem = () => {
    if (codeInput === "Daniel2013") {
      localStorage.setItem("duelPoints", (10000000000000).toString());
      localStorage.setItem("typingSkill", (1000000000000).toString());
      setCodeMessage("Success! 10,000,000,000 Duel Points and Skill Points added.");
    } 
    
    else if (codeInput === "randomevent123") {
      const events = [
        () => {
          localStorage.setItem("duelPoints", ((parseInt(localStorage.getItem("duelPoints") || "0")) + 500).toString());
          return "🎉 You won +500 Duel Points!";
        },
        () => {
          localStorage.setItem("typingSkill", ((parseInt(localStorage.getItem("typingSkill") || "0")) + 1000).toString());
          return "🔥 You gained +1,000 Typing Skill Points!";
        },
        () => {
          localStorage.setItem("theme", "rainbow");
          return "🌈 Secret Rainbow Theme Unlocked!";
        },
        () => {
          return "😂 Surprise! Nothing happened... or did it?";
        },
        () => {
          localStorage.setItem("frenzyBoost", "true");
          return "⚡ Frenzy Boost Activated! (check your next game!)";
        }
      ];
      const randomEvent = events[Math.floor(Math.random() * events.length)];
      setCodeMessage(randomEvent());
    } 
    
    else {
      setCodeMessage("Invalid code.");
      setTimeout(() => setCodeMessage(""), 3000); // Clear message after 3 sec
    }
  };

  return (
  <main className={`min-h-screen flex flex-col items-center p-4 ${theme === 'rainbow' ? 'rainbow-theme' : 'bg-gradient-to-br from-white to-slate-100 dark:from-black dark:to-gray-900'}` }>
  <h1 className={`text-3xl font-bold mb-6 ${theme === 'rainbow' ? 'rainbow-text' : ''}`}>⚙️ Settings</h1>
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
            <option value="rainbow">Rainbow 🌈</option>
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
              onClick={handleRedeem}
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
        <div className={`text-2xl font-bold ${theme === 'rainbow' ? 'rainbow-text' : ''}` }>
          {averageAccuracy !== null ? `${averageAccuracy}%` : "No data yet"}
        </div>
      </div>
      <Link href="/" className="mt-8 text-blue-600 hover:underline">← Back to Home</Link>
      {/* Sign Out button only accessible in Settings */}
      <div className="mt-8">
        <form action="/sign-out" method="post">
          <button
            type="submit"
            className="px-5 py-2 font-semibold rounded-lg bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-white shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-400"
          >
            <span className="inline-flex items-center gap-2">
              <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1' /></svg>
              Sign Out
            </span>
          </button>
        </form>
      </div>
    </main>
  );
}
