'use client';

import { useEffect, useState, useRef } from 'react';

const sentenceBank = {
  easy: [
    "Hi there.",
    "I like cats.",
    "Fast fox.",
    "Hello world.",
    "Nice job!"
  ],
  medium: [
    "The quick brown fox jumps over the lazy dog.",
    "Typing fast is a useful skill.",
    "Tailwind CSS is awesome.",
    "I love coding fun projects.",
    "Next.js makes building web apps easier."
  ],
  hard: [
    "JavaScript developers often face asynchronous challenges.",
    "Efficiency in algorithms can greatly affect performance.",
    "Next.js integrates both frontend and backend logic seamlessly.",
    "Performance optimization is vital for user experience.",
    "Complexity in state management can hinder scalability."
  ]
};

const wpmGoals = {
  easy: 20,
  medium: 40,
  hard: 60,
};

export default function Home() {
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [target, setTarget] = useState('');
  const [input, setInput] = useState('');

  const [skill, setSkill] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('typingSkill');
      return saved ? parseInt(saved, 10) : 0;
    }
    return 0;
  });

  const [wpmHistory, setWpmHistory] = useState<number[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('wpmHistory');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const [feedback, setFeedback] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState<number | null>(null);
  const [accuracy, setAccuracy] = useState<number>(100);
  const [isFinished, setIsFinished] = useState(false);

  // New loading state
  const [loading, setLoading] = useState(true);

  // User account state
  const [playerName, setPlayerName] = useState("");
  const [password, setPassword] = useState("");
  const [showAccountModal, setShowAccountModal] = useState(false);

  // Track equipped character and skip ability
  const [equippedCharacter, setEquippedCharacter] = useState<string | null>(null);
  const [skipUsed, setSkipUsed] = useState(0); // now a counter
  const maxSkips = equippedCharacter === 'default-typer' ? 1 : 0;

  // Theme state
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'light';
    }
    return 'light';
  });

  // Error state for name taken
  const [nameError, setNameError] = useState('');

  // Audio ref for typing sound
  const typingAudioRef = useRef<HTMLAudioElement | null>(null);

  // --- THEME PERSISTENCE ON LOAD ---
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(savedTheme);
      }
    }
  }, []);

  useEffect(() => {
    generateSentence();
  }, [difficulty]);

  useEffect(() => {
    // When target sentence is set, we consider loading done
    if (target) {
      setLoading(false);
    }
  }, [target]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('typingSkill', skill.toString());
    }
  }, [skill]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('wpmHistory', JSON.stringify(wpmHistory));
    }
  }, [wpmHistory]);

  // On mount, check for saved player info and theme
  useEffect(() => {
    const savedName = localStorage.getItem("playerName");
    const savedPass = localStorage.getItem("playerPassword");
    if (!savedName || !savedPass) {
      setShowAccountModal(true);
    } else {
      setPlayerName(savedName);
      setPassword(savedPass);
    }
    // Load skill and wpmHistory if not already loaded (for SSR safety)
    if (typeof window !== 'undefined') {
      const savedSkill = localStorage.getItem('typingSkill');
      if (savedSkill) setSkill(parseInt(savedSkill, 10));
      const savedWpmHistory = localStorage.getItem('wpmHistory');
      if (savedWpmHistory) setWpmHistory(JSON.parse(savedWpmHistory));
    }
    // Theme
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setEquippedCharacter(localStorage.getItem('equippedCharacter'));
    }
  }, []);

  // Reset skipUsed on new sentence
  useEffect(() => {
    setSkipUsed(0);
  }, [target]);

  // Apply theme to document root
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(theme);
      localStorage.setItem('theme', theme);
    }
  }, [theme]);

  // Helper to determine if we're in duel mode
  const isDuelMode = typeof window !== 'undefined' && window.location.pathname === '/duel';

  // Modified generateSentence for Pro Typer in duel mode
  const generateSentence = () => {
    setLoading(true); // show loading while choosing sentence

    let chosenDifficulty = difficulty;
    // Pro Typer ability: 50% chance of easier sentence in duel mode
    if (
      isDuelMode &&
      equippedCharacter === 'pro' &&
      Math.random() < 0.5 &&
      (difficulty === 'medium' || difficulty === 'hard')
    ) {
      chosenDifficulty = difficulty === 'hard' ? 'medium' : 'easy';
    }

    const sentenceList = sentenceBank[chosenDifficulty];
    const random = sentenceList[Math.floor(Math.random() * sentenceList.length)];
    setTarget(random);
    setInput('');
    setFeedback('');
    setWpm(null);
    setAccuracy(100);
    setStartTime(Date.now());
    setIsFinished(false);
  };

  const calculateAccuracy = (typed: string, correct: string) => {
    let correctCount = 0;
    for (let i = 0; i < typed.length; i++) {
      if (typed[i] === correct[i]) correctCount++;
    }
    return typed.length > 0 ? Math.round((correctCount / typed.length) * 100) : 100;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isFinished) return; // block input after finish

    const newVal = e.target.value;

    if (newVal.length < input.length) return; // prevent going backwards
    if (newVal.length > input.length + 1) return; // no skipping chars

    setInput(newVal);

    // Play typing sound
    if (typingAudioRef.current) {
      typingAudioRef.current.currentTime = 0;
      typingAudioRef.current.play();
    }

    const liveAccuracy = calculateAccuracy(newVal, target);
    setAccuracy(liveAccuracy);

    if (newVal.length === target.length) {
      setIsFinished(true);

      const endTime = Date.now();
      const durationInMinutes = (endTime - (startTime ?? endTime)) / 60000;
      const wordCount = target.trim().split(/\s+/).length;
      const calculatedWpm = Math.round(wordCount / durationInMinutes);

      setWpm(calculatedWpm);
      setSkill(prev => prev + 1);
      setWpmHistory(prev => [...prev, calculatedWpm]);

      // In solo mode, just show accuracy feedback, not 'You win!'
      setFeedback(`✅ Submitted! Accuracy: ${liveAccuracy}%`);

      setTimeout(() => {
        setFeedback("");
        window.location.href = "/";
      }, 3000);
    }
  };

  const handleAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setNameError('');
    if (playerName && password) {
      // Unique name logic
      let registeredNames: string[] = [];
      if (typeof window !== 'undefined') {
        const namesRaw = localStorage.getItem('registeredNames');
        if (namesRaw) registeredNames = JSON.parse(namesRaw);
        // If editing, allow keeping your own name
        const currentName = localStorage.getItem('playerName');
        const isNameTaken = registeredNames.includes(playerName) && playerName !== currentName;
        if (isNameTaken) {
          setNameError(`The name "${playerName}" is already taken.`);
          return;
        }
        // Remove old name if changed
        if (currentName && currentName !== playerName) {
          registeredNames = registeredNames.filter(n => n !== currentName);
        }
        // Add new name if not present
        if (!registeredNames.includes(playerName)) {
          registeredNames.push(playerName);
        }
        localStorage.setItem('registeredNames', JSON.stringify(registeredNames));
        localStorage.setItem('playerName', playerName);
        localStorage.setItem('playerPassword', password);
        setShowAccountModal(false);
      }
    }
  };

  const handleEditAccount = () => {
    setShowAccountModal(true);
  };

  const topWpm = wpmHistory.length > 0 ? Math.max(...wpmHistory) : 0;
  const averageWpm =
    wpmHistory.length > 0
      ? Math.round(wpmHistory.reduce((a, b) => a + b, 0) / wpmHistory.length)
      : 0;

  const currentGoal = wpmGoals[difficulty];

  const progressPercent = wpm && currentGoal ? Math.min((wpm / currentGoal) * 100, 100) : 0;

  const goalMet = wpm !== null && wpm >= currentGoal;
  const wpmColorClass = goalMet ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
  const progressBarColor = goalMet ? 'bg-green-600 dark:bg-green-400' : 'bg-red-600 dark:bg-red-400';

  const renderHighlightedTarget = () => {
    return (
      <p className="font-mono text-lg flex flex-wrap">
        {target.split('').map((char, idx) => {
          let className = 'px-0.5';
          const currentChar = input[idx];

          if (char === ' ') {
            char = '␣';
            className += ' bg-gray-300 dark:bg-gray-700 rounded';
          }

          if (idx < input.length) {
            className +=
              currentChar === target[idx]
                ? ' text-green-600 dark:text-green-400'
                : ' text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900';
          } else if (idx === input.length) {
            className += ' bg-yellow-200 dark:bg-yellow-500 text-black rounded';
          } else {
            className += ' text-gray-500 dark:text-gray-400';
          }

          return (
            <span key={idx} className={className}>
              {char}
            </span>
          );
        })}
      </p>
    );
  };

  // Main UI when loaded
  return (
    <main className="relative min-h-screen flex flex-col items-stretch bg-gradient-to-br from-white to-slate-100 dark:from-black dark:to-gray-900 p-0">

      {/* Top navigation buttons - stick to top */}
      <div className="fixed top-0 left-0 w-full flex flex-row justify-end gap-2 p-4 bg-white/80 dark:bg-black/80 z-50 shadow-md">
        <button
          className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white px-4 py-2 rounded-md font-semibold border border-gray-400 dark:border-gray-600 hover:bg-blue-500 hover:text-white transition"
          onClick={() => window.location.href = '/duel'}
        >
          Duel Mode
        </button>
        <button
          className="bg-yellow-400 dark:bg-yellow-600 text-black dark:text-white px-3 py-1 rounded-md font-semibold border border-yellow-600 hover:bg-yellow-500 transition"
          onClick={handleEditAccount}
        >
          Edit Account
        </button>
        <button
          className="bg-purple-500 text-white px-4 py-2 rounded-md font-semibold border border-purple-700 hover:bg-purple-600 transition"
          onClick={() => window.location.href = '/characters'}
        >
          Characters
        </button>
        <button
          className="bg-gray-900 text-white px-4 py-2 rounded-md font-semibold border border-gray-900 hover:bg-gray-700 transition"
          onClick={() => window.location.href = '/settings'}
        >
          Settings
        </button>
        <button
          className="bg-gray-500 text-white px-3 py-1 rounded-md font-semibold border border-gray-700 hover:bg-gray-600 transition"
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        >
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
      </div>
      <div className="h-20" /> {/* Spacer for fixed nav */}

      {/* Difficulty Panel */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex gap-2 bg-gray-200 dark:bg-gray-700 rounded-lg p-2 shadow">
          <button
            className={`px-4 py-2 rounded-md font-semibold transition ${
              difficulty === 'easy'
                ? 'bg-green-400 text-white shadow'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200'
            }`}
            onClick={() => setDifficulty('easy')}
          >
            Easy
          </button>
          <button
            className={`px-4 py-2 rounded-md font-semibold transition ${
              difficulty === 'medium'
                ? 'bg-yellow-400 text-white shadow'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200'
            }`}
            onClick={() => setDifficulty('medium')}
          >
            Medium
          </button>
          <button
            className={`px-4 py-2 rounded-md font-semibold transition ${
              difficulty === 'hard'
                ? 'bg-red-500 text-white shadow'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200'
            }`}
            onClick={() => setDifficulty('hard')}
          >
            Hard
          </button>
        </div>
      </div>

      <h1 className="text-5xl font-extrabold mb-6 text-center tracking-wide select-none">
        <span className="block text-black drop-shadow-lg animate-pulse">
          TYPE
        </span>
        <span className="block text-4xl font-extrabold mt-[-0.5rem] ml-32 text-red-600 drop-shadow-lg animate-pulse tracking-wider">
          DUELZ
        </span>
        <span className="block text-base font-normal text-gray-500 dark:text-gray-400 mt-2">{playerName && `(Player: ${playerName})`}</span>
      </h1>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg max-w-xl w-full mt-24 mx-auto">
        <p className="mb-2 text-lg text-gray-700 dark:text-gray-300">Type this sentence:</p>
        <div className="mb-4 bg-blue-100 dark:bg-blue-900 p-3 rounded-md text-wrap break-words">
          {renderHighlightedTarget()}
        </div>

        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyDown={e => {
            if (
              equippedCharacter === 'default-typer' &&
              e.key === 'Enter' &&
              skipUsed < maxSkips &&
              !isFinished
            ) {
              // Find the next space after the current input
              const nextSpace = target.indexOf(' ', input.length);
              if (nextSpace !== -1) {
                setInput(target.slice(0, nextSpace + 1));
              } else {
                setInput(target); // If no more spaces, fill to end
              }
              setSkipUsed(skipUsed + 1);
              e.preventDefault();
            }
          }}
          className="w-full p-3 border rounded-md text-black dark:text-white dark:bg-gray-700"
          placeholder="Start typing..."
          autoFocus
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          disabled={isFinished}
        />

        {feedback && (
          <p className="mt-3 text-lg font-semibold text-green-600 dark:text-green-400 animate-bounce">{feedback}</p>
        )}

        {wpm !== null ? (
          <>
            <div className={`mt-3 text-sm ${wpmColorClass}`}>
              🕐 WPM: <span className="font-bold">{wpm}</span><br />
              🎯 Accuracy: <span className="font-bold">{accuracy}</span>%
            </div>
            {/* Progress bar */}
            <div className="w-full bg-gray-300 dark:bg-gray-700 h-3 rounded-full mt-2 overflow-hidden">
              <div
                className={`${progressBarColor} h-full transition-all duration-500`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </>
        ) : (
          // Show live accuracy while typing before completion
          <div className="mt-3 text-sm text-gray-700 dark:text-gray-300">
            🎯 Accuracy: <span className="font-bold">{accuracy}</span>%
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            🧠 Skill Level: <span className="font-bold">{skill}</span>
          </p>
        </div>
      </div>

      {/* Account Modal */}
      {showAccountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <form onSubmit={handleAccountSubmit} className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg flex flex-col gap-4 min-w-[320px]">
            <h2 className="text-2xl font-bold mb-2 text-center">{playerName ? "Edit Account" : "Create Account"}</h2>
            <input
              type="text"
              placeholder="Player Name"
              value={playerName}
              onChange={e => { setPlayerName(e.target.value); setNameError(''); }}
              className="p-3 border rounded-md text-black dark:text-white dark:bg-gray-700"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="p-3 border rounded-md text-black dark:text-white dark:bg-gray-700"
              required
            />
            {nameError && <div className="text-red-600 dark:text-red-400 text-sm font-semibold">{nameError}</div>}
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md font-semibold mt-2 hover:bg-blue-600 transition">Save</button>
          </form>
        </div>
      )}

      {/* Average Accuracy Floating Corner */}
      <div className="fixed bottom-4 right-4 z-50 bg-white/90 dark:bg-gray-900/90 border border-gray-300 dark:border-gray-700 rounded-xl px-5 py-3 shadow-lg text-right">
        <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold mb-1">Avg. Accuracy</div>
        <div className="text-lg font-bold text-blue-700 dark:text-blue-300">
          {/* Since only the latest accuracy is tracked, show average of all completed rounds as 100% for now, or N/A if none */}
          {wpmHistory.length > 0 ? `${Math.round(accuracy)}%` : 'N/A'}
        </div>
      </div>
    </main>
  );
}
