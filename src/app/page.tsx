// Solo mode page moved to /dashboard

'use client';


import { useEffect, useState, useRef } from 'react';
import { useErrorAudio } from "../hooks/useErrorAudio";
import Image from 'next/image';






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

    // Example sentence bank for each difficulty
    const sentenceBank: { [key in 'easy' | 'medium' | 'hard']: string[] } = {
      easy: [
        "I like cats.", "You are my friend.", "It is sunny today.", "I am happy.", "We play outside.", "This is my toy.", "I like pizza.", "She is nice.", "He runs fast.", "The sky is blue.", "I see a bird.", "We have fun.", "It is cold.", "I love books.", "They are kind.", "You can do it.", "I have a ball.", "He is smart.", "She sings well.", "I like games.", "It is hot.", "I see the moon.", "We eat lunch.", "He has a hat.", "She reads a lot.", "It is raining.", "I love cake.", "You are tall.", "They are happy.", "We go to school.", "I have a pet.", "He is funny.", "She likes music.", "It is late.", "I am tired.", "We watch TV.", "He has shoes.", "She is here.", "I see a fish.", "It is green.", "I like bread.", "We play tag.", "He is cool.", "She runs fast.", "It is dark.", "I love milk.", "You are nice.", "They are friends.", "We jump high.", "I have a kite.", "He likes cars.", "She is kind.", "It is windy.", "I like soup.", "We play chess.", "He is brave.", "She dances well.", "It is small.", "I love apples.", "You are funny.", "They play soccer.", "We are safe.", "I see stars.", "He likes cake.", "She is shy.", "It is big.", "I love rain.", "We eat dinner.", "He is kind.", "She paints well.", "It is fun.", "I have toys.", "You are strong.", "They are smart.", "We sing songs.", "I see a tree.", "He rides bikes.", "She is calm.", "It is loud.", "I love dogs.", "We eat fruit.", "He is tall.", "She likes tea.", "It is soft.", "I like math.", "You are fast.", "They are fun.", "We play games.", "I have bread.", "He likes books."
      ],
      medium: [
        "The garden was full of bright red roses",

"A small cat slept under the wooden table",

"The ocean waves crashed loudly against the shore",

"She read her favorite book by the fireplace",

"The teacher explained the lesson with great patience",

"We walked through the quiet streets at night",

"The old clock ticked slowly in the corner",

"A gentle breeze moved through the tall grass",

"The baker placed fresh bread on the shelf",

"He wrote a letter to his best friend",

"The candlelight flickered softly against the walls",

"They played cards by the warm kitchen fire",

"The puppy barked happily at the passing car",

"We watched the stars from the wooden balcony",

"The smell of coffee filled the small room",

"She wore a blue dress with white polka dots",

"The rain tapped gently against the glass window",

"The farmer fed the chickens in the yard",

"They painted the fence a bright shade of blue",

"He placed the flowers in a crystal vase",

"The forest path was covered with fallen leaves",

"A red kite flew high above the meadow",

"The sound of laughter filled the summer air",

"She tied her hair with a red ribbon",

"The little boy carried a basket of apples",

"The snow covered the rooftops during the night",

"We shared a pizza under the moonlit sky",

"The lantern lit the path through the dark woods",

"He closed the book and sighed with relief",

"A bird sang sweetly on the garden fence",

"The children built a sandcastle by the water",

"She kept her diary hidden under the bed",

"The old train whistled as it left the station",

"We danced together in the empty city street",

"A rainbow appeared after the heavy summer rain",

"The mountains looked beautiful in the golden light",

"She poured tea into the small porcelain cups",

"The cat jumped onto the sunny window ledge",

"We explored the caves near the rocky beach",

"The baker smiled while kneading the fresh dough",

"A single candle burned in the dark room",

"They packed sandwiches for their afternoon picnic",

"The leaves rustled quietly in the gentle wind",

"She painted the door a bright sunny yellow",

"The river flowed swiftly after the heavy rain",

"We planted flowers along the wooden garden fence",

"The clouds drifted slowly across the blue sky",

"The market was crowded with people buying fruit",

"He fixed the old clock on the wall",

"The children chased butterflies in the open field"
      ],
      hard: [
        "The storm raged outside, yet the candlelight flickered gently on the table",

"Despite the danger, she stepped forward to face the towering shadow before her",

"He studied the map carefully, searching for a route no one had taken",

"Under the pale moonlight, the fox darted swiftly across the frosted meadow",

"The locked chest rattled mysteriously, as if something inside demanded to be freed",

"She whispered the final clue, knowing it would change the course of the game",

"Rain pounded on the roof while the fire crackled warmly in the hearth",

"He carried the ancient key, unsure whether it would open a door or a trap",

"The mist thickened around them, hiding the path they thought they knew so well",

"Through the shattered window, the first rays of morning light spilled into the room",

"The old library smelled of parchment and dust, preserving secrets from generations past",

"She adjusted her glasses and carefully examined the intricate design of the artifact",

"Lightning illuminated the sky, revealing the outline of the distant, crumbling castle",

"He tiptoed across the floor, careful not to wake anyone in the silent house",

"The journal contained pages filled with sketches of unknown creatures and strange landscapes",

"Fog rolled in over the lake, hiding the small boat drifting aimlessly",

"Her hands trembled slightly as she unlocked the ancient, ornate wooden door",

"The clock struck midnight, and shadows seemed to move independently across the walls",

"He listened intently, hearing footsteps echo through the long, empty corridor",

"A chill ran down her spine as the wind whispered through the abandoned garden",

"The candle flickered, casting eerie shapes on the cracked and peeling walls",

"He carefully opened the envelope, revealing a letter written in unfamiliar handwriting",

"The waves crashed against the cliffs, spraying salty water into the stormy air",

"She followed the narrow trail through the forest, unsure what awaited at the end",

"The painting depicted a scene so vivid it almost seemed to move",

"Thunder rumbled ominously, shaking the windows of the small, lonely cabin",

"He adjusted the telescope, hoping to catch a glimpse of the rare comet",

"The key turned slowly, releasing a loud click that echoed through the empty hall",

"A lone wolf howled in the distance, sending shivers down their spines",

"The diary contained secrets that could alter the fate of everyone involved",

"She carefully traced the strange symbols carved into the old stone wall",

"The air smelled of rain and pine, signaling the coming of a long storm",

"He followed the faint trail of footprints disappearing into the dense underbrush",

"The lantern swung back and forth, illuminating the foggy, deserted street",

"A sudden gust of wind blew open the creaky wooden door",

"She realized the map was incomplete, missing crucial landmarks needed to continue",

"The bell tower rang out, signaling the start of an unknown, mysterious event",

"He stared at the mysterious object, unsure whether it was a tool or weapon",

"The pages of the ancient book were brittle and yellowed with age",

"Through the misty valley, the sound of rushing water grew steadily louder",

"She listened to the whispers of the forest, hoping to understand its secrets",

"The candle’s flame flickered violently as the shadows seemed to gather around",

"He clutched the pendant tightly, feeling a strange warmth emanating from it",

"The train screeched to a halt, leaving the passengers stranded on the deserted platform",

"She opened the small wooden box, revealing a collection of ancient coins",

"The rain had stopped, leaving puddles that reflected the dim city lights",

"He examined the map under the faint glow of a single lantern",

"The abandoned mansion loomed over the hill, dark and foreboding in the fog",

"She stepped cautiously across the creaking floorboards, trying not to alert anyone",

"The distant sound of drums echoed across the valley, mysterious and rhythmic"
      ]
    };
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
          const wordSpan = (
            <span key={wIdx} className="relative inline-block">
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
  <p className="text-gray-600 text-sm">
    🏅 Top WPM: <span className="font-bold">{wpmHistory.length > 0 ? Math.max(...wpmHistory) : 0}</span>
  </p>
  <p className="text-gray-600 text-sm">
    🏆 Current Goal: <span className="font-bold">{currentGoal} W</span>
  </p>
  
  <div className="flex flex-row justify-center gap-4 mt-4">
    <button
      className="bg-blue-500 text-white px-4 py-2 rounded-md font-semibold border border-blue-700 hover:bg-blue-600 transition"
      onClick={() => { playClick(); generateSentence(); }}
    >
      New Sentence
    </button>
  </div>
</div>

{/* Average Accuracy Floating Corner */}
<div className="fixed bottom-4 right-4 z-50 bg-white/90 border border-gray-300 rounded-xl px-5 py-3 shadow-lg text-right">
  <div className="text-xs text-gray-500 font-semibold mb-1">Avg. Accuracy</div>
  <div className="text-lg font-bold text-blue-700">
    {wpmHistory.length > 0 ? `${Math.round(accuracy)}%` : 'N/A'}
  </div>
</div> {/* ✅ Close this before style */}

<style jsx global>{`
  @keyframes spin-slow {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  .animate-spin-slow {
    animation: spin-slow 2s linear infinite;
  }
`}</style>
      </div>

      {/* Audio for typing sound */}
      <audio ref={typingAudioRef} src="/typing.mp3" preload="auto" />
      <audio ref={errorAudioRef} src="/error.mp3" preload="auto" />
      <audio ref={clickAudioRef} src="/click.mp3" preload="auto" />
    </main>
  );
} 
