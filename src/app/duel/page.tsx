"use client";

"use client";
import React, { useEffect, useState, useRef } from "react";
import { useXP } from "../XPProvider";
import { useRouter } from "next/navigation";
import { useErrorAudio } from "../../hooks/useErrorAudio";

const duelSentences = [
	"Mastering JavaScript requires patience, practice, and a willingness to learn from mistakes.",
	"Artificial intelligence is transforming the way we interact with technology and the world around us.",
	"Developers often collaborate using version control systems like Git to manage codebases efficiently.",
	"Building scalable web applications involves careful planning, testing, and optimization at every stage.",
	"Understanding asynchronous programming is essential for modern frontend and backend development.",
];

export default function Duel() {
	// Inject Tony Stark laser keyframes CSS once
	useEffect(() => {
		if (typeof window !== 'undefined' && !document.getElementById('tony-laser-keyframes')) {
			const style = document.createElement('style');
			style.id = 'tony-laser-keyframes';
			style.innerHTML = `
@keyframes laser-move-left {
  from { width: 0%; }
  to { width: 100vw; }
}
@keyframes laser-move-right {
  from { width: 0%; }
  to { width: 100vw; }
}
@keyframes tony-particle {
  0% { opacity: 1; transform: translateY(0) scale(1); }
  100% { opacity: 0; transform: translateY(-30px) scale(1.5); }
}
			`;
			document.head.appendChild(style);
		}
	}, []);
	const { addXP } = useXP();
	const [hackerCooldown, setHackerCooldown] = useState(false);
	const [showHackedMsg, setShowHackedMsg] = useState(false);
	const [hackedMsgChars, setHackedMsgChars] = useState(0);
	const [hasMounted, setHasMounted] = useState(false); // NEW: track mount
	const [target, setTarget] = useState("");
	const [input, setInput] = useState("");
	const [aiIndex, setAiIndex] = useState(0);
	const [aiSpeed, setAiSpeed] = useState(600); // ms per char for 20wpm
	const [aiFinished, setAiFinished] = useState(false);
	const [userFinished, setUserFinished] = useState(false);
	const [duelPoints, setDuelPoints] = useState(0);
	const [result, setResult] = useState("");
	const [startTime, setStartTime] = useState<number | null>(null);
	// Track all user WPMs for average
	const [wpmHistory, setWpmHistory] = useState<number[]>([]);
	const router = useRouter();
	// Generate a random player name once per duel
	const [opponentName, setOpponentName] = useState("");

	// Banner state for win/lose
	const [showBanner, setShowBanner] = useState(""); // "win" | "lose" | ""

	// User account state
	const [playerName, setPlayerName] = useState("");
	const [password, setPassword] = useState("");
	const [showAccountModal, setShowAccountModal] = useState(false);
	const [nameError, setNameError] = useState('');

	// Track equipped character and skip ability
	const [equippedCharacter, setEquippedCharacter] = useState<string | null>(null);

	// Sabotage ability state
	const [sabotageCooldown, setSabotageCooldown] = useState(0);
	const [sabotageAvailable, setSabotageAvailable] = useState(false);
	const [showSabotageMsg, setShowSabotageMsg] = useState("");

	// Kill ability state for Master
	const [killCooldown, setKillCooldown] = useState(0);
	const [killAvailable, setKillAvailable] = useState(false);
	const [showKillMsg, setShowKillMsg] = useState("");

	// Audio ref for typing sound
	const typingAudioRef = useRef<HTMLAudioElement | null>(null);
	const tonyLaserAudioRef = useRef<HTMLAudioElement | null>(null);

	// Tony Stark ability state
	const [showTonyLaserLeft, setShowTonyLaserLeft] = useState(false);
	const [showTonyLaserRight, setShowTonyLaserRight] = useState(false);
	const [showTonyBurnMsg, setShowTonyBurnMsg] = useState(false);
	const [tonyLaserAnim, setTonyLaserAnim] = useState<'none'|'left'|'right'|'done'>('none');

	// Mad Scientist ability state
	const [showPotion, setShowPotion] = useState(false);
	const [showExplosion, setShowExplosion] = useState(false);
	const [madAvailable, setMadAvailable] = useState(true); // Add this line
	const [madCooldown, setMadCooldown] = useState(0); // Add this line
	const hackingAudioRef = useRef<HTMLAudioElement | null>(null);
	// Use error audio hook
	const { errorAudioRef, playError } = useErrorAudio();

	const inputRef = useRef<HTMLInputElement | null>(null);
	const [showBlackout, setShowBlackout] = useState(false);
	const [showHackerEffect, setShowHackerEffect] = useState(false);
	const [hackerMatrix, setHackerMatrix] = useState<string[]>([]);
	const [hackerCharsShown, setHackerCharsShown] = useState(0);
	const hackerColsRef = useRef(40); // default value

	useEffect(() => {
		setHasMounted(true);
	}, []);

	// On mount or duelPoints change, pick a new sentence but don't start duel yet
	useEffect(() => {
		if (!hasMounted) return;
		// Pick a random long sentence
		const random = duelSentences[Math.floor(Math.random() * duelSentences.length)];
		setTarget(random);
		setInput("");
		setAiIndex(0);
		setAiFinished(false);
		setUserFinished(false);
		setResult("");
		setStartTime(Date.now());
		// Set AI speed to match average WPM
		let avgWpm = 20;
		if (wpmHistory.length > 0) {
			avgWpm = Math.round(wpmHistory.reduce((a: number, b: number) => a + b, 0) / wpmHistory.length);
			if (avgWpm < 1) avgWpm = 1;
		}
		setAiSpeed(60000 / (avgWpm * 5));
		// Generate random opponent name
		setOpponentName(`player${Math.floor(100 + Math.random() * 900)}`);
	}, [duelPoints, hasMounted]);

	// Only start AI progress after duelStarted is true
	useEffect(() => {
		if (aiFinished || userFinished) return;
		if (aiIndex < target.length) {
			const timeout = setTimeout(() => {
				setAiIndex((idx: number) => idx + 1);
			}, aiSpeed);
			return () => clearTimeout(timeout);
		} else {
			setAiFinished(true);
			if (!userFinished) setResult(`❌ ${opponentName} wins! Try again.`);
		}
	}, [aiIndex, aiFinished, userFinished, aiSpeed, target.length]);

	useEffect(() => {
		let timeout: ReturnType<typeof setTimeout> | undefined;
		let redirectTimeout: ReturnType<typeof setTimeout> | undefined;
		// Only show banner if result is not empty, not just on mount
		if (result && !result.startsWith("❌") && result.toLowerCase().includes("you win")) {
			setShowBanner("win");
			timeout = setTimeout(() => setShowBanner("") , 3000);
			// Redirect to solo mode AFTER banner disappears
			redirectTimeout = setTimeout(() => router.push("/"), 3000);
		} else if (result && result.startsWith("❌") && !result.includes('Try again.') && result !== `❌ ${opponentName} wins! Try again.`) {
			setShowBanner("lose");
			timeout = setTimeout(() => setShowBanner("") , 3000);
			redirectTimeout = setTimeout(() => router.push("/"), 3000);
		} else if (result && result === `❌ ${opponentName} wins! Try again.`) {
			setShowBanner("lose");
			timeout = setTimeout(() => setShowBanner("") , 3000);
			redirectTimeout = setTimeout(() => router.push("/"), 3000);
		} else {
			setShowBanner("");
		}
		return () => {
		if (timeout) clearTimeout(timeout);
		if (redirectTimeout) clearTimeout(redirectTimeout);
		};
	}, [result, opponentName]);

	// On mount, check for saved player info
	useEffect(() => {
		if (!hasMounted) return;
		const savedName = localStorage.getItem("playerName");
		const savedPass = localStorage.getItem("playerPassword");
		if (!savedName || !savedPass) {
			setShowAccountModal(true);
		} else {
			setPlayerName(savedName);
			setPassword(savedPass);
		}
	}, [hasMounted]);

	useEffect(() => {
		if (!hasMounted) return;
		setEquippedCharacter(localStorage.getItem('equippedCharacter'));
	}, [hasMounted]);

	// On mount, load sabotage cooldown
	useEffect(() => {
		if (!hasMounted) return;
		const cooldown = parseInt(localStorage.getItem('sabotageCooldown') || '0', 10);
		setSabotageCooldown(cooldown);
		setSabotageAvailable(equippedCharacter === 'advanced-typer' && cooldown === 0);
	}, [equippedCharacter, hasMounted]);

	// Decrement cooldown after each duel (win or lose)
	useEffect(() => {
		if ((userFinished || aiFinished) && equippedCharacter === 'advanced-typer') {
			if (sabotageCooldown > 0) {
				const newCooldown = sabotageCooldown - 1;
				localStorage.setItem('sabotageCooldown', newCooldown.toString());
				setSabotageCooldown(newCooldown);
				setSabotageAvailable(newCooldown === 0);
			} else if (sabotageCooldown === 0) {
				setSabotageAvailable(true);
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userFinished, aiFinished]);

	// On mount, load kill cooldown
	useEffect(() => {
		if (!hasMounted) return;
		const cooldown = parseInt(localStorage.getItem('killCooldown') || '0', 10);
		setKillCooldown(cooldown);
		setKillAvailable(equippedCharacter === 'master' && cooldown === 0);
	}, [equippedCharacter, hasMounted]);

	// Decrement kill cooldown after each duel (win or lose)
	useEffect(() => {
		if ((userFinished || aiFinished) && equippedCharacter === 'master') {
			if (killCooldown > 0) {
				const newCooldown = killCooldown - 1;
				localStorage.setItem('killCooldown', newCooldown.toString());
				setKillCooldown(newCooldown);
				setKillAvailable(newCooldown === 0);
			} else if (killCooldown === 0) {
				setKillAvailable(true);
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userFinished, aiFinished]);

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
					console.log('Typing audio unlocked (duel)');
				}).catch((e: Error) => {
					unlocked = true;
					console.log('Typing audio unlock failed (duel):', e);
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

	// Load duel points from localStorage on mount
	useEffect(() => {
		if (!hasMounted) return;
		const savedPoints = localStorage.getItem("duelPoints");
		if (savedPoints !== null) {
			setDuelPoints(Number(savedPoints));
		}
	}, [hasMounted]);

	// Save duel points to localStorage whenever they change
	useEffect(() => {
		if (!hasMounted) return;
		localStorage.setItem("duelPoints", duelPoints.toString());
	}, [duelPoints, hasMounted]);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (userFinished || aiFinished) return;
		const newVal = e.target.value;
		// Only allow typing forward by one character
		if (newVal.length < input.length) return;
		if (newVal.length > input.length + 1) return;
		// Only allow correct character at current position
		const nextChar = target[input.length];
		const typedChar = newVal[newVal.length - 1];
		if (typedChar !== nextChar) {
			// If user is trying to overwrite a previous wrong letter, allow highlight but block input
			if (newVal.length === input.length + 1) {
				playError();
			}
			return;
		}
		setInput(newVal);
		// Play typing sound (duel mode)
		if (typingAudioRef.current) {
			typingAudioRef.current.pause();
			typingAudioRef.current.currentTime = 0;
			typingAudioRef.current.play().catch((e: Error) => {
				console.log('Typing audio play failed (duel):', e);
			});
		}
			if (newVal.length === target.length) {
				setUserFinished(true);
				const endTime = Date.now();
				const durationInMinutes = (endTime - (startTime ?? endTime)) / 60000;
				const wordCount = target.trim().split(/\s+/).length;
				const calculatedWpm = Math.round(wordCount / durationInMinutes);
				setWpmHistory((prev: number[]) => [...prev, calculatedWpm]);
				// XP gain for typing a sentence
				addXP(20); // 20 XP per sentence
				if (!aiFinished) {
					setDuelPoints((p: number) => p + 5);
					setResult("\ud83c\udfc6 You win! +5 Duel Points");
					// XP gain for winning a duel
					addXP(40); // 40 XP for win
				} else {
					setResult(`\u274c ${opponentName} wins! Try again.`);
				}
			}
	};

	const handleAccountSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setNameError('');
		// Validate playerName: no spaces, no uppercase
		if (/\s/.test(playerName)) {
			setNameError('Name cannot contain spaces.');
			return;
		}
		if (/[A-Z]/.test(playerName)) {
			setNameError('Name cannot contain uppercase letters.');
			return;
		}
		if (playerName && password) {
			localStorage.setItem("playerName", playerName);
			localStorage.setItem("playerPassword", password);
			setShowAccountModal(false);
		}
	};

	const handleEditAccount = () => {
		setShowAccountModal(true);
	};

	const renderHighlightedTarget = () => {
		return (
			<p className="font-mono text-lg flex flex-wrap">
				{target.split("").map((char: string, idx: number) => {
					let className = "px-0.5";
					const currentChar = input[idx];
					if (char === " ") {
						char = "␣";
						className += " bg-gray-300 dark:bg-gray-700 rounded";
					}
					if (idx < input.length) {
						className +=
							currentChar === target[idx]
								? " text-green-600 dark:text-green-400"
								: " text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900";
					} else if (idx === input.length) {
						className += " bg-yellow-200 dark:bg-yellow-500 text-black rounded";
					} else {
						className += " text-gray-500 dark:text-gray-400";
					}
					// Show AI's current position
					if (idx === aiIndex && !aiFinished) {
						className += " border-b-4 border-blue-500";
					}
					// Show opponent name above their cursor
					if (idx === aiIndex && !aiFinished) {
						return (
							<span key={idx} className="relative">
								<span className={className}>{char}</span>
								<span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-blue-600 dark:text-blue-400 font-bold whitespace-nowrap">{opponentName}</span>
							</span>
						);
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

	// Sabotage button handler
	const handleSabotage = () => {
		if (!sabotageAvailable) return;
		// Set cooldown to 3
		localStorage.setItem('sabotageCooldown', '3');
		setSabotageCooldown(3);
		setSabotageAvailable(false);
		setAiIndex(0); // Restart AI to front
		setShowSabotageMsg('Sabotage used! AI restarted.');
		setTimeout(() => setShowSabotageMsg(''), 2000);
	};

	// Kill button handler
	const handleKill = () => {
		if (!killAvailable) return;
		// Set cooldown to 2
		localStorage.setItem('killCooldown', '2');
		setKillCooldown(2);
		setKillAvailable(false);
		// Instantly win for player
		setInput(target);
		setUserFinished(true);
		setAiIndex(0);
		setShowKillMsg('Kill used! You win instantly.');
		setResult('🏆 You win! +5 Duel Points');
		setDuelPoints((p: number) => p + 5);
		addXP(40); // XP for instant win
		setTimeout(() => setShowKillMsg(''), 2000);
	};

	return (
		!hasMounted ? (
			<main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-slate-100 dark:from-black dark:to-gray-900 p-4">
				<div className="text-xl text-gray-500 dark:text-gray-400 animate-pulse">Loading Duel Mode...</div>
			</main>
		) : (
			<main className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white to-slate-100 dark:from-black dark:to-gray-900 p-4">
				<audio ref={typingAudioRef} src="/typing.mp3" preload="auto" />
				<audio ref={hackingAudioRef} src="/Hacking.mp3" preload="auto" />
				<audio ref={errorAudioRef} src="/error.mp3" preload="auto" />
				<audio ref={tonyLaserAudioRef} src="/futuristic-beam-81215.mp3" preload="auto" />
				{/* Kill Button: only for Master in duel mode */}
				{equippedCharacter === 'master' && (
					<div className="fixed left-4 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center">
						<button
							className={`px-6 py-3 rounded-xl font-bold text-white text-lg shadow-lg ${killAvailable ? 'bg-black hover:bg-gray-800' : 'bg-gray-400 cursor-not-allowed'}`}
							disabled={!killAvailable}
							onClick={handleKill}
						>
							Kill {killAvailable ? '' : `(Cooldown: ${killCooldown} duels)`}
						</button>
						{showKillMsg && (
							<div className="mt-2 text-white bg-black/80 px-3 py-1 rounded">{showKillMsg}</div>
						)}
					</div>
				)}
				{/* Sabotage Button: only for Advanced Typer in duel mode */}
				{equippedCharacter === 'advanced-typer' && (
					<div className="fixed left-4 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center">
						<button
							className={`px-6 py-3 rounded-xl font-bold text-white text-lg shadow-lg ${sabotageAvailable ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-400 cursor-not-allowed'}`}
							disabled={!sabotageAvailable}
							onClick={handleSabotage}
						>
							Sabotage {sabotageAvailable ? '' : `(Cooldown: ${sabotageCooldown} duels)`}
						</button>
						{showHackedMsg && (
							<div className="fixed bottom-8 right-8 z-[103]">
								<div className="font-mono text-green-400 text-xl md:text-2xl bg-black bg-opacity-80 px-6 py-3 rounded-lg shadow-lg animate-fadeIn animate-fadeOut" style={{transition: 'opacity 1s'}}>
									{'Hacked device +50 points'.slice(0, hackedMsgChars)}
								</div>
							</div>
						)}
					</div>
				)}

				{/* Tony Stark laser beams and burn notification - global overlay */}
				{(showTonyLaserLeft || showTonyLaserRight || showTonyBurnMsg) && (
					<>
						{showTonyLaserLeft && (
							<div className="fixed left-0 top-1/2 -translate-y-1/2 z-[110] w-1/2 h-16 bg-blue-500 animate-laser" style={{boxShadow: '0 0 40px 20px #3b82f6'}} />
						)}
						{showTonyLaserRight && (
							<div className="fixed right-0 top-1/2 -translate-y-1/2 z-[110] w-1/2 h-16 bg-blue-500 animate-laser" style={{boxShadow: '0 0 40px 20px #3b82f6'}} />
						)}
						{showTonyBurnMsg && (
							<div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[111]">
								<div className="font-mono text-blue-500 text-xl md:text-2xl bg-black bg-opacity-80 px-6 py-3 rounded-lg shadow-lg animate-fadeIn animate-fadeOut" style={{transition: 'opacity 1s'}}>
									{`You burn ${opponentName}`}
								</div>
							</div>
						)}
					</>
				)}
				{/* Mad Scientist potion and explosion overlay */}
				{showPotion && (
					<div className="fixed inset-0 z-[120] flex items-center justify-center">
						<img src="/bomb.png" alt="Potion" className="w-32 h-32 animate-bounce" style={{filter: 'drop-shadow(0 0 20px #7f5fff)'}} />
					</div>
				)}
				{showExplosion && (
					<div className="fixed inset-0 z-[121] flex items-center justify-center">
						<div className="w-40 h-40 rounded-full bg-yellow-400 animate-pulse" style={{boxShadow: '0 0 80px 40px #ff5f5f'}} />
						<span className="absolute text-4xl font-bold text-red-700">BOOM!</span>
					</div>
				)}
				{/* Mad Scientist cooldown UI */}
				{equippedCharacter === 'mad-scientist' && (
					<div className="fixed left-4 top-2/3 -translate-y-1/2 z-50 flex flex-col items-center">
						<button
							className={`px-6 py-3 rounded-xl font-bold text-white text-lg shadow-lg ${madAvailable ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-400 cursor-not-allowed'}`}
							disabled={!madAvailable}
						>
							Potion Splatter
						</button>
						{!madAvailable && (
							<div className="mt-2 flex flex-col items-center">
								<span className="text-lg font-bold text-purple-700 dark:text-purple-300">Available next match</span>
							</div>
						)}
					</div>
				)}
				{/* Win/Lose Banner Overlay */}
				{showBanner === "lose" && (
					<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 animate-fadeIn animate-fadeOut">
						<div className="text-6xl font-extrabold text-red-500 drop-shadow-lg animate-fadeInUp animate-fadeOut">
							YOU LOSE
						</div>
					</div>
				)}
				{showBanner === "win" && (
					<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 animate-fadeIn animate-fadeOut">
						<div className="text-6xl font-extrabold text-green-500 drop-shadow-lg animate-fadeInUp animate-fadeOut">
							YOU WIN
						</div>
					</div>
				)}
				{/* Top-right HUD */}
				<div className="absolute top-4 right-4 flex flex-col items-end gap-2">
					<button
						className="bg-blue-500 text-white px-4 py-2 rounded-md font-semibold border border-blue-700 hover:bg-blue-600 transition"
						onClick={() => router.push("/")}
					>
						Back to Solo Mode
					</button>
					<button
						className="bg-yellow-400 dark:bg-yellow-600 text-black dark:text-white px-3 py-1 rounded-md font-semibold border border-yellow-600 hover:bg-yellow-500 mt-2 transition"
						onClick={handleEditAccount}
					>
						Edit Account
					</button>
					<div className="bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700 p-3 rounded-lg shadow-md text-right min-w-[140px]">
						<p>⚔️ Duel Points: <span className="font-bold">{hasMounted ? duelPoints : "-"}</span></p>
					</div>
				</div>
				<h1 className="text-3xl font-bold mb-6 text-center">⚔️ Duel Mode <span className="text-base font-normal text-gray-500 dark:text-gray-400">({playerName && `Player: ${playerName}`})</span></h1>
				<div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg max-w-2xl w-full">
					<p className="mb-2 text-lg text-gray-700 dark:text-gray-300">Type this sentence faster than <span className="font-bold text-blue-600 dark:text-blue-400">{opponentName}</span>:</p>
					<div className="mb-4 bg-blue-100 dark:bg-blue-900 p-3 rounded-md text-wrap break-words">
						{/* Show the sentence only after duel starts, otherwise show placeholder */}
						{renderHighlightedTarget()}
					</div>
					<input
						ref={inputRef}
						type="text"
						value={input}
						onChange={handleInputChange}
						onKeyDown={e => {
							if (
								equippedCharacter === 'tony-stark-wichich' &&
								e.key === 'Enter' &&
								!userFinished &&
								!aiFinished
							) {
								setTonyLaserAnim('left');
								setShowTonyLaserLeft(true);
								setTimeout(() => {
									setShowTonyLaserLeft(false);
									setTonyLaserAnim('right');
									setShowTonyLaserRight(true);
									setTimeout(() => {
										setShowTonyLaserRight(false);
										setTonyLaserAnim('done');
										setShowTonyBurnMsg(true);
										setUserFinished(true);
										setAiFinished(true);
										setResult('🏆 Tony Stark: You win! +100 Duel Points');
										setDuelPoints((p: number) => p + 100);
										setTimeout(() => {
											setShowTonyBurnMsg(false);
											setTonyLaserAnim('none');
										}, 2000);
									}, 900); // right laser duration
								}, 900); // left laser duration
								e.preventDefault();
								return;
							}
							// Mad Scientist ability: potion + explosion + restart
							if (
								equippedCharacter === 'mad-scientist' &&
								e.key === 'Enter' &&
								!userFinished &&
								!aiFinished &&
								madAvailable
							) {
								setShowPotion(true);
								setMadAvailable(false);
								setMadCooldown(30);
								localStorage.setItem('madCooldown', '30');
								setTimeout(() => {
									setShowPotion(false);
									setShowExplosion(true);
									setTimeout(() => {
										setShowExplosion(false);
										// Restart play: reset input, AI, finished states
										setInput("");
										setAiIndex(0);
										setUserFinished(false);
										setAiFinished(false);
										setResult("");
										// Optionally, pick a new sentence
										const random = duelSentences[Math.floor(Math.random() * duelSentences.length)];
										setTarget(random);
									}, 900); // explosion duration
								}, 700); // potion duration
								e.preventDefault();
								return;
							}
// After each match, reset Mad Scientist ability for next match
useEffect(() => {
	if ((userFinished || aiFinished) && !madAvailable) {
		setMadAvailable(true);
	}
}, [userFinished, aiFinished]);
							// Hacker Typer ability: matrix effect and points
							if (
								equippedCharacter === 'hacker' &&
								e.key === 'Enter' &&
								!userFinished &&
								!aiFinished &&
								!showHackerEffect
							) {
								// Play hacking sound
								if (hackingAudioRef.current) {
									hackingAudioRef.current.currentTime = 0;
									hackingAudioRef.current.play().catch(() => {});
								}
								// Generate matrix effect
								const cols = hackerColsRef.current;
								const rows = 12;
								const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&';
								const matrix: string[] = [];
								for (let i = 0; i < rows; i++) {
									let row = '';
									for (let j = 0; j < cols; j++) {
										row += chars[Math.floor(Math.random() * chars.length)];
									}
									matrix.push(row);
								}
								setHackerMatrix(matrix);
								setHackerCharsShown(0);
								setShowHackerEffect(true);
								// Animate matrix reveal
								let totalChars = cols * rows;
								let shown = 0;
								const reveal = () => {
									shown += Math.floor(cols / 2);
									if (shown > totalChars) shown = totalChars;
									setHackerCharsShown(shown);
									if (shown < totalChars) {
										setTimeout(reveal, 40);
									} else {
										setTimeout(() => {
											setShowHackerEffect(false);
											setShowHackedMsg(true);
											setHackedMsgChars(0);
											// Animate hacked message
											let msgLen = 'Hacked device +50 points'.length;
											let msgShown = 0;
											const msgReveal = () => {
												msgShown++;
												setHackedMsgChars(msgShown);
												if (msgShown < msgLen) {
													setTimeout(msgReveal, 40);
												} else {
													setTimeout(() => {
														setShowHackedMsg(false);
														setUserFinished(true);
														setAiFinished(true);
														setResult('🏆 Hacker Typer: You win! +50 Duel Points');
														setDuelPoints((p: number) => p + 50);
														addXP(40);
													}, 1200);
												}
											};
											msgReveal();
										}, 600);
									}
								};
								reveal();
								e.preventDefault();
								return;
							}
							// ??? character ability: blackout and skip to last word
							if (
								equippedCharacter === 'undercover' &&
								e.key === 'Enter' &&
								!userFinished &&
								!aiFinished
							) {
								setShowBlackout(true);
								// Find the start index of the last word
								const trimmed = target.trimEnd();
								const lastSpace = trimmed.lastIndexOf(' ');
								let newInput = '';
								if (lastSpace !== -1) {
									newInput = trimmed.slice(0, lastSpace + 1); // up to and including the last space
								}
								// Set input to last word and focus
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
							// Enter key: finalize input (for all characters)
							if (e.key === 'Enter' && !userFinished && !aiFinished) {
								e.preventDefault();
								return;
							}
							// Default Enter behavior: allow form submission or other handlers
						}}
						className="w-full p-4 text-2xl border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:text-white"
						placeholder="Start typing..."
						autoCapitalize="none"
						autoComplete="off"
						autoCorrect="off"
						disabled={userFinished || aiFinished}
					/>
					{showBlackout && (
						<div className="fixed inset-0 z-[101] bg-black transition-opacity duration-300 opacity-100 pointer-events-none" />
					)}
					{showHackerEffect && (
						<div className="fixed inset-0 z-[102] bg-black flex items-center justify-center">
							<div className="w-full h-full flex flex-col items-center justify-center animate-fadeIn">
								<div className="font-mono text-green-400 text-2xl md:text-4xl animate-typing overflow-hidden">
									{(() => {
										// Flatten matrix to a single string
										const flat = hackerMatrix.join('');
										const shown = flat.slice(0, hackerCharsShown);
										const cols = hackerColsRef.current;
										let out = [];
										for (let i = 0; i < hackerMatrix.length; i++) {
											const start = i * cols;
											const end = start + cols;
											out.push(<div key={i}>{shown.slice(start, end)}</div>);
										}
										return out;
									})()}
								</div>
							</div>
						</div>
					)}
					{showHackedMsg && (
						<div className="fixed bottom-8 right-8 z-[103]">
							<div className="font-mono text-green-400 text-xl md:text-2xl bg-black bg-opacity-80 px-6 py-3 rounded-lg shadow-lg animate-fadeIn animate-fadeOut" style={{transition: 'opacity 1s'}}>
								{'Hacked device +50 points'.slice(0, hackedMsgChars)}
							</div>
						</div>
					)}
					{/* Tony Stark animated lasers and burn notification */}
					{tonyLaserAnim === 'left' && (
						(() => {
							if (tonyLaserAudioRef.current) {
								tonyLaserAudioRef.current.currentTime = 0;
								tonyLaserAudioRef.current.play().catch(() => {});
							}
							return null;
						})()
					)}
					{tonyLaserAnim === 'left' && (
						<>
							{/* Top laser */}
							<div className="fixed left-0 top-[30%] z-[110] h-16 flex items-center" style={{width: '100vw', pointerEvents: 'none'}}>
								<div style={{
									position: 'absolute',
									left: 0,
									top: 0,
									height: '100%',
									width: '0%',
									borderRadius: '100px',
									background: 'radial-gradient(circle at 10% 50%, #e0f2fe 40%, #93c5fd 80%, transparent 100%)',
									boxShadow: '0 0 80px 40px #93c5fd',
									animation: 'laser-move-left 5s linear forwards',
								}} />
								{/* Blue fire particles */}
								{[...Array(18)].map((_, i) => {
									const left = `${(i * 5 + Math.random() * 3)}vw`;
									const top = `${45 + Math.random() * 10}%`;
									const size = `${8 + Math.random() * 8}px`;
									const delay = `${Math.random() * 2.5}s`;
									return (
										<div key={i} style={{
											position: 'absolute',
											left,
											top: '40%',
											width: size,
											height: size,
											borderRadius: '50%',
											background: 'radial-gradient(circle, #93c5fd 70%, #60a5fa 100%)',
											opacity: 0.7,
											filter: 'blur(1px)',
											animation: `tony-particle 2.5s ${delay} linear forwards`,
										}} />
									);
								})}
							</div>
							{/* Bottom laser */}
							<div className="fixed left-0 bottom-[30%] z-[110] h-16 flex items-center" style={{width: '100vw', pointerEvents: 'none'}}>
								<div style={{
									position: 'absolute',
									left: 0,
									top: 0,
									height: '100%',
									width: '0%',
									borderRadius: '100px',
									background: 'radial-gradient(circle at 10% 50%, #e0f2fe 40%, #93c5fd 80%, transparent 100%)',
									boxShadow: '0 0 80px 40px #93c5fd',
									animation: 'laser-move-left 5s linear forwards',
								}} />
								{/* Blue fire particles */}
								{[...Array(18)].map((_, i) => {
									const left = `${(i * 5 + Math.random() * 3)}vw`;
									const top = `${45 + Math.random() * 10}%`;
									const size = `${8 + Math.random() * 8}px`;
									const delay = `${Math.random() * 2.5}s`;
									return (
										<div key={i} style={{
											position: 'absolute',
											left,
											top: '60%',
											width: size,
											height: size,
											borderRadius: '50%',
											background: 'radial-gradient(circle, #93c5fd 70%, #60a5fa 100%)',
											opacity: 0.7,
											filter: 'blur(1px)',
											animation: `tony-particle 2.5s ${delay} linear forwards`,
										}} />
									);
								})}
							</div>
						</>
					)}
					{tonyLaserAnim === 'right' && (
						<>
							{/* Top laser */}
							<div className="fixed right-0 top-[30%] z-[110] h-16 flex items-center" style={{width: '100vw', pointerEvents: 'none'}}>
								<div style={{
									position: 'absolute',
									right: 0,
									top: 0,
									height: '100%',
									width: '0%',
									borderRadius: '100px',
									background: 'radial-gradient(circle at 90% 50%, #e0f2fe 40%, #93c5fd 80%, transparent 100%)',
									boxShadow: '0 0 80px 40px #93c5fd',
									animation: 'laser-move-right 5s linear forwards',
								}} />
								{/* Blue fire particles */}
								{[...Array(18)].map((_, i) => {
									const right = `${(i * 5 + Math.random() * 3)}vw`;
									const top = `${45 + Math.random() * 10}%`;
									const size = `${8 + Math.random() * 8}px`;
									const delay = `${Math.random() * 2.5}s`;
									return (
										<div key={i} style={{
											position: 'absolute',
											right,
											top: '40%',
											width: size,
											height: size,
											borderRadius: '50%',
											background: 'radial-gradient(circle, #93c5fd 70%, #60a5fa 100%)',
											opacity: 0.7,
											filter: 'blur(1px)',
											animation: `tony-particle 2.5s ${delay} linear forwards`,
										}} />
									);
								})}
							</div>
							{/* Bottom laser */}
							<div className="fixed right-0 bottom-[30%] z-[110] h-16 flex items-center" style={{width: '100vw', pointerEvents: 'none'}}>
								<div style={{
									position: 'absolute',
									right: 0,
									top: 0,
									height: '100%',
									width: '0%',
									borderRadius: '100px',
									background: 'radial-gradient(circle at 90% 50%, #e0f2fe 40%, #93c5fd 80%, transparent 100%)',
									boxShadow: '0 0 80px 40px #93c5fd',
									animation: 'laser-move-right 5s linear forwards',
								}} />
								{/* Blue fire particles */}
								{[...Array(18)].map((_, i) => {
									const right = `${(i * 5 + Math.random() * 3)}vw`;
									const top = `${45 + Math.random() * 10}%`;
									const size = `${8 + Math.random() * 8}px`;
									const delay = `${Math.random() * 2.5}s`;
									return (
										<div key={i} style={{
											position: 'absolute',
											right,
											top: '60%',
											width: size,
											height: size,
											borderRadius: '50%',
											background: 'radial-gradient(circle, #93c5fd 70%, #60a5fa 100%)',
											opacity: 0.7,
											filter: 'blur(1px)',
											animation: `tony-particle 2.5s ${delay} linear forwards`,
										}} />
									);
								})}
							</div>
						</>
					)}
					{tonyLaserAnim === 'done' && showTonyBurnMsg && (
						<div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[111]">
							<div className="font-mono text-blue-500 text-xl md:text-2xl bg-black bg-opacity-80 px-6 py-3 rounded-lg shadow-lg animate-fadeIn animate-fadeOut" style={{transition: 'opacity 1s'}}>
								{`You burn ${opponentName}`}
							</div>
						</div>
					)}
				</div>
			</main>
		)
	);
}
