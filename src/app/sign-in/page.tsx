// ...removed Clerk SignIn import...

"use client";
import React, { useEffect, useState } from "react";
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  const [duelPoints, setDuelPoints] = useState(0);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setDuelPoints(parseInt(localStorage.getItem("duelPoints") || "0", 10));
    }
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!username || !password) {
      setError("Please enter both username and password.");
      return;
    }
    setLoading(true);
    // Simulate sign-in delay
    setTimeout(() => {
      setLoading(false);
      if (username === "admin" && password === "admin") {
        setSuccess("Sign-in successful! Welcome, admin.");
        setError("");
      } else {
        setError("Invalid username or password.");
        setSuccess("");
      }
    }, 1200);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-100 to-green-100 dark:from-black dark:to-gray-900 p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-10 border border-purple-200 dark:border-purple-800">
        <div className="flex flex-col items-center mb-6">
          <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-green-400 shadow-lg mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-3A2.25 2.25 0 008.25 5.25V9m7.5 0h-7.5m7.5 0v10.5A2.25 2.25 0 0113.5 21h-3a2.25 2.25 0 01-2.25-2.25V9m7.5 0a2.25 2.25 0 012.25 2.25v7.5A2.25 2.25 0 0115.75 21h-7.5A2.25 2.25 0 016 18.75v-7.5A2.25 2.25 0 018.25 9" />
            </svg>
          </span>
          <h1 className="text-4xl font-extrabold text-center text-purple-700 dark:text-purple-300 tracking-tight mb-1">Sign In</h1>
          <p className="text-gray-500 dark:text-gray-400 text-center text-base">Welcome back! Please sign in to continue.</p>
        </div>

        <form className="space-y-6" onSubmit={handleSignIn}>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
            <div className="relative">
              <input
                id="username"
                type="text"
                autoComplete="username"
                className="block w-full rounded-lg border border-purple-300 dark:border-purple-700 bg-gray-50 dark:bg-gray-800 py-2 px-4 text-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Enter your username"
                disabled={loading}
              />
              <span className="absolute inset-y-0 left-0 flex items-center pl-2">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.657 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </span>
            </div>
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                className="block w-full rounded-lg border border-purple-300 dark:border-purple-700 bg-gray-50 dark:bg-gray-800 py-2 px-4 text-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={loading}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center px-3 text-purple-400 hover:text-purple-600 focus:outline-none"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10a9.96 9.96 0 012.125-6.125M6.343 6.343A9.96 9.96 0 012 9c0 5.523 4.477 10 10 10a9.96 9.96 0 006.125-2.125M17.657 17.657A9.96 9.96 0 0022 15c0-5.523-4.477-10-10-10a9.96 9.96 0 00-6.125 2.125" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-.274.832-.642 1.624-1.104 2.354M15.5 15.5l-7-7" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 rounded-lg bg-gradient-to-r from-purple-500 to-green-400 text-white font-bold text-lg shadow-md hover:scale-105 transition-transform duration-150 focus:outline-none focus:ring-2 focus:ring-purple-400"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Signing In...
              </span>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {(error || success) && (
          <div className={`mt-6 text-center px-4 py-2 rounded-lg font-semibold text-base ${error ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" : "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"}`}>
            {error ? error : success}
          </div>
        )}

  {/* Clerk SignIn removed. Only custom sign-in form is shown. */}
      </div>
    </main>
  );
}
