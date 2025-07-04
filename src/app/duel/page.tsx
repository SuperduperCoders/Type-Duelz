"use client";

import { useEffect, useState, useRef } from "react";
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
	// Use error audio hook
	const { errorAudioRef, playError } = useErrorAudio();

	const inputRef = useRef<HTMLInputElement | null>(null);
	const [showBlackout, setShowBlackout] = useState(false);

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
			avgWpm = Math.round(wpmHistory.reduce((a, b) => a + b, 0) / wpmHistory.length);
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
				setAiIndex((idx) => idx + 1);
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
				}).catch((e) => {
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
			typingAudioRef.current.play().catch((e) => {
				console.log('Typing audio play failed (duel):', e);
			});
		}
		if (newVal.length === target.length) {
			setUserFinished(true);
			const endTime = Date.now();
			const durationInMinutes = (endTime - (startTime ?? endTime)) / 60000;
			const wordCount = target.trim().split(/\s+/).length;
			const calculatedWpm = Math.round(wordCount / durationInMinutes);
			setWpmHistory((prev) => [...prev, calculatedWpm]);
			if (!aiFinished) {
				setDuelPoints((p) => p + 5);
				setResult("\ud83c\udfc6 You win! +5 Duel Points");
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
				{target.split("").map((char, idx) => {
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
		setDuelPoints((p) => p + 5);
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
				<audio ref={errorAudioRef} src="/error.mp3" preload="auto" />
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
						{showSabotageMsg && (
							<div className="mt-2 text-white bg-black/80 px-3 py-1 rounded">{showSabotageMsg}</div>
						)}
					</div>
				)}
				{/* Account Modal */}
				{showAccountModal && (
					<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
						<form onSubmit={handleAccountSubmit} className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg flex flex-col gap-4 min-w-[320px]">
							<h2 className="text-2xl font-bold mb-2 text-center">{localStorage.getItem("playerName") ? "Edit Account" : "Create Account"}</h2>
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
							{nameError && <div className="text-red-600 text-sm font-semibold">{nameError}</div>}
							<button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md font-semibold mt-2 hover:bg-blue-600 transition">Save</button>
						</form>
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
						className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white px-4 py-2 rounded-md font-semibold border border-gray-400 dark:border-gray-600 hover:bg-blue-500 hover:text-white transition"
						onClick={() => router.push("/")}
					>
						Solo Mode
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
							// ??? character ability: blackout and skip to last word
							if (
								equippedCharacter === '????' &&
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
								if (input.trim() === "") {
									e.preventDefault();
									return;
								}
								setUserFinished(true);
								const endTime = Date.now();
								const durationInMinutes = (endTime - (startTime ?? endTime)) / 60000;
								const wordCount = target.trim().split(/\s+/).length;
								const calculatedWpm = Math.round(wordCount / durationInMinutes);
								setWpmHistory((prev) => [...prev, calculatedWpm]);
								if (!aiFinished) {
									setDuelPoints((p) => p + 5);
									setResult("\ud83c\udfc6 You win! +5 Duel Points");
								} else {
									setResult(`\u274c ${opponentName} wins! Try again.`);
								}
								e.preventDefault();
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
				</div>
			</main>
		)
	);
}
