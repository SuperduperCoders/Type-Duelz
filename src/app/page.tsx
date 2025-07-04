'use client';

import { useEffect, useState, useRef } from 'react';
import { useErrorAudio } from "../hooks/useErrorAudio";
import Image from 'next/image';
import dynamic from 'next/dynamic';

const NamePicker = dynamic(() => import('./components/NamePicker'), { ssr: false });

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

  // User account state
  const [playerName, setPlayerName] = useState("");
  const [password, setPassword] = useState("");
  const [showAccountModal, setShowAccountModal] = useState(false);

  // Track equipped character and skip ability
  const [equippedCharacter, setEquippedCharacter] = useState<string | null>(null);

  // Blackout overlay state for ??? character
  const [showBlackout, setShowBlackout] = useState(false);

  // Audio ref for typing sound
  const typingAudioRef = useRef<HTMLAudioElement | null>(null);
  // Use error audio hook
  const { errorAudioRef, playError } = useErrorAudio();
  // Click sound ref
  const clickAudioRef = useRef<HTMLAudioElement | null>(null);

  // Duel points state
  const [duelPoints] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('duelPoints');
      return saved ? parseInt(saved, 10) : 0;
    }
    return 0;
  });

  // Loading state
  const [loading, setLoading] = useState(true);
  // Track when loading started
  const loadingStartRef = useRef<number | null>(null);

  // Theme state for dark/light mode switch
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'dark';
    }
    return 'dark';
  });

  // Update theme on change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [theme]);

  // --- THEME PERSISTENCE ON LOAD ---
  // useEffect(() => {
  //   if (typeof window !== 'undefined') {
  //     const savedTheme = localStorage.getItem('theme');
  //     if (savedTheme) {
  //       document.documentElement.classList.remove('light', 'dark');
  //       document.documentElement.classList.add(savedTheme);
  //     }
  //   }
  // }, []);

  useEffect(() => {
    generateSentence();
  }, [difficulty]);

  useEffect(() => {
    // When target sentence is set, we consider loading done
    if (target) {
      // If loading just started, record the time
      if (!loadingStartRef.current) {
        loadingStartRef.current = Date.now();
      }
      // Calculate how long loading has lasted
      const elapsed = Date.now() - (loadingStartRef.current || 0);
      const minLoading = 3000; // 3 seconds
      if (elapsed < minLoading) {
        setTimeout(() => {
          setLoading(false);
          loadingStartRef.current = null;
        }, minLoading - elapsed);
      } else {
        setLoading(false);
        loadingStartRef.current = null;
      }
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
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setEquippedCharacter(localStorage.getItem('equippedCharacter'));
    }
  }, []);

  // Ensure dark mode is applied if set in settings
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const theme = localStorage.getItem('theme');
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, []);

  // Helper to determine if we're in duel mode
  const isDuelMode = typeof window !== 'undefined' && window.location.pathname === '/duel';

  // Modified generateSentence for Pro Typer in duel mode
  const generateSentence = () => {
    // setLoading(true); // show loading while choosing sentence

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

  // Fix accuracy calculation to ignore trailing spaces
  const calculateAccuracy = (typed: string, correct: string) => {
    let correctCount = 0;
    const checkedLength = Math.min(typed.length, correct.length); // changed let to const
    for (let i = 0; i < checkedLength; i++) {
      if (typed[i] === correct[i]) correctCount++;
    }
    // Only count up to the last non-space character in typed
    const lastCharIdx = typed.trimEnd().length; // changed let to const
    return lastCharIdx > 0 ? Math.round((correctCount / lastCharIdx) * 100) : 100;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isFinished) return; // block input after finish

    const newVal = e.target.value;

    // Prevent going backwards
    if (newVal.length < input.length) return;
    // Prevent skipping chars
    if (newVal.length > input.length + 1) return;

    // SOLO MODE: Only allow typing the next character if it matches the target
    if (!isDuelMode && newVal.length > 0) {
      // Check all previous letters
      for (let i = 0; i < newVal.length - 1; i++) {
        if (newVal[i] !== target[i]) {
          playError();
          return;
        }
      }
      // Block if the new letter is not correct
      if (newVal[newVal.length - 1] !== target[newVal.length - 1]) {
        playError();
        return;
      }
    }

    setInput(newVal);

    // Play typing sound in both solo and duel mode (force play by pausing and setting currentTime)
    if (typingAudioRef.current) {
      typingAudioRef.current.pause();
      typingAudioRef.current.currentTime = 0;
      typingAudioRef.current.play().catch((e) => {
        console.log('Typing audio play failed:', e);
      });
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

  // Replace handleAccountSubmit with API-based name check
  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validate playerName: no spaces, no uppercase
    if (/\s/.test(playerName)) {
      alert('Name cannot contain spaces.');
      return;
    }
    if (/[A-Z]/.test(playerName)) {
      alert('Name cannot contain uppercase letters.');
      return;
    }
    if (playerName && password) {
      // Check with backend for unique name
      try {
        const res = await fetch('/api/check-name', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: playerName }),
        });
        const data = await res.json();
        if (!data.success) {
          alert(data.error || 'Name is already taken.');
          return;
        }
        localStorage.setItem('playerName', playerName);
        localStorage.setItem('playerPassword', password);
        setShowAccountModal(false);
      } catch {
        alert('Network error.');
      }
    }
  };

  const handleEditAccount = () => {
    setShowAccountModal(true);
  };

  // const topWpm = wpmHistory.length > 0 ? Math.max(...wpmHistory) : 0;
  // const averageWpm =
  //   wpmHistory.length > 0
  //     ? Math.round(wpmHistory.reduce((a, b) => a + b, 0) / wpmHistory.length)
  //     : 0;

  const currentGoal = wpmGoals[difficulty];

  const progressPercent = wpm && currentGoal ? Math.min((wpm / currentGoal) * 100, 100) : 0;

  const goalMet = wpm !== null && wpm >= currentGoal;
  // const wpmColorClass = goalMet ? 'text-green-600' : 'text-red-600';
  // const progressBarColor = goalMet ? 'bg-green-600' : 'bg-red-600';

  const renderHighlightedTarget = () => {
    return (
      <p className="font-mono text-lg flex flex-wrap">
        {target.split('').map((char, idx) => {
          let className = 'px-0.5';
          const currentChar = input[idx];

          if (char === ' ') {
            char = '␣';
            className += ' bg-gray-300 rounded';
          }

          if (idx < input.length) {
            className +=
              currentChar === target[idx]
                ? ' text-green-600'
                : ' text-red-600 bg-red-100';
          } else if (idx === input.length) {
            className += ' bg-yellow-200 text-black rounded';
          } else {
            className += ' text-gray-500';
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

  // Play click sound
  const playClick = () => {
    if (clickAudioRef.current) {
      clickAudioRef.current.currentTime = 0;
      clickAudioRef.current.play();
    }
  };

  // Unlock typing audio on first user interaction (for autoplay policy, improved reliability)
  useEffect(() => {
    let unlocked = false;
    const unlockAudio = () => {
      if (!unlocked && typingAudioRef.current) {
        typingAudioRef.current.load();
        typingAudioRef.current.play().then(() => {
          typingAudioRef.current?.pause();
          typingAudioRef.current!.currentTime = 0;
          unlocked = true;
          console.log('Typing audio unlocked');
        }).catch((e) => {
          unlocked = true;
          console.log('Typing audio unlock failed:', e);
        });
      }
      window.removeEventListener('keydown', unlockAudio);
      window.removeEventListener('pointerdown', unlockAudio);
    };
    window.addEventListener('keydown', unlockAudio);
    window.addEventListener('pointerdown', unlockAudio);
    return () => {
      window.removeEventListener('keydown', unlockAudio);
      window.removeEventListener('pointerdown', unlockAudio);
    };
  }, []);

  const inputRef = useRef<HTMLInputElement | null>(null);

  // Add state for Duel a Friend modal and input
  const [showDuelFriendModal, setShowDuelFriendModal] = useState(false);
  const [friendName, setFriendName] = useState("");
  const [duelError, setDuelError] = useState("");
  const [duelLoading, setDuelLoading] = useState(false);

  // State for incoming duel request
  const [incomingDuelRequest, setIncomingDuelRequest] = useState<null | { from: string, roomId: string, accepted: boolean }>(null);

  // Handler for Duel a Friend
  const handleDuelFriend = async (e: React.FormEvent) => {
    e.preventDefault();
    setDuelError("");
    setDuelLoading(true);
    try {
      const res = await fetch("/api/duel-friend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ friendName }),
      });
      const data = await res.json();
      if (data.success && data.roomId) {
        window.location.href = `/duel?room=${data.roomId}`;
      } else {
        setDuelError(data.error || "Could not start duel.");
      }
    } catch (err) {
      setDuelError("Network error.");
    }
    setDuelLoading(false);
  };

  // Poll for incoming duel requests
  useEffect(() => {
    let pollInterval: NodeJS.Timeout;
    let isMounted = true;
    async function pollDuelRequests() {
      try {
        const res = await fetch('/api/duel-friend');
        const data = await res.json();
        if (isMounted && data.request && !data.request.accepted) {
          setIncomingDuelRequest(data.request);
        } else if (isMounted) {
          setIncomingDuelRequest(null);
        }
      } catch {}
    }
    pollInterval = setInterval(pollDuelRequests, 2000);
    pollDuelRequests();
    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, []);

  // Accept/decline duel request
  const handleDuelResponse = async (accept: boolean) => {
    if (!incomingDuelRequest) return;
    try {
      const res = await fetch('/api/duel-friend', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accept }),
      });
      const data = await res.json();
      if (accept && data.success && data.roomId) {
        window.location.href = `/duel?room=${data.roomId}`;
      } else {
        setIncomingDuelRequest(null);
      }
    } catch {
      setIncomingDuelRequest(null);
    }
  };

  // Main UI when loaded
  return (
    <main className={`relative min-h-screen flex flex-col items-stretch p-0 ${theme === 'dark' ? 'bg-black' : 'bg-gradient-to-br from-white to-slate-100'}`}>
      {/* Click and typing audio */}
      <audio ref={typingAudioRef} src="/typing.mp3" preload="auto" />
      <audio ref={errorAudioRef} src="/error.mp3" preload="auto" />
      <audio ref={clickAudioRef} src="/click.mp3" preload="auto" />

      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="flex flex-col items-center">
            <Image
              src="/favicon.ico"
              width={120}
              height={120}
              alt="TypeDuels Logo"
              className="animate-spin-slow mb-4"
            />
            <div className="text-white text-3xl font-bold animate-pulse">Loading...</div>
          </div>
        </div>
      )}

      {/* Top navigation buttons - stick to top */}
      <div className="fixed top-0 left-0 w-full flex flex-row justify-end gap-2 p-4 bg-white/80 dark:bg-gray-900/80 z-50 shadow-md">
        {/* Fancy Theme Switch */}
        <button
          className={`relative w-16 h-9 flex items-center rounded-full border-2 transition-colors duration-300 focus:outline-none ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-200 border-gray-400'}`}
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label="Toggle dark/light mode"
        >
          <span className={`absolute left-2 text-xl transition-opacity duration-300 ${theme === 'dark' ? 'opacity-0' : 'opacity-100'}`}>☀️</span>
          <span className={`absolute right-2 text-xl transition-opacity duration-300 ${theme === 'dark' ? 'opacity-100' : 'opacity-0'}`}>🌙</span>
          <span
            className={`absolute top-1/2 transform -translate-y-1/2 left-1 transition-all duration-300 w-7 h-7 rounded-full shadow-md ${theme === 'dark' ? 'bg-gray-900 translate-x-7' : 'bg-white translate-x-0'}`}
          />
        </button>
        <button
          className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md font-semibold border border-gray-400 hover:bg-blue-500 hover:text-white transition"
          onClick={() => { playClick(); window.location.href = '/duel'; }}
        >
          Duel Mode
        </button>
        <button
          className="bg-yellow-400 text-black px-3 py-1 rounded-md font-semibold border border-yellow-600 hover:bg-yellow-500 transition"
          onClick={() => { playClick(); handleEditAccount(); }}
        >
          Edit Account
        </button>
        <button
          className="bg-purple-500 text-white px-4 py-2 rounded-md font-semibold border border-purple-700 hover:bg-purple-600 transition"
          onClick={() => { playClick(); window.location.href = '/characters'; }}
        >
          Characters
        </button>
        <button
          className="bg-gray-900 text-white px-4 py-2 rounded-md font-semibold border border-gray-900 hover:bg-gray-700 transition"
          onClick={() => { playClick(); window.location.href = '/settings'; }}
        >
          Settings
        </button>
        <button
          className="bg-pink-500 text-white px-4 py-2 rounded-md font-semibold border border-pink-700 hover:bg-pink-600 transition"
          onClick={() => { playClick(); setShowDuelFriendModal(true); }}
        >
          Duel a Friend
        </button>
      </div>
      <div className="h-20" /> {/* Spacer for fixed nav */}

      {/* Duel Points Display */}
      <div className="fixed top-4 left-4 z-50 bg-white/90 border border-gray-300 rounded-xl px-5 py-3 shadow-lg text-left">
        <div className="text-xs text-gray-500 font-semibold mb-1">Duel Points</div>
        <div className="text-lg font-bold text-purple-700">{duelPoints}</div>
      </div>

      {/* Difficulty Panel */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex gap-2 bg-gray-200 rounded-lg p-2 shadow">
          <button
            className={`px-4 py-2 rounded-md font-semibold transition ${
              difficulty === 'easy'
                ? 'bg-green-400 text-white shadow'
                : 'bg-gray-100 text-gray-700'
            }`}
            onClick={() => { playClick(); setDifficulty('easy'); }}
          >
            Easy
          </button>
          <button
            className={`px-4 py-2 rounded-md font-semibold transition ${
              difficulty === 'medium'
                ? 'bg-yellow-400 text-white shadow'
                : 'bg-gray-100 text-gray-700'
            }`}
            onClick={() => { playClick(); setDifficulty('medium'); }}
          >
            Medium
          </button>
          <button
            className={`px-4 py-2 rounded-md font-semibold transition ${
              difficulty === 'hard'
                ? 'bg-red-500 text-white shadow'
                : 'bg-gray-100 text-gray-700'
            }`}
            onClick={() => { playClick(); setDifficulty('hard'); }}
          >
            Hard
          </button>
        </div>
      </div>

      <h1 className="text-5xl font-extrabold mb-6 text-center tracking-wide select-none">

<div className="flex justify-center items-center mt-4 animate-bounce">
  <Image 
    src="/favicon.ico" 
    width={200} 
    height={50} 
    alt="TypeDuels Logo" 
  />
</div>

        <span className="block text-base font-normal text-gray-500 mt-2">{playerName && `(Player: ${playerName})`}</span>
      </h1>

      <div className="bg-white p-6 rounded-2xl shadow-lg max-w-xl w-full mt-24 mx-auto">
        <p className="mb-2 text-lg text-gray-700">Type this sentence:</p>
        <div className="mb-4 bg-blue-100 p-3 rounded-md text-wrap break-words">
          {renderHighlightedTarget()}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyDown={e => {
            // ??? character ability: blackout and skip to last word
            if (
              equippedCharacter === '???' &&
              e.key === 'Enter' &&
              !isFinished
            ) {
              setShowBlackout(true);
              // Find the start index of the last word
              const trimmed = target.trimEnd();
              const lastSpace = trimmed.lastIndexOf(' ');
              let newInput = '';
              if (lastSpace !== -1) {
                newInput = trimmed.slice(0, lastSpace + 1); // up to and including the last space
              }
              setInput(newInput);
              setTimeout(() => {
                setShowBlackout(false);
                // Focus input and move cursor to end after blackout
                if (inputRef.current) {
                  inputRef.current.focus();
                  inputRef.current.setSelectionRange(newInput.length, newInput.length);
                }
              }, 1200); // blackout for 1.2s
              e.preventDefault();
              return;
            }
            // DEFAULT-TYPER ABILITY: Skip to next space up to maxSkips
            if (
              equippedCharacter === 'default-typer' &&
              e.key === 'Enter' &&
              !isFinished
            ) {
              // Only allow skip if at a space or the current character is correct
              const currentIdx = input.length;
              if (target[currentIdx] !== ' ' && input[currentIdx] !== target[currentIdx]) {
                // Block skip if not at a space and not correct
                e.preventDefault();
                return;
              }
              // Find the next space after the current input
              const nextSpace = target.indexOf(' ', input.length);
              let newInput = input;
              if (nextSpace !== -1 && nextSpace > input.length) {
                // Add spaces up to the next space, but don't add extra if already at space
                const toAdd = target.slice(input.length, nextSpace + 1).replace(/[^ ]/g, '');
                newInput += toAdd;
              } else if (nextSpace === -1 && input.length < target.length) {
                // At the end, add spaces up to the end if any
                const toAdd = target.slice(input.length).replace(/[^ ]/g, '');
                newInput += toAdd;
              }
              setInput(newInput);
              e.preventDefault();
            }
          }}
          className="w-full p-3 border rounded-md text-black"
          placeholder="Start typing..."
          autoFocus
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          disabled={isFinished}
        />

        {/* Blackout overlay for ??? character */}
        {showBlackout && (
          <div className="fixed inset-0 z-[9999] bg-black transition-opacity duration-300 opacity-100 pointer-events-none" />
        )}

        {feedback && (
          <p className="mt-3 text-lg font-semibold text-green-600 animate-bounce">{feedback}</p>
        )}

        {wpm !== null ? (
          <>
            <div className={`mt-3 text-sm ${goalMet ? 'text-green-600' : 'text-red-600'}`}>
              🕐 WPM: <span className="font-bold">{wpm}</span><br />
              🎯 Accuracy: <span className="font-bold">{accuracy}</span>%
            </div>
            {/* Progress bar */}
            <div className="w-full bg-gray-300 h-3 rounded-full mt-2 overflow-hidden">
              <div
                className={`${goalMet ? 'bg-green-600' : 'bg-red-600'} h-full transition-all duration-500`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </>
        ) : (
          // Show live accuracy while typing before completion
          <div className="mt-3 text-sm text-gray-700">
            🎯 Accuracy: <span className="font-bold">{accuracy}</span>%
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            🧠 Skill Level: <span className="font-bold">{skill}</span>
          </p>
        </div>
      </div>

      {/* Account Modal */}
      {showAccountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <form onSubmit={handleAccountSubmit} className="bg-white p-8 rounded-2xl shadow-lg flex flex-col gap-4 min-w-[320px] relative">
            <button
              type="button"
              className="absolute top-2 right-2 text-gray-400 hover:text-red-600 text-2xl font-bold focus:outline-none"
              aria-label="Close"
              onClick={() => setShowAccountModal(false)}
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-2 text-center">{playerName ? "Edit Account" : "Create Account"}</h2>
            {/* Use NamePicker for name selection */}
            <NamePicker onNameSet={name => { setPlayerName(name); }} />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="p-3 border rounded-md text-black"
              required
            />
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md font-semibold mt-2 hover:bg-blue-600 transition" onClick={playClick}>Save</button>
          </form>
        </div>
      )}

      {/* Duel a Friend Modal */}
      {showDuelFriendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <form onSubmit={handleDuelFriend} className="bg-white p-8 rounded-2xl shadow-lg flex flex-col gap-4 min-w-[320px] relative">
            <button
              type="button"
              className="absolute top-2 right-2 text-gray-400 hover:text-red-600 text-2xl font-bold focus:outline-none"
              aria-label="Close"
              onClick={() => setShowDuelFriendModal(false)}
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-2 text-center">Duel a Friend</h2>
            <input
              type="text"
              placeholder="Friend's in-game name"
              value={friendName}
              onChange={e => setFriendName(e.target.value)}
              className="p-3 border rounded-md text-black"
              required
            />
            <button type="submit" className="bg-pink-500 text-white px-4 py-2 rounded-md font-semibold mt-2 hover:bg-pink-600 transition" disabled={duelLoading}>{duelLoading ? 'Checking...' : 'Send Duel Request'}</button>
            {duelError && <p className="text-red-600 text-center">{duelError}</p>}
          </form>
        </div>
      )}

      {/* Incoming Duel Request Modal */}
      {incomingDuelRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-white p-8 rounded-2xl shadow-lg flex flex-col gap-4 min-w-[320px] relative">
            <h2 className="text-2xl font-bold mb-2 text-center">Duel Request</h2>
            <p className="text-center text-lg">{incomingDuelRequest.from} wants to duel you!</p>
            <div className="flex gap-4 justify-center mt-4">
              <button
                className="bg-green-500 text-white px-4 py-2 rounded-md font-semibold hover:bg-green-600 transition"
                onClick={() => handleDuelResponse(true)}
              >
                Accept
              </button>
              <button
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md font-semibold hover:bg-gray-400 transition"
                onClick={() => handleDuelResponse(false)}
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Average Accuracy Floating Corner */}
      <div className="fixed bottom-4 right-4 z-50 bg-white/90 border border-gray-300 rounded-xl px-5 py-3 shadow-lg text-right">
        <div className="text-xs text-gray-500 font-semibold mb-1">Avg. Accuracy</div>
        <div className="text-lg font-bold text-blue-700">
          {/* Since only the latest accuracy is tracked, show average of all completed rounds as 100% for now, or N/A if none */}
          {wpmHistory.length > 0 ? `${Math.round(accuracy)}%` : 'N/A'}
        </div>
      </div>

      <style jsx global>{`
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 2s linear infinite;
        }
      `}</style>
    </main>
  );
}
