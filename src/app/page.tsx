// Solo mode page moved to /dashboard

'use client';


import { useEffect, useState, useRef } from 'react';
import { useErrorAudio } from "../hooks/useErrorAudio";
import Image from 'next/image';

// Simple Confetti component placeholder (replace with your actual implementation or library)
const Confetti = ({ trigger }: { trigger: boolean }) => {
  if (!trigger) return null;
  return (
    <span
      style={{
        position: 'absolute',
        left: '50%',
        top: '-1.5em',
        transform: 'translateX(-50%)',
        pointerEvents: 'none',
        fontSize: '2em',
        zIndex: 10,
      }}
      aria-label="Confetti"
    >
      🎉
    </span>
  );
};


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
  const [mistakeCount, setMistakeCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // User account state (popup removed)
  const [playerName, setPlayerName] = useState("");

  // Track equipped character
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    const accountCreated = localStorage.getItem("accountCreated");
    if (accountCreated === "true") {
      const savedName = localStorage.getItem("playerName");
      const savedPass = localStorage.getItem("playerPassword");
      setPlayerName(savedName || "");
      // setShowAccountModal(false); // removed
    } else {
    // setShowAccountModal(true); // removed
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
  const calculateAccuracy = (typed: string) => {
    // Accuracy is now based on mistakes made
    const totalTyped = typed.trimEnd().length;
    const mistakes = mistakeCount;
    return totalTyped > 0 ? Math.max(0, Math.round(((totalTyped - mistakes) / totalTyped) * 100)) : 100;
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
          setMistakeCount(prev => prev + 1);
          setAccuracy(calculateAccuracy(newVal));
          return;
        }
      }
      // Block if the new letter is not correct
      if (newVal[newVal.length - 1] !== target[newVal.length - 1]) {
        playError();
        setMistakeCount(prev => prev + 1);
        setAccuracy(calculateAccuracy(newVal));
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

    // Only update accuracy if not blocked above
    setAccuracy(calculateAccuracy(newVal));

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
      setFeedback(`✅ Submitted! Accuracy: ${calculateAccuracy(newVal)}%`);

      setTimeout(() => {
        setFeedback("");
        window.location.href = "/";
      }, 3000);
      setMistakeCount(0); // reset for next round
    }
  };

  // Account creation popup removed, so handleAccountSubmit is not needed

  // Account creation popup removed, so handleEditAccount is not needed

  // const topWpm = wpmHistory.length > 0 ? Math.max(...wpmHistory) : 0;
  // const averageWpm =
  //   wpmHistory.length > 0
  //     ? Math.round(wpmHistory.reduce((a, b) => a + b, 0) / wpmHistory.length)
  //     : 0;

  // Define WPM goals for each difficulty
  const wpmGoals: { [key in 'easy' | 'medium' | 'hard']: number } = {
    easy: 25,
    medium: 40,
    hard: 60,
  };
  const currentGoal = wpmGoals[difficulty];

  // Progress bar: show percent of words completed
  const wordsTyped = input.trim().length > 0 ? input.trim().split(/\s+/).length : 0;
  const totalWords = target.trim().length > 0 ? target.trim().split(/\s+/).length : 0;
  const wordProgressPercent = totalWords > 0 ? Math.min((wordsTyped / totalWords) * 100, 100) : 0;

  const goalMet = wpm !== null && wpm >= currentGoal;
  // const wpmColorClass = goalMet ? 'text-green-600' : 'text-red-600';
  // const progressBarColor = goalMet ? 'bg-green-600' : 'bg-red-600';

  // Track confetti triggers for each word index
  const [confettiWords, setConfettiWords] = useState<{ [wordIdx: number]: boolean }>({});

  // When input changes, check if a new word was completed and trigger confetti if Default Typer is equipped
  useEffect(() => {
    if (equippedCharacter !== 'default-typer') return;
    if (!input || !target) return;
    const inputWords = input.trim().split(/\s+/);
    const targetWords = target.trim().split(/\s+/);
    // Only trigger on word completion (when last char is space or input matches target)
    if (input[input.length - 1] === ' ' || input.trim() === target.trim()) {
      const wordIdx = inputWords.length - 1;
      if (
        wordIdx >= 0 &&
        wordIdx < targetWords.length &&
        !confettiWords[wordIdx]
      ) {
        if (Math.random() < 0.5) {
          setConfettiWords(prev => ({ ...prev, [wordIdx]: true }));
        }
      }
    }
  }, [input, equippedCharacter, target]);

  // Reset confetti on new sentence
  useEffect(() => {
    setConfettiWords({});
  }, [target]);

  const renderHighlightedTarget = () => {
    // Split target into words and spaces for word-level confetti
    const words = target.split(/(\s+)/);
    let charIdx = 0;
    return (
      <span className="font-mono text-lg flex flex-wrap items-end relative">
        {words.map((word, wIdx) => {
          if (/^\s+$/.test(word)) {
            charIdx += word.length;
            return <span key={wIdx}>{word.replace(/ /g, '␣')}</span>;
          }
          // Determine highlight for each char in word
          const chars = word.split('').map((char, i) => {
            let className = 'px-0.5';
            const idx = charIdx + i;
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
              <span key={i} className={className}>{char}</span>
            );
          });
          // Confetti for this word if triggered and Default Typer equipped
          const showConfetti = equippedCharacter === 'default-typer' && confettiWords[wIdx];
          const wordSpan = (
            <span key={wIdx} className="relative inline-block">
              {showConfetti && <Confetti trigger={true} />}
              {chars}
            </span>
          );
          charIdx += word.length;
          return wordSpan;
        })}
      </span>
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
          className="bg-green-500 text-white px-4 py-2 rounded-md font-semibold border border-green-700 hover:bg-green-600 transition"
          onClick={() => { playClick(); window.location.href = '/subscriptions'; }}
        >
          Subscriptions
        </button>
      {/* Edit Account button removed */}
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
            // ...existing code...
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

        {/* Progress bar is always visible and updates on word progress */}
        <div className="w-full bg-gray-300 h-3 rounded-full mt-2 overflow-hidden">
          <div
            className={`bg-blue-500 h-full transition-all duration-500`}
            style={{ width: `${wordProgressPercent}%` }}
          />
        </div>
        {wpm !== null ? (
          <div className={`mt-3 text-sm ${goalMet ? 'text-green-600' : 'text-red-600'}`}>
            🕐 WPM: <span className="font-bold">{wpm}</span><br />
            🎯 Accuracy: <span className="font-bold">{accuracy}</span>%
          </div>
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
          <div className="flex flex-row justify-center gap-4 mt-4">
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded-md font-semibold border border-blue-700 hover:bg-blue-600 transition"
              onClick={() => {
                playClick();
                setTimeout(() => {
                  window.location.href = 'https://gamingcorporation.kinde.com/auth/cx/_:nav&m:register&psid:01988043a1f8373fbb822517dfcc0d1d&state:v1_c30d040703027b8ae68533da310a6ed28801203bc514e8b343ab72c17a254f4586677310344d0f26fff4bc4d62bc17bcb4f6d5125d6ba12e11c72961dc4d96a950a33ca4b8b0755bdac3d43c75fae5f63bf1b5e3fb4a0fa9709c913e9e9109310627961d8f2a9b5527ae153d02193385ac4d0f310deb3e3d84a3c08eb53883282a65bea329e9722fe55fbf2b92b45b40e0ab97cc6aee14fa8f';
                }, 120);
              }}
            >
              Sign In
            </button>
            <button
              className="bg-green-500 text-white px-4 py-2 rounded-md font-semibold border border-green-700 hover:bg-green-600 transition"
              onClick={() => {
                playClick();
                setTimeout(() => {
                  window.location.href = 'https://gamingcorporation.kinde.com/auth/cx/_:nav&m:login&psid:01988041f349a0f85913063330fa49fb&state:v1_c30d04070302ac74b67ff3800abf6ed28801238bdd5a82e5a0bc1903646d50e410aef373c8688c53462fc097f97f313eac2ac3464345da0f8ffbb936237f97cb26c543943ca2cb88529f56501d412f96c34ed0806e2ada7e5ce525f7a210d70a6aa779f0e75c1988c3497b878b53d8bd6bdcdc2ffbddf910851dfee547c2582ca3b3e4829971c393b5161f104ffc62ff975cb7bbe6a6ec1d46';
                }, 120);
              }}
            >
              Sign Up
            </button>
            
          </div>
          
        </div>
      </div>

      {/* Account Modal removed */}


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
