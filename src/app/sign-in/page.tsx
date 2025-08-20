// ...removed Clerk SignIn import...

import React, { useEffect, useState } from "react";

export default function SignInPage() {
  const [duelPoints, setDuelPoints] = useState(0);
  useEffect(() => {
    if (typeof window !== "undefined") {
      setDuelPoints(parseInt(localStorage.getItem("duelPoints") || "0", 10));
    }
  }, []);
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-white to-slate-100 dark:from-black dark:to-gray-900">
      <h1 className="text-4xl font-bold mb-8 text-purple-700 dark:text-purple-300 drop-shadow-lg">TypeDuels Sign In</h1>
      <div className="flex items-center mb-4 w-full justify-center">
        <span className="bg-blue-200 text-blue-800 px-4 py-2 rounded font-bold text-lg mr-4 shadow">Duel Points: {duelPoints}</span>
        <button
          className="px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 text-white text-2xl font-extrabold shadow-lg hover:scale-105 hover:from-purple-600 hover:to-pink-600 transition-all duration-200 border-4 border-white dark:border-gray-800"
          onClick={() => alert('Sign-in logic goes here!')}
        >
          Sign In
        </button>
      </div>
      <p className="mt-6 text-gray-600 dark:text-gray-400 text-lg">Welcome to the fastest typing duels on the web!</p>
    </div>
  );
}
